import { useState, useRef, useEffect, useCallback } from 'react';
import { useCart } from './CartContext';
import { Button } from './UI';

const FONTS = [
    { label: 'FE-Font — خط الضفة',    value: "'FE-Font','Arial Black',sans-serif" },
    { label: 'Highway Gothic — EU',    value: "'Highway Gothic','Arial',sans-serif" },
    { label: 'DIN 1451 — ألماني',      value: "'DIN 1451','Arial',sans-serif" },
    { label: 'License Plate',          value: "'License Plate','Arial Black',sans-serif" },
    { label: 'Impact',                 value: 'Impact,sans-serif' },
    { label: 'Arial Black',            value: "'Arial Black',sans-serif" },
    { label: 'Arial',                  value: 'Arial,sans-serif' },
    { label: 'Tahoma',                 value: 'Tahoma,sans-serif' },
];

const BG_COLORS = [
    { label: 'أصفر (فلسطيني)', value: '#f5c518' },
    { label: 'أبيض',           value: '#ffffff' },
    { label: 'أسود',           value: '#1a1a1a' },
    { label: 'أزرق',           value: '#1e3a8a' },
    { label: 'أحمر',           value: '#b91c1c' },
    { label: 'أخضر',           value: '#166534' },
];

const SIZES = [
    { label: 'عادية — 52×11 سم', w: 52, h: 11, pair: true },
    { label: 'مربعة — 17×17 سم', w: 17, h: 17, pair: false },
];

// نسبة بكسل لكل سم في المعاينة
const PX_PER_CM = 8;

