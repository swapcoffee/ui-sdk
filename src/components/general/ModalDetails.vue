<template>
    <div class="details">
        <PoolHeading
            v-if="modalState.mode === 'deposit' && !withoutHeading"
            class="details__heading"
            :withoutBg="true"
            :size="'small'"
        />
        <ModalWithdrawMenu
            v-if="modalState.mode === 'withdraw' && !withoutHeading"
        />
        <div class="details__toggle">
            <button class="details__btn button"
                    @click="showMore = !showMore"
            >
                {{ detailsTitle }}
                <span class="button__group">
                    {{ getToggleText }}
                    <ChevronBottom
                        class="details__btn-icon"
                        :class="{rotate: showMore}"
                    />
                </span>
            </button>
            <ModalStatusRouteInfo
                v-if="modalState.mode === 'swap' && status === 'pending'"
            />
            <div
                v-else
                :class="[size, 'details__content']"
            >
                <BriefTokenInfo
                    class="details__token"
                    :token="getFirstToken"
                    :amount="getFirstAmount"
                    :position="getFirstPosition"
                />
                <BriefTokenInfo
                    class="details__token"
                    :token="getSecondToken"
                    :amount="getSecondAmount"
                    :position="getSecondPosition"
                />
            </div>
        </div>
        <div class="pool-details"
            v-if="showMore"
        >
            <PoolDetailsItem
                v-for="(item, index) in poolDetails"
                :key="index"
                :item="item"
            />
        </div>
    </div>
</template>

<script lang="ts">
import ChevronBottom from "@/assets/earn/transfer-liquidity/ChevronBottom.vue";
import BriefTokenInfo from "@/components/general/BriefTokenInfo.vue";
import {mapGetters} from "vuex";
import ModalWithdrawMenu from "@/components/general/ModalWithdrawMenu.vue";
import computedMixins from "@/mixins/computedMixins.ts"
import ModalStatusRouteInfo from "@/components/general/ModalStatusRouteInfo.vue";
import {useDexStore} from "@/stores/dex";
import {useLimitStore} from "@/stores/limit";
import {useTransactionStore} from "@/stores/transaction";

export default {
    name: "ModalDetails",
    mixins: [computedMixins],
    inject: ["modalState"],
    props: {
        size: {
            type: String,
            default() {
                return ''
            }
        },
        detailsTitle: {
            type: String,
            default() {
                return ''
            }
        },
        poolDetails: {
            type: Array,
            default() {
                return []
            },
            required: true
        },
        withoutHeading: {
            type: Boolean,
            default() {
                return false
            }
        },
        status: {
            type: String,
            default() {
                return ''
            },
            required: true
        }
    },
    components: {
        ModalStatusRouteInfo,
        ModalWithdrawMenu,
        BriefTokenInfo,
        ChevronBottom
    },
    data() {
        return {
            showMore: true
        }
    },
    computed: {
        // ...mapGetters([
        //     "GET_FIRST_POOL_TOKEN",
        //     "GET_SECOND_POOL_TOKEN",
        //     "GET_SEND_TOKEN",
        //     "GET_RECEIVE_TOKEN",
        //     "GET_LIMIT_FIRST_TOKEN",
        //     "GET_LIMIT_SECOND_TOKEN",
        //     "GET_DEAL_CONDITIONS",
        //     "GET_LIMIT_TRANSACTION_INFO"
        // ]),
        dexStore() {
          return useDexStore()
        },
        limitStore() {
          return useLimitStore()
        },
        transactionStore() {
          return useTransactionStore()
        },
        limitInfo() {
            return this.transactionStore.GET_LIMIT_TRANSACTION_INFO
        },
        getFirstPosition() {
            if (this.modalState.mode === 'swap' || this.modalState.mode === 'limit' || this.modalState.mode === 'dca') {
                return 'first'
            }
        },
        getSecondPosition() {
            if (this.modalState.mode === 'swap' || this.modalState.mode === 'limit' || this.modalState.mode === 'dca') {
                return 'second'
            }
        },
        getFirstToken() {
            switch (this.modalState.mode) {
                case "swap":
                    return this.dexStore.GET_RECEIVE_TOKEN
                case "limit":
                case "dca":
                    return this.limitStore.GET_LIMIT_FIRST_TOKEN
            }
        },
        getSecondToken() {
            switch (this.modalState.mode) {
                case "swap":
                    return this.dexStore.GET_SEND_TOKEN
                case "limit":
                case "dca":
                    return this.limitStore.GET_LIMIT_SECOND_TOKEN
            }
        },
        getFirstAmount() {
            switch (this.modalState.mode) {
                case "swap":
                    return this.dexStore.GET_DEAL_CONDITIONS?.output_amount
                case "limit":
                case "dca":
                    return this.limitInfo?.firstAmount || 0
            }
        },
        getSecondAmount() {
            switch (this.modalState.mode) {
                case "swap":
                    return this.dexStore.GET_DEAL_CONDITIONS?.input_amount
                case "limit":
                case "dca":
                    return this.limitInfo?.secondAmount || 0
            }
        },
        getToggleText() {
            if (this.showMore) {
                return "Hide details"
            } else {
                return "Show details"
            }
        }
    }
}
</script>

<style scoped>
.details {
    padding: 14px;
    border-radius: 12px;
    background: var(--iface-white4);
}

.details__heading {
    padding: 0 0 14px 0;
    border-radius: 0;
    border-bottom: 1px solid var(--iface-white6);
    margin-bottom: 14px;
}

.details__btn {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    border: none;
    outline: none;
    background: transparent;
    font-size: 13px;
}

.details__btn-icon {
    width: 16px;
    height: 16px;
    transition: .2s;
}

.button__group {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 13px;
    line-height: normal;
    opacity: 0.4;
}

.rotate {
    transform: rotateX(180deg);
}

.details__content {
    margin-top: 14px;
}

.details__token:first-child {
    margin-bottom: 14px;
}

.pool-details {
    padding-top: 14px;
    border-top: 1px solid var(--iface-white6);
    margin-top: 14px;
    display: flex;
    flex-direction: column;
    gap: 8px;
}
</style>
