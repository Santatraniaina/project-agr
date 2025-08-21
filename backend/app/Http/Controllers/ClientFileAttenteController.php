<?php

namespace App\Http\Controllers;

use App\Models\FileAttente;
use Illuminate\Http\Request;

class ClientFileAttenteController extends Controller
{
    public function index()
    {
        $clients = FileAttente::orderBy('created_at', 'desc')->get();
        return response()->json($clients);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nom' => 'required|string|max:255',
            'nbre_place' => 'required|integer|min:1',
            'contact' => 'required|string|max:255',
            'date' => 'required|date',
            'heure' => 'required'
        ]);

        $client = FileAttente::create($validated);
        return response()->json($client, 201);
    }

    public function show(FileAttente $fileAttente)
    {
        return response()->json($fileAttente);
    }

    public function update(Request $request, FileAttente $fileAttente)
    {
        $validated = $request->validate([
            'nom' => 'required|string|max:255',
            'nbre_place' => 'required|integer|min:1',
            'contact' => 'required|string|max:255',
            'date' => 'required|date',
            'heure' => 'required'
        ]);

        $fileAttente->update($validated);
        return response()->json($fileAttente);
    }

    public function destroy(FileAttente $fileAttente)
    {
        $fileAttente->delete();
        return response()->json(null, 204);
    }
}