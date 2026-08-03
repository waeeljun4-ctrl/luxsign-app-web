<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ledger_parties', function (Blueprint $table) {
            $table->id();
            // No worker-login roster on this site (unlike JobFlow), so both
            // categories are just manually-added parties distinguished by type.
            $table->enum('type', ['worker', 'supplier']);
            $table->string('name');
            $table->string('phone')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ledger_parties');
    }
};
