import { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';

export default function Register() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });
    const [showPassword, setShowPassword] = useState(false);

    function submit(e) {
        e.preventDefault();
        post('/register');
    }

    return (
        <>
            <Head title="إنشاء حساب" />
            <div className="min-h-screen bg-gradient-to-br from-ink to-ink-2 flex items-center justify-center p-4 font-cairo">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8">
                    {/* Logo */}
                    <div className="text-center mb-8">
                        <h1 className="text-2xl font-black text-ink">
                            Lux<span className="text-gold">Sign</span>
                        </h1>
                        <p className="text-xs text-muted mt-1 tracking-widest">إنشاء حساب جديد</p>
                    </div>

                    <form onSubmit={submit} className="space-y-4">
                        <div>
                            <label className="text-xs font-bold tracking-widest uppercase text-muted block mb-1.5">الاسم الكامل</label>
                            <input
                                type="text"
                                value={data.name}
                                onChange={e => setData('name', e.target.value)}
                                className={`w-full px-4 py-3 border-2 rounded-xl text-sm text-ink bg-cream outline-none transition-colors font-cairo
                                    ${errors.name ? 'border-red-400' : 'border-cream-3 focus:border-gold'}`}
                                placeholder="اسمك"
                                autoComplete="name"
                            />
                            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                        </div>

                        <div>
                            <label className="text-xs font-bold tracking-widest uppercase text-muted block mb-1.5">البريد الإلكتروني</label>
                            <input
                                type="email"
                                value={data.email}
                                onChange={e => setData('email', e.target.value)}
                                className={`w-full px-4 py-3 border-2 rounded-xl text-sm text-ink bg-cream outline-none transition-colors font-cairo
                                    ${errors.email ? 'border-red-400' : 'border-cream-3 focus:border-gold'}`}
                                placeholder="you@example.com"
                                autoComplete="username"
                            />
                            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                        </div>

                        <div>
                            <label className="text-xs font-bold tracking-widest uppercase text-muted block mb-1.5">كلمة المرور</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={data.password}
                                    onChange={e => setData('password', e.target.value)}
                                    className={`w-full px-4 py-3 pe-11 border-2 rounded-xl text-sm text-ink bg-cream outline-none transition-colors font-cairo
                                        ${errors.password ? 'border-red-400' : 'border-cream-3 focus:border-gold'}`}
                                    placeholder="8 أحرف على الأقل"
                                    autoComplete="new-password"
                                />
                                <button type="button" onClick={() => setShowPassword(s => !s)} tabIndex={-1}
                                    className="absolute inset-y-0 end-0 px-3 flex items-center text-muted hover:text-gold transition-colors"
                                    aria-label={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}>
                                    {showPassword ? '🙈' : '👁️'}
                                </button>
                            </div>
                            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                        </div>

                        <div>
                            <label className="text-xs font-bold tracking-widest uppercase text-muted block mb-1.5">تأكيد كلمة المرور</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={data.password_confirmation}
                                    onChange={e => setData('password_confirmation', e.target.value)}
                                    className="w-full px-4 py-3 pe-11 border-2 border-cream-3 focus:border-gold rounded-xl text-sm text-ink bg-cream outline-none transition-colors font-cairo"
                                    placeholder="أعد كتابة كلمة المرور"
                                    autoComplete="new-password"
                                />
                                <button type="button" onClick={() => setShowPassword(s => !s)} tabIndex={-1}
                                    className="absolute inset-y-0 end-0 px-3 flex items-center text-muted hover:text-gold transition-colors"
                                    aria-label={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}>
                                    {showPassword ? '🙈' : '👁️'}
                                </button>
                            </div>
                        </div>

                        <button type="submit" disabled={processing}
                            className="w-full bg-ink text-white py-3 rounded-xl font-black text-sm hover:bg-gold transition-colors disabled:opacity-60 mt-2">
                            {processing ? '⏳ جاري الإنشاء...' : 'إنشاء حساب →'}
                        </button>
                    </form>

                    <div className="mt-6 text-center space-y-2">
                        <a href="/login" className="block text-xs text-muted hover:text-gold transition-colors">عندك حساب؟ سجّل دخول</a>
                        <a href="/" className="block text-xs text-muted hover:text-gold transition-colors">← العودة للمتجر</a>
                    </div>
                </div>
            </div>
        </>
    );
}
