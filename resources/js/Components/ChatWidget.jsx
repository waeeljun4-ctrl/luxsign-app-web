import { useState, useRef, useEffect } from 'react';
import axios from 'axios';

const QUICK_QUESTIONS = [
    'كيف أحسب السعر؟',
    'ما هي الأحجام المتاحة؟',
    'كم سعر النمرة؟',
    'كيف أطلب؟',
];

export default function ChatWidget() {
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'assistant', content: 'أهلاً! أنا مساعد LuxSign 141 🌟\nكيف أقدر أساعدك اليوم؟' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const bottomRef = useRef(null);

    useEffect(() => {
        if (open) bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, open]);

    async function sendMessage(text) {
        const userText = (text || input).trim();
        if (!userText || loading) return;

        const newMessages = [...messages, { role: 'user', content: userText }];
        setMessages(newMessages);
        setInput('');
        setLoading(true);

        try {
            const apiMessages = newMessages
                .filter(m => m.role !== 'assistant' || newMessages.indexOf(m) > 0)
                .map(m => ({ role: m.role, content: m.content }));

            const res = await axios.post('/chat', { messages: apiMessages });

            setMessages(prev => [...prev, { role: 'assistant', content: res.data.reply }]);
        } catch (err) {
            const errMsg = err.response?.status === 503
                ? 'المساعد الذكي غير متاح حالياً — تواصل معنا مباشرة 💬'
                : 'عذراً، حدث خطأ. تواصل معنا عبر واتساب 💬';
            setMessages(prev => [...prev, { role: 'assistant', content: errMsg }]);
        }
        setLoading(false);
    }

    function handleKey(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    }

    return (
        <>
            {/* FAB Button */}
            <button
                onClick={() => setOpen(o => !o)}
                className="fixed bottom-5 left-5 z-40 w-13 h-13 bg-ink rounded-full flex items-center justify-center text-white shadow-xl hover:bg-gold transition-all duration-300 text-xl"
                style={{ width: 52, height: 52 }}
                aria-label="المساعد الذكي"
            >
                {open ? '✕' : '💬'}
            </button>

            {/* Chat Panel */}
            {open && (
                <div className="fixed bottom-20 left-5 z-40 w-80 bg-white rounded-2xl shadow-2xl border border-cream-3 flex flex-col overflow-hidden"
                    style={{ height: 420 }}>

                    {/* Header */}
                    <div className="bg-ink px-4 py-3 flex items-center gap-3 shrink-0">
                        <div className="w-8 h-8 bg-gold rounded-full flex items-center justify-center text-white font-black text-sm shrink-0">ل</div>
                        <div>
                            <p className="text-white font-bold text-sm">مساعد LuxSign</p>
                            <p className="text-white/40 text-xs">متصل الآن</p>
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2.5">
                        {messages.map((msg, i) => (
                            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-start' : 'justify-end'}`}>
                                <div className={`max-w-[85%] px-3 py-2 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap
                                    ${msg.role === 'user'
                                        ? 'bg-cream text-ink rounded-tr-sm'
                                        : 'bg-ink text-white rounded-tl-sm'}`}>
                                    {msg.content}
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div className="flex justify-end">
                                <div className="bg-ink text-white px-4 py-2 rounded-2xl rounded-tl-sm text-sm">
                                    <span className="inline-flex gap-1">
                                        <span className="animate-bounce" style={{ animationDelay: '0ms' }}>.</span>
                                        <span className="animate-bounce" style={{ animationDelay: '100ms' }}>.</span>
                                        <span className="animate-bounce" style={{ animationDelay: '200ms' }}>.</span>
                                    </span>
                                </div>
                            </div>
                        )}
                        <div ref={bottomRef} />
                    </div>

                    {/* Quick questions */}
                    {messages.length <= 1 && (
                        <div className="px-3 pb-2 flex flex-wrap gap-1.5 shrink-0">
                            {QUICK_QUESTIONS.map((q, i) => (
                                <button key={i} onClick={() => sendMessage(q)}
                                    className="text-xs bg-cream text-muted border border-cream-3 px-2.5 py-1.5 rounded-full hover:border-gold hover:text-gold transition-colors font-cairo">
                                    {q}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Input */}
                    <div className="border-t border-cream-3 px-3 py-2.5 flex gap-2 shrink-0">
                        <input
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={handleKey}
                            placeholder="اكتب سؤالك..."
                            disabled={loading}
                            className="flex-1 bg-cream border border-cream-3 rounded-xl px-3 py-2 text-sm text-ink outline-none focus:border-gold font-cairo transition-colors disabled:opacity-60"
                        />
                        <button
                            onClick={() => sendMessage()}
                            disabled={loading || !input.trim()}
                            className="bg-ink text-white w-9 h-9 rounded-xl flex items-center justify-center hover:bg-gold transition-colors disabled:opacity-40 shrink-0">
                            ←
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
