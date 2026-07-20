<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\CourierCompany;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CourierCompanyController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/CourierCompanies', [
            'companies' => CourierCompany::latest()->get()->map(fn ($c) => [
                'id' => $c->id,
                'name' => $c->name,
                'login_url' => $c->login_url,
                'add_shipment_url' => $c->add_shipment_url,
                'has_username' => (bool) $c->username,
                'field_map' => $c->field_map,
                'is_active' => $c->is_active,
                'last_used_at' => $c->last_used_at,
            ]),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:100',
            'login_url' => 'required|url|max:255',
            'add_shipment_url' => 'nullable|url|max:255',
            'username' => 'required|string|max:255',
            'password' => 'required|string|max:255',
            'field_map' => 'required|array',
        ]);

        CourierCompany::create($data);

        return back()->with('success', 'تمت إضافة شركة التوصيل ✅');
    }

    public function update(Request $request, CourierCompany $courierCompany)
    {
        $data = $request->validate([
            'name' => 'required|string|max:100',
            'login_url' => 'required|url|max:255',
            'add_shipment_url' => 'nullable|url|max:255',
            'username' => 'nullable|string|max:255',
            'password' => 'nullable|string|max:255',
            'field_map' => 'required|array',
            'is_active' => 'required|boolean',
        ]);

        if (empty($data['username'])) unset($data['username']);
        if (empty($data['password'])) unset($data['password']);

        $courierCompany->update($data);

        return back()->with('success', 'تم تحديث شركة التوصيل ✅');
    }

    public function destroy(CourierCompany $courierCompany)
    {
        $courierCompany->delete();
        return back()->with('success', 'تم حذف شركة التوصيل');
    }
}
