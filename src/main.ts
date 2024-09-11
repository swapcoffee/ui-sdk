import { defineCustomElement } from './defineCustomElementWithStyles'
import './style.css'
import App from './App.ce.vue'
import i18n from "./i18n";
import { pinia } from "./stores";

let SwapWidgetSdk = defineCustomElement(App, {
	plugins: [pinia, i18n],
})

customElements.define(
	'swap-widget',
	SwapWidgetSdk
)

// document.body.appendChild(
// 	new SwapWidgetSdk({
//
// 	})
// )