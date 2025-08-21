<?php
// app/Http/Controllers/FileAttenteVipController.php
namespace App\Http\Controllers;

use App\Models\FileAttenteVip;
use Illuminate\Http\Request;

class FileAttenteVipController extends Controller
{
    public function index()
    {
        return response()->json(FileAttenteVip::all());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nom' => 'required|string|max:255',
            'nbre_place' => 'required|integer|min:1',
            'contact' => 'required|string|max:255',
            'date' => 'required|date',
            'heure' => 'required|date_format:H:i'
        ]);

        $client = FileAttenteVip::create($validated);

        return response()->json($client, 201);
    }

    public function show(FileAttenteVip $fileAttenteVip)
    {
        return response()->json($fileAttenteVip);
    }

    public function update(Request $request, FileAttenteVip $fileAttenteVip)
    {
        $validated = $request->validate([
            'nom' => 'sometimes|string|max:255',
            'nbre_place' => 'sometimes|integer|min:1',
            'contact' => 'sometimes|string|max:255',
            'date' => 'sometimes|date',
            'heure' => 'sometimes|date_format:H:i'
        ]);

        $fileAttenteVip->update($validated);

        return response()->json($fileAttenteVip);
    }

    public function destroy(FileAttenteVip $fileAttenteVip)
    {
        $fileAttenteVip->delete();

        return response()->json(null, 204);
    }
}