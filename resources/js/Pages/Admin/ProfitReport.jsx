import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';

export default function ProfitReport({
    month, from, to,
    websiteRevenue, websiteCogs, externalRevenue, externalCogs,
    totalRevenue, totalCogs, grossProfit, expenses, netProfit,
    missingCostItems, ordersCount, externalSalesCount,
}) {
    const [selectedMonth, setSelectedMonth] = useState(month);

    function applyMonth(e) {
        e.preventDefault();
        router.get('/admin/profit-report', { month: selectedMonth }, { preserveState: true });
    }

    return (
        <AdminLayout title="📈 تقرير الأرباح">
            <Head title="تقرير الأرباح" />

            <div className="print:hidden flex flex-wrap items-end gap-3 mb-6">
                <form onSubmit={applyMonth} className="flex items-end gap-3">
                    <div>
                        <label className="text-xs font-bold text-muted block mb-1">الشهر</label>
                        <input type="month" value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)}
                            className="px-3 py-2 border-2 border-cream-3 rounded-xl text-sm focus:border-gold outline-none" />
                    </div>
                    <button className="bg-ink text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-gold transition-colors">
                        عرض
                    </button>
                </form>
                <button onClick={() => window.print()}
                    className="mr-auto bg-gold text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-ink transition-colors">
                    🖨️ طباعة التقرير
                </button>
            </div>

            <div className="max-w-3xl">
                <div className="hidden print:block mb-6">
                    <h1 className="text-xl font-black text-ink">تقرير الأرباح — {from} إلى {to}</h1>
                </div>

                <p className="text-sm text-muted mb-6">
                    الفترة: {from} إلى {to} · {ordersCount} طلبية من الموقع · {externalSalesCount} مبيعة خارجية
                </p>

                {missingCostItems.length > 0 && (
                    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6 text-sm text-amber-800">
                        ⚠️ في منتجات ما إلها سعر جملة محدد، فتكلفتها اتحسبت صفر (يعني الربح المحسوب أعلى من الحقيقي):
                        <p className="font-bold mt-1">{missingCostItems.join('، ')}</p>
                    </div>
                )}

                <div className="bg-white rounded-2xl border border-cream-3 overflow-hidden mb-6">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-cream-2 text-right text-muted text-xs uppercase">
                                <th className="px-5 py-2">المصدر</th>
                                <th className="px-5 py-2">المبيعات</th>
                                <th className="px-5 py-2">التكلفة</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="border-t border-cream-3">
                                <td className="px-5 py-3 font-bold text-ink">مبيعات الموقع</td>
                                <td className="px-5 py-3">{websiteRevenue}₪</td>
                                <td className="px-5 py-3 text-muted">{websiteCogs}₪</td>
                            </tr>
                            <tr className="border-t border-cream-3">
                                <td className="px-5 py-3 font-bold text-ink">مبيعات خارجية</td>
                                <td className="px-5 py-3">{externalRevenue}₪</td>
                                <td className="px-5 py-3 text-muted">{externalCogs}₪</td>
                            </tr>
                            <tr className="border-t border-cream-3 bg-cream-2/50 font-bold">
                                <td className="px-5 py-3 text-ink">الإجمالي</td>
                                <td className="px-5 py-3">{totalRevenue}₪</td>
                                <td className="px-5 py-3">{totalCogs}₪</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div className="space-y-2 bg-white rounded-2xl border border-cream-3 p-5">
                    <Row label="إجمالي المبيعات" value={totalRevenue} />
                    <Row label="ناقص: تكلفة البضاعة المباعة" value={-totalCogs} />
                    <Row label="= الربح الإجمالي" value={grossProfit} bold />
                    <Row label="ناقص: المصاريف" value={-expenses} />
                    <div className="border-t border-cream-3 pt-2 mt-2">
                        <Row label="= صافي الربح" value={netProfit} bold big />
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}

function Row({ label, value, bold, big }) {
    const positive = value >= 0;
    return (
        <div className="flex justify-between items-center">
            <span className={`${bold ? 'font-bold text-ink' : 'text-muted'} ${big ? 'text-base' : 'text-sm'}`}>{label}</span>
            <span className={`${bold ? 'font-black' : 'font-bold'} ${big ? 'text-xl' : 'text-sm'} ${positive ? 'text-gold' : 'text-red-500'}`}>
                {value < 0 ? '-' : ''}{Math.abs(value)}₪
            </span>
        </div>
    );
}
