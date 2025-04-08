<template>
    <div class="fields">
        <SwapField
            :title="getFirstTitle"
            :position="'up'"
            :token="firstToken"
            :routeInfo="routeInfo"
        />
        <button class="fields__swap-btn"
                v-if="!withoutSwitch"
                :disabled="!canSwapTokenPositions"
                @click="swapPositions"
        >
            <SwitchTokenIcon class="icon"/>
        </button>
        <div class="fields__without-switch"
            v-else
        >
            <DisabledSwitch />
        </div>
        <SwapField
            :title="getSecondTitle"
            :position="getSecondPosition"
            :token="secondToken"
            :routeInfo="routeInfo"
        />
        <LimitTokenRate
            v-if="dexStore.GET_SWAP_ACTIVE_TAB === SwapActiveTab.Limit"
            :position="'middle'"
            :first="firstToken"
            :second="secondToken"
        />
        <LimitSubordersField
            v-if="dexStore.GET_SWAP_ACTIVE_TAB === SwapActiveTab.Limit"
            :position="'down'"
        />
        <DcaSettingsField
            v-if="dexStore.GET_SWAP_ACTIVE_TAB === SwapActiveTab.DCA"
        />
        <DcaRangeField
            v-if="dexStore.GET_SWAP_ACTIVE_TAB === SwapActiveTab.DCA"
            :position="'down'"
        />
        <SwapInterfacePlug
            v-if="plugCondition"
            :title="getPlugTitle"
            :firstText="getPlugFirstText"
            :secondText="getPlugSecondText"
        />
    </div>
</template>

<script lang="ts">
import SwapField from "@/components/swap-interface/SwapField.vue";
import SwitchTokenIcon from "@/assets/earn/swap-interface/SwitchTokenIcon.vue";
import SwapEmpty from "@/components/swap-interface/SwapEmpty.vue";
import DisabledSwitch from "@/assets/earn/swap-interface/DisabledSwitch.vue";
import computedMixins from "@/mixins/computedMixins.ts"
import LimitTokenRate from "@/components/limit/LimitTokenRate.vue";
import SwapCoffeeDarkIcon from "@/assets/limit/SwapCoffeeDarkIcon.vue";
import SwapInterfacePlug from "@/components/swap-interface/SwapInterfacePlug.vue";
import LimitSubordersField from "@/components/limit/LimitSubordersField.vue";
import DcaSettingsField from "@/components/dca/DcaSettingsField.vue";
import DcaRangeField from "@/components/dca/DcaRangeField.vue";


import {useDexStore} from "@/stores/dex";
import {SwapActiveTab} from "@/utils/types.ts";

