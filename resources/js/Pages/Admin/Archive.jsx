import { Head } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';

const MONTH_NAMES = [
    'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
    'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر',
];

function formatMonth(ym) {
    const [year, month] = ym.split('-');
    return `${MONTH_NAMES[parseInt(month, 10) - 1]} ${year}`;
}

function MonthRow({ m }) {
    return (
        <div className="flex items-center gap-3 px-4 py-3.5 hover:bg-cream transition-colors">
            <div className="flex-1 min-w-0">
                <p className="font-black text-sm text-ink flex items-center gap-2">
                    {formatMonth(m.ym)}
                    {m.file_saved && <span className="text-xs font-bold bg-green-50 text-green-600 px-2 py-0.5 rounded-full">✅ محفوظ</span>}
                </p>
                <p className="text-xs text-muted mt-0.5">
                    {m.orders_count} طلب
                    {m.cancelled_count > 0 && ` (${m.cancelled_count} ملغي)`}
                </p>
            </div>
            <div className="font-black text-gold text-base shrink-0">{Number(m.total_sales).toLocaleString()}₪</div>
            <a href={route('admin.archive.export', { ym: m.ym })}
                className="bg-ink text-white text-xs font-bold px-3 py-2 rounded-lg hover:bg-gold transition-colors shrink-0">
                ⬇️ تحميل الملف
            </a>
        </div>
    );
}

export default function Archive({ months }) {
    const grandTotal = months.reduce((sum, m) => sum + Number(m.total_sales), 0);

    return (
        <>
            <Head title="الأرشيف — الإدارة" />
            <AdminLayout title="🗄️ الأرشيف">
                <div className="bg-ink rounded-2xl p-5 mb-5 flex items-center justify-between">
                    <div>
                        <p className="text-white/50 text-xs font-bold mb-1">إجمالي المبيعات (كل الأشهر)</p>
                        <p className="text-2xl font-black text-white">{grandTotal.toLocaleString()}₪</p>
                    </div>
                    <span className="text-4xl">📊</span>
                </div>

                <p className="text-muted text-sm mb-4">
                    ملخص المبيعات مرتّب بالشهر — اضغط "تحميل الملف" لأي شهر عشان تنزّل كشف تفصيلي (CSV) وينحفظ نسخة منه على السيرفر تلقائياً.
                </p>

                <div className="bg-white rounded-2xl border border-cream-3 overflow-hidden divide-y divide-cream-3">
                    {months.length === 0 && (
                        <p className="text-center text-muted text-sm py-10">لا يوجد طلبات بعد</p>
                    )}
                    {months.map(m => <MonthRow key={m.ym} m={m} />)}
                </div>
            </AdminLayout>
        </>
    );
}
