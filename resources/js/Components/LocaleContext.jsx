import { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '../i18n';

const STORAGE_KEY = 'luxsign_locale';
const LocaleContext = createContext(null);

function detectLocale() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (['ar', 'he', 'en'].includes(saved)) return saved;
    const lang = (navigator.language || '').slice(0, 2).toLowerCase();
    if (lang === 'he') return 'he';
    if (lang === 'en') return 'en';
    return 'ar';
}

export function LocaleProvider({ children }) {
    const [locale, setLocaleState] = useState(detectLocale);

    useEffect(() => {
        const dict = translations[locale];
        document.documentElement.dir = dict.dir;
        document.documentElement.lang = locale;
    }, [locale]);

    function setLocale(next) {
        localStorage.setItem(STORAGE_KEY, next);
        setLocaleState(next);
    }

    const dict = translations[locale];

    function t(key) {
        return dict[key] ?? translations.ar[key] ?? key;
    }

    return (
        <LocaleContext.Provider value={{ locale, setLocale, t, dict }}>
            {children}
        </LocaleContext.Provider>
    );
}

export function useLocale() {
    const ctx = useContext(LocaleContext);
    if (!ctx) throw new Error('useLocale must be used within LocaleProvider');
    return ctx;
}
