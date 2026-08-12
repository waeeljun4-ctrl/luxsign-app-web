import { useState, useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import axios from 'axios';
import { useCart } from './CartContext';
import { useLocale } from './LocaleContext';
import { Button, Toast } from './UI';

export default function CartDrawer() {
    const { items, pricedItems, customItems, removeItem, clear, total, count, open, setOpen } = useCart();
    const { t } = useLocale();
    const { auth, siteSettings } = usePage().props;
    const [form, setForm] = useState({ name: '', phone: '', address: '', notes: '' });
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState({ show: false, msg: '' });
    const [couponCode, setCouponCode] = useState('');
    const [coupon, setCoupon] = useState(null); // { code, discount, message }
    const [couponChecking, setCouponChecking] = useState(false);
    const [myCoupon, setMyCoupon] = useState(null); // private coupon available to activate

    function showToast(msg, duration = 3000) {
        setToast({ show: true, msg });
        setTimeout(() => setToast({ show: false, msg: '' }), duration);
    }

    useEffect(() => {
        if (!auth?.user || !open) return;
        axios.get('/api/coupons/mine').then(({ data }) => {
            setMyCoupon(data.coupons?.[0] || null);
        }).catch(() => {});
    }, [auth?.user, open]);

    async function activateMyCoupon() {
        if (!myCoupon) return;
        setCouponChecking(true);
        try {
            const { data } = await axios.post('/api/coupons/validate', { code: myCoupon.code, total });
            setCoupon({ code: myCoupon.code, discount: data.discount, message: data.message });
            setMyCoupon(null);
        } catch (e) {
            showToast(e.response?.data?.message || t('invalidCoupon'));
        }
        setCouponChecking(false);
    }

    async function applyCoupon() {
        if (!couponCode.trim()) return;
        setCouponChecking(true);
        try {
            const { data } = await axios.post('/api/coupons/validate', { code: couponCode.trim(), total });
            setCoupon({ code: couponCode.trim(), discount: data.discount, message: data.message });
        } catch (e) {
            setCoupon(null);
            showToast(e.response?.data?.message || t('invalidCoupon'));
        }
        setCouponChecking(false);
    }

    function removeCoupon() {
        setCoupon(null);
        setCouponCode('');
    }

    const finalTotal = Math.max(0, total - (coupon?.discount || 0));

    async function confirmOrder() {
        if (!items.length) return;
        if (!form.name || !form.phone) {
            showToast(t('errNamePhone'));
            return;
        }
        if (!form.address) {
            showToast(t('errAddress'));
            return;
        }
        setLoading(true);
        try {
            const payload = new FormData();
            payload.append('customer_name', form.name);
            payload.append('customer_phone', form.phone);
            payload.append('address', form.address);
            payload.append('notes', form.notes);
            payload.append('items', JSON.stringify(items.map(i => ({ name: i.name, price: i.price ?? 0, qty: i.qty, product_id: i.productId, specs: i.specs || [], is_custom: !!i.isCustom }))));
            payload.append('total', total);
            if (coupon?.code) payload.append('coupon_code', coupon.code);
            // Each cart item's own reference images (attached on the product page,
            // not here) — correlated to its position in `items` above.
            items.forEach((item, i) => {
                (item.images || []).forEach(img => payload.append(`item_images[${i}][]`, img));
            });

            const { data } = await axios.post('/api/orders', payload, { headers: { 'Content-Type': 'multipart/form-data' } });
            if (data.account_created) {
                showToast(`${t('successOrder')} — ${t('accountCreatedNote')}`, 7000);
            } else {
                showToast(t('successOrder'));
            }
            clear();
            setOpen(false);
            setForm({ name: '', phone: '', address: '', notes: '' });
            removeCoupon();
        } catch (e) {
            showToast(e.response?.data?.message || t('errGeneric'));
        }
        setLoading(false);
    }

    function orderViaWA() {
        if (!items.length) return;
        const lines = items.map(i => i.isCustom
            ? `- ${i.name} (${i.qty}x) = ${t('waPriceTBD')}`
            : `- ${i.name} (${i.qty}x) = ${i.price * i.qty}₪`).join('\n');
        const nameLine  = form.name    ? t('waName')(form.name)       : '';
        const phoneLine = form.phone   ? t('waPhone')(form.phone)     : '';
        const addrLine  = form.address ? t('waAddress')(form.address) : '';
        const notesLine = form.notes   ? t('waNotes')(form.notes)     : '';
        const msg = `${t('waGreeting')}\n${t('waWantToOrder')}\n${lines}\n${t('waTotal')(total)}${nameLine}${phoneLine}${addrLine}${notesLine}`;
        const number = siteSettings?.whatsapp_number;
        if (!number) return;
        window.open('https://wa.me/' + number + '?text=' + encodeURIComponent(msg), '_blank');
    }

    return (
        <>
            {/* Overlay */}
            {open && (
                <div
                    className="fixed inset-0 z-50 bg-ink/40 backdrop-blur-sm"
                    onClick={() => setOpen(false)}
                />
            )}

            {/* Drawer */}
            <div className={`fixed top-0 left-0 bottom-0 w-[360px] max-w-full bg-white dark:bg-ink-2 z-50 shadow-2xl flex flex-col transition-transform duration-300
                ${open ? 'translate-x-0' : '-translate-x-full'}`}>

                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-cream-3 dark:border-white/10 shrink-0">
                    <h3 className="font-bold text-base text-ink dark:text-cream flex items-center gap-2">
                        🛒 {t('cartTitle')}
                        {count > 0 && (
                            <span className="bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">{count}</span>
                        )}
                    </h3>
                    <button onClick={() => setOpen(false)} className="w-8 h-8 rounded-full bg-cream-2 dark:bg-ink text-ink dark:text-cream flex items-center justify-center hover:bg-cream-3">✕</button>
                </div>

                {/* Items */}
                <div className="flex-1 overflow-y-auto px-4 py-3">
                    {!items.length ? (
                        <div className="text-center py-14 text-muted">
                            <div className="text-4xl mb-3">🛍️</div>
                            <p className="text-sm">{t('cartEmpty')}</p>
                        </div>
                    ) : (
                        <>
                            {pricedItems.map((item, i) => (
                                <div key={`p-${i}`} className="flex gap-3 py-3 border-b border-cream-3 dark:border-white/10 items-start">
                                    {item.imagePreviews?.length ? (
                                        <div className="relative w-11 h-11 shrink-0">
                                            <img src={item.imagePreviews[0]} className="w-11 h-11 rounded-xl object-cover" />
                                            {item.imagePreviews.length > 1 && (
                                                <span className="absolute -bottom-1 -right-1 bg-ink text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center leading-none">+{item.imagePreviews.length - 1}</span>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="w-11 h-11 bg-cream-2 dark:bg-ink rounded-xl flex items-center justify-center text-xl shrink-0">{item.icon}</div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-ink dark:text-cream truncate">{item.name}</p>
                                        <p className="text-xs text-muted mt-0.5">{item.category} · {t('quantityLabel')}: {item.qty}</p>
                                        {item.specs?.length > 0 && (
                                            <p className="text-[11px] text-muted/80 mt-0.5 truncate">
                                                {item.specs.map(s => `${s.label}: ${s.value}`).join(' · ')}
                                            </p>
                                        )}
                                        <p className="text-sm font-black text-gold mt-1">{item.price * item.qty}₪</p>
                                    </div>
                                    <button onClick={() => removeItem(item.name)} className="text-gray-300 hover:text-red-500 text-sm transition-colors">✕</button>
                                </div>
                            ))}

                            {customItems.length > 0 && (
                                <>
                                    <p className="text-xs font-bold tracking-widest uppercase text-muted mt-3 mb-1">{t('customOrdersPendingHeading')}</p>
                                    {customItems.map((item, i) => (
                                        <div key={`c-${i}`} className="flex gap-3 py-3 border-b border-cream-3 dark:border-white/10 items-start">
                                            {item.imagePreviews?.length ? (
                                                <div className="relative w-11 h-11 shrink-0">
                                                    <img src={item.imagePreviews[0]} className="w-11 h-11 rounded-xl object-cover" />
                                                    {item.imagePreviews.length > 1 && (
                                                        <span className="absolute -bottom-1 -right-1 bg-ink text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center leading-none">+{item.imagePreviews.length - 1}</span>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="w-11 h-11 bg-cream-2 dark:bg-ink rounded-xl flex items-center justify-center text-xl shrink-0">{item.icon}</div>
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold text-ink dark:text-cream truncate">{item.name}</p>
                                                <p className="text-xs text-muted mt-0.5">{item.category} · {t('quantityLabel')}: {item.qty}</p>
                                                {item.specs?.length > 0 && (
                                                    <p className="text-[11px] text-muted/80 mt-0.5 truncate">
                                                        {item.specs.map(s => `${s.label}: ${s.value}`).join(' · ')}
                                                    </p>
                                                )}
                                                <p className="text-xs font-bold text-gold mt-1">{t('notPricedYet')}</p>
                                            </div>
                                            <button onClick={() => removeItem(item.name)} className="text-gray-300 hover:text-red-500 text-sm transition-colors">✕</button>
                                        </div>
                                    ))}
                                </>
                            )}
                        </>
                    )}
                </div>

                {/* Footer */}
                {items.length > 0 && (
                    <div className="px-4 pb-5 pt-3 border-t border-cream-3 dark:border-white/10 shrink-0 space-y-3">
                        {/* Customer info */}
                        <div className="grid grid-cols-2 gap-2">
                            <input
                                className="px-3 py-2 border-2 border-cream-3 dark:border-white/10 focus:border-gold rounded-lg text-sm font-cairo text-ink dark:text-cream bg-cream dark:bg-ink outline-none"
                                placeholder={t('namePlaceholder')}
                                value={form.name}
                                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                            />
                            <input
                                className="px-3 py-2 border-2 border-cream-3 dark:border-white/10 focus:border-gold rounded-lg text-sm font-cairo text-ink dark:text-cream bg-cream dark:bg-ink outline-none"
                                placeholder={t('phonePlaceholder')}
                                value={form.phone}
                                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                            />
                        </div>
                        <input
                            className="w-full px-3 py-2 border-2 border-cream-3 dark:border-white/10 focus:border-gold rounded-lg text-sm font-cairo text-ink dark:text-cream bg-cream dark:bg-ink outline-none"
                            placeholder={t('addressPlaceholder')}
                            value={form.address}
                            onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                        />
                        <input
                            className="w-full px-3 py-2 border-2 border-cream-3 dark:border-white/10 focus:border-gold rounded-lg text-sm font-cairo text-ink dark:text-cream bg-cream dark:bg-ink outline-none"
                            placeholder={t('notesPlaceholder')}
                            value={form.notes}
                            onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                        />

                        {/* Coupon */}
                        {coupon ? (
                            <div className="flex items-center justify-between bg-gold-pale rounded-lg px-3 py-2">
                                <span className="text-xs font-bold text-gold">{t('couponAppliedLabel')(coupon.code, coupon.discount)}</span>
                                <button onClick={removeCoupon} className="text-xs text-muted hover:text-red-500">✕</button>
                            </div>
                        ) : (
                            <div className="flex gap-2">
                                <input
                                    className="flex-1 px-3 py-2 border-2 border-cream-3 dark:border-white/10 focus:border-gold rounded-lg text-sm font-cairo text-ink dark:text-cream bg-cream dark:bg-ink outline-none"
                                    placeholder={t('couponPlaceholder')}
                                    value={couponCode}
                                    onChange={e => setCouponCode(e.target.value.toUpperCase())}
                                />
                                <button onClick={applyCoupon} disabled={couponChecking || !couponCode.trim()}
                                    className="px-4 bg-cream-2 dark:bg-ink-2 border-2 border-cream-3 dark:border-white/10 rounded-lg text-xs font-bold text-ink dark:text-cream hover:border-gold transition-colors disabled:opacity-50">
                                    {couponChecking ? '⏳' : t('apply')}
                                </button>
                            </div>
                        )}

                        {/* Total */}
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-muted">{t('totalLabel')}</span>
                            <div className="text-left">
                                {coupon && <span className="block text-xs text-muted line-through">{total}₪</span>}
                                <span className="text-xl font-black text-ink dark:text-cream">{finalTotal}₪</span>
                            </div>
                        </div>
                        {customItems.length > 0 && (
                            <p className="text-[11px] text-muted -mt-1.5">
                                {t('customItemsNote')(customItems.length)}
                            </p>
                        )}

                        <Button variant="dark" className="w-full py-3" onClick={confirmOrder} disabled={loading}>
                            {loading ? t('sending') : t('confirmOrder')}
                        </Button>
                        <Button variant="wa" className="w-full py-2.5" onClick={orderViaWA}>
                            {t('orderViaWABtn')}
                        </Button>
                    </div>
                )}
            </div>

            <Toast message={toast.msg} show={toast.show} />
        </>
    );
}
