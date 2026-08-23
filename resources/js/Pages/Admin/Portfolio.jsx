import { useState, useRef } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';
import { Button, Modal, Input, Textarea, Select } from '../../Components/UI';
import { useConfirm } from '../../Components/useConfirm';

function ProjectForm({ open, onClose, project }) {
    const isEdit = !!project;
    const imgRef = useRef(null);
    const vidRef = useRef(null);
    const [imgPreview, setImgPreview] = useState(project?.image ? `/storage/${project.image}` : null);
    const [vidPreview, setVidPreview] = useState(project?.video ? `/storage/${project.video}` : null);
    const { confirmAction, dialog } = useConfirm();

    const { data, setData, post, processing, errors, reset } = useForm({
        title: project?.title || '',
        title_he: project?.title_he || '',
        title_en: project?.title_en || '',
        description: project?.description || '',
        description_he: project?.description_he || '',
        description_en: project?.description_en || '',
        category: project?.category || '',
        sort_order: project?.sort_order || 0,
        is_active: project?.is_active ?? true,
        image: null,
        video: null,
    });

    function submit(e) {
        e.preventDefault();
        const url = isEdit ? route('admin.portfolio.update', project.id) : route('admin.portfolio.store');
        post(url, {
            forceFormData: true,
            onSuccess: () => { onClose(); reset(); setImgPreview(null); setVidPreview(null); },
        });
    }

    function handleImage(e) {
        const file = e.target.files[0];
        if (!file) return;
        setData('image', file);
        setImgPreview(URL.createObjectURL(file));
    }

    function handleVideo(e) {
        const file = e.target.files[0];
        if (!file) return;
        setData('video', file);
        setVidPreview(URL.createObjectURL(file));
    }

    function deleteImage() {
        confirmAction('حذف الصورة؟', (cb) => router.delete(route('admin.portfolio.destroyImage', project.id), {
            ...cb, onSuccess: () => { setImgPreview(null); cb.onSuccess(); },
        }));
    }

    function deleteVideo() {
        confirmAction('حذف الفيديو؟', (cb) => router.delete(route('admin.portfolio.destroyVideo', project.id), {
            ...cb, onSuccess: () => { setVidPreview(null); cb.onSuccess(); },
        }));
    }

    return (
        <>
            {dialog}
            <Modal open={open} onClose={onClose} title={isEdit ? 'تعديل عمل' : 'إضافة عمل جديد'} maxWidth="max-w-lg">
                <form onSubmit={submit} className="space-y-3">
                    <Input label="عنوان العمل" value={data.title} onChange={e => setData('title', e.target.value)}
                        error={errors.title} placeholder="قارمة دائرية مضيئة — رام الله" />

                    <Textarea label="الوصف" value={data.description} onChange={e => setData('description', e.target.value)}
                        rows={2} placeholder="قارمة LED دائرية بإضاءة بيضاء ناعمة لمحل مجوهرات" />
                    <p className="text-[11px] text-muted -mt-1.5">🌐 العنوان والوصف يُترجمان تلقائياً للعبري والإنجليزي</p>

                    <div className="grid grid-cols-3 gap-3">
                        <Input label="التصنيف (اختياري)" value={data.category} onChange={e => setData('category', e.target.value)}
                            placeholder="مثلاً: LED" />
                        <Input label="الترتيب" type="number" value={data.sort_order} onChange={e => setData('sort_order', Number(e.target.value))} />
                        <Select label="يظهر" value={data.is_active ? '1' : '0'} onChange={e => setData('is_active', e.target.value === '1')}>
                            <option value="1">نعم ✅</option>
                            <option value="0">لا ❌</option>
                        </Select>
                    </div>

                    <div className="border border-cream-3 rounded-xl p-3 space-y-2">
                        <p className="text-xs font-bold text-muted">🖼 صورة العمل</p>
                        {imgPreview ? (
                            <div className="relative w-full h-32">
                                <img src={imgPreview} alt="" className="w-full h-32 rounded-xl object-cover" />
                                <button type="button" onClick={() => isEdit ? deleteImage() : (setImgPreview(null), setData('image', null))}
                                    className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center leading-none hover:bg-red-600">✕</button>
                            </div>
                        ) : (
                            <button type="button" onClick={() => imgRef.current?.click()}
                                className="w-full h-24 border-2 border-dashed border-cream-3 rounded-xl flex flex-col items-center justify-center gap-1 hover:border-gold hover:bg-gold-pale transition-colors text-muted hover:text-gold">
                                <span className="text-xl">🖼</span>
                                <span className="text-[10px] font-bold">رفع صورة</span>
                            </button>
                        )}
                        <input ref={imgRef} type="file" accept="image/*" className="hidden" onChange={handleImage} />
                        {errors.image && <p className="text-xs text-red-500">{errors.image}</p>}
                    </div>

                    <div className="border border-cream-3 rounded-xl p-3 space-y-2">
                        <p className="text-xs font-bold text-muted">🎬 فيديو العمل (اختياري)</p>
                        {vidPreview ? (
                            <div className="relative">
                                <video src={vidPreview} controls className="w-full h-32 rounded-xl object-contain bg-black" />
                                <button type="button" onClick={() => isEdit ? deleteVideo() : (setVidPreview(null), setData('video', null))}
                                    className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center leading-none hover:bg-red-600">✕</button>
                            </div>
                        ) : (
                            <button type="button" onClick={() => vidRef.current?.click()}
                                className="w-full h-16 border-2 border-dashed border-cream-3 rounded-xl flex flex-col items-center justify-center gap-1 hover:border-gold hover:bg-gold-pale transition-colors text-muted hover:text-gold">
                                <span className="text-xl">🎬</span>
                                <span className="text-[10px] font-bold">رفع فيديو</span>
                            </button>
                        )}
                        <input ref={vidRef} type="file" accept="video/*" className="hidden" onChange={handleVideo} />
                        {errors.video && <p className="text-xs text-red-500">{errors.video}</p>}
                    </div>

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

export default function Portfolio({ projects }) {
    const [formOpen, setFormOpen] = useState(false);
    const [editProject, setEditProject] = useState(null);
    const { delete: destroy } = useForm();
    const { confirmAction, dialog } = useConfirm();

    function handleDelete(p) {
        confirmAction(`حذف "${p.title}"؟`, (cb) => destroy(route('admin.portfolio.destroy', p.id), cb));
    }

    return (
        <>
            <Head title="معرض الأعمال — الإدارة" />
            {dialog}
            <AdminLayout title="🖼️ معرض الأعمال">
                <div className="flex justify-between items-center mb-5">
                    <p className="text-muted text-sm">{projects.length} عمل</p>
                    <Button variant="gold" onClick={() => { setEditProject(null); setFormOpen(true); }}>+ إضافة عمل</Button>
                </div>
                <div className="bg-white rounded-2xl border border-cream-3 overflow-hidden">
                    {projects.length === 0 && (
                        <p className="text-center text-muted text-sm py-10">ما في أعمال بعد — أضف أول عمل</p>
                    )}
                    {projects.map((p, i) => (
                        <div key={p.id} className={`flex items-center gap-3 px-4 py-3.5 hover:bg-cream transition-colors ${i < projects.length - 1 ? 'border-b border-cream-3' : ''}`}>
                            <div className="w-16 h-11 bg-gradient-to-br from-ink to-gold rounded-xl overflow-hidden flex items-center justify-center text-xs text-white shrink-0">
                                {p.image ? <img src={`/storage/${p.image}`} alt={p.title} className="w-full h-full object-cover" /> : '🖼️'}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-bold text-sm text-ink truncate">{p.title}</p>
                                <p className="text-xs text-muted mt-0.5 truncate">
                                    {p.category && <>{p.category} · </>}ترتيب: {p.sort_order} · {p.is_active ? '✅ نشط' : '❌ مخفي'}
                                    {p.video && <span className="text-green-500 mr-1">· 🎬 فيديو</span>}
                                </p>
                            </div>
                            <div className="flex gap-1.5 shrink-0">
                                <button onClick={() => { setEditProject(p); setFormOpen(true); }}
                                    className="bg-cream-2 border border-cream-3 text-ink text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-gold-pale hover:border-gold hover:text-gold transition-colors">✏️ تعديل</button>
                                <button onClick={() => handleDelete(p)}
                                    className="border border-cream-3 text-gray-400 text-xs font-bold px-2.5 py-1.5 rounded-lg hover:text-red-500 hover:border-red-400 transition-colors">🗑️</button>
                            </div>
                        </div>
                    ))}
                </div>
                <ProjectForm open={formOpen} onClose={() => { setFormOpen(false); setEditProject(null); }} project={editProject} />
            </AdminLayout>
        </>
    );
}
