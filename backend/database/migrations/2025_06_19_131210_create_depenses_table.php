<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
       
        // Vérifie si la table existe déjà pour éviter les erreurs lors des migrations répétées
        if (!Schema::hasTable('depenses')) {
            Schema::create('depenses', function (Blueprint $table) {
                $table->id();
                $table->date('date');
                $table->foreignId('categorie_depense_id')->constrained('categories_depenses')->onDelete('restrict');
                $table->decimal('montant', 15, 2);
                $table->text('commentaire')->nullable();
                $table->json('pieces_jointes')->nullable(); // Ou une table séparée pour les pièces jointes
                
                // Correction: ->nullable() doit être appelé avant ->constrained() pour que la colonne soit bien nullable
                $table->foreignId('user_id')->nullable()->comment('Utilisateur ayant enregistré la dépense')->constrained('users')->onDelete('set null');
                
                $table->boolean('enabled')->default(true);
                $table->timestamps();
            });
        }
    }
    public function down()
    {
        Schema::dropIfExists('depenses');
    }
};
