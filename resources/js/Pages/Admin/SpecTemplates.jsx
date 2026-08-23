import { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';
import { Button, Modal, Input } from '../../Components/UI';
import { useConfirm } from '../../Components/useConfirm';

const FIELD_TYPES = [
    { value: 'text', label: 'نص' },
    { value: 'number', label: 'رقم' },
    { value: 'select', label: 'قائمة اختيار' },
    { value: 'boolean', label: 'نعم / لا' },
    { value: 'preview', label: 'معاينة (دائري/مستطيل)' },
];

function FieldForm({ open, onClose, templateId, field }) {
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
            put(route('admin.specTemplates.fields.update', [templateId, field.id]), {
                onSuccess: () => { onClose(); reset(); },
            });
        } else {
            post(route('admin.specTemplates.fields.store', templateId), {
                onSuccess: () => { onClose(); reset(); },
            });
        }
    }

    return (
        <Modal open={open} onClose={onClose} title={isEdit ? 'تعديل حقل' : 'إضافة حقل'} maxWidth="max-w-sm">
            <form onSubmit={submit} className="space-y-3">
                <Input label="اسم الحقل" value={data.label} onChange={e => setData('label', e.target.value)}
                    error={errors.label} placeholder="مثلاً: نوع الإضاءة" />
                <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold tracking-widest uppercase text-muted">نوع الحقل</label>
                    <select value={data.field_type} onChange={e => setData('field_type', e.target.value)}
                        className="px-3 py-2 border-2 border-cream-3 focus:border-gold rounded-lg text-sm text-ink bg-cream outline-none">
                        {FIELD_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                </div>
                <p className="text-[11px] text-muted -mt-1">🌐 تُترجم تلقائياً للعبري والإنجليزي</p>
                {data.field_type === 'select' && (
                    <Input label="الخيارات (افصل بفاصلة)" value={data.options}
                        onChange={e => setData('options', e.target.value)}
                        error={errors.options} placeholder="أبيض, أصفر دافئ, RGB متعدد" />
                )}
                {data.field_type === 'preview' && (
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-bold tracking-widest uppercase text-muted">شكل المعاينة</label>
                        <select value={data.preview_shape} onChange={e => setData('preview_shape', e.target.value)}
                            className="px-3 py-2 border-2 border-cream-3 focus:border-gold rounded-lg text-sm text-ink bg-cream outline-none">
                            <option value="rectangle">مستطيل</option>
                            <option value="circle">دائري</option>
                        </select>
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

function TemplateCard({ template }) {
    const [expanded, setExpanded] = useState(false);
    const [fieldFormOpen, setFieldFormOpen] = useState(false);
    const [editField, setEditField] = useState(null);
    const { confirmAction, dialog } = useConfirm();

    function deleteTemplate() {
        confirmAction(`حذف قالب "${template.name}"؟ (ما بيأثر على المنتجات يلي طبقته سابقاً)`,
            (cb) => router.delete(route('admin.specTemplates.destroy', template.id), cb));
    }

    function deleteField(field) {
        confirmAction(`حذف حقل "${field.label}"؟`,
            (cb) => router.delete(route('admin.specTemplates.fields.destroy', [template.id, field.id]), cb));
    }

    return (
        <div className="bg-white rounded-2xl border border-cream-3 overflow-hidden">
            {dialog}
            <div className="flex items-center justify-between px-4 py-3.5 cursor-pointer" onClick={() => setExpanded(e => !e)}>
                <div>
                    <p className="font-bold text-sm text-ink">{template.name}</p>
                    <p className="text-xs text-muted mt-0.5">{template.fields.length} حقل</p>
                </div>
                <div className="flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
                    <button onClick={() => { setEditField(null); setFieldFormOpen(true); }}
                        className="bg-cream-2 border border-cream-3 text-ink text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-gold-pale hover:border-gold hover:text-gold transition-colors">+ حقل</button>
                    <button onClick={deleteTemplate}
                        className="border border-cream-3 text-gray-400 text-xs font-bold px-2.5 py-1.5 rounded-lg hover:text-red-500 hover:border-red-400 transition-colors">🗑️</button>
                    <span className="text-muted text-xs w-4 text-center">{expanded ? '▲' : '▼'}</span>
                </div>
            </div>
            {expanded && (
                <div className="border-t border-cream-3 divide-y divide-cream-3">
                    {template.fields.length === 0 ? (
                        <p className="text-xs text-muted text-center py-6">ما في حقول بعد — ضيف أول حقل</p>
                    ) : template.fields.map(field => (
                        <div key={field.id} className="flex items-center justify-between px-4 py-2.5">
                            <div>
                                <span className="text-sm font-bold text-ink">{field.label}</span>
                                <span className="text-xs text-muted mr-2">
                                    {FIELD_TYPES.find(t => t.value === field.field_type)?.label}
                                    {field.field_type === 'select' && field.options?.length ? ` — ${field.options.join('، ')}` : ''}
                                </span>
                            </div>
                            <div className="flex gap-1.5">
                                <button onClick={() => { setEditField(field); setFieldFormOpen(true); }}
                                    className="text-xs text-muted hover:text-gold font-bold">✏️</button>
                                <button onClick={() => deleteField(field)}
                                    className="text-xs text-gray-400 hover:text-red-500 font-bold">🗑️</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            <FieldForm open={fieldFormOpen} onClose={() => { setFieldFormOpen(false); setEditField(null); }}
                templateId={template.id} field={editField} />
        </div>
    );
}

export default function SpecTemplates({ templates }) {
    const [nameFormOpen, setNameFormOpen] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm({ name: '' });

    function submit(e) {
        e.preventDefault();
        post(route('admin.specTemplates.store'), {
            onSuccess: () => { setNameFormOpen(false); reset(); },
        });
    }

    return (
        <>
            <Head title="قوالب المواصفات — الإدارة" />
            <AdminLayout title="🧩 قوالب المواصفات">
                <p className="text-muted text-sm mb-4 max-w-2xl">
                    قالب جاهز من الحقول (مثلاً "مواصفات قارمة مضيئة") تقدر تطبقه على أي منتج من صفحة تعديل المنتج —
                    تطبيقه بينسخ الحقول لهاد المنتج تحديداً كنسخة مستقلة، فتعديل القالب بعدين ما بيأثر على منتج طبقه قبل.
                </p>
                <div className="flex justify-between items-center mb-5">
                    <p className="text-muted text-sm">{templates.length} قالب</p>
                    <Button variant="gold" onClick={() => setNameFormOpen(true)}>+ قالب جديد</Button>
                </div>
                <div className="space-y-3">
                    {templates.map(t => <TemplateCard key={t.id} template={t} />)}
                    {templates.length === 0 && (
                        <p className="text-center text-muted text-sm py-12">ما في قوالب بعد</p>
                    )}
                </div>

                <Modal open={nameFormOpen} onClose={() => setNameFormOpen(false)} title="قالب جديد" maxWidth="max-w-sm">
                    <form onSubmit={submit} className="space-y-3">
                        <Input label="اسم القالب" value={data.name} onChange={e => setData('name', e.target.value)}
                            error={errors.name} placeholder="مثلاً: قارمة مضيئة" />
                        <div className="flex gap-2 pt-1">
                            <button type="button" onClick={() => setNameFormOpen(false)} className="bg-cream-2 text-ink border border-cream-3 px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-cream-3">إلغاء</button>
                            <button type="submit" disabled={processing} className="flex-1 bg-ink text-white py-2.5 rounded-xl font-black text-sm hover:bg-gold transition-colors disabled:opacity-60">
                                {processing ? '⏳...' : '💾 حفظ'}
                            </button>
                        </div>
                    </form>
                </Modal>
            </AdminLayout>
        </>
    );
}
