(() => {
'use strict';
const $ = (s, r) => (r || document).querySelector(s);
const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
const lerp = (a, b, t) => a + (b - a) * t;
const ease = t => t * t * (3 - 2 * t);
const RM = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);

/* ================= catalog ================= */
const PRICING = { perM2: 750, min: 150 };       // ₪ per m², minimum order
const WHATSAPP = '970568804603';
const SIGN_Y = 3.42, MAX_H = 1.3, PLACEHOLDER = 'اسم محلك';

const TYPES = [
  { id: 'front', label: 'حروف مضيئة', sub: 'الوجه بيضوّي', body: 'الإطار' },
  { id: 'halo', label: 'إضاءة خلفية', sub: 'هالة ورا الحرف', body: 'الحرف' },
  { id: 'neon', label: 'نيون', sub: 'على أكريليك شفاف', body: '' },
  { id: 'box', label: 'لوحة مضيئة', sub: 'صندوق ضوئي', body: 'الخلفية' }
];
const FONTS = [
  { id: 'cairo', label: 'عصري', css: '"Cairo"', w: 900, wn: 600 },
  { id: 'kufi', label: 'كوفي', css: '"Reem Kufi"', w: 700, wn: 500 },
  { id: 'naskh', label: 'نسخ', css: '"Amiri"', w: 700, wn: 700 },
  { id: 'ruqaa', label: 'رقعة', css: '"Aref Ruqaa"', w: 700, wn: 700 },
  { id: 'bold', label: 'عريض', css: '"Lalezar"', w: 400, wn: 400 },
  { id: 'soft', label: 'ناعم', css: '"Tajawal"', w: 700, wn: 500 }
];
const LEDS = [
  { id: 'warm', label: 'أبيض دافئ', hex: '#ffd9a0' },
  { id: 'white', label: 'أبيض', hex: '#f3f7ff' },
  { id: 'gold', label: 'ذهبي', hex: '#ffb52e' },
  { id: 'orange', label: 'برتقالي', hex: '#ff7a1a' },
  { id: 'red', label: 'أحمر', hex: '#ff2d2d' },
  { id: 'pink', label: 'وردي', hex: '#ff3f9f' },
  { id: 'purple', label: 'بنفسجي', hex: '#a35bff' },
  { id: 'blue', label: 'أزرق', hex: '#2f6dff' },
  { id: 'cyan', label: 'سماوي', hex: '#22ddff' },
  { id: 'green', label: 'أخضر', hex: '#2be36c' }
];
const BODIES = [
  { id: 'black', label: 'أسود', sw: '#1b1c20', hex: '#141518', metal: 0, rough: 0.42 },
  { id: 'gold', label: 'ذهبي', sw: '#d9ad4e', hex: '#f2c76a', metal: 1, rough: 0.22 },
  { id: 'silver', label: 'فضي', sw: '#c9ccd1', hex: '#e3e5e8', metal: 1, rough: 0.25 },
  { id: 'copper', label: 'نحاسي', sw: '#c47a45', hex: '#e39b6b', metal: 1, rough: 0.28 },
  { id: 'white', label: 'أبيض', sw: '#f2f0ea', hex: '#f2f0ea', metal: 0, rough: 0.6 }
];
const IDEAS = [
  { text: 'مخبز البلد', type: 'front', font: 'cairo', led: 'warm', body: 'gold', wall: 'stone', widthCm: 200 },
  { text: 'صالون ريم', type: 'halo', font: 'naskh', led: 'warm', body: 'gold', wall: 'plaster', widthCm: 170 },
  { text: 'قهوة وكتاب', type: 'neon', font: 'ruqaa', led: 'pink', body: 'black', wall: 'dark', widthCm: 150 },
  { text: 'BURGER 141', type: 'box', font: 'bold', led: 'orange', body: 'black', wall: 'concrete', widthCm: 220 }
];

/* ================= procedural surfaces ================= */
const cv = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
const rnd = seed => () => { seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
function grit(x, r, bx, by, bw, bh, n, light, dark, a) {
  for (let i = 0; i < n; i++) {
    const s = 0.7 + r() * 1.6;
    x.fillStyle = 'rgba(' + (r() < 0.5 ? light : dark) + ',' + (a * (0.35 + r())).toFixed(3) + ')';
    x.fillRect(bx + r() * bw, by + r() * bh, s, s * (0.6 + r()));
  }
}
function texStone() {          // coursed limestone ashlar, the facade stone of Hebron and Jerusalem
  const S = 1024, c = cv(S, S), x = c.getContext('2d'), r = rnd(11);
  x.fillStyle = '#bcae8f'; x.fillRect(0, 0, S, S);
  const rows = 12, rh = S / rows, pal = ['#e2d5b8', '#dccdae', '#e6dac0', '#d6c7a7', '#e0d0b3', '#e4d8bd', '#d9caab', '#dfd2b6'];
  for (let j = 0; j < rows; j++) {
    const ws = []; let sum = 0;
    while (sum < S) { const w = 120 + r() * 150; ws.push(w); sum += w; }
    let px = -r() * 200;
    for (const w0 of ws) {
      const w = w0 * S / sum, col = pal[(r() * pal.length) | 0];
      for (const ox of [px, px + S]) {
        if (ox > S || ox + w < 0) continue;
        const bx = ox + 1.5, by = j * rh + 1.5, bw = w - 3, bh = rh - 3;
        x.fillStyle = col; x.fillRect(bx, by, bw, bh);
        grit(x, r, bx, by, bw, bh, (bw * bh / 30) | 0, '255,250,235', '110,90,55', 0.07);
        x.fillStyle = 'rgba(255,252,240,.2)'; x.fillRect(bx, by, bw, 2); x.fillRect(bx, by, 2, bh);
        x.fillStyle = 'rgba(60,45,20,.16)'; x.fillRect(bx, by + bh - 2, bw, 2); x.fillRect(bx + bw - 2, by, 2, bh);
      }
      px += w;
    }
  }
  return c;
}
function texPlaster() {
  const S = 512, c = cv(S, S), x = c.getContext('2d'), r = rnd(3);
  x.fillStyle = '#ebe6da'; x.fillRect(0, 0, S, S);
  for (let i = 0; i < 40; i++) { const px = r() * S, py = r() * S, rr = 60 + r() * 140, g = x.createRadialGradient(px, py, 0, px, py, rr); g.addColorStop(0, r() < 0.5 ? 'rgba(255,255,255,.07)' : 'rgba(120,110,90,.05)'); g.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = g; x.fillRect(px - rr, py - rr, rr * 2, rr * 2); }
  grit(x, r, 0, 0, S, S, 9000, '255,255,255', '110,100,85', 0.09);
  return c;
}
function texConcrete() {
  const S = 1024, c = cv(S, S), x = c.getContext('2d'), r = rnd(21);
  x.fillStyle = '#9a9995'; x.fillRect(0, 0, S, S);
  for (let i = 0; i < 90; i++) { const px = r() * S, py = r() * S, rr = 60 + r() * 200, g = x.createRadialGradient(px, py, 0, px, py, rr); g.addColorStop(0, r() < 0.5 ? 'rgba(255,255,255,.06)' : 'rgba(40,40,45,.07)'); g.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = g; x.fillRect(px - rr, py - rr, rr * 2, rr * 2); }
  grit(x, r, 0, 0, S, S, 26000, '255,255,255', '40,40,45', 0.09);
  const h = S / 2;
  for (let i = 0; i < 2; i++) {
    x.fillStyle = 'rgba(30,30,34,.5)'; x.fillRect(i * h, 0, 3, S); x.fillRect(0, i * h, S, 3);
    x.fillStyle = 'rgba(255,255,255,.14)'; x.fillRect(i * h + 3, 0, 2, S); x.fillRect(0, i * h + 3, S, 2);
  }
  for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) for (const [ax, ay] of [[0.14, 0.2], [0.86, 0.2], [0.14, 0.8], [0.86, 0.8]]) {
    x.fillStyle = 'rgba(25,25,28,.55)'; x.beginPath(); x.arc((i + ax) * h, (j + ay) * h, 7, 0, 7); x.fill();
  }
  return c;
}
function texDark() {
  const S = 1024, c = cv(S, S), x = c.getContext('2d'), r = rnd(5);
  x.fillStyle = '#1b1c20'; x.fillRect(0, 0, S, S);
  for (let i = 0; i < 2600; i++) { x.fillStyle = 'rgba(255,255,255,' + (0.012 + r() * 0.03).toFixed(3) + ')'; x.fillRect(r() * S, r() * S, 1, 20 + r() * 120); }
  grit(x, r, 0, 0, S, S, 12000, '255,255,255', '0,0,0', 0.06);
  for (let j = 0; j < 4; j++) { x.fillStyle = 'rgba(0,0,0,.75)'; x.fillRect(0, j * S / 4, S, 4); x.fillStyle = 'rgba(255,255,255,.07)'; x.fillRect(0, j * S / 4 + 4, S, 2); }
  for (let i = 0; i < 2; i++) { x.fillStyle = 'rgba(0,0,0,.75)'; x.fillRect(i * S / 2, 0, 4, S); }
  return c;
}
function texWood() {
  const S = 1024, c = cv(S, S), x = c.getContext('2d'), r = rnd(9), n = 16, sw = S / n;
  for (let i = 0; i < n; i++) {
    const v = r(), R = 118 + v * 44, G = 78 + v * 30, B = 46 + v * 20;
    x.fillStyle = 'rgb(' + (R | 0) + ',' + (G | 0) + ',' + (B | 0) + ')'; x.fillRect(i * sw, 0, sw, S);
    for (let k = 0; k < 70; k++) { x.fillStyle = 'rgba(' + (r() < 0.5 ? '40,22,8' : '255,225,180') + ',' + (0.03 + r() * 0.07).toFixed(3) + ')'; x.fillRect(i * sw + r() * sw, 0, 1 + r() * 2, S); }
    x.fillStyle = 'rgba(20,10,4,.85)'; x.fillRect(i * sw, 0, 5, S);
    x.fillStyle = 'rgba(255,230,190,.12)'; x.fillRect(i * sw + 5, 0, 2, S);
  }
  return c;
}
function texFloor() {
  const S = 1024, c = cv(S, S), x = c.getContext('2d'), r = rnd(17), n = 8, t = S / n;
  x.fillStyle = '#26272a'; x.fillRect(0, 0, S, S);
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
    const v = 58 + r() * 16;
    x.fillStyle = 'rgb(' + (v | 0) + ',' + (v | 0) + ',' + ((v + 3) | 0) + ')'; x.fillRect(i * t + 2, j * t + 2, t - 4, t - 4);
  }
  grit(x, r, 0, 0, S, S, 30000, '255,255,255', '0,0,0', 0.07);
  return c;
}
function texInterior() {
  const c = cv(512, 256), x = c.getContext('2d'), r = rnd(5);
  const g = x.createLinearGradient(0, 0, 0, 256); g.addColorStop(0, '#f6dcae'); g.addColorStop(0.45, '#b9824a'); g.addColorStop(1, '#2a1a0c');
  x.fillStyle = g; x.fillRect(0, 0, 512, 256);
  for (let i = 0; i < 16; i++) { const w = 18 + r() * 54, h = 30 + r() * 120; x.fillStyle = 'rgba(30,16,6,' + (0.3 + r() * 0.4).toFixed(2) + ')'; x.fillRect(r() * 512, 256 - h - r() * 26, w, h); }
  for (let i = 0; i < 6; i++) { const px = 44 + i * 85, rg = x.createRadialGradient(px, 18, 2, px, 18, 64); rg.addColorStop(0, 'rgba(255,255,240,.95)'); rg.addColorStop(1, 'rgba(255,255,240,0)'); x.fillStyle = rg; x.fillRect(px - 64, 0, 128, 96); }
  return c;
}
const WALLS = [
  { id: 'stone', label: 'حجر', th: 'linear-gradient(135deg,#e8dcc0,#cdbd9b)', bump: 0.006, rough: 0.95, trim: '#d8ccb1', make: texStone },
  { id: 'plaster', label: 'جص أبيض', th: 'linear-gradient(135deg,#f3efe6,#dbd6ca)', bump: 0.006, rough: 0.96, trim: '#e6e1d6', make: texPlaster },
  { id: 'concrete', label: 'خرسانة', th: 'linear-gradient(135deg,#abaaa6,#7d7c78)', bump: 0.02, rough: 0.9, trim: '#8b8a86', make: texConcrete },
  { id: 'dark', label: 'أسود', th: 'linear-gradient(135deg,#2c2e33,#0f1013)', bump: 0.015, rough: 0.62, trim: '#131417', make: texDark },
  { id: 'wood', label: 'خشب', th: 'repeating-linear-gradient(90deg,#8d6039 0 7px,#5e3d22 7px 8px)', bump: 0.03, rough: 0.8, trim: '#2a2019', make: texWood }
];

