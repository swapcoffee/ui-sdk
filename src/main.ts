import { createApp } from 'vue';
import App from './App.vue';
import i18n from './i18n';
import { pinia } from './stores';
import './main.css'
import {TonConnectUI, THEME} from "@tonconnect/ui";

export function createSwapWidget(selector, options = {}) {
    const {
        theme = import.meta.env.VITE_DEFAULT_THEME,
        locale = import.meta.env.VITE_DEFAULT_LOCALE,
        tonConnectManifest,
        tonConnectUi,
        payload,
        injectionMode = 'tonConnect',
    } = options;

    if (injectionMode !== 'tonConnect' && injectionMode !== 'payload') {
        throw new Error('Invalid injection mode. Must be either "tonConnect" or "payload".');
    }

    if (injectionMode === 'tonConnect') {
        if (!tonConnectManifest) {
            throw new Error('tonConnectManifest is required for "tonConnect" mode');
        }
        if (!tonConnectUi) {
            throw new Error('tonConnectUi instance is required for "tonConnect" mode');
        }
    } else if (injectionMode === 'payload') {
        if (!payload) {
            throw new Error('Payload is required for "payload" mode');
        }
    }

    const app = createApp(App);

    app.use(i18n);

    if (injectionMode === 'tonConnect') {
        app.provide('tonConnectManifest', tonConnectManifest);
        app.provide('tonConnectUi', tonConnectUi);
        app.provide('payload', null);
    } else if (injectionMode === 'payload') {
        app.provide('payload', payload);
        app.provide('tonConnectManifest', null);
        app.provide('tonConnectUi', null);
    }

    app.provide('injectionMode', injectionMode);

    i18n.global.locale.value = locale;

    app.use(pinia);

    app.mount(selector);

    applyTheme(selector, theme);
}

const applyTheme = (selector, theme) => {
    const widgetElement = document.querySelector(selector);
    if (!widgetElement) return;

    widgetElement.classList.remove('theme-light', 'theme-dark', 'theme-coffee');
    widgetElement.classList.add(`theme-${theme}`);
}

// const tonConnectUiInstance = new TonConnectUI({
//     manifestUrl: "https://swap.coffee/tonconnect-manifest.json",
//     uiPreferences: {
//         theme: THEME.DARK,
//     },
// });
//

// export const payload = {
//     wallet_meta: {
//         address: "0:e82b785a9f11c271ce0418a921aa3fa255a98f6cff88be610b8ce2df66ed3ba6",
//     },
//     verify: {
//         public_key: "a3e1e5811d634985c82132c636fc7fbfef831bbfcf1593dc35f8291fe2c4af2c",
//         wallet_state_init: "te6cckECFgEAAwQAAgE0ARUBFP8A9KQT9LzyyAsCAgEgAxACAUgEBwLm0AHQ0wMhcbCSXwTgItdJwSCSXwTgAtMfIYIQcGx1Z70ighBkc3RyvbCSXwXgA/pAMCD6RAHIygfL/8nQ7UTQgQFA1yH0BDBcgQEI9ApvoTGzkl8H4AXTP8glghBwbHVnupI4MOMNA4IQZHN0crqSXwbjDQUGAHgB+gD0BDD4J28iMFAKoSG+8uBQghBwbHVngx6xcIAYUATLBSbPFlj6Ahn0AMtpF8sfUmDLPyDJgED7AAYAilAEgQEI9Fkw7UTQgQFA1yDIAc8W9ADJ7VQBcrCOI4IQZHN0coMesXCAGFAFywVQA88WI/oCE8tqyx/LP8mAQPsAkl8D4gIBIAgPAgEgCQ4CAVgKCwA9sp37UTQgQFA1yH0BDACyMoHy//J0AGBAQj0Cm+hMYAIBIAwNABmtznaiaEAga5Drhf/AABmvHfaiaEAQa5DrhY/AABG4yX7UTQ1wsfgAWb0kK29qJoQICga5D6AhhHDUCAhHpJN9KZEM5pA+n/mDeBKAG3gQFImHFZ8xhAT48oMI1xgg0x/TH9MfAvgju/Jk7UTQ0x/TH9P/9ATRUUO68qFRUbryogX5AVQQZPkQ8qP4ACSkyMsfUkDLH1Iwy/9SEPQAye1U+A8B0wchwACfbFGTINdKltMH1AL7AOgw4CHAAeMAIcAC4wABwAORMOMNA6TIyx8Syx/L/xESExQAbtIH+gDU1CL5AAXIygcVy//J0Hd0gBjIywXLAiLPFlAF+gIUy2sSzMzJc/sAyEAUgQEI9FHypwIAcIEBCNcY+gDTP8hUIEeBAQj0UfKnghBub3RlcHSAGMjLBcsCUAbPFlAE+gIUy2oSyx/LP8lz+wACAGyBAQjXGPoA0z8wUiSBAQj0WfKnghBkc3RycHSAGMjLBcsCUAXPFlAD+gITy2rLHxLLP8lz+wAACvQAye1UAFEAAAAAKamjF6Ph5YEdY0mFyCEyxjb8f7/vgxu/zxWT3DX4KR/ixK8sQN9iJtU=",
//         proof: {
//             timestamp: 1731927983,
//             domain_len: 11,
//             domain_val: "swap.coffee",
//             payload: "tbhTOcnrO1NbBCZPsc9g2vge0R149ntX",
//             signature: "Kbkns5rJg+TapCjBR7pT1vuu6rOsUDY69DuxNQvt3ZTQJY5cfCEV9t0QZvahOalavmB2kQXk6WphuHJkr+/2CA=="
//         }
//     }
// }
//
//
// createSwapWidget('#swap-widget-component', {
//     theme: 'dark',
//     locale: 'en',
//     injectionMode: 'payload',
//     payload
// });


// createSwapWidget('#swap-widget-component', {
//     theme: 'dark',
//     locale: 'en',
//     injectionMode: "tonConnect",
//     tonConnectManifest: {
//         "url": "https://swap.coffee/tonconnect-manifest.json",
//     },
//     tonConnectUi: tonConnectUiInstance
// });
