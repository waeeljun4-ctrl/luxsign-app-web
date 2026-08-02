<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Crypt;

class CourierCompany extends Model
{
    protected $fillable = [
        'name', 'login_url', 'add_shipment_url',
        'username', 'password', 'field_map', 'is_active', 'last_used_at',
    ];

    protected $hidden = ['username', 'password'];

    protected $casts = [
        'field_map' => 'array',
        'is_active' => 'boolean',
        'last_used_at' => 'datetime',
    ];

    // Plain 'encrypted' casts throw and take down the whole admin page the
    // moment APP_KEY ever changes (key rotation, restoring an old .env,
    // copying a database between environments) — a single stale row is
    // enough to 500 every request that touches the table. Decrypt manually
    // so a corrupted/undecryptable value just reads back as null instead.
    protected function username(): Attribute
    {
        return Attribute::make(
            get: fn (?string $value) => $this->safeDecrypt($value),
            set: fn (?string $value) => $value !== null ? Crypt::encryptString($value) : null,
        );
    }

    protected function password(): Attribute
    {
        return Attribute::make(
            get: fn (?string $value) => $this->safeDecrypt($value),
            set: fn (?string $value) => $value !== null ? Crypt::encryptString($value) : null,
        );
    }

    private function safeDecrypt(?string $value): ?string
    {
        if ($value === null) {
            return null;
        }

        try {
            return Crypt::decryptString($value);
        } catch (\Throwable) {
            return null;
        }
    }
}
