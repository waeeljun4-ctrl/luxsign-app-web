import { useState, useRef, useEffect, useCallback } from 'react';
import { useCart } from './CartContext';
import { Button } from './UI';

const FONTS = [
    { group: 'خطوط النمر الأصلية', fonts: [
        { label: 'FE-Font — خط الضفة',      value: "'FE-Font',Arial,sans-serif" },
        { label: 'Highway Gothic — EU',       value: "'Highway Gothic',Arial,sans-serif" },
        { label: 'DIN 1451 — ألماني رسمي',   value: "'DIN 1451',Arial,sans-serif" },
        { label: 'License Plate',             value: "'License Plate','Arial Black',sans-serif" },
    ]},
    { group: 'خطوط عريضة', fonts: [
        { label: 'Impact',               value: 'Impact,sans-serif' },
        { label: 'Arial Black',          value: "'Arial Black',sans-serif" },
        { label: 'Franklin Gothic Heavy',value: "'Franklin Gothic Heavy',Impact,sans-serif" },
        { label: 'Bebas Neue',           value: "'Bebas Neue',Impact,sans-serif" },
    ]},
    { group: 'Sans Serif', fonts: [
        { label: 'Arial',          value: 'Arial,sans-serif' },
        { label: 'Verdana',        value: 'Verdana,sans-serif' },
        { label: 'Tahoma',         value: 'Tahoma,sans-serif' },
        { label: 'Calibri',        value: 'Calibri,sans-serif' },
        { label: 'Century Gothic', value: "'Century Gothic',sans-serif" },
        { label: 'Helvetica',      value: 'Helvetica,sans-serif' },
    ]},
    { group: 'أحادية المسافة', fonts: [
        { label: 'Courier New', value: "'Courier New',monospace" },
        { label: 'Consolas',    value: 'Consolas,monospace' },
    ]},
    { group: 'Serif', fonts: [
        { label: 'Times New Roman', value: "'Times New Roman',serif" },
        { label: 'Georgia',         value: 'Georgia,serif' },
        { label: 'Playfair Display',value: "'Playfair Display',serif" },
    ]},
    { group: 'خطوط عربية', fonts: [
        { label: 'Cairo — كايرو',   value: "'Cairo',sans-serif" },
        { label: 'Tajawal — تجوّل', value: "'Tajawal',sans-serif" },
        { label: 'Almarai',         value: "'Almarai',sans-serif" },
        { label: 'Amiri — أميري',   value: "'Amiri',serif" },
    ]},
    { group: 'زخرفية', fonts: [
        { label: 'Papyrus',          value: 'Papyrus,fantasy' },
        { label: 'Brush Script MT',  value: "'Brush Script MT',cursive" },
        { label: 'Old English Text', value: "'Old English Text MT',serif" },
        { label: 'Stencil',          value: 'Stencil,Impact' },
    ]},
];

const BG_COLORS  = ['#1a1814','#1a2e3a','#1a3025','#5a1a1a','#2a1a3a','#C09A3A','#2C4A7C','#4A7C2C','#8B4513','#7C2C4A','#2a2a1a','#ffffff'];
const TXT_COLORS = ['#C09A3A','#E4BC5A','#ffffff','#F5E4A8','#ff6b6b','#4ecdc4','#a8e6cf','#1a1814'];
const SHAPES = [
    { value: 'circle',  label: 'دائري',    icon: '⭕' },
    { value: 'rect',    label: 'مستطيل',   icon: '▬' },
    { value: 'oval',    label: 'بيضاوي',   icon: '⬭' },
    { value: 'rounded', label: 'مدوّر',    icon: '▢' },
];

