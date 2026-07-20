<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Services\LoginIdentifierService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class AuthController extends Controller
{
    public function showLogin()
    {
        return Inertia::render('Auth/Login');
    }

    public function login(Request $request, LoginIdentifierService $identifiers)
    {
        $data = $request->validate([
            'login' => 'required|string',
            'password' => 'required|string',
        ]);

        $email = $identifiers->resolveEmail($data['login']);

        if (! $email || ! Auth::attempt(['email' => $email, 'password' => $data['password']], $request->boolean('remember'))) {
            return back()->withErrors([
                'login' => 'رقم الهاتف/البريد الإلكتروني أو كلمة المرور غير صحيحة',
            ]);
        }

        $request->session()->regenerate();

        $user = Auth::user();

        return redirect()->intended($user->isAdmin() ? route('admin.products.index') : route('home'));
    }

    public function showRegister()
    {
        return Inertia::render('Auth/Register');
    }

    public function register(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:100',
            'email' => 'required|email|max:255|unique:users,email',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
            'role' => 'customer',
        ]);

        $user->sendEmailVerificationNotification();

        Auth::login($user);

        return redirect()->route('verification.notice');
    }

    public function logout(Request $request)
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();
        return redirect('/');
    }
}
