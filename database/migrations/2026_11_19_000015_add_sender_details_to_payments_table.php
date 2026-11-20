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
        Schema::table('payments', function (Blueprint $table) {
            $table->string('sender_name')->nullable()->after('proof_path');
            $table->string('sender_bank')->nullable()->after('sender_name');
            $table->date('paid_at')->nullable()->after('sender_bank');
            $table->text('notes')->nullable()->after('paid_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            $table->dropColumn(['sender_name', 'sender_bank', 'paid_at', 'notes']);
        });
    }
};
