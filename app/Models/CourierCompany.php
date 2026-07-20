<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CourierCompany extends Model
{
    protected $fillable = [
        'name', 'login_url', 'add_shipment_url',
        'username', 'password', 'field_map', 'is_active', 'last_used_at',
    ];

    protected $hidden = ['username', 'password'];

    protected $casts = [
        'username' => 'encrypted',
        'password' => 'encrypted',
        'field_map' => 'array',
        'is_active' => 'boolean',
        'last_used_at' => 'datetime',
    ];
}
