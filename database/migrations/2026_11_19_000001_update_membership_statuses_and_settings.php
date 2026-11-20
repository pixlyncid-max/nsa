<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Migrasi status lama dari 'pending' ke 'pending_review'
        DB::table('users')
            ->where('membership_status', 'pending')
            ->update(['membership_status' => 'pending_review']);

        if (DB::getSchemaBuilder()->hasTable('member_applications')) {
            DB::table('member_applications')
                ->where('status', 'pending')
                ->update(['status' => 'pending_review']);
        }

        // 2. Tambah pengaturan saklar membership.require_initial_verification jika belum ada
        if (DB::getSchemaBuilder()->hasTable('settings')) {
            $exists = DB::table('settings')->where('key', 'membership.require_initial_verification')->exists();
            if (! $exists) {
                DB::table('settings')->insert([
                    'key' => 'membership.require_initial_verification',
                    'value' => '1',
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::table('users')
            ->where('membership_status', 'pending_review')
            ->update(['membership_status' => 'pending']);

        if (DB::getSchemaBuilder()->hasTable('member_applications')) {
            DB::table('member_applications')
                ->where('status', 'pending_review')
                ->update(['status' => 'pending']);
        }

        if (DB::getSchemaBuilder()->hasTable('settings')) {
            DB::table('settings')->where('key', 'membership.require_initial_verification')->delete();
        }
    }
};
