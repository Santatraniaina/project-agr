<?php

namespace App\Http\Controllers;

use App\Models\Ville;
use Illuminate\Http\Request;

class VilleController extends Controller
{
    public function index(Request $request)
    {
        $query = Ville::query();
        
        // Filter by enabled status if provided
        if ($request->has('enabled')) {
            $enabled = filter_var($request->enabled, FILTER_VALIDATE_BOOLEAN);
            $query->where('enable', $enabled);
        }
        
        $villes = $query->get();
        return response()->json($villes);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nom' => 'required|string|max:255',
            'numero_route' => 'nullable|string|max:50',
            'enable' => 'boolean'
        ]);

        $ville = Ville::create($validated);
        return response()->json($ville, 201);
    }

    public function show($id)
    {
        $ville = Ville::findOrFail($id);
        return response()->json($ville);
    }

    public function update(Request $request, $id)
    {
        $ville = Ville::findOrFail($id);

        $validated = $request->validate([
            'nom' => 'sometimes|required|string|max:255',
            'numero_route' => 'nullable|string|max:50',
            'enable' => 'sometimes|boolean'
        ]);

        $ville->update($validated);
        return response()->json($ville);
    }

    public function destroy($id)
    {
        Ville::findOrFail($id)->delete();
        return response()->json(null, 204);
    }
}