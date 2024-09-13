import {THEME, TonConnectUI} from "@tonconnect/ui";
export const applyTheme = (selector: string, theme: string) => {
	const widgetElement = document.querySelector(selector);
	console.log(widgetElement)

	if (!widgetElement) return;

	widgetElement.classList.remove('theme-light', 'theme-dark', 'theme-coffee');
	widgetElement.classList.add(`theme-${theme}`);
}

export const tonConnectUiInstance = new TonConnectUI({
	manifestUrl: "https://swap.coffee/tonconnect-manifest.json",
	uiPreferences: {
		theme: THEME.DARK,
	},
});
