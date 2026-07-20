import { useRef, useState, useEffect } from 'react';
import { Head, useForm, Link, router } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';
import { RepeatingRows } from '../../Components/UI';

const PRICING_TYPES = [
    { value: 'fixed',          label: 'سعر ثابت' },
    { value: 'sqm',            label: 'متر مربع (₪/م²)' },
    { value: 'plate_pair',     label: 'نمر جوز ثابت' },
    { value: 'plate_single',   label: 'نمرة مفردة ثابتة' },
    { value: 'pair_width',     label: 'جوز حسب العرض' },
    { value: 'single_width',   label: 'قطعة حسب العرض' },
    { value: 'fixed_per_size', label: 'سعر ثابت لكل حجم' },
    { value: 'plate_qty',      label: 'سعر حسب الكمية' },
];

const PRICING_INFO = {
    fixed:          'سعر ثابت بالشيكل.',
    sqm:            'السعر لكل م² — يُحسب: (العرض × الارتفاع بالمتر) × السعر. الحد الأدنى 150₪.',
    plate_pair:     'سعر ثابت للنمرتين معاً.',
    plate_single:   'سعر ثابت للنمرة الواحدة.',
    pair_width:     'سعر الجوز لكل سم عرض.',
    single_width:   'سعر القطعة الواحدة لكل سم عرض.',
    fixed_per_size: 'أحجام جاهزة فقط — كل حجم له سعره الخاص، والزبون يختار من القائمة بدون إدخال حجم حر.',
    plate_qty:      'الزبون يختار الكمية من قائمة جاهزة (مثلاً: قطعة، قطعتين...) ولكل كمية سعرها الخاص.',
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

export default function ProductEdit({ product, categories }) {
    const isNew = !product;
    const imgRef = useRef(null);
    const vidRef = useRef(null);
    const [imgPreview, setImgPreview]     = useState(null);
    const [vidPreview, setVidPreview]     = useState(null);
    const [vidFileName, setVidFileName]   = useState(null);
    const [uploadProgress, setUploadProgress] = useState(null);
    const [deletingImg, setDeletingImg]   = useState(false);
    const [deletingVid, setDeletingVid]   = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        category_id:    product?.category_id ?? '',
        name:           product?.name ?? '',
        name_he:        product?.name_he ?? '',
        name_en:        product?.name_en ?? '',
        description:    product?.description ?? '',
        description_he: product?.description_he ?? '',
        description_en: product?.description_en ?? '',
        icon:           product?.icon ?? '',
        badge:          product?.badge ?? '',
        pricing_type:   product?.pricing_type ?? 'fixed',
        price:          product?.price ?? '',
        stock_quantity: product?.stock_quantity ?? '',
        preset_sizes:   product?.preset_sizes?.join(',') ?? '',
        size_prices:    product?.size_prices ?? [],
        compare_prices: product?.compare_prices ?? [],
        qty_labels:     product?.qty_labels ?? [],
        shape:          product?.shape ?? 'rectangle',
        designer_type:  product?.designer_type ?? 'none',
        is_active:      product?.is_active ?? true,
        sort_order:     product?.sort_order ?? 0,
        image:          null,
        video:          null,
        video_url:      product?.video_url ?? '',
    });

    const [sizeRows, setSizeRows] = useState(() => (
        product?.pricing_type === 'fixed_per_size' && product?.preset_sizes?.length
            ? product.preset_sizes.map((s, i) => ({
                size: s,
                price: product.size_prices?.[i] ?? '',
                comparePrice: product.compare_prices?.[i] ?? '',
            }))
            : [{ size: '', price: '', comparePrice: '' }]
    ));

    const [qtyRows, setQtyRows] = useState(() => (
        product?.pricing_type === 'plate_qty' && product?.preset_sizes?.length
            ? product.preset_sizes.map((price, i) => ({
                label: product.qty_labels?.[i] ?? '',
                price,
            }))
            : [{ label: '', price: '' }]
    ));

    useEffect(() => {
        if (data.pricing_type !== 'fixed_per_size') return;
        setData('preset_sizes', sizeRows.map(r => r.size));
        setData('size_prices', sizeRows.map(r => r.price));
        setData('compare_prices', sizeRows.map(r => r.comparePrice));
        setData('price', sizeRows[0]?.price || 0);
    }, [sizeRows, data.pricing_type]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        if (data.pricing_type !== 'plate_qty') return;
        setData('preset_sizes', qtyRows.map(r => r.price));
        setData('qty_labels', qtyRows.map(r => r.label));
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

    function deleteImage() {
        if (!confirm('حذف الصورة؟')) return;
        setDeletingImg(true);
        router.delete(route('admin.products.destroyImage', product.id), {
            onFinish: () => setDeletingImg(false),
        });
    }

    function deleteVideo() {
        if (!confirm('حذف الفيديو؟')) return;
        setDeletingVid(true);
        router.delete(route('admin.products.destroyVideo', product.id), {
            onFinish: () => setDeletingVid(false),
        });
    }

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

                            {/* الترجمات */}
                            <div className="bg-white rounded-2xl border border-cream-3 p-4 space-y-3">
                                <p className="font-black text-ink text-sm mb-1">🌐 الترجمات <span className="text-xs text-muted font-normal">(اختياري — إذا تُركت فارغة يُعرض العربي)</span></p>
                                <div className="grid grid-cols-2 gap-3">
                                    <Input label="الاسم بالعبري ✡" value={data.name_he}
                                        onChange={e => setData('name_he', e.target.value)} placeholder="שם המוצר בעברית" />
                                    <Input label="الاسم بالإنجليزي 🌍" value={data.name_en}
                                        onChange={e => setData('name_en', e.target.value)} placeholder="Product name in English" />
                                </div>
                                <Textarea label="الوصف بالعبري ✡" value={data.description_he}
                                    onChange={e => setData('description_he', e.target.value)}
                                    placeholder="תיאור קצר של המוצר..." />
                                <Textarea label="الوصف بالإنجليزي 🌍" value={data.description_en}
                                    onChange={e => setData('description_en', e.target.value)}
                                    placeholder="Short product description in English..." />
                            </div>

                            {/* التسعير */}
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

                                <Input label="الكمية المتوفرة (اختياري)" type="number" min="0"
                                    value={data.stock_quantity} onChange={e => setData('stock_quantity', e.target.value)}
                                    placeholder="اتركها فاضية لكمية غير محدودة" error={errors.stock_quantity} />
                                <p className="text-xs text-muted">
                                    لو حطيت رقم، بينخصم أوتوماتيك مع كل طلب ويتوقف البيع لما توصل صفر. اتركها فاضية إذا الكمية غير محدودة (مناسب أكثر للمنتجات المصنّعة حسب الطلب).
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

                                {data.pricing_type === 'fixed_per_size' && (
                                    <Field label="الأحجام والأسعار الثابتة">
                                        <RepeatingRows
                                            rows={sizeRows}
                                            onChange={setSizeRows}
                                            addLabel="+ إضافة حجم"
                                            columns={[
                                                { key: 'size', placeholder: 'الحجم (سم)', type: 'number', width: 'w-24' },
                                                { key: 'price', placeholder: 'السعر (₪)', type: 'number' },
                                                { key: 'comparePrice', placeholder: 'سعر قبل الخصم (اختياري)', type: 'number' },
                                            ]}
                                        />
                                    </Field>
                                )}

                                {data.pricing_type === 'plate_qty' && (
                                    <Field label="الكميات والأسعار">
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

            </AdminLayout>
        </>
    );
}
