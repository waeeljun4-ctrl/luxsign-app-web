<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * A product's own, independent set of spec fields the customer fills in
 * when ordering (e.g. width/height/lighting type) — purely informational
 * for the workshop, never affects price. Usually seeded by copying a
 * SpecTemplate's fields, but from here on lives entirely on its own.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('product_spec_fields', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->string('label');
            $table->string('field_type')->default('text'); // text | number | select | boolean
            $table->json('options')->nullable();
            $table->boolean('is_required')->default(false);
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('product_spec_fields');
    }
};
