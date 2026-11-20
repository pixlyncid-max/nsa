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
        Schema::create('member_locations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('application_id')->constrained('member_applications')->cascadeOnDelete();
            $table->string('kind', 30)->default('domicile')->index(); // domicile | business | activity
            $table->unsignedBigInteger('province_id')->nullable()->index();
            $table->unsignedBigInteger('regency_id')->nullable()->index();
            $table->unsignedBigInteger('district_id')->nullable()->index();
            $table->unsignedBigInteger('village_id')->nullable()->index();
            $table->string('postal_code', 10)->nullable();
            $table->text('address')->nullable();
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();
            $table->timestamps();

            $table->foreign('province_id')->references('id')->on('provinces')->nullOnDelete();
            $table->foreign('regency_id')->references('id')->on('regencies')->nullOnDelete();
            $table->foreign('district_id')->references('id')->on('districts')->nullOnDelete();
            $table->foreign('village_id')->references('id')->on('villages')->nullOnDelete();
        });

        Schema::create('member_photos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('application_id')->constrained('member_applications')->cascadeOnDelete();
            $table->string('path');
            $table->string('caption')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('member_photos');
        Schema::dropIfExists('member_locations');
    }
};
