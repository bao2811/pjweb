<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ManagerController;
use App\Http\Middleware\JwtMiddleware;

Route::middleware(['jwt', 'check.role:manager'])->prefix('manager')->group(function () {
    Route::get('/my-events', [ManagerController::class, 'getMyEvents']);
    Route::get('/events/{id}', [ManagerController::class, 'getEventDetails']);
    Route::put('/events/{id}/update', [ManagerController::class, 'updateEvent']);
    // FIX #3: Thêm route DELETE event với kiểm tra quyền sở hữu
    Route::delete('/events/{id}', [ManagerController::class, 'deleteEvent']);
    Route::get('/getListUserByEvent/{id}', [ManagerController::class, 'getListUserByEvent']);
    Route::post('/acceptUserJoinEvent', [ManagerController::class, 'acceptUserJoinEvent']);
    Route::post('/rejectUserJoinEvent', [ManagerController::class, 'rejectUserJoinEvent']);
    Route::post('/createEvent', [ManagerController::class, 'createEvent']);
    
    // Đánh dấu hoàn thành tình nguyện viên
    Route::post('/mark-completion', [ManagerController::class, 'markVolunteerCompletion']);
    
    // Báo cáo sự kiện với thống kê
    Route::get('/events/{eventId}/report', [ManagerController::class, 'getEventReport']);
    Route::get('/reports', [ManagerController::class, 'getManagerEventsReport']);
});