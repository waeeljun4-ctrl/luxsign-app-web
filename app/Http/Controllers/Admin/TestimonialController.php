<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Testimonial;
use App\Services\ImageCompressionService;
use App\Services\VideoCompressionService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class TestimonialController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/Testimonials', [
            'testimonials' => Testimonial::orderBy('sort_order')->get(),
        ]);
    }

    private function validateFields(): array
    {
        return [
            'customer_name'  => 'required|string|max:100',
            'city'           => 'nullable|string|max:60',
            'stars'          => 'required|integer|min:1|max:5',
            'text'           => 'required|string|max:800',
            'text_he'        => 'nullable|string|max:800',
            'text_en'        => 'nullable|string|max:800',
            'product_name'   => 'nullable|string|max:100',
            'image'          => 'nullable|image|max:10240',
            'video'          => 'nullable|mimetypes:video/mp4,video/quicktime,video/x-msvideo,video/webm|max:2097152',
            'sort_order'     => 'integer',
            'is_active'      => 'boolean',
        ];
    }

    public function store(Request $request, ImageCompressionService $imageCompressor, VideoCompressionService $videoCompressor)
    {
        $data = $request->validate($this->validateFields());

        if ($request->hasFile('image')) {
            $data['image'] = $imageCompressor->compressAndStore($request->file('image'), 'testimonials');
        }
        if ($request->hasFile('video')) {
            $data['video'] = $videoCompressor->compressAndStore($request->file('video'), 'testimonials/videos');
        }

        Testimonial::create($data);
        return back()->with('success', 'تمت إضافة رأي الزبون ✅');
    }

    public function update(Request $request, Testimonial $testimonial)
    {
        $imageCompressor = app(ImageCompressionService::class);
        $videoCompressor = app(VideoCompressionService::class);
        $data = $request->validate($this->validateFields());

        if ($request->hasFile('image')) {
            if ($testimonial->image) Storage::disk('public')->delete($testimonial->image);
            $data['image'] = $imageCompressor->compressAndStore($request->file('image'), 'testimonials');
        }
        if ($request->hasFile('video')) {
            if ($testimonial->video) Storage::disk('public')->delete($testimonial->video);
            $data['video'] = $videoCompressor->compressAndStore($request->file('video'), 'testimonials/videos');
        }

        $testimonial->update($data);
        return back()->with('success', 'تم تحديث رأي الزبون ✅');
    }

    public function destroyImage(Testimonial $testimonial)
    {
        if ($testimonial->image) {
            Storage::disk('public')->delete($testimonial->image);
            $testimonial->update(['image' => null]);
        }
        return back()->with('success', 'تم حذف الصورة');
    }

    public function destroyVideo(Testimonial $testimonial)
    {
        if ($testimonial->video) {
            Storage::disk('public')->delete($testimonial->video);
            $testimonial->update(['video' => null]);
        }
        return back()->with('success', 'تم حذف الفيديو');
    }

    public function destroy(Testimonial $testimonial)
    {
        if ($testimonial->image) Storage::disk('public')->delete($testimonial->image);
        if ($testimonial->video) Storage::disk('public')->delete($testimonial->video);
        $testimonial->delete();
        return back()->with('success', 'تم حذف الرأي');
    }
}
