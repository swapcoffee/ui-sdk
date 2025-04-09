<template>
    <div class="swap-header">
        <TradeNav v-if="limitDcaVisibility" />
      <div :class="['swap-header__group', { 'right': !limitDcaVisibility }]">
      <button class="swap-header__button refresh-btn"
                    v-if="dexStore.GET_SWAP_ACTIVE_TAB === SwapActiveTab.Dex"
                    @click="refreshCompare"
            >
                <RefreshIcon
                    :shouldAnimate="shouldAnimate"
                    :refreshInfo="refreshInfo"
                />
            </button>
            <button class="swap-header__button settings-btn"
                    @click="updateSettingsModalVisible"
            >
                <span class="btn-text"
                      v-if="dexStore.GET_SWAP_ACTIVE_TAB === SwapActiveTab.Dex"
                >
                    {{ getSettingsText }}
                </span>
                <SettingsIcon class="settings-icon"/>
            </button>
        </div>
    </div>
</template>

<script lang="ts">
import RefreshIcon from "@/assets/earn/swap-interface/RefreshIcon.vue";
import SettingsIcon from "@/assets/earn/swap-interface/SettingsIcon.vue";
import TradeNav from "@/components/navigation/TradeNav.vue";
import {useDexStore} from "@/stores/dex";
import {useLimitStore} from "@/stores/limit";
import {useDexSettingsStore} from "@/stores/dex/settings.ts";
import computedMixins from "@/mixins/computedMixins.ts";
import {SwapActiveTab} from "@/utils/types.ts";

export default {
    name: "SwapHeader",
    inject: ["updateSettingsModalVisible", "tokenValues", "processing", "limitDcaVisibility"],
    mixins: [computedMixins],
    props: {
        refreshInfo: {
            type: Boolean,
            data() {
                return false
            }
        },
    },
    components: {
        TradeNav,
        SettingsIcon,
        RefreshIcon,
    },
    data() {
        return {
        }
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
        getSettingsText() {
            if (this.dexStore.GET_SWAP_ACTIVE_TAB === SwapActiveTab.Dex) {
                return `${this.dexSettingsStore.GET_SLIPPAGE}% slippage`
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
        shouldAnimate() {
            return (
                (this.tokenValues?.first > 0 || this.tokenValues?.second > 0)
                && this.getTokens?.first !== null && this.getTokens?.second !== null
                && !this.refreshInfo && this.dexStore.GET_SWAP_ACTIVE_TAB === SwapActiveTab.Dex
                && this.processing?.dex !== true
            );
        },
    },
    methods: {
        refreshCompare() {
            if (
                this.getTokens?.first !== null &&
                this.getTokens?.second !== null &&
                this.tokenValues?.first > 0
            ) {
                this.$emit('refresh', 'compareTokens');
            }
        },
    }
}
</script>

<style scoped>
    .swap-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
    }

    .right {
      margin-left: auto;
    }

    .swap-header__title {
        font-size: 20px;
        line-height: normal;
        font-weight: 400;
    }

    .swap-header__group {
        display: flex;
        align-items: center;
        gap: 6px;
    }

    .swap-header__button {
        min-width: 36px;
        height: 36px;
        padding: 8px;
        border-radius: 12px;
        border: none;
        outline: none;
        background: var(--iface-white6);
        transition: .2s;
    }

    .swap-header__button:hover {
        background: var(--iface-white10);
    }


    .settings-btn {
        display: flex;
        align-items: center;
        gap: 6px;
        color: var(--main-text-color);
        opacity: 0.6;
    }

    .btn-text {
        display: block;
        font-size: 12px;
        font-weight: 400;
    }

    .settings-btn:hover {
        opacity: 1;
    }

    .settings-icon {
        width: 18px;
        height: 18px;
    }

    @media screen and (max-width: 576px) {
        .swap-header {
            padding: 6px;
        }
    }

</style>
