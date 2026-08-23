<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\DiscountCampaign;
use App\Models\HeroSlide;
use App\Models\PortfolioProject;
use App\Models\Product;
use App\Models\Testimonial;
use Inertia\Inertia;

class StoreController extends Controller
{
    private const PRODUCT_COLUMNS = [
        'id', 'category_id',
        'name', 'name_he', 'name_en',
        'description', 'description_he', 'description_en',
        'icon', 'image', 'images', 'video', 'video_url', 'badge', 'badge_he', 'badge_en',
        'pricing_type', 'is_custom', 'show_ref_images', 'price', 'compare_price', 'min_price', 'show_min_price', 'preset_sizes',
        'size_prices', 'compare_prices', 'qty_labels', 'qty_labels_he', 'qty_labels_en', 'max_size', 'fixed_size_label', 'shape',
        'designer_type', 'track_stock', 'stock_quantity',
    ];

    private const PRODUCT_WITH = ['category:id,parent_id,name,name_he,name_en,icon,key', 'specFields'];

    public function portfolio()
    {
        return Inertia::render('Portfolio', [
            'projects' => PortfolioProject::active()->get(),
        ]);
    }

    public function testimonials()
    {
        return Inertia::render('Testimonials', [
            'reviews' => Testimonial::active()->get(),
        ]);
    }

    public function index()
    {
        $heroSlides = HeroSlide::active()->get();
        $categories = Category::active()->get(['id', 'parent_id', 'name', 'name_he', 'name_en', 'icon', 'image', 'key']);

        $products = Product::active()
            ->with(self::PRODUCT_WITH)
            ->get(self::PRODUCT_COLUMNS);

        $products = DiscountCampaign::applyToProducts($products);

        return Inertia::render('Store/Index', [
            'heroSlides' => $heroSlides,
            'categories' => $categories,
            'products'   => $products,
        ]);
    }

    public function product(Product $product)
    {
        abort_unless($product->is_active, 404);

        $product->load(self::PRODUCT_WITH);

        $productCollection = DiscountCampaign::applyToProducts(collect([$product]));

        $related = Product::active()
            ->where('category_id', $product->category_id)
            ->where('id', '!=', $product->id)
            ->with(self::PRODUCT_WITH)
            ->inRandomOrder()
            ->limit(8)
            ->get(self::PRODUCT_COLUMNS);

        $related = DiscountCampaign::applyToProducts($related);

        return Inertia::render('Store/Product', [
            'product' => $productCollection->first(),
            'related' => $related,
        ]);
    }
}
