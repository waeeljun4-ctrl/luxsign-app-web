<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ledger_entries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('ledger_party_id')->constrained()->cascadeOnDelete();
            // Positive = due (عليك له), negative = payment (إلك عنده) — same
            // sign convention as JobFlow's ledger.
            $table->decimal('amount', 10, 2);
            $table->string('description');
            $table->date('entry_date');
            $table->foreignId('created_by')->constrained('users')->cascadeOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ledger_entries');
    }
};
