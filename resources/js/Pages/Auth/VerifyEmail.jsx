import { Head, useForm, usePage } from '@inertiajs/react';

export default function VerifyEmail() {
    const { flash } = usePage().props;
    const { post, processing } = useForm();

    function resend(e) {
        e.preventDefault();
        post('/email/verification-notification');
    }

    return (
        <>
            <Head title="فعّل بريدك الإلكتروني" />
            <div className="min-h-screen bg-gradient-to-br from-ink to-ink-2 flex items-center justify-center p-4 font-cairo">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8 text-center">
                    <div className="text-4xl mb-3">📧</div>
                    <h1 className="text-xl font-black text-ink mb-2">فعّل بريدك الإلكتروني</h1>
                    <p className="text-sm text-muted leading-relaxed mb-6">
                        بعتنالك رابط تفعيل على إيميلك. افتح الرسالة واضغط على الرابط عشان تكمّل التسجيل.
                    </p>

                    {flash?.success && (
                        <p className="text-green-600 text-xs font-bold bg-green-50 rounded-xl py-2.5 mb-4">{flash.success}</p>
                    )}

                    <form onSubmit={resend}>
                        <button type="submit" disabled={processing}
                            className="w-full bg-ink text-white py-3 rounded-xl font-black text-sm hover:bg-gold transition-colors disabled:opacity-60">
                            {processing ? '⏳ جاري الإرسال...' : 'إعادة إرسال رابط التفعيل'}
                        </button>
                    </form>

                    <a href="/" className="block mt-5 text-xs text-muted hover:text-gold transition-colors">← العودة للمتجر</a>
                </div>
            </div>
        </>
    );
}
