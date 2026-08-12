import { useState, useRef, useEffect, useMemo } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import { CartProvider, useCart } from '../../Components/CartContext';
import { LocaleProvider, useLocale } from '../../Components/LocaleContext';
import { ThemeProvider, useTheme } from '../../Components/ThemeContext';
import { localField } from '../../i18n';
import CartDrawer from '../../Components/CartDrawer';
import ProductDetail from '../../Components/ProductDetail';
import WhatsAppButton from '../../Components/WhatsAppButton';
import { Toast } from '../../Components/UI';
import { WA_LINK, waMsg } from '../../config';

function scrollCats(ref, dir, direction) {
    const el = ref.current;
    if (!el) return;
    const amount = 260 * (dir === 'rtl' ? -1 : 1) * direction;
    el.scrollBy({ left: amount, behavior: 'smooth' });
}

function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();
    return (
        <button onClick={toggleTheme} aria-label="toggle theme"
            className="w-9 h-9 rounded-xl bg-cream-2 dark:bg-ink-2 border border-cream-3 dark:border-white/10 flex items-center justify-center text-sm text-ink dark:text-cream hover:bg-gold-pale hover:border-gold hover:text-gold transition-colors shrink-0">
            {theme === 'dark' ? '☀️' : '🌙'}
        </button>
    );
}

function AdminLink() {
    const { auth } = usePage().props;
    const { t } = useLocale();
    if (auth?.user?.role !== 'admin') return null;
    return (
        <a href={route('admin.dashboard')} title={t('dashboardTooltip')}
            className="w-9 h-9 rounded-xl bg-cream-2 dark:bg-ink-2 border border-cream-3 dark:border-white/10 flex items-center justify-center text-sm text-ink dark:text-cream hover:bg-gold-pale hover:border-gold hover:text-gold transition-colors shrink-0">
            ⚙️
        </a>
    );
}

function AccountLink() {
    const { auth } = usePage().props;
    const { t } = useLocale();
    const [open, setOpen] = useState(false);
    const user = auth?.user;

    if (!user) {
        return (
            <a href="/login" title={t('loginTooltip')}
                className="w-9 h-9 rounded-xl bg-cream-2 dark:bg-ink-2 border border-cream-3 dark:border-white/10 flex items-center justify-center text-sm text-ink dark:text-cream hover:bg-gold-pale hover:border-gold hover:text-gold transition-colors shrink-0">
                👤
            </a>
        );
    }

    if (user.role === 'admin') return null; // للأدمن زر لوحة التحكم بديل عنه

    return (
        <div className="relative">
            <button onClick={() => setOpen(o => !o)} title={user.name}
                className="w-9 h-9 rounded-xl bg-cream-2 dark:bg-ink-2 border border-cream-3 dark:border-white/10 flex items-center justify-center text-sm font-black text-ink dark:text-cream hover:bg-gold-pale hover:border-gold hover:text-gold transition-colors shrink-0">
                {user.name?.[0] || '👤'}
            </button>
            {open && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
                    <div className="absolute top-full mt-1.5 end-0 bg-white dark:bg-ink-2 border border-cream-3 dark:border-white/10 rounded-xl shadow-xl z-50 overflow-hidden min-w-[170px] font-cairo">
                        <div className="px-3.5 py-2.5 border-b border-cream-3 dark:border-white/10">
                            <p className="text-sm font-bold text-ink dark:text-cream truncate">{user.name}</p>
                        </div>
                        <Link href="/my-orders"
                            className="block w-full text-right px-3.5 py-2.5 text-sm font-bold text-ink dark:text-cream hover:bg-cream-2 dark:hover:bg-ink transition-colors border-b border-cream-3 dark:border-white/10">
                            {t('myOrders')}
                        </Link>
                        <Link href="/logout" method="post" as="button"
                            className="w-full text-right px-3.5 py-2.5 text-sm font-bold text-red-500 hover:bg-cream-2 dark:hover:bg-ink transition-colors">
                            {t('logout')}
                        </Link>
                    </div>
                </>
            )}
        </div>
    );
}

const LANGS = [
    { code: 'ar', label: 'ع',  full: 'العربية' },
    { code: 'he', label: 'ע',  full: 'עברית'   },
    { code: 'en', label: 'EN', full: 'English'  },
];

