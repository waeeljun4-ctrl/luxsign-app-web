<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class UserController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/Users', [
            'users' => User::where('role', 'customer')
                ->orderByDesc('created_at')
                ->get(['id', 'name', 'email', 'discount_percentage', 'email_verified_at', 'created_at']),
        ]);
    }

    public function updateDiscount(Request $request, User $user)
    {
        $data = $request->validate([
            'discount_percentage' => 'required|integer|in:0,10,20,30',
        ]);

        $user->update($data);

        return back()->with('success', 'تم تحديث نسبة الخصم ✅');
    }
}
