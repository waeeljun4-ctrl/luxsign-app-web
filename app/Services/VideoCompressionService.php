<?php

namespace App\Services;

use FFMpeg\FFMpeg;
use FFMpeg\Format\Video\X264;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

/**
 * Re-encodes uploaded product videos to H.264/AAC mp4 at CRF 28 — the video
 * equivalent of "JPEG quality 60": same resolution, smart compression,
 * minimal visible quality loss for a big file-size win.
 *
 * This runs SYNCHRONOUSLY inside the upload request, deliberately not queued.
 * Queueing would require a persistent `queue:work` process plus a job-status
 * polling UI in the admin panel — real infrastructure that doesn't exist yet.
 * A synchronous encode is an acceptable trade-off here because this is an
 * infrequent admin-only action (uploading a product video), not a
 * customer-facing high-volume flow.
 */
class VideoCompressionService
{
    private const CRF = 28;
    private const PRESET = 'medium';

    public function compressAndStore(UploadedFile $file, string $directory, string $disk = 'public'): string
    {
        $ffmpeg = FFMpeg::create([
            'ffmpeg.binaries'  => config('services.ffmpeg.binary'),
            'ffprobe.binaries' => config('services.ffmpeg.probe'),
            'timeout'          => 3600,
            'ffmpeg.threads'   => 0,
        ]);

        $video = $ffmpeg->open($file->getRealPath());

        $format = new X264('aac', 'libx264');
        // Force single-pass, CRF-driven encoding instead of a target bitrate
        // (php-ffmpeg two-pass-encodes whenever kiloBitrate > 0, which would
        // fight with -crf). No -vf/scale filter is applied anywhere here, so
        // width/height are always identical to the source.
        $format->setKiloBitrate(0);
        $format->setAdditionalParameters(['-crf', (string) self::CRF, '-preset', self::PRESET]);

        $tempPath = tempnam(sys_get_temp_dir(), 'vidcomp_').'.mp4';

        try {
            $video->save($format, $tempPath);

            $path = $directory.'/'.Str::random(40).'.mp4';
            // Stream the file to storage instead of file_get_contents() — a
            // compressed video can easily exceed PHP's memory_limit if read
            // fully into a string first.
            $stream = fopen($tempPath, 'r');
            Storage::disk($disk)->put($path, $stream);
            if (is_resource($stream)) fclose($stream);

            return $path;
        } finally {
            if (file_exists($tempPath)) {
                @unlink($tempPath);
            }
        }
    }
}
