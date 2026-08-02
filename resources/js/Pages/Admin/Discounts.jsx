import { useState } from 'react';
import { Head, useForm, router, Link } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';
import { useConfirm } from '../../Components/useConfirm';

function MultiPicker({ label, options, selected, onChange }) {
    function toggle(id) {
        onChange(selected.includes(id) ? selected.filter(x => x !== id) : [...selected, id]);
    }

    return (
        <div>
            <label className="text-xs font-bold tracking-widest uppercase text-muted block mb-1.5">{label}</label>
            <div className="border-2 border-cream-3 rounded-xl p-2 max-h-40 overflow-y-auto flex flex-wrap gap-1.5">
                {options.length === 0 && <p className="text-xs text-muted p-2">لا يوجد خيارات</p>}
                {options.map(o => (
                    <button key={o.id} type="button" onClick={() => toggle(o.id)}
                        className={`text-xs font-bold px-2.5 py-1.5 rounded-lg border-2 transition-colors ${
                            selected.includes(o.id) ? 'bg-gold-pale border-gold text-gold' : 'bg-cream border-cream-3 text-muted hover:border-gold'
                        }`}>
                        {o.icon ? `${o.icon} ` : ''}{o.name}
                    </button>
                ))}
            </div>
        </div>
    );
}

function CampaignForm({ categories, products, onClose }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        type: 'percentage',
        value: '',
        starts_at: '',
        ends_at: '',
        category_ids: [],
        product_ids: [],
    });

    function submit(e) {
        e.preventDefault();
        post(route('admin.discounts.store'), { onSuccess: () => { onClose(); reset(); } });
    }

    return (
        <form onSubmit={submit} className="bg-white rounded-2xl border border-cream-3 p-4 mb-4 space-y-3">
            <div>
                <label className="text-xs font-bold tracking-widest uppercase text-muted block mb-1.5">اسم الحملة</label>
                <input value={data.name} onChange={e => setData('name', e.target.value)}
                    placeholder="تخفيضات الصيف"
                    className="w-full px-3 py-2 border-2 border-cream-3 focus:border-gold rounded-xl text-sm text-ink bg-cream outline-none" />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="text-xs font-bold tracking-widest uppercase text-muted block mb-1.5">النوع</label>
                    <select value={data.type} onChange={e => setData('type', e.target.value)}
                        className="w-full px-3 py-2 border-2 border-cream-3 focus:border-gold rounded-xl text-sm text-ink bg-cream outline-none">
                        <option value="percentage">نسبة %</option>
                        <option value="fixed">مبلغ ثابت ₪</option>
                    </select>
                </div>
                <div>
                    <label className="text-xs font-bold tracking-widest uppercase text-muted block mb-1.5">القيمة</label>
                    <input type="number" min="0.01" step="0.01" value={data.value} onChange={e => setData('value', e.target.value)}
                        placeholder={data.type === 'percentage' ? '20' : '15'}
                        className="w-full px-3 py-2 border-2 border-cream-3 focus:border-gold rounded-xl text-sm text-ink bg-cream outline-none" />
                    {errors.value && <p className="text-red-500 text-xs mt-1">{errors.value}</p>}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="text-xs font-bold tracking-widest uppercase text-muted block mb-1.5">تاريخ البداية (اختياري)</label>
                    <input type="date" value={data.starts_at} onChange={e => setData('starts_at', e.target.value)}
                        className="w-full px-3 py-2 border-2 border-cream-3 focus:border-gold rounded-xl text-sm text-ink bg-cream outline-none" />
                </div>
                <div>
                    <label className="text-xs font-bold tracking-widest uppercase text-muted block mb-1.5">تاريخ الانتهاء (اختياري)</label>
                    <input type="date" value={data.ends_at} onChange={e => setData('ends_at', e.target.value)}
                        className="w-full px-3 py-2 border-2 border-cream-3 focus:border-gold rounded-xl text-sm text-ink bg-cream outline-none" />
                </div>
            </div>

            <p className="text-xs text-muted">اختر الأصناف و/أو المنتجات المحددة يلي بدك الحملة تطبق عليهم (تقدر تختار الاثنين مع بعض).</p>

            <MultiPicker label="الأصناف" options={categories} selected={data.category_ids} onChange={v => setData('category_ids', v)} />
            <MultiPicker label="منتجات محددة" options={products} selected={data.product_ids} onChange={v => setData('product_ids', v)} />

            <div className="flex gap-2 pt-1">
                <button type="button" onClick={onClose} className="bg-cream-2 text-ink border border-cream-3 px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-cream-3">إلغاء</button>
                <button type="submit" disabled={processing} className="flex-1 bg-ink text-white py-2.5 rounded-xl font-black text-sm hover:bg-gold transition-colors disabled:opacity-60">
                    {processing ? '⏳...' : '💾 إنشاء الحملة'}
                </button>
            </div>
        </form>
    );
}

