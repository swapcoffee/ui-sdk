<template>
    <div class="rate"
         @click.stop="focusInput"
         :class="[{active: inputFocused}, position]"
    >
        <div class="rate__row">
            <skeleton-item
                class="skeleton__balance"
                v-if="showLoadingSkeleton"
            />
            <div class="rate__group"
                v-else
            >
                <p class="rate__text">{{ getRateText }}</p>
                <p :class="[profitStatus, 'rate__extra']">
                    ({{ displayProfit }}%)
                </p>
            </div>
            <button class="rate__market-btn"
                @click="this.setToMarket"
            >
                {{ $t('limitTokenRate.setToMarket') }}
            </button>
        </div>
        <label for="" class="rate__label">
            <DexInput id="rate_input"
                      :model-value="tokenValues.rate"
                      @update:model-value="updateValue"
                      @changeFocus="changeFocus"
            />
            <skeleton-item
                :border-radius="100"
                class="skeleton__token"
                v-if="showLoadingSkeleton"
            />
            <p class="rate__token"
                v-else
            >
                <img :src="getTokens?.second?.image" alt="" class="rate__token-img">
                {{ getTokens?.second?.symbol }}
<!--                <SwitchHorizontalIcon-->
<!--                    class="rate__btn-icon"-->
<!--                />-->
            </p>
        </label>
        <div class="rate__row">
            <skeleton-item
                class="skeleton__balance"
                v-if="showLoadingSkeleton"
            />
            <p class="rate__text"
                v-else
            >
               {{ getRatePrice }}
            </p>
        </div>
    </div>
</template>

<script>
import ChevronRightIcon from "@/assets/earn/pool-page/ChevronRightIcon.vue";
import DexInput from "@/components/dex/DexInput.vue";
import SwitchHorizontalIcon from "@/assets/earn/swap-interface/SwitchHorizontalIcon.vue";
import methodsMixins from "@/mixins/methodsMixins.ts";
import {stableRateTokens} from "@/helpers/strategies/stable-rate-tokens.ts";
import {useDexStore} from "@/stores/dex";

export default {
    name: "LimitTokenRate",
    components: {SwitchHorizontalIcon, DexInput, ChevronRightIcon},
    mixins: [methodsMixins],
    props: {
        first: {
            type: [Object, null],
            default() {
                return {}
            },
            required: true
        },
        second: {
            type: [Object, null],
            default() {
                return {}
            },
            required: true
        },
        position: {
            type: String,
            default() {
                return ""
            },
            required: true
        },
    },
    inject: [
        'updateRate',
        'tokenValues',
        'setToMarket'
    ],
    data() {
        return {
            inputFocused: false,
            usdtAddress: "0:b113a994b5024a16719f69139328eb759596c38a25f59028b146fecdc3621dfe",
        }
    },
    computed: {
        dexStore() {
            return useDexStore()
        },
        showLoadingSkeleton() {
            return !this.getTokens.first?.symbol || !this.getTokens.second?.symbol || this.dexStore.GET_TON_TOKENS.length === 0
        },
        isTonToUsdt() {
            if (this.first?.address === 'native' && this.second?.address === this.usdtAddress) {
                return 'first'
            } else if (this.first?.address === this.usdtAddress && this.second?.address === 'native') {
                return 'second'
            }
        },
        isStableRate() {
            let stableTokens = stableRateTokens()
            if (stableTokens.includes(this.first?.address)) {
                return 'first'
            } else if (stableTokens.includes(this.second?.address)) {
                return 'second'
            }
        },
        getNative() {
            return this.dexStore.GET_TON_TOKENS.find((token) => token.address === 'native')
        },
        getUsdt() {
            return this.dexStore.GET_TON_TOKENS.find((token) => token.address === this.usdtAddress)
        },
        getTokens() {
            if (this.isTonToUsdt) {
                return {
                    first: this.getNative,
                    second: this.getUsdt
                }
            } else if (this.isStableRate === 'first') {
                return {
                    first: this.second,
                    second: this.first
                }
            } else {
                return {
                    first: this.first,
                    second: this.second
                }
            }
        },
        getRateText() {
            let prefix = this.$t('limitTokenRate.send')
            if (this.isTonToUsdt === 'second') {
                prefix = this.$t('limitTokenRate.receive')
            } else if (this.isStableRate === 'first' && !this.isTonToUsdt)  {
                prefix = this.$t('limitTokenRate.receive')
            }

            return `${prefix} ${this.getTokens.first?.symbol} ${this.$t('limitTokenRate.atRate')}`
        },
        getProfitPercent() {
            const firstTotalUsd = this.tokenValues.first * this.first?.price_usd
            const secondTotalUsd = this.tokenValues.second * this.second?.price_usd
            const rate = Number(this.tokenValues.rate)

            if (firstTotalUsd > 0 && secondTotalUsd > 0) {
                let calc = this.first.price_usd - rate / this.first.price_usd * 100
                return firstTotalUsd > secondTotalUsd
                    ? ((secondTotalUsd / firstTotalUsd - 1) * 100)
                    : secondTotalUsd / firstTotalUsd * 100 - 100
            } else {
                return 0
            }
        },
        profitStatus() {
            if (this.getProfitPercent < 0) {
                return 'minus'
            }
        },
        displayProfit() {
            if (this.getProfitPercent > 0){
                return `+${this.prettyNumber(this.getProfitPercent, 2)}`
            }
            return `${this.prettyNumber(this.getProfitPercent, 2)}`
        },
        getRatePrice() {
            let calc = this.getTokens?.second?.price_usd * this.tokenValues?.rate
            if (!calc) calc = 0
            return `~$${this.prettyNumber(calc, 2)}`
        }
    },
    methods: {
        changeFocus(value) {
            this.inputFocused = value
        },
        focusInput() {
            let input = document.getElementById(`rate_input`)
            input.focus()
        },
        updateValue(value) {
            this.updateRate(value)
        },
    }
}
</script>

