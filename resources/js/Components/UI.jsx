// ── Shared UI Components ──

export function Button({ children, variant = 'dark', className = '', ...props }) {
    const variants = {
        dark:    'bg-ink text-white hover:bg-gold',
        gold:    'bg-gold text-white hover:bg-gold-light',
        outline: 'bg-transparent text-ink border-2 border-cream-3 hover:border-gold hover:text-gold',
        ghost:   'bg-cream-2 text-ink hover:bg-cream-3',
        danger:  'bg-transparent text-gray-400 border border-cream-3 hover:text-red-500 hover:border-red-400',
        wa:      'bg-green-500 text-white hover:bg-green-600 flex items-center justify-center gap-2',
    };
    return (
        <button
            className={`px-4 py-2.5 rounded-xl font-cairo font-bold text-sm transition-all duration-200 ${variants[variant]} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
}

export function Badge({ children, className = '' }) {
    return (
        <span className={`inline-block bg-gold text-white text-xs font-bold px-2 py-0.5 rounded-full ${className}`}>
            {children}
        </span>
    );
}

export function Input({ label, error, ...props }) {
    return (
        <div className="flex flex-col gap-1">
            {label && <label className="text-xs font-bold tracking-widest uppercase text-muted">{label}</label>}
            <input
                className={`w-full px-3 py-2 border-2 rounded-lg font-cairo text-sm text-ink bg-cream outline-none transition-colors
                    ${error ? 'border-red-400' : 'border-cream-3 focus:border-gold'}`}
                {...props}
            />
            {error && <p className="text-red-500 text-xs">{error}</p>}
        </div>
    );
}

export function Select({ label, error, children, ...props }) {
    return (
        <div className="flex flex-col gap-1">
            {label && <label className="text-xs font-bold tracking-widest uppercase text-muted">{label}</label>}
            <select
                className={`w-full px-3 py-2 border-2 rounded-lg font-cairo text-sm text-ink bg-cream outline-none transition-colors cursor-pointer
                    ${error ? 'border-red-400' : 'border-cream-3 focus:border-gold'}`}
                {...props}
            >
                {children}
            </select>
            {error && <p className="text-red-500 text-xs">{error}</p>}
        </div>
    );
}

export function Textarea({ label, error, ...props }) {
    return (
        <div className="flex flex-col gap-1">
            {label && <label className="text-xs font-bold tracking-widest uppercase text-muted">{label}</label>}
            <textarea
                className={`w-full px-3 py-2 border-2 rounded-lg font-cairo text-sm text-ink bg-cream outline-none transition-colors resize-y min-h-[72px]
                    ${error ? 'border-red-400' : 'border-cream-3 focus:border-gold'}`}
                {...props}
            />
            {error && <p className="text-red-500 text-xs">{error}</p>}
        </div>
    );
}

export function Modal({ open, onClose, title, children, maxWidth = 'max-w-lg' }) {
    if (!open) return null;
    return (
        <div
            className="fixed inset-0 z-50 bg-ink/60 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div className={`bg-white rounded-2xl w-full ${maxWidth} max-h-[88vh] overflow-y-auto shadow-2xl`}>
                <div className="flex items-center justify-between p-5 pb-0">
                    <h3 className="font-bold text-base text-ink">{title}</h3>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-full bg-cream-2 text-ink flex items-center justify-center hover:bg-cream-3 transition-colors"
                    >✕</button>
                </div>
                <div className="p-5">{children}</div>
            </div>
        </div>
    );
}

export function Toast({ message, show }) {
    return (
        <div className={`fixed bottom-5 right-5 z-50 bg-ink text-white rounded-xl px-4 py-3 flex items-center gap-2 text-sm shadow-xl transition-all duration-300 max-w-xs
            ${show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-14 pointer-events-none'}`}>
            <span>✅</span>
            <span>{message}</span>
        </div>
    );
}

export function RepeatingRows({ rows, onChange, columns, addLabel = '+ إضافة صف' }) {
    function updateRow(i, key, value) {
        onChange(rows.map((r, idx) => idx === i ? { ...r, [key]: value } : r));
    }
    function addRow() {
        const blank = {};
        columns.forEach(c => { blank[c.key] = ''; });
        onChange([...rows, blank]);
    }
    function removeRow(i) {
        onChange(rows.filter((_, idx) => idx !== i));
    }
    return (
        <div className="space-y-2">
            {rows.map((row, i) => (
                <div key={i} className="flex items-center gap-2">
                    {columns.map(c => (
                        <input key={c.key} type={c.type || 'text'} placeholder={c.placeholder}
                            value={row[c.key] ?? ''}
                            onChange={e => updateRow(i, c.key, e.target.value)}
                            className={`${c.width || 'flex-1'} px-2 py-2 border-2 border-cream-3 rounded-lg text-sm text-center outline-none focus:border-gold font-cairo text-ink bg-white`} />
                    ))}
                    <button type="button" onClick={() => removeRow(i)}
                        className="text-red-400 hover:text-red-600 text-sm px-2 shrink-0">✕</button>
                </div>
            ))}
            <button type="button" onClick={addRow}
                className="text-xs font-bold text-gold hover:text-gold-light">{addLabel}</button>
        </div>
    );
}

export function PricingLabel({ type }) {
    const labels = {
        fixed:          'سعر ثابت',
        sqm:            '750₪/م²',
        plate_pair:     'نمر جوز',
        plate_single:   'نمرة مفردة',
        pair_width:     'جوز/عرض',
        single_width:   'قطعة/عرض',
        fixed_per_size: 'سعر لكل حجم',
        plate_qty:      'سعر حسب الكمية',
    };
    return (
        <span className="text-xs bg-gold-pale text-gold font-bold px-2 py-0.5 rounded-full">
            {labels[type] || type}
        </span>
    );
}

// Labels default to Arabic (admin dashboard has no locale switcher and isn't
// wrapped in LocaleProvider) — pass `locale` only from customer-facing pages
// that are inside a LocaleProvider, e.g. Account/Orders.jsx.
const STATUS_LABELS = {
    ar: { pending: 'جديد', confirmed: 'مؤكد', in_progress: 'قيد التنفيذ', ready: 'جاهز', delivered: 'مسلّم', cancelled: 'ملغي' },
    he: { pending: 'חדש', confirmed: 'אושר', in_progress: 'בביצוע', ready: 'מוכן', delivered: 'נמסר', cancelled: 'בוטל' },
    en: { pending: 'New', confirmed: 'Confirmed', in_progress: 'In Progress', ready: 'Ready', delivered: 'Delivered', cancelled: 'Cancelled' },
};
const STATUS_COLORS = {
    pending: 'bg-yellow-100 text-yellow-700',
    confirmed: 'bg-blue-100 text-blue-700',
    in_progress: 'bg-purple-100 text-purple-700',
    ready: 'bg-green-100 text-green-700',
    delivered: 'bg-gray-100 text-gray-600',
    cancelled: 'bg-red-100 text-red-600',
};

export function StatusBadge({ status, locale = 'ar' }) {
    const labels = STATUS_LABELS[locale] ?? STATUS_LABELS.ar;
    const label = labels[status] ?? labels.pending;
    const color = STATUS_COLORS[status] ?? STATUS_COLORS.pending;
    return (
        <span className={`text-xs font-bold px-2 py-1 rounded-full ${color}`}>{label}</span>
    );
}
