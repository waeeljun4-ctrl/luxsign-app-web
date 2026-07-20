<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Coupon;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class CouponController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/Coupons', [
            'coupons' => Coupon::with('user:id,name,phone')->latest()->get(),
            'users'   => User::where('role', 'customer')->get(['id', 'name', 'phone']),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'code' => 'nullable|string|max:40|unique:coupons,code',
            'user_id' => 'nullable|exists:users,id',
            'type' => 'required|in:percentage,fixed',
            'value' => 'required|numeric|min:0.01',
            'expires_at' => 'nullable|date',
            'usage_limit' => 'nullable|integer|min:1',
        ]);

        $isHidden = empty($data['code']);
        if ($isHidden && empty($data['user_id'])) {
            throw ValidationException::withMessages(['user_id' => 'الكوبون بدون كود لازم يكون مخصصاً لزبون محدد']);
        }

        $data['code'] = $isHidden ? 'PRIV-' . strtoupper(Str::random(8)) : strtoupper($data['code']);
        $data['is_hidden'] = $isHidden;

        Coupon::create($data);

        return back()->with('success', 'تم إنشاء الكوبون ✅');
    }

    public function update(Request $request, Coupon $coupon)
    {
        $data = $request->validate([
            'user_id' => 'nullable|exists:users,id',
            'type' => 'required|in:percentage,fixed',
            'value' => 'required|numeric|min:0.01',
            'expires_at' => 'nullable|date',
            'usage_limit' => 'nullable|integer|min:1',
            'is_active' => 'required|boolean',
        ]);

        $coupon->update($data);

        return back()->with('success', 'تم تحديث الكوبون ✅');
    }

    public function destroy(Coupon $coupon)
    {
        $coupon->delete();
        return back()->with('success', 'تم حذف الكوبون');
    }
}
