<?php

namespace App\Http\Controllers;

use App\Models\Depense;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth; // Si vous utilisez l'authentification

class DepenseController extends Controller
{
    public function index(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'annee' => 'sometimes|required|integer|digits:4',
            'mois' => 'sometimes|required|integer|between:1,12',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $query = Depense::with('categorieDepense')->where('enabled', true);

        if ($request->has('annee') && $request->has('mois')) {
            $query->whereYear('date', $request->annee)
                  ->whereMonth('date', $request->mois);
        }

        return $query->orderBy('date', 'desc')->get();
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'date' => 'required|date',
            'categorie_depense_id' => 'required|exists:categories_depenses,id',
            'montant' => 'required|numeric|min:0',
            'commentaire' => 'nullable|string',
            'pieces_jointes.*' => 'nullable|file|mimes:jpg,jpeg,png,pdf,doc,docx,xls,xlsx|max:5120', // max 5MB par fichier
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $validator->validated();
        // $data['user_id'] = Auth::id(); // Si authentification
        $data['user_id'] = 1; // Temporaire, à remplacer par Auth::id()

        $uploadedFilePaths = [];
        if ($request->hasFile('pieces_jointes')) {
            foreach ($request->file('pieces_jointes') as $file) {
                $originalName = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME);
                $extension = $file->getClientOriginalExtension();
                // Nettoyer le nom du fichier pour éviter les caractères problématiques
                $safeOriginalName = preg_replace('/[^A-Za-z0-9\-_\.]/', '', str_replace(' ', '_', $originalName));
                $filename = time() . '_' . uniqid() . '_' . $safeOriginalName . '.' . $extension;
                
                // Stocker dans storage/app/public/depenses_pj/{annee}/{mois}
                $path = $file->storeAs('public/depenses_pj/' . date('Y') . '/' . date('m'), $filename);
                $uploadedFilePaths[] = [
                    'nom_original' => $file->getClientOriginalName(),
                    'path' => Storage::url($path), // URL accessible publiquement
                    'size' => $file->getSize(),
                    'mime_type' => $file->getMimeType(),
                ];
            }
        }
        $data['pieces_jointes'] = !empty($uploadedFilePaths) ? $uploadedFilePaths : null;

        $depense = Depense::create($data);
        $depense->load('categorieDepense'); // Charger la relation pour la réponse

        return response()->json($depense, 201);
    }

    public function show(Depense $depense)
    {
        return $depense->load('categorieDepense');
    }

    public function update(Request $request, Depense $depense)
    {
        // La gestion de la mise à jour des fichiers peut être complexe.
        // Ici, on se concentre sur la mise à jour des autres champs.
        // Pour les fichiers, il faudrait une logique pour supprimer les anciens, ajouter les nouveaux.
        $validator = Validator::make($request->all(), [
            'date' => 'sometimes|required|date',
            'categorie_depense_id' => 'sometimes|required|exists:categories_depenses,id',
            'montant' => 'sometimes|required|numeric|min:0',
            'commentaire' => 'nullable|string',
            'enabled' => 'sometimes|boolean',
            // Laisser la gestion des 'pieces_jointes' pour une route dédiée ou une logique plus complexe
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }
        
        // Si vous utilisez FormData et _method: 'PUT' pour les fichiers
        // Vous devrez gérer les fichiers ici comme dans la méthode store
        // Exemple simple sans gestion de mise à jour de fichiers :
        $dataToUpdate = $validator->validated();

        // Si des nouveaux fichiers sont envoyés, il faut gérer l'ajout et potentiellement la suppression des anciens.
        // Ceci est une simplification.
        if ($request->hasFile('pieces_jointes_new')) { // Supposons un champ différent pour les nouveaux fichiers
            $newUploadedFilePaths = [];
            foreach ($request->file('pieces_jointes_new') as $file) {
                $originalName = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME);
                $extension = $file->getClientOriginalExtension();
                $safeOriginalName = preg_replace('/[^A-Za-z0-9\-_\.]/', '', str_replace(' ', '_', $originalName));
                $filename = time() . '_' . uniqid() . '_' . $safeOriginalName . '.' . $extension;
                $path = $file->storeAs('public/depenses_pj/' . date('Y') . '/' . date('m'), $filename);
                $newUploadedFilePaths[] = [
                    'nom_original' => $file->getClientOriginalName(),
                    'path' => Storage::url($path),
                    'size' => $file->getSize(),
                    'mime_type' => $file->getMimeType(),
                ];
            }
            // Fusionner avec les pièces jointes existantes ou les remplacer
            // $existingPjs = $depense->pieces_jointes ?? [];
            // $dataToUpdate['pieces_jointes'] = array_merge($existingPjs, $newUploadedFilePaths);
            // Ou si on veut permettre la suppression de PJ spécifiques, il faudra un champ comme 'pjs_a_supprimer' (IDs ou chemins)
            $dataToUpdate['pieces_jointes'] = $newUploadedFilePaths; // Remplace les anciennes pour cet exemple
        }


        $depense->update($dataToUpdate);
        return response()->json($depense->load('categorieDepense'));
    }

    public function destroy(Depense $depense)
    {
        // Avant de supprimer, vous pourriez vouloir supprimer les fichiers associés du stockage
        // if ($depense->pieces_jointes) {
        //     foreach ($depense->pieces_jointes as $pj) {
        //         // Convertir l'URL en chemin de stockage relatif
        //         $relativePath = str_replace(Storage::url(''), '', $pj['path']);
        //         Storage::delete($relativePath);
        //     }
        // }
        // $depense->delete(); // Suppression physique
        $depense->update(['enabled' => false]); // Désactivation logique
        return response()->json(['message' => 'Dépense désactivée.'], 200);
    }
}
