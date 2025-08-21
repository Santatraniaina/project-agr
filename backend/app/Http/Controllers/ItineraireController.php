<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Itineraire;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ItineraireController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Itineraire::query();
        
        // Filter by cooperative_id if provided
        if ($request->has('cooperative_id')) {
            $query->where('cooperative_id', $request->cooperative_id);
        }
        
        $itineraires = $query->get();
        return response()->json($itineraires);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'nom' => 'required|string|max:255',
            'depart' => 'required|string|max:255',
            'itineraire' => 'required|string'
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 400);
        }

        $itineraire = Itineraire::create($request->all());
        return response()->json($itineraire, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Itineraire $itineraire)
    {
        return response()->json($itineraire);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Itineraire $itineraire)
    {
        $validator = Validator::make($request->all(), [
            'nom' => 'sometimes|required|string|max:255',
            'depart' => 'sometimes|required|string|max:255',
            'itineraire' => 'sometimes|required|string'
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 400);
        }

        $itineraire->update($request->all());
        return response()->json($itineraire);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Itineraire $itineraire)
    {
        $itineraire->delete();
        return response()->json(null, 204);
    }
}