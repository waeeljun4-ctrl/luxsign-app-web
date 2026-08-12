<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProductSpecField extends Model
{
    protected $fillable = [
        'product_id', 'label', 'label_he', 'label_en',
        'field_type', 'options', 'options_he', 'options_en',
        'is_required', 'sort_order',
    ];

    protected $casts = [
        'options' => 'array',
        'options_he' => 'array',
        'options_en' => 'array',
        'is_required' => 'boolean',
    ];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
