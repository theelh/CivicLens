<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\ContactMail;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Mail;

class ContactController extends Controller
{
    public function send(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name'    => 'required|string|min:2|max:100',
            'email'   => 'required|email|max:150',
            'message' => 'required|string|min:10|max:2000',
        ]);

        Mail::to(config('mail.contact_recipient'))
            ->send(new ContactMail($validated));

        return response()->json(['message' => 'Your message has been sent successfully.']);
    }
}