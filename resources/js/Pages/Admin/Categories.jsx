import { useState, useRef } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';
import { Button, Modal, Input, Toast } from '../../Components/UI';
import { useConfirm } from '../../Components/useConfirm';

function CatForm({ open, onClose, category, topLevelCategories }) {
    const isEdit = !!category;
    const { data, setData, post, put, processing, errors, reset } = useForm({
        parent_id:  category?.parent_id || '',
        name:       category?.name || '',
        name_he:    category?.name_he || '',
        name_en:    category?.name_en || '',
        icon:       category?.icon || '',
        key:        category?.key || '',
        sort_order: category?.sort_order || 0,
        is_active:  category?.is_active ?? true,
    });

    // Image upload state
    const [imgPreview, setImgPreview]     = useState(category?.image ? `/storage/${category.image}` : null);
    const [imgUploading, setImgUploading] = useState(false);
    const imgInput = useRef(null);
    const { confirmAction: confirmImageDelete, dialog: imageDeleteDialog } = useConfirm();

    function submit(e) {
        e.preventDefault();
        const payload = { ...data, parent_id: data.parent_id || null };
        if (isEdit) {
            put(route('admin.categories.update', category.id), { data: payload, onSuccess: () => { onClose(); reset(); } });
        } else {
            post(route('admin.categories.store'), { data: payload, onSuccess: () => { onClose(); reset(); } });
        }
    }

    function handleImageChange(e) {
        const file = e.target.files[0];
        if (!file) return;
        setImgPreview(URL.createObjectURL(file));
        setImgUploading(true);
        router.post(route('admin.categories.uploadImage', category.id), { image: file }, {
            forceFormData: true,
            onFinish: () => setImgUploading(false),
        });
    }

    function deleteImage() {
        confirmImageDelete('حذف صورة الصنف؟', (cb) => router.delete(route('admin.categories.destroyImage', category.id), {
            ...cb,
            onSuccess: () => { setImgPreview(null); cb.onSuccess(); },
        }));
    }

    // لا يمكن اختيار الصنف نفسه كأب له
    const parentOptions = topLevelCategories.filter(c => c.id !== category?.id);

    return (
        <>
        {imageDeleteDialog}
        <Modal open={open} onClose={onClose} title={isEdit ? 'تعديل الصنف' : 'إضافة صنف'} maxWidth="max-w-sm">
            <form onSubmit={submit} className="space-y-3">
                <Input label="اسم الصنف" value={data.name} onChange={e=>setData('name',e.target.value)} error={errors.name} placeholder="قارمات مضيئة" />
                <p className="text-[11px] text-muted -mt-1.5">🌐 تُترجم تلقائياً للعبري والإنجليزي</p>
                <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold tracking-widest uppercase text-muted">الصنف الأب (اختياري)</label>
                    <select value={data.parent_id} onChange={e=>setData('parent_id', e.target.value)}
                        className="px-3 py-2 border-2 border-cream-3 focus:border-gold rounded-lg text-sm text-ink bg-cream outline-none">
                        <option value="">— صنف رئيسي (بدون أب) —</option>
                        {parentOptions.map(c => (
                            <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                        ))}
                    </select>
                    {errors.parent_id && <p className="text-xs text-red-500">{errors.parent_id}</p>}
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <Input label="الأيقونة" value={data.icon} onChange={e=>setData('icon',e.target.value)} placeholder="🔆" />
                    <Input label="المفتاح (بالإنجليزي)" value={data.key} onChange={e=>setData('key',e.target.value)} error={errors.key} placeholder="sign_q" disabled={isEdit} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <Input label="الترتيب" type="number" value={data.sort_order} onChange={e=>setData('sort_order',Number(e.target.value))} />
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-bold tracking-widest uppercase text-muted">يظهر</label>
                        <select value={data.is_active?'1':'0'} onChange={e=>setData('is_active',e.target.value==='1')}
                            className="px-3 py-2 border-2 border-cream-3 focus:border-gold rounded-lg text-sm text-ink bg-cream outline-none">
                            <option value="1">نعم ✅</option><option value="0">لا ❌</option>
                        </select>
                    </div>
                </div>

                {/* صورة الصنف — فقط عند التعديل */}
                {isEdit && (
                    <div className="border border-cream-3 rounded-xl p-3 space-y-2">
                        <p className="text-xs font-bold text-muted">🖼 صورة الصنف (تظهر في شريط الأصناف)</p>
                        {imgPreview ? (
                            <div className="relative w-20 h-20">
                                <img src={imgPreview} alt="" className="w-20 h-20 rounded-xl object-cover" />
                                {imgUploading && (
                                    <div className="absolute inset-0 bg-white/70 rounded-xl flex items-center justify-center text-xs text-gold font-bold">⏳</div>
                                )}
                                <button type="button" onClick={deleteImage}
                                    className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center leading-none hover:bg-red-600">✕</button>
                            </div>
                        ) : (
                            <button type="button" onClick={() => imgInput.current?.click()}
                                className="w-20 h-20 border-2 border-dashed border-cream-3 rounded-xl flex flex-col items-center justify-center gap-1 hover:border-gold hover:bg-gold-pale transition-colors text-muted hover:text-gold">
                                <span className="text-xl">🖼</span>
                                <span className="text-[10px] font-bold">رفع صورة</span>
                            </button>
                        )}
                        <input ref={imgInput} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                        {!imgPreview && (
                            <p className="text-[10px] text-muted">PNG أو JPG — الحجم المثالي مربع</p>
                        )}
                    </div>
                )}

                <div className="flex gap-2 pt-1">
                    <button type="button" onClick={onClose} className="bg-cream-2 text-ink border border-cream-3 px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-cream-3">إلغاء</button>
                    <button type="submit" disabled={processing} className="flex-1 bg-ink text-white py-2.5 rounded-xl font-black text-sm hover:bg-gold transition-colors disabled:opacity-60">
                        {processing ? '⏳...' : '💾 حفظ'}
                    </button>
                </div>
            </form>
        </Modal>
        </>
    );
}

