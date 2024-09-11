import { createApp } from 'vue';
import App from './App.vue';
import i18n from './i18n';
import { router } from './router';
import { pinia } from './stores';
import './main.css'

export function createSwapWidget() {
    const app = createApp(App);
    app.use(router);
    app.use(i18n);
    app.use(pinia);
    app.mount('#swap-widget-component');
}

createSwapWidget()