export default function SignDesigner({ onClose }) {
    const { addItem } = useCart();
    const canvasRef = useRef(null);
    const thumbRef  = useRef(null);
    const [activeTab, setActiveTab] = useState('controls');

    const [state, setState] = useState({
        w: 80, h: 80, shape: 'circle',
        bgColor: '#1a1814', txtColor: '#C09A3A',
        font: "'FE-Font',Arial,sans-serif",
        txt1: 'LuxSign', txt2: '',
        txtSize: 36, borderColor: '#C09A3A', borderW: 4,
        logoImg: null, logoSize: 35, logoPos: 'top',
        zoom: 1,
    });

    const price = Math.max(150, Math.round((state.w / 100) * (state.h / 100) * 750));

    const drawSign = useCallback((ctx, cw, ch, scale) => {
        const bw = state.borderW * scale * 0.25;
        ctx.clearRect(0, 0, cw, ch);
        ctx.save();
        ctx.beginPath();
        if (state.shape === 'circle') ctx.arc(cw/2, ch/2, Math.min(cw,ch)/2-bw, 0, Math.PI*2);
        else if (state.shape === 'rect') ctx.rect(bw, bw, cw-bw*2, ch-bw*2);
        else if (state.shape === 'rounded') {
            const r = Math.min(cw,ch)*0.12;
            ctx.moveTo(bw+r,bw); ctx.lineTo(cw-bw-r,bw); ctx.quadraticCurveTo(cw-bw,bw,cw-bw,bw+r);
            ctx.lineTo(cw-bw,ch-bw-r); ctx.quadraticCurveTo(cw-bw,ch-bw,cw-bw-r,ch-bw);
            ctx.lineTo(bw+r,ch-bw); ctx.quadraticCurveTo(bw,ch-bw,bw,ch-bw-r);
            ctx.lineTo(bw,bw+r); ctx.quadraticCurveTo(bw,bw,bw+r,bw);
        } else ctx.ellipse(cw/2, ch/2, (cw/2)-bw, (ch/2)-bw, 0, 0, Math.PI*2);
        ctx.closePath(); ctx.clip();
        ctx.fillStyle = state.bgColor; ctx.fillRect(0,0,cw,ch);
        const g = ctx.createRadialGradient(cw/2,ch/2,0,cw/2,ch/2,Math.min(cw,ch)/2);
        g.addColorStop(0,'rgba(255,255,255,.04)'); g.addColorStop(1,'rgba(0,0,0,.18)');
        ctx.fillStyle = g; ctx.fillRect(0,0,cw,ch);
        ctx.restore();

        if (state.borderColor !== 'none' && state.borderW > 0) {
            ctx.save(); ctx.strokeStyle = state.borderColor; ctx.lineWidth = bw*2;
            ctx.beginPath();
            if (state.shape === 'circle') ctx.arc(cw/2,ch/2,Math.min(cw,ch)/2-bw,0,Math.PI*2);
            else if (state.shape === 'rect') ctx.rect(bw,bw,cw-bw*2,ch-bw*2);
            else if (state.shape === 'rounded') {
                const r = Math.min(cw,ch)*0.12;
                ctx.moveTo(bw+r,bw); ctx.lineTo(cw-bw-r,bw); ctx.quadraticCurveTo(cw-bw,bw,cw-bw,bw+r);
                ctx.lineTo(cw-bw,ch-bw-r); ctx.quadraticCurveTo(cw-bw,ch-bw,cw-bw-r,ch-bw);
                ctx.lineTo(bw+r,ch-bw); ctx.quadraticCurveTo(bw,ch-bw,bw,ch-bw-r);
                ctx.lineTo(bw,bw+r); ctx.quadraticCurveTo(bw,bw,bw+r,bw);
            } else ctx.ellipse(cw/2,ch/2,(cw/2)-bw,(ch/2)-bw,0,0,Math.PI*2);
            ctx.stroke(); ctx.restore();
        }

        ctx.save();
        ctx.beginPath();
        if (state.shape === 'circle') ctx.arc(cw/2,ch/2,Math.min(cw,ch)/2-bw*2,0,Math.PI*2);
        else ctx.rect(bw*2,bw*2,cw-bw*4,ch-bw*4);
        ctx.clip();

        const fs1 = state.txtSize * scale * 0.22;
        const fs2 = fs1 * 0.55;
        const hasLogo = !!state.logoImg;
        const hasTxt2 = !!state.txt2.trim();
        const logoH = hasLogo ? Math.min(cw,ch)*state.logoSize/100 : 0;
        const gap = scale * 1.5;
        let totalH = (hasLogo ? logoH+gap : 0) + fs1 + (hasTxt2 ? gap*0.5+fs2 : 0);
        let startY = (ch - totalH) / 2;

        if (hasLogo) {
            const lw = cw*state.logoSize/100, lh = (state.logoImg.height/state.logoImg.width)*lw, lx = (cw-lw)/2;
            let ly = startY;
            if (state.logoPos === 'center') ly = (ch-lh)/2;
            else if (state.logoPos === 'bottom') ly = startY + fs1 + (hasTxt2?fs2+gap*0.5:0) + gap;
            ctx.drawImage(state.logoImg, lx, ly, lw, lh);
            if (state.logoPos === 'top') startY += lh + gap;
        }

        const txt1Y = startY + fs1/2;
        ctx.fillStyle = state.txtColor;
        ctx.font = `900 ${fs1}px ${state.font}`;
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.shadowColor = 'rgba(0,0,0,.4)'; ctx.shadowBlur = scale*1.5;
        ctx.fillText(state.txt1, cw/2, txt1Y);

        if (hasTxt2) {
            ctx.globalAlpha = 0.7;
            ctx.font = `600 ${fs2}px ${state.font}`;
            ctx.shadowBlur = 0;
            ctx.fillText(state.txt2, cw/2, txt1Y + fs1/2 + gap*0.5 + fs2/2);
        }
        ctx.restore();
    }, [state]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const sc = 4 * state.zoom;
        canvas.width = state.w * sc; canvas.height = state.h * sc;
        drawSign(canvas.getContext('2d'), canvas.width, canvas.height, sc);

        const thumb = thumbRef.current;
        if (thumb) {
            const ts = Math.min(220/state.w, 220/state.h) * 4 * 0.6;
            thumb.width = state.w * ts; thumb.height = state.h * ts;
            drawSign(thumb.getContext('2d'), thumb.width, thumb.height, ts * 0.6);
        }
    }, [state, drawSign]);

    function set(key, value) { setState(s => ({ ...s, [key]: value })); }

    function exportPNG() {
        const hsc = 8, ec = document.createElement('canvas');
        ec.width = state.w * hsc; ec.height = state.h * hsc;
        drawSign(ec.getContext('2d'), ec.width, ec.height, hsc * 0.6);
        const a = document.createElement('a'); a.download = 'luxsign.png'; a.href = ec.toDataURL(); a.click();
    }

    function exportSVG() {
        const W = state.w*10, H = state.h*10, bw = state.borderW*2.5;
        const clip = `<clipPath id="clip"><circle cx="${W/2}" cy="${H/2}" r="${Math.min(W,H)/2-bw}"/></clipPath>`;
        const shp = `<circle cx="${W/2}" cy="${H/2}" r="${Math.min(W,H)/2-bw}" fill="${state.bgColor}" stroke="${state.borderColor !== 'none' ? state.borderColor : 'none'}" stroke-width="${bw}"/>`;
        const fs1 = state.txtSize * 2.2;
        const t1 = `<text x="${W/2}" y="${H/2}" font-family="${state.font}" font-size="${fs1}" font-weight="900" fill="${state.txtColor}" text-anchor="middle" dominant-baseline="middle">${state.txt1}</text>`;
        const svg = `<?xml version="1.0"?>\n<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">\n<defs>${clip}</defs>${shp}<g clip-path="url(#clip)">${t1}</g>\n</svg>`;
        const a = document.createElement('a'); a.download = 'luxsign.svg';
        a.href = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' })); a.click();
    }

    function addDesignToCart() {
        addItem(`تصميم: ${state.txt1} (${state.w}×${state.h} سم)`, '✏️', price, 'تصميم مخصص');
        onClose();
    }

    // Proportional size preview box
    const maxPx = 90, ratio = state.w / state.h;
    const sbW = ratio >= 1 ? maxPx : maxPx * ratio;
    const sbH = ratio >= 1 ? maxPx / ratio : maxPx;

    const tabs = ['controls', 'canvas', 'export'];
    const tabLabels = { controls: '🎨 الأدوات', canvas: '👁️ المعاينة', export: '📤 تصدير' };

    return (
        <div className="fixed inset-0 z-50 bg-ink/80 flex">
        <div className="w-full flex flex-col bg-cream-2">

            {/* Nav */}
            <div className="h-12 bg-ink px-4 flex items-center justify-between shrink-0">
                <span className="font-bold text-gold text-sm">✏️ مصمم القارمات</span>
                <button onClick={onClose} className="bg-ink-2 text-white text-xs font-bold px-3 py-1.5 rounded-lg font-cairo">✕ إغلاق</button>
            </div>

            {/* Mobile tabs */}
            <div className="flex bg-white border-b border-cream-3 lg:hidden shrink-0">
                {tabs.map(t => (
                    <button key={t} onClick={() => setActiveTab(t)}
                        className={`flex-1 py-2.5 text-xs font-bold font-cairo border-b-2 transition-colors
                            ${activeTab === t ? 'text-gold border-gold' : 'text-muted border-transparent'}`}>
                        {tabLabels[t]}
                    </button>
                ))}
            </div>

            {/* Layout */}
            <div className="flex-1 grid lg:grid-cols-[280px_1fr_250px] overflow-hidden">

                {/* Controls */}
                <div className={`bg-white overflow-y-auto lg:border-r border-cream-3 ${activeTab !== 'controls' ? 'hidden lg:block' : ''}`}>
                    <div className="p-3 border-b border-cream-3 sticky top-0 bg-white z-10">
                        <h3 className="font-bold text-sm text-ink">🎨 الأدوات</h3>
                    </div>
                    <div className="p-3 space-y-4">

                        {/* Size */}
                        <section>
                            <p className="text-xs font-bold tracking-widest uppercase text-gold mb-2 flex items-center gap-1"><span className="w-2 h-0.5 bg-gold inline-block"/>حجم اللوحة</p>
                            <div className="grid grid-cols-2 gap-2">
                                <div><p className="text-xs text-muted text-center mb-1">العرض سم</p>
                                    <input type="number" value={state.w} min="20" max="300" onChange={e=>set('w',Number(e.target.value))}
                                        className="w-full py-1.5 border-2 border-cream-3 focus:border-gold rounded-lg text-sm text-center text-ink bg-cream outline-none"/></div>
                                <div><p className="text-xs text-muted text-center mb-1">الارتفاع سم</p>
                                    <input type="number" value={state.h} min="20" max="300" onChange={e=>set('h',Number(e.target.value))}
                                        className="w-full py-1.5 border-2 border-cream-3 focus:border-gold rounded-lg text-sm text-center text-ink bg-cream outline-none"/></div>
                            </div>
                            {/* Size preview */}
                            <div className="mt-2 bg-cream rounded-lg p-2 flex flex-col items-center gap-1 border border-cream-3">
                                <p className="text-xs text-muted">معاينة الحجم النسبي</p>
                                <div className="h-16 flex items-center justify-center">
                                    <div style={{ width: sbW, height: sbH }}
                                        className="bg-gradient-to-br from-ink to-ink-2 border-2 border-gold rounded transition-all duration-300" />
                                </div>
                                <p className="text-xs font-bold text-gold">{state.w} × {state.h} سم</p>
                            </div>
                            {/* Preset sizes for circles */}
                            {state.shape === 'circle' && (
                                <div className="mt-2">
                                    <p className="text-xs text-muted mb-1">أحجام ثابتة</p>
                                    <div className="grid grid-cols-4 gap-1">
                                        {[60,70,80,100].map(s => (
                                            <button key={s} onClick={() => { set('w',s); set('h',s); }}
                                                className="py-1.5 border-2 border-cream-3 rounded-lg text-xs font-bold text-muted hover:border-gold hover:text-gold hover:bg-gold-pale transition-colors">
                                                {s}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {/* Live price */}
                            <div className="mt-2 bg-gradient-to-r from-ink to-ink-2 rounded-lg p-3 flex justify-between items-center">
                                <div>
                                    <p className="text-xs text-white/40">السعر (750₪/م²)</p>
                                    <p className="text-lg font-black text-gold">{price}₪</p>
                                </div>
                                <div className="text-left">
                                    <p className="text-xs text-white/30">{((state.w/100)*(state.h/100)).toFixed(4)} م² × 750</p>
                                </div>
                            </div>
                        </section>

                        {/* Shape */}
                        <section>
                            <p className="text-xs font-bold tracking-widest uppercase text-gold mb-2 flex items-center gap-1"><span className="w-2 h-0.5 bg-gold inline-block"/>شكل اللوحة</p>
                            <div className="grid grid-cols-4 gap-1.5">
                                {SHAPES.map(s => (
                                    <button key={s.value} onClick={() => set('shape', s.value)}
                                        className={`py-1.5 border-2 rounded-lg text-xs font-bold transition-colors font-cairo
                                            ${state.shape === s.value ? 'border-gold text-gold bg-gold-pale' : 'border-cream-3 text-muted hover:border-gold hover:text-gold'}`}>
                                        <span className="block text-base mb-0.5">{s.icon}</span>{s.label}
                                    </button>
                                ))}
                            </div>
                        </section>

                        {/* BG Color */}
                        <section>
                            <p className="text-xs font-bold tracking-widest uppercase text-gold mb-2 flex items-center gap-1"><span className="w-2 h-0.5 bg-gold inline-block"/>لون الخلفية</p>
                            <div className="grid grid-cols-6 gap-1.5">
                                {BG_COLORS.map(c => (
                                    <button key={c} onClick={() => set('bgColor', c)}
                                        style={{ background: c }}
                                        className={`aspect-square rounded-md border-2 transition-transform ${state.bgColor === c ? 'border-gold scale-110' : 'border-transparent hover:border-gold hover:scale-110'}`} />
                                ))}
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                                <input type="color" value={state.bgColor} onChange={e=>set('bgColor',e.target.value)}
                                    className="w-7 h-7 border-none rounded cursor-pointer p-0" />
                                <span className="text-xs text-muted">لون مخصص</span>
                            </div>
                        </section>

                        {/* Text */}
                        <section>
                            <p className="text-xs font-bold tracking-widest uppercase text-gold mb-2 flex items-center gap-1"><span className="w-2 h-0.5 bg-gold inline-block"/>النص</p>
                            <input value={state.txt1} onChange={e=>set('txt1',e.target.value)} placeholder="اسم محلك"
                                className="w-full px-3 py-2 border-2 border-cream-3 focus:border-gold rounded-lg text-sm text-ink bg-cream outline-none mb-2" />
                            <input value={state.txt2} onChange={e=>set('txt2',e.target.value)} placeholder="سطر ثاني (اختياري)"
                                className="w-full px-3 py-2 border-2 border-cream-3 focus:border-gold rounded-lg text-sm text-ink bg-cream outline-none" />
                        </section>

                        {/* Font */}
                        <section>
                            <p className="text-xs font-bold tracking-widest uppercase text-gold mb-2 flex items-center gap-1"><span className="w-2 h-0.5 bg-gold inline-block"/>الخط</p>
                            <div className="flex flex-col gap-1 max-h-56 overflow-y-auto">
                                {FONTS.map(({ group, fonts }) => (
                                    <div key={group}>
                                        <p className="text-xs text-muted font-bold tracking-widest uppercase py-1 border-b border-cream-3 mt-1">{group}</p>
                                        {fonts.map(f => (
                                            <button key={f.value} onClick={() => set('font', f.value)}
                                                className={`w-full text-right px-3 py-1.5 rounded-md text-sm border-2 mb-0.5 transition-colors font-cairo
                                                    ${state.font === f.value ? 'border-gold text-gold bg-gold-pale' : 'border-cream-3 text-ink bg-cream hover:border-gold'}`}>
                                                {f.label}
                                            </button>
                                        ))}
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Text Size */}
                        <section>
                            <p className="text-xs font-bold tracking-widest uppercase text-gold mb-2 flex items-center gap-1"><span className="w-2 h-0.5 bg-gold inline-block"/>حجم النص</p>
                            <div className="flex items-center gap-2">
                                <input type="range" min="10" max="120" value={state.txtSize} onChange={e=>set('txtSize',Number(e.target.value))}
                                    className="flex-1 accent-gold" />
                                <span className="text-sm font-bold text-gold w-8 text-center">{state.txtSize}</span>
                            </div>
                        </section>

                        {/* Text Color */}
                        <section>
                            <p className="text-xs font-bold tracking-widest uppercase text-gold mb-2 flex items-center gap-1"><span className="w-2 h-0.5 bg-gold inline-block"/>لون النص</p>
                            <div className="grid grid-cols-8 gap-1">
                                {TXT_COLORS.map(c => (
                                    <button key={c} onClick={() => set('txtColor', c)}
                                        style={{ background: c }}
                                        className={`aspect-square rounded-md border-2 transition-transform ${state.txtColor === c ? 'border-gold scale-110' : 'border-transparent hover:border-gold hover:scale-110'}`} />
                                ))}
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                                <input type="color" value={state.txtColor} onChange={e=>set('txtColor',e.target.value)}
                                    className="w-7 h-7 border-none rounded cursor-pointer p-0" />
                                <span className="text-xs text-muted">لون مخصص</span>
                            </div>
                        </section>

                        {/* Border */}
                        <section>
                            <p className="text-xs font-bold tracking-widest uppercase text-gold mb-2 flex items-center gap-1"><span className="w-2 h-0.5 bg-gold inline-block"/>الإطار</p>
                            <div className="flex items-center gap-2">
                                <input type="range" min="0" max="20" value={state.borderW} onChange={e=>set('borderW',Number(e.target.value))}
                                    className="flex-1 accent-gold" />
                                <span className="text-sm font-bold text-gold w-8 text-center">{state.borderW}</span>
                            </div>
                        </section>

                    </div>
                </div>

                {/* Canvas */}
                <div className={`bg-cream-3 flex flex-col overflow-hidden ${activeTab !== 'canvas' ? 'hidden lg:flex' : ''}`}>
                    <div className="flex items-center gap-2 p-2 flex-wrap shrink-0">
                        <div className="flex items-center gap-1 bg-white border border-cream-3 rounded-lg px-2 py-1">
                            <button onClick={()=>set('zoom',Math.max(0.3,state.zoom-0.1))} className="text-sm px-1 hover:text-gold">−</button>
                            <span className="text-xs font-bold text-muted w-10 text-center">{Math.round(state.zoom*100)}%</span>
                            <button onClick={()=>set('zoom',Math.min(3,state.zoom+0.1))} className="text-sm px-1 hover:text-gold">+</button>
                        </div>
                        <button onClick={()=>set('zoom',1)} className="text-xs bg-white border border-cream-3 rounded-lg px-2 py-1 hover:border-gold hover:text-gold transition-colors">🔄 إعادة ضبط</button>
                    </div>
                    <div className="flex-1 overflow-auto flex items-start justify-center p-4">
                        <canvas ref={canvasRef} style={{ maxWidth: '100%' }}
                            className="block shadow-2xl" />
                    </div>
                    <p className="text-center text-xs text-muted pb-2 shrink-0">المعاينة تمثل التصميم الفعلي</p>
                </div>

                {/* Export */}
                <div className={`bg-white overflow-y-auto lg:border-l border-cream-3 ${activeTab !== 'export' ? 'hidden lg:block' : ''}`}>
                    <div className="p-3 border-b border-cream-3 sticky top-0 bg-white z-10">
                        <h3 className="font-bold text-sm text-ink">📤 تصدير وطلب</h3>
                    </div>
                    <div className="p-3 space-y-3">
                        <div>
                            <p className="text-xs text-muted mb-2 tracking-widest uppercase">معاينة مصغرة</p>
                            <canvas ref={thumbRef} className="w-full rounded-lg border border-cream-3" />
                        </div>
                        <div className="bg-cream rounded-lg p-3 space-y-1.5 border border-cream-3">
                            <div className="flex justify-between text-sm"><span className="text-muted">الحجم</span><span className="font-bold">{state.w} × {state.h} سم</span></div>
                            <div className="flex justify-between text-sm"><span className="text-muted">الشكل</span><span className="font-bold">{SHAPES.find(s=>s.value===state.shape)?.label}</span></div>
                            <div className="flex justify-between text-sm border-t border-cream-3 pt-1.5 mt-1.5"><span className="text-muted">السعر</span><span className="font-black text-gold text-base">{price}₪</span></div>
                            <div className="flex justify-between text-xs"><span className="text-muted">الحساب</span><span className="text-muted">{((state.w/100)*(state.h/100)).toFixed(4)} م² × 750</span></div>
                        </div>
                        <div className="space-y-2">
                            <Button variant="dark" className="w-full py-2.5" onClick={exportPNG}>⬇️ تحميل PNG</Button>
                            <Button variant="outline" className="w-full py-2.5" onClick={exportSVG}>⬇️ تحميل SVG فيكتور</Button>
                            <hr className="border-cream-3" />
                            <Button variant="gold" className="w-full py-2.5" onClick={addDesignToCart}>🛒 أضف للسلة</Button>
                        </div>
                        <p className="text-xs text-muted bg-gold-pale rounded-lg p-2.5 leading-relaxed border border-cream-3">
                            💡 <strong>SVG</strong> — افتحه في Illustrator وعدّل أي عنصر.<br />
                            💡 <strong>PNG</strong> — جاهز للطباعة بدقة عالية.
                        </p>
                    </div>
                </div>
            </div>
        </div>
        </div>
    );
}
