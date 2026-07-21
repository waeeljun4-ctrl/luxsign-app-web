<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    /**
     * A "custom order" product has no pricing at all — the customer fills
     * in spec fields + a reference photo instead of seeing a price, and the
     * admin quotes them manually afterward. This distinction is admin-only;
     * customers never see it labeled anywhere.
     */
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->boolean('is_custom')->default(false)->after('pricing_type');
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn('is_custom');
        });
    }
};
