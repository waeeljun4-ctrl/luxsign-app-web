<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class ArchiveController extends Controller
{
    private const STATUS_LABELS = [
        'pending'     => 'جديد',
        'confirmed'   => 'مؤكد',
        'in_progress' => 'قيد التنفيذ',
        'ready'       => 'جاهز',
        'delivered'   => 'مسلّم',
        'cancelled'   => 'ملغي',
    ];

    public function index()
    {
        $months = Order::selectRaw("
                DATE_FORMAT(created_at, '%Y-%m') as ym,
                COUNT(*) as orders_count,
                SUM(CASE WHEN status != 'cancelled' THEN total ELSE 0 END) as total_sales,
                SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled_count
            ")
            ->groupBy('ym')
            ->orderByDesc('ym')
            ->get()
            ->map(function ($m) {
                $m->file_saved = Storage::disk('public')->exists("archives/orders-{$m->ym}.csv");
                return $m;
            });

        return Inertia::render('Admin/Archive', ['months' => $months]);
    }

    public function exportMonth(Request $request)
    {
        $data = $request->validate(['ym' => 'required|string|regex:/^\d{4}-\d{2}$/']);
        [$year, $month] = explode('-', $data['ym']);

        $orders = Order::whereYear('created_at', $year)->whereMonth('created_at', $month)
            ->orderBy('created_at')->get();

        $rows = [['رقم الطلب', 'التاريخ', 'اسم الزبون', 'الهاتف', 'العنوان', 'الحالة', 'الإجمالي']];
        foreach ($orders as $o) {
            $rows[] = [
                'ORD-' . $o->id,
                $o->created_at->format('Y-m-d H:i'),
                $o->customer_name,
                $o->customer_phone,
                $o->address,
                self::STATUS_LABELS[$o->status] ?? $o->status,
                $o->total,
            ];
        }
        $totalSales = $orders->where('status', '!=', 'cancelled')->sum('total');
        $rows[] = [];
        $rows[] = ['الإجمالي (بدون الملغي)', '', '', '', '', '', $totalSales];

        $csv = "\xEF\xBB\xBF"; // UTF-8 BOM so Excel renders Arabic correctly
        foreach ($rows as $row) {
            $csv .= implode(',', array_map(fn ($v) => '"' . str_replace('"', '""', $v ?? '') . '"', $row)) . "\r\n";
        }

        // Save a permanent copy on the server so the monthly record survives even if orders are later pruned.
        Storage::disk('public')->put("archives/orders-{$data['ym']}.csv", $csv);

        return response($csv, 200, [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => "attachment; filename=\"orders-{$data['ym']}.csv\"",
        ]);
    }
}
