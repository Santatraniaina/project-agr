<?php

namespace App\Http\Controllers;

use App\Models\prix;
use App\Models\Itineraire;
use Illuminate\Http\Request;

class PrixController extends Controller
{
    public function index(Request $request)
    {
        $query = Prix::with('itineraire');
        
        if ($request->has('periode')) {
            if ($request->periode === 'matin') {
                $query->where('prix_matin', '>', 0);
            } elseif ($request->periode === 'soir') {
                $query->where('prix_soir', '>', 0);
            }
        }
        
        return $query->get();
    }

 public function store(Request $request)
{
    $validated = $request->validate([
        'prix_matin' => 'required|numeric|min:0',
        'prix_soir' => 'required|numeric|min:0',
        'arret' => 'required|string|max:255',
        'destination' => 'required|string|max:255',
        'itineraire_id' => 'required|exists:itineraires,id'
    ]);

    return response()->json(Prix::create($validated), 201);
}

    public function show(Prix $prix)
    {
        return $prix->load('itineraire');
    }

    public function update(Request $request, Prix $prix)
    {
        $validated = $request->validate([
            'prix_matin' => 'sometimes|numeric|min:0',
            'prix_soir' => 'sometimes|numeric|min:0',
            'arret' => 'sometimes|string|max:255',
            'destination' => 'sometimes|string|max:255',
            'itineraire_id' => 'sometimes|exists:itineraires,id'
        ]);

        $prix->update($validated);
        return $prix;
    }

    public function destroy(Prix $prix)
    {
        $prix->delete();
        return response()->noContent();
    }

    public function byItineraire(Itineraire $itineraire)
    {
        return $itineraire->prix;
    }
}