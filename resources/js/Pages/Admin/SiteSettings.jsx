import { Head, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function SiteSettings({ settings }) {
    const { data, setData, post, processing, errors } = useForm({
        whatsapp_number: settings.whatsapp_number ?? '',
        instagram_url: settings.instagram_url ?? '',
        tiktok_url: settings.tiktok_url ?? '',
        facebook_url: settings.facebook_url ?? '',
    });

    function submit(e) {
        e.preventDefault();
        post('/admin/settings');
    }

    return (
        <AdminLayout title="التواصل الاجتماعي">
            <Head title="التواصل الاجتماعي" />

            <form onSubmit={submit} className="max-w-lg space-y-4">
                <div className="bg-white rounded-2xl border border-cream-3 p-5 space-y-4">
                    <div>
                        <label className="text-xs font-bold text-muted block mb-1">
                            رقم الواتساب (بدون + وبدون مسافات، مثال: 972568082747)
                        </label>
                        <input value={data.whatsapp_number} onChange={e => setData('whatsapp_number', e.target.value)}
                            placeholder="972500000000"
                            className="w-full px-3 py-2 border-2 border-cream-3 rounded-xl text-sm focus:border-gold outline-none" dir="ltr" />
                        {errors.whatsapp_number && <p className="text-red-500 text-xs mt-1">{errors.whatsapp_number}</p>}
                        <p className="text-xs text-muted mt-1">هذا الرقم يُستخدم بكل أزرار "تواصل عبر واتساب" وطلبات السلة بالموقع.</p>
                    </div>

                    <div>
                        <label className="text-xs font-bold text-muted block mb-1">رابط إنستغرام</label>
                        <input value={data.instagram_url} onChange={e => setData('instagram_url', e.target.value)}
                            placeholder="https://www.instagram.com/your_page"
                            className="w-full px-3 py-2 border-2 border-cream-3 rounded-xl text-sm focus:border-gold outline-none" dir="ltr" />
                        {errors.instagram_url && <p className="text-red-500 text-xs mt-1">{errors.instagram_url}</p>}
                    </div>

                    <div>
                        <label className="text-xs font-bold text-muted block mb-1">رابط تيك توك</label>
                        <input value={data.tiktok_url} onChange={e => setData('tiktok_url', e.target.value)}
                            placeholder="https://www.tiktok.com/@your_page"
                            className="w-full px-3 py-2 border-2 border-cream-3 rounded-xl text-sm focus:border-gold outline-none" dir="ltr" />
                        {errors.tiktok_url && <p className="text-red-500 text-xs mt-1">{errors.tiktok_url}</p>}
                    </div>

                    <div>
                        <label className="text-xs font-bold text-muted block mb-1">رابط صفحة فيسبوك</label>
                        <input value={data.facebook_url} onChange={e => setData('facebook_url', e.target.value)}
                            placeholder="https://www.facebook.com/your_page"
                            className="w-full px-3 py-2 border-2 border-cream-3 rounded-xl text-sm focus:border-gold outline-none" dir="ltr" />
                        {errors.facebook_url && <p className="text-red-500 text-xs mt-1">{errors.facebook_url}</p>}
                    </div>
                </div>

                <button disabled={processing} className="bg-ink text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-gold transition-colors">
                    حفظ
                </button>
            </form>
        </AdminLayout>
    );
}
