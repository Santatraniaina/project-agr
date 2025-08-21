<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\PlaceController;
use App\Http\Controllers\VoitureController;
use App\Http\Controllers\LieuController;
use App\Http\Controllers\ClientController;
use App\Http\Controllers\PlaceVipController;
use App\Http\Controllers\voitureVipController;
use App\Http\Controllers\ClientFileAttenteController;
use App\Http\Controllers\ItineraireController;
use App\Http\Controllers\RechercheController;
use App\Http\Controllers\VehiculeController;
use App\Http\Controllers\FileAttenteVipController;
use App\Http\Controllers\VoyageController;
use App\Http\Controllers\UserController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Http\Controllers\VilleController;
use App\Http\Controllers\PrixController;
use App\Http\Controllers\SimulateurCaisseController;
use App\Http\Controllers\CategorieDepenseController;
use App\Http\Controllers\DepenseController;
use App\Http\Controllers\ClotureMensuelleController;
use App\Http\Controllers\ConfigurationController;

Route::get('/', function () {
    return view('welcome');
});

Route::prefix('api')->group(function () {

    // Voitures
    Route::apiResource('voitures', VoitureController::class);
    Route::get('/voitures/{voitureId}/places', [PlaceController::class, 'index']);
    Route::get('/voitures-parties', [VoyageController::class, 'getVoituresParties']);
    Route::apiResource('/file-attente', ClientFileAttenteController::class);
    Route::apiResource('/file-attente-vip', FileAttenteVipController::class);
    Route::apiResource('/voitures-parties-vip', VoyageVipController::class);

    // Places
    Route::get('/places', [PlaceController::class, 'index']);
    Route::get('/places/create', [PlaceController::class, 'create'])->name('places.create');
    Route::post('/places', [PlaceController::class, 'store'])->name('places.store');
    Route::post('/places/multiple', [PlaceController::class, 'storeMultiple']);
    Route::delete('/places/{id}', [PlaceController::class, 'destroy']);
    Route::post('/places', [PlaceController::class, 'store']);
    Route::put('/voitures/{voitureId}/places', [PlaceController::class, 'update']);
    
    // Dans routes/web.php à l'intérieur du groupe Route::prefix('api')
Route::post('/reservations/{id}/confirm-payment', [PlaceController::class, 'confirmPayment']);


     // Réservations (ROUTE AJOUTÉE ICI)
     Route::get('/reservations', [PlaceController::class, 'getAllReservations']);


    // Token CSRF (utile pour frontend avec axios/fetch)
    Route::get('/csrf-token', function () {
        return response()->json(['csrfToken' => csrf_token()]);
    });

    // Lieux
    Route::post('/lieux', [LieuController::class, 'store'])->name('lieux.store');

    // Clients et attribution de places
    Route::get('/clients/{id}', [ClientController::class, 'show']);
    Route::post('/clients/attribuer-places', [ClientController::class, 'store']);
    Route::get('/clients/places-disponibles', [ClientController::class, 'availablePlaces']);
    Route::delete('/attributions/{id}', [ClientController::class, 'cancel']);

    //route vip 
    // Récupérer les places VIP pour une voiture
    Route::get('/voitures/{voitureId}/places-vip', [PlaceVipController::class, 'indexVip']);
    // Réserver des places VIP
   // Route::post('/places-vip', [PlaceVipController::class, 'store']);

    Route::get('/voitures-vip', [voitureVipController::class, 'indexVip']);
    
    // Créer une nouvelle voiture VIP
    Route::post('/voitures-vip', [voitureVipController::class, 'storeVip']);
    
    // Obtenir les places d'une voiture VIP spécifique
    Route::get('/voitures-vip/{id}/places', [voitureVipController::class, 'getPlacesVip']);
    
    // Afficher une voiture VIP spécifique
    Route::get('/voitures-vip/{id}', [voitureVipController::class, 'showVip']);
    
    // Mettre à jour une voiture VIP
    Route::put('/voitures-vip/{id}', [voitureVipController::class, 'updateVip']);
    
    // Supprimer une voiture VIP
    Route::delete('/voitures-vip/{id}', [voitureVipController::class, 'destroyVip']);
    Route::post('/free-places-vip', [PlaceVipController::class, 'freePlacesVip']);
    Route::post('/free-places', [PlaceController::class, 'freePlaces']);
    Route::delete('/voitures/{id}', [VoitureController::class, 'destroy']); 
// Route pour attribuer des places VIP (POST)
    Route::post('/places-vip', [PlaceVipController::class, 'store'])
     ->name('places-vip.store');
    // Nouvelles routes pour la gestion des paiements VIP
    Route::get('/reservations-vip', [PlaceVipController::class, 'getAllVipReservations']);
    Route::post('/reservations-vip/{id}/confirm-payment', [PlaceVipController::class, 'confirmPayment']);


     Route::apiResource('itineraires', ItineraireController::class);

     Route::post('/recherche-voitures', [RechercheController::class, 'rechercheVoitures']);
     
     Route::apiResource('/vehicules', VehiculeController::class);
    
    // Voyages
    Route::post('/voyages', [App\Http\Controllers\VoyageController::class, 'store']);
    Route::post('/voyages-vip', [App\Http\Controllers\VoyageVipController::class, 'store']);
    //users
    Route::post('/users', [UserController::class, 'store'])->name('users.store');
    Route::get('/users', [UserController::class, 'index'])->name('users.index');
    Route::get('/users/{id}', [UserController::class, 'show'])->name('users.show');
    Route::put('/users/{id}', [UserController::class, 'update'])->name('users.update');
    Route::delete('/users/{id}', [UserController::class, 'destroy'])->name('users.destroy');
    Route::post('/login', [UserController::class, 'login'])->name('login');
    
    Route::get('/user', function (Request $request) {
        return response()->json([
            'name' => Auth::user()->name,
            'role' => Auth::user()->role,
            'email' => Auth::user()->email
        ]);
    })->middleware('auth');
    Route::post('/logout', [UserController::class, 'logout'])->name('logout');
    Route::apiResource('/villes', VilleController::class);
    Route::apiResource('prix', PrixController::class);
    // Route spécifique pour récupérer les prix par itinéraire
    Route::get('itineraires/{itineraire}/prix', [PrixController::class, 'byItineraire']);

     // Routes pour le simulateur de caisse
     Route::post('/simulateur/national', [SimulateurCaisseController::class, 'calculerNational']);
     Route::post('/simulateur/regional', [SimulateurCaisseController::class, 'calculerRegional']);
 
      // Routes pour la gestion des configurations
    Route::apiResource('configurations', ConfigurationController::class);
    Route::post('/configurations/batch-update', [ConfigurationController::class, 'updateBatch']);
    Route::get('/configurations/simulator-config', [ConfigurationController::class, 'getSimulatorConfig']);
    Route::post('/configurations/reset-defaults', [ConfigurationController::class, 'resetToDefaults']);

// Catégories de Dépenses
Route::apiResource('categories-depenses', CategorieDepenseController::class);

// Dépenses
// La route index peut prendre annee et mois en query parameters: /api/depenses?annee=2023&mois=6
Route::apiResource('depenses', DepenseController::class);
// Si vous avez besoin d'une route spécifique pour la mise à jour avec fichiers, vous pouvez la définir.
// Par exemple, pour gérer le FormData avec PUT (qui est parfois problématique), on utilise POST avec _method=PUT.
// Route::post('depenses/{depense}/update_with_files', [DepenseController::class, 'updateWithFiles']);


// Clôture Mensuelle
Route::get('/cloture-mois/{annee}/{mois}', [ClotureMensuelleController::class, 'getClotureData']);
Route::post('/cloture-mois', [ClotureMensuelleController::class, 'cloturerMois']);
Route::get('/cloture-mois/{annee}/{mois}/export', [ClotureMensuelleController::class, 'exportExcel']);
Route::get('/cloture-mois/{annee}/{mois}/export-pdf', [ClotureMensuelleController::class, 'exportPdf']);

    Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user(); // Doit retourner un utilisateur JSON
});
    
});
