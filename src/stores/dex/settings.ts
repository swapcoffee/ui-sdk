import { defineStore } from 'pinia';
import { DexSettingsState } from "@/utils/types";


export const useDexSettingsStore = defineStore('dex-settings', {
    state: (): DexSettingsState => ({
        slippage: 5,
        priceImpact: 10,
        maxPoolVolatility: -1,
        maxIntermediateTokens: 1,
        isExpertMode: false,
        maxSplitsValue: 4,
        liquiditySources: ['dedust', 'stonfi', 'stonfi_v2', 'tonco', 'tonstakers'],
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
            this.liquiditySources = ['dedust', 'stonfi', 'stonfi_v2', 'tonco', 'tonstakers'];
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
    },
    getters: {
        GET_SLIPPAGE: (state): number => state.slippage,
        GET_PRICE_IMPACT: (state): number => state.priceImpact,
        GET_MAX_POOL_VOLATILITY: (state): number => state.maxPoolVolatility,
        GET_MAX_INTERMEDIATE_TOKENS: (state): number => state.maxIntermediateTokens,
        GET_EXPERT_MODE_VALUE: (state): boolean => state.isExpertMode,
        GET_MAX_SPLITS: (state): number => state.maxSplitsValue,
        GET_LIQUIDITY_SOURCES: (state): string[] => state.liquiditySources,
    },
});
