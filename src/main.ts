import { defineCustomElement } from "vue"
import App from './WebComponent.ce.vue'
import './main.css'
import i18n from "./i18n";
import { pinia } from "./stores";
// import {applyTheme, tonConnectUiInstance} from "@/shared/shared";
import styles from '@/styles/main'

let SwapWidget = null
let themeWidget = null
let selector = 'swap-widget'
const createWebComponent = (options) => {

	const {
		theme = import.meta.env.VITE_DEFAULT_THEME,
		locale = import.meta.env.VITE_DEFAULT_LOCALE,
		tonConnectManifest,
		tonConnectUi,
	} = options;

	themeWidget = theme

	SwapWidget = defineCustomElement(App, {
		styles: styles,
		configureApp(app) {
			if (!tonConnectManifest) {
				throw new Error('tonConnectManifest is required');
			}
			if (!tonConnectUi) {
				throw new Error('tonConnectUi instance is required');
			}

			app.use(i18n);
			app.provide('tonConnectManifest', tonConnectManifest);
			app.provide('tonConnectUi', tonConnectUi);
			app.use(pinia);
			i18n.global.locale.value = locale;
		}
	})

	if (typeof window === 'undefined') return;

	if (!window.customElements.get(selector)) {
		window.customElements.define(selector, SwapWidget);
	}
};

export { SwapWidget, createWebComponent };

// createWebComponent({
// 	theme: 'dark',
// 	locale: 'en',
// 	tonConnectManifest: {
// 		"url": "https://swap.coffee/tonconnect-manifest.json",
// 	},
// 	tonConnectUi: tonConnectUiInstance
// });

// test
// let widget = new SwapWidget({})
// widget.setAttribute('id', selector);
// document.body.appendChild(widget)

// applyTheme(`#${selectorWidget}`, themeWidget);