/* ================= text → distance fields =================
   The browser shapes the text (Arabic joins, any font), then a distance transform turns the
   pixels into a field the 3D shaders extrude, bevel and light. */
const RTL_RE = /[֐-ࣿיִ-﷿ﹰ-﻿]/;
const RANGE = 22, PX = 150, PAD = RANGE + 3, MAXW = 1500, UMAX = 2.4, GH = 44, INF = 1e20;
const meas = cv(4, 4).getContext('2d');
const fontStr = (f, type, px) => (type === 'neon' ? f.wn : f.w) + ' ' + px.toFixed(2) + 'px ' + f.css + ', "Cairo", "Noto Sans Arabic", "Segoe UI", Tahoma, sans-serif';
function drawText(text, f, type, px, pad, maxW) {
  const rtl = RTL_RE.test(text);
  const prep = (c, p) => { c.font = fontStr(f, type, p); c.textBaseline = 'alphabetic'; c.textAlign = 'left'; try { c.direction = rtl ? 'rtl' : 'ltr'; } catch (e) {} };
  const read = p => {
    prep(meas, p);
    const m = meas.measureText(text);
    let l = m.actualBoundingBoxLeft, r = m.actualBoundingBoxRight, a = m.actualBoundingBoxAscent, d = m.actualBoundingBoxDescent;
    if (!(isFinite(l + r) && l + r > 1 && isFinite(a + d) && a + d > 1)) { l = 0; r = Math.max(m.width || 0, p * 0.6); a = p * 0.8; d = p * 0.22; }
    return { l, r, a, d };
  };
  let m = read(px);
  const k = Math.min(1, (maxW - 2 * pad) / (m.l + m.r));
  if (k < 1) { px *= k; m = read(px); }
  const inkW = m.l + m.r, inkH = m.a + m.d, w = Math.ceil(inkW) + 2 * pad, h = Math.ceil(inkH) + 2 * pad;
  const c = cv(w, h), x = c.getContext('2d', { willReadFrequently: true });
  prep(x, px); x.fillStyle = '#fff'; x.fillText(text, pad + m.l, pad + m.a);
  return { x, w, h, inkW, inkH, px };
}
function edt1d(g, off, stride, n, f, v, z) {
  v[0] = 0; z[0] = -INF; z[1] = INF; f[0] = g[off];
  for (let q = 1, k = 0, s = 0; q < n; q++) {
    f[q] = g[off + q * stride];
    const q2 = q * q;
    do { const r = v[k]; s = (f[q] - f[r] + q2 - r * r) / (q - r) / 2; } while (s <= z[k] && --k > -1);
    k++; v[k] = q; z[k] = s; z[k + 1] = INF;
  }
  for (let q = 0, k = 0; q < n; q++) {
    while (z[k + 1] < q) k++;
    const r = v[k], qr = q - r;
    g[off + q * stride] = f[r] + qr * qr;
  }
}
function edt(g, w, h) {
  const m = Math.max(w, h), f = new Float64Array(m), v = new Uint16Array(m), z = new Float64Array(m + 1);
  for (let x = 0; x < w; x++) edt1d(g, x, w, h, f, v, z);
  for (let y = 0; y < h; y++) edt1d(g, y * w, 1, w, f, v, z);
}
function buildFields(text, f, type) {
  const t = drawText(text, f, type, PX, PAD, MAXW);
  let n = t.w * t.h, img = t.x.getImageData(0, 0, t.w, t.h).data;
  const go = new Float64Array(n), gi = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    const a = img[i * 4 + 3] / 255;
    if (a >= 0.999) { go[i] = 0; gi[i] = INF; } else if (a <= 0.001) { go[i] = INF; gi[i] = 0; } else { const o = Math.max(0, 0.5 - a), q = Math.max(0, a - 0.5); go[i] = o * o; gi[i] = q * q; }
  }
  edt(go, t.w, t.h); edt(gi, t.w, t.h);
  const data = new Uint8Array(n); let dmax = 0;
  for (let i = 0; i < n; i++) { const sd = Math.sqrt(gi[i]) - Math.sqrt(go[i]); if (sd > dmax && sd < 1e6) dmax = sd; data[i] = clamp(Math.round(127.5 + sd / RANGE * 127.5), 0, 255); }
  /* wide, low-res field for glow, shadow and floor reflection (units: letter heights) */
  const g = drawText(text, f, type, t.px * GH / t.inkH, Math.ceil(UMAX * GH) + 3, 1e9);
  n = g.w * g.h; img = g.x.getImageData(0, 0, g.w, g.h).data;
  const gg = new Float64Array(n);
  for (let i = 0; i < n; i++) { const a = img[i * 4 + 3] / 255; gg[i] = a >= 0.999 ? 0 : a <= 0.001 ? INF : Math.pow(Math.max(0, 0.5 - a), 2); }
  edt(gg, g.w, g.h);
  const gdata = new Uint8Array(n), R2 = UMAX * g.inkH;
  for (let i = 0; i < n; i++) gdata[i] = Math.round(255 * Math.sqrt(clamp(Math.sqrt(gg[i]) / R2, 0, 1)));
  return { aspect: t.inkW / t.inkH, shape: { data, w: t.w, h: t.h, inkW: t.inkW, inkH: t.inkH, dmax: dmax || 6 }, glow: { data: gdata, w: g.w, h: g.h, inkH: g.inkH } };
}

/* ================= size and price ================= */
function layout(type, widthCm, aspect) {
  const W = widthCm / 100; let tw, th, H;
  if (type === 'neon') { tw = W / (1 + 0.6 / aspect); th = tw / aspect; H = th * 1.6; }
  else if (type === 'box') { tw = W / (1 + 0.8 / aspect); th = tw / aspect; H = th * 1.9; }
  else { tw = W; th = W / aspect; H = th; }
  return { W, H, tw, th, price: Math.max(PRICING.min, Math.round(W * Math.max(1, Math.round(H * 100)) / 100 * PRICING.perM2)) };
}
const maxWidthCm = (type, aspect) => clamp(Math.floor(MAX_H / layout(type, 100, aspect).H * 100 / 5) * 5, 10, 400);

/* model / storefront catalog — different generated shop fronts the customer
   can pick from, plus an adjustable door width within whichever one they pick */
