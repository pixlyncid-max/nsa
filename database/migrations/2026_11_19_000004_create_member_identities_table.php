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
        Schema::create('member_identities', function (Blueprint $table) {
            $table->id();
            $table->foreignId('application_id')->nullable()->constrained('member_applications')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('nationality', 10)->default('wni')->index(); // wni | wna
            $table->string('full_name');
            $table->string('gender', 10)->nullable(); // male | female
            $table->string('birth_place')->nullable();
            $table->date('birth_date')->nullable();
            $table->string('phone', 30)->nullable();
            $table->string('email')->nullable();
            $table->text('nik')->nullable(); // Encrypted NIK (WNI)
            $table->json('ktp_address')->nullable();
            $table->text('passport_number')->nullable(); // Encrypted Passport (WNA)
            $table->string('origin_country')->nullable();
            $table->unsignedSmallInteger('years_in_indonesia')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('member_identities');
    }
};
