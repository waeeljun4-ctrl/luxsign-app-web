<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Auto-translates Arabic admin input to Hebrew/English via the free
 * MyMemory API, so the admin only ever types Arabic — the he/en
 * database columns are always derived automatically at save time.
 */
class TranslationService
{
    private const ENDPOINT = 'https://api.mymemory.translated.net/get';

    public function translate(?string $text, string $targetLang): ?string
    {
        $text = trim((string) $text);
        if ($text === '') {
            return null;
        }

        try {
            $response = Http::timeout(8)->get(self::ENDPOINT, [
                'q'        => $text,
                'langpair' => "ar|{$targetLang}",
                'de'       => 'waeeljun4@gmail.com',
            ]);

            if (!$response->successful()) {
                return null;
            }

            $translated = $response->json('responseData.translatedText');

            return is_string($translated) && $translated !== '' ? $translated : null;
        } catch (\Throwable $e) {
            Log::warning('TranslationService failed', ['text' => $text, 'target' => $targetLang, 'error' => $e->getMessage()]);
            return null;
        }
    }

    /** @param string[]|null $items @return string[]|null */
    public function translateArray(?array $items, string $targetLang): ?array
    {
        if ($items === null) {
            return null;
        }

        return array_map(fn ($item) => $this->translate((string) $item, $targetLang), $items);
    }
}
