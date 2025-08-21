<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\CategorieDepense;

class CategorieDepenseSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            'JIRAMA',
            'Crédits',
            'Hygiène',
            'Formulaires de bureau',
            'Repas des employés',
            'Carburant',
            'Maintenance véhicules',
            'Fournitures de bureau',
            'Télécommunications',
            'Assurances',
            'Taxes et impôts',
            'Frais bancaires',
            'Publicité et marketing',
            'Formation du personnel',
            'Équipements informatiques',
            'Réparations diverses',
            'Frais de déplacement',
            'Autres dépenses'
        ];

        foreach ($categories as $nom) {
            CategorieDepense::updateOrCreate(
                ['nom' => $nom],
                ['enabled' => true]
            );
        }

        $this->command->info('Catégories de dépenses créées avec succès !');
    }
}