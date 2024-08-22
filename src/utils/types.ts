export interface GlobalSettings {
    theme: string;
    lang: string;
}

export interface DexSettings {
    maxPoolVolatility: number;
    expertMode: boolean;
    slippage: number;
    priceImpact: number;
    maxIntermediateTokens: number;
    maxSplits: number;
    cashback: boolean;
}

export interface UserSettings {
    globalSettings: GlobalSettings;
    dexSettings: DexSettings;
}

export interface SettingsState {
    theme: string;
    availableThemes: string[];
    settings: UserSettings | null;
}
