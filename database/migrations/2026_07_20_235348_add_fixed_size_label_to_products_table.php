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
            // Purely informational — for pricing_type=fixed_qty, an admin-set
            // dimension shown to the customer (e.g. "50×11 سم") that never
            // changes per order; only the quantity is customer-chosen there.
            $table->string('fixed_size_label')->nullable()->after('max_size');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn('fixed_size_label');
        });
    }
};
