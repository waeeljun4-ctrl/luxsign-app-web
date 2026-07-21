<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('spec_template_fields', function (Blueprint $table) {
            $table->id();
            $table->foreignId('spec_template_id')->constrained()->cascadeOnDelete();
            $table->string('label');
            $table->string('field_type')->default('text'); // text | number | select | boolean
            $table->json('options')->nullable(); // choices for field_type=select
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('spec_template_fields');
    }
};
