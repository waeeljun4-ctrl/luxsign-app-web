import { useState } from 'react';
import { usePage } from '@inertiajs/react';
import { useCart } from './CartContext';
import { useLocale } from './LocaleContext';
import { localField } from '../i18n';
import { Button } from './UI';
import { waMsg, WA_LINK } from '../config';

function calcPrice(product, w, h, qty, selectedSize) {
    switch (product.pricing_type) {
        case 'sqm':          return Math.max(150, Math.round((w / 100) * (h / 100) * product.price));
        case 'pair_width':   return Math.round(w * product.price / 100 * 2);
        case 'single_width': return Math.round(w * product.price / 100);
        case 'plate_qty':    return product.preset_sizes?.[qty - 1] ?? product.price;
        case 'fixed_per_size': {
            const idx = product.preset_sizes?.indexOf(selectedSize) ?? -1;
            return idx >= 0 ? (product.size_prices?.[idx] ?? product.price) : product.price;
        }
        default: return product.price;
    }
}

export default function ProductDetail({ product, onClose, onOpenDesigner }) {
    const { addItem } = useCart();
    const { locale, t } = useLocale();
    const { siteSettings } = usePage().props;

    const hasSizeInput   = ['sqm', 'pair_width', 'single_width'].includes(product.pricing_type);
    const isPlateQty     = product.pricing_type === 'plate_qty';
    const isFixedPerSize = product.pricing_type === 'fixed_per_size';
    const isCircle = product.shape === 'circle';

    const [w, setW] = useState(product.preset_sizes?.[0] || 80);
    const [h, setH] = useState(product.preset_sizes?.[0] || 80);
    const [qty, setQty] = useState(1);
    const [selectedSize, setSelectedSize] = useState(product.preset_sizes?.[0] ?? null);

    const name = localField(product, 'name', locale);
    const description = localField(product, 'description', locale);
    const categoryName = localField(product.category, 'name', locale);

    const hasPresets = product.preset_sizes?.length > 0;
    const price = calcPrice(product, w, h, qty, selectedSize);
    const selectedIdx = isFixedPerSize ? (product.preset_sizes?.indexOf(selectedSize) ?? -1) : -1;
    const comparePrice = isFixedPerSize && selectedIdx >= 0 ? product.compare_prices?.[selectedIdx] : (product.compare_price || null);

    const soldOut = product.track_stock && product.stock_quantity <= 0;
    const lowStock = product.track_stock && !soldOut && product.stock_quantity <= 10;

    // proportional preview box
    const maxPx = 72;
    const ratio = w / h;
    const bw = ratio >= 1 ? maxPx : maxPx * ratio;
    const bh = ratio >= 1 ? maxPx / ratio : maxPx;

    function handleAddCart() {
        if (soldOut) return;
        let size = '';
        if (hasSizeInput) size = ` (${w}×${h} ${t('cm')})`;
        else if (isPlateQty) size = ` (${product.qty_labels?.[qty - 1] || qty})`;
        else if (isFixedPerSize && selectedSize) size = ` (${selectedSize} ${t('cm')})`;
        addItem(name + size, product.icon || '📦', price, categoryName || '', product.id);
        onClose();
    }

    function handleWA() {
        if (!siteSettings?.whatsapp_number) return;
        let size = '';
        if (hasSizeInput) size = `${w}×${h} ${t('cm')}`;
        else if (isPlateQty) size = product.qty_labels?.[qty - 1] || `${qty}`;
        else if (isFixedPerSize && selectedSize) size = `${selectedSize} ${t('cm')}`;
        window.open(WA_LINK(waMsg(name, size, price), siteSettings.whatsapp_number), '_blank');
    }

    return (
        <div className="fixed inset-0 z-40 bg-ink/60 backdrop-blur-sm flex items-end justify-center sm:items-center"
            onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="bg-white dark:bg-ink-2 w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl">

                {/* Header */}
                <div className="flex items-center justify-between px-4 pt-4">
                    <h2 className="font-bold text-base text-ink dark:text-cream">{name}</h2>
                    <button onClick={onClose} className="w-8 h-8 rounded-full bg-cream-2 dark:bg-ink text-ink dark:text-cream flex items-center justify-center text-sm hover:bg-cream-3">✕</button>
                </div>

                {/* Media: video or image */}
                {product.video ? (
                    <div className="mx-4 mt-4 rounded-xl overflow-hidden bg-black aspect-video">
                        <video
                            src={`/storage/${product.video}`}
                            controls
                            autoPlay
                            muted
                            loop
                            playsInline
                            className="w-full h-full object-contain"
                        />
                    </div>
                ) : (
                    <div className="mx-4 mt-4 h-44 bg-gradient-to-br from-cream-2 to-cream-3 dark:from-ink dark:to-ink-2 rounded-xl overflow-hidden flex items-center justify-center text-5xl">
                        {product.image
                            ? <img src={`/storage/${product.image}`} alt={name} className="w-full h-full object-cover" />
                            : (product.icon || '📦')
                        }
                    </div>
                )}

                <div className="px-4 pb-6 mt-4 space-y-4">
                    {/* Description */}
                    <p className="text-sm text-muted leading-relaxed">{description}</p>

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
                                    <div className="h-20 flex items-center justify-center">
                                        <div style={{ width: 72, height: 72 }}
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
                                    const qLabel = product.qty_labels?.[i] || q;
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

                            {/* Size preview */}
                            <div className="bg-cream-2 dark:bg-ink rounded-xl p-3 flex flex-col items-center gap-2">
                                <p className="text-xs text-muted tracking-widest uppercase">{t('sizePreviewLabel')}</p>
                                <div className="h-20 flex items-center justify-center">
                                    <div style={{ width: bw, height: bh }}
                                        className={`bg-gradient-to-br from-ink to-ink-2 border-2 border-gold transition-all duration-300 ${isCircle ? 'rounded-full' : 'rounded'}`} />
                                </div>
                                <p className="text-sm font-bold text-gold">
                                    {isCircle ? `⌀ ${w} ${t('cm')}` : `${w} × ${h} ${t('cm')}`}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Live price */}
                    <div className="bg-gradient-to-r from-ink to-ink-2 rounded-xl p-4 flex items-center justify-between">
                        <div>
                            <p className="text-xs text-white/40 mb-1">
                                {product.pricing_type === 'sqm' ? t('priceLabelSqm')(product.price) : t('priceLabel')}
                            </p>
                            {comparePrice && <p className="text-xs text-white/30 line-through">{comparePrice}₪</p>}
                            <p className="text-2xl font-black text-gold">{price}₪</p>
                        </div>
                    </div>

                    {soldOut && (
                        <p className="text-sm text-red-500 font-bold">نفذت الكمية — غير متوفر حالياً</p>
                    )}
                    {lowStock && (
                        <p className="text-sm text-orange-500 font-bold">⚠️ باقي {product.stock_quantity} فقط!</p>
                    )}

                    {/* Actions */}
                    <div className="space-y-2">
                        {false && product.designer_type !== 'none' && (
                            <Button variant="gold" className="w-full py-3"
                                onClick={() => { onClose(); onOpenDesigner(product); }}>
                                {t('designThis')}
                            </Button>
                        )}
                        <Button variant="dark" className={`w-full py-3 ${soldOut ? 'opacity-40 cursor-not-allowed hover:bg-ink' : ''}`} onClick={handleAddCart} disabled={soldOut}>
                            {soldOut ? 'نفذت الكمية' : t('addToCart')}
                        </Button>
                        <Button variant="wa" className="w-full py-3" onClick={handleWA}>
                            {t('orderViaWA')}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
