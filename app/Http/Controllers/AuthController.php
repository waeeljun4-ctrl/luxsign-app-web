<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Services\LoginIdentifierService;
use App\Services\PhoneNumberService;
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

    /**
     * Customers sign up with just a phone number and password — no email,
     * no OTP/verification step. Auth internally still runs on the `email`
     * column (Auth::attempt, password_reset_tokens PK), so we store a
     * synthetic unique email derived from the phone number; login already
     * resolves phone -> stored email via LoginIdentifierService.
     */
    public function register(Request $request, PhoneNumberService $phoneNumbers)
    {
        $data = $request->validate([
            'name' => 'required|string|max:100',
            'phone' => 'required|string|max:20',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $phone = $phoneNumbers->normalize($data['phone']);

        if (User::where('phone', $phone)->exists()) {
            return back()->withErrors(['phone' => 'رقم الهاتف مستخدم مسبقاً.'])->withInput();
        }

        $user = User::create([
            'name' => $data['name'],
            'phone' => $phone,
            'email' => $phone.'@phone.luxsign.local',
            'email_verified_at' => now(),
            'password' => Hash::make($data['password']),
            'role' => 'customer',
        ]);

        Auth::login($user);

        return redirect()->route('home');
    }

    public function logout(Request $request)
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();
        return redirect('/');
    }
}
