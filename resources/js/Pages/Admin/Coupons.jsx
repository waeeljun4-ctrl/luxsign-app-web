import { useState } from 'react';
import { Head, useForm, router, Link } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';
import { useConfirm } from '../../Components/useConfirm';

function CouponForm({ users, onClose }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        code: '',
        user_id: '',
        type: 'percentage',
        value: '',
        expires_at: '',
        usage_limit: '',
    });

    function submit(e) {
        e.preventDefault();
        post(route('admin.coupons.store'), { onSuccess: () => { onClose(); reset(); } });
    }

    return (
        <form onSubmit={submit} className="bg-white rounded-2xl border border-cream-3 p-4 mb-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="text-xs font-bold tracking-widest uppercase text-muted block mb-1.5">الكود (اتركه فاضي لكوبون خاص بدون كود)</label>
                    <input value={data.code} onChange={e => setData('code', e.target.value.toUpperCase())}
                        placeholder="SUMMER20"
                        className="w-full px-3 py-2 border-2 border-cream-3 focus:border-gold rounded-xl text-sm text-ink bg-cream outline-none" />
                    {errors.code && <p className="text-red-500 text-xs mt-1">{errors.code}</p>}
                </div>
                <div>
                    <label className="text-xs font-bold tracking-widest uppercase text-muted block mb-1.5">النوع</label>
                    <select value={data.type} onChange={e => setData('type', e.target.value)}
                        className="w-full px-3 py-2 border-2 border-cream-3 focus:border-gold rounded-xl text-sm text-ink bg-cream outline-none">
                        <option value="percentage">نسبة %</option>
                        <option value="fixed">مبلغ ثابت ₪</option>
                    </select>
                </div>
            </div>
            <div>
                <label className="text-xs font-bold tracking-widest uppercase text-muted block mb-1.5">
                    مخصص لزبون معين (اختياري{data.code ? '' : ' — إلزامي بدون كود'})
                </label>
                <select value={data.user_id} onChange={e => setData('user_id', e.target.value)}
                    className="w-full px-3 py-2 border-2 border-cream-3 focus:border-gold rounded-xl text-sm text-ink bg-cream outline-none">
                    <option value="">كل الزبائن (كوبون عام)</option>
                    {users.map(u => <option key={u.id} value={u.id}>{u.name} {u.phone ? `— ${u.phone}` : ''}</option>)}
                </select>
                {errors.user_id && <p className="text-red-500 text-xs mt-1">{errors.user_id}</p>}
            </div>
            <div className="grid grid-cols-3 gap-3">
                <div>
                    <label className="text-xs font-bold tracking-widest uppercase text-muted block mb-1.5">القيمة</label>
                    <input type="number" min="0.01" step="0.01" value={data.value} onChange={e => setData('value', e.target.value)}
                        placeholder={data.type === 'percentage' ? '20' : '15'}
                        className="w-full px-3 py-2 border-2 border-cream-3 focus:border-gold rounded-xl text-sm text-ink bg-cream outline-none" />
                    {errors.value && <p className="text-red-500 text-xs mt-1">{errors.value}</p>}
                </div>
                <div>
                    <label className="text-xs font-bold tracking-widest uppercase text-muted block mb-1.5">تاريخ الانتهاء (اختياري)</label>
                    <input type="date" value={data.expires_at} onChange={e => setData('expires_at', e.target.value)}
                        className="w-full px-3 py-2 border-2 border-cream-3 focus:border-gold rounded-xl text-sm text-ink bg-cream outline-none" />
                </div>
                <div>
                    <label className="text-xs font-bold tracking-widest uppercase text-muted block mb-1.5">حد الاستخدام (اختياري)</label>
                    <input type="number" min="1" value={data.usage_limit} onChange={e => setData('usage_limit', e.target.value)}
                        placeholder="بدون حد"
                        className="w-full px-3 py-2 border-2 border-cream-3 focus:border-gold rounded-xl text-sm text-ink bg-cream outline-none" />
                </div>
            </div>
            <div className="flex gap-2 pt-1">
                <button type="button" onClick={onClose} className="bg-cream-2 text-ink border border-cream-3 px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-cream-3">إلغاء</button>
                <button type="submit" disabled={processing} className="flex-1 bg-ink text-white py-2.5 rounded-xl font-black text-sm hover:bg-gold transition-colors disabled:opacity-60">
                    {processing ? '⏳...' : '💾 إنشاء الكوبون'}
                </button>
            </div>
        </form>
    );
}

