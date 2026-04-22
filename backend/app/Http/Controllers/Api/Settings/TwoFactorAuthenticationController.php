<?php

namespace App\Http\Controllers\Api\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\TwoFactorAuthenticationRequest;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Inertia\Inertia;
use Inertia\Response;
use Laravel\Fortify\Features;
use Illuminate\Http\JsonResponse;

class TwoFactorAuthenticationController extends Controller
{
    /**
     * Get the middleware that should be assigned to the controller.
     */
    public static function middleware(): array
    {
        return Features::optionEnabled(Features::twoFactorAuthentication(), 'confirmPassword')
            ? [new Middleware('password.confirm', only: ['show'])]
            : [];
    }

    /**
     * Show the user's two-factor authentication settings page.
     */
    public function show(TwoFactorAuthenticationRequest $request): JsonResponse
    {
        $request->ensureStateIsValid();

        return response()->json([
            'two_factor_enabled' => $request->user()->two_factor_secret !== null,
            'two_factor_qr_code' => $request->twoFactorQrCodeSvg(),
            'two_factor_recovery_codes' => $request->recoveryCodes(),
        ]);
    }
}
