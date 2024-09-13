import { createApp } from 'vue';
import App from './VueComponent.vue';
import i18n from '../i18n';
import { pinia } from '../stores';
import '../main.css'
import {applyTheme, tonConnectUiInstance} from "@/shared/shared";

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
//
// createSwapWidget('#swap-widget-component', {
//     theme: 'dark',
//     locale: 'en',
//     tonConnectManifest: {
//         "url": "https://swap.coffee/tonconnect-manifest.json",
//     },
//     tonConnectUi: tonConnectUiInstance
// });