import { profileService } from "@/api/coffeeApi/services";
import { DEXES } from "@/utils/dexes";
import { useSettingsStore } from "@/stores/settings";
import { useDexSettingsStore } from "@/stores/dex/settings";

let settingsInstance: any = null
let debounce: ReturnType<typeof setTimeout> | null = null

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

export function toggleSmartMode(value: boolean) {
	const dexStore = useDexSettingsStore()
	dexStore.DEX_SMART_MODE(value)
	saveSettingsToStorage("smartMode", value)
}

export function toggleMevProtection(value: boolean) {
	const dexStore = useDexSettingsStore()
	dexStore.DEX_MEV_PROTECTION(value)
	saveSettingsToStorage("mevProtection", value)
}

export function changeMevMinVolume(value: number) {
	const dexStore = useDexSettingsStore()
	const formatted = formatValueType(value)
	dexStore.DEX_MEV_MIN_USD(formatted)
	saveSettingsToStorage("mevProtectionVolumeUsd", formatted)
}

export function toggleExpertMode(value: boolean) {
	const dexStore = useDexSettingsStore()
	dexStore.DEX_EXPERT_MODE(value)
	saveSettingsToStorage("expertMode", value)
	toggleExpertsSettingsValues(value)
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
		const dexStore = useDexSettingsStore()

		const wallet = dexStore.GET_DEX_WALLET
		const proof = dexStore.GET_PROOF_VERIFICATION

		let settings = settingsStore.GET_USER_SETTINGS || {}
		if (!settings.dexSettings) settings.dexSettings = {}
		settings.dexSettings[key] = value

		localStorage.setItem("dexSettings", JSON.stringify(settings))

		clearTimeout(debounce!)
		debounce = setTimeout(async () => {
			if (proof && wallet) {
				await profileService.writeStorage(wallet.address, proof, settings)
			}
		}, 200)
	} catch (err) {
		console.error(err)
	}
}

export async function checkStorageSettings(instance?: any) {
	settingsInstance = instance
	try {
		const dexStore = useDexSettingsStore()
		let settings = getDexSettings()

		const defaultSettings = [
			{ key: "smartMode", action: dexStore.DEX_SMART_MODE },
			{ key: "expertMode", action: dexStore.DEX_EXPERT_MODE },
			{ key: "slippage", action: dexStore.DEX_SLIPPAGE },
			{ key: "slippageDeposit", action: dexStore.SAVE_EARN_SLIPPAGE },
			{ key: "mevProtection", action: dexStore.DEX_MEV_PROTECTION }
		]

		defaultSettings.forEach(({ key, action }) => {
			if (settings.hasOwnProperty(key)) {
				action(settings[key])
			}
		})

		if (settings.hasOwnProperty("cashback")) delete settings.cashback

		if (settings.expertMode) {
			if (settings.priceImpact) dexStore.DEX_PRICE_IMPACT(formatValueType(settings.priceImpact))
			if (settings.maxPoolVolatility) dexStore.DEX_MAX_POOL_VOLATILITY(formatValueType(settings.maxPoolVolatility))
			if (settings.maxIntermediateTokens) dexStore.DEX_MAX_INTERMEDIATE_TOKENS(formatValueType(settings.maxIntermediateTokens))
			if (settings.maxSplits) dexStore.DEX_MAX_SPLITS(formatValueType(settings.maxSplits))
			if (settings.liquiditySources) dexStore.DEX_LIQUIDITY_SOURCES(settings.liquiditySources)
		}
	} catch (err) {
		console.error(err)
	}
}

export function toggleExpertsSettingsValues(expertModeValue: boolean) {
	const dexStore = useDexSettingsStore()
	const settings = getDexSettings()

	if (expertModeValue) {
		if (settings.priceImpact) dexStore.DEX_PRICE_IMPACT(formatValueType(settings.priceImpact))
		if (settings.maxPoolVolatility) dexStore.DEX_MAX_POOL_VOLATILITY(formatValueType(settings.maxPoolVolatility))
		if (settings.maxIntermediateTokens) dexStore.DEX_MAX_INTERMEDIATE_TOKENS(formatValueType(settings.maxIntermediateTokens))
		if (settings.maxSplits) dexStore.DEX_MAX_SPLITS(formatValueType(settings.maxSplits))
		if (settings.liquiditySources) dexStore.DEX_LIQUIDITY_SOURCES(settings.liquiditySources)

		if (settingsInstance) settingsInstance.expertStateUpdate()
	} else {
		dexStore.CLEAR_DEX_EXPERTS_SETTINGS()
	}
}
