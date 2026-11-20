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
        Schema::create('member_fish_activities', function (Blueprint $table) {
            $table->id();
            $table->foreignId('application_id')->constrained('member_applications')->cascadeOnDelete();
            $table->foreignId('fish_category_id')->nullable()->constrained('fish_categories')->nullOnDelete();
            $table->string('farming_system')->nullable(); // Kolam tanah, terpal, RAS, KJA, dll.
            $table->unsignedInteger('pond_count')->nullable();
            $table->decimal('production_amount', 14, 2)->nullable();
            $table->string('production_unit', 30)->nullable(); // kg, ton, ekor
            $table->string('period', 50)->nullable(); // per siklus, per bulan, per tahun
            $table->string('seed_need')->nullable();
            $table->string('feed_need')->nullable();
            $table->string('purchase_capacity')->nullable(); // Khusus untuk buyer / pengolah
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('member_fish_activities');
    }
};
