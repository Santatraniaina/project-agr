<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('voitures', function (Blueprint $table) {
            $table->id(); // Ajoutez cette ligne pour créer une clé primaire auto-incrémentée
            
            $table->string('marque');
            $table->string('modele')->nullable();
            
            $table->string('itineraire');
            $table->date('date_depart');
            $table->time('heure_depart');
            $table->integer('places')->default(0);
            
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('voitures');
    }
};