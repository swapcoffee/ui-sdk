import { createApp } from 'vue';
import App from './App.vue';
import i18n from './i18n';
import { pinia } from './stores';
import './main.css'
import {TonConnectUI, THEME} from "@tonconnect/ui";

export function createSwapWidget(selector, options = {}) {
    const {
        theme = import.meta.env.VITE_DEFAULT_THEME,
        locale = import.meta.env.VITE_DEFAULT_LOCALE,
        tonConnectManifest,
        tonConnectUi,
    } = options;

    if (!tonConnectManifest) {
        throw new Error('tonConnectManifest is required');
    }

    if (!tonConnectUi) {
        throw new Error('tonConnectUi instance is required');
    }

    const app = createApp(App);

    app.use(i18n);

    app.provide('tonConnectManifest', tonConnectManifest);

    app.provide('tonConnectUi', tonConnectUi);

    i18n.global.locale.value = locale;

    app.use(pinia);

    app.mount(selector);

    applyTheme(selector, theme);
}

const applyTheme = (selector, theme) => {
    const widgetElement = document.querySelector(selector);
    if (!widgetElement) return;

    widgetElement.classList.remove('theme-light', 'theme-dark', 'theme-coffee');
    widgetElement.classList.add(`theme-${theme}`);
}

const tonConnectUiInstance = new TonConnectUI({
    manifestUrl: "https://swap.coffee/tonconnect-manifest.json",
    uiPreferences: {
        theme: THEME.DARK,
    },
});

createSwapWidget('#swap-widget-component', {
    theme: 'dark',
    locale: 'en',
    tonConnectManifest: {
        "url": "https://swap.coffee/tonconnect-manifest.json",
    },
    tonConnectUi: tonConnectUiInstance
});
