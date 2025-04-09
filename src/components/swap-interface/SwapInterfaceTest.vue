<template>
    <div class="interface">
        <div
            class="interface__swap"
            :class="{ 'interface__swap--green': dexSettingsStore.GET_MEV_PROTECTION_VALUE && dexStore.GET_SWAP_ACTIVE_TAB === SwapActiveTab.Dex }"
        >
            <MevPlug v-if="dexStore.GET_SWAP_ACTIVE_TAB === SwapActiveTab.Dex" />
            <SwapFieldController
                :firstToken="getTokens?.first"
                :secondToken="getTokens?.second"
                :routeInfo="routeInfo"
                :interfaceStatus="interfaceStatus"
            />
            <transition name="slide-info">
                <DexInfo
                    v-show="interfaceStatus === 'HIGH_PRICE_IMPACT' && swapMode !== 'reverse'"
                />
            </transition>
            <transition name="slide-reverse">
                <DexReverseInfo v-show="swapMode === 'reverse'"/>
            </transition>
<!--            <SwapInfo-->
<!--                v-if="getRouteName === 'Limit' && !GET_STRATEGIES_ELIGIBLE && GET_DEX_WALLET"-->
<!--                :title="'Strategies info'"-->
<!--                :text="'To access the limits you need to stake at least 1000 CES'"-->
<!--            />-->
            <div class="interface__button-wrapper">
                <DexButtonWrapper
                    v-if="dexStore.GET_SWAP_ACTIVE_TAB === SwapActiveTab.Dex"
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
import SwapInfo from "@/components/swap-interface/SwapInfo.vue";
import LimitDetails from "@/components/limit/LimitDetails.vue";
import DcaDetails from "@/components/dca/DcaDetails.vue";
import MevPlug from "@/components/dex/MevPlug.vue";

export default {
    name: "SwapInterfaceTest",
    components: {
	    DcaDetails,
        LimitDetails,
        SwapInfo,
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
            }
        },
        routeInfo: {
            type: Object,
            default() {
                return {}
            }
        },
        interfaceStatus: {
            type: String,
            default() {
                return ''
            }
        },
        swapMode: {
            type: String,
            default() {
                return 'default'
            }
        },
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
    mounted() {},
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
    padding: 6px;
    border-radius: 14px;
    border: 1px solid var(--iface-white6);
}

.interface__swap--green {
  position: relative;
  background: linear-gradient(var(--earn-bg), var(--earn-bg)) padding-box,
  linear-gradient(
      var(--angle),
      rgba(153, 255, 148, 0.06),
      rgba(153, 255, 148, 0.1)
  ) border-box;
  animation: 6s snake linear infinite;
}

.theme-light .interface__swap--green {
  border: 1px solid rgba(13, 13, 13, 0.06);
}

.theme-light .interface__swap--green {
  background: linear-gradient(var(--earn-bg), var(--earn-bg)) padding-box,
  linear-gradient(
      var(--angle),
      rgba(13, 13, 13, 0.06),
      rgba(153, 255, 148, 1)
  ) border-box;
}

.theme-light .interface__swap--green::after {
  background: rgba(95, 180, 159, 0.04);
}

.interface__swap--green::after {
  content: "";
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
        flex-direction: row;
        padding: 10px;
        background: linear-gradient(180deg, rgba(16, 16, 16, 0.00) 0%, rgba(16, 16, 16, 0.30) 10%, #101010 100%);
    }

    .theme-light .interface__button-wrapper {
        background: linear-gradient(180deg, rgba(255, 255, 255, 0.00) 0%, rgba(255, 255, 255, 0.30) 10%, #FFF 100%);
    }
}
</style>
