<template>
    <div ref="details" class="dex__details" :class="{ active: showMore }">
        <div class="dex__switch" @click="toggleDetails">
            <div class="dex__group">
                <!--				<img src="@/assets/dex/switch.svg" alt="" class="swap-icon">-->
                <p class="dex__title">
                    {{ getTitleText }}
                    <span class="dex__extra-title">({{ getOutputUsd }})</span>
                    <DetailsIcon
                        class="dex__details-icon"
                        @click.stop="isReverse = !isReverse"
                    />
                </p>
            </div>
            <img src="../../assets/dex/arrow-down.svg" alt="arrow icon" class="arrow-icon"/>
        </div>
        <!--		<transition name="slide">-->
        <!--		v-show="showMore"-->
        <div class="dex__more-info">
            <div class="dex__row">
                <div class="dex__group">
                    <p class="dex__name">
                        {{ $t('dexDetails.priceImpact.name') }}
                    </p>
                    <div class="icon-wrapper" @mouseenter="showTooltip(1)" @mouseleave="hideTooltip(1)">
                        <!--						<img src="@/assets/dex/details-info.svg" alt="" class="dex__info-icon">-->
                        <svg
                            class="dex__info-icon"
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 16 16"
                            fill="none"
                        >
                            <g opacity="0.5">
                                <path
                                    d="M8 1.5C6.71442 1.5 5.45772 1.88122 4.3888 2.59545C3.31988 3.30968 2.48676 4.32484 1.99479 5.51256C1.50282 6.70028 1.37409 8.00721 1.6249 9.26809C1.8757 10.529 2.49477 11.6872 3.40381 12.5962C4.31285 13.5052 5.47104 14.1243 6.73192 14.3751C7.99279 14.6259 9.29973 14.4972 10.4874 14.0052C11.6752 13.5132 12.6903 12.6801 13.4046 11.6112C14.1188 10.5423 14.5 9.28558 14.5 8C14.4982 6.27665 13.8128 4.62441 12.5942 3.40582C11.3756 2.18722 9.72335 1.50182 8 1.5ZM7.75 4.5C7.89834 4.5 8.04334 4.54399 8.16668 4.6264C8.29002 4.70881 8.38615 4.82594 8.44291 4.96299C8.49968 5.10003 8.51453 5.25083 8.48559 5.39632C8.45665 5.5418 8.38522 5.67544 8.28033 5.78033C8.17544 5.88522 8.04181 5.95665 7.89632 5.98559C7.75083 6.01453 7.60003 5.99968 7.46299 5.94291C7.32595 5.88614 7.20881 5.79001 7.1264 5.66668C7.04399 5.54334 7 5.39834 7 5.25C7 5.05109 7.07902 4.86032 7.21967 4.71967C7.36032 4.57902 7.55109 4.5 7.75 4.5ZM8.5 11.5C8.23479 11.5 7.98043 11.3946 7.7929 11.2071C7.60536 11.0196 7.5 10.7652 7.5 10.5V8C7.36739 8 7.24022 7.94732 7.14645 7.85355C7.05268 7.75979 7 7.63261 7 7.5C7 7.36739 7.05268 7.24021 7.14645 7.14645C7.24022 7.05268 7.36739 7 7.5 7C7.76522 7 8.01957 7.10536 8.20711 7.29289C8.39465 7.48043 8.5 7.73478 8.5 8V10.5C8.63261 10.5 8.75979 10.5527 8.85356 10.6464C8.94732 10.7402 9 10.8674 9 11C9 11.1326 8.94732 11.2598 8.85356 11.3536C8.75979 11.4473 8.63261 11.5 8.5 11.5Z"
                                    fill="white"
                                />
                            </g>
                        </svg>
                        <transition name="tooltip">
                            <tooltip-wrapper
                                v-show="tooltipList.includes(1)"
                                class="dex__tooltip"
                                @hidden-tooltip="hiddenTooltip"
                            >
                                {{ $t('dexDetails.priceImpact.tooltip[0]') }} <br/>
                                {{ $t('dexDetails.priceImpact.tooltip[1]') }} <br/>
                                {{ $t('dexDetails.priceImpact.tooltip[2]') }}
                            </tooltip-wrapper>
                        </transition>
                    </div>
                </div>
                <p class="dex__impact" :class="getClassImpact">{{ getPriceImpactDisplay }}%</p>
            </div>
            <div class="dex__row">
                <div class="dex__group">
                    <p class="dex__name">
                        {{ $t('dexDetails.minimumReceive.name') }}
                    </p>
                    <div
                        ref="secondWrapper"
                        class="icon-wrapper"
                        @mouseenter="showTooltip(2)"
                        @mouseleave="hideTooltip(2)"
                    >
                        <svg
                            class="dex__info-icon"
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 16 16"
                            fill="none"
                        >
                            <g opacity="0.5">
                                <path
                                    d="M8 1.5C6.71442 1.5 5.45772 1.88122 4.3888 2.59545C3.31988 3.30968 2.48676 4.32484 1.99479 5.51256C1.50282 6.70028 1.37409 8.00721 1.6249 9.26809C1.8757 10.529 2.49477 11.6872 3.40381 12.5962C4.31285 13.5052 5.47104 14.1243 6.73192 14.3751C7.99279 14.6259 9.29973 14.4972 10.4874 14.0052C11.6752 13.5132 12.6903 12.6801 13.4046 11.6112C14.1188 10.5423 14.5 9.28558 14.5 8C14.4982 6.27665 13.8128 4.62441 12.5942 3.40582C11.3756 2.18722 9.72335 1.50182 8 1.5ZM7.75 4.5C7.89834 4.5 8.04334 4.54399 8.16668 4.6264C8.29002 4.70881 8.38615 4.82594 8.44291 4.96299C8.49968 5.10003 8.51453 5.25083 8.48559 5.39632C8.45665 5.5418 8.38522 5.67544 8.28033 5.78033C8.17544 5.88522 8.04181 5.95665 7.89632 5.98559C7.75083 6.01453 7.60003 5.99968 7.46299 5.94291C7.32595 5.88614 7.20881 5.79001 7.1264 5.66668C7.04399 5.54334 7 5.39834 7 5.25C7 5.05109 7.07902 4.86032 7.21967 4.71967C7.36032 4.57902 7.55109 4.5 7.75 4.5ZM8.5 11.5C8.23479 11.5 7.98043 11.3946 7.7929 11.2071C7.60536 11.0196 7.5 10.7652 7.5 10.5V8C7.36739 8 7.24022 7.94732 7.14645 7.85355C7.05268 7.75979 7 7.63261 7 7.5C7 7.36739 7.05268 7.24021 7.14645 7.14645C7.24022 7.05268 7.36739 7 7.5 7C7.76522 7 8.01957 7.10536 8.20711 7.29289C8.39465 7.48043 8.5 7.73478 8.5 8V10.5C8.63261 10.5 8.75979 10.5527 8.85356 10.6464C8.94732 10.7402 9 10.8674 9 11C9 11.1326 8.94732 11.2598 8.85356 11.3536C8.75979 11.4473 8.63261 11.5 8.5 11.5Z"
                                    fill="white"
                                />
                            </g>
                        </svg>
                        <transition name="tooltip">
                            <tooltip-wrapper
                                v-show="tooltipList.includes(2)"
                                class="dex__tooltip"
                                @hidden-tooltip="hiddenTooltip"
                            >
                                {{ $t('dexDetails.minimumReceive.tooltip[0]') }} <br/>
                                {{ $t('dexDetails.minimumReceive.tooltip[1]') }} <br/>
                                {{ $t('dexDetails.minimumReceive.tooltip[2]') }}
                            </tooltip-wrapper>
                        </transition>
                    </div>
                </div>
                <p class="dex__value">≈ {{ getMinimumReceive }} {{ GET_RECEIVE_TOKEN?.symbol }}</p>
            </div>
            <div class="dex__row">
                <p class="dex__name">
                    {{ $t('dexDetails.fee.name') }}
                </p>
                <p class="dex__value">
                    {{ $t('dexDetails.fee.text', {gasFee: getGasFeeDisplay}) }}
                </p>
            </div>
            <div class="dex__row" v-if="getEstimatedCashbackAndFee.fee">
                <p class="dex__name">
                    {{ $t('dexDetails.fee.integrator') }}
                </p>
                <p class="dex__value">{{ getEstimatedCashbackAndFee.fee }}</p>
            </div>
            <div class="dex__row">
                <p class="dex__name">
                    {{ $t('dexDetails.economy') }}
                </p>
                <p class="dex__value value_green">{{ getProfitDisplay }}%</p>
            </div>
            <div class="dex__row">
                <p class="dex__name">
                    {{ $t('dexNavigation.cashback') }}
                </p>
                <p class="dex__value value_green">{{ getEstimatedCashbackAndFee.cashback }}</p>
            </div>
        </div>
        <!--		</transition>-->
    </div>
