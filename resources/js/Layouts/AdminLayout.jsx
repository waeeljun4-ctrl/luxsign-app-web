import { useState } from 'react';
import { Link, usePage, router } from '@inertiajs/react';

const navItems = [
    { href: '/admin',              label: 'لوحة التحكم', icon: '📊' },
    { href: '/admin/products',     label: 'المنتجات',    icon: '📦' },
    { href: '/admin/categories',   label: 'الأصناف',     icon: '🗂️' },
    { href: '/admin/hero-slides',  label: 'السلايدر',    icon: '🎞️' },
    { href: '/admin/pricing',      label: 'التسعير',     icon: '💰' },
    { href: '/admin/coupons',      label: 'الكوبونات',   icon: '🎟️' },
    { href: '/admin/discounts',    label: 'حملات الخصم', icon: '🏷️' },
    { href: '/admin/inventory',    label: 'المخزن',      icon: '🏬' },
    { href: '/admin/courier-companies', label: 'شركات التوصيل', icon: '🚚' },
    { href: '/admin/orders',       label: 'الطلبات',     icon: '🛒' },
    { href: '/admin/archive',      label: 'الأرشيف',     icon: '🗄️' },
    { href: '/admin/users',        label: 'المستخدمون',  icon: '👥' },
    { href: '/admin/settings',     label: 'التواصل الاجتماعي', icon: '📱' },
    { href: '/admin/profile',      label: 'الحساب',      icon: '⚙️' },
];

export default function AdminLayout({ children, title }) {
    const { url } = usePage();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    function logout() {
        router.post('/logout');
    }

    return (
        <div className="min-h-screen bg-cream-2 font-cairo flex">

            {/* Overlay (mobile only) */}
            {sidebarOpen && (
                <div className="fixed inset-0 bg-black/40 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />
            )}

            {/* Sidebar */}
            <aside className={`w-56 bg-ink flex flex-col shrink-0 fixed top-0 bottom-0 right-0 z-30
                transition-transform duration-300 lg:translate-x-0
                ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="p-5 border-b border-white/10">
                    <p className="text-gold font-black text-lg">Lux<span className="text-white">Sign</span></p>
                    <p className="text-white/30 text-xs mt-0.5 tracking-widest">لوحة الإدارة</p>
                </div>
                <nav className="flex-1 p-3">
                    {navItems.map(item => (
                        <Link key={item.href} href={item.href} onClick={() => setSidebarOpen(false)}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold text-sm mb-1 transition-colors
                                ${url.startsWith(item.href) ? 'bg-gold text-white' : 'text-white/50 hover:bg-white/5 hover:text-white'}`}>
                            <span>{item.icon}</span>
                            {item.label}
                        </Link>
                    ))}
                </nav>
                <div className="p-3 border-t border-white/10">
                    <Link href="/" className="flex items-center gap-2 text-white/40 text-xs hover:text-white transition-colors px-3 py-2 mb-1">
                        🏪 عرض المتجر
                    </Link>
                    <button onClick={logout}
                        className="w-full flex items-center gap-2 text-white/40 text-xs hover:text-red-400 transition-colors px-3 py-2 text-right">
                        🚪 تسجيل الخروج
                    </button>
                </div>
            </aside>

            {/* Main */}
            <main className="flex-1 lg:mr-56 flex flex-col min-h-screen">
                {/* Header */}
                <header className="bg-white border-b border-cream-3 px-6 py-4 sticky top-0 z-20 flex items-center gap-3">
                    <button onClick={() => setSidebarOpen(true)}
                        className="lg:hidden shrink-0 text-ink text-2xl leading-none" aria-label="فتح القائمة">
                        ☰
                    </button>
                    <h1 className="font-black text-ink text-lg">{title}</h1>
                </header>

                {/* Flash messages */}
                <FlashMessages />

                {/* Content */}
                <div className="flex-1 p-6">
                    {children}
                </div>
            </main>
        </div>
    );
}

function FlashMessages() {
    const { flash } = usePage().props;
    if (!flash?.success && !flash?.error) return null;
    return (
        <div className={`mx-6 mt-4 px-4 py-3 rounded-xl font-bold text-sm ${flash.success ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {flash.success || flash.error}
        </div>
    );
}
