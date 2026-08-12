<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SpecTemplateField extends Model
{
    protected $fillable = [
        'spec_template_id', 'label', 'label_he', 'label_en',
        'field_type', 'preview_shape', 'options', 'options_he', 'options_en', 'sort_order',
    ];

    protected $casts = [
        'options' => 'array',
        'options_he' => 'array',
        'options_en' => 'array',
    ];

    public function template()
    {
        return $this->belongsTo(SpecTemplate::class, 'spec_template_id');
    }
}
