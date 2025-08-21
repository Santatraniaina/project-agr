<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use App\Models\Configuration;

class SimulateurCaisseController extends Controller
{
    /**
     * Récupérer la configuration des prix depuis la base de données
     */
    private function getPrixConfig($periode, $category = 'national')
    {
        // Récupérer les configurations depuis la base de données
        $configurations = Configuration::getByCategory($category, $periode);
        
        // Configuration par défaut en cas d'absence de données en BDD
        $defaultConfig = [
            'national' => [
                'matin' => [
                    'tnr' => 50000,
                    'abe' => 40000,
                    'reduction_frais_fixe' => 5000,
                    'pourcentage_reduction' => 0.10,
                ],
                'soir' => [
                    'tnr' => 50000,
                    'abe' => 50000,
                    'reduction_frais_fixe' => 5000,
                    'pourcentage_reduction' => 0.10,
                ]
            ],
            'regional' => [
                'matin' => [
                    'manakara' => 30000,
                    'deplacement_manakara' => 12000,
                ],
                'soir' => [
                    'manakara' => 35000,
                    'deplacement_manakara' => 12000,
                ]
            ]
        ];

        $config = [];
        
        if ($category === 'national') {
            $config['tnr'] = $configurations->get("national_prix_tnr_{$periode}")?->getTypedValue()
                ?? $defaultConfig['national'][$periode]['tnr'];
            $config['abe'] = $configurations->get("national_prix_abe_{$periode}")?->getTypedValue()
                ?? $defaultConfig['national'][$periode]['abe'];
            $config['reduction_frais_fixe'] = $configurations->get("national_frais_fixe_{$periode}")?->getTypedValue()
                ?? $defaultConfig['national'][$periode]['reduction_frais_fixe'];
            $config['pourcentage_reduction'] = $configurations->get("national_reduction_percentage_{$periode}")?->getTypedValue()
                ?? $defaultConfig['national'][$periode]['pourcentage_reduction'];
        } elseif ($category === 'regional') {
            $config['manakara'] = $configurations->get("regional_prix_manakara_{$periode}")?->getTypedValue()
                ?? $defaultConfig['regional'][$periode]['manakara'];
            $config['deplacement_manakara'] = $configurations->get("regional_deplacement_manakara_{$periode}")?->getTypedValue()
                ?? $defaultConfig['regional'][$periode]['deplacement_manakara'];
        }

        return $config;
    }

    public function calculerNational(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'periode' => 'required|in:matin,soir',
            'voitures' => 'required|array|min:1',
            'voitures.*.passagers_tnr' => 'required|integer|min:0',
            'voitures.*.passagers_abe' => 'required|integer|min:0',
            'voitures.*.paye_autre_dest_tnr' => 'required|integer|min:0',
            'voitures.*.paye_autre_dest_abe' => 'required|integer|min:0',
            // Validation des paramètres optionnels
            'parametres' => 'sometimes|array',
            'parametres.prix_tnr' => 'sometimes|numeric|min:0',
            'parametres.prix_abe' => 'sometimes|numeric|min:0',
            'parametres.pourcentage_reduction' => 'sometimes|numeric|min:0|max:1',
            'parametres.frais_fixe' => 'sometimes|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $validator->validated();
        
        // Utiliser les paramètres envoyés depuis le frontend ou les valeurs par défaut de la BDD
        if (isset($data['parametres'])) {
            $prixConfig = [
                'tnr' => $data['parametres']['prix_tnr'] ?? 50000,
                'abe' => $data['parametres']['prix_abe'] ?? ($data['periode'] === 'matin' ? 40000 : 50000),
                'pourcentage_reduction' => $data['parametres']['pourcentage_reduction'] ?? 0.10,
                'reduction_frais_fixe' => $data['parametres']['frais_fixe'] ?? 5000,
            ];
        } else {
            // Fallback vers la configuration de la base de données
            $prixConfig = $this->getPrixConfig($data['periode'], 'national');
        }
        $resultatsVoitures = [];
        $totalGlobal = [
            'passagers_tnr' => 0,
            'passagers_abe' => 0,
            'montant_brut_total' => 0,
            'montant_apres_reduction_total' => 0,
            'paye_autre_dest_tnr_total_valeur' => 0,
            'paye_autre_dest_abe_total_valeur' => 0,
            'montant_a_payer_total' => 0,
        ];

        foreach ($data['voitures'] as $index => $voitureData) {
            // Conversion en nombres pour éviter les erreurs de type
            $passagers_tnr = (int) $voitureData['passagers_tnr'];
            $passagers_abe = (int) $voitureData['passagers_abe'];
            $paye_autre_dest_tnr = (int) $voitureData['paye_autre_dest_tnr'];
            $paye_autre_dest_abe = (int) $voitureData['paye_autre_dest_abe'];
            
            $montant_brut = ($passagers_tnr * $prixConfig['tnr']) +
                            ($passagers_abe * $prixConfig['abe']);

            // Calcul du montant après réduction avec vérification du pourcentage
            $pourcentage_reduction = (float) $prixConfig['pourcentage_reduction'];
            $montant_apres_reduction = ($montant_brut * (1 - $pourcentage_reduction)) + $prixConfig['reduction_frais_fixe'];
            
            $valeur_paye_autre_tnr = $paye_autre_dest_tnr * $prixConfig['tnr'];
            $valeur_paye_autre_abe = $paye_autre_dest_abe * $prixConfig['abe'];

            $montant_a_payer = $montant_apres_reduction - $valeur_paye_autre_tnr - $valeur_paye_autre_abe;

            $resultatsVoitures[] = [
                'id' => $index + 1, // Simple ID pour l'affichage
                'passagers_tnr' => $passagers_tnr,
                'passagers_abe' => $passagers_abe,
                'montant_brut' => $montant_brut,
                'montant_apres_reduction' => $montant_apres_reduction,
                'paye_autre_dest_tnr' => $paye_autre_dest_tnr,
                'paye_autre_dest_abe' => $paye_autre_dest_abe,
                'valeur_paye_autre_tnr' => $valeur_paye_autre_tnr,
                'valeur_paye_autre_abe' => $valeur_paye_autre_abe,
                'montant_a_payer' => $montant_a_payer,
            ];

            // Agrégation des totaux
            $totalGlobal['passagers_tnr'] += $passagers_tnr;
            $totalGlobal['passagers_abe'] += $passagers_abe;
            $totalGlobal['montant_brut_total'] += $montant_brut;
            $totalGlobal['montant_apres_reduction_total'] += $montant_apres_reduction;
            $totalGlobal['paye_autre_dest_tnr_total_valeur'] += $valeur_paye_autre_tnr;
            $totalGlobal['paye_autre_dest_abe_total_valeur'] += $valeur_paye_autre_abe;
            $totalGlobal['montant_a_payer_total'] += $montant_a_payer;
        }
        
        $nombreVoitures = count($resultatsVoitures);
        $totalGlobal['montant_a_payer_par_voiture_moyenne'] = $nombreVoitures > 0 ? $totalGlobal['montant_a_payer_total'] / $nombreVoitures : 0;


        return response()->json([
            'voitures' => $resultatsVoitures,
            'total_global' => $totalGlobal,
            'nombre_voitures' => $nombreVoitures
        ]);
    }