<style scoped>
    .rate {
        display: flex;
        flex-direction: column;
        gap: 14px;
        padding: 14px;
        background: var(--iface-white3);
        transition: .2s;
    }

    .rate:hover {
        background: var(--iface-white12);
    }

    .rate:active,
    .active {
        background: var(--iface-white16);
    }

    .active:hover {
        background: var(--iface-white16);
    }

    .rate__row {
        display: flex;
        align-items: center;
        justify-content: space-between;
    }

    .rate__group {
        display: flex;
        align-items: center;
        gap: 6px;
    }

    .rate__text {
        width: max-content;
        font-size: 13px;
        line-height: normal;
        opacity: 0.6;
    }

    .rate__extra {
        font-size: 13px;
        line-height: normal;
        color: #5DFF54;
    }

    .theme-light .rate__extra {
        color: #10A37F;
    }

    .rate__market-btn {
        text-align: right;
        border: none;
        outline: none;
        background: transparent;
        color: var(--iface-accent-color);
        font-size: 13px;
        line-height: normal;
        font-weight: 400;
        transition: .2s;
    }

    .rate__market-btn:hover {
        color: var(--iface-accent-hover);
    }

    .rate__label {
        display: flex;
        align-items: center;
        justify-content: space-between;
    }

    .rate__token {
        display: flex;
        height: 36px;
        align-items: center;
        gap: 6px;
        padding: 5px 12px 5px 6px;
        border-radius: 100px;
        border: 1px solid var(--iface-white10);
        font-size: 16px;
        font-weight: 500;
        line-height: normal;
        transition: .2s;
        color: var(--main-text-color);
    }

    .rate__token:hover {
        border: 1px solid var(--iface-white10);
    }

    .rate__token-img {
        width: 24px;
        height: 24px;
        border-radius: 100px;
    }

    .rate__btn-icon {
        width: 20px;
        height: 20px;
    }

    .skeleton__token {
        height: 36px;
        width: 100px;
    }

    .skeleton__balance {
        height: 16px;
        width: 70px;
    }

    .minus {
        color: var(--main-red);
    }
</style>
