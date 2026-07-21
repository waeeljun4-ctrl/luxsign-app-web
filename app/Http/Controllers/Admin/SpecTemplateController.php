<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SpecTemplate;
use App\Models\SpecTemplateField;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SpecTemplateController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/SpecTemplates', [
            'templates' => SpecTemplate::with('fields')->orderBy('name')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate(['name' => 'required|string|max:100']);
        SpecTemplate::create($data);

        return back()->with('success', 'تم إنشاء القالب.');
    }

    public function destroy(SpecTemplate $specTemplate)
    {
        $specTemplate->delete();

        return back()->with('success', 'تم حذف القالب.');
    }

    public function storeField(Request $request, SpecTemplate $specTemplate)
    {
        $data = $this->validatedField($request);
        $data['sort_order'] = (int) $specTemplate->fields()->max('sort_order') + 1;
        $specTemplate->fields()->create($data);

        return back()->with('success', 'تمت إضافة الحقل.');
    }

    public function updateField(Request $request, SpecTemplate $specTemplate, SpecTemplateField $field)
    {
        abort_unless($field->spec_template_id === $specTemplate->id, 404);
        $field->update($this->validatedField($request));

        return back()->with('success', 'تم تحديث الحقل.');
    }

    public function destroyField(SpecTemplate $specTemplate, SpecTemplateField $field)
    {
        abort_unless($field->spec_template_id === $specTemplate->id, 404);
        $field->delete();

        return back()->with('success', 'تم حذف الحقل.');
    }

    private function validatedField(Request $request): array
    {
        return $request->validate([
            'label' => 'required|string|max:100',
            'field_type' => 'required|in:text,number,select,boolean',
            'options' => 'nullable|array',
            'options.*' => 'string|max:100',
        ]);
    }
}
