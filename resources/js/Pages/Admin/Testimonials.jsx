import { useState, useRef } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';
import { Button, Modal, Input, Textarea, Select } from '../../Components/UI';
import { useConfirm } from '../../Components/useConfirm';

function TestimonialForm({ open, onClose, testimonial }) {
    const isEdit = !!testimonial;
    const imgRef = useRef(null);
    const vidRef = useRef(null);
    const [imgPreview, setImgPreview] = useState(testimonial?.image ? `/storage/${testimonial.image}` : null);
    const [vidPreview, setVidPreview] = useState(testimonial?.video ? `/storage/${testimonial.video}` : null);
    const { confirmAction, dialog } = useConfirm();

    const { data, setData, post, processing, errors, reset } = useForm({
        customer_name: testimonial?.customer_name || '',
        city: testimonial?.city || '',
        stars: testimonial?.stars || 5,
        text: testimonial?.text || '',
        text_he: testimonial?.text_he || '',
        text_en: testimonial?.text_en || '',
        product_name: testimonial?.product_name || '',
        sort_order: testimonial?.sort_order || 0,
        is_active: testimonial?.is_active ?? true,
        image: null,
        video: null,
    });

    function submit(e) {
        e.preventDefault();
        const url = isEdit ? route('admin.testimonials.update', testimonial.id) : route('admin.testimonials.store');
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
        confirmAction('حذف الصورة؟', (cb) => router.delete(route('admin.testimonials.destroyImage', testimonial.id), {
            ...cb, onSuccess: () => { setImgPreview(null); cb.onSuccess(); },
        }));
    }

    function deleteVideo() {
        confirmAction('حذف الفيديو؟', (cb) => router.delete(route('admin.testimonials.destroyVideo', testimonial.id), {
            ...cb, onSuccess: () => { setVidPreview(null); cb.onSuccess(); },
        }));
    }

    return (
        <>
            {dialog}
            <Modal open={open} onClose={onClose} title={isEdit ? 'تعديل رأي زبون' : 'إضافة رأي زبون'} maxWidth="max-w-lg">
                <form onSubmit={submit} className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                        <Input label="اسم الزبون" value={data.customer_name} onChange={e => setData('customer_name', e.target.value)}
                            error={errors.customer_name} placeholder="أبو محمد الخليلي" />
                        <Input label="المدينة (اختياري)" value={data.city} onChange={e => setData('city', e.target.value)} placeholder="الخليل" />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <Select label="التقييم" value={data.stars} onChange={e => setData('stars', Number(e.target.value))}>
                            {[5, 4, 3, 2, 1].map(n => <option key={n} value={n}>{'★'.repeat(n)}{'☆'.repeat(5 - n)} ({n})</option>)}
                        </Select>
                        <Input label="المنتج (اختياري)" value={data.product_name} onChange={e => setData('product_name', e.target.value)}
                            placeholder="قارمة LED دائرية" />
                    </div>

                    <Textarea label="نص الرأي" value={data.text} onChange={e => setData('text', e.target.value)}
                        error={errors.text} rows={3} placeholder="شغل ممتاز وجودة عالية..." />
                    <div className="grid grid-cols-2 gap-3">
                        <Textarea label="بالعبري" value={data.text_he} onChange={e => setData('text_he', e.target.value)} rows={3} />
                        <Textarea label="بالإنجليزي" value={data.text_en} onChange={e => setData('text_en', e.target.value)} rows={3} />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <Input label="الترتيب" type="number" value={data.sort_order} onChange={e => setData('sort_order', Number(e.target.value))} />
                        <Select label="يظهر" value={data.is_active ? '1' : '0'} onChange={e => setData('is_active', e.target.value === '1')}>
                            <option value="1">نعم ✅</option>
                            <option value="0">لا ❌</option>
                        </Select>
                    </div>

                    <div className="border border-cream-3 rounded-xl p-3 space-y-2">
                        <p className="text-xs font-bold text-muted">🖼 صورة (اختياري — صورة الزبون أو المنتج)</p>
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
                        <p className="text-xs font-bold text-muted">🎬 فيديو رأي الزبون (اختياري)</p>
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

export default function Testimonials({ testimonials }) {
    const [formOpen, setFormOpen] = useState(false);
    const [editTestimonial, setEditTestimonial] = useState(null);
    const { delete: destroy } = useForm();
    const { confirmAction, dialog } = useConfirm();

    function handleDelete(t) {
        confirmAction(`حذف رأي "${t.customer_name}"؟`, (cb) => destroy(route('admin.testimonials.destroy', t.id), cb));
    }

    return (
        <>
            <Head title="آراء الزبائن — الإدارة" />
            {dialog}
            <AdminLayout title="⭐ آراء الزبائن">
                <div className="flex justify-between items-center mb-5">
                    <p className="text-muted text-sm">{testimonials.length} رأي</p>
                    <Button variant="gold" onClick={() => { setEditTestimonial(null); setFormOpen(true); }}>+ إضافة رأي</Button>
                </div>
                <div className="bg-white rounded-2xl border border-cream-3 overflow-hidden">
                    {testimonials.length === 0 && (
                        <p className="text-center text-muted text-sm py-10">ما في آراء بعد — أضف أول رأي</p>
                    )}
                    {testimonials.map((t, i) => (
                        <div key={t.id} className={`flex items-center gap-3 px-4 py-3.5 hover:bg-cream transition-colors ${i < testimonials.length - 1 ? 'border-b border-cream-3' : ''}`}>
                            <div className="w-11 h-11 bg-gradient-to-br from-ink to-gold rounded-xl overflow-hidden flex items-center justify-center text-sm font-black text-white shrink-0">
                                {t.image ? <img src={`/storage/${t.image}`} alt={t.customer_name} className="w-full h-full object-cover" /> : t.customer_name?.[0]}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-bold text-sm text-ink truncate">{t.customer_name} <span className="text-gold text-xs">{'★'.repeat(t.stars)}</span></p>
                                <p className="text-xs text-muted mt-0.5 truncate">
                                    {t.city && <>{t.city} · </>}ترتيب: {t.sort_order} · {t.is_active ? '✅ نشط' : '❌ مخفي'}
                                    {t.video && <span className="text-green-500 mr-1">· 🎬 فيديو</span>}
                                </p>
                            </div>
                            <div className="flex gap-1.5 shrink-0">
                                <button onClick={() => { setEditTestimonial(t); setFormOpen(true); }}
                                    className="bg-cream-2 border border-cream-3 text-ink text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-gold-pale hover:border-gold hover:text-gold transition-colors">✏️ تعديل</button>
                                <button onClick={() => handleDelete(t)}
                                    className="border border-cream-3 text-gray-400 text-xs font-bold px-2.5 py-1.5 rounded-lg hover:text-red-500 hover:border-red-400 transition-colors">🗑️</button>
                            </div>
                        </div>
                    ))}
                </div>
                <TestimonialForm open={formOpen} onClose={() => { setFormOpen(false); setEditTestimonial(null); }} testimonial={editTestimonial} />
            </AdminLayout>
        </>
    );
}
