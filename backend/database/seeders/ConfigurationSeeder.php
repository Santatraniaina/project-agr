<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Configuration;

class ConfigurationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $configurations = [
            // Configurations pour le simulateur National - Matin
            [
                'key' => 'national_reduction_percentage_matin',
                'value' => '0.10',
                'description' => 'Pourcentage de réduction appliqué le matin (10%)',
                'type' => 'percentage',
                'periode' => 'matin',
                'category' => 'national',
                'is_active' => true
            ],
            [
                'key' => 'national_frais_fixe_matin',
                'value' => '5000',
                'description' => 'Frais fixe ajouté après réduction le matin',
                'type' => 'amount',
                'periode' => 'matin',
                'category' => 'national',
                'is_active' => true
            ],
            [
                'key' => 'national_prix_tnr_matin',
                'value' => '50000',
                'description' => 'Prix par passager TNR le matin',
                'type' => 'price',
                'periode' => 'matin',
                'category' => 'national',
                'is_active' => true
            ],
            [
                'key' => 'national_prix_abe_matin',
                'value' => '40000',
                'description' => 'Prix par passager Antsirabe le matin',
                'type' => 'price',
                'periode' => 'matin',
                'category' => 'national',
                'is_active' => true
            ],

            // Configurations pour le simulateur National - Soir
            [
                'key' => 'national_reduction_percentage_soir',
                'value' => '0.10',
                'description' => 'Pourcentage de réduction appliqué le soir (10%)',
                'type' => 'percentage',
                'periode' => 'soir',
                'category' => 'national',
                'is_active' => true
            ],
            [
                'key' => 'national_frais_fixe_soir',
                'value' => '5000',
                'description' => 'Frais fixe ajouté après réduction le soir',
                'type' => 'amount',
                'periode' => 'soir',
                'category' => 'national',
                'is_active' => true
            ],
            [
                'key' => 'national_prix_tnr_soir',
                'value' => '50000',
                'description' => 'Prix par passager TNR le soir',
                'type' => 'price',
                'periode' => 'soir',
                'category' => 'national',
                'is_active' => true
            ],
            [
                'key' => 'national_prix_abe_soir',
                'value' => '50000',
                'description' => 'Prix par passager Antsirabe le soir',
                'type' => 'price',
                'periode' => 'soir',
                'category' => 'national',
                'is_active' => true
            ],

            // Configurations pour le simulateur Régional - Matin
            [
                'key' => 'regional_prix_manakara_matin',
                'value' => '30000',
                'description' => 'Prix par passager Manakara le matin',
                'type' => 'price',
                'periode' => 'matin',
                'category' => 'regional',
                'is_active' => true
            ],
            [
                'key' => 'regional_deplacement_manakara_matin',
                'value' => '12000',
                'description' => 'Frais de déplacement Manakara le matin',
                'type' => 'amount',
                'periode' => 'matin',
                'category' => 'regional',
                'is_active' => true
            ],

            // Configurations pour le simulateur Régional - Soir
            [
                'key' => 'regional_prix_manakara_soir',
                'value' => '35000',
                'description' => 'Prix par passager Manakara le soir',
                'type' => 'price',
                'periode' => 'soir',
                'category' => 'regional',
                'is_active' => true
            ],
            [
                'key' => 'regional_deplacement_manakara_soir',
                'value' => '12000',
                'description' => 'Frais de déplacement Manakara le soir',
                'type' => 'amount',
                'periode' => 'soir',
                'category' => 'regional',
                'is_active' => true
            ],
        ];

        foreach ($configurations as $config) {
            Configuration::updateOrCreate(
                ['key' => $config['key']],
                $config
            );
        }

        $this->command->info('Configurations par défaut créées avec succès !');
    }
}