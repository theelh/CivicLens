<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\AllReportsController;
use App\Http\Controllers\AnalyticsController;
use App\Http\Controllers\MapController;
use App\Http\Controllers\StaffAnalyticsController;
use App\Http\Controllers\StaffNotificationsController;
use App\Http\Controllers\StaffMapController;
use App\Http\Controllers\StaffDashboardController;
use App\Http\Controllers\AdminDashboardController;
use App\Http\Controllers\AdminReportController;
use App\Http\Controllers\AdminAIController;
use App\Http\Controllers\AdminActivityController;
use App\Http\Controllers\AdminUserController;
use App\Http\Controllers\AiChatbotController;
use App\Models\Category;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');
Route::get('/service', function () {
    return Inertia::render('service', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('service');
Route::get('/about', function () {
    return Inertia::render('about', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('about');

Route::get('/contact', function(){
    return Inertia::render('contact',[
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('contact');


Route::post('/api/chatbot', [AiChatbotController::class, 'chat']);


//User role
Route::middleware(['auth','verified','role:user'])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    Route::get('/analytics', [AnalyticsController::class, 'index'])->name('analytics');

    // Submit page (renders the React component)
    Route::get('/reports/submit', [AllReportsController::class, 'create'])->name('reports.create');
    Route::delete('/reports/{id}', [AllReportsController::class, 'destroy'])->name('reports.delete');
    Route::get('/reports/show/{id}', [AllReportsController::class, 'show'])->name('reports.show');
    Route::get('/reports/{id}/edit', [AllReportsController::class, 'edit'])->name('reports.edit');
    Route::post('/reports/update/{id}', [AllReportsController::class, 'update'])->name('reports.update');
    Route::post('/reports/{report}/analy', [AllReportsController::class, 'analyze']);
    Route::post('/reports/{report}/resolve', [AllReportsController::class, 'markResolved']);
 
    // Main form submit — Inertia POST
    Route::post('/reports', [ReportController::class, 'store'])->name('reports.store');
    Route::get('/reports/all', [AllReportsController::class, 'index'])->name('reports.index');

    //map
    Route::get('/map', [MapController::class, 'index'])->name('map');
 
    // AI helpers — called via axios (still web.php, session cookie handles auth)
    Route::post('/reports/analyze-image', [ReportController::class, 'analyzeImage'])->name('reports.analyze');
    Route::post('/reports/transcribe',    [ReportController::class, 'transcribe'])->name('reports.transcribe');
    Route::get('/geocode',                [ReportController::class, 'geocode'])->name('geocode');

    Route::post('/reports/{report}/analyze', [ReportController::class, 'analyze'])
        ->name('reports.analyze');

    Route::get('/notifications', [NotificationController::class, 'index'])->name('notifications');
    Route::post('/notifications/{id}/unread', [NotificationController::class, 'markUnread']);
    Route::delete('/notifications/{id}',      [NotificationController::class, 'destroy']);
    Route::post('/notifications/{id}/read',      [NotificationController::class, 'markRead']);
    Route::delete('/notifications/read',      [NotificationController::class, 'destroyRead']);
    Route::post('/notifications/read-all',      [NotificationController::class, 'markAllRead']);

});

//Admine role
Route::middleware(['auth','role:admin'])->prefix('admin')->group(function () {
    Route::get('/dashboard', [AdminDashboardController::class, 'index']
    )->name('admin.dashboard');


    Route::get('/analytics', [AdminReportController::class, 'index'])->name('admin.analytics');

    Route::get('/reports/submit', [AdminReportController::class, 'create'])->name('admin.reports.create');

    // Main form submit — Inertia POST
    Route::post('/reports', [AdminReportController::class, 'store'])->name('admin.reports.store');
    Route::get('/reports/all', [AdminReportController::class, 'indexAll'])->name('admin.reports.index');


    // Submit page (renders the React component)
    Route::get('/reports/submit', [AdminReportController::class, 'create'])->name('admin.reports.create');
    Route::delete('/reports/{id}/destroy', [AdminReportController::class, 'destroy'])->name('admin.reports.delete');
    Route::get('/reports/show/{id}', [AdminReportController::class, 'show'])->name('admin.reports.show');
    Route::get('/reports/{id}/edit', [AdminReportController::class, 'edit'])->name('admin.reports.edit');
    Route::post('/reports/update/{id}', [AdminReportController::class, 'update'])->name('admin.reports.update');
    Route::post('/reports/{report}/analy', [AdminReportController::class, 'analyze']);
    Route::post('/reports/{report}/resolve', [AdminReportController::class, 'markResolved']);
    Route::post('/reports/{report}/closed', [AdminReportController::class, 'markClosed']);

    //User management
    Route::get('/users', [AdminUserController::class, 'index'])->name('admin.users');
    Route::post('/users/{user}/role', [AdminUserController::class, 'updateRole'])->name('admin.users.updateRole');
    Route::delete('/users/{user}', [AdminUserController::class, 'destroy'])->name('admin.users.destroy');

    //Notification
    Route::get('/notifications', [AdminActivityController::class, 'index'])->name('admin.notifications');
    Route::post('/notifications/{id}/unread', [AdminActivityController::class, 'markUnread']);
    Route::delete('/notifications/{id}',      [AdminActivityController::class, 'destroy']);
    Route::post('/notifications/{id}/read',      [AdminActivityController::class, 'markRead']);
    Route::delete('/notifications/read',      [AdminActivityController::class, 'destroyRead']);
    Route::post('/notifications/read-all',      [AdminActivityController::class, 'markAllRead']);

    //map
    Route::get('/map', [AdminAIController::class, 'index'])->name('admin.map');
 
    // AI helpers — called via axios (still web.php, session cookie handles auth)
    Route::post('/reports/analyze-image', [AdminReportController::class, 'analyzeImage'])->name('staff.reports.analyze');
    Route::post('/reports/transcribe',    [AdminReportController::class, 'transcribe'])->name('admin.reports.transcribe');
    Route::get('/geocode', [AdminReportController::class, 'geocode'])->name('admin.geocode');

    Route::post('/reports/{report}/analyze', [AdminReportController::class, 'analyze'])
        ->name('admin.reports.analyze');
});


//Staff role

Route::middleware(['auth','role:staff'])->group(function () {
    Route::get('/staff/dashboard', [StaffDashboardController::class, 'index'])->name('staff.dashboard');
    Route::post('/staff/reports/{report}/resolve', [StaffDashboardController::class, 'resolve']);
    Route::post('/staff/reports/{report}/close', [StaffDashboardController::class, 'close']);
    Route::delete('/staff/reports/{report}', [StaffDashboardController::class, 'destroy']);

    Route::get('/staff/analytics', [StaffAnalyticsController::class, 'index'])->name('staff.analytics');

    Route::get('/staff/reports/submit', [StaffAnalyticsController::class, 'create'])->name('staff.reports.create');

    // Main form submit — Inertia POST
    Route::post('/staff/reports', [StaffAnalyticsController::class, 'store'])->name('staff.reports.store');
    Route::get('/staff/reports/all', [StaffAnalyticsController::class, 'indexAll'])->name('staff.reports.index');


    // Submit page (renders the React component)
    Route::get('/staff/reports/submit', [StaffAnalyticsController::class, 'create'])->name('staff.reports.create');
    Route::delete('/staff/reports/{id}/destroy', [StaffAnalyticsController::class, 'destroy'])->name('staff.reports.delete');
    Route::get('/staff/reports/show/{id}', [StaffAnalyticsController::class, 'show'])->name('staff.reports.show');
    Route::get('/staff/reports/{id}/edit', [StaffAnalyticsController::class, 'edit'])->name('staff.reports.edit');
    Route::post('/staff/reports/update/{id}', [StaffAnalyticsController::class, 'update'])->name('staff.reports.update');
    Route::post('/staff/reports/{report}/analy', [StaffAnalyticsController::class, 'analyze']);
    Route::post('/staff/reports/{report}/resolve', [StaffAnalyticsController::class, 'markResolved']);
    Route::post('/staff/reports/{report}/closed', [StaffAnalyticsController::class, 'markClosed']);

    //Notification
    Route::get('/staff/notifications', [StaffNotificationsController::class, 'index'])->name('staff.notifications');
    Route::post('/staff/notifications/{id}/unread', [StaffNotificationsController::class, 'markUnread']);
    Route::delete('/staff/notifications/{id}',      [StaffNotificationsController::class, 'destroy']);
    Route::post('/staff/notifications/{id}/read',      [StaffNotificationsController::class, 'markRead']);
    Route::delete('/staff/notifications/read',      [StaffNotificationsController::class, 'destroyRead']);
    Route::post('/staff/notifications/read-all',      [StaffNotificationsController::class, 'markAllRead']);

    //map
    Route::get('/staff/map', [StaffMapController::class, 'index'])->name('staff.map');
 
    // AI helpers — called via axios (still web.php, session cookie handles auth)
    Route::post('/staff/reports/analyze-image', [StaffAnalyticsController::class, 'analyzeImage'])->name('staff.reports.analyze');
    Route::post('/staff/reports/transcribe',    [StaffAnalyticsController::class, 'transcribe'])->name('staff.reports.transcribe');
    Route::get('/staff/geocode', [StaffAnalyticsController::class, 'geocode'])->name('staff.geocode');

    Route::post('/staff/reports/{report}/analyze', [StaffAnalyticsController::class, 'analyze'])
        ->name('staff.reports.analyze');

});




require __DIR__.'/settings.php';
