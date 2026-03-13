<?php

use App\Models\Connection;
use App\Http\Controllers\ConnectionController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    $connections = Connection::latest()->get();

    return view('welcome', compact('connections'));
});

// to connection controller
Route::post('/addConnection', [ConnectionController::class, 'addConnection']);
Route::post('/testConnection', [ConnectionController::class, 'testConnection']);
Route::post('/getTables/{id}', [ConnectionController::class, 'getTables']);
Route::post('/getTableColumns/{id}', [ConnectionController::class, 'getTableColumns']);
Route::post('/getTableInspection/{id}', [ConnectionController::class, 'getTableInspection']);
Route::post('/getSchema/{id}', [ConnectionController::class, 'getSchema']);
Route::post('/exportTables/{id}', [ConnectionController::class, 'exportTables']);
