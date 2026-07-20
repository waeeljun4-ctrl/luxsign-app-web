import { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';

export default function Login() {
    const { data, setData, post, processing, errors } = useForm({
        login: '',
        password: '',
        remember: false,
    });
    const [showPassword, setShowPassword] = useState(false);

    function submit(e) {
        e.preventDefault();
        post('/login');
    }

    return (
        <>
            <Head title="تسجيل الدخول" />
            <div className="min-h-screen bg-gradient-to-br from-ink to-ink-2 flex items-center justify-center p-4 font-cairo">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8">
                    {/* Logo */}
                    <div className="text-center mb-8">
                        <h1 className="text-2xl font-black text-ink">
                            Lux<span className="text-gold">Sign</span>
                        </h1>
                        <p className="text-xs text-muted mt-1 tracking-widest">لوحة الإدارة</p>
                    </div>

                    <form onSubmit={submit} className="space-y-4">
                        <div>
                            <label className="text-xs font-bold tracking-widest uppercase text-muted block mb-1.5">رقم الهاتف أو البريد الإلكتروني</label>
                            <input
                                type="text"
                                value={data.login}
                                onChange={e => setData('login', e.target.value)}
                                className={`w-full px-4 py-3 border-2 rounded-xl text-sm text-ink bg-cream outline-none transition-colors font-cairo
                                    ${errors.login ? 'border-red-400' : 'border-cream-3 focus:border-gold'}`}
                                placeholder="0568112218"
                                autoComplete="username"
                            />
                            {errors.login && <p className="text-red-500 text-xs mt-1">{errors.login}</p>}
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
                                    placeholder="••••••••"
                                    autoComplete="current-password"
                                />
                                <button type="button" onClick={() => setShowPassword(s => !s)} tabIndex={-1}
                                    className="absolute inset-y-0 end-0 px-3 flex items-center text-muted hover:text-gold transition-colors"
                                    aria-label={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}>
                                    {showPassword ? '🙈' : '👁️'}
                                </button>
                            </div>
                            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                        </div>

                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={data.remember} onChange={e => setData('remember', e.target.checked)}
                                className="accent-gold w-4 h-4 rounded" />
                            <span className="text-sm text-muted">تذكرني</span>
                        </label>

                        <button type="submit" disabled={processing}
                            className="w-full bg-ink text-white py-3 rounded-xl font-black text-sm hover:bg-gold transition-colors disabled:opacity-60 mt-2">
                            {processing ? '⏳ جاري الدخول...' : 'دخول →'}
                        </button>
                    </form>

                    <div className="mt-6 text-center space-y-2">
                        <a href="/register" className="block text-xs text-muted hover:text-gold transition-colors">ما عندك حساب؟ سجّل الآن</a>
                        <a href="/" className="block text-xs text-muted hover:text-gold transition-colors">← العودة للمتجر</a>
                    </div>
                </div>
            </div>
        </>
    );
}