const FACADES = [
  { id: 'glass', label: 'عصرية بعواميد', sub: 'واجهة زجاجية' },
  { id: 'trad', label: 'تقليدية', sub: 'باب مزدوج' },
  { id: 'full', label: 'حديثة بالكامل', sub: 'زجاج بدون عواميد' }
];
const DOOR_MIN = 2.5, DOOR_MAX = 7, DOOR_DEF = 4.9;

/* ================= state ================= */
const DEF = { text: '', type: 'front', font: 'cairo', led: 'warm', body: 'black', widthCm: 160, wall: 'stone', facade: 'glass', doorW: DOOR_DEF };
const st = Object.assign({}, DEF);
try {
  const o = JSON.parse(localStorage.getItem('lx3d') || 'null');
  if (o && typeof o === 'object') {
    const ok = (list, id) => list.some(i => i.id === id);
    if (typeof o.text === 'string') st.text = o.text.slice(0, 26);
    if (ok(TYPES, o.type)) st.type = o.type;
    if (ok(FONTS, o.font)) st.font = o.font;
    if (ok(LEDS, o.led)) st.led = o.led;
    if (ok(BODIES, o.body)) st.body = o.body;
    if (ok(WALLS, o.wall)) st.wall = o.wall;
    if (ok(FACADES, o.facade)) st.facade = o.facade;
    if (o.doorW >= DOOR_MIN && o.doorW <= DOOR_MAX) st.doorW = o.doorW;
    if (o.widthCm >= 40 && o.widthCm <= 400) st.widthCm = Math.round(o.widthCm / 5) * 5;
  }
} catch (e) {}
const save = () => { try { localStorage.setItem('lx3d', JSON.stringify(st)); } catch (e) {} };
const pick = (list, id) => list.find(i => i.id === id) || list[0];
const textOf = () => st.text.trim() || PLACEHOLDER;

const lx = $('#lx'), stage = $('#stage'), dock = $('#dock'), nameEl = $('.name'), hint = $('#hint');
const dimW = $('#dimW'), dimH = $('#dimH');

