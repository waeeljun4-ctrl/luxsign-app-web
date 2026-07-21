<?php

namespace App\Http\Controllers;

use App\Models\Coupon;
use App\Models\CourierCompany;
use App\Models\Order;
use App\Models\Product;
use App\Services\ImageCompressionService;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Process;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class OrderController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/Orders', [
            'orders' => Order::latest()->get(),
            'courierCompanies' => CourierCompany::where('is_active', true)->get(['id', 'name']),
        ]);
    }

    /**
     * A customer's own order history — scoped strictly to their own
     * user_id, unlike index() above which is the admin-only full list.
     */
    public function mine(Request $request)
    {
        return Inertia::render('Account/Orders', [
            'orders' => Order::where('user_id', $request->user()->id)->latest()->get(),
        ]);
    }

    public function exportCourier(Request $request)
    {
        $data = $request->validate([
            'ids' => 'required|array|min:1',
            'ids.*' => 'integer|exists:orders,id',
        ]);

        $orders = Order::whereIn('id', $data['ids'])->get();

        $rows = [['اسم المستلم', 'رقم الموبايل', 'العنوان', 'التحصيل شامل التوصيل', 'رقم الإرسالية', 'ملاحظات']];
        foreach ($orders as $order) {
            $rows[] = [
                $order->customer_name,
                $order->customer_phone,
                $order->address,
                $order->total,
                'ORD-' . $order->id,
                $order->notes,
            ];
        }

        Order::whereIn('id', $data['ids'])->update([
            'sent_to_courier' => true,
            'sent_to_courier_at' => now(),
        ]);

        $csv = "\xEF\xBB\xBF"; // UTF-8 BOM so Excel renders Arabic correctly
        foreach ($rows as $row) {
            $csv .= implode(',', array_map(fn ($v) => '"' . str_replace('"', '""', $v ?? '') . '"', $row)) . "\r\n";
        }

        return response($csv, 200, [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => 'attachment; filename="orders-export-' . now()->format('Y-m-d_His') . '.csv"',
        ]);
    }

    public function store(Request $request, ImageCompressionService $imageCompressor)
    {
        // Images force a multipart request, so the cart's `items` (an array
        // of objects) arrives JSON-encoded as a plain string alongside the
        // files — decode it back into a real array before validating it.
        if (is_string($request->input('items'))) {
            $request->merge(['items' => json_decode($request->input('items'), true) ?? []]);
        }

        $data = $request->validate([
            'customer_name'     => 'required|string|max:100',
            'customer_phone'    => 'required|string|max:20',
            'address'           => 'nullable|string|max:255',
            'items'             => 'required|array|min:1',
            'items.*.name'      => 'required|string',
            'items.*.price'     => 'required|numeric',
            'items.*.qty'       => 'required|integer|min:1',
            'items.*.product_id'=> 'nullable|integer|exists:products,id',
            'items.*.is_custom' => 'nullable|boolean',
            'items.*.specs'     => 'nullable|array',
            'items.*.specs.*.label' => 'required_with:items.*.specs|string|max:100',
            'items.*.specs.*.value' => 'nullable|string|max:255',
            'total'             => 'required|numeric',
            'notes'             => 'nullable|string|max:500',
            'coupon_code'       => 'nullable|string|max:40',
            'item_images'       => 'nullable|array',
            'item_images.*'     => 'image|max:8192',
        ]);

        // Each cart item can carry its own reference photo, attached on the
        // product page (before it ever reaches the cart) — correlated back
        // to its item by array index, compressed/stored up front.
        foreach ($request->file('item_images', []) as $index => $image) {
            if ($image instanceof UploadedFile && isset($data['items'][$index])) {
                $data['items'][$index]['image'] = $imageCompressor->compressAndStore($image, 'orders');
            }
        }

        try {
            $order = DB::transaction(function () use ($data, $request) {
                // Stock check + decrement (only for items tied to a tracked product),
                // and enforce each product's minimum-price floor server-side so
                // it can never be bypassed by tampering with the submitted price.
                $priceFloorAdjustment = 0;

                foreach ($data['items'] as &$item) {
                    if (empty($item['product_id']) || ! empty($item['is_custom'])) {
                        continue;
                    }
                    $product = Product::lockForUpdate()->find($item['product_id']);
                    if (! $product) {
                        continue;
                    }
                    if ($product->track_stock) {
                        if ($product->stock_quantity < $item['qty']) {
                            throw ValidationException::withMessages(['items' => "الكمية غير متوفرة لمنتج \"{$product->name}\""]);
                        }
                        $product->decrement('stock_quantity', $item['qty']);
                    }

                    $flooredPrice = $product->applyMinPrice($item['price']);
                    if ($flooredPrice > $item['price']) {
                        $priceFloorAdjustment += ($flooredPrice - $item['price']) * $item['qty'];
                        $item['price'] = $flooredPrice;
                    }
                }
                unset($item);

                $data['total'] += $priceFloorAdjustment;

                // User-level discount
                $discount = optional($request->user())->discount_percentage ?? 0;
                $total = $discount > 0 ? round($data['total'] * (1 - $discount / 100), 2) : $data['total'];

                // Coupon (re-validated server-side, never trust client math)
                $couponCode = null;
                $couponDiscount = 0;
                if (! empty($data['coupon_code'])) {
                    $coupon = Coupon::lockForUpdate()->whereRaw('UPPER(code) = ?', [strtoupper($data['coupon_code'])])->first();
                    if ($coupon && $coupon->isValid()) {
                        $couponDiscount = $coupon->discountFor($total);
                        $total = round($total - $couponDiscount, 2);
                        $couponCode = $coupon->code;
                        $coupon->increment('used_count');
                    }
                }

                $data['total'] = $total;

                return Order::create(array_merge($data, [
                    'status' => 'pending',
                    'user_id' => $request->user()?->id,
                    'discount_percentage' => $discount,
                    'coupon_code' => $couponCode,
                    'coupon_discount' => $couponDiscount,
                ]));
            });
        } catch (ValidationException $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 422);
        }

        return response()->json([
            'success' => true,
            'order'   => $order,
            'message' => 'تم استلام طلبك! سنتواصل معك قريباً ✅',
        ]);
    }

    public function update(Request $request, Order $order)
    {
        $data = $request->validate([
            'status' => 'required|in:pending,confirmed,in_progress,ready,delivered,cancelled',
        ]);

        $order->update($data);
        return back()->with('success', 'تم تحديث حالة الطلب ✅');
    }

    public function destroy(Order $order)
    {
        $order->delete();
        return back()->with('success', 'تم حذف الطلب');
    }

    public function sendToCourier(Request $request)
    {
        $data = $request->validate([
            'ids' => 'required|array|min:1',
            'ids.*' => 'integer|exists:orders,id',
            'courier_company_id' => 'required|integer|exists:courier_companies,id',
        ]);

        $company = CourierCompany::findOrFail($data['courier_company_id']);
        $orders = Order::whereIn('id', $data['ids'])->get();

        $input = [
            'company' => [
                'login_url' => $company->login_url,
                'add_shipment_url' => $company->add_shipment_url,
                'username' => $company->username,
                'password' => $company->password,
                'field_map' => $company->field_map,
            ],
            'orders' => $orders->map(fn ($o) => [
                'ref' => (string) $o->id,
                'customer_name' => $o->customer_name,
                'customer_phone' => $o->customer_phone,
                'address' => $o->address,
                'total' => $o->total,
                'notes' => $o->notes,
            ])->values(),
        ];

        $tmpFile = tempnam(sys_get_temp_dir(), 'courier_') . '.json';
        file_put_contents($tmpFile, json_encode($input, JSON_UNESCAPED_UNICODE));

        $scriptDir = base_path('courier-automation');
        $nodeBinary = env('NODE_BINARY_PATH', 'node');
        $result = Process::path($scriptDir)->timeout(300)->run([$nodeBinary, 'run.js', $tmpFile]);

        @unlink($tmpFile);

        $output = json_decode($result->output(), true);

        if (! $output) {
            return response()->json([
                'success' => false,
                'message' => 'فشل تشغيل أداة الإرسال: ' . $result->errorOutput(),
            ], 500);
        }

        $resultsByRef = collect($output['results'] ?? [])->keyBy('ref');

        foreach ($orders as $order) {
            $result = $resultsByRef->get((string) $order->id);
            $order->update([
                'courier_company_id' => $company->id,
                'sent_to_courier' => (bool) ($result['success'] ?? false),
                'sent_to_courier_at' => ($result['success'] ?? false) ? now() : $order->sent_to_courier_at,
                'courier_send_status' => $result ? ($result['success'] ? 'sent' : 'failed') : 'failed',
                'courier_send_error' => $result['error'] ?? ($output['error'] ?? null),
            ]);
        }

        $company->update(['last_used_at' => now()]);

        $sentCount = $resultsByRef->where('success', true)->count();
        $failedCount = $resultsByRef->where('success', false)->count();

        return response()->json([
            'success' => $output['success'] ?? false,
            'message' => $output['success']
                ? "تم إرسال {$sentCount} طلب بنجاح" . ($failedCount ? "، وفشل {$failedCount}" : '')
                : ('فشل الإرسال: ' . ($output['error'] ?? 'خطأ غير معروف')),
            'results' => $output['results'] ?? [],
        ]);
    }
}
