import { THEME, toUserFriendlyAddress } from '@tonconnect/ui';
import { profileService, tonApiService } from '@/api/coffeeApi/services';
import { isInsideWalletBrowser } from "@/helpers/dex/embedded-wallets";
import { useDexStore } from "@/stores/dex";
import { useDexSettingsStore } from "@/stores/dex/settings";
import { useSettingsStore } from "@/stores/settings";
import { checkStrategiesEligible } from "@/helpers/strategies/strategies";
import { useLimitStore } from "@/stores/limit";

export function generatePayload() {
  const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  const charactersLength = characters.length;
  for (let i = 0; i < 32; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

export default {
  inject: ['tonConnectManifest', 'tonConnectUi', 'payload', 'injectionMode', "liquiditySourcesList", "widgetTheme"],
  computed: {
    dexStore() {
      return useDexStore();
    },
    dexSettingsStore() {
      return useDexSettingsStore();
    },
    settingsStore() {
      return useSettingsStore();
    },
    limitStore() {
      return useLimitStore();
    },
    customLiquiditySourcesList() {
      if (this.liquiditySourcesList.length > 0) {
        return this.liquiditySourcesList;
      }
      return null;
    },
    GET_PROOF_VERIFICATION() {
      return this.dexStore.GET_PROOF_VERIFICATION;
    },
    GET_DEX_WALLET() {
      return this.dexStore.GET_DEX_WALLET;
    },
    GET_SLIPPAGE() {
      return this.dexSettingsStore.GET_SLIPPAGE;
    },
    GET_EXPERT_MODE_VALUE() {
      return this.dexSettingsStore.GET_EXPERT_MODE_VALUE;
    },
    GET_PRICE_IMPACT() {
      return this.dexSettingsStore.GET_PRICE_IMPACT;
    },
    GET_MAX_POOL_VOLATILITY() {
      return this.dexSettingsStore.GET_MAX_POOL_VOLATILITY;
    },
    GET_MAX_INTERMEDIATE_TOKENS() {
      return this.dexSettingsStore.GET_MAX_INTERMEDIATE_TOKENS;
    },
    GET_MAX_SPLITS() {
      return this.dexSettingsStore.GET_MAX_SPLITS;
    },
    GET_LAST_WALLET_CONNECTION_TIME() {
      return this.settingsStore.GET_LAST_WALLET_CONNECTION_TIME
    },
    tonConnectSettings() {
      return {
        manifestUrl: this.tonConnectManifest.url,
        uiPreferences: {
          theme: THEME.DARK,
        },
      };
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
            this.GET_PROOF_VERIFICATION
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
        let settings = await profileService.readStorage(
            this.GET_DEX_WALLET?.address,
            this.GET_PROOF_VERIFICATION,
        );
        if (settings?.data?.dexSettings && settings?.data?.globalSettings) {
          this.SAVE_USER_SETTINGS(settings?.data);
        } else {
          await this.setDefaultSettings();
        }
      } catch (err) {
        if (err?.response?.status === 403) {
          this.disconnectWallet();
        }
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
            const account = this.tonConnectUi.account;
            account.userFriendlyAddress = toUserFriendlyAddress(this.tonConnectUi.account.address);
            account.imgUrl = this.tonConnectUi.walletInfo.imageUrl;
            const proof = JSON.parse(localStorage.getItem('tonProof_ver') || '{}');
            if (proof) {
              this.DEX_WALLET(account);
              this.DEX_PROOF_VERIFICATION(proof);
              this.getUserSettings();
            } else {
              this.disconnectWallet();
            }
          } else {

          }
        });
      }
    },
    async getContractVersion(address) {
      try {
        let wallet = this.GET_DEX_WALLET;
        if (!wallet.version) {
          let res = await tonApiService.getWalletVersion(address);
          if (res?.data?.version > 0) {
            wallet.version = res?.data?.version;
            this.DEX_WALLET(wallet);
            this.dexStore.DEX_WALLET_VERSION(res?.data?.version);
          }
        }
      } catch (err) {
        console.error(err);
      }
    },
    checkEligibleFromStorage() {
      let eligible = JSON.parse(localStorage.getItem('hasEligible'))
      if (eligible) {
        this.limitStore.STRATEGIES_ELIGIBLE(eligible)
      }
      checkStrategiesEligible(this.tonConnectUi, this.GET_DEX_WALLET, this.GET_PROOF_VERIFICATION)

      let wallet = JSON.parse(localStorage.getItem('hasStrategiesWallet'))
      if (wallet) {
        this.limitStore.STRATEGIES_WALLET(wallet)
      }
    },
    prepareAccountData(account, walletInfo) {
      return {
        ...account,
        userFriendlyAddress: toUserFriendlyAddress(account.address),
        imgUrl: walletInfo?.imageUrl || '',
      };
    },
    getProof(address) {
      const proofKey = isInsideWalletBrowser('tonkeeper')
        ? `tonProof_ver_${address}`
        : 'tonProof_ver';

      return JSON.parse(localStorage.getItem(proofKey));
    },
    executeProofFlow(account, proof) {
      this.dexStore.DEX_WALLET(account);
      this.getContractVersion(account.userFriendlyAddress);
      this.dexStore.DEX_PROOF_VERIFICATION(proof);
      this.getUserSettings();
      this.checkEligibleFromStorage();
    },
    clearStores() {
      this.dexStore.SET_USER_TOKENS_BALANCES([]);

      this.dexStore.DEX_TON_TOKENS(this.dexStore.GET_TON_TOKENS.map(t => ({
        ...t,
        balance: 0
      })))

      this.dexStore.DEX_USER_TOKENS(this.dexStore.GET_USER_TOKENS.map(t => ({
        ...t,
        balance: 0
      })))

      this.dexStore.DEX_SEND_TOKEN({
        ...this.dexStore.GET_SEND_TOKEN,
        balance: 0
      })

      this.dexStore.DEX_RECEIVE_TOKEN({
        ...this.dexStore.GET_RECEIVE_TOKEN,
        balance: 0
      })

      this.limitStore.LIMIT_FIRST_TOKEN({
        ...this.limitStore.GET_LIMIT_FIRST_TOKEN,
        balance: 0
      })

      this.limitStore.LIMIT_SECOND_TOKEN({
        ...this.limitStore.GET_LIMIT_SECOND_TOKEN,
        balance: 0
      })

    },
    async disconnectWallet(userFriendlyAddress: string) {
      try {
        if (isInsideWalletBrowser('tonkeeper')) {
          if (userFriendlyAddress) {
            localStorage.removeItem(`tonProof_ver_${userFriendlyAddress}`);
          }

          if (this.GET_DEX_WALLET?.address) {
            localStorage.removeItem(`tonProof_ver_${this.GET_DEX_WALLET?.address}`);
          }
        }

        if (this.tonConnectUi.wallet !== null) {
          await this.tonConnectUi.disconnect();
          this.dexSettingsStore.CLEAR_DEX_SETTINGS();

          this.DEX_WALLET(null);

          this.clearStores();

          localStorage.removeItem('tonProof_ver');
          localStorage.removeItem('hasEligible');
          localStorage.removeItem('hasStrategiesWallet');
        }
      } catch (err) {
        console.error(err);
      }
    },
    tonproofSetConnect() {
      const storedVerification = JSON.parse(localStorage.getItem('tonProof_ver'));
      if (storedVerification) {
        return;
      }

      this.tonConnectUi.setConnectRequestParameters({
        state: 'ready',
        value: { tonProof: crypto.randomUUID() },
      });
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
        let dex = {
          slippage: this.GET_SLIPPAGE,
          expertMode: this.GET_EXPERT_MODE_VALUE,
          priceImpact: this.GET_PRICE_IMPACT,
          maxPoolVolatility: this.GET_MAX_POOL_VOLATILITY,
          maxIntermediateTokens: this.GET_MAX_INTERMEDIATE_TOKENS,
          maxSplits: this.GET_MAX_SPLITS,
          mevProtection: this.dexSettingsStore.GET_MEV_PROTECTION_VALUE,
          mevMinValueUsd: this.dexSettingsStore.GET_MEV_MIN_USD,
          liquiditySources: this.customLiquiditySourcesList ? this.customLiquiditySourcesList : this.dexSettingsStore.GET_LIQUIDITY_SOURCES,
        };

        await profileService.writeStorage(
          this.GET_DEX_WALLET?.address,
          this.GET_PROOF_VERIFICATION,
          {
            dexSettings: dex,
            lastWalletConnectionTime: this.GET_LAST_WALLET_CONNECTION_TIME
          },
        );
      } catch (err) {
        console.error(err);
      }
    },
  },
  watch: {
    widgetTheme: {
      immediate: true,
      handler(newTheme: string) {
        this.settingsStore.SET_THEME(newTheme);
      },
    }
  }
};
