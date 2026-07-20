<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class HeroSlide extends Model
{
    use HasFactory;

    protected $fillable = [
        'image',
        'title', 'title_he', 'title_en',
        'subtitle', 'subtitle_he', 'subtitle_en',
        'cta_text', 'cta_text_he', 'cta_text_en',
        'cta_link', 'sort_order', 'is_active',
    ];

    protected $casts = ['is_active' => 'boolean'];

    public function scopeActive($query)
    {
        return $query->where('is_active', true)->orderBy('sort_order');
    }
}
