<?php

namespace App\Http\Controllers;

use App\Models\Coupon;
use Illuminate\Http\Request;

class CouponController extends Controller
{
    public function validateCode(Request $request)
    {
        $data = $request->validate([
            'code' => 'required|string|max:40',
            'total' => 'required|numeric|min:0',
        ]);

        $coupon = Coupon::whereRaw('UPPER(code) = ?', [strtoupper($data['code'])])->first();

        if (! $coupon || ! $coupon->isValid()) {
            return response()->json(['valid' => false, 'message' => 'كود الخصم غير صالح'], 422);
        }

        if ($coupon->user_id && $coupon->user_id !== optional($request->user())->id) {
            return response()->json(['valid' => false, 'message' => 'هذا الكوبون غير متاح لحسابك'], 422);
        }

        $discount = $coupon->discountFor((float) $data['total']);

        return response()->json([
            'valid' => true,
            'discount' => $discount,
            'message' => "تم تطبيق الكوبون — خصم {$discount}₪",
        ]);
    }

    /** Coupons privately assigned to the logged-in customer (shown as an "activate" offer, never typed). */
    public function myCoupons(Request $request)
    {
        $user = $request->user();
        if (! $user) {
            return response()->json(['coupons' => []]);
        }

        $coupons = Coupon::where('user_id', $user->id)->get()->filter->isValid()->values();

        return response()->json([
            'coupons' => $coupons->map(fn ($c) => [
                'code' => $c->code,
                'type' => $c->type,
                'value' => $c->value,
                'expires_at' => $c->expires_at,
            ]),
        ]);
    }
}
