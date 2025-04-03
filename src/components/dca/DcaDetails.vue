<template>
    <div ref="dca_details" class="details" :class="{ active: showMore }">
        <div class="details__switch" @click="toggleDetails">
            <div class="details__group">
                <p class="details__title">
                    {{ $t('dcaDetails.dcaSummary') }}
                </p>
            </div>
            <ChevronBottom class="arrow-icon"/>
        </div>
        <div class="details__more-info">
            <p class="details__desc">{{ displayDcaDeal }}</p>
            <DetailsItem
                v-for="(item, index) in getDetails"
                :key="index"
                :title="item.title"
                :text="item.text"
                :textColor="item.textColor"
            />
        </div>
    </div>
</template>

<script lang="ts">
import {mapGetters} from 'vuex';
import TooltipWrapper from '@/components/ui/TooltipWrapper.vue';
import transactionRoutesMixin from '@/mixins/transactionRoutesMixin.ts';
import methodsMixins from '@/mixins/methodsMixins.ts';
import DetailsIcon from "@/assets/earn/swap-interface/DetailsIcon.vue";
import ChevronBottom from "@/assets/earn/transfer-liquidity/ChevronBottom.vue";
import DetailsItem from "@/components/general/DetailsItem.vue";

export default {
    name: 'DcaDetails',
    components: {DetailsItem, ChevronBottom, DetailsIcon, TooltipWrapper},
    mixins: [transactionRoutesMixin, methodsMixins],
    data() {
        return {
            showMore: false,
            tooltipList: [],
        };
    },
    inject: ['tokenValues'],
    computed: {
        ...mapGetters([
            'GET_LIMIT_SECOND_TOKEN',
            'GET_LIMIT_FIRST_TOKEN',
            'GET_DEX_WALLET',
            'GET_LIMIT_SUBORDERS',
            'GET_DCA_EVERY_TIME'
        ]),
        getDetails() {
            return [
                {
                    title: this.$t('dcaDetails.details[0]'),
                    text: this.displaySellTotal,
                    textColor: '#fff'
                },
                {
                    title: this.$t('dcaDetails.details[1]'),
                    text: this.displaySellPerOrder,
                    textColor: '#fff'
                },
                {
                    title: this.$t('dcaDetails.details[2]'),
                    text: this.displayToBuy,
                    textColor: '#fff'
                },
                {
                    title: this.$t('dcaDetails.details[3]'),
                    text: this.displayOrderInterval,
                    textColor: '#fff'
                },
                {
                    title: this.$t('dcaDetails.details[4]'),
                    text: this.displayEndDate,
                    textColor: '#fff'
                },
            ]
        },
        getTokens() {
            return {
                first: this.GET_LIMIT_FIRST_TOKEN,
                second: this.GET_LIMIT_SECOND_TOKEN
            }
        },
        displayDcaDeal() {
		    return  this.$t("dcaDetails.dcaDeal.swapMessage", {
                    sellPerOrder: this.displaySellPerOrder,
                    toBuy: this.displayToBuy,
                    orderInterval: this.displayOrderInterval,
                    sellTotal: this.displaySellTotal,
                    orders: this.GET_LIMIT_SUBORDERS,
                    totalInterval: this.displayTotalInterval
                })
        },
	    displaySellTotal() {
		    return `${this.prettyNumber(Number(this.tokenValues.first), 2)} ${this.getTokens.first?.symbol}`
	    },
	    displaySellPerOrder() {
		    let calc = Number(this.tokenValues.first) / this.GET_LIMIT_SUBORDERS
		    return `${this.prettyNumber(calc,2)} ${this.getTokens.first?.symbol}`
	    },
	    displayToBuy() {
		    return this.getTokens.second?.symbol
	    },
	    getTimeUnits() {
		    return {
			    hour: 3600,
			    day: 86400,
			    week: 604800,
			    month: 2592000
		    }
	    },
	    displayOrderInterval() {
			let interval = this.GET_DCA_EVERY_TIME
                if (interval <= this.getTimeUnits.hour) {
	                let minutes = interval / 60
	                return `${minutes} ${this.$t('timeZone.minutes')}`

                } else if (interval > this.getTimeUnits.hour && interval <= this.getTimeUnits.day) {
	                let hours = interval / this.getTimeUnits.hour
	                return `${hours} ${this.$t('timeZone.hours')}`

                } else if (interval > this.getTimeUnits.day && interval <= (this.getTimeUnits.month + this.getTimeUnits.day)) {
	                let days = interval / this.getTimeUnits.day
                    return `${days} ${this.$t('timeZone.days')}`

                } else if (interval > this.getTimeUnits.month) {
	                let months = interval / this.getTimeUnits.month
	                return `${months} ${this.$t('timeZone.months')}`

                }
	    },
	    displayTotalInterval() {
		    let interval =
			    this.GET_LIMIT_SUBORDERS > 1
				    ? this.GET_DCA_EVERY_TIME * (this.GET_LIMIT_SUBORDERS - 1)
				    : this.GET_DCA_EVERY_TIME
		    if (interval <= this.getTimeUnits.hour) {
			    let minutes = interval / 60
			    return `${minutes} ${this.$t('timeZone.minutes')}`

		    } else if (interval > this.getTimeUnits.hour && interval <= this.getTimeUnits.day) {
			    let hours = interval / this.getTimeUnits.hour
			    return `${hours}  ${this.$t('timeZone.hours')}`

		    } else if (interval > this.getTimeUnits.day && interval <= (this.getTimeUnits.month + this.getTimeUnits.day)) {
			    let days = interval / this.getTimeUnits.day
			    return `${days} ${this.$t('timeZone.days')}`

		    } else if (interval > this.getTimeUnits.month) {
			    let months = interval / this.getTimeUnits.month
			    return `${months} ${this.$t('timeZone.months')}`

		    }
	    },
	    displayEndDate() {
			let delay =
                this.GET_LIMIT_SUBORDERS > 1
                    ? this.GET_DCA_EVERY_TIME * (this.GET_LIMIT_SUBORDERS - 1)
                    : 0
		    let calcTimestamp = Date.now() + delay * 1000
		    let date = new Date(calcTimestamp);
		    return `${date.toLocaleDateString()}, ${date.toLocaleTimeString()}`;
	    }
    },
    methods: {
        toggleDetails() {
            this.showMore = !this.showMore;
        },
    },
	watch: {
		showMore: {
			handler() {
				if (this.showMore === true) {
					setTimeout(() => {
						this.$refs.dca_details.classList.add('visible');
					}, 300);
				} else {
					this.$refs.dca_details.classList.remove('visible');
				}
			},
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

.details {
    transition: height 0.3s ease-out,
    overflow 2s;
    height: 20px;
    overflow: hidden;
}

.active {
    height: 230px;
}

.visible {
    overflow: visible;
}

.details__switch {
    display: flex;
    align-items: center;
    justify-content: space-between;
    cursor: pointer;
    padding: 0 5px;
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

.details__title {
    display: flex;
    align-items: center;
    flex-wrap: nowrap;
    gap: 4px;
    font-size: 14px;
    font-family: Harmony-Regular, sans-serif;
    white-space: nowrap;
}

.details__more-info {
    display: flex;
    flex-direction: column;
    gap: 10px 0;
    margin-top: 14px;
    padding: 0 5px;
}

.details__group {
    display: flex;
    flex-direction: row;
    align-items: center;
}

.details__desc {
    font-size: 14px;
}

.theme-light .details__arrow-icon {
    mix-blend-mode: difference;
    filter: invert(0.3);
}

.theme-light svg path {
    fill: #141414;
}
</style>
