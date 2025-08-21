<template>
  <div class="interface">
    <div
        class="interface__swap"
        :class="{'smart_mode': smartModeCondition, 'mev_protect': mevCondition}"
    >
      <SmartModePlug
          v-if="dexStore.GET_SWAP_ACTIVE_TAB === SwapActiveTab.Dex"
          :isListedPair="isListedPair"
      />
      <MevPlug
          v-if="dexStore.GET_SWAP_ACTIVE_TAB === SwapActiveTab.Multi"
          :isListedPair="isListedPair"
      />
      <AddAssetButton
          @click="addAsset"
          v-if="dexStore.GET_SWAP_ACTIVE_TAB === SwapActiveTab.Multi && assetButtonCondition"
      />
      <MultiSwapController
          v-if="dexStore.GET_SWAP_ACTIVE_TAB === SwapActiveTab.Multi"
          :routeInfo="routeInfo"
      />
      <SwapFieldController
          v-else
          :firstToken="getTokens.first"
          :secondToken="getTokens.second"
          :routeInfo="routeInfo"
          :interfaceStatus="interfaceStatus"
      />
      <template
          v-for="(item, index) in infoList"
          :key="index"
      >
        <SwapInfo
            v-if="item.condition"
            :mode="item.mode"
            :title="item.title"
            :text="item.text"
        />
      </template>
      <div class="interface__button-wrapper">
        <DexButtonWrapper
            v-if="dexStore.GET_SWAP_ACTIVE_TAB === SwapActiveTab.Dex"
            :interfaceStatus="interfaceStatus"
        />
        <MultiSwapButtonWrapper
            v-if="dexStore.GET_SWAP_ACTIVE_TAB === SwapActiveTab.Multi"
            :interfaceStatus="interfaceStatus"
        />
        <LimitButtonWrapper
            v-if="dexStore.GET_SWAP_ACTIVE_TAB === SwapActiveTab.Limit || dexStore.GET_SWAP_ACTIVE_TAB === SwapActiveTab.DCA"
            :interfaceStatus="interfaceStatus"
        />
      </div>
    </div>
    <DexDetails
        v-if="routeInfo && tokenValues?.second > 0 && tokenValues?.first !== ''"
    />
    <LimitDetails
        v-if="dexStore.GET_SWAP_ACTIVE_TAB === SwapActiveTab.Limit && Number(tokenValues?.rate) > 0 && tokenValues?.first !== ''"
    />
    <DcaDetails
        v-if="dexStore.GET_SWAP_ACTIVE_TAB === SwapActiveTab.DCA && Number(tokenValues?.first) > 0 && tokenValues?.first !== ''"
    />
  </div>
</template>

<script lang="ts">
import computedMixins from "@/mixins/computedMixins.ts"

import {SwapActiveTab} from "@/utils/types.ts";

import {useDexStore} from "@/stores/dex";
import {useLimitStore} from "@/stores/limit";
import {useDexSettingsStore} from "@/stores/dex/settings.ts";

import SwapFieldController from "@/components/swap-interface/SwapFieldController.vue";
import SwapButton from "@/components/swap-interface/SwapButton.vue";
import SwapHeader from "@/components/swap-interface/SwapHeader.vue";
import DexInfo from "@/components/dex/DexInfo.vue";
import DexReverseInfo from "@/components/dex/DexReverseInfo.vue";
import DexStakeButton from "@/components/dex/DexStakeButton.vue";
import DexUnstakeButton from "@/components/dex/DexUnstakeButton.vue";
import TokensPopup from "@/components/dex/tokens-popup/TokensPopup.vue";
import WalletIcon from "@/assets/earn/swap-interface/WalletIcon.vue";
import DexButtonWrapper from "@/components/dex/DexButtonWrapper.vue";
import DexDetails from "@/components/dex/DexDetails.vue";
import LimitButtonWrapper from "@/components/limit/LimitButtonWrapper.vue";

import LimitDetails from "@/components/limit/LimitDetails.vue";
import DcaDetails from "@/components/dca/DcaDetails.vue";
import MevPlug from "@/components/dex/mev/MevPlug.vue";
import SmartModePlug from "@/components/dex/settings/SmartModePlug.vue";
import AddAssetButton from "@/components/multi-swap/AddAssetButton.vue";
import MultiSwapController from "@/components/multi-swap/MultiSwapController.vue";
import SwapInfo from "@/components/swap-interface/SwapInfo.vue";
import MultiSwapButtonWrapper from "@/components/multi-swap/MultiSwapButtonWrapper.vue";

