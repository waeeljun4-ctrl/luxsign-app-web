<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('spec_template_fields', function (Blueprint $table) {
            $table->string('label_he', 100)->nullable()->after('label');
            $table->string('label_en', 100)->nullable()->after('label_he');
            $table->json('options_he')->nullable()->after('options');
            $table->json('options_en')->nullable()->after('options_he');
        });
    }

    public function down(): void
    {
        Schema::table('spec_template_fields', function (Blueprint $table) {
            $table->dropColumn(['label_he', 'label_en', 'options_he', 'options_en']);
        });
    }
};
