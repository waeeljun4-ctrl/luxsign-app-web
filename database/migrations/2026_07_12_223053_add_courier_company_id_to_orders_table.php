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
        Schema::table('orders', function (Blueprint $table) {
            $table->foreignId('courier_company_id')->nullable()->after('sent_to_courier_at')->constrained()->nullOnDelete();
            $table->string('courier_send_status')->nullable()->after('courier_company_id'); // sent | failed
            $table->text('courier_send_error')->nullable()->after('courier_send_status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropConstrainedForeignId('courier_company_id');
            $table->dropColumn(['courier_send_status', 'courier_send_error']);
        });
    }
};
