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
        Schema::create('configurations', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique(); // Clé unique pour identifier le paramètre
            $table->string('value'); // Valeur du paramètre (stockée en string pour flexibilité)
            $table->string('description'); // Description du paramètre
            $table->enum('type', ['percentage', 'amount', 'price']); // Type de données
            $table->enum('periode', ['matin', 'soir', 'both'])->default('both'); // Période d'application
            $table->enum('category', ['national', 'regional', 'general'])->default('general'); // Catégorie
            $table->boolean('is_active')->default(true); // Paramètre actif ou non
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('configurations');
    }
};