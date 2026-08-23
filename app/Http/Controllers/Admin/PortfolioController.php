<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\PortfolioProject;
use App\Services\ImageCompressionService;
use App\Services\TranslationService;
use App\Services\VideoCompressionService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class PortfolioController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/Portfolio', [
            'projects' => PortfolioProject::orderBy('sort_order')->get(),
        ]);
    }

    private function validateFields(): array
    {
        return [
            'title'           => 'required|string|max:100',
            'title_he'        => 'nullable|string|max:150',
            'title_en'        => 'nullable|string|max:150',
            'description'     => 'nullable|string|max:500',
            'description_he'  => 'nullable|string|max:500',
            'description_en'  => 'nullable|string|max:500',
            'category'        => 'nullable|string|max:50',
            'image'           => 'nullable|image|max:10240',
            'video'           => 'nullable|mimetypes:video/mp4,video/quicktime,video/x-msvideo,video/webm|max:2097152',
            'sort_order'      => 'integer',
            'is_active'       => 'boolean',
        ];
    }

    public function store(Request $request, ImageCompressionService $imageCompressor, VideoCompressionService $videoCompressor, TranslationService $translator)
    {
        $data = $request->validate($this->validateFields());

        $data['title_he'] = $translator->translate($data['title'], 'he');
        $data['title_en'] = $translator->translate($data['title'], 'en');
        $data['description_he'] = $translator->translate($data['description'] ?? null, 'he');
        $data['description_en'] = $translator->translate($data['description'] ?? null, 'en');

        if ($request->hasFile('image')) {
            $data['image'] = $imageCompressor->compressAndStore($request->file('image'), 'portfolio');
        }
        if ($request->hasFile('video')) {
            $data['video'] = $videoCompressor->compressAndStore($request->file('video'), 'portfolio/videos');
        }

        PortfolioProject::create($data);
        return back()->with('success', 'تمت إضافة العمل ✅');
    }

    public function update(Request $request, PortfolioProject $portfolioProject)
    {
        $imageCompressor = app(ImageCompressionService::class);
        $videoCompressor = app(VideoCompressionService::class);
        $translator = app(TranslationService::class);
        $data = $request->validate($this->validateFields());

        $data['title_he'] = $translator->translate($data['title'], 'he');
        $data['title_en'] = $translator->translate($data['title'], 'en');
        $data['description_he'] = $translator->translate($data['description'] ?? null, 'he');
        $data['description_en'] = $translator->translate($data['description'] ?? null, 'en');

        if ($request->hasFile('image')) {
            if ($portfolioProject->image) Storage::disk('public')->delete($portfolioProject->image);
            $data['image'] = $imageCompressor->compressAndStore($request->file('image'), 'portfolio');
        }
        if ($request->hasFile('video')) {
            if ($portfolioProject->video) Storage::disk('public')->delete($portfolioProject->video);
            $data['video'] = $videoCompressor->compressAndStore($request->file('video'), 'portfolio/videos');
        }

        $portfolioProject->update($data);
        return back()->with('success', 'تم تحديث العمل ✅');
    }

    public function destroyImage(PortfolioProject $portfolioProject)
    {
        if ($portfolioProject->image) {
            Storage::disk('public')->delete($portfolioProject->image);
            $portfolioProject->update(['image' => null]);
        }
        return back()->with('success', 'تم حذف الصورة');
    }

    public function destroyVideo(PortfolioProject $portfolioProject)
    {
        if ($portfolioProject->video) {
            Storage::disk('public')->delete($portfolioProject->video);
            $portfolioProject->update(['video' => null]);
        }
        return back()->with('success', 'تم حذف الفيديو');
    }

    public function destroy(PortfolioProject $portfolioProject)
    {
        if ($portfolioProject->image) Storage::disk('public')->delete($portfolioProject->image);
        if ($portfolioProject->video) Storage::disk('public')->delete($portfolioProject->video);
        $portfolioProject->delete();
        return back()->with('success', 'تم حذف العمل');
    }
}
