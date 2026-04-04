<?php

use App\Http\Controllers\Api\AuthController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\AiChatbotController;


Route::post('/register',[AuthController::class,'register']);
Route::post('/login',[AuthController::class,'login']);

//contact form
Route::post('/sentContact', [ContactController::class, 'send']);

Route::middleware('auth:api')->get('/profile', function (Request $request) {
    return $request->user();
});

// Route::post('/chatbot', [AiChatbotController::class, 'sendMessage'])
//     ->middleware('throttle:20,1');