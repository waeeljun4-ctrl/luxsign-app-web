<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class ChatController extends Controller
{
    private const SYSTEM_PROMPT = <<<'PROMPT'
أنت مساعد LuxSign 141، متجر فلسطيني متخصص في:
- قارمات LED مضيئة (750₪/م² — حد أدنى 150₪)
- لوحات سيارات (جوز 150₪ — مفردة 100₪)
- أحرف ديكور، لوحات CNC، ديكور إسلامي
- تصاميم مخصصة

الأسعار: القارمات المضيئة 750₪/م²، الحد الأدنى 150₪.
التوصيل لجميع مناطق فلسطين.
التواصل عبر واتساب.

أجب باللغة العربية، بإجابات مختصرة لا تزيد عن 3 جمل.
كن ودوداً ومهنياً. إذا سألوا عن سعر بقياس معين، احسب: (العرض/100 × الارتفاع/100 × 750)، حد أدنى 150₪.
PROMPT;

    /**
     * Proxies chat messages to Anthropic server-side so the API key never
     * reaches the browser — the widget used to call api.anthropic.com
     * directly with the key in a request header, which would have leaked
     * it to every visitor the moment a key was configured.
     */
    public function send(Request $request)
    {
        $key = config('services.anthropic.key');

        if (! $key) {
            return response()->json(['error' => 'unavailable'], 503);
        }

        $data = $request->validate([
            'messages' => 'required|array|min:1|max:20',
            'messages.*.role' => 'required|in:user,assistant',
            'messages.*.content' => 'required|string|max:2000',
        ]);

        $response = Http::withHeaders([
            'x-api-key' => $key,
            'anthropic-version' => '2023-06-01',
        ])->timeout(20)->post('https://api.anthropic.com/v1/messages', [
            'model' => 'claude-sonnet-4-6',
            'max_tokens' => 300,
            'system' => self::SYSTEM_PROMPT,
            'messages' => $data['messages'],
        ]);

        if ($response->failed()) {
            return response()->json(['error' => 'upstream'], 502);
        }

        return response()->json(['reply' => $response->json('content.0.text')]);
    }
}
