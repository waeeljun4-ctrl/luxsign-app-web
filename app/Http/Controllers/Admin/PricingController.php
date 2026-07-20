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
            'products' => Product::with('category:id,name')
                ->orderBy('sort_order')
                ->get(['id', 'category_id', 'name', 'image', 'pricing_type', 'price', 'compare_price', 'badge']),
            'categories' => Category::orderBy('sort_order')->get(['id', 'name']),
        ]);
    }

    public function update(Request $request, Product $product)
    {
        $data = $request->validate([
            'price' => 'nullable|numeric|min:0',
            'compare_price' => 'nullable|numeric|min:0',
            'badge' => 'nullable|string|max:30',
        ]);

        $product->update($data);
        return response()->json(['ok' => true]);
    }
}
