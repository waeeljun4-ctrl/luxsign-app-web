import { useRef, useState, useEffect } from 'react';
import { Head, useForm, Link, router } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';
import { RepeatingRows } from '../../Components/UI';
import { useConfirm } from '../../Components/useConfirm';

const PRICING_TYPES = [
    { value: 'fixed',          label: 'سعر ثابت' },
    { value: 'sqm',            label: 'متر مربع (₪/م²)' },
    { value: 'plate_pair',     label: 'نمر جوز ثابت' },
    { value: 'plate_single',   label: 'نمرة مفردة ثابتة' },
    { value: 'pair_width',     label: 'جوز حسب العرض' },
    { value: 'single_width',   label: 'قطعة حسب العرض' },
    { value: 'fixed_per_size', label: 'سعر ثابت لكل حجم' },
    { value: 'plate_qty',      label: 'سعر حسب الكمية (جدول أسعار)' },
    { value: 'fixed_qty',      label: 'سعر ثابت × كمية حرة' },
];

const PRICING_INFO = {
    fixed:          'سعر ثابت بالشيكل.',
    sqm:            'السعر لكل م² — يُحسب: (العرض × الارتفاع بالمتر) × السعر. الحد الأدنى 150₪.',
    plate_pair:     'سعر ثابت للنمرتين معاً.',
    plate_single:   'سعر ثابت للنمرة الواحدة.',
    pair_width:     'سعر الجوز لكل سم — يُحسب على البعد الأكبر بين الطول والعرض يلي بيدخله الزبون، مش العرض بس.',
    single_width:   'سعر القطعة الواحدة لكل سم — يُحسب على البعد الأكبر بين الطول والعرض يلي بيدخله الزبون، مش العرض بس.',
    fixed_per_size: 'أحجام جاهزة فقط — كل حجم له سعره الخاص، والزبون يختار من القائمة بدون إدخال حجم حر.',
    plate_qty:      'الزبون يختار الكمية من قائمة جاهزة (مثلاً: قطعة، قطعتين...) ولكل كمية سعرها الخاص.',
    fixed_qty:      'سعر ثابت للقطعة الواحدة (تحدده إنت) بغض النظر عن الحجم — الزبون يختار حجم من قائمة (إذا حطيت أحجام) ويحدد الكمية بزر +/-، والإجمالي = السعر × الكمية.',
};

const SHAPE_TYPES = [
    { value: 'rectangle', label: 'مستطيل / مربع' },
    { value: 'circle',    label: 'دائرة ⌀' },
];

const HAS_SIZE_INPUT_TYPES  = ['sqm', 'pair_width', 'single_width'];
const HAS_SHAPE_TYPES       = ['sqm', 'pair_width', 'single_width', 'fixed_per_size'];

const DESIGNER_TYPES = [
    { value: 'none',  label: 'بدون مصمم' },
    { value: 'sign',  label: 'مصمم القارمات' },
    { value: 'plate', label: 'مصمم النمر' },
];

function getYoutubeEmbed(url) {
    if (!url) return null;
    const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([A-Za-z0-9_-]{11})/);
    return m ? `https://www.youtube.com/embed/${m[1]}` : null;
}

function Field({ label, error, children }) {
    return (
        <div>
            <label className="block text-xs font-bold text-ink mb-1.5">{label}</label>
            {children}
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
        </div>
    );
}

function Input({ label, error, ...props }) {
    return (
        <Field label={label} error={error}>
            <input {...props}
                className="w-full border border-cream-3 rounded-xl px-3 py-2.5 text-sm font-cairo text-ink bg-white focus:outline-none focus:border-gold transition-colors" />
        </Field>
    );
}

function Select({ label, error, children, ...props }) {
    return (
        <Field label={label} error={error}>
            <select {...props}
                className="w-full border border-cream-3 rounded-xl px-3 py-2.5 text-sm font-cairo text-ink bg-white focus:outline-none focus:border-gold transition-colors">
                {children}
            </select>
        </Field>
    );
}

function Textarea({ label, error, ...props }) {
    return (
        <Field label={label} error={error}>
            <textarea {...props} rows={3}
                className="w-full border border-cream-3 rounded-xl px-3 py-2.5 text-sm font-cairo text-ink bg-white focus:outline-none focus:border-gold transition-colors resize-none" />
        </Field>
    );
}

