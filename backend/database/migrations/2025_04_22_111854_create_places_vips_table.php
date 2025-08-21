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
        Schema::create('places_vips', function (Blueprint $table) {
            $table->id();
            $table->string('nom');
            $table->string('contact');

            // Champs de place 1 à 16
            for ($i = 1; $i <= 10; $i++) {
                $table->boolean("place_$i")->default(false);
            }

            // Relier à la table `voitures`
            $table->unsignedBigInteger('voiture_id');
            $table->foreign('voiture_id')
                  ->references('id')
                  ->on('voiture_vips')
                  ->onDelete('cascade');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('places_vips');
    }
};
