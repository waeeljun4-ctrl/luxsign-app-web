import { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';
import { Button, Modal, Input } from '../../Components/UI';
import { useConfirm } from '../../Components/useConfirm';

function AdminForm({ open, onClose, admin }) {
    const isEdit = !!admin;
    const { data, setData, post, put, processing, errors, reset } = useForm({
        name: admin?.name || '',
        email: admin?.email || '',
        password: '',
    });

    function submit(e) {
        e.preventDefault();
        if (isEdit) {
            put(route('admin.admins.update', admin.id), { onSuccess: () => { onClose(); reset(); } });
        } else {
            post(route('admin.admins.store'), { onSuccess: () => { onClose(); reset(); } });
        }
    }

    return (
        <Modal open={open} onClose={onClose} title={isEdit ? 'تعديل مدير' : 'إضافة مدير'} maxWidth="max-w-sm">
            <form onSubmit={submit} className="space-y-3">
                <Input label="الاسم" value={data.name} onChange={e => setData('name', e.target.value)}
                    error={errors.name} placeholder="اسم المدير" />
                <Input label="البريد الإلكتروني" type="email" value={data.email} onChange={e => setData('email', e.target.value)}
                    error={errors.email} placeholder="admin@example.com" dir="ltr" />
                <Input label={isEdit ? 'كلمة مرور جديدة (اتركها فاضية لعدم التغيير)' : 'كلمة المرور'}
                    type="password" value={data.password} onChange={e => setData('password', e.target.value)}
                    error={errors.password} placeholder="••••••••" dir="ltr" autoComplete="new-password" />
                <div className="flex gap-2 pt-1">
                    <button type="button" onClick={onClose} className="bg-cream-2 text-ink border border-cream-3 px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-cream-3">إلغاء</button>
                    <button type="submit" disabled={processing} className="flex-1 bg-ink text-white py-2.5 rounded-xl font-black text-sm hover:bg-gold transition-colors disabled:opacity-60">
                        {processing ? '⏳...' : '💾 حفظ'}
                    </button>
                </div>
            </form>
        </Modal>
    );
}

export default function Admins({ admins }) {
    const [formOpen, setFormOpen] = useState(false);
    const [editAdmin, setEditAdmin] = useState(null);
    const { delete: destroy } = useForm();
    const { confirmAction, dialog } = useConfirm();

    function handleDelete(admin) {
        confirmAction(`حذف المدير "${admin.name}"؟`,
            (cb) => destroy(route('admin.admins.destroy', admin.id), cb));
    }

    return (
        <>
            <Head title="المدراء — الإدارة" />
            {dialog}
            <AdminLayout title="🛡️ المدراء">
                <div className="flex justify-between items-center mb-5">
                    <p className="text-muted text-sm">{admins.length} مدير</p>
                    <Button variant="gold" onClick={() => { setEditAdmin(null); setFormOpen(true); }}>+ إضافة مدير</Button>
                </div>
                <div className="bg-white rounded-2xl border border-cream-3 overflow-hidden divide-y divide-cream-3">
                    {admins.length === 0 && (
                        <p className="text-center text-muted text-sm py-10">ما في مدراء بعد</p>
                    )}
                    {admins.map(a => (
                        <div key={a.id} className="flex items-center gap-3 px-4 py-3.5 hover:bg-cream transition-colors">
                            <div className="w-10 h-10 bg-gold-pale text-gold rounded-full flex items-center justify-center font-black shrink-0">
                                {a.name?.[0] ?? '👤'}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-bold text-sm text-ink truncate">{a.name}</p>
                                <p className="text-xs text-muted mt-0.5 truncate" dir="ltr">{a.email}</p>
                            </div>
                            <div className="flex gap-1.5 shrink-0">
                                <button onClick={() => { setEditAdmin(a); setFormOpen(true); }}
                                    className="bg-cream-2 border border-cream-3 text-ink text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-gold-pale hover:border-gold hover:text-gold transition-colors">✏️ تعديل</button>
                                <button onClick={() => handleDelete(a)}
                                    className="border border-cream-3 text-gray-400 text-xs font-bold px-2.5 py-1.5 rounded-lg hover:text-red-500 hover:border-red-400 transition-colors">🗑️</button>
                            </div>
                        </div>
                    ))}
                </div>
                <AdminForm open={formOpen} onClose={() => { setFormOpen(false); setEditAdmin(null); }} admin={editAdmin} />
            </AdminLayout>
        </>
    );
}
