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
        Schema::create('provinces', function (Blueprint $table) {
            $table->unsignedBigInteger('id')->primary();
            $table->string('name');
            $table->string('slug')->index();
            $table->timestamps();
        });

        Schema::create('regencies', function (Blueprint $table) {
            $table->unsignedBigInteger('id')->primary();
            $table->unsignedBigInteger('province_id')->index();
            $table->string('name');
            $table->string('slug')->index();
            $table->timestamps();

            $table->foreign('province_id')->references('id')->on('provinces')->cascadeOnDelete();
        });

        Schema::create('districts', function (Blueprint $table) {
            $table->unsignedBigInteger('id')->primary();
            $table->unsignedBigInteger('regency_id')->index();
            $table->string('name');
            $table->timestamps();

            $table->foreign('regency_id')->references('id')->on('regencies')->cascadeOnDelete();
        });

        Schema::create('villages', function (Blueprint $table) {
            $table->unsignedBigInteger('id')->primary();
            $table->unsignedBigInteger('district_id')->index();
            $table->string('name');
            $table->timestamps();

            $table->foreign('district_id')->references('id')->on('districts')->cascadeOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('villages');
        Schema::dropIfExists('districts');
        Schema::dropIfExists('regencies');
        Schema::dropIfExists('provinces');
    }
};
