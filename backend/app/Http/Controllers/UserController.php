<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Auth; 

class UserController extends Controller
{
    
    public function index()
    {
        // Retrieve all users
        $users = User::all();
        return response()->json($users);
    }

    public function store(Request $request)
    {
        // Validate and create a new user
        $validatedData = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
            'role' => 'required|string'
        ]);

        $user = User::create([
            'name' => $validatedData['name'],
            'email' => $validatedData['email'],
            'password' => bcrypt($validatedData['password']),
            'role' => $validatedData['role']
        ]);

        return response()->json($user, 201);
    }

    public function show($id)
    {
        // Retrieve a specific user
        $user = User::findOrFail($id);
        return response()->json($user);
    }

    public function update(Request $request, $id)
    {
        // Validate and update a specific user
        $validatedData = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'email' => 'sometimes|required|string|email|max:255|unique:users,email,' . $id,
            'password' => 'sometimes|required|string|min:8',
            'role' => 'sometimes|required|string'
        ]);

        $user = User::findOrFail($id);
        $user->update($validatedData);

        return response()->json($user);
    }

    public function destroy($id)
{
    $user = User::find($id);
    if (!$user) {
        return response()->json(['message' => 'Utilisateur non trouvé'], 404);
    }

    $user->delete();

    return response()->json(['message' => 'Utilisateur supprimé avec succès']);
}


    public function login(Request $request)
    {
        $credentials = $request->validate([
            'username' => 'required|string',
            'password' => 'required|string',
        ]);
    
        // Try to authenticate with email first
        if (Auth::attempt(['email' => $credentials['username'], 'password' => $credentials['password']])) {
            $user = Auth::user();
            return response()->json([
                'message' => 'Connexion réussie',
                'user' => [
                    'name' => $user->name,
                    'role' => $user->role,
                    'email' => $user->email
                ]
            ], 200);
        }
        
        // If email authentication fails, try with name (username)
        if (Auth::attempt(['name' => $credentials['username'], 'password' => $credentials['password']])) {
            $user = Auth::user();
            return response()->json([
                'message' => 'Connexion réussie',
                'user' => [
                    'name' => $user->name,
                    'role' => $user->role,
                    'email' => $user->email
                ]
            ], 200);
        }
    
        return response()->json([
            'message' => 'Nom d\'utilisateur ou mot de passe incorrect'
        ], 401);
    }

    public function logout(Request $request)
{
    Auth::logout(); // Déconnecte l'utilisateur
    
    $request->session()->invalidate(); // Invalide la session
    
    $request->session()->regenerateToken(); // Régénère le token CSRF
    
    return response()->json([
        'message' => 'Déconnexion réussie'
    ]);
}
}