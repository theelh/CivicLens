<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Inertia\Inertia;
use App\Models\Activity;
use Illuminate\Support\Facades\Auth;

class AdminUserController extends Controller
{
    public function index()
    {
        return Inertia::render('admin/userManage', [
            'users' => User::withCount('reports')->orderBy('id', 'desc')->paginate(7)
        ]);
    }

    public function updateRole(Request $request, User $user)
    {
        $user->update([
            'role' => $request->role
        ]);

        Activity::create([
            'type' => 'user_role',
            'message' => "New role submitted to: {$user->name} ({$user->email}), role: {$request->role}",
            'user_id' => Auth::id(),
            'user_id' => $user->id,
        ]);

        return back()->with('success', 'Role updated');
    }

    public function destroy(User $user)
    {
        $user->delete();

        Activity::create([
            'type' => 'delet_user',
            'message' => "An admin deleted : {$user->name} account ",
            'user_id' => Auth::id(),
        ]);

        return back()->with('success', 'User deleted');
    }
}

