<?php

use App\Http\Controllers\Auth\ChildPinController;
use App\Http\Controllers\ChildController;
use App\Http\Controllers\ChildDashboardController;
use App\Http\Controllers\FlashCardController;
use App\Http\Controllers\MediaTimeController;
use App\Http\Controllers\MediaTimeRuleController;
use App\Http\Controllers\ParentDashboardController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\StatisticsController;
use App\Http\Controllers\TagController;
use App\Http\Controllers\TrainingSessionController;
use App\Http\Controllers\VocabularyController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Redirect root to login or dashboard
Route::get('/', function () {
    return redirect()->route('login');
});

// === CHILD PIN AUTH ===
Route::get('/child-login', [ChildPinController::class, 'show'])->name('child.login');
Route::post('/child-login', [ChildPinController::class, 'authenticate'])->name('child.login.post');
Route::post('/child-logout', [ChildPinController::class, 'logout'])->name('child.logout');

// === PARENT ROUTES ===
Route::middleware(['auth', 'verified'])->prefix('parent')->name('parent.')->group(function () {
    Route::get('/dashboard', [ParentDashboardController::class, 'index'])->name('dashboard');

    // Children management
    Route::resource('children', ChildController::class);
    Route::get('/children/{child}/statistics', [StatisticsController::class, 'child'])->name('children.statistics');

    // Vocabulary management
    Route::resource('vocabulary', VocabularyController::class);

    // Tags
    Route::resource('tags', TagController::class)->only(['index', 'store', 'destroy']);

    // Media time rules
    Route::get('/media-time-rules', [MediaTimeRuleController::class, 'edit'])->name('media-time-rules.edit');
    Route::put('/media-time-rules', [MediaTimeRuleController::class, 'update'])->name('media-time-rules.update');

    // Profile
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

// === CHILD ROUTES ===
Route::middleware(['child.auth'])->prefix('child')->name('child.')->group(function () {
    Route::get('/home', [ChildDashboardController::class, 'index'])->name('home');

    // Training
    Route::get('/training', [TrainingSessionController::class, 'index'])->name('training.index');
    Route::post('/training/start', [TrainingSessionController::class, 'start'])->name('training.start');
    Route::get('/training/{session}', [TrainingSessionController::class, 'show'])->name('training.show');
    Route::post('/training/{session}/answer', [TrainingSessionController::class, 'answer'])->name('training.answer');
    Route::post('/training/{session}/finish', [TrainingSessionController::class, 'finish'])->name('training.finish');
    Route::get('/training/{session}/summary', [TrainingSessionController::class, 'summary'])->name('training.summary');

    // Leitner drawer overview
    Route::get('/drawers', [FlashCardController::class, 'drawers'])->name('drawers');

    // Media time
    Route::get('/media-time', [MediaTimeController::class, 'index'])->name('media-time.index');
    Route::post('/media-time/redeem', [MediaTimeController::class, 'redeem'])->name('media-time.redeem');

    // Statistics
    Route::get('/statistics', [StatisticsController::class, 'ownStats'])->name('statistics');
});

require __DIR__.'/auth.php';
