import { useState, useMemo } from 'react';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import AdminLayout from '../../Layouts/AdminLayout';

export default function Inventory({ products }) {
    const [rows, setRows] = useState(() =>
        products.map(p => ({ ...p, _dirty: false, _saving: false, _saved: false }))
    );
    const [search, setSearch] = useState('');
    const [toast, setToast] = useState('');

    const filtered = useMemo(() =>
        rows.filter(r => !search || r.name.includes(search)),
    [rows, search]);

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
            await axios.patch(route('admin.inventory.update', id), {
                track_stock: row.track_stock,
                stock_quantity: row.stock_quantity,
            });
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

    return (
        <>
            <Head title="المخزن — الإدارة" />
            <AdminLayout title="📦 المخزن">
                <p className="text-muted text-sm mb-4">
                    فعّل "تتبع الكمية" فقط للمنتجات اللي بدك تراقب مخزونها — الباقي بضل متاح دايماً بدون حد أقصى.
                </p>

                <div className="flex flex-wrap items-center gap-2 mb-4">
                    <input value={search} onChange={e => setSearch(e.target.value)}
                        placeholder="🔍 بحث بالاسم..."
                        className="border border-cream-3 rounded-xl px-3 py-2 text-sm text-ink bg-white focus:outline-none focus:border-gold w-52" />
                    <span className="text-xs text-muted">{filtered.length} منتج</span>
                    {dirtyCount > 0 && (
                        <button onClick={saveAll}
                            className="mr-auto bg-gold text-white font-black text-sm px-5 py-2 rounded-xl hover:bg-ink transition-colors flex items-center gap-2">
                            💾 حفظ المتغيرات ({dirtyCount})
                        </button>
                    )}
                </div>

                <div className="bg-white rounded-2xl border border-cream-3 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-cream-2 border-b border-cream-3 text-[11px] font-bold tracking-widest uppercase text-muted">
                                    <th className="p-3 text-right min-w-[200px]">المنتج</th>
                                    <th className="p-3 w-36 text-center">تتبع الكمية</th>
                                    <th className="p-3 w-32 text-center">الكمية المتوفرة</th>
                                    <th className="p-3 w-10"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((row, i) => (
                                    <tr key={row.id} className={`
                                        ${i < filtered.length - 1 ? 'border-b border-cream-3' : ''}
                                        ${row._dirty ? 'border-r-4 border-r-amber-400' : ''}
                                        hover:bg-cream transition-colors
                                    `}>
                                        <td className="p-3">
                                            <div className="flex items-center gap-2">
                                                {row.image
                                                    ? <img src={`/storage/${row.image}`} className="w-8 h-8 rounded-lg object-cover shrink-0" />
                                                    : <span className="w-8 h-8 rounded-lg bg-cream-2 flex items-center justify-center shrink-0">🔆</span>}
                                                <div className="min-w-0">
                                                    <p className="text-sm font-bold text-ink truncate max-w-[220px]">{row.name}</p>
                                                    <p className="text-xs text-muted truncate">{row.category?.name}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-3 text-center">
                                            <label className="inline-flex items-center cursor-pointer">
                                                <input type="checkbox" checked={row.track_stock}
                                                    onChange={e => patch(row.id, { track_stock: e.target.checked })}
                                                    className="accent-gold w-4 h-4 cursor-pointer" />
                                            </label>
                                        </td>
                                        <td className="p-3 text-center">
                                            <input type="number" min="0" value={row.stock_quantity}
                                                disabled={!row.track_stock}
                                                onChange={e => patch(row.id, { stock_quantity: parseInt(e.target.value) || 0 })}
                                                className="border border-cream-3 focus:border-gold rounded-lg px-2 py-1.5 text-sm text-center text-ink bg-white outline-none w-20 disabled:opacity-40 disabled:bg-cream-2" />
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
                                    </tr>
                                ))}
                                {filtered.length === 0 && (
                                    <tr><td colSpan={4} className="text-center py-12 text-muted text-sm">لا توجد نتائج</td></tr>
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
