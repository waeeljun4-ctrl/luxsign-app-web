<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('external_sales', function (Blueprint $table) {
            $table->id();
            // Nullable + a separate name snapshot: a sale can be logged
            // against a real catalog product (for cost auto-fill) or as a
            // free-text line for something never listed on the site, and
            // stays readable even if the linked product is later deleted.
            $table->foreignId('product_id')->nullable()->constrained()->nullOnDelete();
            $table->string('product_name');
            $table->integer('qty')->default(1);
            $table->decimal('sale_price', 10, 2);
            $table->decimal('cost_price', 10, 2)->nullable();
            $table->date('sold_on');
            $table->string('notes')->nullable();
            $table->foreignId('created_by')->constrained('users')->cascadeOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('external_sales');
    }
};
