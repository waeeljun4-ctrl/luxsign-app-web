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
        'pricing_type', 'is_custom', 'price', 'compare_price', 'min_price', 'show_min_price', 'preset_sizes',
        'size_prices', 'compare_prices', 'max_size', 'fixed_size_label', 'qty_labels', 'shape',
        'designer_type', 'is_active', 'sort_order',
        'track_stock', 'stock_quantity',
    ];

    protected $casts = [
        'is_active'      => 'boolean',
        'is_custom'      => 'boolean',
        'price'          => 'float',
        'compare_price'  => 'float',
        'min_price'      => 'float',
        'show_min_price' => 'boolean',
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

    public function specFields()
    {
        return $this->hasMany(ProductSpecField::class)->orderBy('sort_order');
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
        // pair_width/single_width price by the longer side (running-meter
        // material like foam board) — whichever of width/height is bigger.
        $longerSide = max($width, $height);

        $price = match ($this->pricing_type) {
            'sqm'          => max(150, round(($width / 100) * ($height / 100) * $this->price)),
            'pair_width'   => round($longerSide * $this->price / 100 * 2),
            'single_width' => round($longerSide * $this->price / 100),
            default        => $this->price,
        };

        return $this->applyMinPrice($price);
    }

    /**
     * Clamps a calculated price up to the admin-set floor — the customer
     * never pays (or sees) less than this figure once it's enabled.
     */
    public function applyMinPrice(float $price): float
    {
        if ($this->show_min_price && $this->min_price !== null) {
            return max($price, (float) $this->min_price);
        }

        return $price;
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
