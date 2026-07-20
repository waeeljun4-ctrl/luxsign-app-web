<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'customer_name', 'customer_phone', 'address',
        'items', 'total', 'notes', 'status',
        'user_id', 'discount_percentage',
        'coupon_code', 'coupon_discount',
        'sent_to_courier', 'sent_to_courier_at',
        'courier_company_id', 'courier_send_status', 'courier_send_error',
    ];

    protected $casts = [
        'items' => 'array',
        'total' => 'float',
        'sent_to_courier' => 'boolean',
        'sent_to_courier_at' => 'datetime',
    ];

    // Statuses: pending | confirmed | in_progress | ready | delivered | cancelled

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function courierCompany()
    {
        return $this->belongsTo(CourierCompany::class);
    }
}