function CampaignRow({ campaign }) {
    const { delete: destroy, data, setData } = useForm({ is_active: campaign.is_active });
    const { confirmAction, dialog } = useConfirm();

    function toggleActive() {
        const next = !data.is_active;
        setData('is_active', next);
        router.patch(route('admin.discounts.update', campaign.id), {
            name: campaign.name, type: campaign.type, value: campaign.value,
            starts_at: campaign.starts_at, ends_at: campaign.ends_at,
            category_ids: campaign.categories.map(c => c.id),
            product_ids: campaign.products.map(p => p.id),
            is_active: next,
        }, { preserveScroll: true });
    }

    function remove() {
        confirmAction(`حذف حملة "${campaign.name}"؟`,
            (cb) => destroy(route('admin.discounts.destroy', campaign.id), cb));
    }

    const notStarted = campaign.starts_at && new Date(campaign.starts_at) > new Date();
    const ended = campaign.ends_at && new Date(campaign.ends_at) < new Date();
    const scope = [...campaign.categories.map(c => c.name), ...campaign.products.map(p => p.name)];

    return (
        <div className="flex items-center gap-3 px-4 py-3.5 hover:bg-cream transition-colors">
            {dialog}
            <div className="flex-1 min-w-0">
                <p className="font-black text-sm text-ink">{campaign.name}</p>
                <p className="text-xs text-muted mt-0.5">
                    {campaign.type === 'percentage' ? `خصم ${campaign.value}%` : `خصم ${campaign.value}₪ ثابت`}
                    {campaign.starts_at && ` · يبدأ ${campaign.starts_at.slice(0, 10)}`}
                    {campaign.ends_at && ` · ينتهي ${campaign.ends_at.slice(0, 10)}`}
                    {notStarted && <span className="text-orange-500 font-bold"> · لسا ما بدأ</span>}
                    {ended && <span className="text-red-500 font-bold"> · منتهي</span>}
                </p>
                <p className="text-xs text-muted mt-0.5 truncate">
                    {scope.length ? `يطبق على: ${scope.join('، ')}` : 'لم يُحدَّد نطاق بعد'}
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

export default function Discounts({ campaigns, categories, products }) {
    const [formOpen, setFormOpen] = useState(false);

    return (
        <>
            <Head title="حملات الخصم — الإدارة" />
            <AdminLayout title="🏷️ حملات الخصم">
                <div className="flex gap-2 mb-5">
                    <Link href={route('admin.coupons.index')}
                        className="flex-1 bg-white border-2 border-cream-3 text-muted font-black text-sm px-4 py-2 rounded-xl text-center hover:border-gold hover:text-gold transition-colors">
                        🎟️ الكوبونات
                    </Link>
                    <div className="flex-1 bg-white border-2 border-gold text-gold font-black text-sm px-4 py-2 rounded-xl text-center">🏷️ حملات الخصم</div>
                </div>
                <div className="flex justify-between items-center mb-5">
                    <p className="text-muted text-sm">{campaigns.length} حملة — خصم تلقائي على أصناف أو منتجات محددة، بدون كود</p>
                    {!formOpen && (
                        <button onClick={() => setFormOpen(true)}
                            className="bg-ink text-white font-black text-sm px-4 py-2 rounded-xl hover:bg-gold transition-colors shrink-0">+ حملة جديدة</button>
                    )}
                </div>
                {formOpen && <CampaignForm categories={categories} products={products} onClose={() => setFormOpen(false)} />}
                <div className="bg-white rounded-2xl border border-cream-3 overflow-hidden divide-y divide-cream-3">
                    {campaigns.length === 0 && (
                        <p className="text-center text-muted text-sm py-10">لا يوجد حملات خصم بعد</p>
                    )}
                    {campaigns.map(c => <CampaignRow key={c.id} campaign={c} />)}
                </div>
            </AdminLayout>
        </>
    );
}
