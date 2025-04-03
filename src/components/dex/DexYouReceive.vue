<template>
    <div class="dex__you-receive">
        <div class="dex__content_empty"
             v-if="GET_RECEIVE_TOKEN === null && !getRouteQuery"
             @click="$emit('chooseReceiveToken')"
        >
            <p class="dex__text_empty">{{ $t("dexInterface.selectToken") }}</p>
        </div>
        <div class="dex__content"
             v-else
             @click.self="focusInput"
             :class="{active: inputFocused}"
        >
            <div class="dex__content-wrapper">
                <div class="dex__group group-margin">
                    <h4 class="dex__heading">{{ $t("dexInterface.youReceive") }}</h4>
                    <p class="token-balance" v-if="GET_RECEIVE_TOKEN">
                        {{ $t("dexInterface.balance", {currentBalance: getTokenBalance}) }}</p>
                    <div class="skeleton skeleton_row" v-if="!GET_RECEIVE_TOKEN"></div>
                </div>
                <label for="" class="dex__label">
                    <p class="skeleton skeleton_balance" v-if="showSkeleton && GET_SWAP_MODE === 'default'"></p>
                    <DexInput id="receiveInput" v-else
                              :model-value="youReceive"
                              @update:model-value="updateValue"
                              @changeFocus="changeFocus"
                    />
                    <button class="dex__btn"
                            v-if="!showTokenSkeleton"
                            @click="$emit('chooseReceiveToken')"
                    >
                        <img :src="GET_RECEIVE_TOKEN?.image" alt="Logo of the selected token for receive"
                             class="token-image">
                        <p class="btn-text">{{ GET_RECEIVE_TOKEN?.symbol }}</p>
                    </button>
                    <div class="skeleton skeleton_token" v-if="showTokenSkeleton"></div>
                </label>
                <div class="dex__group group-padding">
                    <div class="dex__price-block"
                         v-if="!showSkeleton"
                    >
                        <p class="token-price">~${{ getTokenPrice }}</p>
                        <p class="token-impact"
                           v-show="this.GET_DEAL_CONDITIONS?.output_usd > 0"
                           :class="getClassImpact"
                        >
                            ({{ getPriceImpactDisplay }}%)
                        </p>
                    </div>
                    <div class="skeleton skeleton_row" v-if="showSkeleton"></div>
                    <p
                        class="trust-score"
                        v-if="GET_RECEIVE_TOKEN"
                        @mouseenter="cancelCloseTooltip"
                        @mouseleave="leaveTrustScore"
                    >
                        <span class="token-name">{{ $t("dexInterface.trustScore") }}:</span>
                        {{ GET_RECEIVE_TOKEN?.trust_score || 'No data' }}
                    </p>
                    <div class="skeleton skeleton_row" v-if="!GET_RECEIVE_TOKEN"></div>
                </div>
                <transition name="tooltip">
                    <tooltip-wrapper
                        arrowPosition="top"
                        v-show="showTooltip"
                        class="btn-tooltip"
                        @mouseenter="cancelCloseTooltip"
                        @hidden-tooltip="leaveTrustScore"
                        @mouseleave="leaveTrustScore">
                        <DexTrust
                            :trustScore="GET_RECEIVE_TOKEN?.trust_score || 0"
                            :symbol="GET_RECEIVE_TOKEN?.symbol"
                        >
                        </DexTrust>
                    </tooltip-wrapper>
                </transition>
            </div>
            <DexRouteInfo
                v-if="GET_DEAL_CONDITIONS !== null && GET_SEND_AMOUNT > 0 && GET_SEND_AMOUNT !== ''"
            />
        </div>
    </div>
</template>

<script>
import {mapActions, mapGetters} from "vuex";
import DexInput from "@/components/dex/DexInput.vue";
import methodsMixins from "@/mixins/methodsMixins.js";
import {defineAsyncComponent} from "vue";
import TooltipWrapper from '@/components/ui/TooltipWrapper.vue';
import DexTrust from '@/components/dex/DexTrust.vue';


