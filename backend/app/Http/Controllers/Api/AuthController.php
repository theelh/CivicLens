<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use App\Models\Api\User;


class AuthController extends Controller
{

public function login(Request $request)
{
    // 1. Valider les champs
    $request->validate([
        'email' => 'required|email',
        'password' => 'required|string'
    ]);

    // 2. Récupérer l'utilisateur via le modèle API
    $user = User::where('email', $request->email)->first();

    // 3. Vérifier le mot de passe
    if (!$user || !Hash::check($request->password, $user->password)) {
        return response()->json(['message' => 'Invalid credentials'], 401);
    }

    // 4. Vérifier le rôle si nécessaire
    // if ($user->role !== 'user') { return ... }

    // 5. Créer un token pour Passport
    $token = $user->createToken('mobile')->accessToken;

    return response()->json([
        'user' => $user,
        'token' => $token
    ]);
}


     public function register(Request $request)
    {
        $validator = Validator::make($request->all(),[
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'errors' => $validator->errors()
            ],422);
        }

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'role' => 'user', // default role
            'password' => Hash::make($request->password)
        ]);

        $token = $user->createToken('mobile')->accessToken;

        return response()->json([
            'user' => $user,
            'token' => $token
        ],201);
    }

}
