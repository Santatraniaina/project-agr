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
        Schema::table('itineraires', function (Blueprint $table) {
            $table->unsignedBigInteger('cooperative_id')->nullable();
            $table->foreign('cooperative_id')->references('id')->on('cooperatives')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('itineraires', function (Blueprint $table) {
            $table->dropForeign(['cooperative_id']);
            $table->dropColumn('cooperative_id');
        });
    }
};
