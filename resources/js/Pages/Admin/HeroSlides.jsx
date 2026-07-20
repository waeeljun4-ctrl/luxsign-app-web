import { useState, useRef } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';
import { Button, Modal, Input, Textarea } from '../../Components/UI';

function SlideForm({ open, onClose, slide }) {
    const isEdit = !!slide;
    const { data, setData, post, put, processing, errors, reset } = useForm({
        title:       slide?.title || '',
        title_he:    slide?.title_he || '',
        title_en:    slide?.title_en || '',
        subtitle:    slide?.subtitle || '',
        subtitle_he: slide?.subtitle_he || '',
        subtitle_en: slide?.subtitle_en || '',
        cta_text:    slide?.cta_text || '',
        cta_text_he: slide?.cta_text_he || '',
        cta_text_en: slide?.cta_text_en || '',
        cta_link:    slide?.cta_link || '',
        sort_order:  slide?.sort_order || 0,
        is_active:   slide?.is_active ?? true,
    });

    const [imgPreview, setImgPreview]     = useState(slide?.image ? `/storage/${slide.image}` : null);
    const [imgUploading, setImgUploading] = useState(false);
    const imgInput = useRef(null);

    function submit(e) {
        e.preventDefault();
        if (isEdit) {
            put(route('admin.heroSlides.update', slide.id), { onSuccess: () => { onClose(); reset(); } });
        } else {
            post(route('admin.heroSlides.store'), { onSuccess: () => { onClose(); reset(); } });
        }
    }

    function handleImageChange(e) {
        const file = e.target.files[0];
        if (!file) return;
        setImgPreview(URL.createObjectURL(file));
        setImgUploading(true);
        router.post(route('admin.heroSlides.uploadImage', slide.id), { image: file }, {
            forceFormData: true,
            onFinish: () => setImgUploading(false),
        });
    }

    function deleteImage() {
        if (!confirm('حذف صورة الشريحة؟')) return;
        router.delete(route('admin.heroSlides.destroyImage', slide.id), {
            onSuccess: () => setImgPreview(null),
        });
    }

    return (
        <Modal open={open} onClose={onClose} title={isEdit ? 'تعديل الشريحة' : 'إضافة شريحة'} maxWidth="max-w-md">
            <form onSubmit={submit} className="space-y-3">
                <Input label="العنوان (عربي)" value={data.title} onChange={e=>setData('title',e.target.value)} error={errors.title} placeholder="قارمات مضيئة بتصميمك أنت" />
                <div className="grid grid-cols-2 gap-3">
                    <Input label="العنوان بالعبري" value={data.title_he} onChange={e=>setData('title_he',e.target.value)} />
                    <Input label="العنوان بالإنجليزي" value={data.title_en} onChange={e=>setData('title_en',e.target.value)} />
                </div>

                <Textarea label="الوصف (عربي)" value={data.subtitle} onChange={e=>setData('subtitle',e.target.value)} rows={2} placeholder="صمّم لوحتك بالشكل والحجم اللي بدك ياه" />
                <div className="grid grid-cols-2 gap-3">
                    <Textarea label="الوصف بالعبري" value={data.subtitle_he} onChange={e=>setData('subtitle_he',e.target.value)} rows={2} />
                    <Textarea label="الوصف بالإنجليزي" value={data.subtitle_en} onChange={e=>setData('subtitle_en',e.target.value)} rows={2} />
                </div>

                <div className="grid grid-cols-3 gap-3">
                    <Input label="نص الزر" value={data.cta_text} onChange={e=>setData('cta_text',e.target.value)} placeholder="تصفح المنتجات" />
                    <Input label="الزر بالعبري" value={data.cta_text_he} onChange={e=>setData('cta_text_he',e.target.value)} />
                    <Input label="الزر بالإنجليزي" value={data.cta_text_en} onChange={e=>setData('cta_text_en',e.target.value)} />
                </div>
                <Input label="رابط الزر (اختياري)" value={data.cta_link} onChange={e=>setData('cta_link',e.target.value)} placeholder="/#products أو رابط خارجي" />

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

                {/* صورة الخلفية — فقط عند التعديل */}
                {isEdit && (
                    <div className="border border-cream-3 rounded-xl p-3 space-y-2">
                        <p className="text-xs font-bold text-muted">🖼 صورة خلفية الشريحة (اختياري — بدونها بتظهر خلفية متدرجة ذهبية)</p>
                        {imgPreview ? (
                            <div className="relative w-full h-28">
                                <img src={imgPreview} alt="" className="w-full h-28 rounded-xl object-cover" />
                                {imgUploading && (
                                    <div className="absolute inset-0 bg-white/70 rounded-xl flex items-center justify-center text-xs text-gold font-bold">⏳</div>
                                )}
                                <button type="button" onClick={deleteImage}
                                    className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center leading-none hover:bg-red-600">✕</button>
                            </div>
                        ) : (
                            <button type="button" onClick={() => imgInput.current?.click()}
                                className="w-full h-20 border-2 border-dashed border-cream-3 rounded-xl flex flex-col items-center justify-center gap-1 hover:border-gold hover:bg-gold-pale transition-colors text-muted hover:text-gold">
                                <span className="text-xl">🖼</span>
                                <span className="text-[10px] font-bold">رفع صورة</span>
                            </button>
                        )}
                        <input ref={imgInput} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                        {!imgPreview && (
                            <p className="text-[10px] text-muted">الحجم المثالي: عريض (1600×600 تقريباً)</p>
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
    );
}

export default function HeroSlides({ slides }) {
    const [formOpen, setFormOpen] = useState(false);
    const [editSlide, setEditSlide] = useState(null);
    const { delete: destroy } = useForm();

    function handleDelete(s) {
        if (!confirm(`حذف شريحة "${s.title}"؟`)) return;
        destroy(route('admin.heroSlides.destroy', s.id));
    }

    return (
        <>
            <Head title="السلايدر — الإدارة" />
            <AdminLayout title="🎞️ السلايدر (أعلى الصفحة)">
                <div className="flex justify-between items-center mb-5">
                    <p className="text-muted text-sm">{slides.length} شريحة</p>
                    <Button variant="gold" onClick={() => { setEditSlide(null); setFormOpen(true); }}>+ إضافة شريحة</Button>
                </div>
                <div className="bg-white rounded-2xl border border-cream-3 overflow-hidden">
                    {slides.length === 0 && (
                        <p className="text-center text-muted text-sm py-10">ما في شرائح بعد — أضف أول شريحة</p>
                    )}
                    {slides.map((s, i) => (
                        <div key={s.id} className={`flex items-center gap-3 px-4 py-3.5 hover:bg-cream transition-colors ${i < slides.length-1 ? 'border-b border-cream-3' : ''}`}>
                            <div className="w-16 h-11 bg-gradient-to-br from-ink to-gold rounded-xl overflow-hidden flex items-center justify-center text-xs text-white shrink-0">
                                {s.image
                                    ? <img src={`/storage/${s.image}`} alt={s.title} className="w-full h-full object-cover" />
                                    : '🎞️'
                                }
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-bold text-sm text-ink truncate">{s.title}</p>
                                <p className="text-xs text-muted mt-0.5 truncate">
                                    ترتيب: {s.sort_order} · {s.is_active ? '✅ نشط' : '❌ مخفي'}
                                    {s.image && <span className="text-green-500 mr-1">· 🖼 صورة</span>}
                                </p>
                            </div>
                            <div className="flex gap-1.5 shrink-0">
                                <button onClick={() => { setEditSlide(s); setFormOpen(true); }}
                                    className="bg-cream-2 border border-cream-3 text-ink text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-gold-pale hover:border-gold hover:text-gold transition-colors">✏️ تعديل</button>
                                <button onClick={() => handleDelete(s)}
                                    className="border border-cream-3 text-gray-400 text-xs font-bold px-2.5 py-1.5 rounded-lg hover:text-red-500 hover:border-red-400 transition-colors">🗑️</button>
                            </div>
                        </div>
                    ))}
                </div>
                <SlideForm open={formOpen} onClose={() => { setFormOpen(false); setEditSlide(null); }} slide={editSlide} />
            </AdminLayout>
        </>
    );
}
