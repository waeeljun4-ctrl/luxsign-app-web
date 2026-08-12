<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            // Explicit per-product opt-in for the customer-facing reference-photo
            // upload — not every product needs it, so it's off by default.
            $table->boolean('show_ref_images')->default(false)->after('is_custom');
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn('show_ref_images');
        });
    }
};
