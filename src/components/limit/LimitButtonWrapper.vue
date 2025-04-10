<template>
    <swap-button
        :text="buttonText"
        :disabled="limitDisabled"
        :loading="loadingCondition"
        @click="limitAction"
    >
    </swap-button>
</template>

<script lang="ts">
import SwapButton from "@/components/swap-interface/SwapButton.vue";

export default {
    name: "LimitButtonWrapper",
    components: {SwapButton},
    props: {
        interfaceStatus: {
            type: String,
            default() {
                return ''
            }
        },
    },
    inject: ["limitAction", "processing", "tokenValues"],
    data() {
        return {
            loadingState: true,
        }
    },
    computed: {
        loadingCondition() {
            return this.loadingState || this.interfaceStatus === 'LOADING'
        },
        limitDisabled() {
            return (
                this.interfaceStatus === 'NOT_ENOUGH' ||
                this.interfaceStatus === 'NOT_AMOUNT' ||
                this.interfaceStatus === 'POOL_NOT_FOUND' ||
                this.interfaceStatus === 'LOADING' ||
                this.interfaceStatus === 'HIGH_PRICE_IMPACT' ||
                this.interfaceStatus === 'NOT_ENOUGH_GAS' ||
                this.interfaceStatus === 'NOT_RANGE' ||
                this.loadingState === true
            );
        },
      buttonText() {
        if (this.processing.limit === true) {
          return 'Creating'
        } else if (this.processing.createWallet) {
          return 'Deploying'
        } else if (this.interfaceStatus === 'NOT_CONNECTED') {
          return this.$t('dexButton.connectWallet');
        } else if (this.interfaceStatus === 'NOT_ELIGIBLE') {
          return this.$t('dexButton.stakeOneThousand');
        } else if (this.interfaceStatus === 'NOT_STRATEGIES_WALLET') {
          return this.$t('dexButton.deploySmartContract');
        } else if (this.interfaceStatus === 'NOT_ENOUGH' && this.tokenValues.first > 0) {
          return this.$t('dexButton.notEnough');
        } else if (this.interfaceStatus === 'NOT_AMOUNT') {
          return this.$t('dexButton.enterAmount');
        } else if (this.interfaceStatus === 'NOT_RANGE') {
          return this.$t('dexButton.choosePriceRange')
        } else if (this.interfaceStatus === 'READY_DEX') {
          return this.$t('dexButton.createOrder')
        }
      },
    },
    mounted() {
        setTimeout(() => {
            this.loadingState = false
        }, 1000)
    },
}
</script>

<style scoped>

</style>
