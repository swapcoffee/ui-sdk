<template>
    <div class="details">
        <ModalWithdrawMenu
            v-if="(modalState as any).mode === 'withdraw' && !withoutHeading"
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
                v-if="((modalState as any).mode === 'swap' || (modalState as any).mode === 'multi')  && status === 'pending'"
            />
            <div
                v-else
                :class="[size, 'details__content', { multi: (modalState as any).mode === 'multi' }]"
            >

                <template v-if="(modalState as any).mode === 'multi'">
                    <BriefTokenInfo
                        v-for="(tokenData, index) in getMultiInputTokens"
                        :key="`input-${index}`"
                        class="details__token multi-swap"
                        :token="tokenData.token"
                        :amount="tokenData.amount"
                        :position="'first'"
                        :size="size"
                    />
                    <BriefTokenInfo
                        class="details__token multi-swap multi-output"
                        :token="getOutputToken"
                        :amount="getOutputAmount"
                        :position="'second'"
                        :size="size"
                    />
                </template>
                <template v-else>
                    <BriefTokenInfo
                        class="details__token"
                        :token="getFirstToken"
                        :amount="getFirstAmount"
                        :position="getFirstPosition"
                        :size="size"
                    />
                    <BriefTokenInfo
                        class="details__token"
                        :token="getSecondToken"
                        :amount="getSecondAmount"
                        :position="getSecondPosition"
                        :size="size"
                    />
                </template>
            </div>
        </div>
      <div
          class="deal__details"
          v-if="(showMore && getTransactionDetails) && ((modalState as any).mode === 'limit' || (modalState as any).mode === 'dca')"
      >
        <ConfirmItemDetail
            v-for="(detail, index) in getTransactionDetails"
            :key="index"
            :detail="detail"
        />
      </div>
    </div>
</template>

<script lang="ts">
import ChevronBottom from "@/assets/earn/transfer-liquidity/ChevronBottom.vue";
import BriefTokenInfo from "@/components/general/BriefTokenInfo.vue";
import ModalWithdrawMenu from "@/components/general/ModalWithdrawMenu.vue";
import computedMixins from "@/mixins/computedMixins.ts"
import ModalStatusRouteInfo from "@/components/general/ModalStatusRouteInfo.vue";
import {useDexStore} from "@/stores/dex";
import {useLimitStore} from "@/stores/limit";
import {useTransactionStore} from "@/stores/transaction";
import ConfirmItemDetail from "@/components/ui/ConfirmItemDetail.vue";

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
        },
        withDcaLimitDetails: {
          type: Array,
          default() {
            return []
          }
        }
    },
    components: {
      ConfirmItemDetail,
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
        getTransactionDetails() {
            if (this.withDcaLimitDetails.length) {
                return this.withDcaLimitDetails
            }

            return this.limitStore.GET_LIMIT_TRANSACTION_DETAILS
        },
        getFirstPosition() {
            if ((this.modalState as any).mode === 'swap' || (this.modalState as any).mode === 'multi' || (this.modalState as any).mode === 'limit' || (this.modalState as any).mode === 'dca') {
                return 'first'
            }
          },
        getSecondPosition() {
            if ((this.modalState as any).mode === 'swap' || (this.modalState as any).mode === 'multi' || (this.modalState as any).mode === 'limit' || (this.modalState as any).mode === 'dca') {
                return 'second'
            }
        },
        getFirstToken() {
            switch ((this.modalState as any).mode) {
                case "multi":
                    return this.dexStore.GET_RECEIVE_MULTI_TOKEN
                case "swap":
                    return this.dexStore.GET_RECEIVE_TOKEN
                case "limit":
                case "dca":
                    return this.limitStore.GET_LIMIT_FIRST_TOKEN
            }
        },
        getSecondToken() {
            switch ((this.modalState as any).mode) {
                case "multi":
                    const sendTokens = this.dexStore.GET_SEND_MULTI_TOKENS;
                    if (sendTokens && sendTokens.size > 0) {
                        return Array.from(sendTokens.values())[0];
                    }
                    return null;
                case "swap":
                    return this.dexStore.GET_SEND_TOKEN
                case "limit":
                case "dca":
                    return this.limitStore.GET_LIMIT_SECOND_TOKEN
            }
        },
        getFirstAmount() {
            switch ((this.modalState as any).mode) {
                case "multi":
                    const outputAmount = this.dexStore.GET_DEAL_CONDITIONS?.total_output_amount || 0
                    return typeof outputAmount === 'string' ? parseFloat(outputAmount) : outputAmount
                case "swap":
                    const swapOutputAmount = this.dexStore.GET_DEAL_CONDITIONS?.output_amount || 0
                    return typeof swapOutputAmount === 'string' ? parseFloat(swapOutputAmount) : swapOutputAmount
                case "limit":
                case "dca":
                    return this.limitInfo?.firstAmount || 0
            }
            return 0
        },
        getSecondAmount() {
            switch ((this.modalState as any).mode) {
                case "multi":
                    const inputAmount = this.dexStore.GET_DEAL_CONDITIONS?.total_input_amount || 0
                    return typeof inputAmount === 'string' ? parseFloat(inputAmount) : inputAmount
                case "swap":
                    const swapInputAmount = this.dexStore.GET_DEAL_CONDITIONS?.input_amount || 0
                    return typeof swapInputAmount === 'string' ? parseFloat(swapInputAmount) : swapInputAmount
                case "limit":
                  return this.limitInfo?.secondAmount || 0
                case "dca":
                  if (this.withDcaLimitDetails.length > 0) {
                    return null
                  }
                    return this.limitInfo?.secondAmount || 0
            }
            return 0
        },
        getToggleText() {
            if (this.showMore) {
                return "Hide details"
            } else {
                return "Show details"
            }
        },
        getMultiInputTokens() {
            if ((this.modalState as any).mode !== 'multi') return []

            const sendTokens = this.dexStore.GET_SEND_MULTI_TOKENS
            const sendValues = this.dexStore.GET_SEND_MULTI_VALUES

            if (!sendTokens || !sendValues) return []

            const tokens = []
            for (const [key, token] of sendTokens.entries()) {
                const amountStr = sendValues[key] || '0'
                const amount = parseFloat(amountStr) || 0
                tokens.push({
                    token: token,
                    amount: amount
                })
            }
            return tokens
        },
        getOutputToken() {
            if ((this.modalState as any).mode === 'multi') {
                return this.dexStore.GET_RECEIVE_MULTI_TOKEN
            }
            return this.dexStore.GET_RECEIVE_TOKEN
        },
        getOutputAmount() {
            if ((this.modalState as any).mode === 'multi') {
                const amount = this.dexStore.GET_DEAL_CONDITIONS?.total_output_amount || 0
                return typeof amount === 'string' ? parseFloat(amount) : amount
            }
            const amount = this.dexStore.GET_DEAL_CONDITIONS?.output_amount || 0
            return typeof amount === 'string' ? parseFloat(amount) : amount
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

.multi .details__token:first-child {
   margin-bottom: 0;
}


.multi-output {
  margin-top: 14px;
}

.pool-details {
    padding-top: 14px;
    border-top: 1px solid var(--iface-white6);
    margin-top: 14px;
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.deal__details {
  margin-top: 14px;
  padding-top: 14px;
  border-top: 1px solid var(--iface-white6);
  display: flex;
  flex-direction: column;
  gap: 8px;
}
</style>