export default function ProductEdit({ product, categories, specFields, specTemplates }) {
    const isNew = !product;
    const imgRef = useRef(null);
    const vidRef = useRef(null);
    const galleryRef = useRef(null);
    const [imgPreview, setImgPreview]     = useState(null);
    const [vidPreview, setVidPreview]     = useState(null);
    const [vidFileName, setVidFileName]   = useState(null);
    const [uploadProgress, setUploadProgress] = useState(null);
    const [deletingImg, setDeletingImg]   = useState(false);
    const [deletingVid, setDeletingVid]   = useState(false);
    const [deletingGalleryIdx, setDeletingGalleryIdx] = useState(null);
    const [newGalleryFiles, setNewGalleryFiles] = useState([]);
    const [newGalleryPreviews, setNewGalleryPreviews] = useState([]);
    const MAX_GALLERY = 10;

    const { data, setData, post, processing, errors, transform } = useForm({
        category_id:    product?.category_id ?? '',
        name:           product?.name ?? '',
        name_he:        product?.name_he ?? '',
        name_en:        product?.name_en ?? '',
        description:    product?.description ?? '',
        description_he: product?.description_he ?? '',
        description_en: product?.description_en ?? '',
        icon:           product?.icon ?? '',
        badge:          product?.badge ?? '',
        badge_he:       product?.badge_he ?? '',
        badge_en:       product?.badge_en ?? '',
        is_custom:      product?.is_custom ?? false,
        show_ref_images: product?.show_ref_images ?? false,
        pricing_type:   product?.pricing_type ?? 'fixed',
        price:          product?.price ?? '',
        min_price:      product?.min_price ?? '',
        show_min_price: product?.show_min_price ?? false,
        preset_sizes:   product?.preset_sizes?.join(',') ?? '',
        size_prices:    product?.size_prices ?? [],
        compare_prices: product?.compare_prices ?? [],
        qty_labels:     product?.qty_labels ?? [],
        qty_labels_he:  product?.qty_labels_he ?? [],
        qty_labels_en:  product?.qty_labels_en ?? [],
        fixed_size_label: product?.fixed_size_label ?? '',
        shape:          product?.shape ?? 'rectangle',
        designer_type:  product?.designer_type ?? 'none',
        is_active:      product?.is_active ?? true,
        sort_order:     product?.sort_order ?? 0,
        image:          null,
        new_images:     [],
        video:          null,
        video_url:      product?.video_url ?? '',
    });

    const { confirmAction, dialog } = useConfirm();

    const [sizeRows, setSizeRows] = useState(() => (
        product?.pricing_type === 'fixed_per_size' && product?.preset_sizes?.length
            ? product.preset_sizes.map((s, i) => {
                const [length, width] = String(s).split(/[×x]/i);
                return {
                    length: length ?? '',
                    width: width ?? '',
                    price: product.size_prices?.[i] ?? '',
                    comparePrice: product.compare_prices?.[i] ?? '',
                };
            })
            : [{ length: '', width: '', price: '', comparePrice: '' }]
    ));

    const [qtyRows, setQtyRows] = useState(() => (
        product?.pricing_type === 'plate_qty' && product?.preset_sizes?.length
            ? product.preset_sizes.map((price, i) => ({
                label: product.qty_labels?.[i] ?? '',
                labelHe: product.qty_labels_he?.[i] ?? '',
                labelEn: product.qty_labels_en?.[i] ?? '',
                price,
            }))
            : [{ label: '', labelHe: '', labelEn: '', price: '' }]
    ));

    useEffect(() => {
        if (data.pricing_type !== 'fixed_per_size') return;
        setData('preset_sizes', sizeRows.map(r => (data.shape === 'circle' || !r.width) ? r.length : `${r.length}×${r.width}`));
        setData('size_prices', sizeRows.map(r => r.price));
        setData('compare_prices', sizeRows.map(r => r.comparePrice));
        setData('price', sizeRows[0]?.price || 0);
    }, [sizeRows, data.pricing_type, data.shape]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        if (data.pricing_type !== 'plate_qty') return;
        setData('preset_sizes', qtyRows.map(r => r.price));
        setData('qty_labels', qtyRows.map(r => r.label));
        setData('qty_labels_he', qtyRows.map(r => r.labelHe));
        setData('qty_labels_en', qtyRows.map(r => r.labelEn));
        setData('price', qtyRows[0]?.price || 0);
    }, [qtyRows, data.pricing_type]); // eslint-disable-line react-hooks/exhaustive-deps

    function handleImageChange(e) {
        const file = e.target.files[0];
        if (!file) return;
        setData('image', file);
        setImgPreview(URL.createObjectURL(file));
    }

    function handleVideoChange(e) {
        const file = e.target.files[0];
        if (!file) return;
        setData('video', file);
        setVidPreview(URL.createObjectURL(file));
        setVidFileName(file.name);
    }

    function handleGalleryChange(e) {
        const files = Array.from(e.target.files || []);
        e.target.value = '';
        if (!files.length) return;
        const room = MAX_GALLERY - (product?.images?.length ?? 0) - newGalleryFiles.length;
        const accepted = files.slice(0, Math.max(0, room));
        const updated = [...newGalleryFiles, ...accepted];
        setNewGalleryFiles(updated);
        setNewGalleryPreviews(prev => [...prev, ...accepted.map(f => URL.createObjectURL(f))]);
        setData('new_images', updated);
    }

    function removeNewGalleryFile(i) {
        const updated = newGalleryFiles.filter((_, idx) => idx !== i);
        setNewGalleryFiles(updated);
        setNewGalleryPreviews(prev => prev.filter((_, idx) => idx !== i));
        setData('new_images', updated);
    }

    function deleteGalleryImage(index) {
        confirmAction('حذف هاي الصورة من المعرض؟', (cb) => {
            setDeletingGalleryIdx(index);
            router.delete(route('admin.products.destroyGalleryImage', [product.id, index]), {
                ...cb,
                onFinish: () => { setDeletingGalleryIdx(null); cb.onFinish(); },
            });
        });
    }

    function deleteImage() {
        confirmAction('حذف الصورة؟', (cb) => {
            setDeletingImg(true);
            router.delete(route('admin.products.destroyImage', product.id), {
                ...cb,
                onFinish: () => { setDeletingImg(false); cb.onFinish(); },
            });
        });
    }

    function deleteVideo() {
        confirmAction('حذف الفيديو؟', (cb) => {
            setDeletingVid(true);
            router.delete(route('admin.products.destroyVideo', product.id), {
                ...cb,
                onFinish: () => { setDeletingVid(false); cb.onFinish(); },
            });
        });
    }

    // Custom-order products carry no real pricing — force harmless
    // placeholder values so the (still-required) price/pricing_type fields
    // validate, without showing or using them anywhere for this product.
    transform(d => d.is_custom ? { ...d, pricing_type: 'fixed', price: 0 } : d);

    function submit(e) {
        e.preventDefault();
        setUploadProgress(0);
        const url = isNew ? route('admin.products.store') : route('admin.products.update', product.id);
        post(url, {
            forceFormData: true,
            onProgress: (p) => setUploadProgress(p.percentage ?? null),
            onSuccess: () => {
                setUploadProgress(null);
                setVidPreview(null);
                setVidFileName(null);
                setImgPreview(null);
                setNewGalleryFiles([]);
                setNewGalleryPreviews([]);
                setData('new_images', []);
                if (isNew) router.visit(route('admin.products.index'));
            },
            onError: () => setUploadProgress(null),
        });
    }

    const currentImg = imgPreview || (product?.image ? `/storage/${product.image}` : null);
    const embedUrl   = getYoutubeEmbed(data.video_url);
    const existingVideo = product?.video ? `/storage/${product.video}` : null;

    return (
        <>
            <Head title={isNew ? 'إضافة منتج جديد' : `تعديل: ${product.name}`} />
            {dialog}
            <AdminLayout title={isNew ? '➕ إضافة منتج' : `✏️ ${product.name}`}>

                <form onSubmit={submit}>
                    {/* Top bar */}
                    <div className="flex items-center justify-between mb-6">
                        <Link href={route('admin.products.index')}
                            className="text-sm text-muted hover:text-ink transition-colors font-bold flex items-center gap-1.5">
                            ← العودة للمنتجات
                        </Link>
                        <button type="submit" disabled={processing}
                            className="bg-gold text-white font-black text-sm px-6 py-2.5 rounded-xl hover:bg-gold-light transition-colors disabled:opacity-60 flex items-center gap-2">
                            {processing ? '⏳ جاري الحفظ...' : (isNew ? '💾 حفظ المنتج' : '💾 حفظ التعديلات')}
                        </button>
                    </div>

                    {/* Upload progress bar */}
                    {uploadProgress !== null && (
                        <div className="mb-4">
                            <div className="flex items-center justify-between text-xs font-bold text-ink mb-1">
                                <span>⬆️ جاري الرفع...</span>
                                <span>{uploadProgress}%</span>
                            </div>
                            <div className="w-full bg-cream-3 rounded-full h-2.5">
                                <div
                                    className="bg-gold h-2.5 rounded-full transition-all duration-300"
                                    style={{ width: `${uploadProgress}%` }}
                                />
                            </div>
                        </div>
                    )}

                    {/* Main grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

                        {/* ── العمود الأيمن: الوسائط ── */}
                        <div className="lg:col-span-2 space-y-4">

                            {/* صورة المنتج */}
                            <div className="bg-white rounded-2xl border border-cream-3 p-4">
                                <p className="font-black text-ink text-sm mb-3">🖼 صورة المنتج</p>

                                <div
                                    onClick={() => imgRef.current.click()}
                                    className="border-2 border-dashed border-cream-3 rounded-xl overflow-hidden cursor-pointer hover:border-gold transition-colors"
                                >
                                    {currentImg ? (
                                        <div className="relative group">
                                            <img src={currentImg} alt={product?.name || 'منتج جديد'}
                                                className="w-full h-52 object-cover" />
                                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                                                <span className="text-white text-2xl">📷</span>
                                                <span className="text-white font-bold text-sm">تغيير الصورة</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="h-44 flex flex-col items-center justify-center text-muted gap-2">
                                            <span className="text-4xl">📷</span>
                                            <span className="font-bold text-sm">اضغط لرفع صورة</span>
                                            <span className="text-xs">JPG · PNG · WEBP — حتى 10MB</span>
                                        </div>
                                    )}
                                </div>
                                <input ref={imgRef} type="file" accept="image/*"
                                    className="hidden" onChange={handleImageChange} />

                                <div className="flex items-center gap-2 mt-2">
                                    {imgPreview && (
                                        <p className="text-xs text-green-600 font-bold flex-1">✅ صورة جديدة جاهزة للرفع</p>
                                    )}
                                    {!isNew && product.image && !imgPreview && (
                                        <button type="button" onClick={deleteImage} disabled={deletingImg}
                                            className="text-xs text-red-500 font-bold hover:text-red-700 transition-colors disabled:opacity-50 flex items-center gap-1 ml-auto">
                                            {deletingImg ? '⏳' : '🗑️'} حذف الصورة
                                        </button>
                                    )}
                                </div>
                                {errors.image && (
                                    <p className="text-xs text-red-500 mt-1">{errors.image}</p>
                                )}
                            </div>

                            {/* معرض الصور (اختياري) */}
                            <div className="bg-white rounded-2xl border border-cream-3 p-4">
                                <p className="font-black text-ink text-sm mb-1">🖼️ معرض الصور (اختياري)</p>
                                <p className="text-xs text-muted mb-3">صور إضافية تظهر بمعرض تفاصيل المنتج، فوق صورة الغلاف — حتى {MAX_GALLERY} صور.</p>

                                <div className="flex flex-wrap gap-2 mb-2">
                                    {(product?.images ?? []).map((path, i) => (
                                        <div key={path} className="relative w-20 h-20">
                                            <img src={`/storage/${path}`} className="w-20 h-20 object-cover rounded-xl border border-cream-3" />
                                            <button type="button" onClick={() => deleteGalleryImage(i)} disabled={deletingGalleryIdx === i}
                                                className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center leading-none disabled:opacity-50">
                                                {deletingGalleryIdx === i ? '⏳' : '✕'}
                                            </button>
                                        </div>
                                    ))}
                                    {newGalleryPreviews.map((src, i) => (
                                        <div key={src} className="relative w-20 h-20">
                                            <img src={src} className="w-20 h-20 object-cover rounded-xl border-2 border-green-400" />
                                            <button type="button" onClick={() => removeNewGalleryFile(i)}
                                                className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center leading-none">✕</button>
                                        </div>
                                    ))}
                                    {((product?.images?.length ?? 0) + newGalleryFiles.length) < MAX_GALLERY && (
                                        <label onClick={() => galleryRef.current.click()}
                                            className="w-20 h-20 flex flex-col items-center justify-center gap-0.5 border-2 border-dashed border-cream-3 rounded-xl cursor-pointer text-muted hover:border-gold hover:text-gold transition-colors">
                                            <span className="text-xl leading-none">📷</span>
                                            <span className="text-[10px] font-bold">إضافة</span>
                                        </label>
                                    )}
                                </div>
                                <input ref={galleryRef} type="file" accept="image/*" multiple className="hidden" onChange={handleGalleryChange} />
                                {newGalleryFiles.length > 0 && (
                                    <p className="text-xs text-green-600 font-bold">✅ {newGalleryFiles.length} صورة جاهزة للرفع — رح تنحفظ لما تضغط "حفظ"</p>
                                )}
                                {errors.new_images && <p className="text-xs text-red-500 mt-1">{errors.new_images}</p>}
                            </div>

                            {/* فيديو المنتج */}
                            <div className="bg-white rounded-2xl border border-cream-3 p-4 space-y-3">
                                <p className="font-black text-ink text-sm mb-1">▶ فيديو المنتج</p>

                                {/* عرض الفيديو الحالي المرفوع */}
                                {(vidPreview || existingVideo) && (
                                    <div className="rounded-xl overflow-hidden bg-black aspect-video">
                                        <video
                                            key={vidPreview || existingVideo}
                                            src={vidPreview || existingVideo}
                                            controls
                                            className="w-full h-full object-contain"
                                            preload="metadata"
                                        />
                                    </div>
                                )}

                                {/* رفع فيديو مباشر */}
                                <div
                                    onClick={() => vidRef.current.click()}
                                    className="border-2 border-dashed border-cream-3 rounded-xl p-4 cursor-pointer hover:border-gold transition-colors text-center"
                                >
                                    {vidFileName ? (
                                        <div className="flex items-center justify-center gap-2">
                                            <span className="text-xl">🎬</span>
                                            <span className="text-sm font-bold text-green-600 truncate max-w-[200px]">{vidFileName}</span>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center gap-1 text-muted">
                                            <span className="text-3xl">🎬</span>
                                            <span className="font-bold text-sm">ارفع فيديو من جهازك</span>
                                            <span className="text-xs">MP4 · MOV · WEBM — حتى 200MB</span>
                                        </div>
                                    )}
                                </div>
                                <input ref={vidRef} type="file" accept="video/*"
                                    className="hidden" onChange={handleVideoChange} />

                                {errors.video && (
                                    <p className="text-xs text-red-500">{errors.video}</p>
                                )}

                                {/* حذف الفيديو الحالي */}
                                {!isNew && product.video && !vidPreview && (
                                    <button type="button" onClick={deleteVideo} disabled={deletingVid}
                                        className="text-xs text-red-500 font-bold hover:text-red-700 transition-colors disabled:opacity-50 flex items-center gap-1">
                                        {deletingVid ? '⏳' : '🗑️'} حذف الفيديو الحالي
                                    </button>
                                )}

                                {/* أو رابط YouTube */}
                                <div className="border-t border-cream-3 pt-3">
                                    <Field label="أو رابط YouTube" error={errors.video_url}>
                                        <input
                                            value={data.video_url}
                                            onChange={e => setData('video_url', e.target.value)}
                                            placeholder="https://youtube.com/watch?v=..."
                                            className="w-full border border-cream-3 rounded-xl px-3 py-2.5 text-sm font-cairo text-ink bg-white focus:outline-none focus:border-gold transition-colors"
                                        />
                                    </Field>

                                    {embedUrl ? (
                                        <div className="mt-3 rounded-xl overflow-hidden aspect-video">
                                            <iframe src={embedUrl} className="w-full h-full" allowFullScreen title="video preview" />
                                        </div>
                                    ) : data.video_url ? (
                                        <p className="text-xs text-amber-500 mt-2">⚠️ الرابط ليس YouTube صالح</p>
                                    ) : null}
                                </div>
                            </div>

                        </div>

                        {/* ── العمود الأيسر: المعلومات والتسعير ── */}
                        <div className="lg:col-span-3 space-y-4">

                            {/* المعلومات الأساسية */}
                            <div className="bg-white rounded-2xl border border-cream-3 p-4 space-y-3">
                                <p className="font-black text-ink text-sm mb-1">📋 المعلومات الأساسية</p>

                                <div className="grid grid-cols-2 gap-3">
                                    <Input label="اسم المنتج" value={data.name}
                                        onChange={e => setData('name', e.target.value)}
                                        error={errors.name} placeholder="قارمة دائرية LED" />
                                    <Select label="الصنف" value={data.category_id}
                                        onChange={e => setData('category_id', e.target.value)}
                                        error={errors.category_id}>
                                        <option value="">اختر الصنف</option>
                                        {categories.map(c => (
                                            <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                                        ))}
                                    </Select>
                                </div>
                                <p className="text-[11px] text-muted -mt-1.5">🌐 تُترجم تلقائياً للعبري والإنجليزي</p>

                                <Textarea label="الوصف" value={data.description}
                                    onChange={e => setData('description', e.target.value)}
                                    placeholder="وصف قصير للمنتج..." />

                                <div className="grid grid-cols-2 gap-3">
                                    <Input label="الأيقونة (إيموجي)" value={data.icon}
                                        onChange={e => setData('icon', e.target.value)} placeholder="🔆" />
                                    <Input label="الشارة" value={data.badge}
                                        onChange={e => setData('badge', e.target.value)} placeholder="الأكثر طلباً" />
                                </div>
                            </div>

                            {/* نوع المنتج */}
                            <div className="bg-white rounded-2xl border border-cream-3 p-4 space-y-2">
                                <p className="font-black text-ink text-sm mb-1">🏷️ نوع المنتج</p>
                                <div className="flex gap-3">
                                    <label className={`flex-1 text-center cursor-pointer px-3 py-2.5 rounded-xl border-2 font-bold text-sm transition-colors ${!data.is_custom ? 'border-gold bg-gold-pale text-gold' : 'border-cream-3 text-muted'}`}>
                                        <input type="radio" className="hidden" checked={!data.is_custom} onChange={() => setData('is_custom', false)} />
                                        جاهز — بسعر محدد
                                    </label>
                                    <label className={`flex-1 text-center cursor-pointer px-3 py-2.5 rounded-xl border-2 font-bold text-sm transition-colors ${data.is_custom ? 'border-gold bg-gold-pale text-gold' : 'border-cream-3 text-muted'}`}>
                                        <input type="radio" className="hidden" checked={data.is_custom} onChange={() => setData('is_custom', true)} />
                                        تفصيل — بدون سعر
                                    </label>
                                </div>
                                {data.is_custom && (
                                    <p className="text-xs text-muted">
                                        هاد التصنيف للإدارة بس — الزبون ما بيشوفه إطلاقاً. المنتج بيظهر بدون سعر، والزبون يعبي المواصفات بدل هيك (قسم "🧩 مواصفات مخصصة" تحت، بعد ما تحفظ المنتج أول مرة)، وإنت بتسعّره يدوياً بعد ما توصلك الطلبية.
                                    </p>
                                )}
                                <label className="flex items-center gap-2 cursor-pointer pt-1">
                                    <input type="checkbox" checked={data.show_ref_images}
                                        onChange={e => setData('show_ref_images', e.target.checked)}
                                        className="accent-gold" />
                                    <span className="text-sm font-bold text-ink">📷 السماح للزبون برفع صورة توضيحية</span>
                                </label>
                            </div>

                            {/* التسعير */}
                            {!data.is_custom && (
                            <div className="bg-white rounded-2xl border border-cream-3 p-4 space-y-3">
                                <p className="font-black text-ink text-sm mb-1">💰 التسعير</p>

                                <div className="grid grid-cols-2 gap-3">
                                    <Select label="طريقة التسعير" value={data.pricing_type}
                                        onChange={e => setData('pricing_type', e.target.value)}>
                                        {PRICING_TYPES.map(t => (
                                            <option key={t.value} value={t.value}>{t.label}</option>
                                        ))}
                                    </Select>
                                    {['fixed_per_size', 'plate_qty'].includes(data.pricing_type) ? (
                                        <Field label="السعر (₪)">
                                            <div className="w-full border border-cream-3 rounded-xl px-3 py-2.5 text-sm font-cairo text-muted bg-cream-2">
                                                يُحسب تلقائياً من الجدول أدناه
                                            </div>
                                        </Field>
                                    ) : (
                                        <Input label="السعر (₪)" type="number" min="0" step="0.01"
                                            value={data.price}
                                            onChange={e => setData('price', e.target.value)}
                                            error={errors.price} placeholder="750" />
                                    )}
                                </div>

                                <div className="bg-gold-pale border border-cream-3 rounded-xl p-3 text-sm text-ink leading-relaxed">
                                    💡 {PRICING_INFO[data.pricing_type]}
                                </div>

                                <div className="border border-cream-3 rounded-xl p-3 space-y-2">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="checkbox" checked={data.show_min_price}
                                            onChange={e => setData('show_min_price', e.target.checked)}
                                            className="accent-gold" />
                                        <span className="text-sm font-bold text-ink">تفعيل "يبدأ من" (حد أدنى للسعر المعروض)</span>
                                    </label>
                                    <p className="text-xs text-muted">
                                        إذا فعّلتها، الزبون ما رح يشوف ولا يدفع أي سعر أقل من هاد الرقم — حتى لو السعر الفعلي المحسوب أوطى.
                                    </p>
                                    {data.show_min_price && (
                                        <Input label="أقل سعر معروض (₪)" type="number" min="0" step="0.01"
                                            value={data.min_price}
                                            onChange={e => setData('min_price', e.target.value)}
                                            error={errors.min_price} placeholder="1000" />
                                    )}
                                </div>

                                <p className="text-xs text-muted">
                                    📦 الكمية المتوفرة تُدار من صفحة <a href="/admin/inventory" className="text-gold hover:underline font-bold">المخزن</a>.
                                </p>

                                {HAS_SHAPE_TYPES.includes(data.pricing_type) && (
                                    <Select label="شكل المعاينة" value={data.shape}
                                        onChange={e => setData('shape', e.target.value)}>
                                        {SHAPE_TYPES.map(s => (
                                            <option key={s.value} value={s.value}>{s.label}</option>
                                        ))}
                                    </Select>
                                )}

                                {(data.pricing_type === 'sqm' || data.pricing_type === 'fixed') && (
                                    <Input label="أحجام جاهزة (افصل بفاصلة)"
                                        value={data.preset_sizes}
                                        onChange={e => setData('preset_sizes', e.target.value)}
                                        placeholder="60,70,80,100" />
                                )}

                                {data.pricing_type === 'fixed_qty' && (
                                    <Input label="الأحجام المتاحة (افصل بفاصلة — اختياري، كلها بنفس السعر)"
                                        value={data.fixed_size_label}
                                        onChange={e => setData('fixed_size_label', e.target.value)}
                                        placeholder="50×11 سم, 60×13 سم, 70×15 سم" />
                                )}

                                {data.pricing_type === 'fixed_per_size' && (
                                    <Field label="الأحجام والأسعار الثابتة">
                                        <p className="text-xs text-muted -mt-1 mb-1">
                                            {data.shape === 'circle'
                                                ? 'حدد القطر لكل حجم، وهيك رح يظهر للزبون.'
                                                : 'حدد الطول والعرض لكل حجم، وهيك رح يظهروا للزبون (مثلاً 300×250) مش رقم واحد بس.'}
                                        </p>
                                        <RepeatingRows
                                            rows={sizeRows}
                                            onChange={setSizeRows}
                                            addLabel="+ إضافة حجم"
                                            columns={data.shape === 'circle' ? [
                                                { key: 'length', placeholder: 'القطر (سم)', type: 'number', width: 'w-24' },
                                                { key: 'price', placeholder: 'السعر (₪)', type: 'number' },
                                                { key: 'comparePrice', placeholder: 'سعر قبل الخصم (اختياري)', type: 'number' },
                                            ] : [
                                                { key: 'length', placeholder: 'الطول (سم)', type: 'number', width: 'w-20' },
                                                { key: 'width', placeholder: 'العرض (سم)', type: 'number', width: 'w-20' },
                                                { key: 'price', placeholder: 'السعر (₪)', type: 'number' },
                                                { key: 'comparePrice', placeholder: 'سعر قبل الخصم (اختياري)', type: 'number' },
                                            ]}
                                        />
                                    </Field>
                                )}

                                {data.pricing_type === 'plate_qty' && (
                                    <Field label="الكميات والأسعار">
                                        <p className="text-xs text-muted -mt-1 mb-1">🌐 التسمية تُترجم تلقائياً للعبري والإنجليزي.</p>
                                        <RepeatingRows
                                            rows={qtyRows}
                                            onChange={setQtyRows}
                                            addLabel="+ إضافة كمية"
                                            columns={[
                                                { key: 'label', placeholder: 'التسمية (مثال: قطعة واحدة)' },
                                                { key: 'price', placeholder: 'السعر (₪)', type: 'number', width: 'w-28' },
                                            ]}
                                        />
                                    </Field>
                                )}
                            </div>
                            )}

                            {/* الإعدادات */}
                            <div className="bg-white rounded-2xl border border-cream-3 p-4 space-y-3">
                                <p className="font-black text-ink text-sm mb-1">⚙️ الإعدادات</p>

                                <div className="grid grid-cols-3 gap-3">
                                    <Select label="نوع المصمم" value={data.designer_type}
                                        onChange={e => setData('designer_type', e.target.value)}>
                                        {DESIGNER_TYPES.map(t => (
                                            <option key={t.value} value={t.value}>{t.label}</option>
                                        ))}
                                    </Select>
                                    <Select label="يظهر في المتجر"
                                        value={data.is_active ? '1' : '0'}
                                        onChange={e => setData('is_active', e.target.value === '1')}>
                                        <option value="1">نعم ✅</option>
                                        <option value="0">لا ❌</option>
                                    </Select>
                                    <Input label="الترتيب" type="number" min="0"
                                        value={data.sort_order}
                                        onChange={e => setData('sort_order', Number(e.target.value))} />
                                </div>
                            </div>

                        </div>
                    </div>

                    {/* Save bottom */}
                    <div className="mt-5 flex justify-end">
                        <button type="submit" disabled={processing}
                            className="bg-ink text-white font-black text-sm px-8 py-3 rounded-xl hover:bg-gold transition-colors disabled:opacity-60 flex items-center gap-2">
                            {processing ? '⏳ جاري الحفظ...' : (isNew ? '💾 حفظ المنتج' : '💾 حفظ التعديلات')}
                        </button>
                    </div>
                </form>

                {!isNew && <SpecFieldsSection product={product} specFields={specFields} specTemplates={specTemplates} />}

            </AdminLayout>
        </>
    );
}