export default {
    name: "SwapFieldController",
    mixins: [computedMixins],
    components: {
        DcaRangeField,
        DcaSettingsField,
        LimitSubordersField,
        SwapInterfacePlug,
        SwapCoffeeDarkIcon,
        LimitTokenRate,
        DisabledSwitch,
        SwapEmpty,
        SwitchTokenIcon,
        SwapField
    },
    props: {
        withoutSwitch: {
            type: Boolean,
            default() {
                return false
            }
        },
        firstToken: {
            type: [Object, null],
            default() {
                return {}
            },
            required: true
        },
        secondToken: {
            type: [Object, null],
            default() {
                return {}
            },
            required: true
        },
        routeInfo: {
            type: [Object, null],
            default() {
                return {}
            },
            required: true
        },
        interfaceStatus: {
            type: String,
            default() {
                return ''
            }
        },
    },
    inject: ['updateTokenModalVisible', 'updateTokenPositions'],
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
        plugCondition() {
			return (this.dexStore.GET_SWAP_ACTIVE_TAB === SwapActiveTab.Limit || this.dexStore.GET_SWAP_ACTIVE_TAB === SwapActiveTab.DCA)
				&& (!this.dexStore.GET_DEX_WALLET || this.interfaceStatus === 'NOT_ELIGIBLE' || this.interfaceStatus === 'NOT_STRATEGIES_WALLET')
        },
        getPlugTitle() {
            if (this.interfaceStatus === 'NOT_ELIGIBLE' || !this.dexStore.GET_DEX_WALLET) {
                return this.$t('swapPlug.titleClosed')
            } else if (this.interfaceStatus === 'NOT_STRATEGIES_WALLET') {
                return this.$t('swapPlug.titleReady')
            } else if (this.interfaceStatus === "LOADING") {
                return this.$t('swapPlug.titleLoading')
            }
        },
        getPlugFirstText() {
            if (this.interfaceStatus === 'NOT_ELIGIBLE' || !this.dexStore.GET_DEX_WALLET) {
                return this.$t('swapPlug.descriptionTextClosed')
            } else if (this.interfaceStatus === 'NOT_STRATEGIES_WALLET') {
                return this.$t('swapPlug.descriptionTextReady')
            } else if (this.interfaceStatus === "LOADING") {
                return this.$t('swapPlug.descriptionTextLoading')
            }
        },
        getPlugSecondText() {
            if (this.interfaceStatus === 'NOT_ELIGIBLE' || !this.dexStore.GET_DEX_WALLET) {
                return this.$t('swapPlug.description2TextClosed')
            } else if (this.interfaceStatus === 'NOT_STRATEGIES_WALLET') {
                return this.$t(`swapPlug.description2TextReady`)
            }
        },
        canSwapTokenPositions() {
            return (this.firstToken && this.secondToken)
        },
        getSecondPosition() {
            return this.dexStore.GET_SWAP_ACTIVE_TAB ===  SwapActiveTab.Dex ? 'down' : 'middle'
        },
        getFirstTitle() {
            switch (this.dexStore.GET_SWAP_ACTIVE_TAB) {
                case SwapActiveTab.Dex:
                    return  this.$t('swapPlug.firstTitleDex')
                case SwapActiveTab.Limit:
                    return this.$t('swapPlug.firstTitleLimit')
	            case SwapActiveTab.DCA:
		            return this.$t('swapPlug.firstTitleDca')
                default:
                    return this.$t('swapPlug.assetOne')
            }
        },
        getSecondTitle() {
            switch (this.dexStore.GET_SWAP_ACTIVE_TAB) {
                case SwapActiveTab.Dex:
                    return this.$t("dexInterface.youReceive")
                case SwapActiveTab.Limit:
                    return this.$t("swapPlug.secondTitleLimit")
	            case SwapActiveTab.DCA:
		            return this.$t('swapPlug.secondTitleDca')
                default:
                    return this.$t('swapPlug.assetTwo')
            }
        }
    },
    methods: {
		swapPositions() {
            this.updateTokenPositions()
        }
    },
    mounted() {
        console.log('mounted')
    }
}
</script>

<style scoped>
    .fields {
        position: relative;
        display: flex;
        flex-direction: column;
        gap: 1px;
    }

    .fields__swap-btn {
        position: absolute;
        z-index: 10;
        left: 50%;
        top: 107px;
        display: flex;
        align-items: center;
        justify-content: center;
        transform: translateX(-50%);
        width: 36px;
        height: 36px;
        border: none;
        border-radius: 100%;
        background: var(--iface-white10);
        backdrop-filter: blur(20px);
    }

    .fields__swap-btn:hover {
        background: var(--iface-white14);
    }

    .fields__swap-btn:disabled .icon {
        opacity: 0.4;
    }

    .fields__swap-btn:disabled {
        background: var(--iface-white10);
    }

    .icon {
        transition: .15s ease;
    }

    .fields__swap-btn:hover .icon {
        transform: rotate(180deg);
    }

    .theme-light .icon {
        filter: invert(1);
    }

    .fields__without-switch {
        position: absolute;
        z-index: 10;
        top: 50%;
        left: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        transform: translateX(-50%) translateY(-50%);
        width: 32px;
        height: 32px;
        border-radius: 100%;
        background: var(--earn-bg);
        backdrop-filter: blur(20px);
    }

</style>
