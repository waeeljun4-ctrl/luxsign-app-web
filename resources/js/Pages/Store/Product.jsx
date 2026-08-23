import { useState, useRef } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import { CartProvider, useCart } from '../../Components/CartContext';
import { LocaleProvider, useLocale } from '../../Components/LocaleContext';
import { ThemeProvider, useTheme } from '../../Components/ThemeContext';
import { localField } from '../../i18n';
import CartDrawer from '../../Components/CartDrawer';
import ProductCard from '../../Components/ProductCard';
import WhatsAppButton from '../../Components/WhatsAppButton';
import { Button } from '../../Components/UI';
import { waMsg, WA_LINK } from '../../config';

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

    if (user.role === 'admin') return null;

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

function applyMinPrice(product, price) {
    if (product.show_min_price && product.min_price != null) {
        return Math.max(price, product.min_price);
    }
    return price;
}

function calcPrice(product, w, h, qty, selectedSize) {
    const price = (() => {
        switch (product.pricing_type) {
            case 'sqm':          return Math.max(150, Math.round((w / 100) * (h / 100) * product.price));
            case 'pair_width':   return Math.round(Math.max(w, h) * product.price / 100 * 2);
            case 'single_width': return Math.round(Math.max(w, h) * product.price / 100);
            case 'plate_qty':    return product.preset_sizes?.[qty - 1] ?? product.price;
            case 'fixed_qty':    return Math.round(product.price * qty);
            case 'fixed_per_size': {
                const idx = product.preset_sizes?.indexOf(selectedSize) ?? -1;
                return idx >= 0 ? (product.size_prices?.[idx] ?? product.price) : product.price;
            }
            default: return product.price;
        }
    })();

    return applyMinPrice(product, price);
}

function getYoutubeEmbed(url) {
    if (!url) return null;
    const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([A-Za-z0-9_-]{11})/);
    return m ? `https://www.youtube.com/embed/${m[1]}` : null;
}

