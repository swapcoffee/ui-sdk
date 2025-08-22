import { defineStore } from 'pinia';
import type { UserSettings } from "@/utils/types";

interface SettingsState {
	theme: string;
	availableThemes: string[];
	settings: UserSettings | null;
	lastWalletConnectionTime: any | null;
	fixedButtonsPresent: boolean;
	fixedButtonsHeight: number;
}

export const useSettingsStore = defineStore('settings', {
	state: (): SettingsState => ({
		theme: 'dark',
		availableThemes: ['system', 'dark', 'light', 'coffee'],
		settings: null,
		lastWalletConnectionTime: null,
		fixedButtonsPresent: false,
		fixedButtonsHeight: 0,
	}),
	actions: {
		REGISTER_FIXED_BUTTON(height: number) {
			this.fixedButtonsPresent = true;
			this.fixedButtonsHeight = height;
		},
		UNREGISTER_FIXED_BUTTON() {
			this.fixedButtonsPresent = false;
			this.fixedButtonsHeight = 0;
		},
		SET_THEME(value: string) {
			this.theme = value;
		},
		SET_USER_SETTINGS(value: UserSettings | null) {
			this.settings = value;
		},
		TOGGLE_THEME(item?: string) {
			if (item) {
				this.theme = item;
			} else {
				const currentIndex = this.availableThemes.indexOf(this.theme);
				this.theme = this.availableThemes[(currentIndex + 1) % this.availableThemes.length];
			}
		},
		SAVE_USER_SETTINGS(item: UserSettings | null) {
			this.settings = item;
		},
		SAVE_LAST_WALLET_CONNECTION_TIME(item: any) {
			this.lastWalletConnectionTime = item;
		},
	},
	getters: {
		GET_FIXED_BUTTONS_INFO: (state) => ({
			present: state.fixedButtonsPresent,
			height: state.fixedButtonsHeight
		}),
		GET_THEME: (state) => state.theme,
		GET_USER_SETTINGS: (state) => state.settings,
		GET_LAST_WALLET_CONNECTION_TIME: (state) => state.lastWalletConnectionTime
	}
});