function LangPicker() {
    const { locale, setLocale } = useLocale();
    const [open, setOpen] = useState(false);
    const current = LANGS.find(l => l.code === locale) ?? LANGS[0];

    return (
        <div className="relative">
            <button onClick={() => setOpen(o => !o)}
                className="w-9 h-9 rounded-xl bg-cream-2 dark:bg-ink-2 border border-cream-3 dark:border-white/10 flex items-center justify-center text-sm font-bold text-ink dark:text-cream hover:bg-gold-pale hover:border-gold hover:text-gold transition-colors shrink-0">
                {current.label}
            </button>
            {open && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
                    <div className="absolute top-full mt-1.5 end-0 bg-white dark:bg-ink-2 border border-cream-3 dark:border-white/10 rounded-xl shadow-xl z-50 overflow-hidden min-w-[130px]">
                        {LANGS.map(l => (
                            <button key={l.code} onClick={() => { setLocale(l.code); setOpen(false); }}
                                className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-sm font-bold transition-colors ${locale === l.code ? 'bg-gold-pale text-gold' : 'text-ink dark:text-cream hover:bg-cream-2 dark:hover:bg-ink'}`}>
                                <span className="font-mono w-6 text-center shrink-0">{l.label}</span>
                                <span>{l.full}</span>
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}

// ── Hero Slider ──
const HERO_GRADIENTS = [
    'from-ink via-ink-2 to-ink',
    'from-gold via-[#3E4F6B] to-ink-2',
    'from-ink-2 via-ink to-[#26344A]',
];
// Soft blurred glow orbs layered behind the text on plain-gradient slides —
// same "depth" trick as the product photography, just in the brand's own
// dark palette instead of switching to a lighter base.
const HERO_ORBS = [
    ['bg-gold-light/25', 'bg-white/10'],
    ['bg-white/15', 'bg-gold-light/20'],
    ['bg-gold-light/20', 'bg-white/10'],
];

function HeroSlider({ slides }) {
    const { locale, dict } = useLocale();
    const [current, setCurrent] = useState(0);

    useEffect(() => {
        if (slides.length < 2) return;
        const timer = setInterval(() => setCurrent(c => (c + 1) % slides.length), 5000);
        return () => clearInterval(timer);
    }, [slides.length]);

    if (slides.length === 0) return null;

    function prev() { setCurrent(c => (c - 1 + slides.length) % slides.length); }
    function next() { setCurrent(c => (c + 1) % slides.length); }

    return (
        <div className="relative overflow-hidden">
            <div dir="ltr" className="flex transition-transform duration-700 ease-out" style={{ transform: `translateX(-${current * 100}%)` }}>
                {slides.map((s, i) => {
                    const title = localField(s, 'title', locale);
                    const subtitle = localField(s, 'subtitle', locale);
                    const ctaText = localField(s, 'cta_text', locale);
                    const [orb1, orb2] = HERO_ORBS[i % HERO_ORBS.length];
                    return (
                        <div key={s.id} dir={dict.dir}
                            style={s.image ? { backgroundImage: `linear-gradient(to bottom right, rgba(27,36,49,.8), rgba(27,36,49,.6)), url(/storage/${s.image})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}
                            className={`relative w-full shrink-0 px-6 py-16 sm:py-24 text-center overflow-hidden ${s.image ? '' : `bg-gradient-to-br ${HERO_GRADIENTS[i % HERO_GRADIENTS.length]}`}`}>
                            {!s.image && (
                                <>
                                    <div className={`absolute -top-16 -end-16 w-72 h-72 rounded-full ${orb1} blur-3xl`} />
                                    <div className={`absolute -bottom-20 -start-10 w-80 h-80 rounded-full ${orb2} blur-3xl`} />
                                </>
                            )}
                            <div className="relative">
                                <span className="inline-block text-[11px] font-black tracking-[0.2em] uppercase rounded-full px-3 py-1 mb-4 text-white bg-white/15 border border-white/20">
                                    LUXSIGN 141
                                </span>
                                <h2 className="text-3xl sm:text-5xl font-black text-white mb-3 leading-tight">{title}</h2>
                                {subtitle && <p className="text-sm sm:text-base text-white/70 max-w-md mx-auto mb-7 leading-relaxed">{subtitle}</p>}
                                {ctaText && (
                                    s.cta_link
                                        ? <a href={s.cta_link} className="inline-block bg-gold text-white font-bold px-6 py-2.5 rounded-xl shadow-lg shadow-gold/30 hover:bg-white hover:text-ink hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300">{ctaText}</a>
                                        : <span className="inline-block bg-gold text-white font-bold px-6 py-2.5 rounded-xl shadow-lg shadow-gold/30">{ctaText}</span>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
            {slides.length > 1 && (
                <>
                    <button onClick={prev} aria-label="prev"
                        className="absolute top-1/2 -translate-y-1/2 end-3 w-10 h-10 rounded-full bg-white/15 hover:bg-white/30 text-white flex items-center justify-center backdrop-blur-md border border-white/20 shadow-sm transition-colors">›</button>
                    <button onClick={next} aria-label="next"
                        className="absolute top-1/2 -translate-y-1/2 start-3 w-10 h-10 rounded-full bg-white/15 hover:bg-white/30 text-white flex items-center justify-center backdrop-blur-md border border-white/20 shadow-sm transition-colors">‹</button>
                    <div className="absolute bottom-5 left-0 right-0 flex justify-center gap-2">
                        {slides.map((_, i) => (
                            <button key={i} onClick={() => setCurrent(i)} aria-label={`slide ${i+1}`}
                                className={`h-2 rounded-full transition-all duration-300 ${i === current ? 'bg-white w-7' : 'bg-white/40 w-2'}`} />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}

// ── Product Card ──
function ProductCard({ product, onOpen }) {
    const { locale, t } = useLocale();
    const videoRef = useRef(null);
    const cardRef = useRef(null);
    const [hovering, setHovering] = useState(false);

    const name = localField(product, 'name', locale);
    const description = localField(product, 'description', locale);
    const categoryName = localField(product.category, 'name', locale);

    function getStartingPrice() {
        const price = (() => {
            if (product.pricing_type === 'sqm') {
                const min = (product.preset_sizes?.[0] || 60) / 100;
                return Math.max(150, Math.round(min * min * product.price));
            }
            if (product.pricing_type === 'fixed_per_size' && product.size_prices?.length) {
                return Math.min(...product.size_prices);
            }
            if (product.pricing_type === 'plate_qty' && product.preset_sizes?.length) {
                return Math.min(...product.preset_sizes);
            }
            return product.price;
        })();

        return product.show_min_price && product.min_price != null
            ? Math.max(price, product.min_price)
            : price;
    }

    const discount = product.compare_price && product.compare_price > product.price
        ? Math.round((1 - product.price / product.compare_price) * 100)
        : null;
    const soldOut = product.track_stock && product.stock_quantity <= 0;
    const lowStock = product.track_stock && !soldOut && product.stock_quantity <= 10;

    function handleMouseEnter() {
        if (!product.video) return;
        setHovering(true);
        videoRef.current?.play().catch(() => {});
    }

    function handleMouseLeave() {
        if (!product.video) return;
        setHovering(false);
        if (videoRef.current) {
            videoRef.current.pause();
            videoRef.current.currentTime = 0;
        }
    }

    // Touch devices never fire mouseenter/mouseleave — instead, autoplay the
    // preview video once the card scrolls into view, so a finger swiping
    // past it on mobile gets the same preview a mouse hover gives on desktop.
    useEffect(() => {
        if (!product.video) return;
        if (typeof window === 'undefined' || !window.matchMedia('(hover: none)').matches) return;
        const el = cardRef.current;
        if (!el) return;
        const observer = new IntersectionObserver(([entry]) => {
            setHovering(entry.isIntersecting);
            if (entry.isIntersecting) {
                videoRef.current?.play().catch(() => {});
            } else if (videoRef.current) {
                videoRef.current.pause();
                videoRef.current.currentTime = 0;
            }
        }, { threshold: 0.6 });
        observer.observe(el);
        return () => observer.disconnect();
    }, [product.video]);

    return (
        <div ref={cardRef} onClick={() => onOpen(product)}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className="bg-white dark:bg-ink-2 rounded-2xl overflow-hidden border-[1.5px] border-cream-3 dark:border-white/10 hover:border-gold-light hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer">

            {/* Image / Video */}
            <div className="h-40 bg-gradient-to-br from-cream-2 to-cream-3 dark:from-ink dark:to-ink-2 flex items-center justify-center text-4xl relative overflow-hidden">
                {(product.image || product.images?.[0])
                    ? <img src={`/storage/${product.image || product.images[0]}`} alt={name} className={`w-full h-full object-cover ${soldOut ? 'opacity-50' : ''}`} />
                    : (product.icon || '📦')
                }
                {soldOut && (
                    <div className="absolute inset-0 bg-ink/50 flex items-center justify-center z-10">
                        <span className="bg-white text-ink text-xs font-black px-3 py-1.5 rounded-full">{t('soldOutLabel')}</span>
                    </div>
                )}
                {discount && !soldOut && (
                    <span className="absolute top-2.5 left-2.5 bg-red-500 text-white text-xs font-black px-2 py-0.5 rounded-full z-10">-{discount}%</span>
                )}
                {product.video && (
                    <video
                        ref={videoRef}
                        src={`/storage/${product.video}`}
                        muted
                        loop
                        playsInline
                        preload="none"
                        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 pointer-events-none ${hovering ? 'opacity-100' : 'opacity-0'}`}
                    />
                )}
                {product.badge && (
                    <span className="absolute top-2.5 right-2.5 bg-gold text-white text-xs font-bold px-2 py-0.5 rounded-full z-10">
                        {localField(product, 'badge', locale)}
                    </span>
                )}
                {product.video && (
                    <span className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-1.5 py-0.5 rounded-md z-10 pointer-events-none">▶</span>
                )}
            </div>

            {/* Body */}
            <div className="p-3">
                <p className="text-xs font-bold tracking-widest uppercase text-gold mb-1">{categoryName}</p>
                <p className="text-sm font-extrabold text-ink dark:text-cream mb-1 leading-tight">{name}</p>
                <p className="text-xs text-muted leading-relaxed mb-3">{description}</p>
                {!product.is_custom && (
                    <div>
                        <p className="text-xs text-muted">{t('startingFrom')}</p>
                        <div className="flex items-center gap-1.5">
                            {discount && <span className="text-xs text-muted line-through">{product.compare_price}₪</span>}
                            <p className="text-base font-black text-ink dark:text-cream">{getStartingPrice()}₪</p>
                        </div>
                        {lowStock && <p className="text-[11px] font-bold text-orange-500 mt-0.5">{t('lowStockLabel')(product.stock_quantity)}</p>}
                    </div>
                )}
            </div>
        </div>
    );
}

// ── Main Store ──
function StoreContent({ heroSlides, categories, products }) {
    const { count, setOpen: setCartOpen } = useCart();
    const { locale, t, dict } = useLocale();
    const { siteSettings } = usePage().props;
    const [activeCat, setActiveCat] = useState('all');
    const [expandedParent, setExpandedParent] = useState(null);
    const [search, setSearch] = useState('');
    const [detailProduct, setDetailProduct] = useState(null);
    const [toast, setToast] = useState({ show: false, msg: '' });
    const catsRef = useRef(null);

    const topLevelCats = useMemo(() => categories.filter(c => !c.parent_id), [categories]);
    const childCatsOf = (parentId) => categories.filter(c => c.parent_id === parentId);

    // صنف رئيسي محدد → يشمل منتجاته + منتجات أصنافه الفرعية كلها
    const activeCategoryIds = useMemo(() => {
        if (activeCat === 'all') return null;
        const cat = categories.find(c => c.key === activeCat);
        if (!cat) return null;
        if (cat.parent_id) return [cat.id];
        return [cat.id, ...childCatsOf(cat.id).map(c => c.id)];
    }, [activeCat, categories]);

    const filtered = products.filter(p => {
        const catOk = activeCat === 'all' || activeCategoryIds?.includes(p.category_id);
        const name = localField(p, 'name', locale);
        const description = localField(p, 'description', locale);
        const searchOk = !search || name.includes(search) || description.includes(search);
        return catOk && searchOk;
    });

    const catTitle = activeCat === 'all' ? t('allProducts')
        : localField(categories.find(c => c.key === activeCat), 'name', locale) || t('allProducts');

    function selectCategory(cat) {
        const kids = childCatsOf(cat.id);
        setActiveCat(cat.key);
        setExpandedParent(kids.length ? cat.id : null);
    }

    return (
        <div className="min-h-screen bg-cream dark:bg-ink font-cairo transition-colors">
            <Head title={t('storeTitle')} />
            {/* Top bar */}
            <div className="bg-ink text-center text-xs py-2 text-white/50 tracking-wide">
                🚚 {t('topBanner')} — <span className="text-gold">{t('topBannerCta')}</span>
            </div>

            {/* Nav */}
            <nav className="sticky top-0 z-30 bg-white/95 dark:bg-ink/95 backdrop-blur-md border-b border-cream-3 dark:border-white/10 h-14 flex items-center justify-between px-4 shadow-sm gap-3">
                <div className="flex items-center gap-3 shrink-0">
                    <div className="hidden lg:flex items-center gap-4 text-sm font-bold">
                        <Link href="/portfolio" className="text-muted hover:text-ink dark:hover:text-cream transition-colors">{t('portfolioLabel')}</Link>
                        <Link href="/testimonials" className="text-muted hover:text-ink dark:hover:text-cream transition-colors">{t('testimonialsLabel')}</Link>
                    </div>
                    <LangPicker />
                    <ThemeToggle />
                    <AdminLink />
                    <AccountLink />
                    <button onClick={() => setCartOpen(true)}
                        className="relative bg-ink text-white w-9 h-9 rounded-xl flex items-center justify-center hover:bg-gold transition-colors">
                        🛒
                        {count > 0 && (
                            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">{count}</span>
                        )}
                    </button>
                </div>
                <div className="hidden sm:flex flex-1 items-center gap-2 border-b-2 border-transparent focus-within:border-gold px-1 py-1 max-w-md transition-colors">
                    <span className="text-muted text-sm shrink-0">🔍</span>
                    <input value={search} onChange={e => setSearch(e.target.value)}
                        placeholder={t('searchPlaceholder')}
                        className="bg-transparent outline-none border-0 appearance-none text-sm text-ink dark:text-cream w-full font-cairo" />
                </div>
                <a href="/" className="text-lg font-black text-ink dark:text-cream shrink-0">
                    Lux<span className="text-gold">Sign.141</span>
                </a>
            </nav>

            {/* Mobile search bar (own row — hidden entirely below sm before) */}
            <div className="sm:hidden sticky top-14 z-20 bg-white dark:bg-ink border-b border-cream-3 dark:border-white/10 h-14 flex items-center px-4">
                <div className="w-full flex items-center gap-2 border-b-2 border-transparent focus-within:border-gold px-1 py-1.5 transition-colors">
                    <span className="text-muted text-sm shrink-0">🔍</span>
                    <input value={search} onChange={e => setSearch(e.target.value)}
                        placeholder={t('searchPlaceholder')}
                        className="bg-transparent outline-none border-0 appearance-none text-sm text-ink dark:text-cream w-full font-cairo" />
                </div>
            </div>

            {/* Hero slider */}
            <HeroSlider slides={heroSlides} />

            {/* Trust badges */}
            <div className="bg-white dark:bg-ink-2 border-b border-cream-3 dark:border-white/10">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-6 px-4 py-6 max-w-6xl mx-auto">
                    {dict.trustBadges.map((b, i) => (
                        <div key={i} className="flex items-center gap-3">
                            <div className="min-w-0">
                                <p className="text-xs sm:text-sm font-black text-ink dark:text-cream mb-0.5">{b.title}</p>
                                <p className="text-[11px] sm:text-xs text-muted leading-relaxed">{b.desc}</p>
                            </div>
                            <div className="w-11 h-11 rounded-full bg-gold-pale dark:bg-gold/10 flex items-center justify-center text-xl shrink-0">{b.icon}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Categories showcase — carousel */}
            <div className="py-10 px-4">
                <h2 className="text-2xl font-black text-ink dark:text-cream text-center mb-6">{t('categoriesHeading')}</h2>
                <div className="relative max-w-6xl mx-auto">
                    <button onClick={() => scrollCats(catsRef, dict.dir, 1)}
                        className="hidden sm:flex absolute top-1/2 -translate-y-1/2 -end-4 z-10 w-9 h-9 rounded-full bg-white dark:bg-ink-2 border border-cream-3 dark:border-white/10 shadow-md items-center justify-center text-ink dark:text-cream hover:bg-gold hover:text-white hover:border-gold transition-colors">›</button>
                    <button onClick={() => scrollCats(catsRef, dict.dir, -1)}
                        className="hidden sm:flex absolute top-1/2 -translate-y-1/2 -start-4 z-10 w-9 h-9 rounded-full bg-white dark:bg-ink-2 border border-cream-3 dark:border-white/10 shadow-md items-center justify-center text-ink dark:text-cream hover:bg-gold hover:text-white hover:border-gold transition-colors">‹</button>

                    <div ref={catsRef} className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth snap-x snap-mandatory px-1 pb-2">
                        <button onClick={() => { setActiveCat('all'); setExpandedParent(null); }}
                            className="shrink-0 flex flex-col items-center gap-2 w-24 group snap-start">
                            <div className={`w-24 h-24 rounded-2xl flex items-center justify-center text-3xl bg-ink transition-all duration-300 border-2 ${activeCat==='all' ? 'border-gold shadow-lg shadow-gold/20 scale-105' : 'border-transparent group-hover:border-gold-light'}`}>
                                🏪
                            </div>
                            <span className={`text-xs font-bold text-center leading-tight ${activeCat==='all' ? 'text-gold' : 'text-muted'}`}>{t('all')}</span>
                        </button>
                        {topLevelCats.map(cat => {
                            const active = activeCat === cat.key;
                            const name = localField(cat, 'name', locale);
                            const kidsCount = childCatsOf(cat.id).length;
                            return (
                                <button key={cat.id} onClick={() => selectCategory(cat)}
                                    className="shrink-0 flex flex-col items-center gap-2 w-24 group snap-start">
                                    <div className={`relative w-24 h-24 rounded-2xl overflow-hidden flex items-center justify-center text-3xl transition-all duration-300 border-2 ${active ? 'border-gold shadow-lg shadow-gold/20 scale-105' : 'border-cream-3 dark:border-white/10 group-hover:border-gold-light'} ${cat.image ? '' : 'bg-gradient-to-br from-cream-2 to-cream-3 dark:from-ink-2 dark:to-ink'}`}>
                                        {cat.image
                                            ? <img src={`/storage/${cat.image}`} alt={name} className="w-full h-full object-cover" />
                                            : (cat.icon || '📦')
                                        }
                                        {kidsCount > 0 && (
                                            <span className="absolute bottom-1 end-1 bg-white/90 text-gold text-[10px] font-black rounded-full w-4 h-4 flex items-center justify-center">{kidsCount}</span>
                                        )}
                                    </div>
                                    <span className={`text-xs font-bold text-center leading-tight ${active ? 'text-gold' : 'text-muted'}`}>{name}</span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Sub-categories row — تظهر لما تختار صنف رئيسي عنده أصناف فرعية */}
                    {expandedParent && childCatsOf(expandedParent).length > 0 && (
                        <div className="flex flex-wrap justify-center gap-2 mt-4">
                            {childCatsOf(expandedParent).map(child => {
                                const activeChild = activeCat === child.key;
                                return (
                                    <button key={child.id} onClick={() => setActiveCat(child.key)}
                                        className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold border-[1.5px] transition-colors ${activeChild ? 'bg-gold text-white border-gold' : 'bg-cream dark:bg-ink-2 border-cream-3 dark:border-white/10 text-muted hover:border-gold hover:text-gold'}`}>
                                        {child.icon} {localField(child, 'name', locale)}
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Products */}
            <div>
                <div className="flex items-center justify-between px-4 mb-3">
                    <div className="flex items-center gap-2">
                        <h2 className="font-black text-ink dark:text-cream">{catTitle}</h2>
                        {activeCat !== 'all' && (
                            <button onClick={() => setActiveCat('all')} className="text-xs text-gold font-bold hover:underline">✕ {t('all')}</button>
                        )}
                    </div>
                    <span className="text-xs text-muted">{t('productsCount')(filtered.length)}</span>
                </div>

                {filtered.length === 0 ? (
                    <div className="text-center py-16 text-muted">
                        <div className="text-4xl mb-3">🔍</div>
                        <p className="text-sm">{t('noResults')}</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 px-3 pb-10">
                        {filtered.map(p => (
                            <ProductCard key={p.id} product={p} onOpen={setDetailProduct} />
                        ))}
                    </div>
                )}
            </div>

            {/* FAQ */}
            <FAQ />

            {/* Footer */}
            <footer className="bg-ink px-4 py-10 text-center font-cairo">
                <div className="max-w-3xl mx-auto">
                    <p className="font-black text-gold text-xl mb-1">LuxSign 141</p>
                    <p className="text-white/40 text-xs mb-6 leading-relaxed">
                        {t('footerTagline')}<br />
                        {t('footerTrust')}
                    </p>
                    <div className="flex justify-center gap-4 text-xs font-bold mb-5">
                        <Link href="/portfolio" className="text-white/40 hover:text-gold transition-colors">{t('portfolioLabel')}</Link>
                        <Link href="/testimonials" className="text-white/40 hover:text-gold transition-colors">{t('testimonialsLabel')}</Link>
                    </div>
                    <div className="flex flex-wrap justify-center gap-3 mb-5">
                        {siteSettings?.whatsapp_number && (
                            <a href={WA_LINK(waMsg(t('inquiryWA'), '', ''), siteSettings.whatsapp_number)} target="_blank" rel="noreferrer"
                                className="flex items-center gap-1.5 bg-green-500/20 text-green-400 border border-green-500/30 text-xs font-bold px-3 py-2 rounded-xl hover:bg-green-500 hover:text-white transition-colors">
                                💬 {t('footerWA')}
                            </a>
                        )}
                        {siteSettings?.instagram_url && (
                            <a href={siteSettings.instagram_url} target="_blank" rel="noreferrer"
                                className="flex items-center gap-1.5 bg-white/5 text-white/40 border border-white/10 text-xs font-bold px-3 py-2 rounded-xl hover:bg-gold hover:text-white hover:border-gold transition-colors">
                                📸 {t('footerInsta')}
                            </a>
                        )}
                        {siteSettings?.tiktok_url && (
                            <a href={siteSettings.tiktok_url} target="_blank" rel="noreferrer"
                                className="flex items-center gap-1.5 bg-white/5 text-white/40 border border-white/10 text-xs font-bold px-3 py-2 rounded-xl hover:bg-gold hover:text-white hover:border-gold transition-colors">
                                🎵 {t('tiktokLabel')}
                            </a>
                        )}
                        {siteSettings?.facebook_url && (
                            <a href={siteSettings.facebook_url} target="_blank" rel="noreferrer"
                                className="flex items-center gap-1.5 bg-white/5 text-white/40 border border-white/10 text-xs font-bold px-3 py-2 rounded-xl hover:bg-gold hover:text-white hover:border-gold transition-colors">
                                📘 {t('facebookPageLabel')}
                            </a>
                        )}
                    </div>
                    <div className="text-white/20 text-xs mb-4">
                        {t('footerHours')}
                    </div>
                    <p className="text-white/10 text-xs">{t('footerCopy')}</p>
                </div>
            </footer>

            {/* Overlays */}
            <CartDrawer />
            {detailProduct && (
                <ProductDetail
                    product={detailProduct}
                    onClose={() => setDetailProduct(null)}
                    onOpenDesigner={() => setDetailProduct(null)}
                />
            )}
            <Toast message={toast.msg} show={toast.show} />
            <WhatsAppButton />
        </div>
    );
}

function FAQ() {
    const { t, dict } = useLocale();
    const [open, setOpen] = useState(null);
    return (
        <section className="bg-cream dark:bg-ink py-12 px-4 font-cairo">
            <div className="max-w-2xl mx-auto">
                <p className="text-gold text-xs font-bold tracking-widest uppercase text-center mb-2">{t('faqEyebrow')}</p>
                <h2 className="text-2xl font-black text-ink dark:text-cream text-center mb-8">{t('faqTitle')}</h2>
                <div className="space-y-2">
                    {dict.faqs.map((f, i) => (
                        <div key={i} className="bg-white dark:bg-ink-2 rounded-2xl border border-cream-3 dark:border-white/10 overflow-hidden">
                            <button onClick={() => setOpen(open === i ? null : i)}
                                className="w-full flex items-center justify-between px-5 py-4 text-right font-bold text-sm text-ink dark:text-cream hover:text-gold transition-colors">
                                <span>{f.q}</span>
                                <span className={`text-gold transition-transform duration-200 shrink-0 mr-3 ${open === i ? 'rotate-45' : ''}`}>+</span>
                            </button>
                            {open === i && (
                                <div className="px-5 pb-4 text-sm text-muted leading-relaxed border-t border-cream-3 dark:border-white/10 pt-3">
                                    {f.a}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

export default function Index({ heroSlides, categories, products }) {
    return (
        <ThemeProvider>
            <LocaleProvider>
                <CartProvider>
                    <StoreContent heroSlides={heroSlides} categories={categories} products={products} />
                </CartProvider>
            </LocaleProvider>
        </ThemeProvider>
    );
}
