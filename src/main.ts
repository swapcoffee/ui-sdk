import { defineCustomElement } from './defineCustomElementWithStyles'
import './style.css'
import App from './App.ce.vue'
import i18n from "./i18n";
import { pinia } from "./stores";

let SwapWidget = defineCustomElement(App, {
	plugins: [pinia, i18n],
})

const register = () => {
	if (typeof window === 'undefined') return;
	if (!window.customElements.get('swap-widget')) {
		window.customElements.define('swap-widget', SwapWidget)
	}
}

export { SwapWidget, register };

// document.body.appendChild(new SwapWidget({}))