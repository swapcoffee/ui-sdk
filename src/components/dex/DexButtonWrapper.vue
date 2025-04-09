<template>
    <swap-button
        v-for="btn in getButtons"
        v-show="btn.visible"
        :key="btn"
        :text="btn.text"
        :disabled="btn.disabled"
        :loading="btn.loading"
        :color-scheme="btn.colorScheme"
        @click="btn.action"
    >
      <template v-if="btn.icon" #icon>
        <component :is="btn.icon" />
      </template>
    </swap-button>
</template>

<script>
import SwapButton from "@/components/swap-interface/SwapButton.vue";
import WalletIcon from "@/assets/earn/swap-interface/WalletIcon.vue";

import {useDexStore} from "@/stores/dex";

export default {
    name: "DexButtonWrapper",
    components: {SwapButton},
    props: {
        interfaceStatus: {
            type: String,
            default() {
                return ''
            }
        },
    },
    inject: [
        "dexAction",
        "stakeTransaction",
        "unstakeTransaction",
        "processing"
    ],
    data() {
        return {
            loadingState: true,
        }
    },
    computed: {
        dexStore() {
          return useDexStore()
        },
        getButtons() {
            return [
                {
                    type: "stake",
                    text: this.$t('stakeButton.stake'),
                    action: this.stakeTransaction,
                    visible: this.canStake,
                    disabled: this.processing.stake || !this.dexStore.GET_DEAL_CONDITIONS,
                    loading: this.processing.stake || !this.dexStore.GET_DEAL_CONDITIONS,
                    colorScheme: 'light',
                    icon: null

                },
                {
                    type: "unstake",
                    text: this.unstakeButtonText,
                    action: this.unstakeTransaction,
                    visible: this.canUnstake,
                    disabled: this.processing.unstake || !this.dexStore.GET_DEAL_CONDITIONS,
                    loading: this.processing.unstake || !this.dexStore.GET_DEAL_CONDITIONS,
                    colorScheme: 'light',
                    icon: null
                },
                {
                    type: "dex",
                    text: this.dexButtonText,
                    action: this.dexAction,
                    visible: true,
                    disabled: this.dexDisabled,
                    loading: this.interfaceStatus === "LOADING",
                    colorScheme: 'accent',
                    icon: (!this.dexStore.GET_DEX_WALLET && this.interfaceStatus !== "LOADING") ? WalletIcon : null
                }
            ]
        },
        canStake() {
            let findTokenInUser = this.dexStore.GET_USER_TOKENS.find((item) => item.symbol === "TON")
            let enoughBalance = findTokenInUser && findTokenInUser?.balance >= this.dexStore.GET_SEND_AMOUNT
            let validAmount = this.dexStore.GET_SEND_AMOUNT > 0 && enoughBalance

            return (
                this.dexStore.GET_STAKING_POOL !== null &&
                this.dexStore.GET_SEND_TOKEN?.address === 'native' &&
                this.dexStore.GET_RECEIVE_TOKEN?.stacking_pool_id !== null &&
                this.dexStore.GET_RECEIVE_TOKEN.hasOwnProperty('stacking_pool_id') &&
                validAmount
            );
        },
        canUnstake() {
            let findTokenInUser = this.dexStore.GET_USER_TOKENS.find(
                (item) => item.symbol === this.dexStore.GET_SEND_TOKEN?.symbol,
            );
            let enoughBalance = findTokenInUser && findTokenInUser?.balance >= this.dexStore.GET_SEND_AMOUNT;
            let validAmount = this.dexStore.GET_SEND_AMOUNT > 0 && enoughBalance;

            return this.dexStore.GET_STAKING_POOL !== null && this.dexStore.GET_RECEIVE_TOKEN?.address === 'native' &&
                this.dexStore.GET_SEND_TOKEN?.stacking_pool_id !== null && this.dexStore.GET_SEND_TOKEN.hasOwnProperty("stacking_pool_id") && validAmount
        },
        dexDisabled() {
            return (
                this.interfaceStatus === 'NOT_ENOUGH' ||
                this.interfaceStatus === 'NOT_SELECTED' ||
                this.interfaceStatus === 'POOL_NOT_FOUND' ||
                this.interfaceStatus === 'LOADING' ||
                this.interfaceStatus === 'HIGH_PRICE_IMPACT' ||
                this.interfaceStatus === 'NOT_ENOUGH_GAS' ||
                this.loadingState === true
            );
        },
        dexButtonText() {
            if (this.interfaceStatus === 'POOL_NOT_FOUND') {
                return this.$t('dexButton.poolNotFound');
            } else if (this.interfaceStatus === 'NOT_CONNECTED') {
                return this.$t('dexButton.connectWallet');
            } else if (this.interfaceStatus === 'HIGH_PRICE_IMPACT') {
                return this.$t('dexButton.highPriceImpact');
            } else if (this.interfaceStatus === 'NOT_ENOUGH_GAS') {
                return this.$t('dexButton.notEnoughGas');
            } else if (
                (this.interfaceStatus === 'NOT_ENOUGH' && this.dexStore.GET_SEND_AMOUNT > 0) ||
                (this.interfaceStatus === 'NOT_ENOUGH' && this.dexStore.GET_RECEIVE_AMOUNT > 0)
            ) {
                return this.$t('dexButton.notEnough');
            } else if (
                (this.interfaceStatus === 'NOT_ENOUGH' && this.dexStore.GET_SEND_AMOUNT === 0) ||
                (this.interfaceStatus === 'NOT_ENOUGH' && this.dexStore.GET_RECEIVE_AMOUNT === 0)
            ) {
                return this.$t('dexButton.enterAmount');
            } else if (this.interfaceStatus === 'NOT_SELECTED') {
                return this.$t('dexButton.selectToken');
            } else if (this.interfaceStatus === 'READY_DEX') {
                return this.$t('dexButton.sendTransaction');
            }
        },
        getHoursLeft() {
            const cycleEnd = this.dexStore.GET_STAKING_POOL?.cycle_end;
            const now = new Date().getTime() / 1000;
            const diff = cycleEnd - now;

            return Math.floor(diff / 3600);
        },
        unstakeButtonText() {
            if (this.getHoursLeft <= 0) {
                return this.$t('unstakeButton.unstakeNow');
            }
            return this.$t('unstakeButton.unstake', { hours: this.getHoursLeft });
        }
    },
    mounted() {
        setTimeout(() => {
            this.loadingState = false
        }, 1000)
    }
}
</script>

<style scoped>

</style>
