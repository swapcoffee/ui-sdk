import { defineStore } from 'pinia';

import type { DexSettingsState } from "@/utils/types";
import {DEXES_IDS} from "@/utils/dexes.ts";

export const useDexSettingsStore = defineStore('dex-settings', {
    state: (): DexSettingsState => ({
        slippage: 5,
        priceImpact: 10,
        maxPoolVolatility: -1,
        maxIntermediateTokens: 1,
        isExpertMode: false,
        maxSplitsValue: 4,
        liquiditySources: DEXES_IDS,
        isMevProtectionEnabled: false,
        useMevVolumeUsd: 10,
        isSmartModeActive: true,
    }),
    actions: {
        DEX_SLIPPAGE(value: number) {
            this.slippage = value;
        },
        DEX_PRICE_IMPACT(value: number) {
            this.priceImpact = value;
        },
        DEX_MAX_POOL_VOLATILITY(value: number) {
            this.maxPoolVolatility = value;
        },
        DEX_MAX_INTERMEDIATE_TOKENS(value: number) {
            this.maxIntermediateTokens = value;
        },
        CLEAR_DEX_SETTINGS() {
            this.slippage = 5;
            this.priceImpact = 10;
            this.maxPoolVolatility = -1;
            this.maxIntermediateTokens = 1;
            this.maxSplitsValue = 4;
            this.isExpertMode = false;
            this.liquiditySources = DEXES_IDS;
        },
        CLEAR_DEX_EXPERTS_SETTINGS() {
            this.priceImpact = 10;
            this.maxPoolVolatility = -1;
            this.maxIntermediateTokens = 1;
        },
        DEX_EXPERT_MODE(value: boolean) {
            this.isExpertMode = value;
        },
        DEX_MAX_SPLITS(value: number) {
            this.maxSplitsValue = value;
        },
        DEX_LIQUIDITY_SOURCES(value: string[]) {
            this.liquiditySources = value;
        },
        DEX_MEV_PROTECTION(value: boolean) {
            this.isMevProtectionEnabled = value
        },
        DEX_MEV_MIN_USD(value: number) {
            this.useMevVolumeUsd = value;
        },
        DEX_SMART_MODE(value: boolean) {
            this.isSmartModeActive = value;
        },
    },
    getters: {
        GET_SLIPPAGE: (state): number => state.slippage,
        GET_PRICE_IMPACT: (state): number => state.priceImpact,
        GET_MAX_POOL_VOLATILITY: (state): number => state.maxPoolVolatility,
        GET_MAX_INTERMEDIATE_TOKENS: (state): number => state.maxIntermediateTokens,
        GET_EXPERT_MODE_VALUE: (state): boolean => state.isExpertMode,
        GET_MAX_SPLITS: (state): number => state.maxSplitsValue,
        GET_LIQUIDITY_SOURCES: (state): string[] => state.liquiditySources,
        GET_MEV_PROTECTION_VALUE: (state): boolean => state.isMevProtectionEnabled,
        GET_MEV_MIN_USD: (state): number => state.useMevVolumeUsd,
        GET_SMART_MODE_VALUE: (state): boolean => state.isSmartModeActive
    }
});
