import { createI18n } from 'vue-i18n';

export const i18n = createI18n({
    locale: import.meta.env.VITE_DEFAULT_LOCALE,
    fallbackLocale: 'en',
    messages: {},
});

const loadedLanguages = new Set();
const supportedLocales = new Set(['en', 'es', 'fa', 'fr', 'ru', 'ua', 'zh']);

export async function loadLocaleMessages(locale: string) {
    if (!supportedLocales.has(locale)) {
        console.warn(`Unsupported locale: ${locale}. Falling back to 'en'.`);
        locale = 'en';
    }

    if (loadedLanguages.has(locale)) {
        i18n.global.locale.value = locale;
        return;
    }

    try {
        const response = await fetch(`https://raw.githubusercontent.com/swapcoffee/i18n/main/${locale}.json`);
        const messages = await response.json();

        i18n.global.setLocaleMessage(locale, messages);
        loadedLanguages.add(locale);

        i18n.global.locale.value = locale;
    } catch (err) {
        console.error(`Failed to load messages for locale: ${locale}`, err);

        if (locale !== import.meta.env.VITE_DEFAULT_LOCALE && !loadedLanguages.has(import.meta.env.VITE_FALLBACK_LOCALE)) {
            await loadLocaleMessages(import.meta.env.VITE_FALLBACK_LOCALE);
        } else {
            i18n.global.locale.value = import.meta.env.VITE_FALLBACK_LOCALE;
        }
    }
}
