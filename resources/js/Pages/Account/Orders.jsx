import { Head, Link } from '@inertiajs/react';
import { StatusBadge } from '../../Components/UI';

export default function Orders({ orders }) {
    return (
        <>
            <Head title="طلبياتي" />
            <div className="min-h-screen bg-cream dark:bg-ink font-cairo">
                <div className="max-w-2xl mx-auto px-4 py-8">
                    <div className="flex items-center justify-between mb-6">
                        <h1 className="text-xl font-black text-ink dark:text-cream">📦 طلبياتي</h1>
                        <Link href="/" className="text-xs font-bold text-muted hover:text-gold transition-colors">
                            ← العودة للمتجر
                        </Link>
                    </div>

                    {orders.length === 0 ? (
                        <div className="bg-white dark:bg-ink-2 rounded-2xl border border-cream-3 dark:border-white/10 text-center py-16">
                            <div className="text-4xl mb-3">🛒</div>
                            <p className="text-sm text-muted">ما في طلبيات بعد</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {orders.map(order => (
                                <div key={order.id} className="bg-white dark:bg-ink-2 rounded-2xl border border-cream-3 dark:border-white/10 p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <span className="font-black text-sm text-ink dark:text-cream">#{order.id}</span>
                                            <StatusBadge status={order.status} />
                                        </div>
                                        <span className="text-xs text-muted">
                                            {new Date(order.created_at).toLocaleDateString('ar-PS')}
                                        </span>
                                    </div>

                                    <div className="text-xs text-muted space-y-1.5 mb-3">
                                        {(order.items || []).map((item, i) => (
                                            <div key={i} className="flex gap-2">
                                                {item.image && (
                                                    <a href={`/storage/${item.image}`} target="_blank" rel="noopener noreferrer" className="shrink-0">
                                                        <img src={`/storage/${item.image}`} className="w-10 h-10 object-cover rounded-lg border border-cream-3 dark:border-white/10" />
                                                    </a>
                                                )}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between">
                                                        <span>{item.name} × {item.qty}</span>
                                                        <span>{item.price * item.qty}₪</span>
                                                    </div>
                                                    {item.specs?.length > 0 && (
                                                        <p className="text-[11px] text-muted/70">
                                                            {item.specs.map(s => `${s.label}: ${s.value}`).join(' · ')}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex items-center justify-between pt-2 border-t border-cream-3 dark:border-white/10">
                                        <span className="text-xs font-bold text-muted">الإجمالي</span>
                                        <span className="font-black text-gold">{order.total}₪</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
