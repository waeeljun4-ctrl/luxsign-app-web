<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Coupon extends Model
{
    protected $fillable = ['user_id', 'code', 'type', 'value', 'expires_at', 'usage_limit', 'is_active', 'is_hidden'];

    protected $casts = [
        'expires_at' => 'datetime',
        'is_active' => 'boolean',
        'is_hidden' => 'boolean',
        'value' => 'float',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function isValid(): bool
    {
        if (! $this->is_active) {
            return false;
        }
        if ($this->expires_at && $this->expires_at->isPast()) {
            return false;
        }
        if ($this->usage_limit !== null && $this->used_count >= $this->usage_limit) {
            return false;
        }
        return true;
    }

    public function discountFor(float $total): float
    {
        $discount = $this->type === 'percentage'
            ? $total * ($this->value / 100)
            : $this->value;

        return round(min($discount, $total), 2);
    }
}