function CategoryRow({ c, isChild, onEdit, onDelete }) {
    return (
        <div className={`flex items-center gap-3 px-4 py-3.5 hover:bg-cream transition-colors ${isChild ? 'bg-cream/40 ps-10' : ''}`}>
            {isChild && <span className="text-muted text-sm shrink-0">↳</span>}
            <div className="w-11 h-11 bg-cream-2 rounded-xl overflow-hidden flex items-center justify-center text-xl shrink-0">
                {c.image
                    ? <img src={`/storage/${c.image}`} alt={c.name} className="w-full h-full object-cover" />
                    : (c.icon || '📁')
                }
            </div>
            <div className="flex-1">
                <p className="font-bold text-sm text-ink">{c.name}</p>
                <p className="text-xs text-muted mt-0.5">
                    مفتاح: {c.key} · ترتيب: {c.sort_order} · {c.is_active ? '✅ نشط' : '❌ مخفي'}
                    {c.image && <span className="text-green-500 mr-1">· 🖼 صورة</span>}
                </p>
            </div>
            <div className="flex gap-1.5">
                <button onClick={() => onEdit(c)}
                    className="bg-cream-2 border border-cream-3 text-ink text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-gold-pale hover:border-gold hover:text-gold transition-colors">✏️ تعديل</button>
                <button onClick={() => onDelete(c)}
                    className="border border-cream-3 text-gray-400 text-xs font-bold px-2.5 py-1.5 rounded-lg hover:text-red-500 hover:border-red-400 transition-colors">🗑️</button>
            </div>
        </div>
    );
}

export default function Categories({ categories }) {
    const [formOpen, setFormOpen] = useState(false);
    const [editCat, setEditCat] = useState(null);
    const { delete: destroy } = useForm();
    const { confirmAction, dialog } = useConfirm();
    const [toast, setToast] = useState({ show: false, msg: '' });

    function showToast(msg) {
        setToast({ show: true, msg });
        setTimeout(() => setToast({ show: false, msg: '' }), 3000);
    }

    function handleDelete(cat) {
        if (cat.children?.length || categories.some(c => c.parent_id === cat.id)) {
            showToast('لا يمكن حذف صنف عنده أصناف فرعية — احذف الأصناف الفرعية أولاً');
            return;
        }
        confirmAction(`حذف "${cat.name}"؟`,
            (cb) => destroy(route('admin.categories.destroy', cat.id), cb));
    }

    const topLevel = categories.filter(c => !c.parent_id);
    const childrenOf = (parentId) => categories.filter(c => c.parent_id === parentId);

    return (
        <>
            <Head title="الأصناف — الإدارة" />
            {dialog}
            <Toast message={toast.msg} show={toast.show} />
            <AdminLayout title="🗂️ الأصناف">
                <div className="flex justify-between items-center mb-5">
                    <p className="text-muted text-sm">{categories.length} صنف ({topLevel.length} رئيسي)</p>
                    <Button variant="gold" onClick={() => { setEditCat(null); setFormOpen(true); }}>+ إضافة صنف</Button>
                </div>
                <div className="bg-white rounded-2xl border border-cream-3 overflow-hidden divide-y divide-cream-3">
                    {topLevel.map(parent => (
                        <div key={parent.id}>
                            <CategoryRow c={parent} isChild={false}
                                onEdit={c => { setEditCat(c); setFormOpen(true); }} onDelete={handleDelete} />
                            {childrenOf(parent.id).map(child => (
                                <CategoryRow key={child.id} c={child} isChild
                                    onEdit={c => { setEditCat(c); setFormOpen(true); }} onDelete={handleDelete} />
                            ))}
                        </div>
                    ))}
                </div>
                <CatForm open={formOpen} onClose={() => { setFormOpen(false); setEditCat(null); }}
                    category={editCat} topLevelCategories={topLevel} />
            </AdminLayout>
        </>
    );
}
