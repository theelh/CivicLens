<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

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
})->name('abour');

Route::middleware(['auth','verified','role:user'])->group(function () {
    Route::get('/dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

});

Route::middleware(['auth','role:admin'])->group(function () {
    Route::get('/admin/dashboard', function () {
        return Inertia::render('admin/adminDashboard');
    }
    )->name('admin.dashboard');
});

Route::middleware(['auth','role:staff'])->group(function () {

    Route::get('/staff/dashboard', function () {
        return Inertia::render('staff/staffDashboard');
    })->name('staff.dashboard');

});




require __DIR__.'/settings.php';
