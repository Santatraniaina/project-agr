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
        Schema::create('voiture_vips', function (Blueprint $table) {
            $table->id();
            $table->string('marque');
            $table->string('modele')->nullable();
            
            $table->string('itineraire');
            $table->date('date_depart');
            $table->time('heure_depart');
            $table->integer('places')->default(10);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('voiture_vips');
    }
};
