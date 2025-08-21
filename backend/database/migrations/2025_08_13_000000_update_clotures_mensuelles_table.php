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
        // Add missing columns to clotures_mensuelles table
        Schema::table('clotures_mensuelles', function (Blueprint $table) {
            $table->integer('annee')->after('id');
            $table->integer('mois')->after('annee');
            $table->decimal('solde_initial', 15, 2)->default(0)->after('mois');
            $table->decimal('total_depenses', 15, 2)->default(0)->after('solde_initial');
            $table->decimal('solde_final', 15, 2)->default(0)->after('total_depenses');
            $table->foreignId('user_id')->nullable()->constrained('users')->onDelete('set null')->after('solde_final');
            $table->timestamp('date_cloture')->nullable()->after('user_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('clotures_mensuelles', function (Blueprint $table) {
            $table->dropColumn(['annee', 'mois', 'solde_initial', 'total_depenses', 'solde_final', 'user_id', 'date_cloture']);
        });
    }
};