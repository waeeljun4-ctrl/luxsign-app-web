<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Product;
use App\Models\SpecTemplate;
use App\Services\ImageCompressionService;
use App\Services\TranslationService;
use App\Services\VideoCompressionService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $query = Product::with('category:id,name')->orderBy('sort_order');

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%$search%")
                  ->orWhere('description', 'like', "%$search%");
            });
        }

        return Inertia::render('Admin/Products', [
            'products'   => $query->get(),
            'categories' => Category::active()->get(['id', 'name', 'icon']),
            'search'     => $request->input('search', ''),
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/ProductEdit', [
            'product'    => null,
            'categories' => Category::active()->get(['id', 'name', 'icon']),
        ]);
    }

    public function edit(Product $product)
    {
        return Inertia::render('Admin/ProductEdit', [
            'product'    => $product,
            'categories' => Category::active()->get(['id', 'name', 'icon']),
            'specFields' => $product->specFields,
            'specTemplates' => SpecTemplate::orderBy('name')->get(['id', 'name']),
        ]);
    }

    // A plain "60" is a legacy/simple preset size and stays an int; a
    // "300×250" dimension pair (fixed_per_size, rectangle shape) must
    // survive as-is — intval() would truncate it to just "300".
    private function parsePresetSizes(mixed $value): ?array
    {
        $normalize = function ($v) {
            $v = trim((string) $v);
            return preg_match('/[×x]/i', $v) ? $v : intval($v);
        };
        $keep = fn ($v) => $v !== '' && $v !== 0;
        if (is_array($value)) return array_values(array_filter(array_map($normalize, $value), $keep));
        if (is_string($value) && $value !== '') return array_values(array_filter(array_map($normalize, explode(',', $value)), $keep));
        return null;
    }

    private function parseNumArray(mixed $value): ?array
    {
        if (is_array($value)) return array_values(array_map('floatval', $value));
        if (is_string($value) && $value !== '') return array_values(array_map('floatval', explode(',', $value)));
        return null;
    }

    private function parseStrArray(mixed $value): ?array
    {
        if (is_array($value)) return array_values(array_map('trim', $value));
        if (is_string($value) && $value !== '') return array_values(array_map('trim', explode(',', $value)));
        return null;
    }

    private function validateFields(): array
    {
        return [
            'category_id'    => 'required|exists:categories,id',
            'name'           => 'required|string|max:100',
            'name_he'        => 'nullable|string|max:200',
            'name_en'        => 'nullable|string|max:200',
            'description'    => 'nullable|string|max:500',
            'description_he' => 'nullable|string|max:500',
            'description_en' => 'nullable|string|max:500',
            'icon'           => 'nullable|string|max:10',
            'image'          => 'nullable|image|max:10240',
            'new_images'     => 'nullable|array|max:10',
            'new_images.*'   => 'image|max:10240',
            'video'          => 'nullable|mimetypes:video/mp4,video/quicktime,video/x-msvideo,video/webm|max:2097152',
            'video_url'      => 'nullable|max:500',
            'badge'          => 'nullable|string|max:30',
            'badge_he'       => 'nullable|string|max:30',
            'badge_en'       => 'nullable|string|max:30',
            'pricing_type'   => 'required|in:fixed,sqm,plate_pair,plate_single,pair_width,single_width,plate_qty,fixed_per_size,fixed_qty',
            'is_custom'      => 'boolean',
            'show_ref_images' => 'boolean',
            'price'          => 'required|numeric|min:0',
            'min_price'      => 'nullable|numeric|min:0',
            'show_min_price' => 'boolean',
            'preset_sizes'   => 'nullable',
            'size_prices'    => 'nullable',
            'compare_prices' => 'nullable',
            'qty_labels'     => 'nullable',
            'qty_labels_he'  => 'nullable',
            'qty_labels_en'  => 'nullable',
            'shape'          => 'nullable|in:rectangle,circle',
            'max_size'       => 'nullable|integer|min:0',
            'fixed_size_label' => 'nullable|string|max:255',
            'designer_type'  => 'required|in:none,sign,plate',
            'is_active'      => 'boolean',
            'sort_order'     => 'integer',
        ];
    }

    private function parseArrayFields(array $data): array
    {
        $data['preset_sizes']   = $this->parsePresetSizes($data['preset_sizes'] ?? null);
        $data['size_prices']    = $this->parseNumArray($data['size_prices'] ?? null);
        $data['compare_prices'] = $this->parseNumArray($data['compare_prices'] ?? null);
        $data['qty_labels']     = $this->parseStrArray($data['qty_labels'] ?? null);
        $data['qty_labels_he']  = $this->parseStrArray($data['qty_labels_he'] ?? null);
        $data['qty_labels_en']  = $this->parseStrArray($data['qty_labels_en'] ?? null);
        return $data;
    }

    public function store(Request $request, ImageCompressionService $imageCompressor, VideoCompressionService $videoCompressor, TranslationService $translator)
    {
        // track_stock/stock_quantity are managed exclusively from the
        // Inventory page now — a new product just keeps the "unlimited
        // stock" default (track_stock=false) until set there.
        $data = $this->parseArrayFields($request->validate($this->validateFields()));

        $data['name_he'] = $translator->translate($data['name'], 'he');
        $data['name_en'] = $translator->translate($data['name'], 'en');
        $data['description_he'] = $translator->translate($data['description'] ?? null, 'he');
        $data['description_en'] = $translator->translate($data['description'] ?? null, 'en');
        $data['badge_he'] = $translator->translate($data['badge'] ?? null, 'he');
        $data['badge_en'] = $translator->translate($data['badge'] ?? null, 'en');
        $data['qty_labels_he'] = $translator->translateArray($data['qty_labels'] ?? null, 'he');
        $data['qty_labels_en'] = $translator->translateArray($data['qty_labels'] ?? null, 'en');

        if ($request->hasFile('image')) {
            $data['image'] = $imageCompressor->compressAndStore($request->file('image'), 'products');
        }
        if ($request->hasFile('video')) {
            $data['video'] = $videoCompressor->compressAndStore($request->file('video'), 'products/videos');
        }
        if ($request->hasFile('new_images')) {
            $data['images'] = array_map(
                fn ($file) => $imageCompressor->compressAndStore($file, 'products'),
                $request->file('new_images')
            );
        }
        unset($data['new_images']);

        Product::create($data);
        return back()->with('success', 'تم إضافة المنتج ✅');
    }

    public function update(Request $request, Product $product, ImageCompressionService $imageCompressor, VideoCompressionService $videoCompressor, TranslationService $translator)
    {
        // track_stock/stock_quantity are managed exclusively from the
        // Inventory page now — leave whatever is already set untouched.
        $data = $this->parseArrayFields($request->validate($this->validateFields()));

        $data['name_he'] = $translator->translate($data['name'], 'he');
        $data['name_en'] = $translator->translate($data['name'], 'en');
        $data['description_he'] = $translator->translate($data['description'] ?? null, 'he');
        $data['description_en'] = $translator->translate($data['description'] ?? null, 'en');
        $data['badge_he'] = $translator->translate($data['badge'] ?? null, 'he');
        $data['badge_en'] = $translator->translate($data['badge'] ?? null, 'en');
        $data['qty_labels_he'] = $translator->translateArray($data['qty_labels'] ?? null, 'he');
        $data['qty_labels_en'] = $translator->translateArray($data['qty_labels'] ?? null, 'en');

        if ($request->hasFile('image')) {
            if ($product->image) Storage::disk('public')->delete($product->image);
            $data['image'] = $imageCompressor->compressAndStore($request->file('image'), 'products');
        }
        if ($request->hasFile('video')) {
            if ($product->video) Storage::disk('public')->delete($product->video);
            $data['video'] = $videoCompressor->compressAndStore($request->file('video'), 'products/videos');
        }
        if ($request->hasFile('new_images')) {
            $newPaths = array_map(
                fn ($file) => $imageCompressor->compressAndStore($file, 'products'),
                $request->file('new_images')
            );
            $data['images'] = [...($product->images ?? []), ...$newPaths];
        }
        unset($data['new_images']);

        $product->update($data);
        return back()->with('success', 'تم تحديث المنتج ✅');
    }

    public function destroyGalleryImage(Product $product, int $index)
    {
        $images = $product->images ?? [];
        if (isset($images[$index])) {
            Storage::disk('public')->delete($images[$index]);
            unset($images[$index]);
            $product->update(['images' => array_values($images)]);
        }
        return back()->with('success', 'تم حذف الصورة');
    }

    public function destroyImage(Product $product)
    {
        if ($product->image) {
            Storage::disk('public')->delete($product->image);
            $product->update(['image' => null]);
        }
        return back()->with('success', 'تم حذف الصورة');
    }

    public function destroyVideo(Product $product)
    {
        if ($product->video) {
            Storage::disk('public')->delete($product->video);
            $product->update(['video' => null]);
        }
        return back()->with('success', 'تم حذف الفيديو');
    }

    public function reorder(Request $request)
    {
        $order = $request->validate(['order' => 'required|array'])['order'];
        foreach ($order as $index => $id) {
            Product::where('id', $id)->update(['sort_order' => $index]);
        }
        return response()->json(['ok' => true]);
    }

    public function destroy(Product $product)
    {
        if ($product->image) Storage::disk('public')->delete($product->image);
        if ($product->video) Storage::disk('public')->delete($product->video);
        foreach ($product->images ?? [] as $path) Storage::disk('public')->delete($path);
        $product->delete();
        return back()->with('success', 'تم حذف المنتج');
    }
}