export default {
    name: "DexYouReceive",
    mixins: [methodsMixins],
    components: {
        DexTrust,
        DexInput,
        TooltipWrapper,
        DexRouteInfo: defineAsyncComponent(() => {
            return import("@/components/dex/DexRouteInfo.vue")
        }),
    },
    props: {
        poolNotFound: {
            type: Boolean,
            default() {
                return false
            }
        }
    },
    data() {
        return {
            youReceive: '0',
            inputFocused: false,
            pageLoaded: false,
            showTooltip: false,
            closeTooltipTimeout: null,
        }
    },
    computed: {
        ...mapGetters([
            'GET_RECEIVE_TOKEN',
            'GET_DEAL_CONDITIONS',
            'GET_SEND_AMOUNT',
            'GET_SWAP_MODE',
            'GET_RECEIVE_AMOUNT'
        ]),
        getRouteQuery() {
            if (this.$route.query?.st) {
                return true
            }
        },
        showTokenSkeleton() {
            if (this.getRouteQuery && this.GET_RECEIVE_TOKEN === null) {
                return true
            }
        },
        showSkeleton() {
            return this.GET_SEND_AMOUNT > 0 && this.GET_SEND_AMOUNT !== '' && this.GET_DEAL_CONDITIONS === null && !this.poolNotFound
        },
        getClassImpact() {
            if (this.getUsdPriceImpact <= -5) {
                return 'red-impact'
            } else if (this.getUsdPriceImpact <= -1) {
                return 'yellow-impact'
            } else {
                return 'green-impact'
            }
        },
        getTokenPrice() {
            if (this.GET_DEAL_CONDITIONS !== null) {
                return this.prettyNumber(this.GET_DEAL_CONDITIONS?.output_usd, 2)
            } else {
                return 0
            }
        },
        getTokenBalance() {
            if (this.GET_RECEIVE_TOKEN?.balance) {
                return this.prettyNumber(this.GET_RECEIVE_TOKEN?.balance, 2)
            } else {
                return 0
            }
        },
        getPriceImpactDisplay() {
            let priceImpact = this.getUsdPriceImpact
            if (priceImpact > 0) {
                return `+${priceImpact}`
            } else {
                return priceImpact
            }
        },
        getUsdPriceImpact() {
            if (this.GET_DEAL_CONDITIONS !== null) {
                let inUsd = this.GET_DEAL_CONDITIONS?.input_usd
                let outUsd = this.GET_DEAL_CONDITIONS?.output_usd
                let priceImpact = (outUsd - inUsd) / inUsd * 100
                return priceImpact.toFixed(2)
            } else {
                return 0
            }
        }
    },
    methods: {
        ...mapActions([
            'DEX_RECEIVE_AMOUNT',
            'DEX_SEND_AMOUNT',
            'CHANGE_SWAP_MODE'
        ]),
        changeFocus(value) {
            this.inputFocused = value
        },
        focusInput() {
            let input = document.getElementById('receiveInput')
            input.focus()
        },
        updateValue(value) {
            this.youReceive = value
            this.DEX_RECEIVE_AMOUNT(Number(value))
        },
        leaveTrustScore() {
            this.closeTooltipTimeout = setTimeout(() => {
                this.showTooltip = false;
            }, 200);
        },
        cancelCloseTooltip() {
            if (this.closeTooltipTimeout) {
                clearTimeout(this.closeTooltipTimeout);
                this.closeTooltipTimeout = null;
            }
            this.showTooltip = true;
        }
    },
    watch: {
        GET_RECEIVE_AMOUNT: {
            handler() {
                if (Number(this.youReceive) !== this.GET_RECEIVE_AMOUNT && this.pageLoaded === false) {
                    this.pageLoaded = true
                    this.youReceive = String(this.GET_RECEIVE_AMOUNT)
                }
            }
        },
        GET_DEAL_CONDITIONS: {
            handler() {
                if (this.GET_SWAP_MODE !== 'reverse') {
                    if (this.GET_DEAL_CONDITIONS !== null) {
                        this.GET_DEAL_CONDITIONS?.output_amount > 0 ? this.youReceive = this.GET_DEAL_CONDITIONS.output_amount.toFixed(4) : this.youReceive = '0'
                    } else {
                        this.youReceive = '0'
                    }
                }
            }
        },
    }
}
</script>

<style scoped>
.dex__you-receive {
    margin-bottom: 6px;
    position: relative;
}

.trust-score {
    font-size: 13px;
    opacity: 1;
}

