<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            // Extra gallery photos alongside the single cover `image` — the
            // cover keeps being used everywhere a thumbnail is shown
            // (grid cards, cart, category chips); this is only for the
            // full-screen product detail gallery.
            $table->json('images')->nullable()->after('image');
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn('images');
        });
    }
};
