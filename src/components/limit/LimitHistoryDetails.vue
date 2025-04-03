<template>
    <div class="item__details details">
        <div class="details__row"
             v-for="(detailItem, index) in getDetails"
             :key="index"
        >
            <LimitDetailsItem
                :title="detailItem.firstTitle"
                :text="detailItem?.firstText"
            />
            <LimitDetailsItem
                :title="detailItem.secondTitle"
                :text="detailItem?.secondText"
            />
        </div>
    </div>
</template>

<script>
import LimitDetailsItem from "@/components/limit/LimitDetailsItem.vue";
import methodsMixins from "@/mixins/methodsMixins.ts";
import computedMixins from "@/mixins/computedMixins.ts";

export default {
    name: "LimitHistoryDetails",
    components: {LimitDetailsItem},
    mixins: [methodsMixins, computedMixins],
    data() {
        return {}
    },
    props: {
        item: {
            type: Object,
            required: true
        }
    },
    computed: {
        getDetails() {
            if (this.item.type === 'limit') {
                return this.limitDetails
            } else {
                return this.dcaDetails
            }
        },
        limitDetails() {
            return [
                {
                    firstTitle: this.$t('limitHistoryDetails.limitDetails.firstTitleSelling'),
                    secondTitle: this.$t('limitHistoryDetails.limitDetails.secondTitleBuying'),
                    firstText: this.displayInputToken,
                    secondText: this.displayOutputToken
                },
                {
                    firstTitle: this.$t('limitHistoryDetails.limitDetails.firstTitlePrice'),
                    secondTitle: '',
                    firstText: this.displayInputPrice,
                    secondText: this.displayOutputPrice
                },
                {
                    firstTitle: this.$t('limitHistoryDetails.limitDetails.firstTitleCommission'),
                    secondTitle: this.$t('limitHistoryDetails.limitDetails.secondTitleSuborders'),
                    firstText: this.displayFee,
                    secondText: this.displaySuborders
                },
                {
                    firstTitle: this.$t('limitHistoryDetails.limitDetails.firstTitleCreated'),
                    secondTitle: this.getLimitTimeTitle,
                    firstText: this.displayCreateTime,
                    secondText: this.displayExpiryTime
                },
            ]
        },
        dcaDetails() {
            return [
                {
                    firstTitle: this.$t('limitHistoryDetails.dcaDetails.firstTitleDeposited'),
                    secondTitle: this.getStatus === 'active' || this.getStatus === 'requested_cancellation'
                        ? this.$t('limitHistoryDetails.dcaDetails.secondTitleActiveStatus')
                        : this.$t('limitHistoryDetails.dcaDetails.secondTitleCancelStatus'),
                    firstText: this.displayInputToken,
                    secondText: this.displayEachOrderSize
                },
                {
                    firstTitle: this.getDcaTitle,
                    secondTitle: this.$t('limitHistoryDetails.dcaDetails.secondTitleCurrentAveragePrice'),
                    firstText: this.displayDcaByStatus,
                    secondText: this.displayCurrentAveragePrice
                },
                {
                    firstTitle: this.$t('limitHistoryDetails.dcaDetails.firstTitleCreated'),
                    secondTitle: this.getDcaTimeTitle,
                    firstText: this.displayCreateTime,
                    secondText: this.displayDcaTime,
                },
                {
                    firstTitle: this.$t('limitHistoryDetails.dcaDetails.firstTitleEstimated'),
                    secondTitle: this.$t('limitHistoryDetails.dcaDetails.secondTitleEstimated'),
                    firstText: this.displayFee,
                    secondText: this.displaySuborders
                },
            ]
        },
        getStatus() {
            return this.item?.status
        },
        getDisplayStatus() {
            switch (this.getStatus) {
                case 'requested_cancellation': {
                    return this.$t('limitHistoryDetails.displayStatus.cancel')
                }
                case 'executed': {
                    return this.$t('limitHistoryDetails.displayStatus.completed')
                }
                case 'cancelled_by_user':
                case 'cancelled_by_system': {
                    return this.$t('limitHistoryDetails.displayStatus.cancelled')
                }
                case 'max_retries_exceeded': {
                    return this.$t('limitHistoryDetails.displayStatus.max-retries')
                }
            }
        },
        getLimitTimeTitle() {
            switch (this.getStatus) {
                case 'active':
                case 'requested_cancellation': {
                    return this.$t('limitHistoryDetails.limitTimeTitle.expiryTime')
                }
                case 'executed': {
                    return this.$t('limitHistoryDetails.limitTimeTitle.completed')
                }
                case 'cancelled_by_user':
                case 'cancelled_by_system':
                case 'max_retries_exceeded': {
                    return this.$t('limitHistoryDetails.limitTimeTitle.cancelled')
                }
                default:
                    return this.$t('limitHistoryDetails.limitTimeTitle.expiryTime')
            }
        },
        getDcaTitle() {
            switch (this.getStatus) {
                case 'active':
                    return `DCA ${this.getSecondToken} ${this.$t('limitHistoryDetails.dcaTitles.balance')}`
                case 'executed':
                    return this.$t('limitHistoryDetails.dcaTitles.priceRange')
            }
        },
        getDcaTimeTitle() {
            switch (this.getStatus) {
                case 'active':
                case 'requested_cancellation': {
                    return this.$t('limitHistoryDetails.dcaTime.estimatedEndData')
                }
                case 'executed': {
                    return this.$t('limitHistoryDetails.dcaTime.completed')
                }
                case 'cancelled_by_user':
                case 'cancelled_by_system':
                case 'max_retries_exceeded': {
                    return this.$t('limitHistoryDetails.dcaTime.cancelled')
                }
                default:
                    return this.$t('limitHistoryDetails.dcaTime.estimatedEndData')
            }
        },
        getFirstImage() {
            return this.item?.token_from?.metadata.image_url
        },
        getSecondImage() {
            return this.item?.token_to?.metadata.image_url
        },
        getFirstToken() {
            return this.item.token_from.metadata.symbol
        },
        getSecondToken() {
            return this.item.token_to.metadata.symbol
        },
        getInputAmount() {
            return Number(this.item.initial_input_amount) / Math.pow(10, this.item.token_from?.metadata.decimals)
        },
        getOutputAmount() {
            return Number(this.item.settings.min_output_amount) / Math.pow(10, this.item.token_to?.metadata.decimals)
        },
        getCurrentInput() {
            return Number(this.item.current_input_amount) / Math.pow(10, this.item.token_from?.metadata.decimals)
        },
        getCurrentOutput() {
            return Number(this.item.current_output_amount) / Math.pow(10, this.item.token_to?.metadata.decimals)
        },
        getLimitProgress() {
            if (this.getCurrentOutput > 0) {
                return this.getCurrentOutput / this.getOutputAmount * 100
            } else if (this.getCurrentOutput > this.getOutputAmount) {
                return this.getOutputAmount / this.getOutputAmount * 100
            } else {
                return 0
            }
        },
        getDcaProgress() {
            return this.item.suborders_executed / this.item.max_suborders * 100
        },
        getProgressPercent() {
            if (this.item.type === 'limit') {
                return this.getLimitProgress
            } else {
                return this.getDcaProgress
            }
        },
        displayDcaProgress() {
            return `${this.item.suborders_executed}/${this.item.max_suborders} suborders`
        },
        displayInputPrice() {
            let oneInput = this.getInputAmount / this.getInputAmount
            let output = this.getOutputAmount / this.getInputAmount
            return `${this.prettyNumber(oneInput, 2)} ${this.getFirstToken} = ${this.prettyNumber(output, 2)} ${this.getSecondToken}`
        },
        displayOutputPrice() {
            let oneOutput = this.getOutputAmount / this.getOutputAmount
            let input = this.getInputAmount / this.getOutputAmount
            return `${this.prettyNumber(oneOutput, 2)} ${this.getSecondToken} = ${this.prettyNumber(input, 2)} ${this.getFirstToken}`
        },
        displayInputToken() {
            return `${this.prettyNumber(this.getInputAmount, 2)} ${this.getFirstToken}`
        },
        displayOutputToken() {
            if (this.item.type === 'limit') {
                return `${this.prettyNumber(this.getOutputAmount, 2)} ${this.getSecondToken}`
            } else {
                return this.getSecondToken
            }
        },
        displayCurrentOutputToken() {
            let value = this.prettyNumber(this.getCurrentOutput, 2)

            if (this.getCurrentOutput > this.getOutputAmount) {
                value = this.prettyNumber(this.getOutputAmount, 2)
            }

            return `${value} ${this.getSecondToken}`
        },
        displayCurrentBalance() {
            return `${this.prettyNumber(this.getInputAmount, 2)} ${this.getFirstToken}`
        },
        displayFee() {
            return '-'
        },
        displaySuborders() {
            return `${this.item.suborders_executed} / ${this.item.max_suborders}`
        },
        displayCreateTime() {
            let date = new Date(this.item?.creation_timestamp * 1000);
            return `${date.toLocaleDateString()}, ${date.toLocaleTimeString()}`;
        },
        displayExpiryTime() {
            if (this.getStatus === 'active' || this.getStatus === 'requested_cancellation') {
                return 'Never'
            } else {
                let date = new Date(this.item?.close_timestamp);
                return `${date.toLocaleDateString()}, ${date.toLocaleTimeString()}`;
            }
        },
        displayDcaByStatus() {
            switch (this.getStatus) {
                case "active":
                    return this.prettyNumber(this.getCurrentOutput, 2)
                case "executed":
                    return this.displayPriceRange
            }
        },
        getEachOrderSize() {
            return this.getInputAmount / this.item.max_suborders
        },
        displayEachOrderSize() {
            if (this.getStatus === 'active') {
                return `${this.prettyNumber(this.getEachOrderSize, 2)} ${this.getFirstToken}`
            } else {
                return this.displayCurrentOutputToken
            }
        },
        displayCurrentAveragePrice() {
            let calc = this.getStatus === 'active'
                ? (this.getCurrentInput / this.getCurrentOutput)
                : (this.getInputAmount / this.getCurrentOutput)
            return `${this.prettyNumber(calc, 4)} ${this.getFirstToken} / ${this.getSecondToken}`
        },
        displayPriceRange() {
            return `0.1 - 0.45 ${this.getFirstToken}`
        },
        getEstimatedDate() {
            let delay = this.item?.settings?.delay_millis * (this?.item.max_suborders - 1)
            let calcTimestamp = this.item?.creation_timestamp * 1000 + delay
            let date = new Date(calcTimestamp);
            return `${date.toLocaleDateString()}, ${date.toLocaleTimeString()}`;
        },
        displayDcaTime() {
            if (this.getStatus === 'active' || this.getStatus === 'requested_cancellation') {
                return this.getEstimatedDate
            } else {
                let date = new Date(this.item?.close_timestamp);
                return `${date.toLocaleDateString()}, ${date.toLocaleTimeString()}`;
            }
        }
    }
}
</script>

<style scoped>
.details {
    margin-top: 14px;
}

.details__row {
    display: flex;
    align-items: flex-end;
}

.details__row:not(:last-child) {
    padding-bottom: 14px;
    margin-bottom: 14px;
    border-bottom: 1px solid var(--iface-white6);
}
</style>
