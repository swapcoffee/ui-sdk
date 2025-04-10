<template>
    <div ref="limit_details" class="dex__details" :class="{ active: showMore }">
        <div class="dex__switch" @click="toggleDetails">
            <div class="dex__group">
                <p class="dex__title">
                    {{ getTitleText }}
                    <span class="dex__extra-title">({{ getOutputUsd }})</span>
                    <DetailsIcon class="dex__details-icon"
                        @click.stop="isReverse = !isReverse"
                    />
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
            />
        </div>
    </div>
</template>

<script lang="ts">
import TooltipWrapper from '@/components/ui/TooltipWrapper.vue';
import transactionRoutesMixin from '@/mixins/transactionRoutesMixin.ts';
import methodsMixins from '@/mixins/methodsMixins.ts';
import DetailsIcon from "@/assets/earn/swap-interface/DetailsIcon.vue";
import ChevronBottom from "@/assets/earn/transfer-liquidity/ChevronBottom.vue";
import DetailsItem from "@/components/general/DetailsItem.vue";

import {useLimitStore} from "@/stores/limit";
import {useDexStore} from "@/stores/dex";
import {useLimitSettingsStore} from "@/stores/limit/settings.ts";
import {useSettingsStore} from "@/stores/settings";

export default {
    name: 'LimitDetails',
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
        limitStore() {
          return useLimitStore()
        },
        dexStore() {
          return useDexStore()
        },
         limitSettingsStore() {
           return useLimitSettingsStore()
         },
         settingsStore() {
           return useSettingsStore()
         },
        getDetails() {
          return [
                {
                title: this.$t('limitDetails.titleSend'),
                          text: this.displaySend,
                          textColor: this.settingsStore.GET_THEME === 'light' ? '#000' : '#fff'
                      },
                {
                  title: this.$t('limitDetails.titleReceive'),
                  text: this.displayReceive,
                          textColor: this.settingsStore.GET_THEME === 'light' ? '#000' : '#fff'
                },
                {
                  title: this.$t('limitDetails.titleRate'),
                  text: this.displayRate,
                          textColor: '#5DFF54'
                },
                {
                  title: this.$t('limitDetails.titleSuborders'),
                  text: this.limitSettingsStore.GET_LIMIT_SUBORDERS.toString(),
                  textColor: this.settingsStore.GET_THEME === 'light' ? '#000' : '#fff'
                }
          ]
        },
        getTokens() {
            return {
                first: this.limitStore.GET_LIMIT_FIRST_TOKEN,
                second: this.limitStore.GET_LIMIT_SECOND_TOKEN
            }
        },
        getTitleText() {
            let first = this.getTokens.first
            let second = this.getTokens.second
            let calc = second.price_usd / first.price_usd
            let reverseCalc = first.price_usd / second.price_usd

            if (this.isReverse) {
                return `1 ${first?.symbol} ≈ ${this.prettyNumber(reverseCalc, 2)} ${second?.symbol}`
            }
            return `1 ${second?.symbol} ≈ ${this.prettyNumber(calc, 2)} ${first?.symbol}`
        },
        getOutputUsd() {
            if (this.isReverse) {
                return '$' + this.prettyNumber(this.getTokens.first?.price_usd, 2)
            }
            return '$' + this.prettyNumber(this.getTokens.second?.price_usd, 2)
        },
        displaySend() {
			return `${this.prettyNumber(Number(this.tokenValues.first), 2)} ${this.getTokens.first.symbol}`
        },
        displayReceive() {
	        return `${this.prettyNumber(Number(this.tokenValues.second), 2)} ${this.getTokens.second.symbol}`
        },
        displayRate() {
	        return `${this.prettyNumber(Number(this.tokenValues.rate), 2)}`
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
            const walletAddress = this.dexStore.GET_DEX_WALLET?.address;
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
    margin-top: 14px;
    padding: 0 5px;
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

