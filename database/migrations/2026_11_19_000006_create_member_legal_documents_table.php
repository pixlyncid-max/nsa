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
        Schema::create('member_legal_documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('business_id')->constrained('member_businesses')->cascadeOnDelete();
            $table->string('type', 30)->default('nib')->index(); // nib | npwp | cbib | other
            $table->string('number')->nullable();
            $table->string('label')->nullable(); // label khusus untuk type "other"
            $table->date('issued_at')->nullable();
            $table->date('expires_at')->nullable();
            $table->string('file_path')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('member_legal_documents');
    }
};
