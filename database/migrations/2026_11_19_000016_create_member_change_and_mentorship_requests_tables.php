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
        // 1. Tambah verification_token ke users untuk KTA digital publik
        Schema::table('users', function (Blueprint $table) {
            if (! Schema::hasColumn('users', 'verification_token')) {
                $table->string('verification_token', 64)->nullable()->unique()->after('member_number');
            }
        });

        // 2. Tabel member_change_requests (Permintaan perubahan data penting: nama, kewarganegaraan, kategori)
        Schema::create('member_change_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('field', 50)->index(); // name | nationality | membership_category | etc.
            $table->text('old_value')->nullable();
            $table->text('new_value');
            $table->text('reason')->nullable();
            $table->string('status', 20)->default('pending')->index(); // pending | approved | rejected
            $table->foreignId('admin_id')->nullable()->constrained('users')->nullOnDelete();
            $table->text('admin_note')->nullable();
            $table->timestamp('reviewed_at')->nullable();
            $table->timestamps();
        });

        // 3. Tabel mentorship_requests (Permintaan pendampingan perizinan/teknis)
        Schema::create('mentorship_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('business_id')->nullable()->constrained('member_businesses')->nullOnDelete();
            $table->string('topic', 150);
            $table->text('description');
            $table->string('status', 20)->default('submitted')->index(); // submitted | in_progress | completed | cancelled
            $table->text('admin_note')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('mentorship_requests');
        Schema::dropIfExists('member_change_requests');

        Schema::table('users', function (Blueprint $table) {
            if (Schema::hasColumn('users', 'verification_token')) {
                $table->dropColumn('verification_token');
            }
        });
    }
};
