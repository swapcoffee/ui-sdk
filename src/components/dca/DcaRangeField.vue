<template>
    <div
        :class="[{small_padding: dcaStore.GET_DCA_ENABLE_RANGE}, position, 'range-field']"
    >
        <div class="range-field__preview">
            <p class="range-field__text">{{ $t('dcaSettings.rangeOptional') }}</p>
            <div class="range-field__row">
                <p class="range-field__extra"
                    v-if="dcaStore.GET_DCA_ENABLE_RANGE"
                >
                   {{ getCurrentSummary }}
                </p>
                <button class="range-field__button"
                        @click="toggleRange"
                >
                    {{ getBtnText }}
                </button>
            </div>
        </div>
        <div class="range-field__group"
            v-if="dcaStore.GET_DCA_ENABLE_RANGE"
        >
            <SettingsInput
                :placeholder="'Min price'"
                :label-name="'Min'"
                :min-value="0"
                :max-value="10000"
                :model-value="minValue"
                @update:model-value="updateMinValue"
            />
            <SettingsInput
                :placeholder="'Max price'"
                :label-name="'Max'"
                :min-value="
                    minValue.length > 0
                    ? Number(minValue)
                    : 0
                "
                :max-value="10000"
                :model-value="maxValue"
                @update:model-value="updateMaxValue"
            />
        </div>
    </div>
</template>

<script>
import SettingsInput from "@/components/general/SettingsInput.vue";
import {stableRateTokens} from "@/helpers/strategies/stable-rate-tokens.js";
import {useLimitStore} from "@/stores/limit/index.js";
import {useDcaStore} from "@/stores/dca/index.js";

export default {
    name: "DcaRangeField",
    components: {SettingsInput},
    props: {
        position: {
            type: String,
            default() {
                return ''
            }
        }
    },
    data() {
        return {
            minValue: '',
            maxValue: '',
            usdtAddress: "0:b113a994b5024a16719f69139328eb759596c38a25f59028b146fecdc3621dfe",
        }
    },
    computed: {
        limitStore() {
          return useLimitStore()
        },
        dcaStore() {
          return useDcaStore()
        },
        getBtnText() {
            if (this.dcaStore.GET_DCA_ENABLE_RANGE) {
                return this.$t('dcaSettings.disable')
            } else {
                return this.$t('dcaSettings.enable')
            }
        },
        getTokens() {
            return {
                first: this.limitStore.GET_LIMIT_FIRST_TOKEN,
                second: this.limitStore.GET_LIMIT_SECOND_TOKEN
            }
        },
        isTonToUsdt() {
            if (this.getTokens.first.address === 'native' && this.getTokens.second.address === this.usdtAddress) {
                return 'first'
            } else if (this.getTokens.first.address === this.usdtAddress && this.getTokens.second.address === 'native') {
                return 'second'
            }
        },
        isStableRate() {
            let stableTokens = stableRateTokens().filter((item) => item !== 'native')
            if (stableTokens.includes(this.getTokens?.first?.address)) {
                return 'first'
            } else if (stableTokens.includes(this.getTokens?.second?.address)) {
                return 'second'
            }
        },
        firstToken() {
            if (this.isTonToUsdt === 'first' || this.isStableRate === 'second') {
                return this.getTokens.second
            }
            return this.getTokens.first
        },
        secondToken() {
            if (this.isTonToUsdt === 'first' || this.isStableRate === 'second') {
                return this.getTokens.first
            }
            return this.getTokens.second
        },
        summaryValue() {
            let calc = this.secondToken.price_usd / this.firstToken.price_usd
            return Number.isInteger(calc) ? calc.toString() : calc.toFixed(4)
        },
        getCurrentSummary() {
            return `${this.summaryValue} ${this.firstToken?.symbol} / ${this.secondToken?.symbol}`
        }
    },
    methods: {
        toggleRange() {
            this.dcaStore.DCA_ENABLE_RANGE(!this.dcaStore.GET_DCA_ENABLE_RANGE)
        },
        updateMinValue(value) {
            this.minValue = value
            if (value > 0) {
                this.saveMin(value)
            }
        },
        updateMaxValue(value) {
            this.maxValue = value
            if (value > 0) {
                this.saveMax(value)
            }
        },
        saveMin(value) {
            let reverseValue = Number(value)

            if (this.isTonToUsdt === 'second' || this.isStableRate === 'first') {
                reverseValue = 1 / Number(value)
            }  else if (!this.isTonToUsdt && !this.isStableRate) {
                reverseValue = 1 / Number(value)
            }

            this.dcaStore.DCA_MIN_RANGE(reverseValue)
        },
        saveMax(value) {
            let reverseValue = Number(value)

            if (this.isTonToUsdt === 'second' || this.isStableRate === 'first') {
                reverseValue = 1 / Number(value)
            } else if (!this.isTonToUsdt && !this.isStableRate) {
                reverseValue = 1 / Number(value)
            }
            // if (this.isTonToUsdt === 'first' || this.isStableRate === 'second') {
            //     reverseValue = this.firstToken.price_usd / this.maxValue
            // }
            this.dcaStore.DCA_MAX_RANGE(reverseValue)
        }
    },
    watch: {
        getTokens: {
            handler() {
                if (this.minValue.length > 0) {
                    this.saveMin(this.minValue)
                }
                if (this.maxValue.length > 0) {
                    this.saveMax(this.maxValue)
                }
            }
        }
    }
}
</script>

<style scoped>
.range-field {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 14px 8px;
    background: var(--iface-white3);
    transition: .2s;
}

.small_padding {
    padding: 14px 8px 8px 8px;
}

.down {
    border-radius: 0 0 12px 12px;
}

.range-field__row {
    display: flex;
    align-items: center;
}


.range-field__group {
    display: flex;
    align-items: center;
    gap: 8px;
}

.range-field__preview {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 6px;
}

.range-field__text {
    font-size: 13px;
    line-height: normal;
    opacity: 0.6;
}

.range-field__button {
    padding-left: 8px;
    border: none;
    outline: none;
    background: transparent;
    color: var(--iface-accent-color);
    font-size: 13px;
    line-height: normal;
    font-weight: 400;
    transition: .2s;
}

.range-field__button:hover {
    color: var(--iface-accent-hover);
}

.range-field__extra {
    font-size: 13px;
    opacity: 0.4;
}
</style>
