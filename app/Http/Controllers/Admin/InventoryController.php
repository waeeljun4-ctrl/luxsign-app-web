<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;

class InventoryController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/Inventory', [
            'products' => Product::with('category:id,name')
                ->orderBy('sort_order')
                ->get(['id', 'category_id', 'name', 'image', 'track_stock', 'stock_quantity', 'wholesale_price', 'price']),
        ]);
    }

    public function update(Request $request, Product $product)
    {
        $data = $request->validate([
            'track_stock' => 'required|boolean',
            'stock_quantity' => 'required|integer|min:0',
            'wholesale_price' => 'nullable|numeric|min:0',
        ]);

        $product->update($data);

        return response()->json(['ok' => true]);
    }
}
