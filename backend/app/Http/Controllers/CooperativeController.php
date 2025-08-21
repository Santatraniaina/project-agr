<?php

namespace App\Http\Controllers;

use App\Models\Cooperative;
use App\Models\Ville;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class CooperativeController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $cooperatives = Cooperative::with('cities')->get();
        return response()->json($cooperatives);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'nom' => 'required|string|max:255',
            'marque' => 'required|string|max:255',
            'modele' => 'required|string|max:255',
            'logo' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $cooperative = Cooperative::create($request->all());
        return response()->json($cooperative, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Cooperative $cooperative)
    {
        $cooperative->load('cities');
        return response()->json($cooperative);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Cooperative $cooperative)
    {
        $validator = Validator::make($request->all(), [
            'nom' => 'required|string|max:255',
            'marque' => 'required|string|max:255',
            'modele' => 'required|string|max:255',
            'logo' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $cooperative->update($request->all());
        return response()->json($cooperative);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Cooperative $cooperative)
    {
        $cooperative->delete();
        return response()->json(null, 204);
    }

    /**
     * Add a city to the cooperative.
     */
    public function addCity(Request $request, Cooperative $cooperative)
    {
        $validator = Validator::make($request->all(), [
            'ville_id' => 'required|exists:villes,id',
            'is_destination' => 'boolean'
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $cooperative->cities()->attach($request->ville_id, [
            'is_destination' => $request->is_destination ?? false
        ]);

        return response()->json(['message' => 'City added to cooperative successfully']);
    }

    /**
     * Remove a city from the cooperative.
     */
    public function removeCity(Cooperative $cooperative, Ville $ville)
    {
        $cooperative->cities()->detach($ville->id);
        return response()->json(['message' => 'City removed from cooperative successfully']);
    }

    /**
     * Get cities for a cooperative.
     */
    public function getCities(Cooperative $cooperative)
    {
        $cities = $cooperative->cities;
        return response()->json($cities);
    }

    /**
     * Update city configuration for a cooperative.
     */
    public function updateCityConfiguration(Request $request, Cooperative $cooperative)
    {
        $validator = Validator::make($request->all(), [
            'cities' => 'array',
            'cities.*.ville_id' => 'required|exists:villes,id',
            'cities.*.is_destination' => 'boolean'
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        // Sync cities with their destination status
        $cityData = [];
        foreach ($request->cities as $city) {
            $cityData[$city['ville_id']] = ['is_destination' => $city['is_destination'] ?? false];
        }

        $cooperative->cities()->sync($cityData);
        return response()->json(['message' => 'City configuration updated successfully']);
    }
}