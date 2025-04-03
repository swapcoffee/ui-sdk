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

<script>
import {mapGetters} from "vuex";
import methodsMixins from "@/mixins/methodsMixins.js";
import RouteRightIcon from "@/assets/general/RouteRightIcon.vue";

export default {
    name: "SwapDealInfo",
    mixins: [methodsMixins],
    components: {RouteRightIcon},
    data() {
        return {}
    },
    computed: {
        ...mapGetters([
            "GET_SEND_TOKEN",
            "GET_RECEIVE_TOKEN",
            "GET_DEAL_CONDITIONS"
        ]),
        firstImage() {
            return this.GET_SEND_TOKEN?.image
        },
        firstSymbol() {
            return this.GET_SEND_TOKEN?.symbol
        },
        secondImage() {
            return this.GET_RECEIVE_TOKEN?.image
        },
        secondSymbol() {
            return this.GET_RECEIVE_TOKEN?.symbol
        },
        firstAmount() {
            return this.GET_DEAL_CONDITIONS?.input_amount
        },
        secondAmount() {
            return this.GET_DEAL_CONDITIONS?.output_amount
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
</style>
