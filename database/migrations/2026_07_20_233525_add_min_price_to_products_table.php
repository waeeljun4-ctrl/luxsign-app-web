<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            // A floor the customer's actual charge is clamped up to (and the
            // only figure they ever see) whenever the real calculated price
            // would land below it — e.g. "starts from 1000₪/m²" even though
            // a small custom size would otherwise compute to less.
            $table->decimal('min_price', 10, 2)->nullable()->after('compare_price');
            $table->boolean('show_min_price')->default(false)->after('min_price');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn(['min_price', 'show_min_price']);
        });
    }
};
