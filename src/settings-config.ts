import type {TonConnectUI} from "@tonconnect/ui";

export enum SWAP_WIDGET_THEME {
    LIGHT = 'light',
    DARK = 'dark',
    COFFEE = 'coffee',
}

export enum SWAP_WIDGET_LOCALE {
    EN = 'en',
    RU = 'ru',
    UA = 'ua',
    ES = 'es',
    FR = 'fr',
    FA = 'fa'
}

export enum SWAP_WIDGET_LIQUIDITY_SOURCES {
    TONCO = 'tonco',
    TONSTAKERS = 'tonstakers',
    DEDUST = 'dedust',
    STONFI_V2 = 'stonfi_v2',
    STONFI = 'stonfi',
    COFFEE = 'coffee',
    COLOSSUS = 'colossus',
    TORCH_FINANCE = 'torch_finance',
}

export interface CustomFeeSettingsInterface {
    fixed_fee?: number | null;
    percentage_fee: number | null;
    min_percentage_fee_fixed: string | null;
    max_percentage_fee_fixed: string | null;
}

export interface PayloadConnectionInterface {
    wallet_meta: PayloadConnectionWalletMetaInterface,
    verify: PayloadConnectionVerifyInterface
}

export interface PayloadConnectionWalletMetaInterface {
    address: string;
}

export interface PayloadConnectionVerifyInterface {
    public_key: string;
    wallet_state_init: string;
    proof: PayloadConnectionProofInterface
}

export interface PayloadConnectionProofInterface {
    timestamp: number;
    domain_len: number;
    domain_val: string;
    payload: string;
    signature: string;
}

export interface DefaultSettingsInterface {
    theme: SWAP_WIDGET_THEME;
    locale: SWAP_WIDGET_LOCALE;
    injectionMode: 'tonConnect' | 'payload';
    tonConnectManifest?: {
        url: string;
    };
    tonConnectUi?: TonConnectUI
    widgetReferral?: string | null;
    customFeeSettings?: CustomFeeSettingsInterface,
    limitDcaVisibility?: boolean
    limitedJettonLists?: Array<string> | null;
    liquiditySourcesList?: Array<SWAP_WIDGET_LIQUIDITY_SOURCES> | null;
    firstTokenAmount?: number
    sendReceiveTokenAddresses?: Array<string> | null;
    payload?: PayloadConnectionInterface
}

export const DEFAULTS: DefaultSettingsInterface = {
    theme: import.meta.env.VITE_DEFAULT_THEME,
    locale: import.meta.env.VITE_DEFAULT_LOCALE,
    injectionMode: 'tonConnect',
    widgetReferral: null,
    customFeeSettings: {
        fixed_fee: null,
        percentage_fee: null,
        min_percentage_fee_fixed: null,
        max_percentage_fee_fixed: null,
    },
    limitDcaVisibility: import.meta.env.VITE_DEFAULT_HIDE_LIMIT_DCA,
    limitedJettonLists: null,
    liquiditySourcesList: null,
    firstTokenAmount: 0,
    sendReceiveTokenAddresses: null,

} as const;

export const REQUIRED_FOR_MODE = {
    tonConnect: ['tonConnectManifest', 'tonConnectUi'],
    payload: ['payload'],
} as const;

export const PROVIDES = [
    'injectionMode',
    'tonConnectManifest',
    'tonConnectUi',
    'payload',
    'widgetReferral',
    'customFeeSettings',
    'widgetTheme',
    'locale',
    'limitDcaVisibility',
    'limitedJettonLists',
    'liquiditySourcesList',
    'firstTokenAmount',
    'sendReceiveTokenAddresses',
] as const;
