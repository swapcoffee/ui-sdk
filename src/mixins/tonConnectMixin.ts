import { THEME, toUserFriendlyAddress } from '@tonconnect/ui';
import { useDexStore } from '@/stores/dex';
import { useSettingsStore } from "@/stores/settings";

export default {
    inject: ['tonConnectManifest'],
    computed: {
        dexStore() {
            return useDexStore();
        },
        settingsStore() {
            return useSettingsStore();
        },
        GET_PROOF_VERIFICATION() {
            return this.dexStore.GET_PROOF_VERIFICATION;
        },
        GET_CASHBACK() {
            return this.dexStore.GET_CASHBACK;
        },
        GET_SLIPPAGE() {
            return this.dexStore.GET_SLIPPAGE;
        },
        GET_EXPERT_MODE_VALUE() {
            return this.dexStore.GET_EXPERT_MODE_VALUE;
        },
        GET_PRICE_IMPACT() {
            return this.dexStore.GET_PRICE_IMPACT;
        },
        GET_MAX_POOL_VOLATILITY() {
            return this.dexStore.GET_MAX_POOL_VOLATILITY;
        },
        GET_MAX_INTERMEDIATE_TOKENS() {
            return this.dexStore.GET_MAX_INTERMEDIATE_TOKENS;
        },
        GET_MAX_SPLITS() {
            return this.dexStore.GET_MAX_SPLITS;
        },
        GET_THEME() {
            return this.settingsStore.GET_THEME;
        },
        tonConnectSettings() {
            console.log('manifestUrl ', this.tonConnectManifest.url)
            return {
                manifestUrl: 'https://swap.coffee/tonconnect-manifest.json',
                uiPreferences: {
                    theme: THEME.DARK,
                },
            }
        },
    },
    methods: {
        SAVE_USER_SETTINGS(settings) {
            this.settingsStore.SET_USER_SETTINGS(settings);
        },
        DEX_WALLET(wallet) {
            this.dexStore.DEX_WALLET(wallet);
        },
        DEX_PROOF_VERIFICATION(proof) {
            this.dexStore.DEX_PROOF_VERIFICATION(proof);
        },

        restoreUiConnection() {
            this.tonConnectUi.connectionRestored.then((restored) => {
                if (restored) {
                    console.log('connection restored');
                    const account = this.tonConnectUi.account;
                    account.userFriendlyAddress = toUserFriendlyAddress(this.tonConnectUi.account.address);
                    account.imgUrl = this.tonConnectUi.walletInfo.imageUrl;
                    const proof = JSON.parse(localStorage.getItem('tonProof_ver') || '{}');
                    if (proof) {
                        this.DEX_WALLET(account);
                        this.getContractVersion(account.userFriendlyAddress);
                        this.DEX_PROOF_VERIFICATION(proof);
                        this.getUserSettings();
                    } else {
                        console.log('disconnect');
                        this.disconnectWallet();
                    }
                } else {
                    console.log('Connection was not restored.');
                }
            });
        },

        async disconnectWallet() {
            try {
                await this.tonConnectUi.disconnect();
                localStorage.removeItem('tonProof_ver');
            } catch (err) {
                console.error(err);
            }
        },

        tonproofSetConnect() {
            const storedVerification = JSON.parse(localStorage.getItem('tonProof_ver') || '{}');
            if (storedVerification) {
                return;
            }

            this.tonConnectUi.setConnectRequestParameters({ state: 'loading' });

            this.tokensApi.generateTonProofPayload().then((data) => {
                const payload = data.data;

                this.tonConnectUi.setConnectRequestParameters({
                    state: 'ready',
                    value: { tonProof: payload },
                });
            });
        },

        generatePayload() {
            return crypto.randomUUID();
        },

        async getUserSettings() {
            try {
                const settings = await this.dexApiV2.readStorage(
                    this.dexStore.GET_DEX_WALLET?.address,
                    this.GET_PROOF_VERIFICATION
                );
                if (settings.body?.dexSettings && settings.body?.globalSettings) {
                    this.SAVE_USER_SETTINGS(settings.body);
                } else {
                    await this.setDefaultSettings();
                }
            } catch (err) {
                console.error(err);
            }
        },

        async setDefaultSettings() {
            try {
                console.log('set default settings');
                const global = {
                    lang: 'en',
                    theme: this.GET_THEME,
                };
                const dex = {
                    cashback: this.GET_CASHBACK,
                    slippage: this.GET_SLIPPAGE,
                    expertMode: this.GET_EXPERT_MODE_VALUE,
                    priceImpact: this.GET_PRICE_IMPACT,
                    maxPoolVolatility: this.GET_MAX_POOL_VOLATILITY,
                    maxIntermediateTokens: this.GET_MAX_INTERMEDIATE_TOKENS,
                    maxSplits: this.GET_MAX_SPLITS,
                };

                await this.dexApiV2.writeStorage(
                    this.dexStore.GET_DEX_WALLET?.address,
                    this.GET_PROOF_VERIFICATION,
                    { globalSettings: global, dexSettings: dex }
                );
            } catch (err) {
                console.error(err);
            }
        },
    },
};
