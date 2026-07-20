<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('role')->default('customer')->after('password');
            $table->string('phone')->nullable()->after('role');
        });

        Schema::table('categories', function (Blueprint $table) {
            $table->string('name_he')->nullable()->after('name');
            $table->string('name_en')->nullable()->after('name_he');
            $table->string('image')->nullable()->after('icon');
        });

        DB::statement("ALTER TABLE products MODIFY pricing_type ENUM('fixed','sqm','plate_pair','plate_single','pair_width','single_width','plate_qty','fixed_per_size') NOT NULL DEFAULT 'fixed'");

        Schema::table('products', function (Blueprint $table) {
            $table->string('name_he')->nullable()->after('name');
            $table->string('name_en')->nullable()->after('name_he');
            $table->string('description_he')->nullable()->after('description');
            $table->string('description_en')->nullable()->after('description_he');
            $table->json('compare_prices')->nullable()->after('preset_sizes');
            $table->json('size_prices')->nullable()->after('compare_prices');
            $table->smallInteger('max_size')->unsigned()->nullable()->after('size_prices');
            $table->json('qty_labels')->nullable()->after('max_size');
            $table->string('shape')->default('rectangle')->after('qty_labels');
        });

        if (! Schema::hasTable('personal_access_tokens')) {
            Schema::create('personal_access_tokens', function (Blueprint $table) {
                $table->id();
                $table->morphs('tokenable');
                $table->string('name');
                $table->string('token', 64)->unique();
                $table->text('abilities')->nullable();
                $table->timestamp('last_used_at')->nullable();
                $table->timestamp('expires_at')->nullable();
                $table->timestamps();
            });
        }
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['role', 'phone']);
        });
        Schema::table('categories', function (Blueprint $table) {
            $table->dropColumn(['name_he', 'name_en', 'image']);
        });
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn(['name_he', 'name_en', 'description_he', 'description_en', 'compare_prices', 'size_prices', 'max_size', 'qty_labels', 'shape']);
        });
        Schema::dropIfExists('personal_access_tokens');
    }
};
