<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * A reusable, named set of spec fields (e.g. "مواصفات قارمة مضيئة") the
 * admin defines once and applies to any product — applying it COPIES its
 * fields into that product's own product_spec_fields row set, so editing
 * the template later (or a field on one product) never retroactively
 * touches other products or the template itself.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('spec_templates', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('spec_templates');
    }
};
