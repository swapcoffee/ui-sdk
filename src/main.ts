import { createApp } from 'vue';
import App from './App.vue';
import i18n from './i18n';
import { router } from './router';
import { pinia } from './stores';

export function createSwapWidget(selector) {
    const app = createApp(App);
    app.use(router);
    app.use(i18n);
    app.use(pinia);
    app.mount(selector);
}

createSwapWidget('#swap')
