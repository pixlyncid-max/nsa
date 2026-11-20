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
        Schema::create('member_network_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('application_id')->constrained('member_applications')->cascadeOnDelete();
            $table->text('marketing_info')->nullable();
            $table->json('distribution_areas')->nullable(); // Daftar provinsi/wilayah distribusi
            $table->text('supply_needs')->nullable();
            $table->json('cooperation_types')->nullable(); // Jenis kerjasama yang diminati
            $table->text('professional_activities')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('member_network_profiles');
    }
};
