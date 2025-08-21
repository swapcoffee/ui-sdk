<template>
  <modal-wrapper
      class="modal"
      :title="$t('dexSettings.caption')"
      :padding-zero="true"
      @closeModal="$emit('closeModal')"
  >
    <div class="modal__content custom-scroll">
      <SwapSettingsTabs
          v-if="dexStore.GET_SWAP_ACTIVE_TAB === SwapActiveTab.Dex && isListedPair"
          :smartMode="smartModeCondition"
          @updateSmartMode="updateSmartMode"
      />
      <div class="settings-wrapper">
        <template v-for="item in currentSettings" :key="item.id">
          <component :is="item.component" v-bind="item.props" v-if="item.visible"/>
        </template>
      </div>
      <SmartModeInfo v-if="smartModeCondition"/>
    </div>
  </modal-wrapper>
</template>

<script lang="ts">
import SwitchToggle from "@/components/ui/SwitchToggle.vue"
import ModalSettingsItem from "@/components/general/ModalSettingsItem.vue"
import computedMixins from "@/mixins/computedMixins.js"
import {DEXES} from "@/utils/dexes.ts";
import SmartModeIcon from "@/assets/dex/icons/SmartModeIcon.vue"
import SwapSettingsTabs from "@/components/dex/settings/SwapSettingsTabs.vue"
import ModalSettingsToggle from "@/components/general/ModalSettingsToggle.vue"
import ModalSettingsAdditionalInfo from "@/components/general/ModalSettingsAdditionalInfo.vue"
import {
  changeLiquiditySources,
  changeMaxIntermediateTokens,
  changeMaxPoolVolatility,
  changeMaxSplits,
  changeMevMinVolume,
  changePriceImpact,
  changeSlippage,
  checkStorageSettings,
  toggleExpertMode,
  toggleMevProtection,
  toggleSmartMode,
} from "@/helpers/swap-interface/swap-settings.ts"
import ModalSettingsSources from "@/components/general/ModalSettingsSources.vue"
import SmartModeInfo from "@/components/dex/settings/SmartModeInfo.vue"
import DexPageTest from "@/ui/dex/DexPageTest.vue";
import {useDexStore} from "@/stores/dex";
import {SwapActiveTab} from "@/utils/types.ts";
import {useDexSettingsStore} from "@/stores/dex/settings.ts";

