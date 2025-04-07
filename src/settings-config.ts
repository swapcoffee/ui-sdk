export const DEFAULTS = {
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
};

export const REQUIRED_FOR_MODE = {
    tonConnect: ['tonConnectManifest', 'tonConnectUi'],
    payload: ['payload'],
};

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
];
