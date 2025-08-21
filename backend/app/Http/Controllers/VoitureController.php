<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Voiture;
use App\Models\Place;

/**
 * @OA\Tag(
 *     name="Users",
 *     description="Opérations sur les utilisateurs"
 * )
 */

class VoitureController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    /**
 * @OA\Info(
 *     title="Mon API Laravel",
 *     version="1.0.0",
 *     description="Documentation de mon API"
 * )
 */

/**
 * @OA\Get(
 *     path="/api/users",
 *     summary="Liste des utilisateurs",
 *     tags={"Users"},
 *     @OA\Response(
 *         response=200,
 *         description="Liste des utilisateurs",
 *         @OA\JsonContent(
 *             type="array",
 *             @OA\Items(ref="#/components/schemas/User")
 *         )
 *     )
 * )
 */
    public function index()
    {
        return Voiture::with('places')->get();
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'marque' => 'required|string',
            'modele' => 'required|string',
            'itineraire' => 'required|string',
            'date_depart' => 'required|date',
            'heure_depart' => 'required|date_format:H:i',
            'places'=> 'required|integer',
        ]);

        $voiture = Voiture::create($validated);

        for ($i = 1; $i <= $voiture->capacite; $i++) {
            Place::create([
                'numero' => $i,
                'status' => 'libre',
                'voiture_id' => $voiture->id, // Assure-toi que cette clé étrangère existe
            ]);
        }

        return response()->json($voiture->load('places'), 201);
    }


/** prendre les places dans le voiture */
public function getPlaces($id)
{
    $voiture = Voiture::find($id);

    if (!$voiture) {
        return response()->json(['message' => 'Voiture non trouvée'], 404);
    }

    return response()->json($voiture->places);
}

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $voiture = Voiture::with('places')->findOrFail($id);
        return response()->json($voiture);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $validated = $request->validate([
            'marque' => 'sometimes|required|string',
            'modele' => 'sometimes|required|string',
            'immatriculation' => 'sometimes|required|string|unique:voitures,immatriculation,' . $id,
            'itineraire' => 'sometimes|required|string',
            'date_depart' => 'sometimes|required|date',
            'heure_depart' => 'sometimes|required|date_format:H:i',
            'places' => 'sometimes|required|integer',
        ]);
    
        $voiture = Voiture::findOrFail($id);
        $voiture->update($validated);
    
        return response()->json($voiture->load('places'));
    }
    
    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id) // Retirez le type-hint string
    {
        try {
            $voiture = Voiture::findOrFail($id);
            $voiture->delete();
            
            return response()->json([
                'success' => true,
                'message' => 'Voiture normale supprimée avec succès'
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
