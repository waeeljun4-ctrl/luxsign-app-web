import { useMemo, useState } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import WhatsAppButton from '../Components/WhatsAppButton';
import { WA_LINK, waMsg } from '../config';

export default function Portfolio({ projects }) {
    const { siteSettings } = usePage().props;
    const waNumber = siteSettings?.whatsapp_number;
    const [active, setActive] = useState('all');

    const categories = useMemo(() => {
        const seen = new Set();
        const out = [{ key: 'all', label: 'الكل' }];
        for (const p of projects) {
            if (p.category && !seen.has(p.category)) {
                seen.add(p.category);
                out.push({ key: p.category, label: p.category });
            }
        }
        return out;
    }, [projects]);

    const filtered = active === 'all' ? projects : projects.filter(p => p.category === active);

    return (
        <>
            <Head title="معرض أعمالنا — LuxSign 141" />

            {/* Nav */}
            <nav className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-cream-3 h-14 flex items-center justify-between px-4 shadow-sm font-cairo">
                <Link href="/" className="text-lg font-black text-ink">
                    Lux<span className="text-gold">Sign.141</span>
                </Link>
                <div className="flex items-center gap-3 text-sm font-bold">
                    <Link href="/" className="text-muted hover:text-ink transition-colors">المتجر</Link>
                    <Link href="/testimonials" className="text-muted hover:text-ink transition-colors">آراء الزبائن</Link>
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
                <p className="text-gold text-xs font-bold tracking-widest uppercase mb-3">أعمال حقيقية لزبائن حقيقيين</p>
                <h1 className="text-3xl font-black mb-3">معرض أعمالنا</h1>
                <p className="text-white/50 text-sm max-w-md mx-auto leading-relaxed">
                    شغلنا الفعلي بكل مناطق فلسطين — من رام الله للخليل، من نابلس للقدس
                </p>
            </div>

            {/* Filters */}
            {categories.length > 1 && (
                <div className="bg-white border-b border-cream-3 sticky top-14 z-20 font-cairo">
                    <div className="flex gap-2 overflow-x-auto scrollbar-hide px-3 py-2.5">
                        {categories.map(c => (
                            <button key={c.key} onClick={() => setActive(c.key)}
                                className={`shrink-0 px-3.5 py-1.5 rounded-full text-sm font-bold border-[1.5px] whitespace-nowrap transition-colors
                                    ${active === c.key ? 'bg-ink text-white border-ink' : 'bg-cream border-cream-3 text-muted hover:border-ink hover:text-ink'}`}>
                                {c.label}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Grid */}
            <div className="max-w-5xl mx-auto px-3 py-8 font-cairo">
                <p className="text-xs text-muted mb-5 text-center">{filtered.length} عمل منجز</p>
                {filtered.length === 0 ? (
                    <p className="text-center text-muted text-sm py-16">ما في أعمال منشورة بعد</p>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                        {filtered.map(p => (
                            <div key={p.id}
                                className="bg-white rounded-2xl overflow-hidden border border-cream-3 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
                                <div className="h-36 bg-gradient-to-br from-ink to-gold flex items-center justify-center text-4xl overflow-hidden">
                                    {p.video ? (
                                        <video src={`/storage/${p.video}`} muted loop playsInline autoPlay className="w-full h-full object-cover" />
                                    ) : p.image ? (
                                        <img src={`/storage/${p.image}`} alt={p.title} className="w-full h-full object-cover" />
                                    ) : '🖼️'}
                                </div>
                                <div className="p-3">
                                    <p className="font-bold text-xs text-ink leading-snug mb-1">{p.title}</p>
                                    {p.description && <p className="text-xs text-muted leading-relaxed">{p.description}</p>}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* CTA */}
                <div className="mt-12 bg-gradient-to-r from-ink to-ink/90 rounded-2xl p-6 text-center font-cairo">
                    <p className="text-gold font-bold text-xs tracking-widest uppercase mb-2">يعجبك شغلنا؟</p>
                    <h3 className="text-white font-black text-xl mb-2">احصل على تصميمك الخاص</h3>
                    <p className="text-white/40 text-sm mb-5">تواصل معنا وخبّرنا عن فكرتك — نحوّلها لواقع</p>
                    {waNumber && (
                        <a href={WA_LINK(waMsg('تصميم مخصص', '', ''), waNumber)} target="_blank" rel="noreferrer"
                            className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold px-6 py-3 rounded-xl transition-colors">
                            💬 تواصل عبر واتساب
                        </a>
                    )}
                </div>
            </div>

            {/* Footer */}
            <SiteFooter />
            <WhatsAppButton />
        </>
    );
}

function SiteFooter() {
    return (
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
    );
}