/* ================= 3D view ================= */
function createView() {
  const T = window.THREE;
  if (!T) return null;
  let renderer;
  try { renderer = new T.WebGLRenderer({ canvas: stage, antialias: true, powerPreference: 'high-performance' }); } catch (e) { return null; }
  const GL2 = renderer.capabilities.isWebGL2;
  renderer.outputEncoding = T.sRGBEncoding;
  renderer.toneMapping = T.ACESFilmicToneMapping;
  let dpr = Math.min(window.devicePixelRatio || 1, 2);
  renderer.setPixelRatio(dpr);
  const lin = h => new T.Color(h).convertSRGBToLinear();
  const scene = new T.Scene();
  scene.fog = new T.Fog(0x000000, 18, 62);
  const cam = new T.PerspectiveCamera(34, 1, 0.5, 130);
  const aniso = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  const TONE = '\n#include <tonemapping_fragment>\n#include <encodings_fragment>\n';

  /* sky */
  const skyU = { uTop: { value: new T.Color() }, uHor: { value: new T.Color() } };
  const sky = new T.Mesh(new T.SphereGeometry(100, 20, 10), new T.ShaderMaterial({
    uniforms: skyU, side: T.BackSide, depthWrite: false, toneMapped: false,
    vertexShader: 'varying vec3 vD; void main(){ vD = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
    fragmentShader: 'uniform vec3 uTop, uHor; varying vec3 vD; void main(){ float h = clamp(vD.y * 1.8 + 0.05, 0.0, 1.0); gl_FragColor = vec4(mix(uHor, uTop, pow(h, 0.6)), 1.0);' + TONE + '}'
  }));
  sky.renderOrder = -5; scene.add(sky);

  /* lights */
  const hemi = new T.HemisphereLight(0xffffff, 0xffffff, 1); scene.add(hemi);
  const sun = new T.DirectionalLight(0xffffff, 1); sun.position.set(-4.5, 7.5, 5.5); scene.add(sun);
  const leds = [0, 1, 2].map(() => { const p = new T.PointLight(0xffffff, 0, 7, 1.5); scene.add(p); return p; });

  /* facade */
  const WALL_W = 44, WALL_H = 11, TILE = 3.2;
  const unitBox = new T.BoxGeometry(1, 1, 1), quad = new T.PlaneGeometry(1, 1);
  const addBox = (w, h, d, x, y, z, mat) => { const m = new T.Mesh(unitBox, mat); m.scale.set(w, h, d); m.position.set(x, y, z); scene.add(m); return m; };
  const wallMat = new T.MeshStandardMaterial({ roughness: 0.94, metalness: 0 });
  const wall = new T.Mesh(new T.PlaneGeometry(WALL_W, WALL_H), wallMat); wall.position.set(0, WALL_H / 2, 0); scene.add(wall);
  const trimMat = new T.MeshStandardMaterial({ roughness: 0.86, metalness: 0 });
  const frameMat = new T.MeshStandardMaterial({ color: lin('#23262b'), roughness: 0.5, metalness: 0.35 });
  const handleMat = new T.MeshStandardMaterial({ color: lin('#c9b889'), roughness: 0.35, metalness: 0.2 });
  const doorMat = new T.MeshStandardMaterial({ color: lin('#5a3c22'), roughness: 0.6, metalness: 0.1 });
  const inTex = new T.CanvasTexture(texInterior()); inTex.encoding = T.sRGBEncoding;
  const gc = cv(8, 128), gx = gc.getContext('2d'), gg = gx.createLinearGradient(0, 0, 0, 128); gg.addColorStop(0, '#8d9fb0'); gg.addColorStop(0.5, '#3a4753'); gg.addColorStop(1, '#141a20'); gx.fillStyle = gg; gx.fillRect(0, 0, 8, 128);
  const glassMap = new T.CanvasTexture(gc); glassMap.encoding = T.sRGBEncoding;
  const glassMat = new T.MeshStandardMaterial({ map: glassMap, roughness: 0.18, metalness: 0.3, emissive: lin('#ffc98a'), emissiveMap: inTex, emissiveIntensity: 0 });
  const floorTex = new T.CanvasTexture(texFloor()); floorTex.encoding = T.sRGBEncoding; floorTex.wrapS = floorTex.wrapT = T.RepeatWrapping; floorTex.repeat.set(70 / TILE, 44 / TILE); floorTex.anisotropy = aniso;
  const floor = new T.Mesh(new T.PlaneGeometry(70, 44), new T.MeshStandardMaterial({ map: floorTex, roughness: 0.6, metalness: 0 }));
  floor.rotation.x = -Math.PI / 2; floor.position.set(0, 0, 20); scene.add(floor);

  const sc = cv(8, 64), sx = sc.getContext('2d'), sg = sx.createLinearGradient(0, 0, 0, 64); sg.addColorStop(0, 'rgba(0,0,0,1)'); sg.addColorStop(0.55, 'rgba(0,0,0,.8)'); sg.addColorStop(1, 'rgba(0,0,0,0)'); sx.fillStyle = sg; sx.fillRect(0, 0, 8, 64);
  const shadeMat = new T.MeshBasicMaterial({ color: 0x000000, alphaMap: new T.CanvasTexture(sc), transparent: true, opacity: 0, depthWrite: false, toneMapped: false, polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -2 });

  /* storefront models — each returns a disposable Group built around a
     chosen door/glass width (R scales every span that represents the
     opening itself; a post or frame member's own thickness never scales —
     a wider door doesn't need a thicker frame). */
  function grp() {
    const g = new T.Group();
    const abx = (w, h, d, x, y, z, mat) => { const m = new T.Mesh(unitBox, mat); m.scale.set(w, h, d); m.position.set(x, y, z); g.add(m); return m; };
    const ash = (w, h, x, y, rot) => { const m = new T.Mesh(quad, shadeMat); m.scale.set(w, h, 1); m.position.set(x, y, 0.0015); m.rotation.z = rot; m.renderOrder = 1; g.add(m); };
    return { g, abx, ash };
  }
  function facadeGlass(doorW) {
    const { g, abx, ash } = grp(), R = doorW / DOOR_DEF, pilX = 3.4 * R;
    abx(0.44, 4.6, 0.1, -pilX, 2.3, 0.05, trimMat); abx(0.44, 4.6, 0.1, pilX, 2.3, 0.05, trimMat);
    abx(7.5 * R, 0.18, 0.2, 0, 4.69, 0.1, trimMat); abx(7.3 * R, 0.05, 0.13, 0, 4.57, 0.065, trimMat);
    abx(1.7 * R, 0.04, 0.5, 0, 0.02, 0.28, trimMat);
    const glass = new T.Mesh(new T.PlaneGeometry(doorW, 2.5), glassMat); glass.position.set(0, 1.25, 0.03); g.add(glass);
    abx(doorW * 1.0245, 0.07, 0.08, 0, 2.535, 0.06, frameMat);
    const sideX = doorW / 2 + 0.025;
    abx(0.07, 2.57, 0.08, -sideX, 1.285, 0.06, frameMat); abx(0.07, 2.57, 0.08, sideX, 1.285, 0.06, frameMat);
    const mulX = 0.66 * R;
    abx(0.06, 2.5, 0.07, -mulX, 1.25, 0.06, frameMat); abx(0.06, 2.5, 0.07, mulX, 1.25, 0.06, frameMat); abx(0.035, 2.1, 0.07, 0, 1.05, 0.06, frameMat);
    abx(1.32 * R, 0.05, 0.07, 0, 2.12, 0.06, frameMat);
    const kpX = 1.565 * R;
    abx(1.78 * R, 0.1, 0.07, -kpX, 0.05, 0.06, frameMat); abx(1.78 * R, 0.1, 0.07, kpX, 0.05, 0.06, frameMat);
    abx(0.025, 0.44, 0.035, -0.09, 1.08, 0.115, handleMat); abx(0.025, 0.44, 0.035, 0.09, 1.08, 0.115, handleMat);
    ash(7.5 * R, 0.34, 0.08 * R, 4.375, 0);
    ash(4.6, 0.12, -(pilX - 0.28), 2.3, Math.PI / 2); ash(4.6, 0.12, pilX + 0.28, 2.3, Math.PI / 2);
    return g;
  }
  function facadeTraditional(doorW) {
    const { g, abx, ash } = grp(), R = doorW / DOOR_DEF, pilX = 1.8 * R, doorHalf = 0.95 * R;
    abx(0.6, 4.2, 0.14, -pilX, 2.1, 0.07, trimMat); abx(0.6, 4.2, 0.14, pilX, 2.1, 0.07, trimMat);
    abx(pilX * 2 + 0.6, 0.22, 0.22, 0, 4.32, 0.11, trimMat);
    abx((pilX - 0.3) * 2, 0.04, 0.5, 0, 0.02, 0.28, trimMat);
    /* two solid door leaves, dark wood, small glass transom above */
    abx(doorHalf - 0.03, 2.3, 0.1, -doorHalf / 2 - 0.015, 1.15, 0.05, doorMat);
    abx(doorHalf - 0.03, 2.3, 0.1, doorHalf / 2 + 0.015, 1.15, 0.05, doorMat);
    abx(0.04, 2.3, 0.11, 0, 1.15, 0.05, frameMat);
    const glass = new T.Mesh(new T.PlaneGeometry(doorHalf * 2, 0.5), glassMat); glass.position.set(0, 2.55, 0.05); g.add(glass);
    abx(doorHalf * 2 + 0.1, 0.06, 0.12, 0, 2.3, 0.06, frameMat);
    abx(doorHalf * 2 + 0.1, 0.06, 0.12, 0, 2.8, 0.06, frameMat);
    abx(0.05, 0.5, 0.06, -doorHalf * 0.35, 1.15, 0.13, handleMat); abx(0.05, 0.5, 0.06, doorHalf * 0.35, 1.15, 0.13, handleMat);
    ash(pilX * 2 + 0.6, 0.3, 0.08, 4.1, 0);
    ash(4.2, 0.14, -(pilX - 0.32), 2.1, Math.PI / 2); ash(4.2, 0.14, pilX + 0.32, 2.1, Math.PI / 2);
    return g;
  }
  function facadeFull(doorW) {
    const { g, abx, ash } = grp(), halfW = doorW * 0.72;
    abx(halfW * 2 + 0.3, 0.1, 0.16, 0, 4.78, 0.08, trimMat);
    const glass = new T.Mesh(new T.PlaneGeometry(halfW * 2, 3.3), glassMat); glass.position.set(0, 1.65, 0.03); g.add(glass);
    abx(halfW * 2 + 0.06, 0.05, 0.07, 0, 3.3, 0.05, frameMat);
    abx(0.05, 3.33, 0.07, -halfW, 1.66, 0.05, frameMat); abx(0.05, 3.33, 0.07, halfW, 1.66, 0.05, frameMat);
    abx(0.045, 3.3, 0.06, 0, 1.65, 0.045, frameMat);
    abx(0.025, 0.44, 0.03, -0.09, 1.1, 0.085, handleMat); abx(0.025, 0.44, 0.03, 0.09, 1.1, 0.085, handleMat);
    ash(halfW * 2 + 0.3, 0.22, 0.08, 4.68, 0);
    return g;
  }
  let storefront = null;
  function setStorefront(facadeId, doorW) {
    if (storefront) { scene.remove(storefront); storefront.traverse(o => { if (o.geometry && o.geometry !== unitBox && o.geometry !== quad) o.geometry.dispose(); }); }
    storefront = facadeId === 'trad' ? facadeTraditional(doorW) : facadeId === 'full' ? facadeFull(doorW) : facadeGlass(doorW);
    scene.add(storefront);
  }

  const wallTex = {}; let wallNow = '';
  function setWall(id) {
    const W = pick(WALLS, id); let t = wallTex[W.id];
    if (wallNow === W.id) return; wallNow = W.id;
    if (!t) { t = new T.CanvasTexture(W.make()); t.encoding = T.sRGBEncoding; t.wrapS = t.wrapT = T.RepeatWrapping; t.repeat.set(WALL_W / TILE, WALL_H / TILE); t.anisotropy = aniso; wallTex[W.id] = t; }
    wallMat.map = t; wallMat.bumpMap = t; wallMat.bumpScale = W.bump; wallMat.roughness = W.rough; wallMat.needsUpdate = true;
    trimMat.color.copy(lin(W.trim));
  }

  /* glow, shadow, floor reflection: all read the wide distance field */
  const FX = {
    uGlow: { value: null }, uUmax: { value: UMAX }, uKind: { value: 0 }, uPlane: { value: new T.Vector2(1, 1) }, uBoxHalf: { value: new T.Vector2(1, 1) },
    uLed: { value: new T.Color(1, 1, 1) }, uLit: { value: 0 }, uNight: { value: 1 }, uDay: { value: 0 }, uOff: { value: new T.Vector2() }, uSoft: { value: 0.1 },
    uCenter: { value: new T.Vector2(0, SIGN_Y) }, uSize: { value: new T.Vector2(1, 1) }, uTH: { value: 0.4 }
  };
  const FXHEAD = `
uniform sampler2D uGlow; uniform float uUmax, uKind, uLit, uNight, uDay, uSoft, uTH; uniform vec3 uLed; uniform vec2 uPlane, uBoxHalf, uOff, uCenter, uSize;
float field(vec2 uv){
  if (uKind > 2.5) { vec2 q = abs((uv - 0.5) * uPlane) - uBoxHalf; return length(max(q, 0.0)); }
  float v = texture2D(uGlow, vec2(uv.x, 1.0 - uv.y)).r; return v * v * uUmax;
}
float halo(float u){
  if (uKind < 0.5) return 0.26 / (1.0 + pow(u / 0.075, 2.0)) + 0.13 * exp(-u / 0.42);
  if (uKind < 1.5) return 0.62 / (1.0 + pow(u / 0.085, 2.0)) + 0.10 * exp(-u / 0.4);
  if (uKind < 2.5) return 0.55 / (1.0 + pow(u / 0.07, 2.0)) + 0.22 * exp(-u / 0.55);
  return 0.24 / (1.0 + pow(u / 0.10, 2.0)) + 0.14 * exp(-u / 0.45);
}`;
  const FXVERT = 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }';
  const RIM = 'vec2 eg = min(vUv, 1.0 - vUv) * uPlane; float rim = smoothstep(0.0, 0.45, min(eg.x, eg.y));';
  const shadow = new T.Mesh(quad, new T.ShaderMaterial({
    uniforms: FX, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -4, vertexShader: FXVERT,
    fragmentShader: FXHEAD + `varying vec2 vUv;
void main(){
  float m = 1000.0;
  for (int k = 0; k < 5; k++) { m = min(m, field(vUv - uOff * (0.15 + 0.2125 * float(k)))); }
  float a = (1.0 - smoothstep(0.0, uSoft, m)) * 0.42 * uDay;
  float c = (1.0 - smoothstep(0.0, 0.07, field(vUv))) * 0.2 * (0.35 + 0.65 * uDay);
  ${RIM}
  gl_FragColor = vec4(0.0, 0.0, 0.0, max(a, c) * rim);
}`
  }));
  shadow.position.set(0, SIGN_Y, 0.002); shadow.renderOrder = 2; scene.add(shadow);
  const glow = new T.Mesh(quad, new T.ShaderMaterial({
    uniforms: FX, transparent: true, depthWrite: false, blending: T.AdditiveBlending, polygonOffset: true, polygonOffsetFactor: -3, polygonOffsetUnits: -6, vertexShader: FXVERT,
    fragmentShader: FXHEAD + `varying vec2 vUv;
void main(){
  ${RIM}
  gl_FragColor = vec4(uLed * (halo(field(vUv)) * rim * uLit * mix(0.16, 1.0, uNight)), 1.0);${TONE}
}`
  }));
  glow.position.set(0, SIGN_Y, 0.004); glow.renderOrder = 3; scene.add(glow);
  const refl = new T.Mesh(new T.PlaneGeometry(26, 12), new T.ShaderMaterial({
    uniforms: FX, transparent: true, depthWrite: false, blending: T.AdditiveBlending, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -4,
    vertexShader: 'varying vec3 vW; void main(){ vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }',
    fragmentShader: FXHEAD + `varying vec3 vW;
float emit(vec2 xy){
  vec2 uv = (xy - uCenter) / uSize + 0.5;
  if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) return 0.0;
  float u = field(uv);
  return 1.0 / (1.0 + pow(u / 0.11, 2.0)) + 0.12 * exp(-u / 0.5);
}
void main(){
  vec3 V = normalize(vW - cameraPosition);
  vec3 R = vec3(V.x, -V.y, V.z);
  if (R.z > -0.02) discard;
  float s = -vW.z / R.z;
  vec2 Q = vW.xy + R.xy * s;
  float I = 0.0;
  for (int i = 0; i < 7; i++) { float f = (float(i) - 3.0) / 3.0; I += emit(Q + vec2(0.0, f * 0.05 * s)) * (1.0 - abs(f) * 0.6); }
  float fres = 0.12 + 0.88 * pow(1.0 - clamp(-V.y, 0.0, 1.0), 3.0);
  gl_FragColor = vec4(uLed * (I / 4.6 * fres * exp(-vW.z * 0.2) * uLit * uNight * 0.9), 1.0);${TONE}
}`
  }));
  refl.rotation.x = -Math.PI / 2; refl.position.set(0, 0.004, 6.05); refl.renderOrder = 1; scene.add(refl);

  /* letters: a stack of slices cut from the distance field */
  const NL = 32;
  const LU = {
    uSdf: { value: null }, uTexel: { value: new T.Vector2() }, uRange: { value: RANGE }, uRim: { value: 0 }, uBevel: { value: 1 }, uBevelT: { value: 0.1 }, uRing: { value: 4 }, uTube: { value: 6 }, uBloom: { value: 0 },
    uMode: { value: 0 }, uLit: { value: 0 }, uDepth: { value: 0.08 }, uStand: { value: 0.006 },
    uFace: { value: new T.Color(1, 1, 1) }, uSide: { value: new T.Color(0, 0, 0) }, uLed: FX.uLed,
    uFaceMR: { value: new T.Vector2(0, 0.4) }, uSideMR: { value: new T.Vector2(0, 0.4) },
    uSunDir: { value: new T.Vector3(-0.4356, 0.726, 0.5324) }, uSunCol: { value: new T.Color() }, uSkyCol: { value: new T.Color() }, uGroundCol: { value: new T.Color() }, uEnvTint: { value: new T.Color() }
  };
  const LIGHTING = `
uniform vec3 uSunDir, uSunCol, uSkyCol, uGroundCol, uEnvTint;
vec3 envMap(vec3 R){
  vec3 c = mix(uGroundCol, uSkyCol, smoothstep(-0.25, 0.35, R.y));
  c += uEnvTint * (0.55 * exp(-pow((R.y - 0.05) * 4.5, 2.0)));
  c += uEnvTint * (1.1 * smoothstep(0.78, 0.99, sin(R.x * 6.5 + R.y * 2.5 + 0.8)) * smoothstep(-0.15, 0.35, R.y));
  return c;
}
vec3 shade(vec3 base, vec2 mr, vec3 N, vec3 V){
  vec3 amb = mix(uGroundCol, uSkyCol, N.y * 0.5 + 0.5);
  vec3 dif = base * (amb + uSunCol * max(dot(N, uSunDir), 0.0));
  float sp = pow(max(dot(N, normalize(uSunDir + V)), 0.0), mix(240.0, 18.0, mr.y)) * (1.15 - mr.y);
  vec3 F0 = mix(vec3(0.045), base, mr.x);
  float fr = pow(1.0 - max(dot(N, V), 0.0), 5.0) * (1.0 - mr.y * 0.7) * mix(0.3, 1.0, mr.x);
  vec3 spec = (F0 + (1.0 - F0) * fr) * (envMap(reflect(-V, N)) * (1.0 - mr.y * 0.45) + uSunCol * sp * 2.5);
  return dif * (1.0 - mr.x) + spec;
}`;
  const lg = new T.InstancedBufferGeometry();
  lg.index = quad.index; lg.setAttribute('position', quad.attributes.position); lg.setAttribute('uv', quad.attributes.uv);
  const ts = new Float32Array(NL); for (let i = 0; i < NL; i++) ts[i] = i / (NL - 1);
  lg.setAttribute('aT', new T.InstancedBufferAttribute(ts, 1)); lg.instanceCount = NL;
  const letters = new T.Mesh(lg, new T.ShaderMaterial({
    uniforms: LU, transparent: true, extensions: { derivatives: true },
    vertexShader: `attribute float aT; uniform float uDepth, uStand; varying vec2 vUv; varying float vT; varying vec3 vW;
void main(){ vUv = vec2(uv.x, 1.0 - uv.y); vT = aT; vec4 w = modelMatrix * vec4(position, 1.0); w.z += uStand + aT * uDepth; vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`,
    fragmentShader: `uniform sampler2D uSdf; uniform vec2 uTexel, uFaceMR, uSideMR;
uniform float uRange, uRim, uBevel, uBevelT, uRing, uTube, uMode, uLit, uBloom; uniform vec3 uFace, uSide, uLed;
varying vec2 vUv; varying float vT; varying vec3 vW;${LIGHTING}
float sd(vec2 uv){ return (texture2D(uSdf, uv).r - 0.5) * 2.0 * uRange; }
void main(){
  float d = sd(vUv);
  bool front = vT > 0.9995;
  float s = clamp((vT - 1.0 + uBevelT) / max(uBevelT, 0.0001), 0.0, 1.0);
  float e = d + uRim - uBevel * (1.0 - sqrt(max(0.0, 1.0 - s * s)));
  float aa = max(fwidth(d) * 0.75, 0.03);
  float alpha = smoothstep(-aa, aa, e);
  float bl = front ? uBloom * uLit * exp(min(d, 0.0) / 5.5) * smoothstep(-uRange, -uRange * 0.55, d) : 0.0;
  if (max(alpha, bl) < 0.004) discard;
  if (!front && e > uRing + (s > 0.0 ? uBevel + 1.0 : 0.0)) discard;
  vec2 tx = uTexel * 1.5;
  vec2 g = vec2(sd(vUv + vec2(tx.x, 0.0)) - sd(vUv - vec2(tx.x, 0.0)), sd(vUv + vec2(0.0, tx.y)) - sd(vUv - vec2(0.0, tx.y)));
  vec2 n2 = vec2(-g.x, g.y);
  float gl = length(n2);
  n2 = gl > 0.0001 ? n2 / gl : vec2(0.0);
  float k = clamp(1.0 - (d + uRim) / max(uBevel, 0.001), 0.0, 1.0);
  vec3 N = (s <= 0.0 && !front) ? vec3(n2, 0.0) : normalize(vec3(n2 * k, sqrt(max(1.0 - k * k, 0.0)) + 0.001));
  if (dot(N, N) < 0.25) N = vec3(0.0, 0.0, 1.0);
  vec3 V = normalize(cameraPosition - vW);
  vec3 col;
  if (uMode < 0.5) {
    vec3 sideC = shade(uSide, uSideMR, N, V) + uLed * (uLit * (front ? 0.5 * exp(d / 2.2) : 0.015));
    float fm = front ? smoothstep(-aa, aa, d) : 0.0;
    vec3 faceC = shade(uFace, vec2(0.0, 0.3), vec3(0.0, 0.0, 1.0), V) * (1.0 - 0.6 * uLit) + mix(uLed * uLed, uLed, smoothstep(0.0, 10.0, d)) * (uLit * (1.25 + 0.75 * smoothstep(0.0, 12.0, d)));
    col = mix(sideC, faceC, fm);
  } else if (uMode < 1.5) {
    col = shade(uFace, uFaceMR, N, V);
    if (!front && s <= 0.0) col += uLed * (uLit * 0.35 * (1.0 - vT) * (1.0 - vT));
  } else {
    float core = clamp(d / uTube, 0.0, 1.0);
    vec3 Nt = normalize(vec3(n2 * (1.0 - core), 0.35 + core));
    vec3 offC = shade(mix(vec3(0.9), uFace, 0.5), vec2(0.0, 0.22), Nt, V);
    vec3 onC = mix(uLed * 2.3, uLed * 0.8 + vec3(2.4), pow(core, 1.4));
    col = offC * (1.0 - 0.75 * uLit) + onC * uLit;
  }
  gl_FragColor = front ? vec4(mix(uLed * 1.5, col, alpha), max(alpha, bl * 0.55)) : vec4(col, alpha);${TONE}
}`
  }));
  letters.frustumCulled = false; letters.renderOrder = 6; letters.position.set(0, SIGN_Y, 0); scene.add(letters);

  /* neon backplate */
  const PU = { uSize: { value: new T.Vector2(1, 1) }, uLed: FX.uLed, uLit: FX.uLit, uSkyCol: LU.uSkyCol };
  const plate = new T.Mesh(quad, new T.ShaderMaterial({
    uniforms: PU, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -8, extensions: { derivatives: true }, vertexShader: FXVERT,
    fragmentShader: `uniform vec2 uSize; uniform vec3 uLed, uSkyCol; uniform float uLit; varying vec2 vUv;
void main(){
  vec2 p = (vUv - 0.5) * uSize, q = abs(p) - uSize * 0.5 + 0.035;
  float d = length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - 0.035;
  float a = 1.0 - smoothstep(-fwidth(d), fwidth(d), d);
  if (a < 0.01) discard;
  float edge = smoothstep(-0.014, 0.0, d);
  vec3 col = vec3(0.78, 0.85, 0.92) * uSkyCol * 0.7 + uSkyCol * edge * 0.9 + uLed * (uLit * (0.06 + edge * 1.3));
  gl_FragColor = vec4(col, a * (0.08 + edge * 0.55 + uLit * 0.04));${TONE}
}`
  }));
  plate.position.set(0, SIGN_Y, 0.012); plate.renderOrder = 4; scene.add(plate);
  const studMat = new T.MeshStandardMaterial({ color: lin('#d7d9dc'), roughness: 0.3, metalness: 0.2 });
  const studGeo = new T.CylinderGeometry(0.011, 0.011, 0.03, 12); studGeo.rotateX(Math.PI / 2);
  const studs = [0, 1, 2, 3].map(() => { const m = new T.Mesh(studGeo, studMat); scene.add(m); return m; });

  /* light box */
  const boxBody = addBox(1, 1, 0.12, 0, SIGN_Y, 0.06, new T.MeshStandardMaterial({ color: lin('#2b2e33'), roughness: 0.42, metalness: 0.45 }));
  const BU = { uSdf: LU.uSdf, uRange: LU.uRange, uMap: { value: new T.Vector2(1, 1) }, uSize: { value: new T.Vector2(1, 1) }, uBg: { value: new T.Color() }, uInk: FX.uLed, uLit: FX.uLit, uBgGlow: { value: 0.1 }, uSunDir: LU.uSunDir, uSunCol: LU.uSunCol, uSkyCol: LU.uSkyCol, uGroundCol: LU.uGroundCol, uEnvTint: LU.uEnvTint };
  const boxFace = new T.Mesh(quad, new T.ShaderMaterial({
    uniforms: BU, extensions: { derivatives: true }, vertexShader: 'varying vec2 vUv; varying vec3 vW; void main(){ vUv = uv; vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }',
    fragmentShader: `uniform sampler2D uSdf; uniform float uRange, uLit, uBgGlow; uniform vec2 uMap, uSize; uniform vec3 uBg, uInk; varying vec2 vUv; varying vec3 vW;${LIGHTING}
void main(){
  vec2 p = vUv - 0.5, suv = p * uMap + 0.5;
  suv.y = 1.0 - suv.y;
  float d = -uRange;
  if (suv.x > 0.0 && suv.x < 1.0 && suv.y > 0.0 && suv.y < 1.0) d = (texture2D(uSdf, suv).r - 0.5) * 2.0 * uRange;
  float aa = max(fwidth(d) * 0.75, 0.03);
  float t = smoothstep(-aa, aa, d);
  vec2 q = (0.5 - abs(p)) * uSize;
  float edge = min(q.x, q.y);
  float fr = 1.0 - smoothstep(0.016, 0.02, edge);
  vec3 N = vec3(0.0, 0.0, 1.0), V = normalize(cameraPosition - vW);
  vec3 day = shade(mix(uBg, uInk * 0.9, t), vec2(0.0, 0.28), N, V);
  vec3 em = mix(uBg * uBgGlow, uInk * 2.4, t) * (0.8 + 0.2 * smoothstep(0.0, 0.14, edge)) * uLit;
  vec3 col = mix(day * (1.0 - 0.5 * uLit) + em, shade(vec3(0.05, 0.055, 0.06), vec2(0.6, 0.4), N, V), fr);
  gl_FragColor = vec4(col, 1.0);${TONE}
}`
  }));
  boxFace.position.set(0, SIGN_Y, 0.1215); scene.add(boxFace);

  /* dimension lines */
  const dimPos = new Float32Array(36), dimGeo = new T.BufferGeometry(); dimGeo.setAttribute('position', new T.BufferAttribute(dimPos, 3));
  const dimMat = new T.LineBasicMaterial({ color: lin('#f3d27e'), transparent: true, opacity: 0, depthTest: false, toneMapped: false });
  const dimLines = new T.LineSegments(dimGeo, dimMat); dimLines.frustumCulled = false; dimLines.renderOrder = 20; scene.add(dimLines);
  const dimAt = { w: new T.Vector3(), h: new T.Vector3() }, v3 = new T.Vector3();

  /* state */
  const C = {
    skyD: lin('#c4d9f2'), skyN: lin('#3a4a7c'), gndD: lin('#b9ad98'), gndN: lin('#15161c'), sunD: lin('#fff2dd'), sunN: lin('#8fa5da'),
    topD: new T.Color('#86b2e2'), topN: new T.Color('#060914'), horD: new T.Color('#dfe9f0'), horN: new T.Color('#161c33'),
    envD: new T.Color(1.05, 1.05, 1.05), envN: lin('#3a2a1c'), white: new T.Color(1, 1, 1)
  };
  const tmpA = new T.Color(), tmpB = new T.Color();
  let model = null, texS = null, texG = null;
  const tgt = { night: 1, width: 160, led: lin('#ffd9a0'), face: new T.Color(1, 1, 1), side: new T.Color(), dims: 0 };
  const cur = { night: 1, width: 160, lit: 0, face: new T.Color(1, 1, 1), side: new T.Color(), dims: 0, first: true };
  let ledOn = false, igT = -10;
  const rig = { yaw: RM ? -0.2 : 0.62, pitch: -0.12, zoom: 1, tyaw: -0.2, tpitch: -0.12, tzoom: 1, fit: 7, tfit: 7, sway: RM ? 0 : 1, tsway: RM ? 0 : 1, last: -1e9 };
  const size = { w: 1, h: 1 };

  function dataTex(d, w, h, mips) {
    const t = new T.DataTexture(d, w, h, GL2 ? T.RedFormat : T.LuminanceFormat, T.UnsignedByteType);
    t.unpackAlignment = 1; t.magFilter = T.LinearFilter;
    t.minFilter = mips && GL2 ? T.LinearMipmapLinearFilter : T.LinearFilter; t.generateMipmaps = !!(mips && GL2);
    t.needsUpdate = true; return t;
  }
  function setModel(f, type) {
    if (texS) texS.dispose(); if (texG) texG.dispose();
    texS = dataTex(f.shape.data, f.shape.w, f.shape.h, true); texG = dataTex(f.glow.data, f.glow.w, f.glow.h, false);
    model = { shape: f.shape, glow: f.glow, aspect: f.aspect, type };
    LU.uSdf.value = texS; LU.uTexel.value.set(1 / f.shape.w, 1 / f.shape.h);
    FX.uGlow.value = texG; FX.uPlane.value.set(f.glow.w / f.glow.inkH, f.glow.h / f.glow.inkH);
    const k = type === 'front' ? 0 : type === 'halo' ? 1 : type === 'neon' ? 2 : 3;
    FX.uKind.value = k; LU.uMode.value = Math.min(k, 2);
    LU.uRim.value = k === 0 ? 2.4 : 0;
    LU.uBevel.value = k === 0 ? 1.4 : k === 1 ? 2.4 : Math.min(3, f.shape.dmax * 0.6);
    LU.uBevelT.value = k === 0 ? 0.1 : k === 1 ? 0.34 : 0.7;
    LU.uTube.value = clamp(f.shape.dmax * 0.85, 3, 14);
    LU.uBloom.value = k === 0 ? 0.75 : k === 2 ? 1 : 0;
    letters.visible = k < 3; plate.visible = k === 2; studs.forEach(s => { s.visible = k === 2; });
    boxBody.visible = boxFace.visible = k === 3;
  }
  let curFacade = null, curDoorW = null;
  function setTargets(s) {
    const led = pick(LEDS, s.led), body = pick(BODIES, s.body);
    tgt.width = s.widthCm; tgt.led.copy(lin(led.hex));
    if (s.type === 'front') { tgt.face.copy(lin(led.hex)).lerp(C.white, 0.3); tgt.side.copy(lin(body.hex)); LU.uSideMR.value.set(body.metal, body.rough); }
    else if (s.type === 'halo') { tgt.face.copy(lin(body.hex)); tgt.side.copy(tgt.face); LU.uFaceMR.value.set(body.metal, body.rough); }
    else { tgt.face.copy(lin(led.hex)); tgt.side.copy(lin(body.sw)); }
    const c = lin(body.sw), lum = 0.2126 * c.r + 0.7152 * c.g + 0.0722 * c.b;
    BU.uBgGlow.value = 0.12 + 1.3 * lum;
    setWall(s.wall);
    if (s.facade !== curFacade || s.doorW !== curDoorW) { curFacade = s.facade; curDoorW = s.doorW; setStorefront(s.facade, s.doorW); }
    if (cur.first) { cur.first = false; cur.width = tgt.width; FX.uLed.value.copy(tgt.led); cur.face.copy(tgt.face); cur.side.copy(tgt.side); }
    fit();
  }
  function applyLayout(L) {
    const sh = model.shape, gf = model.glow, type = model.type;
    const mpp = L.tw / sh.inkW, pw = sh.w * mpp, ph = sh.h * mpp, mpg = L.th / gf.inkH, gw = gf.w * mpg, gh = gf.h * mpg;
    let depth = 0.12, stand = 0;
    if (type === 'front') { depth = Math.min(0.085, L.th * 0.5); stand = 0.006; }
    else if (type === 'halo') { depth = Math.min(0.034, L.th * 0.3); stand = Math.min(0.045, L.th * 0.3); }
    else if (type === 'neon') { depth = Math.min(0.014, L.th * 0.12); stand = 0.032; }
    letters.scale.set(pw, ph, 1);
    LU.uDepth.value = depth; LU.uStand.value = stand;
    LU.uRing.value = type === 'neon' ? 1000 : Math.max(3, 1.4 * depth / (NL - 1) * 1.9 / mpp + 1.5);
    glow.scale.set(gw, gh, 1); shadow.scale.set(gw, gh, 1);
    const zt = stand + depth;
    FX.uOff.value.set(0.818 * zt / gw, -1.364 * zt / gh);
    FX.uSoft.value = 0.03 + 0.5 * zt / L.th;
    FX.uBoxHalf.value.set(L.W / 2 / L.th, L.H / 2 / L.th);
    FX.uSize.value.set(gw, gh); FX.uTH.value = L.th;
    if (type === 'box') { boxBody.scale.set(L.W, L.H, 0.12); boxFace.scale.set(L.W - 0.004, L.H - 0.004, 1); BU.uMap.value.set(L.W / pw, L.H / ph); BU.uSize.value.set(L.W, L.H); }
    if (type === 'neon') {
      plate.scale.set(L.W, L.H, 1); PU.uSize.value.set(L.W, L.H);
      const sx = L.W / 2 - 0.045, sy = L.H / 2 - 0.045;
      studs.forEach((s, i) => s.position.set(i % 2 ? sx : -sx, SIGN_Y + (i < 2 ? sy : -sy), 0.016));
    }
    leds.forEach((p, i) => p.position.set((i - 1) * L.W * 0.33, SIGN_Y, 0.42 + L.H * 0.25));
    const gap = 0.07 + 0.08 * L.H, x0 = -L.W / 2, x1 = L.W / 2, y0 = SIGN_Y - L.H / 2, y1 = SIGN_Y + L.H / 2, yb = y0 - gap, xs = x0 - gap, z = 0.2, tk = 0.035;
    dimPos.set([x0, yb, z, x1, yb, z, x0, yb - tk, z, x0, yb + tk, z, x1, yb - tk, z, x1, yb + tk, z, xs, y0, z, xs, y1, z, xs - tk, y0, z, xs + tk, y0, z, xs - tk, y1, z, xs + tk, y1, z]);
    dimGeo.attributes.position.needsUpdate = true;
    dimAt.w.set(0, yb, z); dimAt.h.set(xs, SIGN_Y, z);
    return L;
  }
  function fit() {
    if (!model) return;
    const L = layout(model.type, tgt.width, model.aspect), w = size.w, h = size.h;
    const a = lx.getBoundingClientRect(), top = nameEl.getBoundingClientRect().bottom - a.top, bot = dock.getBoundingClientRect().top - a.top;
    const fh = Math.max(140, bot - top), portrait = w < h * 0.85;
    cam.fov = portrait ? 36 : 30; cam.aspect = w / h;
    const tv = Math.tan(cam.fov * Math.PI / 360), th = tv * w / h;
    const frac = portrait ? 0.8 : clamp(0.5 - (w / h - 1) * 0.1, 0.3, 0.5);
    rig.tfit = Math.max((Math.max(L.W, 1.1) / frac) / (2 * th), (L.H / 0.4) / (2 * tv * fh / h), 2.2);
    cam.setViewOffset(w, h, 0, Math.round(h / 2 - (top + fh * 0.4)), w, h);
  }
  function resize() {
    const r = lx.getBoundingClientRect(); size.w = Math.max(1, Math.round(r.width)); size.h = Math.max(1, Math.round(r.height));
    renderer.setSize(size.w, size.h, false); fit();
  }
  const flick = s => { if (RM) return 1; const a = s / 0.9; return a >= 1 ? 1 : a < 0.1 ? 0 : a < 0.16 ? 1 : a < 0.26 ? 0.15 : a < 0.36 ? 0.9 : a < 0.44 ? 0.35 : a < 0.62 ? 1 : a < 0.68 ? 0.6 : 1; };

  /* pointer orbit */
  const pts = new Map(); let pinch0 = 0, zoom0 = 1;
  const touched = () => { rig.last = performance.now(); rig.tsway = 0; hint.classList.add('off'); };
  const span = () => { const p = Array.from(pts.values()); return Math.hypot(p[0].x - p[1].x, p[0].y - p[1].y); };
  stage.addEventListener('pointerdown', e => { try { stage.setPointerCapture(e.pointerId); } catch (x) {} pts.set(e.pointerId, { x: e.clientX, y: e.clientY }); if (pts.size === 2) { pinch0 = span(); zoom0 = rig.tzoom; } stage.classList.add('drag'); touched(); });
  stage.addEventListener('pointermove', e => {
    const p = pts.get(e.pointerId); if (!p) return;
    const dx = e.clientX - p.x, dy = e.clientY - p.y; p.x = e.clientX; p.y = e.clientY;
    if (pts.size === 1) { rig.tyaw = clamp(rig.tyaw - dx * 0.0052, -1, 1); rig.tpitch = clamp(rig.tpitch + dy * 0.004, -0.34, 0.42); }
    else if (pts.size === 2 && pinch0 > 0) rig.tzoom = clamp(zoom0 * pinch0 / Math.max(span(), 1), 0.5, 2.4);
    touched();
  });
  const lift = e => { pts.delete(e.pointerId); if (pts.size < 2) pinch0 = 0; if (!pts.size) stage.classList.remove('drag'); };
  stage.addEventListener('pointerup', lift); stage.addEventListener('pointercancel', lift);
  stage.addEventListener('wheel', e => { e.preventDefault(); rig.tzoom = clamp(rig.tzoom * Math.exp(e.deltaY * 0.0012), 0.5, 2.4); touched(); }, { passive: false });
  stage.addEventListener('keydown', e => {
    const k = e.key; let hit = true;
    if (k === 'ArrowLeft') rig.tyaw = clamp(rig.tyaw + 0.12, -1, 1); else if (k === 'ArrowRight') rig.tyaw = clamp(rig.tyaw - 0.12, -1, 1);
    else if (k === 'ArrowUp') rig.tpitch = clamp(rig.tpitch + 0.06, -0.34, 0.42); else if (k === 'ArrowDown') rig.tpitch = clamp(rig.tpitch - 0.06, -0.34, 0.42);
    else if (k === '+' || k === '=') rig.tzoom = clamp(rig.tzoom * 0.88, 0.5, 2.4); else if (k === '-') rig.tzoom = clamp(rig.tzoom * 1.14, 0.5, 2.4); else hit = false;
    if (hit) { e.preventDefault(); touched(); }
  });

  /* frame loop */
  let tPrev = performance.now(), slow = 0;
  function frame(now) {
    requestAnimationFrame(frame);
    if (document.hidden || !model) { tPrev = now; return; }
    const raw = (now - tPrev) / 1000, dt = clamp(raw, 0.001, 0.1), t = now / 1000; tPrev = now;
    if (raw > 0.034 && raw < 0.3) { if (++slow > 50 && dpr > 1) { dpr = Math.max(1, dpr - 0.25); renderer.setPixelRatio(dpr); renderer.setSize(size.w, size.h, false); slow = 0; } } else if (slow > 0) slow--;
    const k = r => RM ? 1 : 1 - Math.exp(-dt * r);
    cur.night += (tgt.night - cur.night) * k(2.6);
    const n = cur.night, day = 1 - n;
    if (n > 0.5 && !ledOn) { ledOn = true; igT = t; } else if (n < 0.45 && ledOn) ledOn = false;
    cur.lit += ((ledOn ? flick(t - igT) : 0) - cur.lit) * (RM ? 1 : 1 - Math.exp(-dt * 30));
    cur.width += (tgt.width - cur.width) * k(7);
    FX.uLed.value.lerp(tgt.led, k(9)); cur.face.lerp(tgt.face, k(9)); cur.side.lerp(tgt.side, k(9));
    cur.dims += (tgt.dims - cur.dims) * k(8);

    hemi.color.copy(C.skyD).lerp(C.skyN, n); hemi.groundColor.copy(C.gndD).lerp(C.gndN, n); hemi.intensity = lerp(0.66, 0.2, n);
    sun.color.copy(C.sunD).lerp(C.sunN, n); sun.intensity = lerp(0.9, 0.06, n);
    tmpA.copy(C.topD).lerp(C.topN, n); skyU.uTop.value.copy(tmpA).convertSRGBToLinear();
    tmpB.copy(C.horD).lerp(C.horN, n); skyU.uHor.value.copy(tmpB).convertSRGBToLinear(); scene.fog.color.copy(tmpB);
    renderer.toneMappingExposure = lerp(1.0, 1.12, n);
    glassMat.emissiveIntensity = 0.5 * ease(n); shadeMat.opacity = 0.34 * day + 0.1;
    LU.uSkyCol.value.copy(hemi.color).multiplyScalar(hemi.intensity);
    LU.uGroundCol.value.copy(hemi.groundColor).multiplyScalar(hemi.intensity);
    LU.uSunCol.value.copy(sun.color).multiplyScalar(sun.intensity);
    LU.uEnvTint.value.copy(C.envD).lerp(C.envN, n).add(tmpA.copy(FX.uLed.value).multiplyScalar(0.22 * cur.lit * n));
    LU.uLit.value = cur.lit; LU.uFace.value.copy(cur.face); LU.uSide.value.copy(cur.side); BU.uBg.value.copy(cur.side);
    FX.uLit.value = cur.lit; FX.uNight.value = n; FX.uDay.value = day;

    const L = applyLayout(layout(model.type, cur.width, model.aspect));
    const power = 0.17 * cur.lit * (0.4 + 0.6 * n) * (model.type === 'halo' ? 1.3 : model.type === 'neon' ? 0.85 : 1) * (0.75 + 0.35 * clamp(L.W / 2, 0, 1.6));
    leds.forEach(p => { p.color.copy(FX.uLed.value); p.intensity = power; });

    if (!RM && now - rig.last > 9000) rig.tsway = 1;
    rig.sway += (rig.tsway - rig.sway) * k(1.5);
    rig.yaw += (rig.tyaw - rig.yaw) * k(rig.last < 0 ? 1.6 : 7); rig.pitch += (rig.tpitch - rig.pitch) * k(7);
    rig.zoom += (rig.tzoom - rig.zoom) * k(7); rig.fit += (rig.tfit - rig.fit) * k(4);
    const yaw = rig.yaw + rig.sway * 0.17 * Math.sin(t * 0.33), pitch = rig.pitch + rig.sway * 0.03 * Math.sin(t * 0.21 + 1), R = rig.fit * rig.zoom;
    cam.position.set(R * Math.sin(yaw) * Math.cos(pitch), Math.max(0.5, SIGN_Y + R * Math.sin(pitch)), R * Math.cos(yaw) * Math.cos(pitch));
    cam.lookAt(0, SIGN_Y, 0);
    dimMat.opacity = cur.dims; dimLines.visible = cur.dims > 0.01;
    renderer.render(scene, cam);
    if (cur.dims > 0.01) {
      for (const [el, p, ox, oy] of [[dimW, dimAt.w, 0, 15], [dimH, dimAt.h, -30, 0]]) {
        v3.copy(p).project(cam);
        el.style.transform = 'translate(' + clamp((v3.x * 0.5 + 0.5) * size.w + ox, 38, size.w - 38).toFixed(1) + 'px,' + ((-v3.y * 0.5 + 0.5) * size.h + oy).toFixed(1) + 'px) translate(-50%,-50%)';
      }
    }
  }
  resize();
  requestAnimationFrame(frame);
  return {
    setModel, setTargets, resize,
    setNight(v) { tgt.night = v ? 1 : 0; },
    ignite() { igT = performance.now() / 1000; },
    showDims(on) { tgt.dims = on ? 1 : 0; dimW.classList.toggle('on', !!on); dimH.classList.toggle('on', !!on); },
    rig, cur
  };
}

