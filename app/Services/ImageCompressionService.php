<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Intervention\Image\Drivers\Gd\Driver;
use Intervention\Image\Encoders\JpegEncoder;
use Intervention\Image\ImageManager;

/**
 * Compresses uploaded product/category/hero-slide images to quality-60 JPEGs
 * before storing them. A phone photo (often 3000-4000px, several MB) is
 * capped to a sane display size first — nothing on the storefront ever
 * renders a product photo anywhere near full resolution, so shipping the
 * original pixel count was pure waste. scaleDown() never upscales a smaller
 * image, so this is a no-op for already-small uploads.
 */
class ImageCompressionService
{
    private const JPEG_QUALITY = 60;
    private const MAX_DIMENSION = 1600;

    public function compressAndStore(UploadedFile $file, string $directory, string $disk = 'public'): string
    {
        $manager = new ImageManager(new Driver());
        $encoded = $manager->decodePath($file->getRealPath())
            ->scaleDown(width: self::MAX_DIMENSION, height: self::MAX_DIMENSION)
            ->encode(new JpegEncoder(quality: self::JPEG_QUALITY, strip: true));

        $path = $directory.'/'.Str::random(40).'.jpg';
        Storage::disk($disk)->put($path, $encoded->toString());

        return $path;
    }
}