.trust-score::after {
    position: relative;
    top: 2px;
    content: '';
    display: inline-block;
    width: 14px;
    height: 14px;
    margin-left: 6px;
    background: url('@/assets/dex/dyor-shield.svg') no-repeat;
    background-size: contain;
}

.btn-tooltip {
    position: absolute;
    right: 5px;
}

.dex__content {
    transition: .15s;
    border-radius: 0 0 12px 12px;
    background: var(--iface-white2);
}

.theme-light .dex__content {
    color: #141414;
}

.dex__content-wrapper {
    padding-top: 12px;
    border-radius: 0 0 12px 12px;
    cursor: pointer;
}

.dex__content-wrapper:hover {
    background: var(--iface-white10);
}

.dex__content-wrapper:active,
.active .dex__content-wrapper {
    background: var(--iface-white14);
}

/*.dex__content:hover {
	background: var(--iface-white12);
}

.dex__content:active,
.active {
	background: var(--iface-white16);
}*/

.dex__content_empty {
    transition: .15s;
    height: 112px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 12px;
    border-radius: 0 0 12px 12px;
    cursor: pointer;
    background: var(--iface-white2);
}


.dex__content_empty:hover {
    background: var(--iface-white12);
}

.dex__content_empty:active {
    background: var(--iface-white16);
}

.dex__text_empty {
    font-size: 16px;
    font-family: Harmony-Medium, sans-serif;
    color: var(--main-text-color);
}

.dex__content_empty:hover .dex__text_empty {
    color: var(--iface-accent-color);
}

.dex__heading {
    font-size: 13px;
    font-family: Harmony-Regular, sans-serif;
    opacity: 0.5;
    letter-spacing: 0.4px;
}

.dex__label {
    padding: 0 12px;
    margin-bottom: 12px;
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.dex__btn {
    transition: 0.15s;
    display: flex;
    align-items: center;
    gap: 6px;
    height: 36px;
    padding: 6px 10px 6px 6px;
    border: 1px solid var(--iface-white20);
    border-radius: 20px;
    background: transparent;
    font-size: 16px;
}

.theme-light .dex__btn {
    border: 1px solid var(--iface-white10);
}

.dex__btn::after {
    content: '';
    display: block;
    width: 16px;
    height: 16px;
    background: url('@/assets/dex/arrow-down.svg') no-repeat;
}

.theme-light .dex__btn::after {
    mix-blend-mode: difference;
    filter: invert(0.1);
}

.dex__btn:hover {
    background: var(--iface-white20);
    border: 1px solid var(--iface-white24);
}

.btn-text {
    font-family: Harmony-Medium, sans-serif;
}

.token-image {
    border-radius: 100px;
    width: 24px;
    height: 24px;
}

.dex__group {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 12px;
}

.group-margin {
    margin-bottom: 12px;
}

.group-padding {
    padding-bottom: 12px;
}

.dex__price-block {
    display: flex;
    align-items: center;
}

.token-price {
    font-size: 13px;
    line-height: 16px;
    opacity: 0.5;
}

.token-impact {
    margin-left: 4px;
    font-size: 13px;
    line-height: 16px;
    opacity: 1;
}

.token-name {
    font-size: 13px;
    line-height: 16px;
    opacity: 0.6;
    margin-right: 3px;
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

.token-balance {
    font-size: 13px;
    line-height: 16px;
    opacity: 0.5;
}

.skeleton_balance {
    width: 150px;
    height: 32px;
}

/*.skeleton_row {
	width: 100px;
	height: 16px;
	border-radius: 6px;
}*/

.skeleton_row {
    width: 75px;
    height: 15px;
}

.skeleton_token {
    min-width: 100px;
    height: 36px;
    border-radius: 100px;
    overflow: hidden;
}

/*.dex__text_empty::after {
	content: '';
	display: inline-block;
	width: 16px;
	height: 16px;
	margin-left: 6px;
	position: relative;
	top: 2px;
	background: url("@/assets/dex/arrow-down.svg") no-repeat;
	filter: invert(39%) sepia(98%) saturate(2450%) hue-rotate(-18deg) brightness(103%) contrast(104%);
}*/

/*.dex__content_empty:hover .dex__text_empty::after {
	filter: none;
}*/

@media screen and (max-width: 640px) {
    .dex__you-receive {
        margin-bottom: 0;
    }

    .btn-tooltip {
        position: absolute;
        right: auto;
    }

}
</style>
