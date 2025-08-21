<?php

namespace App\Http\Controllers;

use App\Models\Vehicule;
use Illuminate\Http\Request;

class VehiculeController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $vehicules = Vehicule::all();
        return response()->json($vehicules);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'numero_matricule' => 'required|string|unique:vehicules',
            'proprietaire_nom' => 'required|string',
            'proprietaire_contact' => 'required|string',
            'chauffeur_nom' => 'required|string',
            'chauffeur_contact' => 'required|string',
        ]);

        $vehicule = Vehicule::create($validated);
        return response()->json($vehicule, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $vehicule = Vehicule::findOrFail($id);
        return response()->json($vehicule);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $vehicule = Vehicule::findOrFail($id);

        $validated = $request->validate([
            'numero_matricule' => 'sometimes|string|unique:vehicules,numero_matricule,'.$vehicule->id,
            'proprietaire_nom' => 'sometimes|string',
            'proprietaire_contact' => 'sometimes|string',
            'chauffeur_nom' => 'sometimes|string',
            'chauffeur_contact' => 'sometimes|string',
        ]);

        $vehicule->update($validated);
        return response()->json($vehicule);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $vehicule = Vehicule::findOrFail($id);
        $vehicule->delete();
        return response()->json(null, 204);
    }
}