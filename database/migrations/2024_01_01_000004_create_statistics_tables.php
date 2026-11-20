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
        Schema::create('statistic_snapshots', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('province_id')->index();
            $table->foreignId('fish_category_id')->constrained('fish_categories')->cascadeOnDelete();
            $table->integer('year')->index();
            $table->unsignedInteger('farmer_count')->default(0);
            $table->string('source', 20)->default('members')->index(); // members | manual
            $table->timestamps();

            $table->foreign('province_id')->references('id')->on('provinces')->cascadeOnDelete();
            $table->unique(['province_id', 'fish_category_id', 'year', 'source'], 'stat_snapshot_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('statistic_snapshots');
    }
};
