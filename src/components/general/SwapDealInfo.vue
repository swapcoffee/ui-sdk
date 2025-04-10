<template>
    <div class="transaction__swap swap">
        <img :src="firstImage" alt="" class="swap__icon">
        <p class="swap__token-name">{{ displayFirst }}</p>
        <RouteRightIcon
            class="arrow-icon"
        />
        <img :src="secondImage" alt="" class="swap__icon">
        <p class="swap__token-name">{{ displaySecond }}</p>
    </div>
</template>

<script lang="ts">
import methodsMixins from "@/mixins/methodsMixins.ts";

import RouteRightIcon from "@/assets/general/RouteRightIcon.vue";

import {useDexStore} from "@/stores/dex";

export default {
    name: "SwapDealInfo",
    mixins: [methodsMixins],
    components: {RouteRightIcon},
    data() {
        return {}
    },
    computed: {
        dexStore() {
          return useDexStore()
        },
        firstImage() {
            return this.dexStore.GET_SEND_TOKEN?.image
        },
        firstSymbol() {
            return this.dexStore.GET_SEND_TOKEN?.symbol
        },
        secondImage() {
            return this.dexStore.GET_RECEIVE_TOKEN?.image
        },
        secondSymbol() {
            return this.dexStore.GET_RECEIVE_TOKEN?.symbol
        },
        firstAmount() {
            return this.dexStore.GET_DEAL_CONDITIONS?.input_amount
        },
        secondAmount() {
            return this.dexStore.GET_DEAL_CONDITIONS?.output_amount
        },
        displayFirst() {
            return `${this.prettyNumber(this.firstAmount, 2)} ${this.firstSymbol}`
        },
        displaySecond() {
            return `${this.prettyNumber(this.secondAmount, 2)} ${this.secondSymbol}`
        }
    },
}
</script>

<style scoped>
.swap {
    margin: 4px 0 14px 0;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
}

.swap__icon {
    width: 20px;
    height: 20px;
    border-radius: 100px;
}

.swap__token-name {
    font-size: 16px;
}

.arrow-icon {
    margin: 0 4px;
    width: 16px;
    height: 16px;
}

.theme-light .arrow-icon {
  filter: invert(1);
}
</style>
