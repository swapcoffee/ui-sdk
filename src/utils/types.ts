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
    lastWalletConnectionTime: any | string;
}

export interface LimitState {
    strategiesEligible: boolean;
    strategiesWallet: any | null;
    supportedSend: any[];
    supportedReceive: any[];
    limitFirst: any | null;
    limitSecond: any | null;
    firstAmount: number;
    secondAmount: number;
    tokenRate: number;
    limitHistory: any[];
}

export interface LimitSettingsState {
    expertMode: boolean;
    maxSuborders: number;
    maxInvocations: number;
    enableSuborders: boolean;
}

export interface DcaState {
    everyTime: number;
    minRange: number | null;
    maxRange: number | null;
    enableRange: boolean;
}

export interface DexSettingsState {
    slippage: number;
    priceImpact: number;
    maxPoolVolatility: number;
    maxIntermediateTokens: number;
    isExpertMode: boolean;
    maxSplitsValue: number;
    liquiditySources: string[];
}

export interface TokenPagination {
    currentPage: number;
    totalPages: number;
}

export interface TokensPopupState {
    currentPageByTab: Record<string, number>;
    hasMoreTokensByTab: Record<string, boolean>;
    activeTab: string;
}

export enum SwapActiveTab {
    Dex = 'Dex',
    Limit = 'Limit',
    DCA = 'Dca',
}

export interface DexState {
    dealConditions: any | null;
    pinnedTokens: any[];
    tonTokens: any[];
    userTokens: any[];
    tokenLabels: any[];
    dexWallet: any | null;
    dexWalletVersion: any | null;
    sendToken: any | null;
    receiveToken: any | null;
    sendAmount: number;
    receiveAmount: number;
    swapMode: string;
    stakingPool: any | null;
    tokenPagination: TokenPagination;
    tokensByLabel: Record<string, any[]>;
    proofVerification: any | null;
    payloadId: any | null;
    areTokensLoaded: boolean;
    tokensPopupState: TokensPopupState;
    calculatedPriceImpact: any | null;
    swapActiveTab: SwapActiveTab
}

export interface TokensByLabelPayload {
    labelId: string;
    tokens: any[];
}


