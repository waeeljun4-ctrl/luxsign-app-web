import { useState } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import WhatsAppButton from '../Components/WhatsAppButton';
import { WA_LINK, waMsg } from '../config';

const CATEGORIES = [
    { key: 'all',      label: 'الكل' },
    { key: 'led',      label: 'لوحات LED مضيئة' },
    { key: 'cnc',      label: 'CNC وقص ليزر' },
    { key: 'letters',  label: 'أحرف ديكور بارزة' },
    { key: 'plates',   label: 'لوحات سيارات' },
    { key: 'islamic',  label: 'ديكور إسلامي' },
];

const PROJECTS = [
    { id:1,  cat:'led',     title:'قارمة دائرية مضيئة — رام الله',    desc:'قارمة LED دائرية بإضاءة بيضاء ناعمة لمحل مجوهرات',          icon:'💡', color:'from-yellow-900 to-yellow-700' },
    { id:2,  cat:'cnc',     title:'لوحة CNC خشبية — نابلس',           desc:'لوحة CNC بتصميم مخصص لواجهة مطعم شعبي',                    icon:'🪵', color:'from-amber-900 to-amber-700' },
    { id:3,  cat:'letters', title:'أحرف ذهبية بارزة — القدس',         desc:'أحرف أكريلك ذهبية بارزة ٣ سم لصالون تجميل',               icon:'✨', color:'from-gold/80 to-gold/50' },
    { id:4,  cat:'led',     title:'قارمة مستطيلة كبيرة — الخليل',     desc:'لوحة LED مستطيلة بإطار أسود لصيدلية',                      icon:'🏪', color:'from-blue-900 to-blue-700' },
    { id:5,  cat:'plates',  title:'نمرات سيارة مميزة — جنين',         desc:'جوز نمرات سيارة بخلفية صفراء وأرقام سوداء',                icon:'🚗', color:'from-yellow-700 to-yellow-500' },
    { id:6,  cat:'islamic', title:'آية قرآنية CNC — طولكرم',          desc:'لوحة آية الكرسي بخشب الزان المحروق',                       icon:'🕌', color:'from-stone-800 to-stone-600' },
    { id:7,  cat:'led',     title:'قارمة محل ملابس — بيت لحم',        desc:'قارمة LED بشكل مخصص مع شعار البراند',                      icon:'👗', color:'from-pink-900 to-pink-700' },
    { id:8,  cat:'cnc',     title:'لوحة ترحيب — أريحا',               desc:'لوحة CNC ترحيبية لمدخل فندق سياحي',                       icon:'🏨', color:'from-teal-900 to-teal-700' },
    { id:9,  cat:'letters', title:'اسم مطعم أحرف بارزة — رام الله',   desc:'أحرف ستانلس ستيل مضيئة من الخلف لواجهة مطعم',             icon:'🍽️', color:'from-zinc-800 to-zinc-600' },
    { id:10, cat:'led',     title:'لوحة صيدلية مضيئة — الضفة',        desc:'لوحة LED بلون أخضر وأبيض بمواصفات دولية',                  icon:'⚕️', color:'from-green-900 to-green-700' },
    { id:11, cat:'plates',  title:'نمرة سيارة مربعة — قلقيلية',       desc:'نمرة مربعة ١٧×١٧ سم بتصميم عصري',                         icon:'🔲', color:'from-slate-800 to-slate-600' },
    { id:12, cat:'islamic', title:'بسملة خشبية — الخليل',             desc:'بسملة CNC خشبية بالخط الديواني للتعليق في المنزل',         icon:'📿', color:'from-emerald-900 to-emerald-700' },
];

export default function Portfolio() {
    const { siteSettings } = usePage().props;
    const waNumber = siteSettings?.whatsapp_number;
    const [active, setActive] = useState('all');

    const filtered = active === 'all' ? PROJECTS : PROJECTS.filter(p => p.cat === active);

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
                    أكثر من ٩٩٩ مشروع منجز في كل مناطق فلسطين — من رام الله للخليل، من نابلس للقدس
                </p>
            </div>

            {/* Filters */}
            <div className="bg-white border-b border-cream-3 sticky top-14 z-20 font-cairo">
                <div className="flex gap-2 overflow-x-auto scrollbar-hide px-3 py-2.5">
                    {CATEGORIES.map(c => (
                        <button key={c.key} onClick={() => setActive(c.key)}
                            className={`shrink-0 px-3.5 py-1.5 rounded-full text-sm font-bold border-[1.5px] whitespace-nowrap transition-colors
                                ${active === c.key ? 'bg-ink text-white border-ink' : 'bg-cream border-cream-3 text-muted hover:border-ink hover:text-ink'}`}>
                            {c.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Grid */}
            <div className="max-w-5xl mx-auto px-3 py-8 font-cairo">
                <p className="text-xs text-muted mb-5 text-center">{filtered.length} مشروع منجز</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                    {filtered.map(p => (
                        <div key={p.id}
                            className="bg-white rounded-2xl overflow-hidden border border-cream-3 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
                            <div className={`h-36 bg-gradient-to-br ${p.color} flex items-center justify-center text-4xl`}>
                                {p.icon}
                            </div>
                            <div className="p-3">
                                <p className="font-bold text-xs text-ink leading-snug mb-1">{p.title}</p>
                                <p className="text-xs text-muted leading-relaxed">{p.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>

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
