<template>
    <modal-wrapper
        class="modal"
        :title="''"
        @closeModal="$emit('closeModal')"
    >
        <ModalStatusStep
            :details="getDetails"
            :status="getStatus"
        ></ModalStatusStep>
    </modal-wrapper>
</template>

<script lang="ts">
import ModalWrapper from "@/components/ui/ModalWrapper.vue";
import ModalStatusStep from "@/components/general/ModalStatusSteps.vue";

import {clearRequestInterval} from "@/helpers/swap-interface/send-transaction.ts";
import methodsMixins from "@/mixins/methodsMixins.ts";

import {useDexStore} from "@/stores/dex";
import {useDexSettingsStore} from "@/stores/dex/settings.ts";
import {useTransactionStore} from "@/stores/transaction";
import {dispatchSdkEvent} from "@/helpers/events";
import {ReadonlySdkEvent} from "@/utils/consts.ts";

export default {
    name: "TransactionStatusModal",
    components: {ModalStatusStep, ModalWrapper},
    props: {
        status: {
            type: String,
            default() {
                return ''
            }
        }
    },
    mixins: [methodsMixins],
    inject: ['modalState'],
    data() {
        return {

        }
    },
    computed: {
        dexStore() {
          return useDexStore()
        },
        dexSettingsStore() {
          return useDexSettingsStore()
        },
        transactionStore() {
          return useTransactionStore()
        },
        limitInfo() {
            return this.transactionStore.GET_LIMIT_TRANSACTION_INFO
        },
        getStatus() {
            if (this.modalState.mode === 'swap') {
                return this.getSwapStatus
            } else {
                return this.status
            }
        },
        getSwapStatus() {
            const trResult = this.transactionStore.GET_SWAP_TRANSACTION_STATUS

            if (trResult && Array.isArray(trResult.splits)) {
                let findFailed = trResult.splits.find((item) => item?.status === 'failed');
                let findTimedOut = trResult.splits.find((item) => item?.status === 'timed_out');
                let findPending = trResult.splits.find((item) => item?.status === 'pending');
                let findPartiallyComplete = trResult.splits.find((item) => item?.status === 'partially_complete');
                let findSucceeded = trResult.splits.find((item) => item?.status === 'succeeded');

                if (findSucceeded && !findPending && !findPartiallyComplete) {
                    dispatchSdkEvent(ReadonlySdkEvent.SWAP_RESULT_RECEIVED, trResult);
                    return 'success';
                } else if (findPending || findPartiallyComplete) {
                    return 'pending';
                } else if (findFailed || findTimedOut) {
                    return 'failed';
                }
            } else {
                return 'pending';
            }
        },
        swapPending() {
            return [
                {
                    name: this.$t('transactionStatusModal.swapStatus.swapPendingBlockchain'),
                    value: this.dexStore.GET_DEAL_CONDITIONS?.recommended_gas,
                    symbol: ' TON'
                }
            ]
        },
        swapSuccess() {
            return [
                {
                    name: this.$t('transactionStatusModal.swapStatus.swapSuccessPriceImpact'),
                    value: this.getPriceImpactDisplay,
                    valueColor: this.getColorImpact,
                    symbol: '%'
                },
                {
                    name: this.$t('transactionStatusModal.swapStatus.swapSuccessEconomy'),
                    value: this.getProfitDisplay,
                    valueColor: '#5DFF54',
                    symbol: '%'
                },
                {
                    name: this.$t('transactionStatusModal.swapStatus.swapSuccessCashback'),
                    value: this.dexStore.GET_DEAL_CONDITIONS?.estimated_cashback_usd,
                    symbol: '~ $'
                },
            ]
        },
        swapDetails() {
            let successList = this.swapSuccess
            if (this.checkIntermediateTokens.length > 0) {
                successList.push({
                    name: this.$t('transactionStatusModal.swapDetails.name'),
                    value: this.getDisplayIntermediate,
                    symbol: ''
                })
            }
            return {
                success: successList,
                pending: this.swapPending
            }
        },
        limitDetails() {
            return [
                {
                    name: this.$t('transactionStatusModal.limitDetails.price'),
                    value: this.getLimitSummary,
                    symbol: ''
                },
                {
                    name: this.$t('transactionStatusModal.limitDetails.buying'),
                    value: this.getLimitBuying,
                    symbol: ``
                },
                {
                    name: this.$t('transactionStatusModal.limitDetails.suborders'),
                    value: this.getLimitSuborders,
                    symbol: ''
                },
                {
                    name: this.$t('transactionStatusModal.limitDetails.created'),
                    value: this.getLimitCreationDate,
                    symbol: ''
                },
                {
                    name: this.$t('transactionStatusModal.limitDetails.expiryTime'),
                    value: 'Never',
                    symbol: ''
                }
            ]
        },
        dcaDetails() {
            return [
                {
                    name: this.$t('transactionStatusModal.dcaDetails.totalDeposited'),
                    value: this.getDcaDeposit,
                    symbol: ''
                },
                {
                    name: this.$t('transactionStatusModal.dcaDetails.eachOrderSize'),
                    value: this.getEachOrderSize,
                    symbol: ``
                },
                {
                    name: this.$t('transactionStatusModal.dcaDetails.orderCount'),
                    value: this.getLimitSuborders,
                    symbol: ''
                },
                {
                    name: this.$t('transactionStatusModal.dcaDetails.created'),
                    value: this.getLimitCreationDate,
                    symbol: ''
                },
                {
                    name: this.$t('transactionStatusModal.dcaDetails.estimatedEndDate'),
                    value: this.getEstimatedEndDate,
                    symbol: ''
                }
            ]
        },
        getDetails() {
            switch (this.modalState.mode) {
                case "swap":
                    return this.swapDetails[this.getStatus]
                case "limit":
                    return this.limitDetails
                case "dca":
                    return this.dcaDetails
            }
        },
        checkIntermediateTokens() {
            let failedArray = [];

            const steps = this.transactionStore.GET_SWAP_TRANSACTION_STATUS;

            if (steps && steps.length > 0) {
                steps.forEach((step) => {
                    if (step?.status === 'failed' || step?.status === 'timed_out') {
                        failedArray.push(step);
                    }
                });
            }

            return failedArray;
        },
        getDisplayIntermediate() {
            let tokens = []

            this.checkIntermediateTokens.forEach((item, index) => {
                let metadata = item?.input.token.metadata;
                const convertedAmount = item?.input.amount / Math.pow(10, metadata.decimals);
                tokens.push(convertedAmount.toFixed(2) + ' ' + metadata.symbol);
            });

            return tokens.join(', ');
        },
        getProfitDisplay() {
            let profit = (this.dexStore.GET_DEAL_CONDITIONS?.savings * 100)
            return profit > 100 ? '>100' : profit;
        },
        getPriceImpactDisplay() {
            let pi = this.getPriceImpact;
            if (pi) {
                return pi > 0 ? `+${this.prettyNumber(pi, 2)}` : pi;
            } else {
                return 0;
            }
        },
        getColorImpact() {
            if (this.getPriceImpact <= -5) {
                return '#EA3943';
            } else if (this.getPriceImpact <= -1) {
                return '#FFCF55';
            } else {
                return '#5DFF54';
            }
        },
        getPriceImpact() {
            if (this.dexStore.GET_DEAL_CONDITIONS !== null) {
                return this.dexStore.GET_DEAL_CONDITIONS?.price_impact * 100;
            } else {
                return 0;
            }
        },
        getLimitSummary() {
            let first = `${this.prettyNumber( this.limitInfo?.firstAmount ?? 0, 2)} ${this.limitInfo?.firstToken?.symbol}`
            let second = `${this.prettyNumber(this.limitInfo?.secondAmount, 2)} ${this.limitInfo?.secondToken?.symbol}`
            return `${first} = ${second}`
        },
        getLimitBuying() {
            return `${this.prettyNumber(this.limitInfo?.secondAmount ?? 0, 2)} ${this.limitInfo?.secondToken?.symbol}`
        },
        getLimitSuborders() {
            return this.limitInfo?.maxSuborders || 0
        },
        getLimitCreationDate() {
            let date = new Date(Date.now())
            return `${date.toLocaleDateString()}, ${date.toLocaleTimeString()}`;
        },
        getDcaDeposit() {
            return `${this.prettyNumber( this.limitInfo?.firstAmount ?? 0, 2)} ${this.limitInfo?.firstToken?.symbol}`
        },
        getEachOrderSize() {
            let suborders = 2
            if (this.getLimitSuborders > 0) {
                suborders = this.getLimitSuborders
            }
            let calc = this.limitInfo?.firstAmount / suborders
            return `${calc} ${this.limitInfo?.firstToken?.symbol}`
        },
        getEstimatedEndDate() {
            let now = Date.now()
            let suborders = 2
            if (this.getLimitSuborders > 0) {
                suborders = this.getLimitSuborders
            }
            let date = new Date(now + suborders * (this.limitInfo?.intervalSec * 1000))
            return `${date.toLocaleDateString()}, ${date.toLocaleTimeString()}`;
        }
    },
    beforeUnmount() {
        clearRequestInterval()
    },
    watch: {
        getSwapStatus: {
            handler() {
                if (this.getSwapStatus === 'success' || this.getSwapStatus === 'failed') {
                    clearRequestInterval()
                }
            }
        },
        checkIntermediateTokens: {
            handler() {
                if (this.checkIntermediateTokens.length > 0) {
                    this.swapSuccess.push()
                }
            }
        }
    },
}
</script>

<style scoped>

</style>
