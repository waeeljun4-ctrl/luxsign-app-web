<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ProductSpecField;
use App\Models\SpecTemplate;
use Illuminate\Http\Request;

class ProductSpecFieldController extends Controller
{
    /**
     * Copies a template's fields into this product's own, independent
     * field set — from this point on the product's fields are its own;
     * editing the template (or another product that used it) never
     * touches what just got copied here.
     */
    public function applyTemplate(Request $request, Product $product)
    {
        $data = $request->validate(['spec_template_id' => 'required|exists:spec_templates,id']);
        $template = SpecTemplate::with('fields')->findOrFail($data['spec_template_id']);

        $nextSort = (int) $product->specFields()->max('sort_order');
        foreach ($template->fields as $field) {
            $nextSort++;
            $product->specFields()->create([
                'label' => $field->label,
                'label_he' => $field->label_he,
                'label_en' => $field->label_en,
                'field_type' => $field->field_type,
                'options' => $field->options,
                'options_he' => $field->options_he,
                'options_en' => $field->options_en,
                'is_required' => false,
                'sort_order' => $nextSort,
            ]);
        }

        return back()->with('success', 'تم تطبيق القالب على هذا المنتج.');
    }

    public function store(Request $request, Product $product)
    {
        $data = $this->validatedField($request);
        $data['sort_order'] = (int) $product->specFields()->max('sort_order') + 1;
        $product->specFields()->create($data);

        return back()->with('success', 'تمت إضافة الحقل.');
    }

    public function update(Request $request, Product $product, ProductSpecField $specField)
    {
        abort_unless($specField->product_id === $product->id, 404);
        $specField->update($this->validatedField($request));

        return back()->with('success', 'تم تحديث الحقل.');
    }

    public function destroy(Product $product, ProductSpecField $specField)
    {
        abort_unless($specField->product_id === $product->id, 404);
        $specField->delete();

        return back()->with('success', 'تم حذف الحقل.');
    }

    private function validatedField(Request $request): array
    {
        return $request->validate([
            'label' => 'required|string|max:100',
            'label_he' => 'nullable|string|max:100',
            'label_en' => 'nullable|string|max:100',
            'field_type' => 'required|in:text,number,select,boolean',
            'options' => 'nullable|array',
            'options.*' => 'string|max:100',
            'options_he' => 'nullable|array',
            'options_he.*' => 'nullable|string|max:100',
            'options_en' => 'nullable|array',
            'options_en.*' => 'nullable|string|max:100',
            'is_required' => 'boolean',
        ]);
    }
}