export default {
  name: "SwapSettingsModal",
  components: {
    DexPageTest,
    SmartModeInfo,
    ModalSettingsSources,
    ModalSettingsAdditionalInfo,
    ModalSettingsToggle,
    SwapSettingsTabs,
    SmartModeIcon,
    ModalSettingsItem,
    SwitchToggle,
  },
  mixins: [computedMixins],
  provide() {
    return {
      settingsValue: this.settingsValue,
      settingsUpdaters: this.settingsUpdaters,
    }
  },
  props: {
    isListedPair: {
      type: Boolean,
      default() {
        return false
      },
    },
  },
  data() {
    return {
      settingsUpdaters: {
        smart_mode: this.updateSmartMode,
        mev_protection: this.updateMevProtection,
        expert_mode: this.updateExpertMode,
        slippage: this.updateSlippage,
        price_impact: this.updatePriceImpact,
        min_swap_amount: this.updateMevMinVolume,
        intermediate_tokens: this.updateMaxIntermediateTokens,
        max_volatility: this.updateMaxVolatility,
        splits: this.updateMaxSplits,
        liquidity_sources: this.updateLiquiditySources,
      },
      // TODO: протестить новые значения
      settingsValue: {
        // smart_mode: false,
        // mev_protection: false,
        // expert_mode: false,
        slippage: {
          value: 0,
          custom: "",
        },
        price_impact: {
          value: 0,
          custom: "",
        },
        min_swap_amount: {
          value: 0,
          custom: "",
        },
        intermediate_tokens: {
          value: 0,
        },
        max_volatility: {
          value: 0,
        },
        splits: {
          value: 0,
          custom: ""
        },
        liquidity_sources: DEXES.map((it) => ({...it, enabled: true})),
      },
    }
  },
  computed: {
    SwapActiveTab() {
      return SwapActiveTab
    },
    dexStore() {
      return useDexStore()
    },
    dexSettingsStore() {
      return useDexSettingsStore()
    },
    smartSettings() {
      return [
        {
          id: 1,
          props: {
            type: "price_impact",
            title: this.$t("dexSettings.priceImpact.title"),
            text: this.$t("dexSettings.priceImpact.text"),
            defaultValues: [5, 10, 30],
            symbol: "%",
            inputRanges: [0.1, 100],
          },
          visible: this.dexSettingsStore.GET_SMART_MODE_VALUE,
          component: ModalSettingsItem,
        },
      ]
    },
    settings() {
      const array = [
        {
          id: 2,
          props: {
            type: "slippage",
            title: this.$t("dexSettings.slippage.title"),
            text: this.$t("dexSettings.slippage.text"),
            defaultValues: [1, 5, 10],
            symbol: "%",
            inputRanges: [0.1, 100],
          },
          visible: !this.smartModeCondition,
          component: ModalSettingsItem,
        },
        {
          id: 3,
          props: {
            type: "mev_protection",
            title: this.$t("mevProtect.settings.first.title"),
            text: this.$t("mevProtect.settings.first.description"),
            currentValue: this.settingsValue.mev_protection,
          },
          visible: this.mevProtectCondition,
          component: ModalSettingsToggle,
        },
        {
          id: 4,
          props: {
            type: "min_swap_amount",
            title: this.$t("mevProtect.settings.third.title"),
            text: this.$t("mevProtect.settings.third.description"),
            defaultValues: [10, 100, 500, 1000],
            symbol: "$",
            inputRanges: [10, 1000],
          },
          visible: this.dexSettingsStore.GET_MEV_PROTECTION_VALUE,
          component: ModalSettingsItem,
        },
        {
          id: 5,
          props: {
            type: "mev_additional_info",
            title: this.$t("mevProtect.settings.fourth.title"),
            textList: [
              this.$t("mevProtect.settings.fourth.description1"),
              this.$t("mevProtect.settings.fourth.description2"),
              this.$t("mevProtect.settings.fourth.description3"),
            ],
          },
          visible: this.dexSettingsStore.GET_MEV_PROTECTION_VALUE,
          component: ModalSettingsAdditionalInfo,
        },
        {
          id: 6,
          props: {
            type: "expert_mode",
            title: this.$t("dexSettings.expert.title"),
            text: this.$t("dexSettings.expert.text"),
            currentValue: this.settingsValue.expert_mode,
          },
          visible: !this.smartModeCondition,
          component: ModalSettingsToggle,
        },
        {
          id: 7,
          props: {
            type: "price_impact",
            title: this.$t("dexSettings.priceImpact.title"),
            text: this.$t("dexSettings.priceImpact.text"),
            defaultValues: [5, 10, 30],
            symbol: "%",
            inputRanges: [0.1, 100],
          },
          visible: this.dexSettingsStore.GET_EXPERT_MODE_VALUE,
          component: ModalSettingsItem,
        },
        {
          id: 8,
          props: {
            type: "intermediate_tokens",
            title: this.$t("dexSettings.intermediate.title"),
            text: this.$t("dexSettings.intermediate.text"),
            defaultValues: [0, 1, 2, 3],
            withoutInput: true,
          },
          visible: this.dexSettingsStore.GET_EXPERT_MODE_VALUE,
          component: ModalSettingsItem,
        },
        {
          id: 9,
          props: {
            type: "max_volatility",
            title: this.$t("dexSettings.volatility.title"),
            text: this.$t("dexSettings.volatility.text"),
            defaultValues: [5, 15, 30, -1],
            symbol: "%",
            withoutInput: true,
          },
          visible: this.dexSettingsStore.GET_EXPERT_MODE_VALUE,
          component: ModalSettingsItem,
        },
        {
          id: 10,
          props: {
            type: "splits",
            title: this.$t("dexSettings.parallel.title"),
            text: this.$t("dexSettings.parallel.newText"),
            defaultValues: this.isV5 ? [1, 5, 10, 20] : [1, 2, 3, 4],
            withoutInput: !this.isV5,
            inputRanges: [1, 20],
          },
          visible: this.dexSettingsStore.GET_EXPERT_MODE_VALUE && this.dexStore.GET_SWAP_ACTIVE_TAB === SwapActiveTab.Dex,
          component: ModalSettingsItem,
        },
        {
          id: 11,
          props: {
            type: "liquidity_sources",
            title: this.$t("dexSettings.sources.title"),
            text: this.$t("dexSettings.sources.text"),
          },
          visible: this.dexSettingsStore.GET_EXPERT_MODE_VALUE,
          component: ModalSettingsSources,
        },
      ]

      return array
    },
    smartModeCondition() {
      return this.dexStore.GET_SWAP_ACTIVE_TAB === SwapActiveTab.Dex && this.dexSettingsStore.GET_SMART_MODE_VALUE && this.isListedPair
    },
    mevProtectCondition() {
      return (
          (this.dexStore.GET_SWAP_ACTIVE_TAB === SwapActiveTab.Dex && !this.dexSettingsStore.GET_SMART_MODE_VALUE && this.isListedPair) ||
          (this.dexStore.GET_SWAP_ACTIVE_TAB === SwapActiveTab.Multi && this.isListedPair)
      )
    },
    currentSettings() {
      if (this.smartModeCondition) {
        return this.smartSettings
      }

      return this.settings
    },
    isV5() {
      return this.dexStore.GET_DEX_WALLET_VERSION >= 5
    },
  },
  methods: {
    updateSmartMode(value) {
      this.isListedPair ? toggleSmartMode(value) : toggleSmartMode(false)
    },
    updateMevProtection(value) {
      toggleMevProtection(value)
    },
    updateExpertMode(value) {
      toggleExpertMode(value)
    },
    updateSlippage(value, mode) {
      if (mode === "value") {
        this.settingsValue.slippage.value = value
        this.settingsValue.slippage.custom = ""
      } else {
        this.settingsValue.slippage.value = +value
        this.settingsValue.slippage.custom = value
      }

      changeSlippage(value)
    },
    updatePriceImpact(value, mode) {
      if (mode === "value") {
        this.settingsValue.price_impact.value = value
        this.settingsValue.price_impact.custom = ""
      } else {
        this.settingsValue.price_impact.value = +value
        this.settingsValue.price_impact.custom = value
      }

      changePriceImpact(value)
    },
    updateMevMinVolume(value, mode) {
      if (mode === "value") {
        this.settingsValue.min_swap_amount.value = value
        this.settingsValue.min_swap_amount.custom = ""
      } else {
        this.settingsValue.min_swap_amount.value = +value
        this.settingsValue.min_swap_amount.custom = value
      }

      changeMevMinVolume(value)
    },
    updateMaxIntermediateTokens(value) {
      this.settingsValue.intermediate_tokens.value = value
      changeMaxIntermediateTokens(value)
    },
    updateMaxVolatility(value) {
      this.settingsValue.max_volatility.value = value
      changeMaxPoolVolatility(value)
    },
    updateMaxSplits(value, mode) {
      if (mode === "value") {
        this.settingsValue.splits.value = value
        this.settingsValue.splits.custom = ""
      } else {
        this.settingsValue.splits.value = +value
        this.settingsValue.splits.custom = value
      }
      changeMaxSplits(value)
    },
    updateLiquiditySources(value) {
      this.settingsValue.liquidity_sources.map((item) => {
        if (value === item.id) {
          item.enabled = !item.enabled
        }
      })
      const enabledSources = this.settingsValue.liquidity_sources
          .filter((e) => e.enabled)
          .map((e) => e.id)
      changeLiquiditySources(enabledSources)
    },
    localStateUpdate() {
      const array = [
        {mode: "slippage", data: this.dexSettingsStore.GET_SLIPPAGE},
        {mode: "price_impact", data: this.dexSettingsStore.GET_PRICE_IMPACT},
        {mode: "min_swap_amount", data: this.dexSettingsStore.GET_MEV_MIN_USD},
        {mode: "splits", data: this.dexSettingsStore.GET_MAX_SPLITS}
      ]

      array.forEach(({mode, data}) => {
        this.settingsValue[mode].value = data

        const find = this.settings.find((item) => item.props.type === mode)

        if (find && !find.props.defaultValues.includes(data)) {
          this.settingsValue[mode].custom = data
        }
      })

      this.settingsValue.intermediate_tokens.value = this.dexSettingsStore.GET_MAX_INTERMEDIATE_TOKENS
      this.settingsValue.max_volatility.value = this.dexSettingsStore.GET_MAX_POOL_VOLATILITY
      this.settingsValue.splits.value = this.dexSettingsStore.GET_MAX_SPLITS
      this.settingsValue.liquidity_sources = DEXES.map((item) => ({
        ...item,
        enabled: this.dexSettingsStore.GET_LIQUIDITY_SOURCES.find((it) => it === item?.id),
      }))
    },
    expertStateUpdate() {
      this.settingsValue.intermediate_tokens.value = this.dexSettingsStore.GET_MAX_INTERMEDIATE_TOKENS
      this.settingsValue.max_volatility.value = this.dexSettingsStore.GET_MAX_POOL_VOLATILITY
      this.settingsValue.splits.value = this.dexSettingsStore.GET_MAX_SPLITS

      this.settingsValue.liquidity_sources = DEXES.map((item) => ({
        ...item,
        enabled: this.dexSettingsStore.GET_LIQUIDITY_SOURCES.find((it) => it === item?.id),
      }))
    },
  },
  created() {
    checkStorageSettings(this)
    this.localStateUpdate()
  },
  watch: {
    GET_USER_SETTINGS: {
      handler() {
        checkStorageSettings(this)
      },
    },
  },
}
</script>

<style scoped>
.modal__content {
  max-height: 582px;
  height: auto;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 0 18px 18px 18px;
}

.settings:not(:first-child) {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid var(--iface-white6);
}

@media screen and (max-width: 768px) {
  .modal__content {
    max-height: calc(100dvh - 66px);
  }
}

@media screen and (max-height: 600px) {
  .modal__content {
    max-height: calc(100dvh - 66px);
  }
}
</style>