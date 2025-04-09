import { useSettingsStore } from "@/stores/settings";
import { useDexSettingsStore } from "@/stores/dex/settings";

export default {
  data() {
    return {};
  },
  inject: ['liquiditySourcesList'],
  computed: {
    dexSettingsStore() {
      return useDexSettingsStore();
    },
    settingsStore() {
      return useSettingsStore();
    }
  },
  methods: {
    async checkStorageSettings() {
      try {
        let settings = this.settingsStore.GET_USER_SETTINGS?.dexSettings;
        if (!settings) {
          let storage = JSON.parse(localStorage.getItem('dexSettings'))?.dexSettings;
          if (storage) {
            settings = storage;
          } else {
            settings = {};
          }
        }

        if (settings.hasOwnProperty('expertMode')) {
          this.dexSettingsStore.DEX_EXPERT_MODE(settings.expertMode);
        }
        if (settings.hasOwnProperty('slippage')) this.dexSettingsStore.DEX_SLIPPAGE(Number(settings.slippage));

        if (settings.hasOwnProperty('cashback')) {
          delete settings.cashback;
        }

        if (this.dexSettingsStore.GET_EXPERT_MODE_VALUE) {
          if (settings.hasOwnProperty('priceImpact')) this.dexSettingsStore.DEX_PRICE_IMPACT(settings.priceImpact);

          if (settings.hasOwnProperty('maxPoolVolatility'))
            this.dexSettingsStore.DEX_MAX_POOL_VOLATILITY(settings.maxPoolVolatility);

          if (settings.hasOwnProperty('maxIntermediateTokens'))
            this.dexSettingsStore.DEX_MAX_INTERMEDIATE_TOKENS(settings.maxIntermediateTokens);

          if (settings.hasOwnProperty('maxSplits')) this.dexSettingsStore.DEX_MAX_SPLITS(settings.maxSplits);

          if (settings.hasOwnProperty('liquiditySources')) {
            if (this.liquiditySourcesList?.length > 0) return;
            this.dexSettingsStore.DEX_LIQUIDITY_SOURCES(settings.liquiditySources);
          }
        }
      } catch (err) {
        console.error(err);
      }
    },
  },
  mounted() {
    setTimeout(() => {
      this.checkStorageSettings();
    }, 10);
  },
};
