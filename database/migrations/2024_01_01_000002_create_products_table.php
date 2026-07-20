<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')->constrained()->cascadeOnDelete();
            $table->string('name', 100);
            $table->string('description', 500)->nullable();
            $table->string('icon', 10)->nullable();
            $table->string('badge', 30)->nullable();
            $table->enum('pricing_type', [
                'fixed', 'sqm', 'plate_pair', 'plate_single', 'pair_width', 'single_width'
            ])->default('fixed');
            $table->decimal('price', 10, 2)->default(0);
            $table->json('preset_sizes')->nullable();
            $table->enum('designer_type', ['none', 'sign', 'plate'])->default('none');
            $table->boolean('is_active')->default(true);
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
