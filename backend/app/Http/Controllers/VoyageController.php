<?php

namespace App\Http\Controllers;

use App\Models\Voyage;
use App\Models\Place;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class VoyageController extends Controller
{
    public function getVoituresParties()
    {
        $voyages = Voyage::where('status', 'parti')
            ->with('voiture')
            ->get();
        
        return response()->json($voyages->pluck('voiture_id')->toArray());
    }

    public function store(Request $request)
    {
        try {
            // Validation simple de l'ID de la voiture
            $validated = $request->validate([
                'voiture_id' => 'required|integer|exists:voitures,id'
            ]);

            // Vérifier si la voiture est déjà partie
            $existingVoyage = Voyage::where('voiture_id', $validated['voiture_id'])
                ->where('status', 'parti')
                ->first();

            if ($existingVoyage) {
                return response()->json([
                    'message' => 'Cette voiture est déjà partie'
                ], 400);
            }

            // Créer le voyage
            DB::beginTransaction();
            try {
                $voyage = Voyage::create([
                    'voiture_id' => $validated['voiture_id'],
                    'status' => 'parti'
                ]);
                
                DB::commit();
                
                return response()->json([
                    'message' => 'Voyage enregistré avec succès',
                    'data' => $voyage
                ], 201);
                
            } catch (\Exception $e) {
                DB::rollback();
                throw new \Exception('Erreur lors de la création du voyage: ' . $e->getMessage());
            }

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Erreur générale lors de l\'enregistrement: ' . $e->getMessage()
            ], 500);
        }
    }
}
