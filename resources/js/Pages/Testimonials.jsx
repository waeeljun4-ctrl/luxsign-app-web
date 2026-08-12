import { Head, Link, usePage } from '@inertiajs/react';
import WhatsAppButton from '../Components/WhatsAppButton';
import { WA_LINK, waMsg } from '../config';

function Stars({ n }) {
    return (
        <div className="flex gap-0.5">
            {[...Array(5)].map((_, i) => (
                <span key={i} className={i < n ? 'text-gold' : 'text-cream-3'}>★</span>
            ))}
        </div>
    );
}

export default function Testimonials({ reviews }) {
    const { siteSettings } = usePage().props;
    const waNumber = siteSettings?.whatsapp_number;

    return (
        <>
            <Head title="آراء زبائننا — LuxSign 141" />

            {/* Nav */}
            <nav className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-cream-3 h-14 flex items-center justify-between px-4 shadow-sm font-cairo">
                <Link href="/" className="text-lg font-black text-ink">
                    Lux<span className="text-gold">Sign.141</span>
                </Link>
                <div className="flex items-center gap-3 text-sm font-bold">
                    <Link href="/" className="text-muted hover:text-ink transition-colors">المتجر</Link>
                    <Link href="/portfolio" className="text-muted hover:text-ink transition-colors">معرض الأعمال</Link>
                    {waNumber && (
                        <a href={WA_LINK(waMsg('استفسار', '', ''), waNumber)} target="_blank" rel="noreferrer"
                            className="bg-green-500 text-white px-3 py-1.5 rounded-xl hover:bg-green-600 transition-colors text-xs">
                            واتساب
                        </a>
                    )}
                </div>
            </nav>

            {/* Hero */}
            <div className="bg-gradient-to-b from-ink to-ink/90 text-white text-center py-14 px-4 font-cairo">
                <p className="text-gold text-xs font-bold tracking-widest uppercase mb-3">آراء حقيقية من زبائننا</p>
                <h1 className="text-3xl font-black mb-3">آراء زبائننا</h1>
                <p className="text-white/50 text-sm max-w-md mx-auto leading-relaxed">
                    ثقتكم هي أكبر جائزة نحصل عليها — كل كلمة شكر تزيدنا إصراراً على التميّز
                </p>
            </div>

            {/* Reviews grid */}
            <div className="max-w-5xl mx-auto px-3 py-10 font-cairo">
                {reviews.length === 0 ? (
                    <p className="text-center text-muted text-sm py-16">ما في آراء منشورة بعد</p>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {reviews.map(r => (
                            <div key={r.id} className="bg-white rounded-2xl border border-cream-3 p-5 hover:shadow-md transition-shadow">
                                <div className="flex items-start gap-3 mb-3">
                                    <div className="w-10 h-10 bg-gradient-to-br from-ink to-gold rounded-xl overflow-hidden flex items-center justify-center font-black text-white shrink-0">
                                        {r.image ? <img src={`/storage/${r.image}`} alt={r.customer_name} className="w-full h-full object-cover" /> : r.customer_name?.[0]}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-sm text-ink">{r.customer_name}</p>
                                        {r.city && <p className="text-xs text-muted">📍 {r.city}</p>}
                                    </div>
                                </div>
                                <Stars n={r.stars} />
                                <p className="text-sm text-ink/80 leading-relaxed mt-2 mb-3">"{r.text}"</p>
                                {r.video && (
                                    <video src={`/storage/${r.video}`} controls className="w-full rounded-xl mb-3 bg-black" />
                                )}
                                {r.product_name && (
                                    <span className="text-xs bg-gold-pale text-gold font-bold px-2 py-0.5 rounded-full">
                                        {r.product_name}
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* CTA */}
                <div className="mt-12 bg-gradient-to-r from-ink to-ink/90 rounded-2xl p-6 text-center">
                    <p className="text-gold font-bold text-xs tracking-widest uppercase mb-2">انضم لعائلة LuxSign</p>
                    <h3 className="text-white font-black text-xl mb-2">اطلب منتجك الآن</h3>
                    <p className="text-white/40 text-sm mb-5">توصيل لجميع مناطق الضفة — جودة مضمونة أو استرداد كامل</p>
                    {waNumber && (
                        <a href={WA_LINK(waMsg('طلب جديد', '', ''), waNumber)} target="_blank" rel="noreferrer"
                            className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold px-6 py-3 rounded-xl transition-colors">
                            💬 اطلب عبر واتساب
                        </a>
                    )}
                </div>
            </div>

            <footer className="bg-ink px-4 py-8 text-center font-cairo">
                <p className="font-black text-gold text-lg mb-1">LuxSign 141</p>
                <p className="text-white/30 text-xs mb-4">تصميم وتنفيذ لوحات ولوحات مضيئة LED · فلسطين</p>
                <div className="flex justify-center gap-4 text-xs text-white/30 mb-3">
                    <Link href="/" className="hover:text-gold transition-colors">المتجر</Link>
                    <Link href="/portfolio" className="hover:text-gold transition-colors">معرض الأعمال</Link>
                    <Link href="/testimonials" className="hover:text-gold transition-colors">آراء الزبائن</Link>
                </div>
                <p className="text-white/15 text-xs">© 2025 LuxSign 141 — صُنع بـ ❤️ في فلسطين</p>
            </footer>
            <WhatsAppButton />
        </>
    );
}
