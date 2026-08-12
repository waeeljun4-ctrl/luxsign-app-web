<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('product_spec_fields', function (Blueprint $table) {
            // Only meaningful when field_type = 'preview' — a purely visual
            // circle/rectangle size preview the customer fills in, unrelated
            // to price calculation.
            $table->string('preview_shape', 20)->nullable()->after('field_type');
        });
        Schema::table('spec_template_fields', function (Blueprint $table) {
            $table->string('preview_shape', 20)->nullable()->after('field_type');
        });
    }

    public function down(): void
    {
        Schema::table('product_spec_fields', function (Blueprint $table) {
            $table->dropColumn('preview_shape');
        });
        Schema::table('spec_template_fields', function (Blueprint $table) {
            $table->dropColumn('preview_shape');
        });
    }
};
