<template>
    <modal-wrapper
        class="modal"
        :title="getTitle"
        @closeModal="$emit('closeModal')"
    >
        <EarnModalAddLiquidity
            v-if="step === 1 && modalState.mode === 'deposit'"
            @updateStep="(value) => step = value"
        />
        <div class="modal__group"
            v-if="step === 2"
        >
            <ModalStatusStep
                :status="status"
            />
        </div>
    </modal-wrapper>
</template>

<script lang="ts">
import SourceItem from "@/components/earn/all-pools/SourceItem.vue";
import PoolHeading from "@/components/earn/pool-page/PoolHeading.vue";
import PoolDetailsItem from "@/components/earn/pool-page/PoolDetailsItem.vue";
import EarnModalAddLiquidity from "@/components/general/EarnModalAddLiquidity.vue";
import computedMixins from "@/mixins/computedMixins.ts"
import ModalStatusStep from "@/components/general/ModalStatusSteps.vue";

export default {
    name: "EarnModal",
    mixins: [computedMixins],
    inject: ['modalState'],
    props: {
        // mode: {
        //     type: String,
        //     default() {
        //         return ''
        //     },
        //     required: true
        // }
    },
    components: {
        ModalStatusStep,
        EarnModalAddLiquidity,
        PoolDetailsItem,
        PoolHeading,
        SourceItem
    },
    data() {
        return {
            step: 1,
            status: 'pending',
        }
    },
    computed: {
        getTitle() {
            if (this.step === 1) {
                switch (this.modalState.mode) {
                    case 'deposit':
                        return 'Add liquidity'
                    case 'withdraw':
                        return 'Liquidity withdraw'
                }
            } else {
                return ''
            }
        }
    },
    mounted() {
        // console.log("modalMode", this.modalState.mode)
    }
}
</script>

<style scoped>

</style>
