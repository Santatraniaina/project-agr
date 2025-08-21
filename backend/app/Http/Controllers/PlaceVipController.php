<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\PlacesVip;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log; // Ajout pour le logging
use Illuminate\Support\Facades\DB; // Ajout pour les transactions
// Assurez-vous que le modèle voitureVip est correctement importé si vous l'utilisez dans une relation (c'est le cas pour la validation `exists`)
use App\Models\voitureVip; 

class PlaceVipController extends Controller
{
    /**
     * Récupère les places VIP pour une voiture spécifique.
     *
     * @param  int  $voitureId
     * @return \Illuminate\Http\JsonResponse
     */
    public function indexVip($voitureId)
    {
        // Validation de l'ID et vérification de l'existence de la voiture VIP
        $validator = Validator::make(['voiture_id' => $voitureId], ['voiture_id' => 'required|integer|exists:voiture_vips,id']);
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'ID de voiture VIP invalide ou non existante.',
                'errors' => $validator->errors()
            ], 400);
        }

        $voitureId = (int)$voitureId;

        // Récupérer tous les enregistrements de places VIP pour cette voiture
        // Note: Chaque enregistrement dans places_vips représente une réservation,
        // potentiellement pour plusieurs places, mais avec un seul nom/contact.
        $records = PlacesVip::where('voiture_id', $voitureId)->get();

        $response = [
            'success' => true,
            'voiture_id' => $voitureId,
            // Les champs place_x seront ajoutés dynamiquement pour indiquer l'état (occupé/libre)
            'details' => [] // Détails (nom, contact, etc.) pour chaque place occupée
        ];

        // Initialiser toutes les places à false (libre)
        for ($i = 1; $i <= 10; $i++) { // Supposant 10 places VIP
            $response['place_' . $i] = false;
        }

        // Remplir avec les données existantes (marquer les places comme occupées et ajouter les détails)
        foreach ($records as $record) {
            for ($i = 1; $i <= 10; $i++) { // Supposant 10 places VIP
                $field = 'place_' . $i;
                if ($record->$field) {
                    $response[$field] = true; // Marque la place comme occupée
                    $response['details'][$field] = [
                        'id' => $record->id, // Ajout de l'ID de l'enregistrement pour la confirmation de paiement
                        'nom' => $record->nom,
                        'contact' => $record->contact,
                        'date_attribution' => $record->created_at->toDateTimeString(),
                        'statut_paiement' => $record->statut_paiement ?? 'a_encaisser' // Utilise la valeur par défaut si non définie
                    ];
                }
            }
        }

        return response()->json($response);
    }


    /**
     * Attribue des places VIP à une voiture.
     * Crée un nouvel enregistrement pour chaque réservation.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        // Debug complet des données reçues
        Log::info('PlaceVipController@store: Données brutes reçues:', [
            'headers' => $request->headers->all(),
            'content' => $request->getContent(),
            'json_decoded' => json_decode($request->getContent(), true)
        ]);

        // Validation des données reçues
        $validator = Validator::make($request->all(), [
            'voiture_id' => 'required|integer|exists:voiture_vips,id', // Doit être un entier et exister dans la table voiture_vips
            'PlaceVips'    => 'required|array|min:1', // Attend 'PlaceVips' comme envoyé par le frontend
            'PlaceVips.*'  => 'required|integer|min:1|max:10', // Chaque place doit être un entier entre 1 et 10
            'nom'          => 'required|string|max:255',
            'contact'      => 'required|string|max:255'
        ]);

        if ($validator->fails()) {
            Log::error('PlaceVipController@store: Échec validation:', [
                'errors' => $validator->errors()->toArray(),
                'raw_input' => $request->getContent()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
                'received_data' => $request->all()
            ], 422);
        }

        // Données validées (les types sont déjà gérés par les règles 'integer')
        $validated = $validator->validated();

        Log::info('PlaceVipController@store: Données validées:', $validated);

        // Utilisation des transactions pour assurer l'atomicité
        DB::beginTransaction();
        try {
            // Toujours créer une nouvelle entrée pour chaque réservation de place(s) VIP
            $PlaceVipRecord = new PlacesVip();
            $PlaceVipRecord->voiture_id = $validated['voiture_id'];
            
            // Initialisation explicite des champs de place à false
            for ($i = 1; $i <= 10; $i++) { // Max 10 places VIP
                $PlaceVipRecord->{'place_'.$i} = false;
            }
            // Le champ 'statut_paiement' utilisera sa valeur par défaut 'a_encaisser' définie dans la migration si non fourni ici.
    
            // Vérifier si les places sélectionnées sont déjà occupées pour cette voiture
            $existingPlaces = PlacesVip::where('voiture_id', $validated['voiture_id'])
                ->where(function($query) use ($validated) {
                    foreach ($validated['PlaceVips'] as $placeNum) { // Utilise 'PlaceVips'
                        $query->orWhere('place_' . $placeNum, true);
                    }
                })->exists();
    
            if ($existingPlaces) {
                DB::rollBack();
                Log::warning('PlaceVipController@store: Places VIP déjà occupées.');
                return response()->json([
                    'success' => false,
                    'message' => 'Une ou plusieurs places VIP sont déjà occupées',
                ], 409);
            }
    
            // Remplir les champs nom et contact
            $PlaceVipRecord->nom = $validated['nom'];
            $PlaceVipRecord->contact = $validated['contact'];
            
            // Marquer les places sélectionnées comme occupées dans ce nouvel enregistrement
            foreach ($validated['PlaceVips'] as $placeNum) { // Utilise 'PlaceVips'
                $PlaceVipRecord->{'place_'.$placeNum} = true;
            }
    
            // Sauvegarder l'enregistrement
            $PlaceVipRecord->save();
            DB::commit();
    
            Log::info('PlaceVipController@store: Attribution VIP réussie.');
            return response()->json([
                'success' => true,
                'message' => 'Attribution VIP réussie',
                'data' => $PlaceVipRecord->fresh(), // Retourne le modèle avec les données à jour (incluant timestamps, etc.)
            ], 201);
    
        } catch (\Exception $e) {
            // S'assurer que rollback est appelé uniquement si une transaction a été démarrée
            if (DB::transactionLevel() > 0) DB::rollBack();
            Log::error('PlaceVipController@store: Erreur: '.$e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erreur serveur lors de l\'attribution VIP',
                'error' => $e->getMessage()
            ], 500);
        }
    }


    /**
     * Libère des places VIP en supprimant les enregistrements de réservation.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function freePlacesVip(Request $request)
    {
        Log::info('Requête reçue pour freePlacesVip:', $request->all());
        
        // Utilisation des transactions pour assurer l'atomicité
        DB::beginTransaction();
        try {
            $validated = $request->validate([
                'voiture_id' => 'required|integer|exists:voiture_vips,id',
                'places' => 'required|array', 
                'places.*' => 'required|integer|min:1|max:10' 
            ]);
    
            Log::info('Données validées pour freePlacesVip:', $validated);

            $results = [];
            
            // Pour chaque numéro de place à libérer
            foreach ($validated['places'] as $placeNumber) {
                // Trouver l'enregistrement de réservation qui a cette place marquée comme vraie pour cette voiture
                $place = PlacesVip::where('voiture_id', $validated['voiture_id'])
                                ->where('place_' . $placeNumber, true)
                                ->first();
    
                if ($place) {
                    // Supprime l'enregistrement entier de la réservation
                    $place->delete();
                    
                    $results[] = [
                        'place_num' => $placeNumber,
                        'success' => true,
                        'message' => 'Place VIP libérée avec succès'
                    ];
                } else {
                    // Si aucun enregistrement n'est trouvé, la place était déjà libre ou n'existait pas
                    $results[] = [
                        'place_num' => $placeNumber,
                        'success' => false,
                        'message' => 'Place VIP non trouvée ou déjà libérée'
                    ];
                }
            }
    
            DB::commit();
    
            Log::info('Opération de libération VIP terminée', ['results' => $results]);
            return response()->json([
                'success' => true,
                'message' => 'Opération de libération VIP terminée',
                'results' => $results
            ]);
    
        } catch (\Exception $e) {
            // S'assurer que rollback est appelé uniquement si une transaction a été démarrée
            if (DB::transactionLevel() > 0) DB::rollBack();
            Log::error('PlaceVipController@freePlacesVip: Erreur: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erreur serveur lors de la libération VIP',
                'error' => env('APP_DEBUG') ? $e->getMessage() : 'Une erreur est survenue.'
            ], 500);
        }
    }

    /**
     * Récupère toutes les réservations VIP.
     * Inclut la relation voitureVip si définie dans le modèle.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function getAllVipReservations()
    {
        try {
            // Charger les réservations VIP avec les informations de la voiture associée si la relation existe et est nécessaire
            $reservations = PlacesVip::with('voitureVip')->get();

            return response()->json([
                'success' => true,
                'message' => 'Réservations VIP récupérées avec succès',
                'data' => $reservations
            ]);

        } catch (\Exception $e) {
            Log::error('PlaceVipController@getAllVipReservations: Erreur: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des réservations VIP',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Confirme le paiement pour une réservation VIP spécifique.
     * Met à jour le statut_paiement à 'P'.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id  ID de l'enregistrement placesVip
     * @return \Illuminate\Http\JsonResponse
     */
    public function confirmPayment(Request $request, $id)
    {
        try {
            $placeVip = PlacesVip::find($id);

            if (!$placeVip) {
                return response()->json(['success' => false, 'message' => 'Réservation VIP non trouvée.'], 404);
            }

            // Assurez-vous que 'statut_paiement' est dans $fillable du modèle placesVip si vous utilisez update()
            // $placeVip->update(['statut_paiement' => 'P']);
            // Ou, si 'statut_paiement' n'est pas dans $fillable (ce qui est le cas actuellement) :
            $placeVip->statut_paiement = 'P'; // 'P' pour Payé
            $placeVip->save();

            return response()->json(['success' => true, 'message' => 'Paiement VIP confirmé avec succès.', 'data' => $placeVip->fresh()]);
        } catch (\Exception $e) {
            Log::error('PlaceVipController@confirmPayment: Erreur: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Erreur serveur lors de la confirmation du paiement VIP.'], 500);
        }
    }
}
