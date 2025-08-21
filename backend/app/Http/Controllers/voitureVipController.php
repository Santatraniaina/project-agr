<?php

namespace App\Http\Controllers;

use App\Models\voitureVip;
use App\Models\placesVip;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class VoitureVipController extends Controller
{


    public function indexVip()
    {
        return voitureVip::with('places')->get();
    }


    public function storeVip(Request $request)
    { 
        $validated = $request->validate([
            'marque' => 'required|string',
            'modele' => 'required|string',
            'itineraire' => 'required|string',
            'date_depart' => 'required|date',
            'heure_depart' => 'required|date_format:H:i',
            'places'=> 'required|integer',
        ]);

        $voitureVip = VoitureVip::create($validated);

        for ($i = 1; $i <= $voitureVip->places; $i++) {
            placesVip::create([
                'numero' => $i,
                'status' => 'libre',
                'voiture_id' => $voitureVip->id, // Assure-toi que cette clé étrangère existe
            ]);
        }

        return response()->json($voitureVip->load('places'), 201);
    }

    public function getPlacesVip($id)
{
    $voitureVip = VoitureVip::find($id);

    if (!$voitureVip) {
        return response()->json(['message' => 'Voiture non trouvée'], 404);
    }

    return response()->json($voitureVip->places);
}

    /**
     * Display the specified resource.
     */
    public function showVip(string $id)
    {
        $voitureVip = voitureVip::with('places')->findOrFail($id);
        return response()->json($voitureVip);
    }

    /**
     * Update the specified resource in storage.
     */
    public function updateVip(Request $request, string $id)
    {
        $validated = $request->validate([
            'marque' => 'sometimes|required|string',
            'modele' => 'sometimes|required|string',
            'immatriculation' => 'sometimes|required|string|unique:voiture_vips,immatriculation,' . $id,
            'itineraire' => 'sometimes|required|string',
            'date_depart' => 'sometimes|required|date',
            'heure_depart' => 'sometimes|required|date_format:H:i',
            'places' => 'sometimes|required|integer',
        ]);
    
        $voitureVip = voitureVip::findOrFail($id);
        $voitureVip->update($validated);
    
        return response()->json($voitureVip->load('places'));
    }
    
    /**
     * Remove the specified resource from storage.
     */
    public function destroyVip($id) // Retirez le type-hint string
    {
        try {
            $voiture = voitureVip::findOrFail($id);
            $voiture->delete();
            
            return response()->json([
                'success' => true,
                'message' => 'Voiture VIP supprimée avec succès'
            ], 200);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la suppression',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}




