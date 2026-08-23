<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SpecTemplate;
use App\Models\SpecTemplateField;
use App\Services\TranslationService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SpecTemplateController extends Controller
{
    public function __construct(private TranslationService $translator)
    {
    }

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
        $data = $request->validate([
            'label' => 'required|string|max:100',
            'label_he' => 'nullable|string|max:100',
            'label_en' => 'nullable|string|max:100',
            'field_type' => 'required|in:text,number,select,boolean,preview',
            'preview_shape' => 'nullable|in:circle,rectangle',
            'options' => 'nullable|array',
            'options.*' => 'string|max:100',
            'options_he' => 'nullable|array',
            'options_he.*' => 'nullable|string|max:100',
            'options_en' => 'nullable|array',
            'options_en.*' => 'nullable|string|max:100',
        ]);

        $data['label_he'] = $this->translator->translate($data['label'], 'he');
        $data['label_en'] = $this->translator->translate($data['label'], 'en');
        $data['options_he'] = $this->translator->translateArray($data['options'] ?? null, 'he');
        $data['options_en'] = $this->translator->translateArray($data['options'] ?? null, 'en');

        return $data;
    }
}