const SPEC_FIELD_TYPES = [
    { value: 'text', label: 'نص' },
    { value: 'number', label: 'رقم' },
    { value: 'select', label: 'قائمة اختيار' },
    { value: 'boolean', label: 'نعم / لا' },
    { value: 'preview', label: 'معاينة (دائري/مستطيل)' },
];

/**
 * Custom spec fields the customer fills in when ordering this product
 * (e.g. width, lighting type) — purely informational for the workshop,
 * never affects price. Usually seeded by applying a reusable template,
 * then edited independently per product from here.
 */
function SpecFieldsSection({ product, specFields, specTemplates }) {
    const [templateId, setTemplateId] = useState('');
    const [addingField, setAddingField] = useState(false);
    const [editingField, setEditingField] = useState(null);

    function applyTemplate() {
        if (!templateId) return;
        router.post(route('admin.products.specFields.applyTemplate', product.id), { spec_template_id: templateId }, {
            onSuccess: () => setTemplateId(''),
        });
    }

    const { confirmAction, dialog } = useConfirm();

    function deleteField(field) {
        confirmAction(`حذف حقل "${field.label}"؟`,
            (cb) => router.delete(route('admin.products.specFields.destroy', [product.id, field.id]), cb));
    }

    return (
        <div className="max-w-3xl mt-6">
            {dialog}
            <div className="bg-white rounded-2xl border border-cream-3 p-5">
                <p className="font-black text-ink mb-1">🧩 مواصفات مخصصة</p>
                <p className="text-xs text-muted mb-4">
                    حقول يعبيها الزبون وقت الطلب (معلوماتية للمشغل، ما بتأثر على السعر).
                </p>

                {specTemplates?.length > 0 && (
                    <div className="flex items-end gap-2 mb-4 pb-4 border-b border-cream-3">
                        <div className="flex-1">
                            <label className="text-xs font-bold tracking-widest uppercase text-muted block mb-1">تطبيق قالب جاهز</label>
                            <select value={templateId} onChange={e => setTemplateId(e.target.value)}
                                className="w-full px-3 py-2 border-2 border-cream-3 focus:border-gold rounded-lg text-sm text-ink bg-cream outline-none">
                                <option value="">— اختر قالب —</option>
                                {specTemplates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                            </select>
                        </div>
                        <button type="button" onClick={applyTemplate} disabled={!templateId}
                            className="bg-cream-2 border border-cream-3 text-ink text-sm font-bold px-4 py-2 rounded-lg hover:bg-gold-pale hover:border-gold hover:text-gold transition-colors disabled:opacity-40">
                            تطبيق
                        </button>
                    </div>
                )}

                <div className="space-y-2 mb-3">
                    {specFields?.map(field => (
                        <div key={field.id} className="flex items-center justify-between bg-cream rounded-xl px-3.5 py-2.5">
                            <div>
                                <span className="text-sm font-bold text-ink">{field.label}</span>
                                <span className="text-xs text-muted mr-2">
                                    {SPEC_FIELD_TYPES.find(t => t.value === field.field_type)?.label}
                                    {field.field_type === 'select' && field.options?.length ? ` — ${field.options.join('، ')}` : ''}
                                </span>
                            </div>
                            <div className="flex gap-1.5">
                                <button onClick={() => setEditingField(field)} className="text-xs text-muted hover:text-gold font-bold">✏️</button>
                                <button onClick={() => deleteField(field)} className="text-xs text-gray-400 hover:text-red-500 font-bold">🗑️</button>
                            </div>
                        </div>
                    ))}
                    {(!specFields || specFields.length === 0) && (
                        <p className="text-xs text-muted text-center py-6">ما في مواصفات لهاد المنتج بعد</p>
                    )}
                </div>

                {addingField || editingField ? (
                    <SpecFieldForm product={product} field={editingField}
                        onDone={() => { setAddingField(false); setEditingField(null); }} />
                ) : (
                    <button type="button" onClick={() => setAddingField(true)}
                        className="text-sm font-bold text-gold hover:text-ink transition-colors">+ إضافة حقل يدوياً</button>
                )}
            </div>
        </div>
    );
}

function SpecFieldForm({ product, field, onDone }) {
    const isEdit = !!field;
    const { data, setData, post, put, processing, errors, reset, transform } = useForm({
        label: field?.label || '',
        label_he: field?.label_he || '',
        label_en: field?.label_en || '',
        field_type: field?.field_type || 'text',
        preview_shape: field?.preview_shape || 'rectangle',
        options: (field?.options || []).join(', '),
        options_he: (field?.options_he || []).join(', '),
        options_en: (field?.options_en || []).join(', '),
        is_required: field?.is_required || false,
    });

    transform(d => ({
        ...d,
        options: d.field_type === 'select'
            ? d.options.split(',').map(s => s.trim()).filter(Boolean)
            : null,
        options_he: d.field_type === 'select' && d.options_he
            ? d.options_he.split(',').map(s => s.trim()).filter(Boolean)
            : null,
        options_en: d.field_type === 'select' && d.options_en
            ? d.options_en.split(',').map(s => s.trim()).filter(Boolean)
            : null,
        preview_shape: d.field_type === 'preview' ? d.preview_shape : null,
    }));

    function submit(e) {
        e.preventDefault();
        if (isEdit) {
            put(route('admin.products.specFields.update', [product.id, field.id]), { onSuccess: () => { onDone(); reset(); } });
        } else {
            post(route('admin.products.specFields.store', product.id), { onSuccess: () => { onDone(); reset(); } });
        }
    }

    return (
        <form onSubmit={submit} className="bg-cream rounded-xl p-3.5 space-y-3">
            <div className="grid grid-cols-2 gap-3">
                <Input label="اسم الحقل" value={data.label} onChange={e => setData('label', e.target.value)}
                    error={errors.label} placeholder="مثلاً: نوع الإضاءة" />
                <Select label="نوع الحقل" value={data.field_type} onChange={e => setData('field_type', e.target.value)}>
                    {SPEC_FIELD_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </Select>
            </div>
            <p className="text-[11px] text-muted -mt-2">🌐 تُترجم تلقائياً للعبري والإنجليزي</p>
            {data.field_type === 'select' && (
                <Input label="الخيارات (افصل بفاصلة)" value={data.options} onChange={e => setData('options', e.target.value)}
                    error={errors.options} placeholder="أبيض, أصفر دافئ, RGB متعدد" />
            )}
            {data.field_type === 'preview' && (
                <Select label="شكل المعاينة" value={data.preview_shape} onChange={e => setData('preview_shape', e.target.value)}>
                    <option value="rectangle">مستطيل</option>
                    <option value="circle">دائري</option>
                </Select>
            )}
            <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={data.is_required} onChange={e => setData('is_required', e.target.checked)} className="accent-gold" />
                <span className="text-xs font-bold text-muted">إلزامي</span>
            </label>
            <div className="flex gap-2">
                <button type="button" onClick={onDone} className="bg-white text-ink border border-cream-3 px-4 py-2 rounded-lg font-bold text-xs hover:bg-cream-2">إلغاء</button>
                <button type="submit" disabled={processing} className="flex-1 bg-ink text-white py-2 rounded-lg font-black text-xs hover:bg-gold transition-colors disabled:opacity-60">
                    {processing ? '⏳...' : '💾 حفظ الحقل'}
                </button>
            </div>
        </form>
    );
}