    public function calculerRegional(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'periode' => 'required|in:matin,soir',
            'voitures' => 'required|array|min:1',
            'voitures.*.passagers_manakara' => 'required|integer|min:0',
            'voitures.*.gasoil' => 'required|numeric|min:0',
            'voitures.*.paye_autre_dest_manakara' => 'required|integer|min:0',
            // Validation des paramètres optionnels
            'parametres' => 'sometimes|array',
            'parametres.prix_manakara' => 'sometimes|numeric|min:0',
            'parametres.deplacement_manakara' => 'sometimes|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $validator->validated();
        
        // Utiliser les paramètres envoyés depuis le frontend ou les valeurs par défaut de la BDD
        if (isset($data['parametres'])) {
            $prixConfig = [
                'manakara' => $data['parametres']['prix_manakara'] ?? ($data['periode'] === 'matin' ? 30000 : 35000),
                'deplacement_manakara' => $data['parametres']['deplacement_manakara'] ?? 12000,
            ];
        } else {
            // Fallback vers la configuration de la base de données
            $prixConfig = $this->getPrixConfig($data['periode'], 'regional');
        }
        $resultatsVoitures = [];
        $totalGlobal = [
            'passagers_manakara' => 0,
            'montant_brut_total' => 0,
            'deplacement_total' => 0,
            'gasoil_total' => 0,
            'paye_autre_dest_manakara_total_valeur' => 0,
            'montant_a_payer_total' => 0,
        ];

        foreach ($data['voitures'] as $index => $voitureData) {
            $montant_brut = $voitureData['passagers_manakara'] * $prixConfig['manakara'];
            // Si passagers_autre est utilisé, ajoutez son calcul ici
            
            $valeur_paye_autre_manakara = $voitureData['paye_autre_dest_manakara'] * $prixConfig['manakara'];

            $montant_a_payer = $montant_brut - $prixConfig['deplacement_manakara'] - $voitureData['gasoil'] - $valeur_paye_autre_manakara;

            $resultatsVoitures[] = [
                'id' => $index + 1,
                'passagers_manakara' => $voitureData['passagers_manakara'],
                'montant_brut' => $montant_brut,
                'deplacement' => $prixConfig['deplacement_manakara'],
                'gasoil' => $voitureData['gasoil'],
                'paye_autre_dest_manakara' => $voitureData['paye_autre_dest_manakara'],
                'valeur_paye_autre_manakara' => $valeur_paye_autre_manakara,
                'montant_a_payer' => $montant_a_payer,
            ];

            // Agrégation des totaux
            $totalGlobal['passagers_manakara'] += $voitureData['passagers_manakara'];
            $totalGlobal['montant_brut_total'] += $montant_brut;
            $totalGlobal['deplacement_total'] += $prixConfig['deplacement_manakara'];
            $totalGlobal['gasoil_total'] += $voitureData['gasoil'];
            $totalGlobal['paye_autre_dest_manakara_total_valeur'] += $valeur_paye_autre_manakara;
            $totalGlobal['montant_a_payer_total'] += $montant_a_payer;
        }
        
        $nombreVoitures = count($resultatsVoitures);
        $totalGlobal['montant_a_payer_par_voiture_moyenne'] = $nombreVoitures > 0 ? $totalGlobal['montant_a_payer_total'] / $nombreVoitures : 0;

        return response()->json([
            'voitures' => $resultatsVoitures,
            'total_global' => $totalGlobal,
            'nombre_voitures' => $nombreVoitures
        ]);
    }
}
