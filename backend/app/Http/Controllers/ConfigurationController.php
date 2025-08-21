<?php

namespace App\Http\Controllers;

use App\Models\Configuration;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;

class ConfigurationController extends Controller
{
    /**
     * Récupérer les configurations avec des filtres optionnels
     */
    public function index(Request $request)
    {
        try {
            $query = Configuration::query();
            
            // Appliquer les filtres si présents
            if ($request->has('category')) {
                $query->where('category', $request->category);
            }
            
            if ($request->has('periode')) {
                $query->where(function($q) use ($request) {
                    $q->where('periode', $request->periode)
                      ->orWhere('periode', 'both');
                });
            }
            
            if ($request->has('active')) {
                $query->where('is_active', $request->active);
            }
            
            $configurations = $query->get();
            
            return response()->json([
                'configurations' => $configurations,
                'count' => $configurations->count()
            ]);
            
        } catch (\Exception $e) {
            Log::error("Erreur dans ConfigurationController@index: " . $e->getMessage());
            return response()->json(['error' => 'Erreur lors de la récupération des configurations.'], 500);
        }
    }
    
    /**
     * Récupérer une configuration spécifique par ID
     */
    public function show($id)
    {
        try {
            $configuration = Configuration::find($id);
            
            if (!$configuration) {
                return response()->json(['error' => 'Configuration non trouvée.'], 404);
            }
            
            return response()->json($configuration);
            
        } catch (\Exception $e) {
            Log::error("Erreur dans ConfigurationController@show: " . $e->getMessage());
            return response()->json(['error' => 'Erreur lors de la récupération de la configuration.'], 500);
        }
    }
    
    /**
     * Mettre à jour une configuration spécifique
     */
    public function update(Request $request, $id)
    {
        try {
            $configuration = Configuration::find($id);
            
            if (!$configuration) {
                return response()->json(['error' => 'Configuration non trouvée.'], 404);
            }
            
            $validator = Validator::make($request->all(), [
                'value' => 'required',
                'description' => 'sometimes|string',
                'type' => 'sometimes|string|in:amount,price,percentage,text,number',
                'periode' => 'sometimes|string|in:matin,soir,both',
                'category' => 'sometimes|string',
                'is_active' => 'sometimes|boolean'
            ]);
            
            if ($validator->fails()) {
                return response()->json(['errors' => $validator->errors()], 422);
            }
            
            $configuration->update($validator->validated());
            
            return response()->json($configuration);
            
        } catch (\Exception $e) {
            Log::error("Erreur dans ConfigurationController@update: " . $e->getMessage());
            return response()->json(['error' => 'Erreur lors de la mise à jour de la configuration.'], 500);
        }
    }
    
    /**
     * Mettre à jour plusieurs configurations en batch
     */
    public function batchUpdate(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'configurations' => 'required|array',
                'configurations.*.id' => 'required|integer|exists:configurations,id',
                'configurations.*.value' => 'required'
            ]);
            
            if ($validator->fails()) {
                return response()->json(['errors' => $validator->errors()], 422);
            }
            
            $updatedConfigs = [];
            
            foreach ($request->configurations as $configData) {
                $configuration = Configuration::find($configData['id']);
                if ($configuration) {
                    $configuration->update(['value' => $configData['value']]);
                    $updatedConfigs[] = $configuration;
                }
            }
            
            return response()->json([
                'message' => 'Configurations mises à jour avec succès.',
                'configurations' => $updatedConfigs
            ]);
            
        } catch (\Exception $e) {
            Log::error("Erreur dans ConfigurationController@batchUpdate: " . $e->getMessage());
            return response()->json(['error' => 'Erreur lors de la mise à jour des configurations.'], 500);
        }
    }
    
    /**
     * Créer une nouvelle configuration
     */
    public function store(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'key' => 'required|string|unique:configurations,key',
                'value' => 'required',
                'description' => 'required|string',
                'type' => 'required|string|in:amount,price,percentage,text,number',
                'periode' => 'required|string|in:matin,soir,both',
                'category' => 'required|string',
                'is_active' => 'sometimes|boolean'
            ]);
            
            if ($validator->fails()) {
                return response()->json(['errors' => $validator->errors()], 422);
            }
            
            $configuration = Configuration::create($validator->validated());
            
            return response()->json($configuration, 201);
            
        } catch (\Exception $e) {
            Log::error("Erreur dans ConfigurationController@store: " . $e->getMessage());
            return response()->json(['error' => 'Erreur lors de la création de la configuration.'], 500);
        }
    }
    
    /**
     * Supprimer une configuration
     */
    public function destroy($id)
    {
        try {
            $configuration = Configuration::find($id);
            
            if (!$configuration) {
                return response()->json(['error' => 'Configuration non trouvée.'], 404);
            }
            
            $configuration->delete();
            
            return response()->json(['message' => 'Configuration supprimée avec succès.']);
            
        } catch (\Exception $e) {
            Log::error("Erreur dans ConfigurationController@destroy: " . $e->getMessage());
            return response()->json(['error' => 'Erreur lors de la suppression de la configuration.'], 500);
        }
    }
}