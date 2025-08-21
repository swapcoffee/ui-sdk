<template>
    <div ref="limit_details" class="dex__details" :class="{ active: showMore }">
        <div class="dex__switch" @click="toggleDetails">
            <div class="dex__group">
                <p class="dex__title">
                    {{ 'More details' }}
                </p>
            </div>
            <ChevronBottom class="arrow-icon"/>
        </div>
        <div class="dex__more-info">
            <DetailsItem
                v-for="(item, index) in getDetails"
                :key="index"
                :title="item.title"
                :text="item.text"
                :textColor="item.textColor"
                :display="item.display"
            />
        </div>
    </div>
</template>

<script>
import {mapGetters} from 'vuex';
import TooltipWrapper from '@/components/ui/TooltipWrapper.vue';
import transactionRoutesMixin from '@/mixins/transactionRoutesMixin.js';
import methodsMixins from '@/mixins/methodsMixins.js';
import DetailsIcon from "@/assets/swap-interface/DetailsIcon.vue";
import ChevronBottom from "@/assets/earn/transfer-liquidity/ChevronBottom.vue";
import DetailsItem from "@/components/general/DetailsItem.vue";

export default {
    name: 'MultiSwapDetails',
    components: {DetailsItem, ChevronBottom, DetailsIcon, TooltipWrapper},
    mixins: [transactionRoutesMixin, methodsMixins],
    data() {
        return {
            isReverse: false,
            showMore: false,
            tooltipList: [],
        };
    },
    inject: ['tokenValues'],
    computed: {
        ...mapGetters([
            'GET_DEX_WALLET',
            'GET_LIMIT_SUBORDERS',
            'GET_CALCULATED_PI',
            'GET_SLIPPAGE',
            'GET_DEAL_CONDITIONS',
            'GET_RECEIVE_MULTI_TOKEN',
            'GET_MEV_PROTECTION_VALUE'
        ]),
        getDetails() {
            return [
                {
                    title: this.$t('dexDetails.priceImpact.name'),
                    text: this.displayPriceImpact,
                    textColor: this.getPriceImpactColor,
                },
                {
                    title: this.$t('dexDetails.minimumReceive.name'),
                    text: this.displayMinimumReceive,
                },
                {
                    title: this.$t('dexDetails.fee.name'),
                    text: this.displayBlockchainFee,
                },
                {
                    title: this.$t('dexDetails.mev.name'),
                    text: this.getMevProtectionFee,
                    display: this.displayConditionMevProtection
                },
                {
                    title: this.$t('dexDetails.economy'),
                    text: this.displayProfit,
                    textColor: 'green'
                },
                {
                    title: this.$t('dexNavigation.cashback'),
                    text: this.getEstimatedCashbackAndFee.cashback,
                    textColor: 'green'
                },
            ]
        },
        getPriceImpact() {
            if (this.GET_CALCULATED_PI) {
                return this.GET_CALCULATED_PI;
            }
        },
        displayPriceImpact() {
            let pi = this.getPriceImpact;
            return (pi > 0 ? `+${pi}` : pi) + '%';
        },
        displayMinimumReceive() {
            let slippagePercentage = this.GET_SLIPPAGE;
            let receiveAmount = this.GET_DEAL_CONDITIONS?.total_output_amount;
            let minimumReceive = receiveAmount - (receiveAmount * slippagePercentage) / 100;

            return `${this.prettyNumber(minimumReceive, 2)} ${this.GET_RECEIVE_MULTI_TOKEN?.symbol}` ;
        },
        getMevProtectionFee() {
            return `${this.GET_DEAL_CONDITIONS?.total_mev_protection_fee} TON`;
        },
        displayConditionMevProtection() {
            return Boolean(this.GET_MEV_PROTECTION_VALUE && this.GET_DEAL_CONDITIONS?.total_mev_protection_fee);
        },
        displayBlockchainFee() {
            let gasFee = 0;

            this.GET_DEAL_CONDITIONS.routes.forEach((item) => {
                gasFee += item?.recommended_gas * 1.0
            })

            return this.$t('dexDetails.fee.text', {gasFee: gasFee.toFixed(3)})
        },
        displayProfit() {
            let profit = (this.GET_DEAL_CONDITIONS?.total_savings * 100).toFixed(2);
            return (profit > 100 ? '>100' : profit) + '%';
        },
        getEstimatedCashbackAndFee() {
            const cashback = this.GET_DEAL_CONDITIONS?.total_estimated_cashback_usd;
            const partnerFee = this.GET_DEAL_CONDITIONS?.partner_commission_ton;

            const formatAmount = (value, prefix = '') => {
                if (value > 0) {
                    let count = 2;
                    while (Number(value.toFixed(count)) <= 0 && count < 10) {
                        count++;
                    }
                    return `${prefix}${value.toFixed(count)}`;
                }
                return '';
            };

            return {
                cashback: formatAmount(cashback, '≈ $'),
                fee: !!partnerFee ? formatAmount(partnerFee, '≈ ') + ' TON'  : null
            };
        },
        getPriceImpactColor() {
            if (this.getPriceImpact <= -5) {
                return 'red';
            } else if (this.getPriceImpact <= -1) {
                return 'yellow';
            } else {
                return 'green';
            }
        }
    },
    watch: {
        showMore: {
            handler() {
                if (this.showMore === true) {
                    setTimeout(() => {
                        this.$refs.limit_details.classList.add('visible');
                    }, 300);
                } else {
                    this.$refs.limit_details.classList.remove('visible');
                }
            },
        },
    },
    methods: {
        toggleDetails() {
            this.showMore = !this.showMore;
            const walletAddress = this.GET_DEX_WALLET?.address;
        },
    },
};
</script>

<style scoped>
.tooltip-enter-active,
.tooltip-leave-active {
    transition: 0.1s ease-out;
}

.tooltip-enter-from,
.tooltip-leave-to {
    opacity: 0;
}

.slide-enter-active,
.slide-leave-active {
    transition: 0.2s ease-out;
}

.slide-enter-from,
.slide-leave-to {
    margin-bottom: -240px;
    transform-origin: top;
    transform: scaleY(0.01) translateY(-120px);
}

.dex__details {
    transition: height 0.3s ease-out,
    overflow 2s;
    height: 20px;
    overflow: hidden;
}

.active {
    height: 140px;
}

.visible {
    overflow: visible;
}

.dex__switch {
    display: flex;
    align-items: center;
    justify-content: space-between;
    cursor: pointer;
    padding: 0 5px;
}

.arrow-icon {
    width: 18px;
    height: 18px;
}

.active .arrow-icon {
    transform: rotateX(180deg);
}

.dex__title {
    display: flex;
    align-items: center;
    flex-wrap: nowrap;
    gap: 4px;
    font-size: 14px;
    font-family: Harmony-Regular, sans-serif;
    white-space: nowrap;
}

.dex__more-info {
    display: flex;
    flex-direction: column;
    gap: 10px 0;
    margin-top: 14px;
    padding: 0 5px;
}

.dex__group {
    display: flex;
    flex-direction: row;
    align-items: center;
}

@media screen and (max-width: 640px) {
    .dex__details {
        position: relative;
    }

    .icon-wrapper {
        position: static;
    }
}
</style>
