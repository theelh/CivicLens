<?php

use App\Http\Controllers\Api\AuthController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\ContactController;
use App\Http\Controllers\Api\AiChatbotController;
use App\Http\Controllers\Api\AnalyticsController;
use App\Http\Controllers\Api\AllReportsController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\MapController;
use App\Models\Report;
use App\Models\Location;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use App\Http\Controllers\Api\Settings\ProfileController;
use App\Http\Controllers\Api\Settings\TwoFactorAuthenticationController;
use App\Http\Controllers\Api\Settings\PasswordController;

Route::get('/wel', function () {
    $reports = Report::count();

    $resolved = Report::whereHas('status', function($query) {
        $query->where('name', 'Resolved');
    })->count();

    $user = User::count();
    $userReports = User::withCount('reports')->get()->map(function($user) {
        return [
            'name' => $user->name,
            'report_count' => $user->reports_count,
            'role' => $user->role,
        ];
    });

    return response()->json([
        'message' => 'Welcome to the API',
        'latest_report' => $reports,
        'resolved_reports' => $resolved,
        'users' => $user,
        'user_reports' => $userReports
    ]);
});




Route::post('/register',[AuthController::class,'register']);
Route::post('/login',[AuthController::class,'login']);
Route::post('/logout',[AuthController::class,'logout'])->middleware('auth:api');

//contact form
Route::post('/sentContact', [ContactController::class, 'send']);
Route::post('/contact', [ContactController::class, 'send']);

Route::middleware('auth:api')->get('/profile', function (Request $request) {
    return $request->user();
});

Route::middleware('auth:api')->group(function () {
    
    Route::get('/analytics', [AnalyticsController::class, 'index']);
    Route::get('/reports', [AllReportsController::class, 'index']);
    Route::get('/userReports', [AllReportsController::class, 'userReports']);
    Route::post('/chat', [AiChatbotController::class, 'chat']);
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::get('/dashboard', [DashboardController::class, 'index']);
    Route::post('/notifications/{id}/read', [NotificationController::class, 'markRead']);
    Route::post('/notifications/{id}/unread', [NotificationController::class, 'markUnread']);
    Route::post('/notifications/read-all', [NotificationController::class, 'markAllRead']);
    Route::delete('/notifications/{id}', [NotificationController::class, 'destroy']);
    Route::delete('/notifications/read', [NotificationController::class, 'destroyRead']);
    Route::post('/reports/create', [ReportController::class, 'store']);
    Route::get('/categories', [CategoryController::class, 'index']);
    Route::get('/reports/submit', [ReportController::class, 'create']);
    Route::post('/reports/{report}/analyze', [ReportController::class, 'analyze']);
    Route::get('/reports/{report}', [AllReportsController::class, 'show']);
    Route::get('/reports/{report}/user', [AllReportsController::class, 'showUser']);
    Route::put('/reports/{report}/update', [AllReportsController::class, 'update']);
    Route::put('/reports/{report}/edit', [AllReportsController::class, 'edit']);
    Route::delete('/reports/{report}/destroy', [AllReportsController::class, 'destroy']);

    //Map View
    // routes/web.php
    Route::get('/map/reports', [MapController::class, 'reports']);

    //profile settings
    Route::get('/settings/profile', [ProfileController::class, 'edit']);
    Route::put('/settings/profile', [ProfileController::class, 'update']);
    Route::delete('/settings/profile', [ProfileController::class, 'destroy']);
    Route::get('/settings/two-factor', [TwoFactorAuthenticationController::class, 'show']);
    Route::put('/settings/password', [PasswordController::class, 'update']);
});

Route::post('/chatbot', [AiChatbotController::class, 'sendMessage'])
    ->middleware('throttle:20,1');
