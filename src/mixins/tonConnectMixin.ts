import { THEME, toUserFriendlyAddress } from '@tonconnect/ui';
import { useDexStore } from '@/stores/dex';
import { useSettingsStore } from "@/stores/settings";
import { profileService } from '@/api/coffeeApi/services';

export default {
    inject: ['tonConnectManifest', 'tonConnectUi', 'payload', 'injectionMode'],
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
        GET_DEX_WALLET() {
            return this.dexStore.GET_DEX_WALLET;
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
            return {
                manifestUrl: this.tonConnectManifest.url,
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

        async loadSettingsFromPayload(address) {
            try {
                let settingsRes = await profileService.readStorage(
                    address,
                    this.dexStore.GET_PROOF_VERIFICATION
                );

                const settings = settingsRes.data;
                if (settings.body?.dexSettings && settings.body?.globalSettings) {
                    this.SAVE_USER_SETTINGS(settings.body);
                } else {
                    await this.setDefaultSettings();
                }
            } catch (err) {
                console.error(err);
            }
        },

        async getSettingsFromTonConnect() {
            try {
                const account = this.tonConnectUi.account;
                const proof = JSON.parse(localStorage.getItem('tonProof_ver') || '{}');
                if (proof) {
                    this.DEX_WALLET(account);
                    this.DEX_PROOF_VERIFICATION(proof);
                } else {
                    console.log('disconnect');
                    this.disconnectWallet();
                }
            } catch (err) {
                console.error(err);
            }
        },


        restoreUiConnection() {
            if (this.injectionMode === 'payload') {
                const { wallet_meta, verify } = this.payload;
                const account = {
                    address: wallet_meta.address,
                    userFriendlyAddress: toUserFriendlyAddress(wallet_meta.address),
                    imgUrl: '',
                };
                this.DEX_WALLET(account);
                this.DEX_PROOF_VERIFICATION(verify);
                this.getUserSettings();
            } else {
                this.tonConnectUi.connectionRestored.then((restored) => {
                    if (restored) {
                        console.log('connection restored');
                        const account = this.tonConnectUi.account;
                        account.userFriendlyAddress = toUserFriendlyAddress(this.tonConnectUi.account.address);
                        account.imgUrl = this.tonConnectUi.walletInfo.imageUrl;
                        const proof = JSON.parse(localStorage.getItem('tonProof_ver') || '{}');
                        if (proof) {
                            this.DEX_WALLET(account);
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
            }
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

            this.tonConnectUi.setConnectRequestParameters({
                    state: 'ready',
                    value: { tonProof: crypto.randomUUID() },
                });
        },

        generatePayload() {
            return crypto.randomUUID();
        },

        async getUserSettings() {
            try {
                if (this.injectionMode !== 'tonConnect') {
                    const { wallet_meta, verify } = this.payload;

                    const wallet = {
                        address: wallet_meta.address,
                    };

                    if (verify && verify.public_key && verify.wallet_state_init) {
                        this.DEX_WALLET(wallet);
                        this.DEX_PROOF_VERIFICATION(verify);
                    }

                    await this.loadSettingsFromPayload(wallet_meta.address);
                } else {
                    await this.getSettingsFromTonConnect();
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

                await profileService.writeStorage(
                    this.GET_DEX_WALLET?.address,
                    this.GET_PROOF_VERIFICATION,
                    {
                        globalSettings: newSettings,
                        dexSettings: dex,
                    },
                );
            } catch (err) {
                console.error(err);
            }
        },
    },
};
