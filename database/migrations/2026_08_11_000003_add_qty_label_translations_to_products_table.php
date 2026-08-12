<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->json('qty_labels_he')->nullable()->after('qty_labels');
            $table->json('qty_labels_en')->nullable()->after('qty_labels_he');
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn(['qty_labels_he', 'qty_labels_en']);
        });
    }
};
