<?php

namespace App\Http\Controllers;

use App\Models\Place;
use App\Models\Voiture;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class PlaceController extends Controller
{
    /**
     * Récupère les places d'une voiture
     * 
     * @param int $voitureId
     * @return \Illuminate\Http\JsonResponse
     */
    public function index($voitureId)
    {
        // Validation
        $validator = Validator::make(['voiture_id' => $voitureId], [
            'voiture_id' => 'required|integer|exists:voitures,id'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'ID de voiture invalide',
                'errors' => $validator->errors()
            ], 400);
        }

        // Récupérer tous les enregistrements pour cette voiture
        $records = Place::where('voiture_id', $voitureId)->get();

        if ($records->isEmpty()) {
            // Toutes les places sont libres
            $emptyPlaces = ['voiture_id' => (int)$voitureId];
            for ($i = 1; $i <= 16; $i++) {
                $emptyPlaces['place_' . $i] = false;
            }

            return response()->json([
                'success' => true,
                'message' => 'Aucune réservation - toutes les places sont libres',
                'data' => $emptyPlaces
            ]);
        }

        // Fusionner les données
        $merged = ['voiture_id' => (int)$voitureId];
        $details = []; // Pour associer nom/contact à chaque place occupée

        for ($i = 1; $i <= 16; $i++) {
            $merged['place_'.$i] = false; // Par défaut libre
        }

        foreach ($records as $record) {
            for ($i = 1; $i <= 16; $i++) {
                if ($record->{'place_' . $i}) {
                    $merged['place_' . $i] = true;
                    $details['place_' . $i] = [
                        'nom' => $record->nom,
                        'contact' => $record->contact,
                        'arret' => $record->arret,
                        'payment_type' => $record->payment_type,
                        'mobile_money_operator' => $record->mobile_money_operator,
                        'date_attribution' => $record->created_at->toDateTimeString(),
                        'statut_paiement' => $record->statut_paiement ?? null
                    ];
                }
            }
        }

        // Retour avec les détails
        return response()->json([
            'success' => true,
            'message' => 'Places fusionnées récupérées',
            'data' => $merged,
            'details' => $details
        ]);
    }

    /**
     * Attribue des places à une voiture
     * 
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        Log::info('Début attribution places', ['request' => $request->all()]);
    
        $validated = $request->validate([
            'voiture_id' => 'required|integer|exists:voitures,id',
            'places' => 'required|array|min:1',
            'places.*' => 'integer|between:1,16',
            'nom' => 'required|string|max:255',
            'contact' => 'required|string|max:255',
            'arret' => 'nullable|string|max:255',
            'payment_type' => 'required|string|in:cash,mobile_money',
            'mobile_money_operator' => 'nullable|string|in:orange,mvola,airtel|required_if:payment_type,mobile_money',
        ]);
    
        DB::beginTransaction();
        try {
            Log::info('Vérification places occupées pour cette voiture');
            // Vérifier si les places sont déjà occupées pour cette voiture
            $existingPlaces = Place::where('voiture_id', $validated['voiture_id'])
                                  ->where(function($query) use ($validated) {
                                      foreach ($validated['places'] as $placeNum) {
                                          $query->orWhere('place_'.$placeNum, true);
                                      }
                                  })
                                  ->exists();
    
            if ($existingPlaces) {
                DB::rollBack();
                Log::warning('Places déjà occupées pour cette voiture');
                return response()->json([
                    'success' => false,
                    'message' => 'Une ou plusieurs places sont déjà occupées pour cette voiture',
                ], 409);
            }
    
            Log::info('Préparation des données pour la création');
            $placeData = [
                'voiture_id' => $validated['voiture_id'],
                'nom' => $validated['nom'],
                'contact' => $validated['contact'],
                'arret' => $validated['arret'] ?? null,
                'payment_type' => $validated['payment_type'],
                'mobile_money_operator' => $validated['mobile_money_operator'] ?? null,
                // Le statut_paiement utilisera sa valeur par défaut si non fourni
            ];

            // Initialiser toutes les places à false
            for ($i = 1; $i <= 16; $i++) {
                $placeData['place_'.$i] = false;
            }

            // Marquer les places sélectionnées comme true
            foreach ($validated['places'] as $placeNum) {
                $placeData['place_'.$placeNum] = true;
            }
    
            $placeRecord = Place::create($placeData);
            DB::commit();
    
            Log::info('Attribution réussie');

            return response()->json([
                'success' => true,
                'message' => 'Attribution réussie',
                'data' => $placeRecord,
                'reserved_places' => $validated['places'], // Liste des places réservées
                'timestamp' => now()->toDateTimeString() // Pour le debug
            ], 201);
    
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Erreur attribution places', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Erreur serveur',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Libère des places
     * 
     * @param \Illuminate\Http\Request $request
     * @param int $voitureId
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, $voitureId)
    {
        // Validation des données
        $validator = Validator::make(array_merge($request->all(), ['voiture_id' => $voitureId]), [
            'voiture_id' => 'required|integer|exists:voitures,id',
            'places' => 'required|array|min:1',
            'places.*' => 'integer|between:1,16',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Données invalides',
                'errors' => $validator->errors()
            ], 400);
        }

        try {
            // Trouver l'enregistrement des places
            $placeRecord = Place::where('voiture_id', $voitureId)->first();

            if (!$placeRecord) {
                return response()->json([
                    'success' => false,
                    'message' => 'Aucune place trouvée pour cette voiture'
                ], 404);
            }

            // Vérifier si les places sont bien occupées
            $placesLibres = [];
            foreach ($request->places as $placeNum) {
                if (!$placeRecord->{'place_'.$placeNum}) {
                    $placesLibres[] = $placeNum;
                }
            }

            if (!empty($placesLibres)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Certaines places sont déjà libres',
                    'places_libres' => $placesLibres
                ], 409);
            }

            // Libérer les places
            foreach ($request->places as $placeNum) {
                $placeRecord->{'place_'.$placeNum} = false;
            }

            $placeRecord->save();

            return response()->json([
                'success' => true,
                'message' => 'Places libérées avec succès',
                'data' => $placeRecord
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la libération des places',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Récupère toutes les réservations
     * 
     * @return \Illuminate\Http\JsonResponse
     */
    public function getAllReservations()
    {
        try {
            $reservations = Place::with('voiture')->orderByDesc('created_at')->get();

            return response()->json([
                'success' => true,
                'message' => 'Réservations récupérées avec succès',
                'data' => $reservations
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des réservations',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Confirme le paiement pour une réservation.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function confirmPayment(Request $request, $id)
    {
        try {
            $place = Place::find($id);

            if (!$place) {
                return response()->json([
                    'success' => false,
                    'message' => 'Réservation non trouvée.'
                ], 404);
            }

            $place->statut_paiement = 'P';
            $place->save();

            return response()->json([
                'success' => true,
                'message' => 'Paiement confirmé avec succès.',
                'data' => $place
            ]);
        } catch (\Exception $e) {
            Log::error('Erreur lors de la confirmation du paiement: ' . $e->getMessage());
            return response()->json([
                'success' => false, 
                'message' => 'Erreur serveur lors de la confirmation du paiement.'
            ], 500);
        }
    }

    /**
     * Libère des places (alternative)
     * 
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function freePlaces(Request $request)
    {
        Log::info('Requête reçue pour freePlaces:', $request->all());
    
        DB::beginTransaction();
        try {
            $validated = $request->validate([
                'voiture_id' => 'required|integer|exists:voitures,id',
                'places' => 'required|array',
                'places.*' => 'integer|min:1|max:16'
            ]);
    
            Log::info('Données validées:', $validated);

            $results = [];
            
            foreach ($validated['places'] as $placeNumber) {
                $place = Place::where('voiture_id', $validated['voiture_id'])
                            ->where('place_' . $placeNumber, true)
                            ->first();

                if ($place) {
                    $place->delete();
                    
                    $results[] = [
                        'place_num' => $placeNumber,
                        'success' => true
                    ];
                } else {
                    $results[] = [
                        'place_num' => $placeNumber,
                        'success' => false,
                        'message' => 'Place non trouvée ou déjà libérée'
                    ];
                }
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Opération de libération terminée',
                'results' => $results
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Erreur serveur',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
