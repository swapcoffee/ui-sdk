<template>
    <div class="modal__liquidity">
        <ModalDetails
            :detailsTitle="'You send'"
            :poolDetails="details"
        />
        <button class="modal__button"
                @click="addLiquidity"
        >
            Add liquidity
        </button>
    </div>
</template>

<script>
import ModalDetails from "@/components/general/ModalDetails.vue";
import PoolDetailsItem from "@/components/earn/pool-page/PoolDetailsItem.vue";
import PoolHeading from "@/components/earn/pool-page/PoolHeading.vue";

export default {
    name: "EarnModalAddLiquidity",
    components: {
        PoolHeading,
        PoolDetailsItem,
        ModalDetails
    },
    data() {
        return {
            details: [
                {
                    name: "APR 24h",
                    value: 20,
                    symbol: '%'
                },
                {
                    name: "Slippage",
                    value: 5,
                    symbol: '%'
                },
                {
                    name: "Est. pool share",
                    value: 0.001,
                    symbol: '%'
                },
                {
                    name: "Minimum receive",
                    value: 10,
                    symbol: ' LP'
                },
                {
                    name: "Blockchain fee",
                    value: 3,
                    symbol: ' TON'
                }
            ]
        }
    },
    methods: {
        addLiquidity() {
            console.log('add')
            this.$emit('updateStep', 2)
        }
    }
}
</script>

<style scoped>

.modal__button {
    width: 100%;
    height: 44px;
    margin-top: 20px;
    border-radius: 12px;
    border: none;
    outline: none;
    background: var(--earn-accent);
    backdrop-filter: blur(20px);
    font-size: 14px;
    line-height: normal;
    font-weight: 500;
    transition: .2s;
}

.modal__button:hover {
    background: var(--earn-hover);
}
</style>
