<template>
    <div class="dex">
        <SwapInterface
            class="dex__interface"
            :ton-connect-ui="tonConnectUi"
            @update-wallet-info="updateWalletInfo"
        />
    </div>
</template>

<script lang="ts">
import SwapInterface from "@/components/swap-interface/SwapInterface.vue";
import TokensPopup from "@/components/dex/tokens-popup/TokensPopup.vue";

export default {
    name: 'DexPage',
    components: {
        TokensPopup,
        SwapInterface,
    },
    props: {
        tonConnectUi: {
            type: Object,
            default() {
                return {};
            },
        },
    },
    data() {
        return {
        }
    },
    methods: {
        updateWalletInfo() {
            console.log(1)
        }
    },
    mounted() {
    }
}
</script>

<style scoped>

</style>
