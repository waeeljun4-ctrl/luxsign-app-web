<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'category_id', 'name', 'name_he', 'name_en',
        'description', 'description_he', 'description_en',
        'icon', 'image', 'video_url', 'video', 'badge',
        'pricing_type', 'price', 'compare_price', 'preset_sizes',
        'size_prices', 'compare_prices', 'max_size', 'qty_labels', 'shape',
        'designer_type', 'is_active', 'sort_order',
        'track_stock', 'stock_quantity',
    ];

    protected $casts = [
        'is_active'      => 'boolean',
        'price'          => 'float',
        'compare_price'  => 'float',
        'preset_sizes'   => 'array',
        'size_prices'    => 'array',
        'compare_prices' => 'array',
        'qty_labels'     => 'array',
        'track_stock'    => 'boolean',
        'stock_quantity' => 'integer',
    ];

    // Pricing types:
    // fixed        → سعر ثابت
    // sqm          → 750₪ لكل م²
    // plate_pair   → نمر جوز (150₪)
    // plate_single → نمرة مفردة (100₪)
    // pair_width   → جوز حسب العرض
    // single_width → قطعة حسب العرض

    // Designer types: none | sign | plate

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true)->orderBy('sort_order');
    }

    /**
     * Calculate price based on dimensions
     */
    public function calculatePrice(float $width = 80, float $height = 80): float
    {
        return match ($this->pricing_type) {
            'sqm'          => max(150, round(($width / 100) * ($height / 100) * $this->price)),
            'pair_width'   => round($width * $this->price / 100 * 2),
            'single_width' => round($width * $this->price / 100),
            default        => $this->price,
        };
    }

    public function discountPercent(): ?int
    {
        if (! $this->compare_price || $this->compare_price <= $this->price) {
            return null;
        }

        return (int) round((($this->compare_price - $this->price) / $this->compare_price) * 100);
    }

    public function isSoldOut(): bool
    {
        return $this->track_stock && $this->stock_quantity <= 0;
    }
}
