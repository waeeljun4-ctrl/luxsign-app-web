<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SiteSetting extends Model
{
    protected $fillable = ['whatsapp_number', 'instagram_url', 'tiktok_url', 'facebook_url'];

    /**
     * Single-row settings — creates the row on first access so callers
     * never have to null-check it.
     */
    public static function current(): self
    {
        return static::query()->firstOrCreate([]);
    }
}
