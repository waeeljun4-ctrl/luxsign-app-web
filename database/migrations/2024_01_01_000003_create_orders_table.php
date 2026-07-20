<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->string('customer_name', 100);
            $table->string('customer_phone', 20);
            $table->json('items');
            $table->decimal('total', 10, 2);
            $table->text('notes')->nullable();
            $table->enum('status', [
                'pending', 'confirmed', 'in_progress', 'ready', 'delivered', 'cancelled'
            ])->default('pending');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
