<template>
    <li class="item">
        <div class="item__preview"
             @click.stop="showMore = !showMore"
        >
            <div class="item__row">
                <div class="item__info">
                    <div class="item__icon-wrapper">
                        <img :src="getFirstImage" alt="icon" class="item__icon">
                        <img :src="getSecondImage" alt="icon" class="item__icon second-icon">
                    </div>
                    <div class="item__path">
                        <p class="item__path-text">{{ displayInputToken }}</p>
                        <HistoryArrowIcon />
                        <p class="item__path-text">{{ displayOutputToken }}</p>
                    </div>
                    <a :href="getLink" target="_blank" class="item__share-link">
                        <ShareIcon class="share-icon"/>
                    </a>
                </div>
                <ChevronBottom :class="[{rotate: showMore}, 'chevron-icon']"/>
            </div>
            <div class="item__group">
                <div class="item__row">
                    <p class="item__text"
                        v-if="getStatus === 'active'"
                    >
                        <span class="item__desc">{{ $t('limitHistoryItem.balance') }}</span>
                        {{ displayCurrentBalance }}
                    </p>
                    <p class="item__desc"
                       v-else
                    >
                        {{ getDisplayStatus }}
                    </p>
                    <p class="item__text"
                        v-if="item.type === 'limit'"
                    >
                        {{ displayCurrentOutputToken }}
                        <span class="item__desc">
                            / {{ displayOutputToken }}
                            ({{ getProgressPercent.toFixed(2) }}%)
                        </span>
                    </p>
                    <p class="item__desc"
                        v-else
                    >
                        {{ displayDcaProgress }}
                    </p>
                </div>
                <div class="progress">
                    <div class="progress__line"
                        :style="{width: `${getProgressPercent}%`}"
                    ></div>
                </div>
            </div>
        </div>
        <LimitHistoryDetails
            v-if="showMore"
            :item="item"
        />
        <button class="details__cancel-btn"
                v-if="showMore && getStatus === 'active'"
                @click="cancelAction(item?.id)"
        >
            {{ $t('limitHistoryItem.cancelOrder') }}
        </button>
    </li>
</template>

<script>
import HistoryArrowIcon from "@/assets/limit/HistoryArrowIcon.vue";
import ShareIcon from "@/assets/earn/pool-page/ShareIcon.vue";
import ChevronBottom from "@/assets/earn/transfer-liquidity/ChevronBottom.vue";
import LimitDetailsItem from "@/components/limit/LimitDetailsItem.vue";
import methodsMixins from "@/mixins/methodsMixins.ts";
import computedMixins from "@/mixins/computedMixins.ts";
import LimitHistoryDetails from "@/components/limit/LimitHistoryDetails.vue";

export default {
    name: "LimitHistoryItem",
    components: {LimitHistoryDetails, LimitDetailsItem, ChevronBottom, ShareIcon, HistoryArrowIcon},
    props: {
        item: {
            type: Object,
            required: true
        }
    },
    inject: ['cancelAction'],
    mixins: [methodsMixins, computedMixins],
    data() {
        return {
            showMore: false,
        }
    },
    computed: {
        getLink() {
            let from = this.item?.token_from
            let to = this.item?.token_to
            if (to?.address?.address !== 'native') {
                return `https://tonviewer.com/${to?.address?.address}`
            } else {
                return `https://tonviewer.com/${from?.address?.address}`
            }
        },
        getStatus() {
            return this.item?.status
        },
        getDisplayStatus() {
            switch (this.getStatus) {
                case 'requested_cancellation': {
                    return this.$t('ordersStatus.cancellation')
                }
                case 'executed': {
                    return this.$t('ordersStatus.completed')
                }
                case 'cancelled_by_user':
                case 'cancelled_by_system': {
                    return this.$t('ordersStatus.cancelled')
                }
                case 'max_retries_exceeded': {
                    return this.$t('ordersStatus.maxRetries')
                }
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
                return this.getLimitProgress > 100 ? 100 : this.getLimitProgress
            } else {
                return this.getDcaProgress > 100 ? 100 : this.getDcaProgress
            }
        },
        displayDcaProgress() {
            return `${this.item.suborders_executed}/${this.item.max_suborders} suborders`
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
    }
}
</script>

<style scoped>
.item {
    border-radius: 14px;
    padding: 14px;
    border: 1px solid var(--iface-white6);
}

.item__preview {
    display: flex;
    flex-direction: column;
    gap: 14px;
    cursor: pointer;
}

.item__icon-wrapper {
    width: 34px;
    display: flex;
    align-items: center;
}

.item__row {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.item__info {
    display: flex;
    align-items: center;
    gap: 6px;
}

.item__icon {
    width: 20px;
    border-radius: 100px;
}

.second-icon {
    transform: translateX(-6px);
    outline: 2px solid var(--earn-bg);
}

.item__path {
    display: flex;
    align-items: center;
    gap: 6px;
}

.item__path-text {
    font-size: 14px;
    line-height: normal;
    font-weight: 500;
}



.item__share-link {
    display: flex;
    opacity: 0.6;
    transition: .2s;
}

.item__share-link:hover {
    opacity: 1;
}

.chevron-icon {
    width: 20px;
    height: 20px;
    opacity: 0.8;
}

.item__text {
    font-size: 13px;
    font-weight: 400;
    line-height: normal;
}

.item__desc {
    font-size: 13px;
    font-weight: 400;
    line-height: normal;
    opacity: 0.6;
}

.item__group {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.progress {
    width: 100%;
    height: 10px;
    padding: 2px;
    border-radius: 100px;
    background: var(--iface-white6);
    overflow: hidden;
}

.progress__line {
    height: 100%;
    width: 0;
    border-radius: 100px;
    background: #007AFF;
}

.rotate {
    transform: rotateX(180deg);
}

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

.details__cancel-btn {
    margin-top: 14px;
    width: 100%;
    height: 44px;
    border: none;
    outline: none;
    border-radius: 12px;
    background: rgba(234, 57, 67, 0.10);
    color: #EA3943;
    font-size: 14px;
    font-weight: 400;
    line-height: normal;
    transition: .2s;
}
.details__cancel-btn:hover {
    background: rgba(234, 57, 67, 0.20);
}

</style>
