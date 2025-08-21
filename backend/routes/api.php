<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Middleware\HandleCors;

// Importation des contrôleurs
use App\Http\Controllers\PlaceController;
use App\Http\Controllers\VoitureController;
use App\Http\Controllers\VoyageController;
use App\Http\Controllers\ClientFileAttenteController;
use App\Http\Controllers\FileAttenteVipController;
use App\Http\Controllers\VoyageVipController;
use App\Http\Controllers\LieuController;
use App\Http\Controllers\ClientController;
use App\Http\Controllers\PlaceVipController;
use App\Http\Controllers\VoitureVipController;
use App\Http\Controllers\ItineraireController;
use App\Http\Controllers\RechercheController;
use App\Http\Controllers\VehiculeController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\VilleController;
use App\Http\Controllers\PrixController;
use App\Http\Controllers\TransactionController;
use App\Http\Controllers\CooperativeController;

Route::middleware([
    HandleCors::class,
    'api'
])->group(function () {
    // Routes Utilisateurs & Authentification
    Route::post('/login', [UserController::class, 'login'])->name('login');
    Route::post('/logout', [UserController::class, 'logout'])->name('logout')->middleware('auth:sanctum');
    Route::get('/user', function (Request $request) {
        if (Auth::guard('sanctum')->check()) {
            $user = Auth::guard('sanctum')->user();
            return response()->json([
                'name' => $user->name,
                'role' => $user->role,
                'email' => $user->email
            ]);
        }
        return response()->json(['message' => 'Unauthenticated.'], 401);
    })->middleware('auth:sanctum');

    Route::post('/users', [UserController::class, 'store'])->name('users.store');
    Route::get('/users', [UserController::class, 'index'])->name('users.index')->middleware('auth:sanctum');
    Route::get('/users/{id}', [UserController::class, 'show'])->name('users.show')->middleware('auth:sanctum');
    Route::put('/users/{id}', [UserController::class, 'update'])->name('users.update')->middleware('auth:sanctum');
    Route::delete('/users/{id}', [UserController::class, 'destroy'])->name('users.destroy')->middleware('auth:sanctum');

    // Token CSRF
    Route::get('/csrf-token', function () {
        return response()->json(['csrfToken' => csrf_token()]);
    });

    // Voitures Normales
    Route::apiResource('voitures', VoitureController::class)->middleware('auth:sanctum');
    Route::get('/voitures/{voitureId}/places', [PlaceController::class, 'index'])->middleware('auth:sanctum');

    // Places Normales
    // Route::get('/places', [PlaceController::class, 'index']); // Peut être redondant si /voitures/{voitureId}/places est utilisé
    // Route::get('/places/create', [PlaceController::class, 'create'])->name('places.create'); // Méthode non définie
    Route::post('/places', [PlaceController::class, 'store'])->middleware('auth:sanctum'); // Assurez-vous que c'est la bonne pour l'attribution
    // Route::post('/places/multiple', [PlaceController::class, 'storeMultiple']); // Méthode non définie
    // Route::delete('/places/{id}', [PlaceController::class, 'destroy']); // Méthode non définie
    // Route::put('/voitures/{voitureId}/places', [PlaceController::class, 'update']); // Méthode commentée dans le contrôleur
    Route::post('/free-places', [PlaceController::class, 'freePlaces'])->middleware('auth:sanctum');

    // Réservations (ROUTE AJOUTÉE/ASSURÉE ICI)
    Route::get('/reservations', [PlaceController::class, 'getAllReservations'])->middleware('auth:sanctum');
    Route::post('/reservations/{id}/confirm-payment', [PlaceController::class, 'confirmPayment'])->middleware('auth:sanctum');
    
    // Réservations VIP
    Route::get('/reservations-vip', [PlaceVipController::class, 'getAllVipReservations'])->middleware('auth:sanctum');
    Route::post('/reservations-vip/{id}/confirm-payment', [PlaceVipController::class, 'confirmPayment'])->middleware('auth:sanctum');

    // Voitures VIP
    Route::get('/voitures-vip', [voitureVipController::class, 'indexVip'])->middleware('auth:sanctum');
    Route::post('/voitures-vip', [voitureVipController::class, 'storeVip'])->middleware('auth:sanctum');
    Route::get('/voitures-vip/{id}/places', [voitureVipController::class, 'getPlacesVip'])->middleware('auth:sanctum');
    Route::get('/voitures-vip/{id}', [voitureVipController::class, 'showVip'])->middleware('auth:sanctum');
    Route::put('/voitures-vip/{id}', [voitureVipController::class, 'updateVip'])->middleware('auth:sanctum');
    Route::delete('/voitures-vip/{id}', [voitureVipController::class, 'destroyVip'])->middleware('auth:sanctum');

    // Places VIP
    Route::get('/voitures/{voitureId}/places-vip', [PlaceVipController::class, 'indexVip'])->middleware('auth:sanctum');
    Route::post('/places-vip', [PlaceVipController::class, 'store'])->name('places-vip.store')->middleware('auth:sanctum');
    Route::post('/free-places-vip', [PlaceVipController::class, 'freePlacesVip'])->middleware('auth:sanctum');

    // Voyages
    Route::get('/voitures-parties', [VoyageController::class, 'getVoituresParties'])->middleware('auth:sanctum');
    Route::post('/voyages', [VoyageController::class, 'store'])->middleware('auth:sanctum');
    Route::get('/voitures-parties-vip', [VoyageVipController::class, 'getVoituresVipsParties'])->middleware('auth:sanctum');
    Route::post('/voyages-vip', [VoyageVipController::class, 'store'])->middleware('auth:sanctum');

    // Files d'attente
    Route::apiResource('/file-attente', ClientFileAttenteController::class)->middleware('auth:sanctum');
    Route::apiResource('/file-attente-vip', FileAttenteVipController::class)->middleware('auth:sanctum');

    // Lieux
    Route::post('/lieux', [LieuController::class, 'store'])->name('lieux.store')->middleware('auth:sanctum');

    // Clients
    Route::get('/clients/{id}', [ClientController::class, 'show'])->middleware('auth:sanctum');
    Route::post('/clients/attribuer-places', [ClientController::class, 'store'])->middleware('auth:sanctum');
    // Route::get('/clients/places-disponibles', [ClientController::class, 'availablePlaces']); // Méthode non définie
    Route::delete('/attributions/{id}', [ClientController::class, 'cancel'])->middleware('auth:sanctum');

    // Itinéraires
    Route::apiResource('itineraires', ItineraireController::class)->middleware('auth:sanctum');
    Route::get('itineraires/{itineraire}/prix', [PrixController::class, 'byItineraire'])->middleware('auth:sanctum');

    // Recherche
    Route::post('/recherche-voitures', [RechercheController::class, 'rechercheVoitures'])->middleware('auth:sanctum');

    // Véhicules
    Route::apiResource('/vehicules', VehiculeController::class)->middleware('auth:sanctum');

    // Villes
    Route::apiResource('/villes', VilleController::class)->middleware('auth:sanctum');

    // Prix
    Route::apiResource('prix', PrixController::class)->middleware('auth:sanctum');

    // Transactions de caisse
    Route::post('/transactions', [TransactionController::class, 'store'])->middleware('auth:sanctum');
    
    // Simulateur de caisse
    Route::post('/simulateur/national', [App\Http\Controllers\SimulateurCaisseController::class, 'calculerNational'])->middleware('auth:sanctum');
    Route::post('/simulateur/regional', [App\Http\Controllers\SimulateurCaisseController::class, 'calculerRegional'])->middleware('auth:sanctum');
    
    // Clôture mensuelle
    Route::get('/cloture-mois/{annee}/{mois}', [App\Http\Controllers\ClotureMensuelleController::class, 'getClotureData'])->middleware('auth:sanctum');
    Route::post('/cloture-mois', [App\Http\Controllers\ClotureMensuelleController::class, 'cloturerMois'])->middleware('auth:sanctum');
    Route::get('/cloture-mois/{annee}/{mois}/export', [App\Http\Controllers\ClotureMensuelleController::class, 'exportExcel'])->middleware('auth:sanctum');
    Route::get('/cloture-mois/{annee}/{mois}/export-pdf', [App\Http\Controllers\ClotureMensuelleController::class, 'exportPdf'])->middleware('auth:sanctum');

    // Cooperatives
    Route::apiResource('cooperatives', CooperativeController::class)->middleware('auth:sanctum');
    Route::post('/cooperatives/{cooperative}/cities', [CooperativeController::class, 'addCity'])->middleware('auth:sanctum');
    Route::delete('/cooperatives/{cooperative}/cities/{ville}', [CooperativeController::class, 'removeCity'])->middleware('auth:sanctum');
    Route::get('/cooperatives/{cooperative}/cities', [CooperativeController::class, 'getCities'])->middleware('auth:sanctum');
    Route::post('/cooperatives/{cooperative}/city-configuration', [CooperativeController::class, 'updateCityConfiguration'])->middleware('auth:sanctum');
    
    // Dépenses
    Route::apiResource('depenses', App\Http\Controllers\DepenseController::class)->middleware('auth:sanctum');
    
    // Catégories de dépenses
    Route::apiResource('categories-depenses', App\Http\Controllers\CategorieDepenseController::class)->middleware('auth:sanctum');
    
    // Configurations
    Route::apiResource('configurations', App\Http\Controllers\ConfigurationController::class)->middleware('auth:sanctum');
    Route::post('/configurations/batch-update', [App\Http\Controllers\ConfigurationController::class, 'batchUpdate'])->middleware('auth:sanctum');
});