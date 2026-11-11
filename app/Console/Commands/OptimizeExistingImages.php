<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;
use Intervention\Image\Drivers\Gd\Driver;
use Intervention\Image\Encoders\JpegEncoder;
use Intervention\Image\Encoders\PngEncoder;
use Intervention\Image\Encoders\WebpEncoder;
use Intervention\Image\ImageManager;
use Intervention\Image\Interfaces\EncoderInterface;

/**
 * Re-processes every already-uploaded image under storage/app/public through
 * the same scaleDown()+quality-60 pass ImageCompressionService now applies on
 * upload. Needed because that service originally only reduced JPEG quality
 * and left dimensions untouched, so every image uploaded before that fix is
 * still a full 3000-4000px phone photo — that's what was making the storefront
 * slow (the browser downloads and decodes the full photo just to show a small
 * thumbnail). Overwrites files in place at the same path, so no database
 * column needs updating. Safe to re-run: already-small files are left alone.
 */
class OptimizeExistingImages extends Command
{
    protected $signature = 'images:optimize {--dry-run : List what would change without writing anything} {--limit= : Only process this many files (for a quick test run)}';
    protected $description = 'Shrink existing product/category images that were uploaded before dimension-capping was added';

    private const MAX_DIMENSION = 1600;
    private const JPEG_QUALITY = 60;
    private const DIRECTORIES = ['products', 'categories'];

    public function handle(): int
    {
        $dryRun = (bool) $this->option('dry-run');
        $limit = $this->option('limit') ? (int) $this->option('limit') : null;
        $disk = Storage::disk('public');
        $manager = new ImageManager(new Driver());

        $totalBefore = 0;
        $totalAfter = 0;
        $processed = 0;
        $skipped = 0;
        $failed = 0;

        foreach (self::DIRECTORIES as $directory) {
            if (! $disk->exists($directory)) {
                continue;
            }

            foreach ($disk->files($directory) as $path) {
                if ($limit !== null && $processed >= $limit) {
                    break 2;
                }

                if (! preg_match('/\.(jpe?g|png|webp)$/i', $path)) {
                    continue;
                }

                $before = $disk->size($path);

                try {
                    $image = $manager->decodePath($disk->path($path));
                } catch (\Throwable $e) {
                    $this->warn("  ! could not decode {$path}: {$e->getMessage()}");
                    $failed++;
                    continue;
                }

                if ($image->width() <= self::MAX_DIMENSION && $image->height() <= self::MAX_DIMENSION) {
                    $skipped++;
                    continue;
                }

                $encoded = $image
                    ->scaleDown(width: self::MAX_DIMENSION, height: self::MAX_DIMENSION)
                    ->encode($this->encoderFor($path));

                $after = strlen($encoded->toString());

                $this->line(sprintf(
                    '  %s %s: %s -> %s',
                    $dryRun ? '[dry-run]' : '[resized]',
                    $path,
                    $this->formatBytes($before),
                    $this->formatBytes($after)
                ));

                if (! $dryRun) {
                    $disk->put($path, $encoded->toString());
                }

                $totalBefore += $before;
                $totalAfter += $after;
                $processed++;
            }
        }

        $this->info(sprintf(
            "\nDone. %d resized, %d already small enough, %d failed to decode.",
            $processed,
            $skipped,
            $failed
        ));

        if ($processed > 0) {
            $this->info(sprintf(
                'Size: %s -> %s (saved %s)',
                $this->formatBytes($totalBefore),
                $this->formatBytes($totalAfter),
                $this->formatBytes($totalBefore - $totalAfter)
            ));
        }

        return self::SUCCESS;
    }

    /**
     * Re-encode in the file's own existing format — never force a different
     * extension, since the stored path (and the database column pointing at
     * it) isn't changing. A .webp file gets a smaller .webp back, not a .jpg
     * with a lying extension.
     */
    private function encoderFor(string $path): EncoderInterface
    {
        return match (true) {
            str_ends_with(strtolower($path), '.png') => new PngEncoder(),
            str_ends_with(strtolower($path), '.webp') => new WebpEncoder(quality: self::JPEG_QUALITY, strip: true),
            default => new JpegEncoder(quality: self::JPEG_QUALITY, strip: true),
        };
    }

    private function formatBytes(int $bytes): string
    {
        return $bytes >= 1048576
            ? round($bytes / 1048576, 2).' MB'
            : round($bytes / 1024, 1).' KB';
    }
}