function flatView() {
  const el = $('#flat'); el.hidden = false; stage.hidden = true; hint.hidden = true;
  return { flat: true, setModel() {}, setTargets() { el.firstElementChild.textContent = textOf(); el.firstElementChild.style.fontFamily = pick(FONTS, st.font).css + ',"Cairo",sans-serif'; }, resize() {}, setNight() {}, ignite() {}, showDims() {} };
}
let view = null;
try { view = createView(); } catch (e) { view = null; }
if (!view) view = flatView();

/* ================= interface ================= */
const nameIn = $('#nameIn'), nameClr = $('#nameClr'), rng = $('#szRange');
const priceNum = $('#priceNum'), priceSub = $('#priceSub'), cta = $('#cta'), hintTx = $('#hintTx');
let fields = null, L = null;

function group(host, list, key, cls, html, after) {
  list.forEach(o => { const b = document.createElement('button'); b.type = 'button'; b.className = cls; b.dataset.id = o.id; b.setAttribute('aria-pressed', 'false'); b.innerHTML = html(o); if (cls === 'sw') b.setAttribute('aria-label', o.label); host.appendChild(b); });
  host.addEventListener('click', e => { const b = e.target.closest('button[data-id]'); if (!b || st[key] === b.dataset.id) return; st[key] = b.dataset.id; sync(); after(); });
}
group($('#typeStrip'), TYPES, 'type', 'opt', o => '<span class="gl gl-' + o.id + '">ض</span><b>' + o.label + '</b><small>' + o.sub + '</small>', () => { build(); view.ignite(); });
group($('#fontStrip'), FONTS, 'font', 'opt font', o => '<span class="gl" style="font-family:' + o.css.replace(/"/g, "'") + ',Cairo,sans-serif;font-weight:' + o.w + '">أبجد</span><b>' + o.label + '</b>', () => build());
group($('#ledStrip'), LEDS, 'led', 'sw', o => '<i style="--c:' + o.hex + '"></i>', () => refresh());
group($('#bodyStrip'), BODIES, 'body', 'sw', o => '<i style="--c:' + o.sw + '"></i>', () => refresh());
group($('#wallStrip'), WALLS, 'wall', 'opt wall', o => '<span class="th" style="background:' + o.th + '"></span><b>' + o.label + '</b>', () => refresh());
const SHOP_ICON = { glass: '🪟', trad: '🚪', full: '🏢' };
group($('#shopStrip'), FACADES, 'facade', 'pill', o => '<span>' + SHOP_ICON[o.id] + '</span>' + o.label, () => refresh());
IDEAS.forEach((o, i) => { const b = document.createElement('button'); b.type = 'button'; b.textContent = o.text; b.dataset.i = i; $('#ideas').appendChild(b); });
$('#ideas').addEventListener('click', e => { const b = e.target.closest('button[data-i]'); if (!b) return; Object.assign(st, IDEAS[+b.dataset.i]); nameIn.value = st.text; sync(); build(); view.ignite(); });

function sync() {
  for (const [id, key] of [['typeStrip', 'type'], ['fontStrip', 'font'], ['ledStrip', 'led'], ['bodyStrip', 'body'], ['wallStrip', 'wall'], ['shopStrip', 'facade']])
    for (const b of $('#' + id).children) b.setAttribute('aria-pressed', String(b.dataset.id === st[key]));
  const ty = pick(TYPES, st.type);
  $('#bodyRow').hidden = !ty.body; $('#bodyLab').textContent = ty.body;
  lx.style.setProperty('--led', pick(LEDS, st.led).hex);
  nameClr.hidden = !st.text;
}
function refresh() {
  if (!fields) return;
  const mx = maxWidthCm(st.type, fields.aspect);
  const mn = Math.min(40, mx);
  rng.min = mn; rng.max = mx; st.widthCm = clamp(st.widthCm, mn, mx);
  rng.value = st.widthCm; rng.style.setProperty('--p', ((st.widthCm - mn) / Math.max(1, mx - mn) * 100).toFixed(1) + '%');
  L = layout(st.type, st.widthCm, fields.aspect);
  const hc = Math.max(1, Math.round(L.H * 100));
  $('#szW').textContent = st.widthCm; $('#szH').textContent = hc;
  dimW.textContent = st.widthCm + ' سم'; dimH.textContent = hc + ' سم';
  priceSub.textContent = st.widthCm + ' × ' + hc + ' سم';
  setPrice(L.price);
  const ty = pick(TYPES, st.type);
  const lines = ['مرحبا LuxSign، بدي أطلب قارمة:', 'النص: ' + textOf(), 'النوع: ' + ty.label, 'الخط: ' + pick(FONTS, st.font).label, 'لون الإضاءة: ' + pick(LEDS, st.led).label];
  if (ty.body) lines.push(ty.body + ': ' + pick(BODIES, st.body).label);
  lines.push('المقاس: ' + st.widthCm + ' × ' + hc + ' سم', 'السعر التقريبي: ' + L.price + ' ₪');
  cta.href = 'https://wa.me/' + WHATSAPP + '?text=' + encodeURIComponent(lines.join('\n'));
  view.setTargets(st);
  save();
}
let shown = 0, tw = 0;
function setPrice(v) {
  cancelAnimationFrame(tw);
  if (RM || !shown) { shown = v; priceNum.textContent = v; return; }
  const from = shown, t0 = performance.now();
  const step = now => { const a = clamp((now - t0) / 320, 0, 1); shown = Math.round(lerp(from, v, ease(a))); priceNum.textContent = shown; if (a < 1) tw = requestAnimationFrame(step); };
  tw = requestAnimationFrame(step);
}
let token = 0;
function build() {
  const my = ++token, f = pick(FONTS, st.font), text = textOf(), spec = (st.type === 'neon' ? f.wn : f.w) + ' 48px ' + f.css;
  const go = () => { if (my !== token) return; fields = buildFields(text, f, st.type); view.setModel(fields, st.type); refresh(); };
  let ready = true;
  try { ready = !document.fonts || document.fonts.check(spec, text); } catch (e) {}
  if (ready) { go(); return; }
  if (fields) go();                                   // keep the sign responsive, then swap the face in
  Promise.race([document.fonts.load(spec, text), new Promise(r => setTimeout(r, 1500))]).then(go, go);
}
let pend = 0;
nameIn.addEventListener('input', () => { st.text = nameIn.value.slice(0, 26); nameClr.hidden = !st.text; hintTx.textContent = 'اسحب لتدوير القارمة'; if (!pend) pend = requestAnimationFrame(() => { pend = 0; build(); }); });
nameIn.addEventListener('keydown', e => { if (e.key === 'Enter') nameIn.blur(); });
nameClr.addEventListener('click', () => { st.text = ''; nameIn.value = ''; nameClr.hidden = true; build(); nameIn.focus(); });

let dimT = 0;
const sizeTabOpen = () => $('#t-size').getAttribute('aria-selected') === 'true';
const flashDims = () => { view.showDims(true); clearTimeout(dimT); if (!sizeTabOpen()) dimT = setTimeout(() => view.showDims(false), 2200); };
rng.addEventListener('input', () => { st.widthCm = +rng.value; refresh(); flashDims(); });
const stepBy = d => { st.widthCm = clamp(st.widthCm + d, +rng.min, +rng.max); refresh(); flashDims(); };
$('#szMinus').addEventListener('click', () => stepBy(-5)); $('#szPlus').addEventListener('click', () => stepBy(5));

const doorRng = $('#doorRange'), doorWEl = $('#doorW');
doorRng.value = st.doorW; doorWEl.textContent = st.doorW.toFixed(1);
doorRng.addEventListener('input', () => { st.doorW = +doorRng.value; doorWEl.textContent = st.doorW.toFixed(1); refresh(); });

$('#tabs').addEventListener('click', e => {
  const b = e.target.closest('button[role=tab]'); if (!b) return;
  for (const t of $('#tabs').children) { const on = t === b; t.setAttribute('aria-selected', String(on)); $('#' + t.getAttribute('aria-controls')).hidden = !on; }
  clearTimeout(dimT); view.showDims(sizeTabOpen());
});
$('#sky').addEventListener('click', e => {
  const b = e.target.closest('button[data-night]'); if (!b) return;
  for (const t of $('#sky').children) t.setAttribute('aria-pressed', String(t === b));
  view.setNight(b.dataset.night === '1');
});
cta.addEventListener('click', e => {
  if (st.text.trim()) return;
  e.preventDefault(); hintTx.textContent = 'اكتب اسم محلك أولاً'; hint.classList.remove('off'); nameIn.focus();
});

const onSize = () => { lx.style.setProperty('--dock-h', Math.round(dock.getBoundingClientRect().height + (window.innerWidth >= 860 ? 18 : 0)) + 'px'); view.resize(); };
if (window.ResizeObserver) { const ro = new ResizeObserver(onSize); ro.observe(lx); ro.observe(dock); }
window.addEventListener('resize', onSize);

nameIn.value = st.text;
sync(); onSize(); build();
if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { if (fields) build(); });
window.lxStudio = { st, view, build, refresh, sync };
})();
