<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class LieuController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'lieu' => 'required|string|max:255',
            'voiture_id' => 'required|exists:voitures,id'
        ]);
    
        // Auto-incrément
        $dernierNumero = DB::table('lieux')
            ->where('voiture_id', $validated['voiture_id'])
            ->max('numero') ?? 0;
    
        $lieu = Lieu::create([
            'lieu' => $validated['lieu'],
            'numero' => $dernierNumero + 1,
            'voiture_id' => $validated['voiture_id'],
            'status' => 'libre'
        ]);
    
        return response()->json($lieu, 201);
    }
    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
