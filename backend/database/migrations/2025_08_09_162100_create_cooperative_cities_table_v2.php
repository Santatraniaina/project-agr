<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // First, drop the table if it exists
        DB::statement('SET FOREIGN_KEY_CHECKS=0');
        Schema::dropIfExists('cooperative_cities');
        DB::statement('SET FOREIGN_KEY_CHECKS=1');
        
        // Then create it with proper foreign key constraints
        Schema::create('cooperative_cities', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('cooperative_id');
            $table->unsignedBigInteger('ville_id');
            $table->boolean('is_destination')->default(false);
            $table->timestamps();
            
            // Add foreign key constraints
            $table->foreign('cooperative_id')->references('id')->on('cooperatives')->onDelete('cascade');
            $table->foreign('ville_id')->references('id')->on('villes')->onDelete('cascade');
            
            // Add indexes for better performance
            $table->index(['cooperative_id', 'ville_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cooperative_cities');
    }
};