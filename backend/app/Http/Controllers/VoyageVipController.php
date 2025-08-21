<?php

namespace App\Http\Controllers;

use App\Models\VoyageVip;
use App\Models\VoitureVip;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class VoyageVipController extends Controller
{
    public function getVoituresVipsParties()
    {
        $voyagesVips = VoyageVip::where('status', 'parti')
            ->with('voitureVip')
            ->get();
        
        return response()->json($voyagesVips->pluck('voiture_id')->toArray());
    }

    public function store(Request $request)
    {
        try {
            // Validation de l'ID de la voiture VIP
            $validated = $request->validate([
                'voiture_id' => 'required|integer|exists:voiture_vips,id' // Notez la table 'voiture_vips'
            ]);

            // Vérifier si la voiture VIP est déjà partie
            $existingVoyageVip = VoyageVip::where('voiture_id', $validated['voiture_id'])
                ->where('status', 'parti')
                ->first();

            if ($existingVoyageVip) {
                return response()->json([
                    'message' => 'Cette voiture VIP est déjà partie'
                ], 400);
            }

            // Créer le voyage VIP
            DB::beginTransaction();
            try {
                $voyageVip = VoyageVip::create([
                    'voiture_id' => $validated['voiture_id'],
                    'status' => 'parti'
                ]);
                
                DB::commit();
                
                return response()->json([
                    'message' => 'Voyage VIP enregistré avec succès',
                    'data' => $voyageVip
                ], 201);
                
            } catch (\Exception $e) {
                DB::rollback();
                throw new \Exception('Erreur lors de la création du voyage VIP: ' . $e->getMessage());
            }

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Erreur générale lors de l\'enregistrement VIP: ' . $e->getMessage()
            ], 500);
        }
    }

    // Ajoutez d'autres méthodes spécifiques aux VIP si nécessaire
    public function getVoyagesVipsActifs()
    {
        return VoyageVip::with('voitureVip')
            ->where('status', 'parti')
            ->get();
    }
}