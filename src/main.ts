import { createApp } from 'vue';
import App from './App.vue';
import i18n from './i18n';
import { pinia } from './stores';
import './main.css'
import {DEFAULT_SETTINGS_INTERFACE, DEFAULTS, PROVIDES, REQUIRED_FOR_MODE} from "@/settings-config.ts";
import {TonConnectUI, THEME} from "@tonconnect/ui";

export function createSwapWidget(selector, options: DEFAULT_SETTINGS_INTERFACE = {}) {
    const cfg = { ...DEFAULTS, ...options };

    if (!['tonConnect', 'payload'].includes(cfg.injectionMode)) {
        throw new Error('InjectionMode must be "tonConnect" or "payload"');
    }

    for (const key of REQUIRED_FOR_MODE[cfg.injectionMode]) {
        if (!cfg[key]) {
            throw new Error(`${key} is required when injectionMode is "${cfg.injectionMode}"`);
        }
    }

    const app = createApp(App);
    app.use(i18n);
    app.use(pinia);

    PROVIDES.forEach((key) => {
        const provideKey = key === 'theme' ? 'widgetTheme' : key;
        const value = cfg[key === 'widgetTheme' ? 'theme' : key];
        app.provide(provideKey, value);
    });

    i18n.global.locale.value = cfg.locale;
    app.mount(selector);
    applyTheme(selector, cfg.theme);
}


const applyTheme = (selector, theme) => {
    const widgetElement = document.querySelector(selector);
    if (!widgetElement) return;

    widgetElement.classList.add('swap-coffee__sdk-widget');

    widgetElement.classList.remove('theme-light', 'theme-dark', 'theme-coffee');
    widgetElement.classList.add(`theme-${theme}`);
}

const tonConnectUiInstance = new TonConnectUI({
    manifestUrl: "https://swap.coffee/tonconnect-manifest.json",
    uiPreferences: {
        theme: THEME.DARK,
    },
});


// export const payload = {
//     wallet_meta: {
//         address: "0:e867df1c40a11d2aa28ee003b6da58cec7518df463f93b72185c8aabbcbe3b1a",
//     },
//     verify: {"public_key":"1aa6150cea2170a5a850892318425279fcb79db2d1d77130230d8e30c2abbb35","wallet_state_init":"te6cckECFgEAAwQAAgE0ARUBFP8A9KQT9LzyyAsCAgEgAxACAUgEBwLm0AHQ0wMhcbCSXwTgItdJwSCSXwTgAtMfIYIQcGx1Z70ighBkc3RyvbCSXwXgA/pAMCD6RAHIygfL/8nQ7UTQgQFA1yH0BDBcgQEI9ApvoTGzkl8H4AXTP8glghBwbHVnupI4MOMNA4IQZHN0crqSXwbjDQUGAHgB+gD0BDD4J28iMFAKoSG+8uBQghBwbHVngx6xcIAYUATLBSbPFlj6Ahn0AMtpF8sfUmDLPyDJgED7AAYAilAEgQEI9Fkw7UTQgQFA1yDIAc8W9ADJ7VQBcrCOI4IQZHN0coMesXCAGFAFywVQA88WI/oCE8tqyx/LP8mAQPsAkl8D4gIBIAgPAgEgCQ4CAVgKCwA9sp37UTQgQFA1yH0BDACyMoHy//J0AGBAQj0Cm+hMYAIBIAwNABmtznaiaEAga5Drhf/AABmvHfaiaEAQa5DrhY/AABG4yX7UTQ1wsfgAWb0kK29qJoQICga5D6AhhHDUCAhHpJN9KZEM5pA+n/mDeBKAG3gQFImHFZ8xhAT48oMI1xgg0x/TH9MfAvgju/Jk7UTQ0x/TH9P/9ATRUUO68qFRUbryogX5AVQQZPkQ8qP4ACSkyMsfUkDLH1Iwy/9SEPQAye1U+A8B0wchwACfbFGTINdKltMH1AL7AOgw4CHAAeMAIcAC4wABwAORMOMNA6TIyx8Syx/L/xESExQAbtIH+gDU1CL5AAXIygcVy//J0Hd0gBjIywXLAiLPFlAF+gIUy2sSzMzJc/sAyEAUgQEI9FHypwIAcIEBCNcY+gDTP8hUIEeBAQj0UfKnghBub3RlcHSAGMjLBcsCUAbPFlAE+gIUy2oSyx/LP8lz+wACAGyBAQjXGPoA0z8wUiSBAQj0WfKnghBkc3RycHSAGMjLBcsCUAXPFlAD+gITy2rLHxLLP8lz+wAACvQAye1UAFEAAAAAKamjFxqmFQzqIXClqFCJIxhCUnn8t52y0ddxMCMNjjDCq7s1QH69tGQ=","proof":{"timestamp":1733138437,"domain_len":11,"domain_val":"swap.coffee","payload":"0MllhaYxFCsNZAcZnlyr4ZPImsPL1wsY","signature":"uq6/e/RANyred6NzWZ8Rd/AeJPZwzym/srIDytfz/VPk6V9jQ+LrmeVQigD0KYH6ACAa/9VHB4D9dOZs+aUtAA=="}}
// }
//
//
// createSwapWidget('#swap-widget-component', {
//     theme: 'dark',
//     locale: 'en',
//     injectionMode: 'payload',
//     widgetReferral: 'dewallet',
//     payload
// });


createSwapWidget('#swap-widget-component', {
        theme:  'light',
    locale: 'en',
    injectionMode: "tonConnect",
    tonConnectManifest: {
        "url": "https://swap.coffee/tonconnect-manifest.json",
    },
    tonConnectUi: tonConnectUiInstance,
    widgetReferral: "TEST_WIDGET_REFERRAL",
    sendReceiveTokenAddresses: ["EQCQZpelevHNsbw5IUtwSa4Cs8kqWww0KsYeDri9kwS18eCz", "EQAVfEY2iKSpEkUhgFLFWAgHeSz2NH2XV-MvDuiKF5plSbsU"],
    limitedJettonLists: ["EQBlqsm144Dq6SjbPI4jjZvA1hqTIP3CvHovbIfW_t-SCALE","EQAM2KWDp9lN0YvxvfSbI0ryjBXwM70rakpNIHbuETatRWA1", "EQAvlWFDxGF2lXm67y4yzC17wYKD9A0guwPkMs1gOsM__NOT", "EQD0KpcRMh-sKO2z5-vOjgvFjTT58tO-2Nmvxqg5ocFQFtWz"],
    customFeeSettings: {
        percentage_fee: 3000,
        min_percentage_fee_fixed: '50000000',
        max_percentage_fee_fixed: '4000000000',
    },
});

