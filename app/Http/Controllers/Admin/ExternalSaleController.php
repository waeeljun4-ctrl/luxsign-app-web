<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ExternalSale;
use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ExternalSaleController extends Controller
{
    private function filteredQuery(Request $request)
    {
        $query = ExternalSale::with('creator:id,name')->orderByDesc('sold_on')->orderByDesc('id');

        if ($from = $request->input('from')) {
            $query->where('sold_on', '>=', $from);
        }
        if ($to = $request->input('to')) {
            $query->where('sold_on', '<=', $to);
        }

        return $query;
    }

    public function index(Request $request)
    {
        $sales = $this->filteredQuery($request)->get();

        return Inertia::render('Admin/ExternalSales', [
            'sales' => $sales,
            'filters' => $request->only('from', 'to'),
            // For the "pick a catalog product" option — id/name/wholesale_price
            // only, so the form can auto-fill the cost when one is chosen.
            'products' => Product::orderBy('name')->get(['id', 'name', 'wholesale_price']),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'product_id' => 'nullable|integer|exists:products,id',
            'product_name' => 'required|string|max:255',
            'qty' => 'required|integer|min:1',
            'sale_price' => 'required|numeric|min:0',
            'cost_price' => 'nullable|numeric|min:0',
            'sold_on' => 'nullable|date',
            'notes' => 'nullable|string|max:255',
        ]);

        ExternalSale::create([
            ...$data,
            'sold_on' => $data['sold_on'] ?? now()->toDateString(),
            'created_by' => $request->user()->id,
        ]);

        return back()->with('success', 'تم تسجيل المبيعة الخارجية.');
    }

    public function destroy(ExternalSale $externalSale)
    {
        $externalSale->delete();

        return back()->with('success', 'تم حذف المبيعة.');
    }
}
