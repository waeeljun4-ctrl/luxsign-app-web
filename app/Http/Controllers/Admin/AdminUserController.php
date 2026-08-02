<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class AdminUserController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/Admins', [
            'admins' => User::where('role', 'admin')
                ->orderBy('name')
                ->get(['id', 'name', 'email', 'phone', 'created_at']),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name'     => 'required|string|max:100',
            'email'    => 'required|email|max:255|unique:users,email',
            'password' => 'required|string|min:8',
        ]);

        User::create([
            'name'              => $data['name'],
            'email'             => $data['email'],
            'email_verified_at' => now(),
            'password'          => Hash::make($data['password']),
            'role'              => 'admin',
        ]);

        return back()->with('success', 'تمت إضافة المدير ✅');
    }

    public function update(Request $request, User $admin)
    {
        abort_unless($admin->role === 'admin', 404);

        $data = $request->validate([
            'name'     => 'required|string|max:100',
            'email'    => ['required', 'email', 'max:255', Rule::unique('users', 'email')->ignore($admin->id)],
            'password' => 'nullable|string|min:8',
        ]);

        if (empty($data['password'])) {
            unset($data['password']);
        } else {
            $data['password'] = Hash::make($data['password']);
        }

        $admin->update($data);

        return back()->with('success', 'تم تحديث بيانات المدير ✅');
    }

    public function destroy(Request $request, User $admin)
    {
        abort_unless($admin->role === 'admin', 404);

        if ($admin->id === $request->user()->id) {
            return back()->withErrors(['admin' => 'ما بتقدر تحذف حسابك الخاص وإنت مسجل دخول فيه.']);
        }

        if (User::where('role', 'admin')->count() <= 1) {
            return back()->withErrors(['admin' => 'لازم يبقى مدير واحد على الأقل بالموقع.']);
        }

        $admin->delete();

        return back()->with('success', 'تم حذف المدير');
    }
}
