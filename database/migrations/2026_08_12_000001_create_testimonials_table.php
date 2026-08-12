<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('testimonials', function (Blueprint $table) {
            $table->id();
            $table->string('customer_name');
            $table->string('city')->nullable();
            $table->unsignedTinyInteger('stars')->default(5);
            $table->text('text');
            $table->text('text_he')->nullable();
            $table->text('text_en')->nullable();
            $table->string('product_name')->nullable();
            $table->string('image')->nullable();
            $table->string('video')->nullable();
            $table->unsignedInteger('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('testimonials');
    }
};
