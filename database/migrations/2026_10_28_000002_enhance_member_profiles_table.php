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
        Schema::table('member_profiles', function (Blueprint $table) {
            // Ubah tipe nik menjadi text agar dapat menampung hasil enkripsi Laravel
            $table->text('nik')->nullable()->change();

            // Kolom identitas tambahan
            $table->string('name_ktp')->nullable()->after('nik');
            $table->string('occupation')->nullable()->after('gender');

            // Alamat sesuai KTP
            $table->unsignedBigInteger('province_id')->nullable()->after('address')->index();
            $table->unsignedBigInteger('regency_id')->nullable()->after('province_id')->index();
            $table->unsignedBigInteger('district_id')->nullable()->after('regency_id')->index();
            $table->unsignedBigInteger('village_id')->nullable()->after('district_id')->index();
            $table->string('postal_code', 10)->nullable()->after('village_id');

            // Alamat domisili jika berbeda dengan KTP
            $table->boolean('is_domicile_same')->default(true)->after('postal_code');
            $table->text('domicile_address')->nullable()->after('is_domicile_same');
            $table->unsignedBigInteger('domicile_province_id')->nullable()->after('domicile_address')->index();
            $table->unsignedBigInteger('domicile_regency_id')->nullable()->after('domicile_province_id')->index();
            $table->unsignedBigInteger('domicile_district_id')->nullable()->after('domicile_regency_id')->index();
            $table->unsignedBigInteger('domicile_village_id')->nullable()->after('domicile_district_id')->index();
            $table->string('domicile_postal_code', 10)->nullable()->after('domicile_village_id');

            $table->foreign('province_id')->references('id')->on('provinces')->nullOnDelete();
            $table->foreign('regency_id')->references('id')->on('regencies')->nullOnDelete();
            $table->foreign('district_id')->references('id')->on('districts')->nullOnDelete();
            $table->foreign('village_id')->references('id')->on('villages')->nullOnDelete();

            $table->foreign('domicile_province_id')->references('id')->on('provinces')->nullOnDelete();
            $table->foreign('domicile_regency_id')->references('id')->on('regencies')->nullOnDelete();
            $table->foreign('domicile_district_id')->references('id')->on('districts')->nullOnDelete();
            $table->foreign('domicile_village_id')->references('id')->on('villages')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('member_profiles', function (Blueprint $table) {
            $table->dropForeign(['province_id']);
            $table->dropForeign(['regency_id']);
            $table->dropForeign(['district_id']);
            $table->dropForeign(['village_id']);
            $table->dropForeign(['domicile_province_id']);
            $table->dropForeign(['domicile_regency_id']);
            $table->dropForeign(['domicile_district_id']);
            $table->dropForeign(['domicile_village_id']);

            $table->dropColumn([
                'name_ktp',
                'occupation',
                'province_id',
                'regency_id',
                'district_id',
                'village_id',
                'postal_code',
                'is_domicile_same',
                'domicile_address',
                'domicile_province_id',
                'domicile_regency_id',
                'domicile_district_id',
                'domicile_village_id',
                'domicile_postal_code',
            ]);

            $table->string('nik', 20)->nullable()->change();
        });
    }
};
