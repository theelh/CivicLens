<?php

namespace App\Http\Controllers\Api\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\PasswordUpdateRequest;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\JsonResponse;

class PasswordController extends Controller
{
    /**
     * Show the user's password settings page.
     */
    // public function edit(): Response
    // {
    //     return Inertia::render('settings/password');
    // }

    /**
     * Update the user's password.
     */
    public function update(PasswordUpdateRequest $request): JsonResponse
    {
        $request->user()->update([
            'password' => $request->password,
        ]);

        return response()->json([
            'message' => 'Password updated successfully'
        ]);
    }
}
