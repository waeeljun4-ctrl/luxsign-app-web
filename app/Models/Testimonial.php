<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Testimonial extends Model
{
    protected $fillable = [
        'customer_name', 'city', 'stars',
        'text', 'text_he', 'text_en',
        'product_name', 'image', 'video', 'sort_order', 'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'stars' => 'integer',
    ];

    public function scopeActive($query)
    {
        return $query->where('is_active', true)->orderBy('sort_order');
    }
}
