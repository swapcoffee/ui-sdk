<template>
    <swap-button
        :text="buttonText"
        :disabled="dexDisabled"
        :loading="loadingCondition"
        @click="multiSwapAction"
    >
    </swap-button>
</template>

<script lang="ts">
import SwapButton from "@/components/swap-interface/SwapButton.vue";

export default {
    name: "MultiSwapButtonWrapper",
    components: {SwapButton},
    props: {
        interfaceStatus: {
            type: String,
            default() {
                return ''
            }
        },
    },
    inject: ["multiSwapAction", "processing", "tokenValues"],
    data() {
        return {
            loadingState: true,
        }
    },
    computed: {
        loadingCondition() {
            return this.loadingState || this.interfaceStatus === 'LOADING'
        },
        dexDisabled() {
            return (
                this.interfaceStatus === 'NOT_AMOUNT' ||
                this.interfaceStatus === 'NOT_ENOUGH' ||
                this.interfaceStatus === 'NOT_SELECTED' ||
                this.interfaceStatus === 'POOL_NOT_FOUND' ||
                this.interfaceStatus === 'LOADING' ||
                this.interfaceStatus === 'HIGH_PRICE_IMPACT' ||
                this.interfaceStatus === 'NOT_ENOUGH_GAS' ||
                this.loadingState === true
            );
        },
        buttonText() {
            if (this.interfaceStatus === 'POOL_NOT_FOUND') {
                return this.$t('dexButton.poolNotFound');
            } else if (this.interfaceStatus === 'NOT_CONNECTED') {
                return this.$t('dexButton.connectWallet');
            } else if (this.interfaceStatus === 'HIGH_PRICE_IMPACT') {
                return this.$t('dexButton.highPriceImpact');
            } else if (this.interfaceStatus === 'NOT_ENOUGH_GAS') {
                return this.$t('dexButton.notEnoughGas');
            }  else if (this.interfaceStatus === 'NOT_AMOUNT') {
                return this.$t('dexButton.enterAmount')
            } else if (
                (this.interfaceStatus === 'NOT_ENOUGH' && Number(this.tokenValues.first) > 0) ||
                (this.interfaceStatus === 'NOT_ENOUGH' && Number(this.tokenValues.receive) > 0)
            ) {
                return this.$t('dexButton.notEnough');
            } else if (this.interfaceStatus === 'NOT_SELECTED') {
                return this.$t('dexButton.selectToken');
            } else if (this.interfaceStatus === 'READY_DEX') {
                return this.$t('dexButton.sendTransaction');
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
