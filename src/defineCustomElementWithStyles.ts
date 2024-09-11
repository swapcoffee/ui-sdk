import {defineCustomElement as VueDefineCustomElement, h, createApp, getCurrentInstance} from 'vue'
export const defineCustomElement = (component, { plugins = [] } = {}) =>
	VueDefineCustomElement({
		...component, // <---- use all props from the original component (except setup)
		setup(...args) {
			const app = createApp({})
			plugins.forEach(app.use)
			const instance = getCurrentInstance()
			Object.assign(instance.appContext, app._context)
			Object.assign(instance.provides, app._context.provides)

			return component.setup?.(...args) // <---- run initial setup if exists
		},
	})