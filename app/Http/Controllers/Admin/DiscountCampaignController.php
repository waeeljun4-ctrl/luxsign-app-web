<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\DiscountCampaign;
use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DiscountCampaignController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/Discounts', [
            'campaigns'  => DiscountCampaign::with(['categories:id,name', 'products:id,name'])->latest()->get(),
            'categories' => Category::active()->get(['id', 'name', 'icon']),
            'products'   => Product::active()->get(['id', 'name', 'category_id']),
        ]);
    }

    private function validateFields(): array
    {
        return [
            'name' => 'required|string|max:100',
            'type' => 'required|in:percentage,fixed',
            'value' => 'required|numeric|min:0.01',
            'starts_at' => 'nullable|date',
            'ends_at' => 'nullable|date',
            'is_active' => 'boolean',
            'category_ids' => 'nullable|array',
            'category_ids.*' => 'integer|exists:categories,id',
            'product_ids' => 'nullable|array',
            'product_ids.*' => 'integer|exists:products,id',
        ];
    }

    public function store(Request $request)
    {
        $data = $request->validate($this->validateFields());
        $categoryIds = $data['category_ids'] ?? [];
        $productIds = $data['product_ids'] ?? [];
        unset($data['category_ids'], $data['product_ids']);

        $campaign = DiscountCampaign::create($data);
        $campaign->categories()->sync($categoryIds);
        $campaign->products()->sync($productIds);

        return back()->with('success', 'تم إنشاء حملة الخصم ✅');
    }

    public function update(Request $request, DiscountCampaign $discount)
    {
        $data = $request->validate($this->validateFields());
        $categoryIds = $data['category_ids'] ?? [];
        $productIds = $data['product_ids'] ?? [];
        unset($data['category_ids'], $data['product_ids']);

        $discount->update($data);
        $discount->categories()->sync($categoryIds);
        $discount->products()->sync($productIds);

        return back()->with('success', 'تم تحديث حملة الخصم ✅');
    }

    public function destroy(DiscountCampaign $discount)
    {
        $discount->delete();
        return back()->with('success', 'تم حذف حملة الخصم');
    }
}
