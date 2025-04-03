import { defineStore } from 'pinia';
import { SettingsState, UserSettings } from "@/utils/types";

export const useSettingsStore = defineStore('settings', {
	state: (): SettingsState => ({
		theme: 'dark',
		availableThemes: ['system', 'dark', 'light', 'coffee'],
		settings: null,
		lastWalletConnectionTime: null,
	}),
	actions: {
		SET_THEME(value: string) {
			this.theme = value;
		},
		SET_USER_SETTINGS(value: UserSettings) {
			this.settings = value;
		},
		TOGGLE_THEME() {
			const currentIndex = this.availableThemes.indexOf(this.theme);
			this.theme = this.availableThemes[(currentIndex + 1) % this.availableThemes.length];
		},
		SAVE_LAST_WALLET_CONNECTION_TIME(item) {
			this.lastWalletConnectionTime = item;
		},
	},
	getters: {
		GET_THEME: (state) => state.theme,
		GET_USER_SETTINGS: (state) => state.settings,
		GET_LAST_WALLET_CONNECTION_TIME: (state) => state.lastWalletConnectionTime
	}
});
