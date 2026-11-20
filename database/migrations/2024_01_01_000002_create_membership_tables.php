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
        Schema::create('business_fields', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->index();
            $table->timestamps();
        });

        Schema::create('fish_categories', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique()->index();
            $table->string('icon')->nullable();
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true)->index();
            $table->timestamps();
        });

        Schema::create('member_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained()->cascadeOnDelete();
            $table->string('nik', 20)->nullable();
            $table->string('birth_place')->nullable();
            $table->date('birth_date')->nullable();
            $table->string('gender', 10)->nullable(); // male | female
            $table->text('address')->nullable();
            $table->string('photo')->nullable();
            $table->timestamps();
        });

        Schema::create('member_businesses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained()->cascadeOnDelete();
            $table->string('membership_type')->nullable(); // Pembudidaya, Nelayan, dll.
            $table->string('name')->nullable();
            $table->string('owner_name')->nullable();
            $table->string('nib', 30)->nullable();
            $table->string('npwp', 30)->nullable();
            $table->date('founded_at')->nullable();
            $table->integer('employee_count')->nullable();
            $table->string('annual_revenue')->nullable();
            $table->string('business_status')->nullable();
            $table->string('business_scale')->nullable();
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

        Schema::create('member_business_field', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('business_field_id')->constrained()->cascadeOnDelete();
            $table->timestamps();

            $table->unique(['user_id', 'business_field_id']);
        });

        Schema::create('member_documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('type', 50)->index(); // ktp, nib, npwp, business_photo, other
            $table->string('path');
            $table->string('status', 20)->default('pending')->index(); // pending | approved | rejected
            $table->timestamps();
        });

        Schema::create('member_social_links', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('platform', 30);
            $table->string('url');
            $table->timestamps();
        });

        Schema::create('member_commodities', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('fish_category_id')->constrained()->cascadeOnDelete();
            $table->decimal('capacity', 12, 2)->default(0);
            $table->string('unit', 30)->default('ton/tahun');
            $table->decimal('land_area', 12, 2)->default(0); // m2 atau ha
            $table->timestamps();
        });

        Schema::create('member_statements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained()->cascadeOnDelete();
            $table->timestamp('signed_at')->nullable();
            $table->string('signature_path')->nullable();
            $table->timestamps();
        });

        Schema::create('member_review_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('admin_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('action', 30)->index(); // approved | revision | rejected
            $table->text('note')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('member_review_logs');
        Schema::dropIfExists('member_statements');
        Schema::dropIfExists('member_commodities');
        Schema::dropIfExists('member_social_links');
        Schema::dropIfExists('member_documents');
        Schema::dropIfExists('member_business_field');
        Schema::dropIfExists('member_businesses');
        Schema::dropIfExists('member_profiles');
        Schema::dropIfExists('fish_categories');
        Schema::dropIfExists('business_fields');
    }
};
