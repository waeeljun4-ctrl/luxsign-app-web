<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PricingController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/Pricing', [
            // Custom-order products have no price to manage here at all.
            'products' => Product::with('category:id,name')
                ->where('is_custom', false)
                ->orderBy('sort_order')
                ->get(['id', 'category_id', 'name', 'image', 'pricing_type', 'price', 'compare_price', 'badge', 'min_price', 'show_min_price', 'preset_sizes', 'size_prices', 'compare_prices']),
            'categories' => Category::orderBy('sort_order')->get(['id', 'name']),
        ]);
    }

    public function update(Request $request, Product $product)
    {
        $data = $request->validate([
            'price' => 'nullable|numeric|min:0',
            'compare_price' => 'nullable|numeric|min:0',
            'badge' => 'nullable|string|max:30',
            'min_price' => 'nullable|numeric|min:0',
            'show_min_price' => 'boolean',
            // Bulk raise/lower % from the pricing table also needs to reach
            // per-size ("fixed_per_size") and per-quantity ("plate_qty")
            // products, whose real prices live in these arrays instead of
            // the single `price` column.
            'size_prices' => 'nullable|array',
            'size_prices.*' => 'numeric|min:0',
            'compare_prices' => 'nullable|array',
            'compare_prices.*' => 'nullable|numeric|min:0',
            'preset_sizes' => 'nullable|array',
            'preset_sizes.*' => 'numeric|min:0',
        ]);

        // `preset_sizes` doubles as the price list for plate_qty but as
        // dimension strings/numbers for fixed_per_size — never let one
        // type's bulk-price payload overwrite the other's column meaning.
        if (array_key_exists('preset_sizes', $data) && $product->pricing_type !== 'plate_qty') {
            unset($data['preset_sizes']);
        }
        if ($product->pricing_type !== 'fixed_per_size') {
            unset($data['size_prices'], $data['compare_prices']);
        }

        $product->update($data);
        return response()->json(['ok' => true]);
    }
}
