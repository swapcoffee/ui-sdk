import { profileService } from "@/api/coffeeApi/services";
import { DEXES } from "@/utils/dexes";
import { useSettingsStore } from "@/stores/settings";
import { useDexSettingsStore } from "@/stores/dex/settings";
import { useDexStore } from "@/stores/dex";

let settingsInstance: any = null

function getDexSettings() {
	const settingsStore = useSettingsStore()
	const userSettings = settingsStore.GET_USER_SETTINGS
	let settings = userSettings?.dexSettings

	if (settings) {
		localStorage.setItem("dexSettings", JSON.stringify({ dexSettings: settings }))
	} else {
		let storage = JSON.parse(localStorage.getItem("dexSettings") || "null")?.dexSettings
		settings = storage || {}
	}

	return settings
}

export function formatValueType(value: any) {
	return typeof value === "number" ? value : +value
}

export function toggleSmartMode(value: boolean, notSave?: boolean) {
	const dexStore = useDexSettingsStore()
	dexStore.DEX_SMART_MODE(value)
	if (!notSave) saveSettingsToStorage("smartMode", value)
}

export function toggleMevProtection(value: boolean, notSave?: boolean) {
	const dexStore = useDexSettingsStore()
	dexStore.DEX_MEV_PROTECTION(value)
	if (!notSave) saveSettingsToStorage("mevProtection", value)
}

export function changeMevMinVolume(value: number, notSave?: boolean) {
	const dexStore = useDexSettingsStore()
	const formatted = formatValueType(value)
	dexStore.DEX_MEV_MIN_USD(formatted)
	if (!notSave) saveSettingsToStorage("mevProtectionVolumeUsd", formatted)
}

export function toggleExpertMode(value: boolean, notSave?: boolean) {
	const dexStore = useDexSettingsStore()
	dexStore.DEX_EXPERT_MODE(value)
	if (!notSave) saveSettingsToStorage("expertMode", value)
	toggleExpertsSettingsValues(value, notSave)
}

export function changeSlippage(value: number, notSave?: boolean) {
	const dexStore = useDexSettingsStore()
	const formatted = formatValueType(value)
	dexStore.DEX_SLIPPAGE(formatted)
	if (!notSave) saveSettingsToStorage("slippage", formatted)
}

export function changePriceImpact(value: number, notSave?: boolean) {
	const dexStore = useDexSettingsStore()
	const formatted = formatValueType(value)
	dexStore.DEX_PRICE_IMPACT(formatted)
	if (!notSave) saveSettingsToStorage("priceImpact", formatted)
}

export function changeMaxPoolVolatility(value: number, notSave?: boolean) {
	const dexStore = useDexSettingsStore()
	const formatted = formatValueType(value)
	dexStore.DEX_MAX_POOL_VOLATILITY(formatted)
	if (!notSave) saveSettingsToStorage("maxPoolVolatility", formatted)
}

export function changeMaxIntermediateTokens(value: number, notSave?: boolean) {
	const dexStore = useDexSettingsStore()
	const formatted = formatValueType(value)
	dexStore.DEX_MAX_INTERMEDIATE_TOKENS(formatted)
	if (!notSave) saveSettingsToStorage("maxIntermediateTokens", formatted)
}

export function changeMaxSplits(value: number, notSave?: boolean) {
	const dexStore = useDexSettingsStore()
	const formatted = formatValueType(value)
	dexStore.DEX_MAX_SPLITS(formatted)
	if (!notSave) saveSettingsToStorage("maxSplits", formatted)
}

export function changeLiquiditySources(value: string[], notSave?: boolean) {
	const dexStore = useDexSettingsStore()
	dexStore.DEX_LIQUIDITY_SOURCES(value)
	if (!notSave) saveSettingsToStorage("liquiditySources", value)

	const allDexesIds = DEXES.map(dex => dex.id)
	localStorage.setItem("knownDexSources", JSON.stringify(allDexesIds))
}

export async function saveSettingsToStorage(key: string, value: any) {
	try {
		const settingsStore = useSettingsStore()
		const dexSettingsStore = useDexSettingsStore()
		const dexStore = useDexStore()

		const wallet = dexStore.GET_DEX_WALLET
		const proof = dexStore.GET_PROOF_VERIFICATION

		let settings: any = settingsStore.GET_USER_SETTINGS || {}
		if (!settings.dexSettings) settings.dexSettings = {}
		settings.dexSettings[key] = value

		localStorage.setItem("dexSettings", JSON.stringify(settings))

		if (proof && wallet) {
			await profileService.writeStorage(wallet.address, proof, settings)
		}
	} catch (err) {
		console.error(err)
	}
}

export async function checkStorageSettings(instance?: any) {
	settingsInstance = instance
	try {
		const dexStore = useDexSettingsStore()
		let settings: any = getDexSettings()

		const defaultSettings = [
			{ key: "smartMode", action: dexStore.DEX_SMART_MODE },
			{ key: "expertMode", action: dexStore.DEX_EXPERT_MODE },
			{ key: "slippage", action: dexStore.DEX_SLIPPAGE },
			{ key: "mevProtection", action: dexStore.DEX_MEV_PROTECTION }
		]

		defaultSettings.forEach(({ key, action }) => {
			if (settings && settings.hasOwnProperty(key)) {
				(action as any)(settings[key], true)
			}
		})

		if (settings && settings.hasOwnProperty("cashback")) delete (settings as any).cashback

		if (settings && settings.expertMode) {
			if ((settings as any).priceImpact) changePriceImpact(formatValueType((settings as any).priceImpact), true)
			if ((settings as any).maxPoolVolatility) changeMaxPoolVolatility(formatValueType((settings as any).maxPoolVolatility), true)
			if ((settings as any).maxIntermediateTokens) changeMaxIntermediateTokens(formatValueType((settings as any).maxIntermediateTokens), true)
			if ((settings as any).maxSplits) changeMaxSplits(formatValueType((settings as any).maxSplits), true)
			if ((settings as any).liquiditySources) changeLiquiditySources((settings as any).liquiditySources, true)
		}
	} catch (err) {
		console.error(err)
	}
}

export function toggleExpertsSettingsValues(expertModeValue: boolean, notSave?: boolean) {
	const dexStore = useDexSettingsStore()
	const settings = getDexSettings()

	if (expertModeValue) {
		if ((settings as any).priceImpact) changePriceImpact(formatValueType((settings as any).priceImpact), notSave)
		if ((settings as any).maxPoolVolatility) changeMaxPoolVolatility(formatValueType((settings as any).maxPoolVolatility), notSave)
		if ((settings as any).maxIntermediateTokens) changeMaxIntermediateTokens(formatValueType((settings as any).maxIntermediateTokens), notSave)
		if ((settings as any).maxSplits) changeMaxSplits(formatValueType((settings as any).maxSplits), notSave)
		if ((settings as any).liquiditySources) changeLiquiditySources((settings as any).liquiditySources, notSave)

		if (settingsInstance) settingsInstance.expertStateUpdate()
	} else {
		dexStore.CLEAR_DEX_EXPERTS_SETTINGS()
	}
}
