<?php

namespace App\Http\Controllers;

use App\Models\CategorieDepense;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class CategorieDepenseController extends Controller
{
    public function index()
    {
        return CategorieDepense::where('enabled', true)->orderBy('nom')->get();
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'nom' => 'required|string|unique:categories_depenses,nom|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $categorie = CategorieDepense::create($validator->validated());
        return response()->json($categorie, 201);
    }

    public function show(CategorieDepense $categorieDepense)
    {
        return $categorieDepense;
    }

    public function update(Request $request, CategorieDepense $categorieDepense)
    {
        $validator = Validator::make($request->all(), [
            'nom' => 'sometimes|required|string|unique:categories_depenses,nom,' . $categorieDepense->id . '|max:255',
            'enabled' => 'sometimes|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $categorieDepense->update($validator->validated());
        return response()->json($categorieDepense);
    }

    public function destroy(CategorieDepense $categorieDepense)
    {
        // Vérifier si la catégorie est utilisée avant de la supprimer (optionnel)
        // if ($categorieDepense->depenses()->count() > 0) {
        //     return response()->json(['message' => 'Catégorie utilisée, ne peut être supprimée directement.'], 409);
        // }
        // Ou la désactiver
        $categorieDepense->update(['enabled' => false]);
        // $categorieDepense->delete(); // Suppression physique
        return response()->json(['message' => 'Catégorie désactivée.'], 200);
    }
}
