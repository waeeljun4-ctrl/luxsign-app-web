import { useState, useMemo } from 'react';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import AdminLayout from '../../Layouts/AdminLayout';

const BADGE_OPTIONS = [
    { value: '',       label: '— بدون شارة —' },
    { value: 'جديد',   label: '✨ جديد' },
    { value: 'مميز',   label: '⭐ مميز' },
    { value: 'خصم',    label: '🏷️ خصم' },
    { value: 'عرض!',   label: '⚠️ عرض!' },
];

const SIMPLE_TYPES = ['fixed', 'sqm', 'pair_width', 'single_width', 'plate_pair', 'plate_single', 'fixed_qty'];
// These carry several prices at once (one per size / per quantity tier)
// instead of a single `price` column — individual tiers still get edited
// from the product's own page, but bulk raise/lower/campaign here can
// still shift all of them together.
const MULTI_PRICE_TYPES = ['fixed_per_size', 'plate_qty'];
const SELECTABLE_TYPES = [...SIMPLE_TYPES, ...MULTI_PRICE_TYPES];

function priceArrayKey(pricingType) {
    return pricingType === 'plate_qty' ? 'preset_sizes' : 'size_prices';
}

function priceRangeLabel(row) {
    const nums = (row[priceArrayKey(row.pricing_type)] || []).filter(n => n != null && !isNaN(n));
    if (!nums.length) return '—';
    const min = Math.min(...nums), max = Math.max(...nums);
    return min === max ? `${min}₪` : `${min}–${max}₪`;
}

