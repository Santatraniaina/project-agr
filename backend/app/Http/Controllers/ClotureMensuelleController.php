<?php

namespace App\Http\Controllers;

use App\Models\ClotureMensuelle;
use App\Models\Depense;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;
// Pour l'export Excel, si vous utilisez Maatwebsite/Laravel-Excel
// use App\Exports\ClotureMensuelleExport;
// use Maatwebsite\Excel\Facades\Excel;

class ClotureMensuelleController extends Controller
{
    public function getClotureData(Request $request, $annee, $mois)
    {
        $validator = Validator::make(['annee' => $annee, 'mois' => $mois], [
            'annee' => 'required|integer|digits:4',
            'mois' => 'required|integer|between:1,12',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            // 1. Solde initial (solde final du mois précédent)
            $dateMoisPrecedent = Carbon::create($annee, $mois, 1)->subMonth();
            $clotureMoisPrecedent = ClotureMensuelle::where('annee', $dateMoisPrecedent->year)
                                                   ->where('mois', $dateMoisPrecedent->month)
                                                   ->first();
            
            $soldeInitial = $clotureMoisPrecedent ? $clotureMoisPrecedent->solde_final : 0;

            // 2. Total des dépenses du mois sélectionné
            $totalDepensesMois = Depense::whereYear('date', $annee)
                                        ->whereMonth('date', $mois)
                                        ->where('enabled', true)
                                        ->sum('montant');
            
            // 3. Solde final (calculé ou depuis la DB si déjà clôturé)
            $clotureActuelle = ClotureMensuelle::where('annee', $annee)
                                              ->where('mois', $mois)
                                              ->first();

            if ($clotureActuelle) {
                $soldeFinal = $clotureActuelle->solde_final;
                // On pourrait aussi retourner les autres infos de $clotureActuelle
            } else {
                $soldeFinal = $soldeInitial - $totalDepensesMois;
            }

            // 4. Dépenses du mois
            $depensesDuMois = Depense::with('categorieDepense')
                                    ->whereYear('date', $annee)
                                    ->whereMonth('date', $mois)
                                    ->where('enabled', true)
                                    ->orderBy('date', 'asc')
                                    ->get();

            return response()->json([
                'solde_initial' => (float) $soldeInitial,
                'total_depenses' => (float) $totalDepensesMois,
                'solde_final' => (float) $soldeFinal, // Ce sera le solde calculé si non clôturé, ou le solde enregistré si clôturé
                'depenses' => $depensesDuMois,
                'cloture_existante' => $clotureActuelle ? $clotureActuelle : null,
            ]);

        } catch (\Illuminate\Database\QueryException $e) {
            Log::error("Erreur de base de données dans getClotureData pour $annee-$mois: " . $e->getMessage());
            return response()->json(['error' => 'Erreur de base de données lors de la récupération des données de clôture.', 'details' => $e->getMessage()], 500);
        } catch (\Exception $e) {
            Log::error("Erreur inattendue dans getClotureData pour $annee-$mois: " . $e->getMessage());
            return response()->json(['error' => 'Une erreur est survenue lors de la récupération des données de clôture.', 'details' => $e->getMessage()], 500);
        }
    }

    public function cloturerMois(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'annee' => 'required|integer|digits:4',
            'mois' => 'required|integer|between:1,12',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $annee = $request->annee;
        $mois = $request->mois;

        // Vérifier si déjà clôturé
        $clotureExistante = ClotureMensuelle::where('annee', $annee)->where('mois', $mois)->first();
        if ($clotureExistante) {
            return response()->json(['message' => 'Ce mois est déjà clôturé.', 'data' => $clotureExistante], 409);
        }

        // Calculer les données pour la clôture
        $dateMoisPrecedent = Carbon::create($annee, $mois, 1)->subMonth();
        $clotureMoisPrecedent = ClotureMensuelle::where('annee', $dateMoisPrecedent->year)
                                               ->where('mois', $dateMoisPrecedent->month)
                                               ->first();
        $soldeInitial = $clotureMoisPrecedent ? $clotureMoisPrecedent->solde_final : 0;

        $totalDepensesMois = Depense::whereYear('date', $annee)
                                    ->whereMonth('date', $mois)
                                    ->where('enabled', true)
                                    ->sum('montant');
        
        $soldeFinal = $soldeInitial - $totalDepensesMois;

        $cloture = ClotureMensuelle::create([
            'annee' => $annee,
            'mois' => $mois,
            'solde_initial' => $soldeInitial,
            'total_depenses' => $totalDepensesMois,
            'solde_final' => $soldeFinal,
            // 'user_id' => Auth::id(), // Si authentification
            'user_id' => 1, // Temporaire
            'date_cloture' => now(),
        ]);

        return response()->json(['message' => 'Mois clôturé avec succès.', 'data' => $cloture], 201);
    }

    public function exportExcel(Request $request, $annee, $mois)
    {
        $validator = Validator::make(['annee' => $annee, 'mois' => $mois], [
            'annee' => 'required|integer|digits:4',
            'mois' => 'required|integer|between:1,12',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            // Récupérer les données comme dans getClotureData
            $dateMoisPrecedent = Carbon::create($annee, $mois, 1)->subMonth();
            $clotureMoisPrecedent = ClotureMensuelle::where('annee', $dateMoisPrecedent->year)
                                                   ->where('mois', $dateMoisPrecedent->month)
                                                   ->first();
            
            $soldeInitial = $clotureMoisPrecedent ? $clotureMoisPrecedent->solde_final : 0;
            $totalDepensesMois = Depense::whereYear('date', $annee)
                                        ->whereMonth('date', $mois)
                                        ->where('enabled', true)
                                        ->sum('montant');
            
            $clotureActuelle = ClotureMensuelle::where('annee', $annee)
                                              ->where('mois', $mois)
                                              ->first();

            $soldeFinal = $clotureActuelle ? $clotureActuelle->solde_final : ($soldeInitial - $totalDepensesMois);

            $depensesDuMois = Depense::with('categorieDepense')
                                    ->whereYear('date', $annee)
                                    ->whereMonth('date', $mois)
                                    ->where('enabled', true)
                                    ->orderBy('date', 'asc')
                                    ->get();

            // Créer un CSV simple pour l'export (alternative à Excel)
            $csvData = [];
            $csvData[] = ['CLÔTURE MENSUELLE - ' . $mois . '/' . $annee];
            $csvData[] = [''];
            $csvData[] = ['RÉSUMÉ'];
            $csvData[] = ['Solde Initial', number_format($soldeInitial, 2) . ' Ar'];
            $csvData[] = ['Total Dépenses', number_format($totalDepensesMois, 2) . ' Ar'];
            $csvData[] = ['Solde Final', number_format($soldeFinal, 2) . ' Ar'];
            $csvData[] = [''];
            $csvData[] = ['DÉTAIL DES DÉPENSES'];
            $csvData[] = ['Date', 'Catégorie', 'Montant (Ar)', 'Commentaire'];

            foreach ($depensesDuMois as $depense) {
                $csvData[] = [
                    $depense->date,
                    $depense->categorieDepense->nom ?? 'N/A',
                    number_format($depense->montant, 2),
                    $depense->commentaire ?? ''
                ];
            }

            // Générer le CSV
            $filename = "cloture_{$annee}_{$mois}.csv";
            $handle = fopen('php://temp', 'w+');
            
            foreach ($csvData as $row) {
                fputcsv($handle, $row, ';'); // Utiliser ; comme séparateur pour Excel français
            }
            
            rewind($handle);
            $csvContent = stream_get_contents($handle);
            fclose($handle);

            return response($csvContent)
                ->header('Content-Type', 'text/csv; charset=UTF-8')
                ->header('Content-Disposition', 'attachment; filename="' . $filename . '"')
                ->header('Cache-Control', 'no-cache, no-store, must-revalidate')
                ->header('Pragma', 'no-cache')
                ->header('Expires', '0');

        } catch (\Exception $e) {
            Log::error("Erreur export Excel pour $annee-$mois: " . $e->getMessage());
            return response()->json(['error' => 'Erreur lors de l\'export.'], 500);
        }
    }

    public function exportPdf(Request $request, $annee, $mois)
    {
        // Implémentation similaire mais pour PDF
        // Pour l'instant, retourner la même chose qu'Excel
        return $this->exportExcel($request, $annee, $mois);
    }
}
