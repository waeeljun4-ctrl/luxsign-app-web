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
        Schema::create('courier_companies', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('login_url');
            $table->string('add_shipment_url')->nullable();
            $table->text('username'); // encrypted cast
            $table->text('password'); // encrypted cast
            $table->json('field_map')->nullable(); // CSS selectors + fixed dropdown values
            $table->boolean('is_active')->default(true);
            $table->timestamp('last_used_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('courier_companies');
    }
};
