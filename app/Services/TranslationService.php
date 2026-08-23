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

        // Hebrew-speaking customers are shown "Israel" for delivery-area
        // copy instead of a literal "West Bank" translation — only the
        // Hebrew output is affected; the stored Arabic text is untouched.
        if ($targetLang === 'he') {
            $text = str_replace(['الضفة الغربية', 'الضفة'], 'إسرائيل', $text);
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

            if (!is_string($translated) || $translated === '') {
                return null;
            }

            // MyMemory occasionally returns XLIFF/HTML markup artifacts for
            // non-linguistic input (bare numbers, symbols, sizes like 16") —
            // strip that out so garbage never gets saved or overflows a column.
            $translated = trim(strip_tags($translated));

            return $translated !== '' ? mb_substr($translated, 0, 490) : null;
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
