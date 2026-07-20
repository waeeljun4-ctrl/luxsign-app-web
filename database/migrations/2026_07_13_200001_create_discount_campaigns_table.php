<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('discount_campaigns', function (Blueprint $table) {
            $table->id();
            $table->string('name', 100);
            $table->enum('type', ['percentage', 'fixed']);
            $table->decimal('value', 10, 2);
            $table->timestamp('starts_at')->nullable();
            $table->timestamp('ends_at')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('discount_campaign_category', function (Blueprint $table) {
            $table->foreignId('discount_campaign_id')->constrained()->cascadeOnDelete();
            $table->foreignId('category_id')->constrained()->cascadeOnDelete();
            $table->primary(['discount_campaign_id', 'category_id']);
        });

        Schema::create('discount_campaign_product', function (Blueprint $table) {
            $table->foreignId('discount_campaign_id')->constrained()->cascadeOnDelete();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->primary(['discount_campaign_id', 'product_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('discount_campaign_product');
        Schema::dropIfExists('discount_campaign_category');
        Schema::dropIfExists('discount_campaigns');
    }
};
