<?php

use App\Http\Controllers\ChildController;
use App\Http\Controllers\ChildDashboardController;
use App\Http\Controllers\FlashCardController;
use App\Http\Controllers\LandingController;
use App\Http\Controllers\MediaTimeController;
use App\Http\Controllers\MediaTimeRuleController;
use App\Http\Controllers\ParentDashboardController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ProfilesController;
use App\Http\Controllers\StatisticsController;
use App\Http\Controllers\ChildTagController;
use App\Http\Controllers\TagController;
use App\Http\Controllers\TrainingSessionController;
use App\Http\Controllers\VocabularyController;
use App\Http\Controllers\VocabularyListController;
use Illuminate\Support\Facades\Route;

// === LANDING PAGE ===
Route::get('/', [LandingController::class, 'index'])->name('home');

// === PROFILE SELECTION (after master login) ===
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/profiles', [ProfilesController::class, 'index'])->name('profiles.index');
    Route::get('/profiles/{type}/{id}/pin', [ProfilesController::class, 'showPin'])->name('profiles.pin');
    Route::post('/profiles/unlock', [ProfilesController::class, 'unlock'])->name('profiles.unlock');
    Route::post('/profiles/lock', [ProfilesController::class, 'lock'])->name('profiles.lock');
});

// === PARENT ROUTES ===
Route::middleware(['auth', 'verified', 'parent'])->prefix('parent')->name('parent.')->group(function () {
    Route::get('/dashboard', [ParentDashboardController::class, 'index'])->name('dashboard');

    // Children management
    Route::resource('children', ChildController::class);
    Route::get('/children/{child}/statistics', [StatisticsController::class, 'child'])->name('children.statistics');

    // Vocabulary lists (Fächer)
    Route::resource('vocabulary-lists', VocabularyListController::class)
        ->except(['create', 'edit']);

    // Vocabulary management (create/edit/update/destroy — scoped to a list via list_id)
    Route::resource('vocabulary', VocabularyController::class)
        ->except(['index']);

    // Tags (nested under vocabulary-lists)
    Route::post('/vocabulary-lists/{vocabularyList}/tags', [TagController::class, 'store'])
        ->name('vocabulary-lists.tags.store');
    Route::delete('/vocabulary-lists/{vocabularyList}/tags/{tag}', [TagController::class, 'destroy'])
        ->name('vocabulary-lists.tags.destroy');

    // Child-Tag assignment
    Route::post('/vocabulary-lists/{vocabularyList}/tags/{tag}/children', [ChildTagController::class, 'store'])
        ->name('vocabulary-lists.tags.children.store');
    Route::delete('/vocabulary-lists/{vocabularyList}/tags/{tag}/children/{child}', [ChildTagController::class, 'destroy'])
        ->name('vocabulary-lists.tags.children.destroy');

    // Media time rules
    Route::get('/media-time-rules', [MediaTimeRuleController::class, 'edit'])->name('media-time-rules.edit');
    Route::put('/media-time-rules', [MediaTimeRuleController::class, 'update'])->name('media-time-rules.update');

    // Profile
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    Route::post('/profile/pin', [ProfileController::class, 'updatePin'])->name('profile.pin.update');
    Route::post('/profile/pin/remove', [ProfileController::class, 'removePin'])->name('profile.pin.remove');
});

// === CHILD ROUTES ===
Route::middleware(['auth', 'verified', 'child.auth'])->prefix('child')->name('child.')->group(function () {
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