function CouponRow({ coupon }) {
    const { delete: destroy, data, setData } = useForm({ is_active: coupon.is_active });
    const { confirmAction, dialog } = useConfirm();

    function toggleActive() {
        const next = !data.is_active;
        setData('is_active', next);
        router.patch(route('admin.coupons.update', coupon.id), {
            user_id: coupon.user_id, type: coupon.type, value: coupon.value, expires_at: coupon.expires_at, usage_limit: coupon.usage_limit,
            is_active: next,
        }, { preserveScroll: true });
    }

    function remove() {
        confirmAction(`حذف الكوبون "${coupon.code}"؟`,
            (cb) => destroy(route('admin.coupons.destroy', coupon.id), cb));
    }

    const expired = coupon.expires_at && new Date(coupon.expires_at) < new Date();
    const usedUp = coupon.usage_limit !== null && coupon.used_count >= coupon.usage_limit;

    return (
        <div className="flex items-center gap-3 px-4 py-3.5 hover:bg-cream transition-colors">
            {dialog}
            <div className="flex-1 min-w-0">
                <p className="font-black text-sm text-ink tracking-wider flex items-center gap-2">
                    {coupon.is_hidden ? '🔒 كوبون خاص بدون كود' : coupon.code}
                    {coupon.user && <span className="text-xs font-bold bg-gold-pale text-gold px-2 py-0.5 rounded-full">👤 {coupon.user.name}</span>}
                </p>
                <p className="text-xs text-muted mt-0.5">
                    {coupon.type === 'percentage' ? `خصم ${coupon.value}%` : `خصم ${coupon.value}₪ ثابت`}
                    {coupon.expires_at && ` · ينتهي ${coupon.expires_at.slice(0, 10)}`}
                    {coupon.usage_limit && ` · استُخدم ${coupon.used_count}/${coupon.usage_limit}`}
                    {expired && <span className="text-red-500 font-bold"> · منتهي</span>}
                    {usedUp && <span className="text-red-500 font-bold"> · اكتمل الحد</span>}
                </p>
            </div>
            <label className="flex items-center gap-1.5 text-xs font-bold text-muted shrink-0 cursor-pointer">
                <input type="checkbox" checked={data.is_active} onChange={toggleActive} className="accent-gold w-4 h-4 cursor-pointer" />
                فعّال
            </label>
            <button onClick={remove} className="text-gray-400 hover:text-red-500 text-sm shrink-0">🗑️</button>
        </div>
    );
}

export default function Coupons({ coupons, users }) {
    const [formOpen, setFormOpen] = useState(false);

    return (
        <>
            <Head title="الكوبونات — الإدارة" />
            <AdminLayout title="🎟️ الكوبونات">
                <div className="flex gap-2 mb-5">
                    <div className="flex-1 bg-white border-2 border-gold text-gold font-black text-sm px-4 py-2 rounded-xl text-center">🎟️ الكوبونات</div>
                    <Link href={route('admin.discounts.index')}
                        className="flex-1 bg-white border-2 border-cream-3 text-muted font-black text-sm px-4 py-2 rounded-xl text-center hover:border-gold hover:text-gold transition-colors">
                        🏷️ حملات الخصم
                    </Link>
                </div>
                <div className="flex justify-between items-center mb-5">
                    <p className="text-muted text-sm">{coupons.length} كوبون — كود عام لأي زبون، أو كوبون خاص بزبون محدد بدون كود</p>
                    {!formOpen && (
                        <button onClick={() => setFormOpen(true)}
                            className="bg-ink text-white font-black text-sm px-4 py-2 rounded-xl hover:bg-gold transition-colors shrink-0">+ كوبون جديد</button>
                    )}
                </div>
                {formOpen && <CouponForm users={users} onClose={() => setFormOpen(false)} />}
                <div className="bg-white rounded-2xl border border-cream-3 overflow-hidden divide-y divide-cream-3">
                    {coupons.length === 0 && (
                        <p className="text-center text-muted text-sm py-10">لا يوجد كوبونات بعد</p>
                    )}
                    {coupons.map(c => <CouponRow key={c.id} coupon={c} />)}
                </div>
            </AdminLayout>
        </>
    );
}