</template>

<script>
import {mapGetters} from 'vuex';
import TooltipWrapper from '@/components/ui/TooltipWrapper.vue';
import transactionRoutesMixin from '@/mixins/transactionRoutesMixin.ts';
import methodsMixins from '@/mixins/methodsMixins.ts';
import DetailsIcon from "@/assets/earn/swap-interface/DetailsIcon.vue";

export default {
    name: 'DexDetails',
    components: {DetailsIcon, TooltipWrapper},
    mixins: [transactionRoutesMixin, methodsMixins],
    data() {
        return {
            showMore: false,
            isReverse: false,
            tooltipList: [],
        };
    },
    computed: {
        ...mapGetters([
            'GET_DEAL_CONDITIONS',
            'GET_RECEIVE_TOKEN',
            'GET_SEND_TOKEN',
            'GET_SLIPPAGE',
            'GET_DEX_WALLET',
            'GET_CALCULATED_PI'
        ]),
        getTitleText() {
            let first = this.GET_SEND_TOKEN
            let second = this.GET_RECEIVE_TOKEN
            let calc = second.price_usd / first.price_usd
            let reverseCalc = first.price_usd / second.price_usd

            if (this.isReverse) {
                return `1 ${first?.symbol} ≈ ${this.prettyNumber(reverseCalc, 2)} ${second?.symbol}`
            }
            return `1 ${second?.symbol} ≈ ${this.prettyNumber(calc, 2)} ${first?.symbol}`
        },
        getOutputUsd() {
            if (this.isReverse) {
                return '$' + this.prettyNumber(this.GET_DEAL_CONDITIONS?.input_usd / this.GET_DEAL_CONDITIONS?.input_amount, 2)
            }
            return '$' + this.prettyNumber(this.GET_DEAL_CONDITIONS?.output_usd / this.GET_DEAL_CONDITIONS?.output_amount, 2)
        },
        // getTitleText() {
        //     return this.showMore === false
        //         ? this.$t('dexDetails.titles[0]')
        //         : this.$t('dexDetails.titles[1]');
        // },
        getEstimatedCashbackAndFee() {
            const cashback = this.GET_DEAL_CONDITIONS?.estimated_cashback_usd;
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
        getClassImpact() {
            if (this.getPriceImpact <= -5) {
                return 'red-impact';
            } else if (this.getPriceImpact <= -1) {
                return 'yellow-impact';
            } else {
                return 'green-impact';
            }
        },
        getMinimumReceive() {
            let slippagePercentage = this.GET_SLIPPAGE;
            let receiveAmount = this.GET_DEAL_CONDITIONS?.output_amount;
            let minimumReceive = receiveAmount - (receiveAmount * slippagePercentage) / 100;

            return this.prettyNumber(minimumReceive, 2);
        },
        getProfitDisplay() {
            let profit = (this.GET_DEAL_CONDITIONS?.savings * 100).toFixed(2);
            return profit > 100 ? '>100' : profit;
        },
        getGasFeeDisplay() {
            let gasFee = this.GET_DEAL_CONDITIONS?.recommended_gas * 1.0;
            return gasFee.toFixed(3);
        },
        getPriceImpactDisplay() {
            let pi = this.getPriceImpact;
            return pi > 0 ? `+${pi}` : pi;
        },
        getPriceImpact() {
           if (this.GET_CALCULATED_PI) {
               return this.GET_CALCULATED_PI;
           }
        },
    },
    watch: {
        showMore: {
            handler() {
                if (this.showMore === true) {
                    setTimeout(() => {
                        this.$refs.details.classList.add('visible');
                    }, 300);
                } else {
                    this.$refs.details.classList.remove('visible');
                }
            },
        },
    },
    methods: {
        showTooltip(value) {
            this.tooltipList.push(value);
        },
        toggleDetails() {
            this.showMore = !this.showMore;
        },
        hideTooltip(value) {
            let findIndex = this.tooltipList.findIndex((item) => item === value);
            this.tooltipList.splice(findIndex, 1);
        },
        hiddenTooltip() {
            this.tooltipList = [];
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
    height: 34px;
    overflow: hidden;
}

.active {
    height: 170px;
}

.visible {
    overflow: visible;
}

.dex__switch {
    display: flex;
    align-items: center;
    justify-content: space-between;
    cursor: pointer;
    padding: 0 6px;
    margin-bottom: 15px;
}

.swap-icon {
    margin-right: 5px;
    width: 18px;
    height: 18px;
    transform: rotate(90deg);
}

.arrow-icon {
    width: 18px;
    height: 18px;
}

.active .arrow-icon {
    transform: rotateX(180deg);
}

.theme-light .arrow-icon {
    mix-blend-mode: difference;
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

.dex__extra-title {
    margin-left: 4px;
    font-size: 14px;
    font-family: Harmony-Regular, sans-serif;
    opacity: 0.44;
}

.dex__more-info {
    display: flex;
    flex-direction: column;
    gap: 10px 0;
    padding: 0 6px;
}

.dex__details-icon {
    opacity: 0.4;
    transition: .2s;
}

.dex__details-icon:hover {
    opacity: 1;
}

.dex__row {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.top-align {
    align-items: flex-start;
    flex-direction: column;
    justify-content: flex-end;
}

.dex__group {
    display: flex;
    flex-direction: row;
    align-items: center;
}

.dex__source-image {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    margin-right: 5px;
}

.dex__arrow-icon {
    transition: 0.15s;
    margin: 0 3px;
    width: 16px;
    height: 16px;
}

.theme-light .dex__arrow-icon {
    mix-blend-mode: difference;
    filter: invert(0.3);
}

.dex__name {
    font-size: 14px;
    opacity: 0.5;
    letter-spacing: 0.25px;
    line-height: 18px;
}

.icon-wrapper {
    display: flex;
    position: relative;
}

.dex__tooltip {
    bottom: 25px;
    left: 50%;
    transform: translateX(-49.5%);
}

.dex__info-icon {
    margin-left: 5px;
    width: 16px;
    height: 16px;
    cursor: help;
}

.theme-light svg path {
    fill: #141414;
}

.dex__impact {
    margin-left: 4px;
    font-size: 14px;
    opacity: 1;
}

.dex__flex-column {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-top: 10px;
    width: 100%;
    align-items: flex-end;
}

.dex__flex-group {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 0 3px;
}

.dex__arrow_small {
    width: 16px;
    height: 16px;
    opacity: 0.5;
}

.red-impact {
    color: var(--main-red);
}

.yellow-impact {
    color: var(--main-yellow);
}

.green-impact {
    color: var(--main-green);
}

.dex__value {
    font-size: 14px;
    letter-spacing: 0.25px;
    line-height: 18px;
}

.value_green {
    color: var(--main-green);
}

@media screen and (max-width: 640px) {
    .dex__details {
        position: relative;
    }

    .dex__tooltip {
        width: calc(100% - 10px);
        left: 5px;
        right: 5px;
        top: 85px;
        bottom: auto;
        transform: translateX(0);
    }

    .icon-wrapper {
        position: static;
    }
}
</style>
