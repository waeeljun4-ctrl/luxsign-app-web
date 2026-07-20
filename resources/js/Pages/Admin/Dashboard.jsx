import { Head, Link } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';
import { StatusBadge } from '../../Components/UI';

function StatCard({ label, value, color, bg, icon }) {
    return (
        <div className={`${bg} rounded-2xl p-5 flex flex-col gap-2`}>
            <div className="flex items-center justify-between">
                <span className="text-2xl">{icon}</span>
            </div>
            <p className={`text-3xl font-black ${color}`}>{value}</p>
            <p className="text-xs text-muted font-bold tracking-widest uppercase">{label}</p>
        </div>
    );
}

export default function Dashboard({ stats, recent_orders, top_products }) {
    return (
        <>
            <Head title="لوحة التحكم" />
            <AdminLayout title="📊 لوحة التحكم">

                {/* إحصائيات */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <StatCard
                        icon="🆕" label="طلبات جديدة"
                        value={stats.pending}
                        color="text-yellow-700" bg="bg-yellow-50" />
                    <StatCard
                        icon="⚙️" label="قيد التنفيذ"
                        value={stats.in_progress}
                        color="text-purple-700" bg="bg-purple-50" />
                    <StatCard
                        icon="✅" label="تم التسليم"
                        value={stats.delivered}
                        color="text-green-700" bg="bg-green-50" />
                    <StatCard
                        icon="💰" label="مبيعات اليوم"
                        value={`${stats.today_total}₪`}
                        color="text-gold" bg="bg-gold-pale" />
                </div>

                <div className="grid lg:grid-cols-2 gap-6">

                    {/* آخر الطلبات */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <h2 className="font-black text-ink">🛒 آخر الطلبات</h2>
                            <Link href="/admin/orders"
                                className="text-xs text-muted hover:text-gold transition-colors font-bold">
                                عرض الكل →
                            </Link>
                        </div>
                        <div className="bg-white rounded-2xl border border-cream-3 overflow-hidden">
                            {recent_orders.length === 0 ? (
                                <div className="text-center py-10 text-muted">
                                    <div className="text-3xl mb-2">🛒</div>
                                    <p className="text-sm">لا توجد طلبات بعد</p>
                                </div>
                            ) : recent_orders.map((order, i) => (
                                <Link key={order.id} href="/admin/orders"
                                    className={`flex items-center gap-3 px-4 py-3 hover:bg-cream transition-colors cursor-pointer
                                        ${i < recent_orders.length - 1 ? 'border-b border-cream-3' : ''}`}>
                                    <div className="w-9 h-9 bg-cream-2 rounded-xl flex items-center justify-center font-black text-xs text-ink shrink-0">
                                        #{order.id}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <p className="font-bold text-sm text-ink truncate">{order.customer_name}</p>
                                            <StatusBadge status={order.status} />
                                        </div>
                                        <p className="text-xs text-muted mt-0.5">
                                            {new Date(order.created_at).toLocaleDateString('ar-PS')} · {order.items?.length || 0} منتج
                                        </p>
                                    </div>
                                    <span className="font-black text-gold text-sm shrink-0">{order.total}₪</span>
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* الأكثر طلباً */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <h2 className="font-black text-ink">🔥 الأكثر طلباً</h2>
                            <Link href="/admin/products"
                                className="text-xs text-muted hover:text-gold transition-colors font-bold">
                                إدارة المنتجات →
                            </Link>
                        </div>
                        <div className="bg-white rounded-2xl border border-cream-3 overflow-hidden">
                            {top_products.length === 0 ? (
                                <div className="text-center py-10 text-muted">
                                    <div className="text-3xl mb-2">📦</div>
                                    <p className="text-sm">لا توجد بيانات بعد</p>
                                </div>
                            ) : top_products.map((item, i) => (
                                <div key={i}
                                    className={`flex items-center gap-3 px-4 py-3 ${i < top_products.length - 1 ? 'border-b border-cream-3' : ''}`}>
                                    <div className="w-7 h-7 bg-cream-2 rounded-lg flex items-center justify-center font-black text-xs text-gold shrink-0">
                                        {i + 1}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-sm text-ink truncate">{item.name}</p>
                                        <p className="text-xs text-muted">{item.orders_count} طلب</p>
                                    </div>
                                    <span className="text-xs bg-gold-pale text-gold font-bold px-2 py-0.5 rounded-full shrink-0">
                                        {item.orders_count}×
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* روابط سريعة */}
                <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                    {[
                        { href: '/admin/products',   label: 'إضافة منتج',  icon: '📦', accent: false },
                        { href: '/admin/products',   label: 'تعديل منتج',  icon: '✏️', accent: true  },
                        { href: '/admin/categories', label: 'إضافة صنف',   icon: '🗂️', accent: false },
                        { href: '/admin/categories', label: 'تعديل صنف',   icon: '✏️', accent: true  },
                        { href: '/',                 label: 'عرض المتجر',  icon: '🏪', accent: false },
                    ].map((link, i) => (
                        <Link key={i} href={link.href}
                            className={`flex items-center gap-2 border rounded-xl px-4 py-3 transition-colors text-sm font-bold
                                ${link.accent
                                    ? 'bg-gold-pale border-gold/30 text-gold hover:bg-gold hover:text-white hover:border-gold'
                                    : 'bg-white border-cream-3 text-ink hover:border-gold hover:bg-gold-pale hover:text-gold'}`}>
                            <span className="text-lg">{link.icon}</span>
                            {link.label}
                        </Link>
                    ))}
                </div>

            </AdminLayout>
        </>
    );
}
