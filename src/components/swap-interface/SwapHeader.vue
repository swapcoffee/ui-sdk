<template>
    <div class="swap-header">
        <TradeNav v-if="limitDcaVisibility" />
      <button class="title__back-btn" @click="redirectToSwapCoffee" v-else>
        <span class="by-text slippage-text">powered by</span>
        <img :src="logoSrc" alt="swap-logo" class="swap-logo">
      </button>
      <div :class="['swap-header__group', { 'right': !limitDcaVisibility }]">
        <button class="swap-header__button logout__btn" @click="disconnect" v-if="dexStore.GET_DEX_WALLET">
          <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              class="disconnect__icon"
          >
            <g opacity="0.8">
              <path
                  d="M8.75 16.875C8.75 17.0408 8.68415 17.1997 8.56694 17.3169C8.44973 17.4342 8.29076 17.5 8.125 17.5H3.75C3.41848 17.5 3.10054 17.3683 2.86612 17.1339C2.6317 16.8995 2.5 16.5815 2.5 16.25V3.75C2.5 3.41848 2.6317 3.10054 2.86612 2.86612C3.10054 2.6317 3.41848 2.5 3.75 2.5H8.125C8.29076 2.5 8.44973 2.56585 8.56694 2.68306C8.68415 2.80027 8.75 2.95924 8.75 3.125C8.75 3.29076 8.68415 3.44973 8.56694 3.56694C8.44973 3.68415 8.29076 3.75 8.125 3.75H3.75V16.25H8.125C8.29076 16.25 8.44973 16.3158 8.56694 16.4331C8.68415 16.5503 8.75 16.7092 8.75 16.875ZM17.3172 9.55781L14.1922 6.43281C14.1048 6.34531 13.9934 6.2857 13.8721 6.26154C13.7508 6.23739 13.625 6.24977 13.5108 6.29711C13.3965 6.34446 13.2988 6.42464 13.2302 6.52751C13.1615 6.63038 13.1249 6.75132 13.125 6.875V9.375H8.125C7.95924 9.375 7.80027 9.44085 7.68306 9.55806C7.56585 9.67527 7.5 9.83424 7.5 10C7.5 10.1658 7.56585 10.3247 7.68306 10.4419C7.80027 10.5592 7.95924 10.625 8.125 10.625H13.125V13.125C13.1249 13.2487 13.1615 13.3696 13.2302 13.4725C13.2988 13.5754 13.3965 13.6555 13.5108 13.7029C13.625 13.7502 13.7508 13.7626 13.8721 13.7385C13.9934 13.7143 14.1048 13.6547 14.1922 13.5672L17.3172 10.4422C17.3753 10.3841 17.4214 10.3152 17.4529 10.2393C17.4843 10.1635 17.5005 10.0821 17.5005 10C17.5005 9.91787 17.4843 9.83654 17.4529 9.76066C17.4214 9.68479 17.3753 9.61586 17.3172 9.55781Z"
                  fill="white"
              />
            </g>
          </svg>
        </button>
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
import darkLogo from "@/assets/header/logo-dark.svg"
import lightLogo from "@/assets/header/swap-logo.svg"
import tonConnectMixin from "@/mixins/tonConnectMixin.ts";

export default {
    name: "SwapHeader",
    inject: ["updateSettingsModalVisible", "tokenValues", "processing", "limitDcaVisibility", "widgetTheme"],
    mixins: [computedMixins, tonConnectMixin],
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
        logoSrc() {
          return this.widgetTheme === "light" ? darkLogo : lightLogo;
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
      redirectToSwapCoffee() {
        window.open("https://swap.coffee/dex", "_blank");
      },
      async disconnect() {
        await this.disconnectWallet(null);
      },
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

    .title__back-btn {
      padding-left: 5px;
      display: flex;
      align-items: center;
      flex-direction: row;
      border: none;
      background: none;
      font-weight: 400;
      font-size: 14px;
      gap: 4px;
    }

    .swap-logo {
      height: 20px;
      width: 80px;
    }

    .theme-light .disconnect__icon {
      filter: invert(1);
      opacity: 0.6;
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
