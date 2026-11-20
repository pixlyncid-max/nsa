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
        // DPP: Dewan Pengurus Pusat
        Schema::create('dpp_members', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('position');
            $table->string('photo')->nullable();
            $table->integer('order')->default(0)->index();
            $table->string('period', 30)->default('2024-2029');
            $table->text('bio')->nullable();
            $table->timestamps();
        });

        // DPW: Dewan Pengurus Wilayah (Tingkat Provinsi)
        Schema::create('dpws', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('province_id')->unique()->index();
            $table->string('name');
            $table->text('address')->nullable();
            $table->string('phone', 30)->nullable();
            $table->string('email')->nullable();
            $table->string('period', 30)->default('2024-2029');
            $table->timestamps();

            $table->foreign('province_id')->references('id')->on('provinces')->cascadeOnDelete();
        });

        Schema::create('dpw_members', function (Blueprint $table) {
            $table->id();
            $table->foreignId('dpw_id')->constrained('dpws')->cascadeOnDelete();
            $table->string('name');
            $table->string('position');
            $table->string('photo')->nullable();
            $table->integer('order')->default(0)->index();
            $table->timestamps();
        });

        // DPC: Dewan Pengurus Cabang (Tingkat Kabupaten/Kota - Berdiri Sendiri merujuk regencies)
        Schema::create('dpcs', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('regency_id')->unique()->index();
            $table->string('name');
            $table->text('address')->nullable();
            $table->string('phone', 30)->nullable();
            $table->string('email')->nullable();
            $table->string('period', 30)->default('2024-2029');
            $table->timestamps();

            $table->foreign('regency_id')->references('id')->on('regencies')->cascadeOnDelete();
        });

        Schema::create('dpc_members', function (Blueprint $table) {
            $table->id();
            $table->foreignId('dpc_id')->constrained('dpcs')->cascadeOnDelete();
            $table->string('name');
            $table->string('position');
            $table->string('photo')->nullable();
            $table->integer('order')->default(0)->index();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('dpc_members');
        Schema::dropIfExists('dpcs');
        Schema::dropIfExists('dpw_members');
        Schema::dropIfExists('dpws');
        Schema::dropIfExists('dpp_members');
    }
};
