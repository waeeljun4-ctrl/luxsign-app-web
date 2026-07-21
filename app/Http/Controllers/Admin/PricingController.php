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
                ->get(['id', 'category_id', 'name', 'image', 'pricing_type', 'price', 'compare_price', 'badge', 'min_price', 'show_min_price']),
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
        ]);

        $product->update($data);
        return response()->json(['ok' => true]);
    }
}
