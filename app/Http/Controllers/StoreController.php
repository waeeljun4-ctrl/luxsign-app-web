<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\DiscountCampaign;
use App\Models\HeroSlide;
use App\Models\Product;
use Inertia\Inertia;

class StoreController extends Controller
{
    public function portfolio()
    {
        return Inertia::render('Portfolio');
    }

    public function testimonials()
    {
        return Inertia::render('Testimonials');
    }

    public function index()
    {
        $heroSlides = HeroSlide::active()->get();
        $categories = Category::active()->get(['id', 'parent_id', 'name', 'name_he', 'name_en', 'icon', 'image', 'key']);

        $products = Product::active()
            ->with(['category:id,parent_id,name,name_he,name_en,icon,key', 'specFields'])
            ->get([
                'id', 'category_id',
                'name', 'name_he', 'name_en',
                'description', 'description_he', 'description_en',
                'icon', 'image', 'images', 'video', 'video_url', 'badge', 'badge_he', 'badge_en',
                'pricing_type', 'is_custom', 'price', 'compare_price', 'min_price', 'show_min_price', 'preset_sizes',
                'size_prices', 'compare_prices', 'qty_labels', 'qty_labels_he', 'qty_labels_en', 'max_size', 'fixed_size_label', 'shape',
                'designer_type', 'track_stock', 'stock_quantity',
            ]);

        $products = DiscountCampaign::applyToProducts($products);

        return Inertia::render('Store/Index', [
            'heroSlides' => $heroSlides,
            'categories' => $categories,
            'products'   => $products,
        ]);
    }
}
