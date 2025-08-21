<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Voiture;
use App\Models\voitureVip;
use App\Models\Place;
use App\Models\placesVip;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class RechercheController extends Controller
{
    public function rechercheVoitures(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'date_depart' => 'required|date_format:Y-m-d',
            'itineraire' => 'nullable|string|max:255',
            'ville' => 'nullable|string|max:255',
            'type_voiture' => 'nullable|in:normal,vip,tous'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur de validation',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $dateDepart = Carbon::parse($request->date_depart);
            $typeVoiture = $request->input('type_voiture', 'tous');
            $itineraire = $request->input('itineraire');
            $ville = $request->input('ville');

            $resultats = [];

            // Si une ville est spécifiée, obtenir les itinéraires pour cette ville
            $itineraireNames = null;
            if ($ville) {
                // Obtenir les coopératives qui desservent cette ville
                $cooperatives = \App\Models\Cooperative::whereHas('cities', function($query) use ($ville) {
                    $query->where('nom', $ville);
                })->get();
                
                // Obtenir les noms des itinéraires pour ces coopératives
                $cooperativeIds = $cooperatives->pluck('id');
                $itineraires = \App\Models\Itineraire::whereIn('cooperative_id', $cooperativeIds)->get();
                $itineraireNames = $itineraires->pluck('itineraire');
            }

            // Voitures normales (1-16 places)
            if (in_array($typeVoiture, ['tous', 'normal'])) {
                $voituresQuery = Voiture::whereDate('date_depart', $dateDepart)
                    ->when($itineraire, function($query) use ($itineraire) {
                        return $query->where('itineraire', 'LIKE', "%{$itineraire}%");
                    })
                    ->when($itineraireNames, function($query) use ($itineraireNames) {
                        return $query->whereIn('itineraire', $itineraireNames);
                    });
                
                $voitures = $voituresQuery->get();

                foreach ($voitures as $voiture) {
                    $placesData = Place::where('voiture_id', $voiture->id)->get();
                    $resultats[] = $this->formatVoitureResult($voiture, $placesData);
                }
            }

            // Voitures VIP (1-10 places)
            if (in_array($typeVoiture, ['tous', 'vip'])) {
                $voituresVipQuery = VoitureVip::whereDate('date_depart', $dateDepart)
                    ->when($itineraire, function($query) use ($itineraire) {
                        return $query->where('itineraire', 'LIKE', "%{$itineraire}%");
                    })
                    ->when($itineraireNames, function($query) use ($itineraireNames) {
                        return $query->whereIn('itineraire', $itineraireNames);
                    });
                
                $voituresVip = $voituresVipQuery->get();

                foreach ($voituresVip as $voiture) {
                    $placesData = placesVip::where('voiture_id', $voiture->id)->get();
                    $resultats[] = $this->formatVoitureVipResult($voiture, $placesData);
                }
            }

            return response()->json([
                'success' => true,
                'count' => count($resultats),
                'data' => $resultats
            ]);

        } catch (\Exception $e) {
            Log::error('Erreur recherche', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Erreur serveur',
                'error' => env('APP_DEBUG') ? $e->getMessage() : null
            ], 500);
        }
    }

    private function formatVoitureResult($voiture, $placesData)
    {
        $placesOccupees = array_fill(1, 16, false); // Initialise toutes les places comme libres
        
        // Marque les places occupées
        foreach ($placesData as $place) {
            for ($i = 1; $i <= 16; $i++) {
                $placeField = 'place_' . $i;
                if (!empty($place->$placeField)) {
                    $placesOccupees[$i] = true; // La place est occupée
                }
            }
        }

        $placesDisponibles = 0;
        $placesDetails = [];
        
        // Compte les places disponibles
        for ($i = 1; $i <= 16; $i++) {
            if (!$placesOccupees[$i]) {
                $placesDisponibles++;
                $placesDetails[] = [
                    'numero' => $i,
                    'disponible' => true
                ];
            }
        }

        return [
            'id' => $voiture->id,
            'type' => 'normal',
            'marque' => $voiture->marque,
            'modele' => $voiture->modele,
            'itineraire' => $voiture->itineraire,
            'date_depart' => $voiture->date_depart->format('d/m/Y'),
            'heure_depart' => $voiture->heure_depart,
            'capacite_totale' => 16,
            'places_disponibles' => $placesDisponibles,
            'details_places' => $placesDetails
        ];
    }

    private function formatVoitureVipResult($voitureVip, $placesData)
    {
        $placesOccupees = array_fill(1, 10, false); // Initialise toutes les places comme libres
        
        // Marque les places occupées
        foreach ($placesData as $place) {
            for ($i = 1; $i <= 10; $i++) {
                $placeField = 'place_' . $i;
                if (!empty($place->$placeField)) {
                    $placesOccupees[$i] = true; // La place est occupée
                }
            }
        }

        $placesDisponibles = 0;
        $placesDetails = [];
        
        // Compte les places disponibles
        for ($i = 1; $i <= 10; $i++) {
            if (!$placesOccupees[$i]) {
                $placesDisponibles++;
                $placesDetails[] = [
                    'numero' => $i,
                    'disponible' => true
                ];
            }
        }

        return [
            'id' => $voitureVip->id,
            'type' => 'vip',
            'marque' => $voitureVip->marque,
            'modele' => $voitureVip->modele,
            'itineraire' => $voitureVip->itineraire,
            'date_depart' => $voitureVip->date_depart->format('d/m/Y'),
            'heure_depart' => $voitureVip->heure_depart,
            'capacite_totale' => 10,
            'places_disponibles' => $placesDisponibles,
            'details_places' => $placesDetails
        ];
    }
}