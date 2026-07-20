<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SiteSetting;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SiteSettingController extends Controller
{
    public function edit()
    {
        return Inertia::render('Admin/SiteSettings', [
            'settings' => SiteSetting::current(),
        ]);
    }

    public function update(Request $request)
    {
        $data = $request->validate([
            'whatsapp_number' => 'nullable|string|max:20',
            'instagram_url' => 'nullable|url|max:255',
            'tiktok_url' => 'nullable|url|max:255',
            'facebook_url' => 'nullable|url|max:255',
        ]);

        SiteSetting::current()->update($data);

        return back()->with('success', 'تم تحديث بيانات التواصل ✅');
    }
}
