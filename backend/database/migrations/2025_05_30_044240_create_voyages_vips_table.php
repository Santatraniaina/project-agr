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
        Schema::create('voyage_vips', function (Blueprint $table) { // Retirer le 's' après voyage
            $table->id();
            $table->foreignId('voiture_id')->constrained('voiture_vips')->onDelete('cascade'); // Référence à voiture_vips
            $table->string('status');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('voyage_vips');
    }
};
