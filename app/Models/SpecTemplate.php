<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SpecTemplate extends Model
{
    protected $fillable = ['name'];

    public function fields()
    {
        return $this->hasMany(SpecTemplateField::class)->orderBy('sort_order');
    }
}
