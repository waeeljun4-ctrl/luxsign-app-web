import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';

const DISCOUNT_TIERS = [
    { value: 0,  label: 'بدون خصم' },
    { value: 10, label: 'خصم 10%' },
    { value: 20, label: 'خصم 20%' },
    { value: 30, label: 'خصم 30%' },
];

function UserRow({ user }) {
    const [value, setValue] = useState(user.discount_percentage);
    const [saving, setSaving] = useState(false);

    function change(e) {
        const n = Number(e.target.value);
        setValue(n);
        setSaving(true);
        router.patch(route('admin.users.updateDiscount', user.id), { discount_percentage: n }, {
            preserveScroll: true,
            onFinish: () => setSaving(false),
        });
    }

    return (
        <div className="flex items-center gap-3 px-4 py-3.5 hover:bg-cream transition-colors">
            <div className="w-11 h-11 bg-cream-2 rounded-xl flex items-center justify-center text-lg font-black text-gold shrink-0">
                {user.name?.[0] || '؟'}
            </div>
            <div className="flex-1 min-w-0">
                <p className="font-bold text-sm text-ink truncate">{user.name}</p>
                <p className="text-xs text-muted mt-0.5 truncate">
                    {user.email} · {user.email_verified_at ? '✅ مفعّل' : '⏳ لم يفعّل بريده بعد'}
                </p>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
                <select value={value} onChange={change} disabled={saving}
                    className="px-3 py-2 border-2 border-cream-3 focus:border-gold rounded-lg text-sm text-ink bg-cream outline-none disabled:opacity-60">
                    {DISCOUNT_TIERS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
                {saving && <span className="text-xs text-muted">⏳</span>}
            </div>
        </div>
    );
}

export default function Users({ users }) {
    return (
        <>
            <Head title="المستخدمون — الإدارة" />
            <AdminLayout title="👥 المستخدمون">
                <p className="text-muted text-sm mb-5">{users.length} مستخدم مسجّل — حدد نسبة خصم لأي مستخدم وبتنطبق تلقائياً على طلباته</p>
                <div className="bg-white rounded-2xl border border-cream-3 overflow-hidden divide-y divide-cream-3">
                    {users.length === 0 && (
                        <p className="text-center text-muted text-sm py-10">لا يوجد مستخدمون مسجّلون بعد</p>
                    )}
                    {users.map(u => <UserRow key={u.id} user={u} />)}
                </div>
            </AdminLayout>
        </>
    );
}
