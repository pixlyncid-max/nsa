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
        Schema::create('programs', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('slug')->unique()->index();
            $table->string('category', 50)->index(); // ProgramCategory enum
            $table->text('summary')->nullable();
            $table->longText('body')->nullable();
            $table->string('cover')->nullable();
            $table->string('status', 30)->default('draft')->index(); // draft | published
            $table->boolean('is_public')->default(true)->index();
            $table->dateTime('starts_at')->nullable();
            $table->dateTime('ends_at')->nullable();
            $table->integer('order')->default(0);
            $table->timestamps();
        });

        Schema::create('program_registrations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('program_id')->constrained('programs')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('status', 30)->default('registered')->index(); // registered | confirmed | completed | cancelled
            $table->text('note')->nullable();
            $table->timestamps();

            $table->unique(['program_id', 'user_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('program_registrations');
        Schema::dropIfExists('programs');
    }
};
