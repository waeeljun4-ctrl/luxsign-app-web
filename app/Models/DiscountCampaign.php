<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DiscountCampaign extends Model
{
    protected $fillable = ['name', 'type', 'value', 'starts_at', 'ends_at', 'is_active'];

    protected $casts = [
        'starts_at' => 'datetime',
        'ends_at'   => 'datetime',
        'is_active' => 'boolean',
        'value'     => 'float',
    ];

    public function categories()
    {
        return $this->belongsToMany(Category::class, 'discount_campaign_category');
    }

    public function products()
    {
        return $this->belongsToMany(Product::class, 'discount_campaign_product');
    }

    public function isRunning(): bool
    {
        if (! $this->is_active) return false;
        if ($this->starts_at && $this->starts_at->isFuture()) return false;
        if ($this->ends_at && $this->ends_at->isPast()) return false;
        return true;
    }

    public function discountFor(float $price): float
    {
        $discount = $this->type === 'percentage' ? $price * ($this->value / 100) : $this->value;
        return round(min($discount, $price), 2);
    }

    /**
     * Apply the best-matching running campaign to each product (non-destructive — computed per request).
     * A campaign always wins over a manual sale price already on the product — it's computed against the
     * true original price (the existing compare_price if the product was already on manual sale, otherwise
     * the current price) so campaigns don't stack unfairly on top of an already-discounted price.
     */
    public static function applyToProducts($products)
    {
        $campaigns = static::with('categories:id', 'products:id')->get()->filter->isRunning();
        if ($campaigns->isEmpty()) return $products;

        foreach ($products as $p) {
            $matches = $campaigns->filter(fn ($c) =>
                $c->products->contains('id', $p->id) || $c->categories->contains('id', $p->category_id)
            );
            if ($matches->isEmpty()) continue;

            $basePrice = $p->compare_price ?: $p->price;
            $best = $matches->sortByDesc(fn ($c) => $c->discountFor($basePrice))->first();
            $discount = $best->discountFor($basePrice);
            if ($discount > 0) {
                $p->compare_price = $basePrice;
                $p->price = round($basePrice - $discount, 2);
            }
        }

        return $products;
    }
}
