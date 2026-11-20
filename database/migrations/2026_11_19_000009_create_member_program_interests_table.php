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
        Schema::create('member_program_interests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('application_id')->constrained('member_applications')->cascadeOnDelete();
            $table->string('category', 50)->index(); // ProgramCategory enum
            $table->text('note')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('member_program_interests');
    }
};