export default function PlateDesigner({ onClose, product }) {
    const { addItem } = useCart();
    const canvasRef = useRef(null);

    const [state, setState] = useState({
        sizeIdx: 0,
        bgColor: '#f5c518',
        txtColor: '#1a1a1a',
        font: "'FE-Font','Arial Black',sans-serif",
        line1: 'أ - ١٢٣٤٥',
        line2: 'فلسطين',
        txtSize: 48,
        isPair: true,
        customW: 52,
        customH: 11,
        useCustom: false,
    });

    const price = state.isPair ? 150 : 100;

    const currentW = state.useCustom ? state.customW : SIZES[state.sizeIdx]?.w ?? 52;
    const currentH = state.useCustom ? state.customH : SIZES[state.sizeIdx]?.h ?? 11;

    const canvasW = currentW * PX_PER_CM;
    const canvasH = currentH * PX_PER_CM;

    function set(key, val) {
        setState(s => ({ ...s, [key]: val }));
    }

    const drawPlate = useCallback((ctx, cw, ch) => {
        // خلفية
        ctx.fillStyle = state.bgColor;
        ctx.beginPath();
        const r = Math.min(cw, ch) * 0.08;
        ctx.moveTo(r, 0);
        ctx.lineTo(cw - r, 0);
        ctx.quadraticCurveTo(cw, 0, cw, r);
        ctx.lineTo(cw, ch - r);
        ctx.quadraticCurveTo(cw, ch, cw - r, ch);
        ctx.lineTo(r, ch);
        ctx.quadraticCurveTo(0, ch, 0, ch - r);
        ctx.lineTo(0, r);
        ctx.quadraticCurveTo(0, 0, r, 0);
        ctx.closePath();
        ctx.fill();

        // إطار
        ctx.strokeStyle = state.txtColor === '#1a1a1a' ? '#1a1a1a' : '#333';
        ctx.lineWidth = Math.max(2, ch * 0.04);
        ctx.stroke();

        // نص السطر الأول
        const fs1 = (state.txtSize / 100) * ch * 1.2;
        ctx.fillStyle = state.txtColor;
        ctx.font = `900 ${fs1}px ${state.font}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        const hasLine2 = state.line2.trim();
        const y1 = hasLine2 ? ch * 0.38 : ch * 0.5;
        ctx.fillText(state.line1, cw / 2, y1);

        if (hasLine2) {
            const fs2 = fs1 * 0.45;
            ctx.font = `700 ${fs2}px ${state.font}`;
            ctx.globalAlpha = 0.75;
            ctx.fillText(state.line2, cw / 2, ch * 0.72);
            ctx.globalAlpha = 1;
        }
    }, [state]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const sc = 3;
        canvas.width = canvasW * sc;
        canvas.height = canvasH * sc;
        canvas.style.width = Math.min(canvasW, 520) + 'px';
        canvas.style.height = Math.min(canvasH, (canvasH / canvasW) * 520) + 'px';
        const ctx = canvas.getContext('2d');
        ctx.scale(sc, sc);
        drawPlate(ctx, canvasW, canvasH);
    }, [state, canvasW, canvasH, drawPlate]);

    function exportPNG() {
        const sc = 10;
        const ec = document.createElement('canvas');
        ec.width = canvasW * sc;
        ec.height = canvasH * sc;
        const ctx = ec.getContext('2d');
        ctx.scale(sc, sc);
        drawPlate(ctx, canvasW, canvasH);
        const a = document.createElement('a');
        a.download = 'plate-luxsign.png';
        a.href = ec.toDataURL();
        a.click();
    }

    function addToCart() {
        const label = `نمرة ${state.isPair ? 'جوز' : 'مفردة'}: ${state.line1} (${currentW}×${currentH} سم)`;
        addItem(label, '🔢', price, 'لوحات سيارات');
        onClose();
    }

    return (
        <div className="fixed inset-0 z-50 bg-ink/80 flex">
            <div className="w-full flex flex-col bg-cream-2">

                {/* شريط العنوان */}
                <div className="h-12 bg-ink px-4 flex items-center justify-between shrink-0">
                    <span className="font-bold text-gold text-sm">🔢 مصمم النمر</span>
                    <button onClick={onClose} className="bg-ink-2 text-white text-xs font-bold px-3 py-1.5 rounded-lg font-cairo">✕ إغلاق</button>
                </div>

                <div className="flex-1 grid lg:grid-cols-[300px_1fr_260px] overflow-hidden">

                    {/* أدوات التحكم */}
                    <div className="bg-white overflow-y-auto border-l border-cream-3">
                        <div className="p-3 space-y-4">

                            {/* الحجم */}
                            <section>
                                <p className="text-xs font-bold tracking-widest uppercase text-gold mb-2">حجم النمرة</p>
                                <div className="space-y-1.5">
                                    {SIZES.map((s, i) => (
                                        <button key={i}
                                            onClick={() => { set('sizeIdx', i); set('isPair', s.pair); set('useCustom', false); set('customW', s.w); set('customH', s.h); }}
                                            className={`w-full text-right px-3 py-2.5 rounded-xl border-2 text-sm font-bold transition-colors font-cairo
                                                ${!state.useCustom && state.sizeIdx === i ? 'border-gold bg-gold-pale text-gold' : 'border-cream-3 text-ink hover:border-gold'}`}>
                                            {s.label}
                                        </button>
                                    ))}
                                    <button
                                        onClick={() => set('useCustom', true)}
                                        className={`w-full text-right px-3 py-2.5 rounded-xl border-2 text-sm font-bold transition-colors font-cairo
                                            ${state.useCustom ? 'border-gold bg-gold-pale text-gold' : 'border-cream-3 text-ink hover:border-gold'}`}>
                                        مخصص (عرض 15-80 سم)
                                    </button>
                                    {state.useCustom && (
                                        <div className="grid grid-cols-2 gap-2 mt-2">
                                            <div>
                                                <p className="text-xs text-muted mb-1">العرض (سم)</p>
                                                <input type="number" min={15} max={80} value={state.customW}
                                                    onChange={e => set('customW', Number(e.target.value))}
                                                    className="w-full py-1.5 border-2 border-cream-3 focus:border-gold rounded-lg text-sm text-center text-ink bg-cream outline-none" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-muted mb-1">الطول (سم)</p>
                                                <input type="number" min={11} max={30} value={state.customH}
                                                    onChange={e => set('customH', Number(e.target.value))}
                                                    className="w-full py-1.5 border-2 border-cream-3 focus:border-gold rounded-lg text-sm text-center text-ink bg-cream outline-none" />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* اختيار جوز أو مفرد */}
                                <div className="mt-3 grid grid-cols-2 gap-2">
                                    <button onClick={() => set('isPair', true)}
                                        className={`py-2 rounded-xl border-2 text-xs font-bold transition-colors font-cairo
                                            ${state.isPair ? 'border-gold bg-gold-pale text-gold' : 'border-cream-3 text-muted hover:border-gold'}`}>
                                        جوز — 150₪
                                    </button>
                                    <button onClick={() => set('isPair', false)}
                                        className={`py-2 rounded-xl border-2 text-xs font-bold transition-colors font-cairo
                                            ${!state.isPair ? 'border-gold bg-gold-pale text-gold' : 'border-cream-3 text-muted hover:border-gold'}`}>
                                        مفردة — 100₪
                                    </button>
                                </div>
                            </section>

                            {/* لون الخلفية */}
                            <section>
                                <p className="text-xs font-bold tracking-widest uppercase text-gold mb-2">لون الخلفية</p>
                                <div className="grid grid-cols-3 gap-2">
                                    {BG_COLORS.map(c => (
                                        <button key={c.value}
                                            onClick={() => set('bgColor', c.value)}
                                            className={`py-2 px-1 rounded-lg border-2 text-xs font-bold transition-colors font-cairo flex flex-col items-center gap-1
                                                ${state.bgColor === c.value ? 'border-gold' : 'border-cream-3 hover:border-gold'}`}>
                                            <span className="w-6 h-6 rounded block border border-cream-3" style={{ background: c.value }} />
                                            <span className="text-muted">{c.label}</span>
                                        </button>
                                    ))}
                                </div>
                                <div className="flex items-center gap-2 mt-2">
                                    <input type="color" value={state.bgColor} onChange={e => set('bgColor', e.target.value)}
                                        className="w-7 h-7 border-none rounded cursor-pointer p-0" />
                                    <span className="text-xs text-muted">لون مخصص</span>
                                </div>
                            </section>

                            {/* لون النص */}
                            <section>
                                <p className="text-xs font-bold tracking-widest uppercase text-gold mb-2">لون النص</p>
                                <div className="flex gap-2">
                                    {['#1a1a1a', '#ffffff', '#C09A3A', '#1e3a8a', '#b91c1c'].map(c => (
                                        <button key={c} onClick={() => set('txtColor', c)}
                                            style={{ background: c }}
                                            className={`w-8 h-8 rounded-lg border-2 transition-transform ${state.txtColor === c ? 'border-gold scale-110' : 'border-cream-3 hover:border-gold'}`} />
                                    ))}
                                    <input type="color" value={state.txtColor} onChange={e => set('txtColor', e.target.value)}
                                        className="w-8 h-8 border-2 border-cream-3 rounded-lg cursor-pointer p-0" />
                                </div>
                            </section>

                            {/* النص */}
                            <section>
                                <p className="text-xs font-bold tracking-widest uppercase text-gold mb-2">نص النمرة</p>
                                <input value={state.line1} onChange={e => set('line1', e.target.value)}
                                    placeholder="أ - ١٢٣٤٥"
                                    className="w-full px-3 py-2 border-2 border-cream-3 focus:border-gold rounded-lg text-sm text-ink bg-cream outline-none mb-2 text-center font-bold" />
                                <input value={state.line2} onChange={e => set('line2', e.target.value)}
                                    placeholder="فلسطين (اختياري)"
                                    className="w-full px-3 py-2 border-2 border-cream-3 focus:border-gold rounded-lg text-sm text-ink bg-cream outline-none text-center" />
                            </section>

                            {/* الخط */}
                            <section>
                                <p className="text-xs font-bold tracking-widest uppercase text-gold mb-2">الخط</p>
                                <div className="space-y-1">
                                    {FONTS.map(f => (
                                        <button key={f.value} onClick={() => set('font', f.value)}
                                            className={`w-full text-right px-3 py-1.5 rounded-lg border-2 text-sm transition-colors font-cairo
                                                ${state.font === f.value ? 'border-gold bg-gold-pale text-gold' : 'border-cream-3 text-ink hover:border-gold'}`}>
                                            {f.label}
                                        </button>
                                    ))}
                                </div>
                            </section>

                            {/* حجم النص */}
                            <section>
                                <p className="text-xs font-bold tracking-widest uppercase text-gold mb-2">حجم النص</p>
                                <div className="flex items-center gap-2">
                                    <input type="range" min={20} max={100} value={state.txtSize}
                                        onChange={e => set('txtSize', Number(e.target.value))}
                                        className="flex-1 accent-gold" />
                                    <span className="text-sm font-bold text-gold w-8 text-center">{state.txtSize}</span>
                                </div>
                            </section>

                        </div>
                    </div>

                    {/* المعاينة */}
                    <div className="bg-cream-3 flex flex-col items-center justify-center overflow-auto p-6 gap-4">
                        <p className="text-xs text-muted tracking-widest uppercase">معاينة النمرة</p>
                        <canvas ref={canvasRef} className="shadow-2xl rounded-lg" />
                        <p className="text-xs text-muted">{currentW} × {currentH} سم</p>

                        {state.isPair && (
                            <div className="mt-2 opacity-40 scale-95">
                                <p className="text-xs text-muted text-center mb-2 tracking-widest uppercase">النمرة الثانية (جوز)</p>
                                <canvas ref={el => {
                                    if (!el) return;
                                    const sc = 3;
                                    el.width = canvasW * sc;
                                    el.height = canvasH * sc;
                                    el.style.width = Math.min(canvasW, 520) + 'px';
                                    el.style.height = Math.min(canvasH, (canvasH / canvasW) * 520) + 'px';
                                    const ctx = el.getContext('2d');
                                    ctx.scale(sc, sc);
                                    drawPlate(ctx, canvasW, canvasH);
                                }} className="shadow-lg rounded-lg" />
                            </div>
                        )}
                    </div>

                    {/* التصدير */}
                    <div className="bg-white overflow-y-auto border-r border-cream-3">
                        <div className="p-3 space-y-3">
                            <p className="font-bold text-sm text-ink border-b border-cream-3 pb-3">📤 تصدير وطلب</p>

                            {/* ملخص */}
                            <div className="bg-cream rounded-xl p-3 space-y-2 border border-cream-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted">الحجم</span>
                                    <span className="font-bold">{currentW} × {currentH} سم</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted">النوع</span>
                                    <span className="font-bold">{state.isPair ? 'جوز نمرتين' : 'نمرة مفردة'}</span>
                                </div>
                                <div className="flex justify-between text-sm border-t border-cream-3 pt-2">
                                    <span className="text-muted">السعر</span>
                                    <span className="font-black text-gold text-lg">{price}₪</span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Button variant="dark" className="w-full py-2.5" onClick={exportPNG}>
                                    ⬇️ تحميل PNG
                                </Button>
                                <hr className="border-cream-3" />
                                <Button variant="gold" className="w-full py-2.5" onClick={addToCart}>
                                    🛒 أضف للسلة ({price}₪)
                                </Button>
                            </div>

                            <p className="text-xs text-muted bg-gold-pale rounded-lg p-2.5 leading-relaxed border border-cream-3">
                                💡 سعر النمر الجوز <strong>150₪</strong> والمفردة <strong>100₪</strong>.
                                بعد إرسال الطلب سنتواصل معك لتأكيد التفاصيل.
                            </p>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
