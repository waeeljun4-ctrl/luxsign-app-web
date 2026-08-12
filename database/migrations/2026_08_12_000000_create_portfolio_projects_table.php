<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('portfolio_projects', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('title_he')->nullable();
            $table->string('title_en')->nullable();
            $table->text('description')->nullable();
            $table->text('description_he')->nullable();
            $table->text('description_en')->nullable();
            // Free-text, not a foreign key — the filter pills on the public
            // page are built from whatever distinct category values exist,
            // same spirit as the old hardcoded CATEGORIES list.
            $table->string('category')->nullable();
            $table->string('image')->nullable();
            $table->string('video')->nullable();
            $table->unsignedInteger('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('portfolio_projects');
    }
};
