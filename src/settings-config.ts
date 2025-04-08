
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

export interface CUSTOM_FEE_SETTINGS_INTERFACE {
    fixed_fee: number | null;
    percentage_fee: number | null;
    min_percentage_fee_fixed: number | null;
    max_percentage_fee_fixed: number | null;
}

export interface DEFAULT_SETTINGS_INTERFACE {
    theme: SWAP_WIDGET_THEME;
    locale: SWAP_WIDGET_LOCALE;
    injectionMode: 'tonConnect' | 'payload';
    widgetReferral?: string | null;
    customFeeSettings?: CUSTOM_FEE_SETTINGS_INTERFACE,
    limitDcaVisibility?: boolean
    limitedJettonLists?: Array<string>
    liquiditySourcesList?: Array<string>
    firstTokenAmount?: number
    sendReceiveTokenAddresses?: Array<string>
}

export const DEFAULTS: DEFAULT_SETTINGS_INTERFACE = {
    theme: import.meta.env.VITE_DEFAULT_THEME as SWAP_WIDGET_THEME,
    locale: import.meta.env.VITE_DEFAULT_LOCALE as SWAP_WIDGET_LOCALE,
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
    'limitDcaVisibility',
    'limitedJettonLists',
    'liquiditySourcesList',
    'firstTokenAmount',
    'sendReceiveTokenAddresses',
] as const;
