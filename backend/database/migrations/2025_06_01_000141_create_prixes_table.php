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
        Schema::create('prix', function (Blueprint $table) {
            $table->id();
    $table->decimal('prix_matin', 10, 2);
    $table->decimal('prix_soir', 10, 2);
    $table->string('arret');
    $table->string('destination');
    $table->foreignId('itineraire_id')->constrained();
    $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('prix');
    }
};
