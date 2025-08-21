<?php

namespace App\Http\Controllers;

use App\Models\Client;
use App\Models\Place;
use App\Models\Voiture;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Carbon\Carbon;

class ClientController extends Controller
{
    /**
     * Attribuer des places à un client
     */
    public function store (Request $request)
    {
        try {
            // Exemple d'extraction des données du payload
            $clientData = $request->input('client');
            $attributionData = $request->input('attribution');
            $metadata = $request->input('metadata');
    
            // Vérification rapide
            \Log::info($clientData);
            \Log::info($attributionData);
    
            // Sauvegarde du client
            $client = Client::create([
                'nom' => $clientData['nom'],
                'contact' => $clientData['contact'],
            ]);
    
            // Créer les places attribuées (si tu as un modèle Attribution ou Reservation)
            foreach ($attributionData['places'] as $place) {
                Place::create([
                    'client_id' => $client->id,
                    'voiture_id' => $attributionData['voiture_id'],
                    'numero' => $place['numero'],
                    'status' => $place['status'],
                    'date_attribution' => $attributionData['date_attribution'],
                ]);
            }
    
            return response()->json(['message' => 'Attribution réussie'], 201);
        } catch (\Exception $e) {
            \Log::error("Erreur lors de l'attribution des places : " . $e->getMessage());
            return response()->json(['error' => 'Erreur interne du serveur'], 500);
        }
    }
    
    /**
     * Liste des places disponibles (non attribuées aujourd'hui)
     */
    public function show($id)
    {
        $client = Client::with('attributions')->findOrFail($id);
    
        return response()->json([
            'nom' => $client->nom,
            'contact' => $client->contact,
            'attributions' => $client->attributions
        ]);
    }

    /**
     * Annuler une attribution
     */
    public function cancel($clientId)
    {
        $client = Client::findOrFail($clientId);

        DB::transaction(function () use ($client) {
            // Supprimer les attributions du jour
            $client->places()
                ->wherePivot('date_attribution', Carbon::today())
                ->detach();

            // Mettre à jour places_attribuees
            $client->update([
                'places_attribuees' => array_diff(
                    $client->places_attribuees ?? [],
                    $client->places()->pluck('id')->toArray()
                )
            ]);
        });

        return response()->json([
            'success' => true,
            'message' => 'Attribution annulée'
        ]);
    }
}