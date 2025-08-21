<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Create categories first if they don't exist
        $categories = [
            ['nom' => 'JIRAMA'],
            ['nom' => 'Crédits'],
            ['nom' => 'Hygiène'],
            ['nom' => 'Fournitures de bureau'],
            ['nom' => 'Repas des employés'],
            ['nom' => 'Carburant']
        ];

        foreach ($categories as $category) {
            $existingCategory = DB::table('categories_depenses')->where('nom', $category['nom'])->first();
            if (!$existingCategory) {
                DB::table('categories_depenses')->insert([
                    'nom' => $category['nom'],
                    'enabled' => true,
                    'created_at' => now(),
                    'updated_at' => now()
                ]);
            }
        }

        // Get category IDs
        $jiramaId = DB::table('categories_depenses')->where('nom', 'JIRAMA')->first()->id;
        $creditsId = DB::table('categories_depenses')->where('nom', 'Crédits')->first()->id;
        $hygieneId = DB::table('categories_depenses')->where('nom', 'Hygiène')->first()->id;
        $fournituresId = DB::table('categories_depenses')->where('nom', 'Fournitures de bureau')->first()->id;
        $repasId = DB::table('categories_depenses')->where('nom', 'Repas des employés')->first()->id;
        $carburantId = DB::table('categories_depenses')->where('nom', 'Carburant')->first()->id;

        // Add some sample expenses for July 2025
        $sampleExpenses = [
            [
                'date' => Carbon::create(2025, 7, 5),
                'categorie_depense_id' => $jiramaId,
                'montant' => 500000,
                'commentaire' => 'Facture JIRAMA juillet',
                'enabled' => true,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'date' => Carbon::create(2025, 7, 10),
                'categorie_depense_id' => $creditsId,
                'montant' => 2000000,
                'commentaire' => 'Remboursement crédit',
                'enabled' => true,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'date' => Carbon::create(2025, 7, 15),
                'categorie_depense_id' => $hygieneId,
                'montant' => 150000,
                'commentaire' => 'Produits d\'hygiène',
                'enabled' => true,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'date' => Carbon::create(2025, 7, 18),
                'categorie_depense_id' => $fournituresId,
                'montant' => 300000,
                'commentaire' => 'Fournitures de bureau',
                'enabled' => true,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'date' => Carbon::create(2025, 7, 22),
                'categorie_depense_id' => $repasId,
                'montant' => 80000,
                'commentaire' => 'Repas employés semaine 3',
                'enabled' => true,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'date' => Carbon::create(2025, 7, 25),
                'categorie_depense_id' => $carburantId,
                'montant' => 450000,
                'commentaire' => 'Carburant véhicules',
                'enabled' => true,
                'created_at' => now(),
                'updated_at' => now()
            ]
        ];
        
        // Insert sample expenses
        DB::table('depenses')->insert($sampleExpenses);
        
        // Add a previous month closure (June 2025) to test the formula
        $previousMonthClosure = [
            'annee' => 2025,
            'mois' => 6, // June
            'solde_initial' => 5000000, // 5,000,000 Ar
            'total_depenses' => 3500000, // 3,500,000 Ar
            'solde_final' => 1500000, // 1,500,000 Ar
            'date_cloture' => Carbon::create(2025, 6, 30, 18, 0, 0),
            'created_at' => now(),
            'updated_at' => now()
        ];
        
        DB::table('clotures_mensuelles')->insert($previousMonthClosure);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Remove sample data
        DB::table('depenses')->whereBetween('date', [Carbon::create(2025, 7, 1), Carbon::create(2025, 7, 31)])->delete();
        DB::table('clotures_mensuelles')->where('annee', 2025)->where('mois', 6)->delete();
        
        // Remove categories (optional - you might want to keep them)
        // DB::table('categories_depenses')->whereIn('nom', ['JIRAMA', 'Crédits', 'Hygiène', 'Fournitures de bureau', 'Repas des employés', 'Carburant'])->delete();
    }
};