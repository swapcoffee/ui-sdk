<template>
    <div class="interface">
        <div class="interface__swap">
            <SwapFieldController
                :firstToken="getTokens.first"
                :secondToken="getTokens.second"
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
                    v-if="getRouteName === 'Dex'"
                    :interfaceStatus="interfaceStatus"
                />
                <LimitButtonWrapper
                    v-if="getRouteName === 'Limit' || getRouteName === 'Dca'"
                    :interfaceStatus="interfaceStatus"
                />
            </div>
        </div>
        <DexDetails
            v-if="routeInfo && tokenValues?.second > 0 && tokenValues?.first !== ''"
        />
        <LimitDetails
            v-if="getRouteName === 'Limit' && Number(tokenValues?.rate) > 0 && tokenValues?.first !== ''"
        />
        <DcaDetails
            v-if="getRouteName === 'Dca' && Number(tokenValues?.first) > 0 && tokenValues?.first !== ''"
        />
    </div>
</template>

<script lang="ts">
import SwapFieldController from "@/components/swap-interface/SwapFieldController.vue";
import SwapButton from "@/components/swap-interface/SwapButton.vue";
import SwapHeader from "@/components/swap-interface/SwapHeader.vue";
import DexInfo from "@/components/dex/DexInfo.vue";
import DexReverseInfo from "@/components/dex/DexReverseInfo.vue";
import DexButton from "@/components/dex/DexButton.vue";
import DexStakeButton from "@/components/dex/DexStakeButton.vue";
import DexUnstakeButton from "@/components/dex/DexUnstakeButton.vue";
import TokensPopup from "@/components/dex/tokens-popup/TokensPopup.vue";
import computedMixins from "@/mixins/computedMixins.ts"
import WalletIcon from "@/assets/earn/swap-interface/WalletIcon.vue";
import DexButtonWrapper from "@/components/dex/DexButtonWrapper.vue";
import DexDetails from "@/components/dex/DexDetails.vue";
import LimitButtonWrapper from "@/components/limit/LimitButtonWrapper.vue";
import SwapInfo from "@/components/swap-interface/SwapInfo.vue";
import LimitDetails from "@/components/limit/LimitDetails.vue";
import DcaDetails from "@/components/dca/DcaDetails.vue";
import {useDexStore} from "@/stores/dex";
import {useLimitStore} from "@/stores/limit";

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
        DexButton,
        DexReverseInfo,
        DexInfo,
        SwapHeader,
        SwapButton,
        SwapFieldController
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
        dexStore() {
              return useDexStore();
        },
        limitStore() {
              return useLimitStore();
        },
        getTokens() {
            if (this.getRouteName === 'Dex') {
                return {
                    first: this.dexStore.GET_SEND_TOKEN,
                    second: this.dexStore.GET_RECEIVE_TOKEN
                }
            } else if (this.getRouteName === 'Limit' || this.getRouteName === 'Dca') {
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
