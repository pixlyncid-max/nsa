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
        Schema::table('member_documents', function (Blueprint $table) {
            if (! Schema::hasColumn('member_documents', 'original_name')) {
                $table->string('original_name')->nullable()->after('path');
            }
            if (! Schema::hasColumn('member_documents', 'file_size')) {
                $table->unsignedBigInteger('file_size')->nullable()->after('original_name');
            }
            if (! Schema::hasColumn('member_documents', 'mime_type')) {
                $table->string('mime_type', 100)->nullable()->after('file_size');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('member_documents', function (Blueprint $table) {
            if (Schema::hasColumn('member_documents', 'mime_type')) {
                $table->dropColumn('mime_type');
            }
            if (Schema::hasColumn('member_documents', 'file_size')) {
                $table->dropColumn('file_size');
            }
            if (Schema::hasColumn('member_documents', 'original_name')) {
                $table->dropColumn('original_name');
            }
        });
    }
};
