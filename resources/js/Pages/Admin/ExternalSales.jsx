import { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';
import { useConfirm } from '../../Components/useConfirm';

const today = () => new Date().toISOString().slice(0, 10);

export default function ExternalSales({ sales, filters, products }) {
    const { confirmAction, dialog } = useConfirm();
    const [from, setFrom] = useState(filters.from ?? '');
    const [to, setTo] = useState(filters.to ?? '');

    const { data, setData, post, processing, errors, reset } = useForm({
        product_id: '',
        product_name: '',
        qty: 1,
        sale_price: '',
        cost_price: '',
        sold_on: today(),
        notes: '',
    });

    function pickProduct(id) {
        const product = products.find(p => String(p.id) === String(id));
        setData(d => ({
            ...d,
            product_id: id,
            product_name: product ? product.name : d.product_name,
            cost_price: product?.wholesale_price ?? d.cost_price,
        }));
    }

    function submit(e) {
        e.preventDefault();
        post('/admin/external-sales', {
            onSuccess: () => reset('product_id', 'product_name', 'qty', 'sale_price', 'cost_price', 'notes'),
        });
    }

    function destroy(sale) {
        confirmAction(`حذف مبيعة "${sale.product_name}" بقيمة ${sale.sale_price}₪؟`,
            (cb) => router.delete(`/admin/external-sales/${sale.id}`, cb));
    }

    function applyFilters(e) {
        e.preventDefault();
        router.get('/admin/external-sales', { from, to }, { preserveState: true, replace: true });
    }

    function clearFilters() {
        setFrom('');
        setTo('');
        router.get('/admin/external-sales');
    }

    const totalRevenue = sales.reduce((s, r) => s + Number(r.sale_price) * r.qty, 0);
    const totalProfit = sales.reduce((s, r) => s + (Number(r.sale_price) - Number(r.cost_price || 0)) * r.qty, 0);

    return (
        <AdminLayout title="📲 مبيعات خارجية">
            <Head title="مبيعات خارجية" />
            {dialog}

            <p className="text-muted text-sm mb-4 max-w-2xl">
                لتسجيل بيع صار من برّا الموقع (إنستا، واتساب، حضوري...) — ما بتأثر على كمية المخزون إطلاقاً، بس بتنحسب بتقرير الأرباح.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                <SummaryCard label="مجموع المبيعات (للفترة المعروضة)" value={totalRevenue} />
                <SummaryCard label="مجموع الربح (للفترة المعروضة)" value={totalProfit} color="text-gold" />
            </div>

            <form onSubmit={submit} className="bg-white rounded-2xl border border-cream-3 p-5 mb-6 flex flex-wrap gap-3 items-end">
                <div className="flex-1 min-w-[180px]">
                    <label className="text-xs font-bold text-muted block mb-1">المنتج (اختياري — من الكتالوج)</label>
                    <select value={data.product_id} onChange={e => pickProduct(e.target.value)}
                        className="px-3 py-2 border-2 border-cream-3 rounded-xl text-sm focus:border-gold outline-none w-full">
                        <option value="">— بدون، اكتب اسم حر —</option>
                        {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                </div>
                <div className="flex-1 min-w-[160px]">
                    <label className="text-xs font-bold text-muted block mb-1">اسم المنتج</label>
                    <input value={data.product_name} onChange={e => setData('product_name', e.target.value)}
                        placeholder="مثلاً: قارمة مضيئة صغيرة"
                        className="px-3 py-2 border-2 border-cream-3 rounded-xl text-sm focus:border-gold outline-none w-full" />
                    {errors.product_name && <p className="text-red-500 text-xs mt-1">{errors.product_name}</p>}
                </div>
                <div>
                    <label className="text-xs font-bold text-muted block mb-1">الكمية</label>
                    <input type="number" min="1" value={data.qty} onChange={e => setData('qty', e.target.value)}
                        className="px-3 py-2 border-2 border-cream-3 rounded-xl text-sm focus:border-gold outline-none w-20" />
                </div>
                <div>
                    <label className="text-xs font-bold text-muted block mb-1">سعر البيع (₪)</label>
                    <input type="number" step="0.01" min="0" value={data.sale_price} onChange={e => setData('sale_price', e.target.value)}
                        placeholder="0.00"
                        className="px-3 py-2 border-2 border-cream-3 rounded-xl text-sm focus:border-gold outline-none w-28" />
                    {errors.sale_price && <p className="text-red-500 text-xs mt-1">{errors.sale_price}</p>}
                </div>
                <div>
                    <label className="text-xs font-bold text-muted block mb-1">سعر التكلفة (₪)</label>
                    <input type="number" step="0.01" min="0" value={data.cost_price} onChange={e => setData('cost_price', e.target.value)}
                        placeholder="اختياري"
                        className="px-3 py-2 border-2 border-cream-3 rounded-xl text-sm focus:border-gold outline-none w-28" />
                </div>
                <div>
                    <label className="text-xs font-bold text-muted block mb-1">التاريخ</label>
                    <input type="date" value={data.sold_on} onChange={e => setData('sold_on', e.target.value)}
                        className="px-3 py-2 border-2 border-cream-3 rounded-xl text-sm focus:border-gold outline-none" />
                </div>
                <div className="flex-1 min-w-[140px]">
                    <label className="text-xs font-bold text-muted block mb-1">ملاحظات</label>
                    <input value={data.notes} onChange={e => setData('notes', e.target.value)}
                        placeholder="مثلاً: طلب انستا"
                        className="px-3 py-2 border-2 border-cream-3 rounded-xl text-sm focus:border-gold outline-none w-full" />
                </div>
                <button disabled={processing} className="bg-ink text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-gold transition-colors">
                    + تسجيل مبيعة
                </button>
            </form>

            <form onSubmit={applyFilters} className="flex flex-wrap items-end gap-3 mb-4">
                <div>
                    <label className="text-xs font-bold text-muted block mb-1">من تاريخ</label>
                    <input type="date" value={from} onChange={e => setFrom(e.target.value)}
                        className="px-3 py-2 border-2 border-cream-3 rounded-xl text-sm" />
                </div>
                <div>
                    <label className="text-xs font-bold text-muted block mb-1">إلى تاريخ</label>
                    <input type="date" value={to} onChange={e => setTo(e.target.value)}
                        className="px-3 py-2 border-2 border-cream-3 rounded-xl text-sm" />
                </div>
                <button className="bg-cream-2 border border-cream-3 text-ink px-4 py-2 rounded-xl text-xs font-bold hover:bg-cream-3 transition-colors">
                    فلترة
                </button>
                {(filters.from || filters.to) && (
                    <button type="button" onClick={clearFilters} className="text-muted text-xs hover:underline">
                        إلغاء الفلاتر ✕
                    </button>
                )}
            </form>

            <div className="bg-white rounded-2xl border border-cream-3 overflow-hidden">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="text-right text-muted text-xs uppercase">
                            <th className="px-5 py-2">التاريخ</th>
                            <th className="px-5 py-2">المنتج</th>
                            <th className="px-5 py-2">الكمية</th>
                            <th className="px-5 py-2">سعر البيع</th>
                            <th className="px-5 py-2">التكلفة</th>
                            <th className="px-5 py-2">الربح</th>
                            <th className="px-5 py-2">ملاحظات</th>
                            <th className="px-5 py-2"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {sales.length === 0 && (
                            <tr><td colSpan={8} className="px-5 py-8 text-center text-muted">لا توجد مبيعات خارجية مسجلة</td></tr>
                        )}
                        {sales.map(sale => (
                            <tr key={sale.id} className="border-t border-cream-3">
                                <td className="px-5 py-3 text-muted">{sale.sold_on.slice(0, 10)}</td>
                                <td className="px-5 py-3 font-bold text-ink">{sale.product_name}</td>
                                <td className="px-5 py-3 text-muted">{sale.qty}</td>
                                <td className="px-5 py-3 font-bold text-ink">{sale.sale_price}₪</td>
                                <td className="px-5 py-3 text-muted">{sale.cost_price ?? '—'}₪</td>
                                <td className="px-5 py-3 font-bold text-gold">
                                    {((Number(sale.sale_price) - Number(sale.cost_price || 0)) * sale.qty).toFixed(2)}₪
                                </td>
                                <td className="px-5 py-3 text-muted">{sale.notes ?? '—'}</td>
                                <td className="px-5 py-3 text-left">
                                    <button onClick={() => destroy(sale)} className="text-red-500 hover:underline text-xs">حذف</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </AdminLayout>
    );
}

function SummaryCard({ label, value, color = 'text-ink' }) {
    return (
        <div className="bg-white rounded-2xl border border-cream-3 p-5">
            <p className="text-xs text-muted mb-1">{label}</p>
            <p className={`text-2xl font-black ${color}`}>{Number(value).toFixed(2)}₪</p>
        </div>
    );
}