export default function Pricing({ products, categories }) {
    const [rows, setRows] = useState(() =>
        products.map(p => ({ ...p, _dirty: false, _saving: false, _saved: false }))
    );
    const [selected, setSelected]   = useState(new Set());
    const [search, setSearch]       = useState('');
    const [catFilter, setCatFilter] = useState('');
    const [bulkPct, setBulkPct]     = useState('');
    const [toast, setToast]         = useState('');

    const filtered = useMemo(() =>
        rows.filter(r => {
            const catOk = !catFilter || String(r.category_id) === String(catFilter);
            const srcOk = !search || r.name.includes(search);
            return catOk && srcOk;
        }),
    [rows, search, catFilter]);

    const editableFiltered = filtered.filter(r => SELECTABLE_TYPES.includes(r.pricing_type));
    const dirtyCount = rows.filter(r => r._dirty).length;

    function showToast(msg) {
        setToast(msg);
        setTimeout(() => setToast(''), 2500);
    }

    function patch(id, updates) {
        setRows(prev => prev.map(r => r.id === id ? { ...r, ...updates, _dirty: true, _saved: false } : r));
    }

    async function saveRow(id) {
        const row = rows.find(r => r.id === id);
        if (!row) return;
        setRows(prev => prev.map(r => r.id === id ? { ...r, _saving: true } : r));
        try {
            const payload = SIMPLE_TYPES.includes(row.pricing_type)
                ? {
                    price: row.price,
                    compare_price: row.compare_price || null,
                    badge: row.badge || null,
                    min_price: row.min_price || null,
                    show_min_price: !!row.show_min_price,
                }
                : row.pricing_type === 'fixed_per_size'
                    ? { size_prices: row.size_prices, compare_prices: row.compare_prices }
                    : { preset_sizes: row.preset_sizes }; // plate_qty
            await axios.patch(route('admin.pricing.update', id), payload);
            setRows(prev => prev.map(r => r.id === id ? { ...r, _saving: false, _dirty: false, _saved: true } : r));
        } catch {
            setRows(prev => prev.map(r => r.id === id ? { ...r, _saving: false } : r));
            showToast('❌ خطأ في الحفظ');
        }
    }

    async function saveAll() {
        for (const r of rows.filter(r => r._dirty)) await saveRow(r.id);
        showToast('✅ تم حفظ جميع التعديلات');
    }

    function applyPct(sign) {
        const pct = parseFloat(bulkPct);
        if (!pct || isNaN(pct) || pct <= 0) return;
        const factor = 1 + sign * pct / 100;
        const bump = n => Math.max(1, Math.round((n || 0) * factor));
        setRows(prev => prev.map(row => {
            if (!selected.has(row.id)) return row;
            if (SIMPLE_TYPES.includes(row.pricing_type)) {
                return { ...row, price: bump(row.price), _dirty: true, _saved: false };
            }
            if (MULTI_PRICE_TYPES.includes(row.pricing_type)) {
                const key = priceArrayKey(row.pricing_type);
                return { ...row, [key]: (row[key] || []).map(bump), _dirty: true, _saved: false };
            }
            return row;
        }));
        showToast(`${sign > 0 ? '↑ رفع' : '↓ خفض'} الأسعار ${pct}% — احفظ لتطبيق`);
    }

    function applyCampaign() {
        setRows(prev => prev.map(row => {
            if (!selected.has(row.id)) return row;
            if (SIMPLE_TYPES.includes(row.pricing_type)) {
                return { ...row, compare_price: row.price, _dirty: true, _saved: false };
            }
            // plate_qty has no "old price" concept — only fixed_per_size does.
            if (row.pricing_type === 'fixed_per_size') {
                return { ...row, compare_prices: [...(row.size_prices || [])], _dirty: true, _saved: false };
            }
            return row;
        }));
        showToast('🏷️ تم نسخ السعر الحالي كسعر قديم — غيّر السعر الجديد ثم احفظ');
    }

    function cancelCampaign() {
        setRows(prev => prev.map(row => {
            if (!selected.has(row.id)) return row;
            if (row.pricing_type === 'fixed_per_size') {
                return { ...row, compare_prices: (row.compare_prices || []).map(() => null), _dirty: true, _saved: false };
            }
            return { ...row, compare_price: null, _dirty: true, _saved: false };
        }));
        showToast('✕ تم إلغاء الحملة');
    }

    const allSelected = editableFiltered.length > 0 && editableFiltered.every(r => selected.has(r.id));

    function toggleAll() {
        setSelected(prev => {
            const s = new Set(prev);
            if (allSelected) editableFiltered.forEach(r => s.delete(r.id));
            else editableFiltered.forEach(r => s.add(r.id));
            return s;
        });
    }

    function toggleRow(id) {
        setSelected(prev => {
            const s = new Set(prev);
            s.has(id) ? s.delete(id) : s.add(id);
            return s;
        });
    }

    return (
        <>
            <Head title="مركز التسعير" />
            <AdminLayout title="💰 مركز التسعير">
                <p className="text-muted text-sm mb-4">
                    التعديل الفردي (سعر، سعر قديم، الشارة...) هون بيشتغل بس على المنتجات ذات السعر الواحد.
                    المنتجات بأسعار متعددة (حسب المقاس أو الكمية) — حدّدها وطبّق عليها رفع/خفض % أو حملة خصم من الشريط تحت، وتعديل كل سعر لحاله بيضل من صفحة المنتج نفسه.
                </p>

                <div className="flex flex-wrap items-center gap-2 mb-4">
                    <input value={search} onChange={e => setSearch(e.target.value)}
                        placeholder="🔍 بحث بالاسم..."
                        className="border border-cream-3 rounded-xl px-3 py-2 text-sm text-ink bg-white focus:outline-none focus:border-gold w-44" />
                    <select value={catFilter} onChange={e => setCatFilter(e.target.value)}
                        className="border border-cream-3 rounded-xl px-3 py-2 text-sm text-ink bg-white focus:outline-none focus:border-gold">
                        <option value="">كل الأصناف</option>
                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    <span className="text-xs text-muted">{filtered.length} منتج</span>
                    {dirtyCount > 0 && (
                        <button onClick={saveAll}
                            className="mr-auto bg-gold text-white font-black text-sm px-5 py-2 rounded-xl hover:bg-ink transition-colors flex items-center gap-2">
                            💾 حفظ المتغيرات ({dirtyCount})
                        </button>
                    )}
                </div>

                {selected.size > 0 && (
                    <div className="bg-ink rounded-2xl p-3.5 mb-4 flex flex-wrap items-center gap-x-4 gap-y-2">
                        <span className="text-gold font-black text-sm shrink-0">{selected.size} منتج محدد</span>

                        <div className="flex items-center gap-1.5">
                            <input type="number" value={bulkPct} onChange={e => setBulkPct(e.target.value)}
                                placeholder="نسبة" min="0.1" max="99" step="0.5"
                                className="w-16 border border-white/20 bg-white/10 text-white rounded-lg px-2 py-1.5 text-sm text-center focus:outline-none focus:border-gold" />
                            <span className="text-white/40 text-xs">%</span>
                            <button onClick={() => applyPct(-1)}
                                className="bg-red-500/80 hover:bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors">↓ خفض</button>
                            <button onClick={() => applyPct(1)}
                                className="bg-green-500/80 hover:bg-green-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors">↑ رفع</button>
                        </div>

                        <div className="w-px h-5 bg-white/20" />

                        <div className="flex items-center gap-1.5">
                            <button onClick={applyCampaign}
                                className="bg-gold/80 hover:bg-gold text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors">🏷️ تطبيق حملة خصم</button>
                            <button onClick={cancelCampaign}
                                className="bg-white/10 hover:bg-white/20 text-white/70 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors">✕ إلغاء الحملة</button>
                        </div>

                        <button onClick={() => setSelected(new Set())}
                            className="text-white/30 hover:text-white text-xs mr-auto transition-colors">✕ إلغاء التحديد</button>
                    </div>
                )}

                <div className="bg-white rounded-2xl border border-cream-3 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-cream-2 border-b border-cream-3 text-[11px] font-bold tracking-widest uppercase text-muted">
                                    <th className="w-10 p-3 text-center">
                                        <input type="checkbox" checked={allSelected} onChange={toggleAll} className="accent-gold cursor-pointer" />
                                    </th>
                                    <th className="p-3 text-right min-w-[200px]">المنتج</th>
                                    <th className="p-3 w-32 text-right">السعر الحالي</th>
                                    <th className="p-3 w-32 text-right">سعر قديم (مشطوب)</th>
                                    <th className="p-3 w-36 text-right">أقل سعر معروض</th>
                                    <th className="p-3 w-40 text-center">الشارة</th>
                                    <th className="p-3 w-10"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((row, i) => {
                                    const editable = SIMPLE_TYPES.includes(row.pricing_type);
                                    const multiPrice = MULTI_PRICE_TYPES.includes(row.pricing_type);
                                    return (
                                        <tr key={row.id} className={`
                                            ${i < filtered.length - 1 ? 'border-b border-cream-3' : ''}
                                            ${selected.has(row.id) ? 'bg-gold-pale/60' : 'hover:bg-cream'}
                                            ${row._dirty ? 'border-r-4 border-r-amber-400' : ''}
                                            transition-colors
                                        `}>
                                            <td className="p-3 text-center">
                                                {(editable || multiPrice) && <input type="checkbox" checked={selected.has(row.id)} onChange={() => toggleRow(row.id)} className="accent-gold cursor-pointer" />}
                                            </td>
                                            <td className="p-3">
                                                <div className="flex items-center gap-2">
                                                    {row.image
                                                        ? <img src={`/storage/${row.image}`} className="w-8 h-8 rounded-lg object-cover shrink-0" />
                                                        : <span className="w-8 h-8 rounded-lg bg-cream-2 flex items-center justify-center shrink-0">🔆</span>}
                                                    <div className="min-w-0">
                                                        <p className="text-sm font-bold text-ink truncate max-w-[180px]">{row.name}</p>
                                                        <p className="text-xs text-muted truncate">{row.category?.name}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            {editable ? (
                                                <>
                                                    <td className="p-3">
                                                        <input type="number" value={row.price ?? ''} onChange={e => patch(row.id, { price: parseFloat(e.target.value) || 0 })}
                                                            className="border border-cream-3 focus:border-gold rounded-lg px-2 py-1.5 text-sm text-center text-ink bg-white outline-none w-24" />
                                                    </td>
                                                    <td className="p-3">
                                                        <input type="number" value={row.compare_price ?? ''} onChange={e => patch(row.id, { compare_price: e.target.value === '' ? null : parseFloat(e.target.value) })}
                                                            placeholder="السعر القديم"
                                                            className="border border-cream-3 focus:border-gold rounded-lg px-2 py-1.5 text-xs text-center text-muted bg-white outline-none w-28 placeholder-muted/40" />
                                                    </td>
                                    <td className="p-3">
                                                        <div className="flex items-center gap-1.5">
                                                            <input type="number" value={row.min_price ?? ''} onChange={e => patch(row.id, { min_price: e.target.value === '' ? null : parseFloat(e.target.value) })}
                                                                placeholder="بدون"
                                                                className="border border-cream-3 focus:border-gold rounded-lg px-2 py-1.5 text-xs text-center text-ink bg-white outline-none w-20 placeholder-muted/40" />
                                                            <label title="فعّل الحد الأدنى" className="flex items-center">
                                                                <input type="checkbox" checked={!!row.show_min_price} onChange={e => patch(row.id, { show_min_price: e.target.checked })}
                                                                    className="accent-gold cursor-pointer" />
                                                            </label>
                                                        </div>
                                                    </td>
                                                    <td className="p-3">
                                                        <select value={row.badge || ''} onChange={e => patch(row.id, { badge: e.target.value })}
                                                            className="w-full border border-cream-3 focus:border-gold rounded-lg px-2 py-1.5 text-xs text-ink bg-white outline-none">
                                                            {BADGE_OPTIONS.map(b => <option key={b.value} value={b.value}>{b.label}</option>)}
                                                        </select>
                                                    </td>
                                                    <td className="p-3 text-center w-10">
                                                        {row._saving ? (
                                                            <span className="text-gold text-sm animate-pulse">⏳</span>
                                                        ) : row._dirty ? (
                                                            <button onClick={() => saveRow(row.id)} title="حفظ"
                                                                className="w-7 h-7 bg-gold text-white rounded-lg flex items-center justify-center hover:bg-ink transition-colors text-xs font-bold mx-auto">💾</button>
                                                        ) : row._saved ? (
                                                            <span className="text-green-500 text-sm">✅</span>
                                                        ) : null}
                                                    </td>
                                                </>
                                            ) : (
                                                <td colSpan={5} className="p-3">
                                                    <div className="flex items-center justify-between gap-2">
                                                        <span className="text-xs text-muted italic">
                                                            {multiPrice
                                                                ? `${row.pricing_type === 'plate_qty' ? 'عدّة كميات' : 'عدّة مقاسات'} (${priceRangeLabel(row)}) — تعديل كل سعر لحاله من صفحة المنتج`
                                                                : 'عدّة مقاسات — عدّل الخصم من صفحة المنتج'}
                                                        </span>
                                                        {multiPrice && (
                                                            row._saving ? (
                                                                <span className="text-gold text-sm animate-pulse shrink-0">⏳</span>
                                                            ) : row._dirty ? (
                                                                <button onClick={() => saveRow(row.id)} title="حفظ"
                                                                    className="w-7 h-7 bg-gold text-white rounded-lg flex items-center justify-center hover:bg-ink transition-colors text-xs font-bold shrink-0">💾</button>
                                                            ) : row._saved ? (
                                                                <span className="text-green-500 text-sm shrink-0">✅</span>
                                                            ) : null
                                                        )}
                                                    </div>
                                                </td>
                                            )}
                                        </tr>
                                    );
                                })}
                                {filtered.length === 0 && (
                                    <tr><td colSpan={6} className="text-center py-12 text-muted text-sm">لا توجد نتائج</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {toast && (
                    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-ink text-white text-sm font-bold px-5 py-3 rounded-2xl shadow-xl z-50">
                        {toast}
                    </div>
                )}
            </AdminLayout>
        </>
    );
}
