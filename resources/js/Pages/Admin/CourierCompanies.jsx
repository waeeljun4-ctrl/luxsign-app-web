import { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';

const FIELD_MAP_EXAMPLE = `{
  "login": {
    "username_selector": "#username",
    "password_selector": "#password",
    "submit_selector": "button[type=submit]"
  },
  "fields": {
    "recipient_name": "input[name=recipientName]",
    "phone": "input[name=phone]",
    "address": "input[name=address]",
    "cod_amount": "input[name=codAmount]",
    "notes": "textarea[name=notes]",
    "order_ref": "input[name=shipmentRef]"
  },
  "fixed_selections": [
    { "selector": "select[name=paymentMethod]", "value": "تحصيل عند الاستلام" }
  ],
  "submit_selector": "button.send-parcel"
}`;

function CompanyForm({ company, onClose }) {
    const isEdit = !!company;
    const { data, setData, post, patch, transform, processing, errors, reset } = useForm({
        name: company?.name || '',
        login_url: company?.login_url || '',
        add_shipment_url: company?.add_shipment_url || '',
        username: '',
        password: '',
        field_map: company?.field_map ? JSON.stringify(company.field_map, null, 2) : FIELD_MAP_EXAMPLE,
        is_active: company?.is_active ?? true,
    });
    const [jsonError, setJsonError] = useState('');

    function submit(e) {
        e.preventDefault();
        let parsedMap;
        try {
            parsedMap = JSON.parse(data.field_map);
        } catch {
            setJsonError('صيغة الـ JSON غلط — تأكد من الأقواس والفواصل');
            return;
        }
        setJsonError('');
        transform(current => ({ ...current, field_map: parsedMap }));
        if (isEdit) {
            patch(route('admin.courierCompanies.update', company.id), { onSuccess: () => { onClose(); reset(); } });
        } else {
            post(route('admin.courierCompanies.store'), { onSuccess: () => { onClose(); reset(); } });
        }
    }

    return (
        <form onSubmit={submit} className="bg-white rounded-2xl border border-cream-3 p-4 mb-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="text-xs font-bold tracking-widest uppercase text-muted block mb-1.5">اسم الشركة</label>
                    <input value={data.name} onChange={e => setData('name', e.target.value)} placeholder="أكتوس"
                        className="w-full px-3 py-2 border-2 border-cream-3 focus:border-gold rounded-xl text-sm text-ink bg-cream outline-none" />
                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                </div>
                <div className="flex items-center gap-2 pt-6">
                    <input type="checkbox" checked={data.is_active} onChange={e => setData('is_active', e.target.checked)}
                        className="accent-gold w-4 h-4" />
                    <span className="text-sm font-bold text-ink">فعّالة</span>
                </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="text-xs font-bold tracking-widest uppercase text-muted block mb-1.5">رابط تسجيل الدخول</label>
                    <input value={data.login_url} onChange={e => setData('login_url', e.target.value)} placeholder="https://actus.logestechs.com/login"
                        className="w-full px-3 py-2 border-2 border-cream-3 focus:border-gold rounded-xl text-sm text-ink bg-cream outline-none" dir="ltr" />
                    {errors.login_url && <p className="text-red-500 text-xs mt-1">{errors.login_url}</p>}
                </div>
                <div>
                    <label className="text-xs font-bold tracking-widest uppercase text-muted block mb-1.5">رابط صفحة "طرد جديد"</label>
                    <input value={data.add_shipment_url} onChange={e => setData('add_shipment_url', e.target.value)} placeholder="https://actus.logestechs.com/shipments/new"
                        className="w-full px-3 py-2 border-2 border-cream-3 focus:border-gold rounded-xl text-sm text-ink bg-cream outline-none" dir="ltr" />
                </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="text-xs font-bold tracking-widest uppercase text-muted block mb-1.5">
                        اسم المستخدم {isEdit && <span className="text-muted normal-case">(اتركه فاضي لعدم التغيير)</span>}
                    </label>
                    <input value={data.username} onChange={e => setData('username', e.target.value)}
                        className="w-full px-3 py-2 border-2 border-cream-3 focus:border-gold rounded-xl text-sm text-ink bg-cream outline-none" dir="ltr" />
                </div>
                <div>
                    <label className="text-xs font-bold tracking-widest uppercase text-muted block mb-1.5">
                        كلمة المرور {isEdit && <span className="text-muted normal-case">(اتركها فاضية لعدم التغيير)</span>}
                    </label>
                    <input type="password" value={data.password} onChange={e => setData('password', e.target.value)}
                        className="w-full px-3 py-2 border-2 border-cream-3 focus:border-gold rounded-xl text-sm text-ink bg-cream outline-none" dir="ltr" />
                </div>
            </div>
            <div>
                <label className="text-xs font-bold tracking-widest uppercase text-muted block mb-1.5">
                    خريطة الحقول (JSON) — احصل عليها بمساعدة Claude for Chrome
                </label>
                <textarea value={data.field_map} onChange={e => setData('field_map', e.target.value)} rows={12}
                    className="w-full px-3 py-2 border-2 border-cream-3 focus:border-gold rounded-xl text-xs font-mono text-ink bg-cream outline-none" dir="ltr" />
                {jsonError && <p className="text-red-500 text-xs mt-1">{jsonError}</p>}
                {errors.field_map && <p className="text-red-500 text-xs mt-1">{errors.field_map}</p>}
            </div>
            <div className="flex gap-2 pt-1">
                <button type="button" onClick={onClose} className="bg-cream-2 text-ink border border-cream-3 px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-cream-3">إلغاء</button>
                <button type="submit" disabled={processing} className="flex-1 bg-ink text-white py-2.5 rounded-xl font-black text-sm hover:bg-gold transition-colors disabled:opacity-60">
                    {processing ? '⏳...' : '💾 حفظ'}
                </button>
            </div>
        </form>
    );
}

function CompanyRow({ company, onEdit }) {
    function toggleActive() {
        router.patch(route('admin.courierCompanies.update', company.id), {
            name: company.name, login_url: company.login_url, add_shipment_url: company.add_shipment_url,
            field_map: company.field_map, is_active: !company.is_active,
        }, { preserveScroll: true });
    }
    function remove() {
        if (!confirm(`حذف "${company.name}"؟`)) return;
        router.delete(route('admin.courierCompanies.destroy', company.id));
    }
    return (
        <div className="flex items-center gap-3 px-4 py-3.5 hover:bg-cream transition-colors">
            <div className="flex-1 min-w-0">
                <p className="font-bold text-sm text-ink">{company.name}</p>
                <p className="text-xs text-muted mt-0.5" dir="ltr">{company.login_url}</p>
                {company.last_used_at && <p className="text-xs text-muted mt-0.5">آخر استخدام: {new Date(company.last_used_at).toLocaleString('ar-PS')}</p>}
            </div>
            <label className="flex items-center gap-1.5 text-xs font-bold text-muted shrink-0 cursor-pointer">
                <input type="checkbox" checked={company.is_active} onChange={toggleActive} className="accent-gold w-4 h-4 cursor-pointer" />
                فعّالة
            </label>
            <button onClick={() => onEdit(company)} className="bg-cream-2 border border-cream-3 text-ink text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-gold-pale hover:border-gold hover:text-gold transition-colors">✏️ تعديل</button>
            <button onClick={remove} className="text-gray-400 hover:text-red-500 text-sm shrink-0">🗑️</button>
        </div>
    );
}

export default function CourierCompanies({ companies }) {
    const [formOpen, setFormOpen] = useState(false);
    const [editCompany, setEditCompany] = useState(null);

    return (
        <>
            <Head title="شركات التوصيل — الإدارة" />
            <AdminLayout title="🚚 شركات التوصيل">
                <div className="flex justify-between items-center mb-5">
                    <p className="text-muted text-sm">{companies.length} شركة — الشركات الفعّالة تظهر بقائمة الإرسال بصفحة الطلبات</p>
                    {!formOpen && (
                        <button onClick={() => { setEditCompany(null); setFormOpen(true); }}
                            className="bg-ink text-white font-black text-sm px-4 py-2 rounded-xl hover:bg-gold transition-colors">+ إضافة شركة</button>
                    )}
                </div>
                {formOpen && <CompanyForm company={editCompany} onClose={() => { setFormOpen(false); setEditCompany(null); }} />}
                <div className="bg-white rounded-2xl border border-cream-3 overflow-hidden divide-y divide-cream-3">
                    {companies.length === 0 && (
                        <p className="text-center text-muted text-sm py-10">ما في شركات توصيل مضافة بعد</p>
                    )}
                    {companies.map(c => <CompanyRow key={c.id} company={c} onEdit={co => { setEditCompany(co); setFormOpen(true); }} />)}
                </div>
            </AdminLayout>
        </>
    );
}