function ProductPageContent({ product, related }) {
    const { addItem, setOpen: setCartOpen, count } = useCart();
    const { locale, t, dict } = useLocale();
    const { siteSettings } = usePage().props;

    const hasSizeInput   = ['sqm', 'pair_width', 'single_width'].includes(product.pricing_type);
    const isPlateQty     = product.pricing_type === 'plate_qty';
    const isFixedPerSize = product.pricing_type === 'fixed_per_size';
    const isFixedQty      = product.pricing_type === 'fixed_qty';
    const isCircle = product.shape === 'circle';

    const [w, setW] = useState(product.preset_sizes?.[0] || 80);
    const [h, setH] = useState(product.preset_sizes?.[0] || 80);
    const [qty, setQty] = useState(1);
    const [selectedSize, setSelectedSize] = useState(product.preset_sizes?.[0] ?? null);
    const [specValues, setSpecValues] = useState({});
    const [specError, setSpecError] = useState('');
    const [previewDims, setPreviewDims] = useState({});

    function updatePreviewDim(field, key, value) {
        const current = previewDims[field.id] || { w: 80, h: 80 };
        const next = { ...current, [key]: Number(value) || 0 };
        setPreviewDims(v => ({ ...v, [field.id]: next }));
        const formatted = field.preview_shape === 'circle'
            ? `⌀${next.w} ${t('cm')}`
            : `${next.w}×${next.h} ${t('cm')}`;
        setSpecValues(v => ({ ...v, [field.id]: formatted }));
    }
    const MAX_REF_IMAGES = 10;
    const [refImages, setRefImages] = useState([]);
    const [refImagePreviews, setRefImagePreviews] = useState([]);

    function handleRefImageChange(e) {
        const files = Array.from(e.target.files || []);
        e.target.value = '';
        if (!files.length) return;
        const accepted = files.slice(0, MAX_REF_IMAGES - refImages.length);
        setRefImages(prev => [...prev, ...accepted]);
        setRefImagePreviews(prev => [...prev, ...accepted.map(f => URL.createObjectURL(f))]);
    }

    function removeRefImage(index) {
        setRefImages(prev => prev.filter((_, i) => i !== index));
        setRefImagePreviews(prev => prev.filter((_, i) => i !== index));
    }

    const specFields = product.spec_fields || [];

    const fixedSizeOptions = (product.fixed_size_label || '').split(',').map(s => s.trim()).filter(Boolean);
    const [selectedFixedSize, setSelectedFixedSize] = useState(fixedSizeOptions[0] ?? null);

    const name = localField(product, 'name', locale);
    const description = localField(product, 'description', locale);
    const categoryName = localField(product.category, 'name', locale);

    const galleryImages = [product.image, ...(product.images || [])].filter(Boolean);
    const [activeIndex, setActiveIndex] = useState(0);
    const touchStartX = useRef(null);
    const youtubeEmbedUrl = getYoutubeEmbed(product.video_url);

    function prevImage() { setActiveIndex(i => (i - 1 + galleryImages.length) % galleryImages.length); }
    function nextImage() { setActiveIndex(i => (i + 1) % galleryImages.length); }

    function handleTouchStart(e) { touchStartX.current = e.touches[0].clientX; }
    function handleTouchEnd(e) {
        if (touchStartX.current === null) return;
        const delta = e.changedTouches[0].clientX - touchStartX.current;
        if (Math.abs(delta) > 40) (delta > 0 ? prevImage : nextImage)();
        touchStartX.current = null;
    }

    const localeQtyLabels = locale === 'he' ? product.qty_labels_he : locale === 'en' ? product.qty_labels_en : null;
    const qtyLabelAt = (i) => localeQtyLabels?.[i]?.trim() || product.qty_labels?.[i];

    const hasPresets = product.preset_sizes?.length > 0;
    const price = calcPrice(product, w, h, qty, selectedSize);
    const selectedIdx = isFixedPerSize ? (product.preset_sizes?.indexOf(selectedSize) ?? -1) : -1;
    const comparePrice = isFixedPerSize && selectedIdx >= 0 ? product.compare_prices?.[selectedIdx] : (product.compare_price || null);

    const soldOut = product.track_stock && product.stock_quantity <= 0;
    const lowStock = product.track_stock && !soldOut && product.stock_quantity <= 10;

    const maxPx = 96;
    const ratio = w / h;
    const bw = ratio >= 1 ? maxPx : maxPx * ratio;
    const bh = ratio >= 1 ? maxPx / ratio : maxPx;

    function handleAddCart() {
        if (soldOut) return;

        const missing = specFields.find(f => f.is_required && !String(specValues[f.id] ?? '').trim());
        if (missing) {
            setSpecError(t('fillFieldError')(missing.label));
            return;
        }
        setSpecError('');

        let size = '';
        if (hasSizeInput) size = ` (${w}×${h} ${t('cm')})`;
        else if (isPlateQty) size = ` (${product.qty_labels?.[qty - 1] || qty})`;
        else if (isFixedPerSize && selectedSize) size = ` (${selectedSize} ${t('cm')})`;
        else if (isFixedQty) size = ` (${selectedFixedSize ? selectedFixedSize + ' — ' : ''}${qty} ${t('pieceUnit')})`;

        const specs = specFields.map(f => ({ label: f.label, value: specValues[f.id] ?? '' })).filter(s => s.value !== '');

        addItem(name + size, product.icon || '📦', product.is_custom ? null : price, categoryName || '', product.id, specs, refImages, product.is_custom);
        setCartOpen(true);
    }

    function handleWA() {
        if (!siteSettings?.whatsapp_number) return;
        let size = '';
        if (hasSizeInput) size = `${w}×${h} ${t('cm')}`;
        else if (isPlateQty) size = product.qty_labels?.[qty - 1] || `${qty}`;
        else if (isFixedPerSize && selectedSize) size = `${selectedSize} ${t('cm')}`;
        window.open(WA_LINK(waMsg(name, size, price), siteSettings.whatsapp_number), '_blank');
    }

    const fontClass = locale === 'ar' ? 'font-cairo' : '';

    return (
        <div className={`min-h-screen bg-cream dark:bg-ink transition-colors ${fontClass}`}>
            <Head title={`${name} — ${t('storeTitle')}`} />

            <div className="bg-ink text-center text-xs py-2 text-white/50 tracking-wide">
                🚚 {t('topBanner')} — <span className="text-gold">{t('topBannerCta')}</span>
            </div>

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
                <a href="/" className="text-lg font-black text-ink dark:text-cream shrink-0">
                    Lux<span className="text-gold">Sign.141</span>
                </a>
            </nav>

            <div className="max-w-6xl mx-auto px-4 py-6">
                {/* Breadcrumb */}
                <div className="flex items-center gap-1.5 text-xs text-muted mb-5 flex-wrap">
                    <Link href="/" className="hover:text-gold transition-colors">{t('allProducts')}</Link>
                    {categoryName && (
                        <>
                            <span>/</span>
                            <span>{categoryName}</span>
                        </>
                    )}
                    <span>/</span>
                    <span className="text-ink dark:text-cream font-bold">{name}</span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Gallery */}
                    <div>
                        {product.video || product.video_url ? (
                            <div className="rounded-2xl overflow-hidden bg-black aspect-square">
                                {product.video ? (
                                    <video src={`/storage/${product.video}`} controls autoPlay muted loop playsInline className="w-full h-full object-contain" />
                                ) : youtubeEmbedUrl ? (
                                    <iframe src={youtubeEmbedUrl} className="w-full h-full" allowFullScreen title={name} />
                                ) : (
                                    <video src={product.video_url} controls autoPlay muted loop playsInline className="w-full h-full object-contain" />
                                )}
                            </div>
                        ) : (
                            <>
                                <div className="aspect-square bg-gradient-to-br from-cream-2 to-cream-3 dark:from-ink dark:to-ink-2 rounded-2xl overflow-hidden relative">
                                    {galleryImages.length > 0 ? (
                                        <>
                                            <div dir="ltr" className="flex h-full transition-transform duration-500 ease-out"
                                                style={{ transform: `translateX(-${activeIndex * 100}%)` }}
                                                onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
                                                {galleryImages.map(path => (
                                                    <div key={path} className="w-full h-full shrink-0 flex items-center justify-center">
                                                        <img src={`/storage/${path}`} alt={name} className="w-full h-full object-contain" draggable={false} />
                                                    </div>
                                                ))}
                                            </div>
                                            {galleryImages.length > 1 && (
                                                <>
                                                    <button onClick={prevImage} aria-label="prev" type="button"
                                                        className="absolute top-1/2 -translate-y-1/2 end-3 w-9 h-9 rounded-full bg-white/80 hover:bg-white text-ink flex items-center justify-center backdrop-blur-sm shadow-sm transition-colors">›</button>
                                                    <button onClick={nextImage} aria-label="next" type="button"
                                                        className="absolute top-1/2 -translate-y-1/2 start-3 w-9 h-9 rounded-full bg-white/80 hover:bg-white text-ink flex items-center justify-center backdrop-blur-sm shadow-sm transition-colors">‹</button>
                                                </>
                                            )}
                                        </>
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-6xl">{product.icon || '📦'}</div>
                                    )}
                                </div>
                                {galleryImages.length > 1 && (
                                    <div className="mt-2 flex gap-2 overflow-x-auto scrollbar-hide">
                                        {galleryImages.map((path, i) => (
                                            <button key={path} type="button" onClick={() => setActiveIndex(i)}
                                                className={`shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-colors ${activeIndex === i ? 'border-gold' : 'border-cream-3 dark:border-white/10 opacity-70 hover:opacity-100'}`}>
                                                <img src={`/storage/${path}`} alt="" className="w-full h-full object-cover" />
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    {/* Info */}
                    <div className="space-y-5">
                        <div>
                            <p className="text-xs font-bold tracking-widest uppercase text-gold mb-1.5">{categoryName}</p>
                            <h1 className="text-2xl font-black text-ink dark:text-cream leading-tight">{name}</h1>
                        </div>

                        {description && <p className="text-sm text-muted leading-relaxed">{description}</p>}

                        {/* Fixed-per-size: interactive size buttons with their own price */}
                        {isFixedPerSize && hasPresets && (
                            <div>
                                <p className="text-xs font-bold tracking-widest uppercase text-muted mb-2">{t('sizeLabel')}</p>
                                <div className="grid grid-cols-3 gap-2">
                                    {product.preset_sizes.map((s, i) => {
                                        const sPrice = product.size_prices?.[i] ?? product.price;
                                        const oldPrice = product.compare_prices?.[i] ?? null;
                                        const active = selectedSize === s;
                                        return (
                                            <button key={s} onClick={() => setSelectedSize(s)}
                                                className={`py-2 border-2 rounded-lg text-sm font-bold transition-colors flex flex-col items-center
                                                    ${active ? 'border-gold bg-gold-pale text-gold' : 'border-cream-3 dark:border-white/10 text-muted hover:border-gold hover:text-gold hover:bg-gold-pale'}`}>
                                                <span>{s} {t('cm')}</span>
                                                {oldPrice && <span className="text-[10px] text-red-400 line-through">{oldPrice}₪</span>}
                                                <span className="text-xs">{sPrice}₪</span>
                                            </button>
                                        );
                                    })}
                                </div>

                                {isCircle && selectedSize && (
                                    <div className="bg-cream-2 dark:bg-ink rounded-xl p-3 flex flex-col items-center gap-2 mt-3">
                                        <p className="text-xs text-muted tracking-widest uppercase">{t('sizePreviewLabel')}</p>
                                        <div className="h-24 flex items-center justify-center">
                                            <div style={{ width: 96, height: 96 }}
                                                className="bg-gradient-to-br from-ink to-ink-2 border-2 border-gold rounded-full transition-all duration-300" />
                                        </div>
                                        <p className="text-sm font-bold text-gold">⌀ {selectedSize} {t('cm')}</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Plate qty: interactive quantity buttons */}
                        {isPlateQty && hasPresets && (
                            <div>
                                <p className="text-xs font-bold tracking-widest uppercase text-muted mb-2">{t('quantityLabel')}</p>
                                <div className="grid grid-cols-4 gap-2">
                                    {product.preset_sizes.map((qPrice, i) => {
                                        const q = i + 1;
                                        const active = qty === q;
                                        const qLabel = qtyLabelAt(i) || q;
                                        return (
                                            <button key={q} onClick={() => setQty(q)}
                                                className={`py-2 border-2 rounded-lg text-xs font-bold transition-colors flex flex-col items-center
                                                    ${active ? 'border-gold bg-gold-pale text-gold' : 'border-cream-3 dark:border-white/10 text-muted hover:border-gold hover:text-gold hover:bg-gold-pale'}`}>
                                                <span>{qLabel}</span>
                                                <span>{qPrice}₪</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Fixed price × free quantity */}
                        {isFixedQty && (
                            <div className="space-y-3">
                                {fixedSizeOptions.length > 0 && (
                                    <div>
                                        <p className="text-xs font-bold tracking-widest uppercase text-muted mb-2">{t('sizeLabel')}</p>
                                        <div className="grid grid-cols-3 gap-2">
                                            {fixedSizeOptions.map(sizeOpt => (
                                                <button key={sizeOpt} onClick={() => setSelectedFixedSize(sizeOpt)}
                                                    className={`py-2 border-2 rounded-lg text-sm font-bold transition-colors
                                                        ${selectedFixedSize === sizeOpt ? 'border-gold bg-gold-pale text-gold' : 'border-cream-3 dark:border-white/10 text-muted hover:border-gold hover:text-gold hover:bg-gold-pale'}`}>
                                                    {sizeOpt}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                <div>
                                    <p className="text-xs font-bold tracking-widest uppercase text-muted mb-2">{t('quantityLabel')}</p>
                                    <div className="flex items-center gap-4">
                                        <button type="button" onClick={() => setQty(q => Math.max(1, q - 1))}
                                            className="w-10 h-10 rounded-xl border-2 border-cream-3 dark:border-white/10 text-lg font-black text-ink dark:text-cream hover:border-gold hover:text-gold transition-colors">−</button>
                                        <span className="text-2xl font-black text-ink dark:text-cream w-12 text-center">{qty}</span>
                                        <button type="button" onClick={() => setQty(q => q + 1)}
                                            className="w-10 h-10 rounded-xl border-2 border-cream-3 dark:border-white/10 text-lg font-black text-ink dark:text-cream hover:border-gold hover:text-gold transition-colors">+</button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Size inputs */}
                        {hasSizeInput && (
                            <div className="space-y-3">
                                {isCircle ? (
                                    <div>
                                        <label className="text-xs font-bold tracking-widest uppercase text-muted block mb-1">{t('diameterLabel')}</label>
                                        <input type="number" min="10" max="300" value={w}
                                            onChange={e => { const v = Number(e.target.value); setW(v); setH(v); }}
                                            className="w-full px-3 py-2 border-2 border-cream-3 dark:border-white/10 focus:border-gold rounded-lg text-sm text-center text-ink dark:text-cream bg-white dark:bg-ink outline-none" />
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="text-xs font-bold tracking-widest uppercase text-muted block mb-1">{t('widthLabel')}</label>
                                            <input type="number" min="10" max="300" value={w}
                                                onChange={e => setW(Number(e.target.value))}
                                                className="w-full px-3 py-2 border-2 border-cream-3 dark:border-white/10 focus:border-gold rounded-lg text-sm text-center text-ink dark:text-cream bg-white dark:bg-ink outline-none" />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold tracking-widest uppercase text-muted block mb-1">{t('heightLabel')}</label>
                                            <input type="number" min="10" max="300" value={h}
                                                onChange={e => setH(Number(e.target.value))}
                                                className="w-full px-3 py-2 border-2 border-cream-3 dark:border-white/10 focus:border-gold rounded-lg text-sm text-center text-ink dark:text-cream bg-white dark:bg-ink outline-none" />
                                        </div>
                                    </div>
                                )}

                                <div className="bg-cream-2 dark:bg-ink rounded-xl p-3 flex flex-col items-center gap-2">
                                    <p className="text-xs text-muted tracking-widest uppercase">{t('sizePreviewLabel')}</p>
                                    <div className="h-24 flex items-center justify-center">
                                        <div style={{ width: bw, height: bh }}
                                            className={`bg-gradient-to-br from-ink to-ink-2 border-2 border-gold transition-all duration-300 ${isCircle ? 'rounded-full' : 'rounded'}`} />
                                    </div>
                                    <p className="text-sm font-bold text-gold">
                                        {isCircle ? `⌀ ${w} ${t('cm')}` : `${w} × ${h} ${t('cm')}`}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Custom spec fields */}
                        {specFields.length > 0 && (
                            <div className="space-y-3">
                                <p className="text-xs font-bold tracking-widest uppercase text-muted">{t('specsHeading')}</p>
                                {specFields.map(field => {
                                    const localeOptions = locale === 'he' ? field.options_he : locale === 'en' ? field.options_en : null;
                                    const pDims = previewDims[field.id] || { w: 80, h: 80 };
                                    const pIsCircle = field.preview_shape === 'circle';
                                    const pMaxPx = 72;
                                    const pW = pDims.w || 1;
                                    const pH = pIsCircle ? pW : (pDims.h || 1);
                                    const pRatio = pW / pH;
                                    const pBw = pRatio >= 1 ? pMaxPx : pMaxPx * pRatio;
                                    const pBh = pRatio >= 1 ? pMaxPx / pRatio : pMaxPx;
                                    return (
                                    <div key={field.id}>
                                        <label className="text-xs font-bold text-muted block mb-1">
                                            {localField(field, 'label', locale)} {field.is_required && <span className="text-red-500">*</span>}
                                        </label>
                                        {field.field_type === 'preview' ? (
                                            <div className="bg-cream-2 dark:bg-ink rounded-xl p-3 flex flex-col items-center gap-2">
                                                <div className="flex gap-2 w-full">
                                                    <input type="number" min="1" value={pDims.w}
                                                        onChange={e => updatePreviewDim(field, 'w', e.target.value)}
                                                        placeholder={pIsCircle ? t('diameterLabel') : t('widthLabel')}
                                                        className="w-full px-3 py-2 border-2 border-cream-3 dark:border-white/10 focus:border-gold rounded-lg text-sm text-center text-ink dark:text-cream bg-white dark:bg-ink outline-none" />
                                                    {!pIsCircle && (
                                                        <input type="number" min="1" value={pDims.h}
                                                            onChange={e => updatePreviewDim(field, 'h', e.target.value)}
                                                            placeholder={t('heightLabel')}
                                                            className="w-full px-3 py-2 border-2 border-cream-3 dark:border-white/10 focus:border-gold rounded-lg text-sm text-center text-ink dark:text-cream bg-white dark:bg-ink outline-none" />
                                                    )}
                                                </div>
                                                <div className="h-16 flex items-center justify-center">
                                                    <div style={{ width: pBw, height: pBh }}
                                                        className={`bg-gradient-to-br from-ink to-ink-2 border-2 border-gold transition-all duration-300 ${pIsCircle ? 'rounded-full' : 'rounded'}`} />
                                                </div>
                                                <p className="text-sm font-bold text-gold">
                                                    {pIsCircle ? `⌀ ${pDims.w} ${t('cm')}` : `${pDims.w} × ${pDims.h} ${t('cm')}`}
                                                </p>
                                            </div>
                                        ) : field.field_type === 'select' ? (
                                            <select value={specValues[field.id] ?? ''}
                                                onChange={e => setSpecValues(v => ({ ...v, [field.id]: e.target.value }))}
                                                className="w-full px-3 py-2 border-2 border-cream-3 dark:border-white/10 focus:border-gold rounded-lg text-sm text-ink dark:text-cream bg-white dark:bg-ink outline-none">
                                                <option value="">{t('chooseOption')}</option>
                                                {(field.options || []).map((opt, i) => (
                                                    <option key={opt} value={opt}>{localeOptions?.[i]?.trim() || opt}</option>
                                                ))}
                                            </select>
                                        ) : field.field_type === 'boolean' ? (
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input type="checkbox" checked={specValues[field.id] === 'نعم'}
                                                    onChange={e => setSpecValues(v => ({ ...v, [field.id]: e.target.checked ? 'نعم' : '' }))}
                                                    className="accent-gold" />
                                                <span className="text-sm text-muted">{t('yes')}</span>
                                            </label>
                                        ) : (
                                            <input type={field.field_type === 'number' ? 'number' : 'text'}
                                                value={specValues[field.id] ?? ''}
                                                onChange={e => setSpecValues(v => ({ ...v, [field.id]: e.target.value }))}
                                                className="w-full px-3 py-2 border-2 border-cream-3 dark:border-white/10 focus:border-gold rounded-lg text-sm text-ink dark:text-cream bg-white dark:bg-ink outline-none" />
                                        )}
                                    </div>
                                    );
                                })}
                                {specError && <p className="text-xs text-red-500 font-bold">{specError}</p>}
                            </div>
                        )}

                        {/* Reference images */}
                        {product.show_ref_images && (
                            <div>
                                <label className="text-xs font-bold tracking-widest uppercase text-muted block mb-2">
                                    {t('refImagesLabel')(MAX_REF_IMAGES)}
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {refImagePreviews.map((src, i) => (
                                        <div key={i} className="relative w-16 h-16">
                                            <img src={src} className="w-16 h-16 object-cover rounded-xl border border-cream-3 dark:border-white/10" />
                                            <button type="button" onClick={() => removeRefImage(i)}
                                                className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center leading-none">✕</button>
                                        </div>
                                    ))}
                                    {refImages.length < MAX_REF_IMAGES && (
                                        <label className="w-16 h-16 flex flex-col items-center justify-center gap-0.5 border-2 border-dashed border-cream-3 dark:border-white/10 rounded-xl cursor-pointer text-muted hover:border-gold hover:text-gold transition-colors">
                                            <span className="text-xl leading-none">📷</span>
                                            <input type="file" accept="image/*" multiple className="hidden" onChange={handleRefImageChange} />
                                        </label>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Live price */}
                        {!product.is_custom && (
                            <div className="bg-gradient-to-r from-ink to-ink-2 rounded-xl p-4 flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-white/40 mb-1">
                                        {product.pricing_type === 'sqm' ? t('priceLabelSqm')(product.price) : t('priceLabel')}
                                    </p>
                                    {comparePrice && <p className="text-xs text-white/30 line-through">{comparePrice}₪</p>}
                                    <p className="text-2xl font-black text-gold">{price}₪</p>
                                </div>
                            </div>
                        )}

                        {product.is_custom && (
                            <div className="bg-cream-2 dark:bg-ink rounded-xl p-3 text-xs text-muted leading-relaxed">
                                {t('customOrderNote')}
                            </div>
                        )}

                        {soldOut && <p className="text-sm text-red-500 font-bold">{t('soldOutFull')}</p>}
                        {lowStock && <p className="text-sm text-orange-500 font-bold">{t('lowStockLabel')(product.stock_quantity)}</p>}

                        <div className="space-y-2 pt-2">
                            <Button variant="dark" className={`w-full py-3 ${soldOut ? 'opacity-40 cursor-not-allowed hover:bg-ink' : ''}`} onClick={handleAddCart} disabled={soldOut}>
                                {soldOut ? t('soldOutLabel') : product.is_custom ? t('submitOrder') : t('addToCart')}
                            </Button>
                            {!product.is_custom && (
                                <Button variant="wa" className="w-full py-3" onClick={handleWA}>
                                    {t('orderViaWA')}
                                </Button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Related products */}
                {related.length > 0 && (
                    <div className="mt-16">
                        <h2 className="text-xl font-black text-ink dark:text-cream mb-5">{t('relatedProductsLabel')}</h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                            {related.map(p => (
                                <ProductCard key={p.id} product={p} />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <footer className="bg-ink px-4 py-10 text-center mt-16">
                <p className="font-black text-gold text-xl mb-1">LuxSign.141</p>
                <p className="text-white/10 text-xs">{t('footerCopy')}</p>
            </footer>

            <CartDrawer />
            <WhatsAppButton />
        </div>
    );
}

export default function ProductPage({ product, related }) {
    return (
        <ThemeProvider>
            <LocaleProvider>
                <CartProvider>
                    <ProductPageContent product={product} related={related} />
                </CartProvider>
            </LocaleProvider>
        </ThemeProvider>
    );
}
