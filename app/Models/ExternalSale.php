<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ExternalSale extends Model
{
    protected $fillable = [
        'product_id', 'product_name', 'qty', 'sale_price', 'cost_price', 'sold_on', 'notes', 'created_by',
    ];

    protected function casts(): array
    {
        return [
            'sold_on' => 'date',
            'sale_price' => 'decimal:2',
            'cost_price' => 'decimal:2',
        ];
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
