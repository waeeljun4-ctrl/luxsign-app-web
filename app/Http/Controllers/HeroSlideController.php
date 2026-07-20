<?php

namespace App\Http\Controllers;

use App\Models\HeroSlide;
use App\Services\ImageCompressionService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class HeroSlideController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/HeroSlides', [
            'slides' => HeroSlide::orderBy('sort_order')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'title'       => 'required|string|max:80',
            'title_he'    => 'nullable|string|max:100',
            'title_en'    => 'nullable|string|max:100',
            'subtitle'    => 'nullable|string|max:180',
            'subtitle_he' => 'nullable|string|max:220',
            'subtitle_en' => 'nullable|string|max:220',
            'cta_text'    => 'nullable|string|max:40',
            'cta_text_he' => 'nullable|string|max:50',
            'cta_text_en' => 'nullable|string|max:50',
            'cta_link'    => 'nullable|string|max:255',
            'sort_order'  => 'integer',
            'is_active'   => 'boolean',
        ]);

        HeroSlide::create($data);
        return back()->with('success', 'تم إضافة الشريحة ✅');
    }

    public function update(Request $request, HeroSlide $heroSlide)
    {
        $data = $request->validate([
            'title'       => 'required|string|max:80',
            'title_he'    => 'nullable|string|max:100',
            'title_en'    => 'nullable|string|max:100',
            'subtitle'    => 'nullable|string|max:180',
            'subtitle_he' => 'nullable|string|max:220',
            'subtitle_en' => 'nullable|string|max:220',
            'cta_text'    => 'nullable|string|max:40',
            'cta_text_he' => 'nullable|string|max:50',
            'cta_text_en' => 'nullable|string|max:50',
            'cta_link'    => 'nullable|string|max:255',
            'sort_order'  => 'integer',
            'is_active'   => 'boolean',
        ]);

        $heroSlide->update($data);
        return back()->with('success', 'تم تحديث الشريحة ✅');
    }

    public function uploadImage(Request $request, HeroSlide $heroSlide, ImageCompressionService $imageCompressor)
    {
        $request->validate(['image' => 'required|image|max:10240']);
        if ($heroSlide->image) Storage::disk('public')->delete($heroSlide->image);
        $heroSlide->update(['image' => $imageCompressor->compressAndStore($request->file('image'), 'hero-slides')]);
        return back()->with('success', 'تم رفع صورة الشريحة ✅');
    }

    public function destroyImage(HeroSlide $heroSlide)
    {
        if ($heroSlide->image) {
            Storage::disk('public')->delete($heroSlide->image);
            $heroSlide->update(['image' => null]);
        }
        return back()->with('success', 'تم حذف الصورة');
    }

    public function reorder(Request $request)
    {
        $data = $request->validate(['order' => 'required|array', 'order.*' => 'integer']);
        foreach ($data['order'] as $i => $id) {
            HeroSlide::whereKey($id)->update(['sort_order' => $i]);
        }
        return back();
    }

    public function destroy(HeroSlide $heroSlide)
    {
        if ($heroSlide->image) Storage::disk('public')->delete($heroSlide->image);
        $heroSlide->delete();
        return back()->with('success', 'تم الحذف');
    }
}
