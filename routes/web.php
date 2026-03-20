<?php

use App\Http\Controllers\BackupController;
use App\Http\Controllers\TtsController;
use App\Http\Controllers\ChildController;
use App\Http\Controllers\ChildDashboardController;
use App\Http\Controllers\ChildTagController;
use App\Http\Controllers\FlashCardController;
use App\Http\Controllers\MediaTimeController;
use App\Http\Controllers\MediaTimeRuleController;
use App\Http\Controllers\ParentDashboardController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ProfilesController;
use App\Http\Controllers\StatisticsController;
use App\Http\Controllers\TagController;
use App\Http\Controllers\TrainingSessionController;
use App\Http\Controllers\VocabularyController;
use App\Http\Controllers\VocabularyExportController;
use App\Http\Controllers\VocabularyImportController;
use App\Http\Controllers\VocabularyListController;
use Illuminate\Support\Facades\Route;

// === PROFILE SELECTION (public — no login required) ===
Route::get('/', [ProfilesController::class, 'index'])->name('profiles.index');
Route::get('/profiles', fn () => redirect()->route('profiles.index'));
Route::get('/profiles/{type}/{id}/pin', [ProfilesController::class, 'showPin'])->name('profiles.pin');
Route::post('/profiles/unlock', [ProfilesController::class, 'unlock'])->name('profiles.unlock');
Route::post('/profiles/lock', [ProfilesController::class, 'lock'])->name('profiles.lock');

// === PARENT ROUTES ===
Route::middleware(['auth', 'verified', 'parent'])->prefix('parent')->name('parent.')->group(function () {
    Route::get('/dashboard', [ParentDashboardController::class, 'index'])->name('dashboard');

    // Children management
    Route::resource('children', ChildController::class);
    Route::get('/children/{childName}/statistics', [StatisticsController::class, 'child'])->name('children.statistics');

    // Vocabulary lists (Fächer)
    Route::resource('vocabulary-lists', VocabularyListController::class)
        ->except(['create', 'edit']);

    // Vocabulary management (create/edit/update/destroy — scoped to a list via list_id)
    Route::resource('vocabulary', VocabularyController::class)
        ->except(['index']);
    Route::post('/vocabulary/bulk-destroy', [VocabularyController::class, 'bulkDestroy'])
        ->name('vocabulary.bulk-destroy');
    Route::post('/vocabulary/bulk-assign-tag', [VocabularyController::class, 'bulkAssignTag'])
        ->name('vocabulary.bulk-assign-tag');

    // CSV Export / Import (nested under vocabulary-lists)
    Route::get('/vocabulary-lists/{vocabularyList}/export', VocabularyExportController::class)
        ->name('vocabulary-lists.export');
    Route::get('/vocabulary-lists/{vocabularyList}/import', [VocabularyImportController::class, 'create'])
        ->name('vocabulary-lists.import.create');
    Route::post('/vocabulary-lists/{vocabularyList}/import', [VocabularyImportController::class, 'store'])
        ->name('vocabulary-lists.import.store');

    // Tags (nested under vocabulary-lists)
    Route::post('/vocabulary-lists/{vocabularyList}/tags', [TagController::class, 'store'])
        ->name('vocabulary-lists.tags.store');
    Route::patch('/vocabulary-lists/{vocabularyList}/tags/{tag}', [TagController::class, 'update'])
        ->name('vocabulary-lists.tags.update');
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

    // Backup
    Route::get('/profile/backup/export', [BackupController::class, 'export'])->name('profile.backup.export');
    Route::post('/profile/backup/import', [BackupController::class, 'import'])->name('profile.backup.import');

    // Profile
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    Route::post('/profile/pin', [ProfileController::class, 'updatePin'])->name('profile.pin.update');
    Route::post('/profile/pin/remove', [ProfileController::class, 'removePin'])->name('profile.pin.remove');

    // Google TTS settings
    Route::put('/profile/tts', [TtsController::class, 'updateSettings'])->name('profile.tts.update');
});

// === SHARED ROUTES (parent + child) ===
Route::middleware(['auth'])->group(function () {
    Route::post('/tts/speak', [TtsController::class, 'speak'])->name('tts.speak');
});

// === CHILD ROUTES ===
Route::middleware(['auth', 'verified', 'child.auth'])->prefix('child')->name('child.')->group(function () {
    Route::get('/home', [ChildDashboardController::class, 'index'])->name('home');

    // Training
    Route::post('/training/start', [TrainingSessionController::class, 'start'])->name('training.start');
    Route::get('/training/{session}', [TrainingSessionController::class, 'show'])->name('training.show');
    Route::post('/training/{session}/answer', [TrainingSessionController::class, 'answer'])->name('training.answer');
    Route::post('/training/{session}/skip', [TrainingSessionController::class, 'skip'])->name('training.skip');
    Route::post('/flash-cards/reset', [TrainingSessionController::class, 'resetMode'])->name('flash-cards.reset');
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
