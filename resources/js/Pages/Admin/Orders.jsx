import { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import axios from 'axios';
import AdminLayout from '../../Layouts/AdminLayout';
import { Modal, StatusBadge, Toast } from '../../Components/UI';
import { useConfirm } from '../../Components/useConfirm';

const STATUSES = [
    { value: 'pending',     label: 'جديد' },
    { value: 'confirmed',   label: 'مؤكد' },
    { value: 'in_progress', label: 'قيد التنفيذ' },
    { value: 'ready',       label: 'جاهز' },
    { value: 'delivered',   label: 'مسلّم' },
    { value: 'cancelled',   label: 'ملغي' },
];

// One WhatsApp message covering the whole order — greeting + every item
// with its specs and price (or "قيد التسعير" for custom items still
// waiting on a quote) — so clicking the customer's number is enough to
// start the conversation with everything they entered already in view.
function orderWaLink(order) {
    const lines = (order.items || []).map(item => {
        const specsText = item.specs?.length
            ? '\n   ' + item.specs.map(s => `${s.label}: ${s.value}`).join('، ')
            : '';
        const priceText = item.is_custom ? ' — قيد التسعير' : ` — ${item.price}₪ × ${item.qty}`;
        return `• ${item.name}${priceText}${specsText}`;
    }).join('\n');
    const msg = `مرحبا ${order.customer_name} 👋\nمعك متجر LuxSign بخصوص طلبيتك #${order.id}:\n${lines}\n\nنتواصل معك لتأكيد التفاصيل 🙏`;
    return `https://wa.me/${order.customer_phone}?text=${encodeURIComponent(msg)}`;
}

function OrderDetail({ order, open, onClose }) {
    const { data, setData, put, processing } = useForm({ status: order?.status || 'pending' });
    const [editingIndex, setEditingIndex] = useState(null);
    const [editName, setEditName] = useState('');
    const [editSpecs, setEditSpecs] = useState([]);
    const [savingItem, setSavingItem] = useState(false);

    function updateStatus(e) {
        e.preventDefault();
        put(route('admin.orders.update', order.id), { onSuccess: onClose });
    }

    function startEdit(index, item) {
        setEditingIndex(index);
        setEditName(item.name);
        setEditSpecs(item.specs?.length ? item.specs.map(s => ({ ...s })) : []);
    }

    function cancelEdit() {
        setEditingIndex(null);
    }

    function addSpecRow() {
        setEditSpecs(prev => [...prev, { label: '', value: '' }]);
    }

    function updateSpecRow(i, field, value) {
        setEditSpecs(prev => prev.map((s, idx) => idx === i ? { ...s, [field]: value } : s));
    }

    function removeSpecRow(i) {
        setEditSpecs(prev => prev.filter((_, idx) => idx !== i));
    }

    function saveItem(index) {
        setSavingItem(true);
        router.put(route('admin.orders.updateItem', [order.id, index]), {
            name: editName,
            specs: editSpecs.filter(s => s.label.trim()),
        }, {
            preserveScroll: true,
            onSuccess: () => { setEditingIndex(null); setSavingItem(false); },
            onError: () => setSavingItem(false),
        });
    }

    if (!order) return null;
    return (
        <Modal open={open} onClose={onClose} title={`طلب #${order.id}`} maxWidth="max-w-lg">
            <div className="space-y-4">
                {/* Customer */}
                <div className="bg-cream rounded-xl p-4 space-y-2">
                    <p className="text-xs font-bold tracking-widest uppercase text-muted mb-2">معلومات العميل</p>
                    <div className="flex justify-between"><span className="text-sm text-muted">الاسم</span><span className="font-bold text-sm">{order.customer_name}</span></div>
                    <div className="flex justify-between">
                        <span className="text-sm text-muted">الواتساب</span>
                        <a href={orderWaLink(order)} target="_blank" rel="noreferrer"
                            className="font-bold text-sm text-green-600 hover:underline flex items-center gap-1">
                            💬 {order.customer_phone}
                        </a>
                    </div>
                    {order.address && (
                        <div className="flex justify-between">
                            <span className="text-sm text-muted">العنوان</span>
                            <span className="font-bold text-sm text-right max-w-[60%]">📍 {order.address}</span>
                        </div>
                    )}
                    <div className="flex justify-between"><span className="text-sm text-muted">التاريخ</span><span className="text-sm">{new Date(order.created_at).toLocaleDateString('ar-PS')}</span></div>
                </div>

                {/* Items */}
                <div>
                    <p className="text-xs font-bold tracking-widest uppercase text-muted mb-2">المنتجات</p>
                    <div className="space-y-1.5">
                        {order.items?.map((item, i) => (
                            <div key={i} className={`rounded-lg px-3 py-2 ${item.is_custom ? 'bg-gold-pale border border-gold/30' : 'bg-cream'}`}>
                                <div className="flex gap-2">
                                    {(item.images?.length ? item.images : item.image ? [item.image] : []).length > 0 && (
                                        <div className="flex flex-wrap gap-1 w-24 shrink-0">
                                            {(item.images?.length ? item.images : [item.image]).map((img, idx) => (
                                                <a key={idx} href={`/storage/${img}`} target="_blank" rel="noopener noreferrer">
                                                    <img src={`/storage/${img}`} className="w-11 h-11 object-cover rounded-lg border border-cream-3 hover:opacity-80 transition-opacity" />
                                                </a>
                                            ))}
                                        </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                        {editingIndex === i ? (
                                            <div className="space-y-2">
                                                <input value={editName} onChange={e => setEditName(e.target.value)}
                                                    className="w-full px-2 py-1.5 border-2 border-cream-3 focus:border-gold rounded-lg text-sm font-bold text-ink bg-white outline-none" />
                                                <div className="space-y-1.5">
                                                    {editSpecs.map((s, si) => (
                                                        <div key={si} className="flex gap-1.5">
                                                            <input value={s.label} onChange={e => updateSpecRow(si, 'label', e.target.value)}
                                                                placeholder="العنوان (مثلاً: المقاس)"
                                                                className="flex-1 px-2 py-1 border border-cream-3 focus:border-gold rounded-md text-xs text-ink bg-white outline-none" />
                                                            <input value={s.value} onChange={e => updateSpecRow(si, 'value', e.target.value)}
                                                                placeholder="القيمة"
                                                                className="flex-1 px-2 py-1 border border-cream-3 focus:border-gold rounded-md text-xs text-ink bg-white outline-none" />
                                                            <button type="button" onClick={() => removeSpecRow(si)}
                                                                className="text-red-400 hover:text-red-600 text-xs px-1 shrink-0">✕</button>
                                                        </div>
                                                    ))}
                                                    <button type="button" onClick={addSpecRow}
                                                        className="text-xs font-bold text-gold hover:text-gold-light">+ إضافة تفصيل</button>
                                                </div>
                                                <div className="flex gap-1.5 pt-1">
                                                    <button type="button" onClick={cancelEdit}
                                                        className="bg-cream-2 text-ink text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-cream-3 transition-colors">إلغاء</button>
                                                    <button type="button" onClick={() => saveItem(i)} disabled={savingItem}
                                                        className="bg-gold text-white text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-ink transition-colors disabled:opacity-60">
                                                        {savingItem ? '⏳...' : '💾 حفظ'}
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="flex justify-between">
                                                    <span className="text-sm font-bold">{item.name} <span className="text-muted font-normal">×{item.qty}</span></span>
                                                    {item.is_custom ? (
                                                        <span className="text-xs font-bold text-gold shrink-0">🎨 تفصيل</span>
                                                    ) : (
                                                        <span className="text-sm font-bold text-gold">{item.price * item.qty}₪</span>
                                                    )}
                                                </div>
                                                {item.specs?.length > 0 && (
                                                    <p className="text-xs text-muted mt-1">
                                                        {item.specs.map(s => `${s.label}: ${s.value}`).join(' · ')}
                                                    </p>
                                                )}
                                                {item.is_custom && (
                                                    <button type="button" onClick={() => startEdit(i, item)}
                                                        className="inline-flex items-center gap-1.5 mt-2 bg-cream-2 border border-cream-3 text-ink text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-gold-pale hover:border-gold hover:text-gold transition-colors">
                                                        ✏️ تعديل التفاصيل
                                                    </button>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                        <div className="flex justify-between px-3 pt-1 border-t border-cream-3">
                            <span className="font-black text-ink">المجموع</span>
                            <span className="font-black text-gold text-lg">{order.total}₪</span>
                        </div>
                    </div>
                </div>

                {/* Notes */}
                {order.notes && (
                    <div className="bg-cream rounded-xl p-3">
                        <p className="text-xs font-bold text-muted mb-1">ملاحظات</p>
                        <p className="text-sm">{order.notes}</p>
                    </div>
                )}

                {/* Status update */}
                <form onSubmit={updateStatus} className="space-y-2">
                    <p className="text-xs font-bold tracking-widest uppercase text-muted">تحديث الحالة</p>
                    <div className="grid grid-cols-3 gap-1.5">
                        {STATUSES.map(s => (
                            <button key={s.value} type="button" onClick={() => setData('status', s.value)}
                                className={`py-2 rounded-lg text-xs font-bold border-2 transition-colors ${data.status === s.value ? 'border-gold bg-gold-pale text-gold' : 'border-cream-3 text-muted hover:border-gold'}`}>
                                {s.label}
                            </button>
                        ))}
                    </div>
                    <button type="submit" disabled={processing}
                        className="w-full bg-ink text-white py-2.5 rounded-xl font-black text-sm hover:bg-gold transition-colors disabled:opacity-60">
                        {processing ? '⏳...' : '💾 حفظ الحالة'}
                    </button>
                </form>
            </div>
        </Modal>
    );
}

export default function Orders({ orders, courierCompanies }) {
    // Holds the id, not the order object — so after an item edit reloads
    // `orders` with fresh data, the open modal picks up the new values
    // instead of showing the stale object it was first opened with.
    const [selectedId, setSelectedId] = useState(null);
    const selected = orders.find(o => o.id === selectedId) || null;
    const [checked, setChecked] = useState(new Set());
    const [exporting, setExporting] = useState(false);
    const [sending, setSending] = useState(false);
    const [companyId, setCompanyId] = useState(courierCompanies?.[0]?.id || '');
    const { delete: destroy } = useForm();
    const { confirmAction, dialog } = useConfirm();
    const [toast, setToast] = useState({ show: false, msg: '' });

    function showToast(msg) {
        setToast({ show: true, msg });
        setTimeout(() => setToast({ show: false, msg: '' }), 3000);
    }

    function toggleCheck(id) {
        setChecked(prev => {
            const s = new Set(prev);
            s.has(id) ? s.delete(id) : s.add(id);
            return s;
        });
    }

    const unsent = orders.filter(o => !o.sent_to_courier);
    const allUnsentChecked = unsent.length > 0 && unsent.every(o => checked.has(o.id));

    function toggleAllUnsent() {
        setChecked(prev => {
            const s = new Set(prev);
            if (allUnsentChecked) unsent.forEach(o => s.delete(o.id));
            else unsent.forEach(o => s.add(o.id));
            return s;
        });
    }

    async function exportToCourier() {
        if (!checked.size) return;
        setExporting(true);
        try {
            const res = await axios.post(route('admin.orders.exportCourier'), { ids: [...checked] }, { responseType: 'blob' });
            const url = URL.createObjectURL(new Blob([res.data]));
            const a = document.createElement('a');
            a.href = url;
            a.download = `orders-export-${Date.now()}.csv`;
            a.click();
            URL.revokeObjectURL(url);
            setChecked(new Set());
            router.reload({ only: ['orders'] });
        } catch {
            showToast('صار خطأ بالتصدير');
        }
        setExporting(false);
    }

    function sendDirectly() {
        if (!checked.size || !companyId) return;
        confirmAction(`رح يتم فتح متصفح تلقائي وتسجيل دخول وإرسال ${checked.size} طلب مباشرة — متأكد؟`, async (cb) => {
            setSending(true);
            try {
                const res = await axios.post(route('admin.orders.sendToCourier'), { ids: [...checked], courier_company_id: companyId });
                showToast(res.data.message);
                setChecked(new Set());
                router.reload({ only: ['orders'] });
                cb.onSuccess();
            } catch (e) {
                showToast(e.response?.data?.message || 'صار خطأ بالإرسال');
                cb.onFinish();
            }
            setSending(false);
        });
    }

    const pending = orders.filter(o => o.status === 'pending').length;

    return (
        <>
            <Head title="الطلبات — الإدارة" />
            {dialog}
            <Toast message={toast.msg} show={toast.show} />
            <AdminLayout title="🛒 الطلبات">
                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                    {[
                        { label: 'طلبات جديدة', value: orders.filter(o=>o.status==='pending').length,     color: 'text-yellow-600', bg: 'bg-yellow-50' },
                        { label: 'قيد التنفيذ',  value: orders.filter(o=>o.status==='in_progress').length, color: 'text-purple-600', bg: 'bg-purple-50' },
                        { label: 'مسلّمة',        value: orders.filter(o=>o.status==='delivered').length,  color: 'text-green-600',  bg: 'bg-green-50' },
                    ].map(stat => (
                        <div key={stat.label} className={`${stat.bg} rounded-2xl p-4 text-center`}>
                            <p className={`text-3xl font-black ${stat.color}`}>{stat.value}</p>
                            <p className="text-xs text-muted mt-1">{stat.label}</p>
                        </div>
                    ))}
                </div>

                {/* Courier export toolbar */}
                <div className="flex flex-wrap items-center gap-3 mb-4 bg-cream-2 rounded-xl px-4 py-2.5">
                    <label className="flex items-center gap-1.5 text-xs font-bold text-muted cursor-pointer">
                        <input type="checkbox" checked={allUnsentChecked} onChange={toggleAllUnsent} disabled={!unsent.length}
                            className="accent-gold w-4 h-4 cursor-pointer" />
                        تحديد كل الطلبات غير المرحّلة ({unsent.length})
                    </label>
                    <div className="mr-auto flex items-center gap-2 flex-wrap">
                        {courierCompanies?.length > 0 && (
                            <>
                                <select value={companyId} onChange={e => setCompanyId(e.target.value)}
                                    className="border-2 border-cream-3 focus:border-gold rounded-xl px-3 py-2 text-xs font-bold text-ink bg-white outline-none">
                                    {courierCompanies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                                <button onClick={sendDirectly} disabled={!checked.size || sending}
                                    className="bg-gold text-white font-black text-sm px-4 py-2 rounded-xl hover:bg-ink transition-colors disabled:opacity-40">
                                    {sending ? '⏳ جاري الإرسال...' : `🚀 إرسال مباشر (${checked.size})`}
                                </button>
                            </>
                        )}
                        <button onClick={exportToCourier} disabled={!checked.size || exporting}
                            className="bg-ink text-white font-black text-sm px-4 py-2 rounded-xl hover:bg-gold transition-colors disabled:opacity-40">
                            {exporting ? '⏳...' : `📦 تصدير Excel (${checked.size})`}
                        </button>
                    </div>
                </div>

                {/* Orders list */}
                <div className="bg-white rounded-2xl border border-cream-3 overflow-hidden">
                    {orders.length === 0 ? (
                        <div className="text-center py-16 text-muted">
                            <div className="text-4xl mb-3">🛒</div>
                            <p className="text-sm">لا توجد طلبات بعد</p>
                        </div>
                    ) : orders.map((order, i) => (
                        <div key={order.id}
                            className={`flex items-center gap-3 px-4 py-3.5 hover:bg-cream cursor-pointer transition-colors ${i < orders.length-1 ? 'border-b border-cream-3' : ''}`}
                            onClick={() => setSelectedId(order.id)}>
                            <input type="checkbox" checked={checked.has(order.id)} onClick={e => e.stopPropagation()}
                                onChange={() => toggleCheck(order.id)} className="accent-gold w-4 h-4 cursor-pointer shrink-0" />
                            <div className="w-10 h-10 bg-cream-2 rounded-xl flex items-center justify-center font-black text-sm text-ink shrink-0">
                                #{order.id}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <p className="font-bold text-sm text-ink">{order.customer_name}</p>
                                    <StatusBadge status={order.status} />
                                    {order.items?.some(it => it.is_custom) && (
                                        <span className="bg-gold-pale text-gold text-[10px] font-bold px-2 py-0.5 rounded-full">🎨 فيها تفصيل</span>
                                    )}
                                    {order.sent_to_courier && (
                                        <span className="bg-blue-100 text-blue-600 text-[10px] font-bold px-2 py-0.5 rounded-full">📦 رُحّل لشركة التوصيل</span>
                                    )}
                                </div>
                                <p className="text-xs text-muted mt-0.5">
                                    {order.customer_phone} · {order.items?.length || 0} منتج · {new Date(order.created_at).toLocaleDateString('ar-PS')}
                                </p>
                                {order.address && (
                                    <p className="text-xs text-gold mt-0.5">📍 {order.address}</p>
                                )}
                            </div>
                            <div className="text-right shrink-0">
                                <p className="font-black text-gold">{order.total}₪</p>
                            </div>
                            <button onClick={e => { e.stopPropagation(); confirmAction('حذف الطلب؟', (cb) => destroy(route('admin.orders.destroy', order.id), cb)); }}
                                className="text-gray-300 hover:text-red-500 text-sm transition-colors px-1">✕</button>
                        </div>
                    ))}
                </div>

                <OrderDetail order={selected} open={!!selected} onClose={() => setSelectedId(null)} />
            </AdminLayout>
        </>
    );
}
