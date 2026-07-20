// ── رسالة الواتساب الافتراضية
export const waMsg = (productName, size, price) => {
    const sizeStr = size ? `\n- الحجم: ${size}` : '';
    const priceStr = price ? `\n- السعر: ${price}₪` : '';
    return `مرحباً LuxSign 141 👋\nأريد الاستفسار عن:\n- المنتج: ${productName}${sizeStr}${priceStr}\n\nبانتظار ردّكم 🙏`;
};

// رقم الواتساب صار قابل للتعديل من لوحة الإدارة (/admin/settings) — بيوصل
// لكل صفحة عبر siteSettings المشتركة (Inertia)، مش قيمة ثابتة بالكود.
export const WA_LINK = (msg, number) => `https://wa.me/${number}?text=${encodeURIComponent(msg)}`;
