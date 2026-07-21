<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SpecTemplateField extends Model
{
    protected $fillable = ['spec_template_id', 'label', 'field_type', 'options', 'sort_order'];

    protected $casts = [
        'options' => 'array',
    ];

    public function template()
    {
        return $this->belongsTo(SpecTemplate::class, 'spec_template_id');
    }
}
