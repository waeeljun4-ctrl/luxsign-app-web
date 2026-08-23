import { useState, useRef, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { useLocale } from './LocaleContext';
import { localField } from '../i18n';

export default function ProductCard({ product }) {
    const { locale, t } = useLocale();
    const videoRef = useRef(null);
    const cardRef = useRef(null);
    const [hovering, setHovering] = useState(false);
    const galleryImages = [product.image, ...(product.images || [])].filter(Boolean);
    const [activeIndex, setActiveIndex] = useState(0);

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

    // Auto-cycle through the product's photos so the card itself previews
    // the gallery without the customer needing to open it.
    useEffect(() => {
        if (galleryImages.length < 2) return;
        const id = setInterval(() => setActiveIndex(i => (i + 1) % galleryImages.length), 2500);
        return () => clearInterval(id);
    }, [galleryImages.length]);

    return (
        <div ref={cardRef} onClick={() => router.visit(`/product/${product.id}`)}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className="bg-white dark:bg-ink-2 rounded-2xl overflow-hidden border-[1.5px] border-cream-3 dark:border-white/10 hover:border-gold-light hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer">

            {/* Image / Video */}
            <div className="relative overflow-hidden aspect-square bg-gradient-to-br from-cream-2 to-cream-3 dark:from-ink dark:to-ink-2">
                {galleryImages.length > 0
                    ? <img src={`/storage/${galleryImages[activeIndex]}`} alt={name} className={`w-full h-full object-cover ${soldOut ? 'opacity-50' : ''}`} />
                    : <div className="w-full h-full flex items-center justify-center text-4xl">{product.icon || '📦'}</div>
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
            {galleryImages.length > 1 && (
                <div className="flex gap-1.5 px-2.5 pt-2 overflow-x-auto">
                    {galleryImages.map((img, i) => (
                        <button key={i} onClick={e => { e.stopPropagation(); setActiveIndex(i); }}
                            className={`shrink-0 w-8 h-8 rounded-lg overflow-hidden border-2 transition-colors ${activeIndex === i ? 'border-gold' : 'border-cream-3 dark:border-white/10 opacity-60 hover:opacity-100'}`}>
                            <img src={`/storage/${img}`} className="w-full h-full object-cover" alt="" />
                        </button>
                    ))}
                </div>
            )}

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
