import { createI18n } from "vue-i18n";
import en from "./locales/en.json"
import ru from "./locales/ru.json"
import ua from "./locales/ua.json"
import zh from "./locales/zh.json"
import fa from "./locales/fa.json"
import es from "./locales/es.json"


export default createI18n({
    locale: import.meta.env.VITE_DEFAULT_LOCALE,
    fallbackLocale: import.meta.env.VITE_FALLBACK_LOCALE,
    legacy: false,
    messages: {
        en,
        ru,
        ua,
        zh,
        fa,
        es
    }
})
