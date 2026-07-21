<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProductSpecField extends Model
{
    protected $fillable = ['product_id', 'label', 'field_type', 'options', 'is_required', 'sort_order'];

    protected $casts = [
        'options' => 'array',
        'is_required' => 'boolean',
    ];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