export default {
  name: "SwapInterface",
  components: {
    MultiSwapButtonWrapper,
    SwapInfo,
    MultiSwapController,
    AddAssetButton,
    SmartModePlug,
    DcaDetails,
    LimitDetails,
    LimitButtonWrapper,
    DexDetails,
    DexButtonWrapper,
    WalletIcon,
    TokensPopup,
    DexUnstakeButton,
    DexStakeButton,
    DexReverseInfo,
    DexInfo,
    SwapHeader,
    SwapButton,
    SwapFieldController,
    MevPlug
  },
  mixins: [computedMixins],
  inject: ['tokenValues'],
  props: {
    tonConnectUi: {
      type: Object,
      default() {
        return {}
      },
    },
    routeInfo: {
      type: Object,
      default() {
        return {}
      },
    },
    interfaceStatus: {
      type: String,
      default() {
        return ""
      },
    },
    swapMode: {
      type: String,
      default() {
        return "default"
      },
    },
    isListedPair: {
      type: Boolean,
      default() {
        return false
      }
    }
  },
  data() {
    return {}
  },
  computed: {
    SwapActiveTab() {
      return SwapActiveTab
    },
    dexStore() {
      return useDexStore();
    },
    limitStore() {
      return useLimitStore();
    },
    dexSettingsStore() {
      return useDexSettingsStore()
    },
    smartModeCondition() {
      return this.dexSettingsStore.GET_SMART_MODE_VALUE && this.dexStore.GET_SWAP_ACTIVE_TAB === SwapActiveTab.Dex && this.isListedPair
    },
    mevCondition() {
      return this.dexSettingsStore.GET_MEV_PROTECTION_VALUE && this.dexStore.GET_SWAP_ACTIVE_TAB === SwapActiveTab.Multi && this.isListedPair
    },
    assetButtonCondition() {
      return !(
          (this.dexStore.GET_DEX_WALLET_VERSION === 5 && this.dexStore.GET_SEND_MULTI_TOKENS?.size >= 20) ||
          ((!this.dexStore.GET_DEX_WALLET || this.dexStore.GET_DEX_WALLET_VERSION === 4) &&
              this.dexStore.GET_SEND_MULTI_TOKENS?.size >= 4)
      )
    },
    infoList() {
      return [
        {
          condition:
              this.interfaceStatus === "HIGH_PRICE_IMPACT" && this.swapMode !== "reverse",
          title: this.$t("dexInfo.highPriceImpact", { priceImpact: this.getPriceImpact }),
          text: this.$t("dexInfo.priceImpact"),
          mode: "swap",
        },
        {
          condition: this.swapMode === "reverse",
          title: this.$t("dexInfo.exactOut"),
          text: this.$t("dexInfo.reverseSwap"),
          mode: "reverse",
        },
      ]
    },
    getPriceImpact() {
      if (this.dexStore.GET_CALCULATED_PI) {
        return this.dexStore.GET_CALCULATED_PI
      } else {
        return 0
      }
    },
    getTokens() {
      if (this.dexStore.GET_SWAP_ACTIVE_TAB === SwapActiveTab.Dex) {
        return {
          first: this.dexStore.GET_SEND_TOKEN,
          second: this.dexStore.GET_RECEIVE_TOKEN
        }
      } else if (this.dexStore.GET_SWAP_ACTIVE_TAB === SwapActiveTab.Limit || this.dexStore.GET_SWAP_ACTIVE_TAB === SwapActiveTab.DCA) {
        return {
          first: this.limitStore.GET_LIMIT_FIRST_TOKEN,
          second: this.limitStore.GET_LIMIT_SECOND_TOKEN
        }
      }
    },
  },
  methods: {
    addAsset() {
      if (this.assetButtonCondition) {
        this.addNewAsset()
      }
    },
  },
}
</script>

<style scoped>
.interface {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.interface__swap {
  display: flex;
  flex-direction: column;
  gap: 6px;
  position: relative;
  padding: 6px;
  border-radius: 14px;
  border: 1px solid var(--iface-white6);
}

.smart_mode {
  position: relative;
  background:
      linear-gradient(var(--earn-bg), var(--earn-bg)) padding-box,
      linear-gradient(var(--angle), rgba(211, 190, 178, 0.1), rgba(211, 190, 178, 0.1), rgba(211, 190, 178, 1))
      border-box;
  animation: 6s snake linear infinite;
}

.theme-light .smart_mode {
  border: 1px solid rgba(35, 39, 57, 0.1);
  background:
      linear-gradient(var(--earn-bg), var(--earn-bg)) padding-box,
      linear-gradient(var(--angle), rgba(35, 39, 57, 0.1), rgba(35, 39, 57, 0.1), rgba(35, 39, 57, 1)) border-box;
}

.theme-light .smart_mode::after {
  background: rgba(35, 39, 57, 0.04);
}

.smart_mode::after {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(211, 190, 178, 0.04);
  pointer-events: none;
  border-radius: inherit;
}

.mev_protect {
  position: relative;
  background: linear-gradient(var(--earn-bg), var(--earn-bg)) padding-box,
  linear-gradient(
      var(--angle),
      rgba(153, 255, 148, 0.06),
      rgba(153, 255, 148, 0.60)
  ) border-box;
  animation: 6s snake linear infinite;
}

.theme-light .mev_protect {
  border: 1px solid rgba(13, 13, 13, 0.06);
  background: linear-gradient(var(--earn-bg), var(--earn-bg)) padding-box,
  linear-gradient(
      var(--angle),
      rgba(13, 13, 13, 0.06),
      rgba(153, 255, 148, 1)
  ) border-box;
}

.theme-light .mev_protect::after {
  background: rgba(95, 180, 159, 0.04);
}

.mev_protect::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(127, 255, 15, 0.02);
  pointer-events: none;
  border-radius: inherit;
}


@keyframes snake {
  to {
    --angle: 360deg;
  }
}

@property --angle {
  syntax: "<angle>";
  initial-value: 0deg;
  inherits: false;
}

.interface__button-wrapper {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

@media screen and (max-width: 576px) {
  .interface__button-wrapper {
    position: fixed;
    bottom: 0;
    right: 0;
    left: 0;
    z-index: 100;
    padding: 10px;
    flex-direction: row;
    background: linear-gradient(
        180deg,
        rgba(16, 16, 16, 0) 0%,
        rgba(16, 16, 16, 0.3) 10%,
        #101010 100%
    );
  }

  .interface__button-wrapper--bridge {
    flex-direction: column !important;
  }

  .theme-light .interface__button-wrapper {
    background: linear-gradient(
        180deg,
        rgba(255, 255, 255, 0) 0%,
        rgba(255, 255, 255, 0.3) 10%,
        #fff 100%
    );
  }
}
</style>
