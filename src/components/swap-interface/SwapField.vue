v<template>
    <div class="field">
        <div
             @click.stop="focusInput"
             :class="[position, 'field__content']"
        >
            <div
                :class="[{active: inputFocused}, 'field__content-wrapper']"
            >
                <div class="field__group">
                    <p class="field__text">{{title}}</p>
                    <div class="field__flex-group"
                         v-if="showBalanceCondition"
                    >
                        <p class="field__balance">
                            <BalanceIcon />
                            {{ getTokenBalance }}
                        </p>
                        <div class="field__flex-group"
                             v-if="position === 'up' && dexStore.GET_DEX_WALLET"
                        >
                            <button class="field__btn"
                                    v-if="token.balance > 0"
                                    @click.stop="setHalfBalance"
                            >
                                {{ $t('dexInterface.half') }}
                            </button>
                            <button class="field__btn"
                                    v-if="token.balance > 0"
                                    @click.stop="setMaxBalance"
                            >
                                {{ $t('dexInterface.max') }}
                            </button>
                        </div>
                    </div>
                    <skeleton-item
                        v-else
                        class="skeleton__balance"
                    />
                </div>
                <label for="" class="field__label">
                    <skeleton-item
                        class="skeleton__input"
                        :border-radius="100"
                        v-if="showValuesSkeleton"
                    />
                    <p class="field__input-plug"
                       v-else-if="isDisableInput"
                    >
                        ∗∗∗
                    </p>
                    <DexInput
                        v-else
                        :id="`${position}_input`"
                        :model-value="position === 'up' ? this.tokenValues.first : this.tokenValues.second"
                        @update:model-value="updateValue"
                        @changeFocus="changeFocus"
                    />
                    <skeleton-item
                        class="skeleton__token"
                        :border-radius="100"
                        v-if="showLoadingSkeleton"
                    />
                    <button
                        v-else
                        class="field__button"
                        :disabled="!canTokenChange"
                        :class="{padding_large: !canTokenChange}"
                        @click.stop="updateTokenModalVisible(position === 'up' ? 'SEND' : 'RECEIVE')"
                    >
                        <img :src="token?.image" alt="" class="field__token-img">
                        {{ token?.symbol }}
                        <ChevronRightIcon
                            v-if="canTokenChange"
                            class="field__btn-icon"
                        />
                    </button>
                </label>
                <div class="field__group">
                    <skeleton-item
                        class="skeleton__balance"
                        v-if="showValuesSkeleton || showLoadingSkeleton"
                    />
                    <p class="field__balance-plug"
                       v-else-if="isDisableInput"
                    >
                        ∗∗∗
                    </p>
                    <p class="field__text"
                       v-else
                    >
                        ~${{ getApproximateTokenPrice }}
                    </p>
                    <span class="token-impact"
                          v-if="position !== 'up'"
                          v-show="!isNaN(getPriceImpactDisplay)"
                          :class="getClassImpact"
                    >
                            ({{ getPriceImpactDisplay }}%)
                        </span>
                    <skeleton-item
                        class="skeleton__balance"
                        v-if="showLoadingSkeleton"
                    />
                    <p class="field__text"
                       v-else-if="position === 'up' || position === 'middle'"
                    >
                        {{ token?.name }}
                    </p>
                    <p class="field__trust trust"
                       v-else
                       @mouseenter="showTooltip"
                       @mouseleave="closeTooltip"
                    >
                        <span class="trust__name">{{ $t("dexInterface.trustShort") }}:</span>
                        {{ token?.trust_score }}
                    </p>
                </div>
                <transition name="tooltip">
                    <DexTrust
                        arrowPosition="top"
                        v-if="isTooltipVisible && position !== 'up'"
                        class="btn-tooltip"
                        :trustScore="token?.trust_score || 0"
                        :symbol="token?.symbol"
                        @mouseenter="showTooltip"
                        @hidden-tooltip="closeTooltip"
                        @mouseleave="closeTooltip">
                        >
                    </DexTrust>
                </transition>
            </div>
            <DexRouteInfo
                v-if="routeInfo !== null && tokenValues.first > 0 && tokenValues.first !== '' && position === 'down'"
                ref="routeInfo"
            />
        </div>
    </div>
</template>

<script lang="ts">
import methodsMixins from "@/mixins/methodsMixins.ts";
import computedMixins from "@/mixins/computedMixins.ts";
import WalletIcon from "@/assets/earn/swap-interface/WalletIcon.vue";
import DexInput from "@/components/dex/DexInput.vue";

import TooltipWrapper from "@/components/ui/TooltipWrapper.vue";
import ChevronRightIcon from "@/assets/earn/pool-page/ChevronRightIcon.vue";
import BalanceIcon from "@/assets/earn/swap-interface/BalanceIcon.vue";
import DexRouteInfo from "@/components/dex/DexRouteInfo.vue";
import DexTrust from "@/components/dex/DexTrust.vue";
import SkeletonItem from "@/components/ui/SkeletonItem.vue";

import {useLimitStore} from "@/stores/limit";
import {SwapActiveTab} from "@/utils/types.ts";
import {useDexStore} from "@/stores/dex";

export default {
    name: "SwapField",
    components: {
        DexRouteInfo,
	    BalanceIcon,
        ChevronRightIcon,
        TooltipWrapper,
        DexTrust,
        DexInput,
        WalletIcon,
        SkeletonItem
    },
    inject: [
        'updateFirstValue',
        'updateSecondValue',
        'updateTokenModalVisible',
        'tokenValues'
    ],
    mixins: [computedMixins, methodsMixins],
    props: {
        title: {
            type: String,
            default() {
                return ""
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
        token: {
            type: [Object, null],
            default() {
                return {}
            },
            required: true
        },
        routeInfo: {
            type: [Object, null],
            default() {
                return {}
            },
            required: true
        },
    },
    data() {
        return {
            inputFocused: false,
	        isTooltipVisible: false,
	        closeTooltipTimeout: null,
        }
    },
    computed: {
        dexStore() {
          return useDexStore()
        },
        limitStore() {
          return useLimitStore()
        },
        isDisableInput() {
		      return this.position !== 'up' && this.dexStore.GET_SWAP_ACTIVE_TAB === SwapActiveTab.DCA
        },
        showBalanceCondition() {
            if (this.dexStore.GET_DEX_WALLET !== null) {
                return this.token !== null && this.token.hasOwnProperty('balance');
            } else {
                return this.token !== null;
            }
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
        getUsdPriceImpact() {
            if (this.dexStore.GET_DEAL_CONDITIONS !== null) {
                let inputUsd = this.dexStore.GET_SEND_TOKEN?.price_usd * Number(this.tokenValues?.first);
                let outputUsd = this.dexStore.GET_RECEIVE_TOKEN?.price_usd * Number(this.tokenValues?.second);
                let priceImpact = (inputUsd - outputUsd) / inputUsd * 100

                this.dexStore.DEX_CALCULATED_PI(-Number(priceImpact.toFixed(2)))
                return -Number(priceImpact.toFixed(2))
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
        showLoadingSkeleton() {
            return !this.token?.name
        },
        showValuesSkeleton() {
            return (
                    this.dexStore.GET_SWAP_ACTIVE_TAB === SwapActiveTab.Dex && this.dexStore.GET_SWAP_MODE === 'default' && this.tokenValues.first !== ''
                && Number(this.tokenValues.first) > 0 && this.dexStore.GET_DEAL_CONDITIONS === null && this.position === 'down'
            )
            || (
                    this.dexStore.GET_SWAP_ACTIVE_TAB === SwapActiveTab.Dex && this.dexStore.GET_SWAP_MODE === 'reverse' && this.tokenValues.second !== ''
                && Number(this.tokenValues.first) > 0 && this.dexStore.GET_DEAL_CONDITIONS === null && this.position === 'up'
            )
        },
        canTokenChange() {
            return this.dexStore.GET_SWAP_ACTIVE_TAB === SwapActiveTab.Dex || this.dexStore.GET_SWAP_ACTIVE_TAB === SwapActiveTab.Limit || this.dexStore.GET_SWAP_ACTIVE_TAB === SwapActiveTab.DCA
        },
        getTokenBalance() {
            if (this.token?.balance) {
                return this.prettyNumber(this.token?.balance, 2);
            } else {
                return 0;
            }
        },
        getTokenPrice() {
            if (this.routeInfo !== null) {
                if (this.position === 'up') {
                    return this.prettyNumber(this.routeInfo?.input_usd, 2)
                } else {
                    return this.prettyNumber(this.routeInfo?.output_usd, 2)
                }
            } else {
                return 0
            }
        },
        getApproximateTokenPrice() {
			if (this.position === 'up') {
				return this.prettyNumber(this.token?.price_usd * this.tokenValues.first, 2)
            } else {
				return this.prettyNumber(this.token?.price_usd * this.tokenValues.second, 2)
            }
        }
    },
    methods: {
        changeFocus(value) {
            this.inputFocused = value
        },
        focusInput(event) {
            let routeInfo = this.$refs.routeInfo;

            if (routeInfo && routeInfo.$el.contains(event.target)) {
                let input = document.getElementById(`${this.position}_input`);
                if (input) input.blur();
                event.preventDefault();
                return;
            }

            if (!(this.dexStore.GET_SWAP_ACTIVE_TAB === SwapActiveTab.DCA && this.position === 'middle')) {
                let input = document.getElementById(`${this.position}_input`);
                if (input) input.focus();
            }
        },
        updateValue(value) {
            if (this.position === 'up') {
                this.updateFirstValue(value)
            } else {
                this.updateSecondValue(value)
            }
        },
	    closeTooltip() {
		    this.closeTooltipTimeout = setTimeout(() => {
			    this.isTooltipVisible = false;
		    }, 200);
	    },
	    showTooltip() {
		    if (this.closeTooltipTimeout) {
			    clearTimeout(this.closeTooltipTimeout);
			    this.closeTooltipTimeout = null;
		    }
		    this.isTooltipVisible = true;
	    },
        setHalfBalance() {
            if (this.token.balance > 0) {
                let balance = this.getAvailableBalance(this.token?.balance / 2)
                this.updateFirstValue(balance.toString())
            }
        },
        setMaxBalance() {
            if (this.token.balance > 0) {
                let balance = this.getAvailableBalance(this.token?.balance)
                this.updateFirstValue(balance.toString())
            }
        },
        getAvailableBalance(value) {
            let balance = value

            if (this.dexStore.GET_SWAP_ACTIVE_TAB === SwapActiveTab.Dex) {
                const currentDeal = this.dexStore.GET_DEAL_CONDITIONS
                    ? JSON.parse(JSON.stringify(this.dexStore.GET_DEAL_CONDITIONS))
                    : null;

                const partnerFee = currentDeal?.partner_commission_ton || 0;
                const recommendedGas = currentDeal?.recommended_gas || 0;

                const fee = currentDeal ? parseFloat((recommendedGas + 0.00001001).toFixed(8)) : 0;
                const totalFee = parseFloat((fee + partnerFee).toFixed(8));

                if (this.token?.address === 'native' && this.token?.balance > 0) {
                    if (balance + totalFee > this.token?.balance) {
                        balance = parseFloat((balance - totalFee).toFixed(8));
                    }
                    if (balance < 0) balance = 0
                }
            }

            return balance
        }
    },
}
</script>

<style scoped>
    .field__content {
        background: var(--iface-white3);
    }

    .up {
        border-radius: 12px 12px 0 0;
    }

    .up .field__content-wrapper {
        border-radius: 12px 12px 0 0;
        background: var(--iface-white3);
    }

    .down {
        border-radius: 0 0 12px 12px;
    }

    .down .field__content-wrapper {
        border-radius: 0 0 12px 12px;
    }

    .field__content-wrapper {
        display: flex;
        flex-direction: column;
        gap: 14px;
        padding: 14px;
        transition: .2s;
        position: relative;
    }

    .field__content-wrapper:hover {
        background: var(--iface-white10);
    }

    .field__content-wrapper:active,
    .active {
        background: var(--iface-white12);
    }

    .active:hover {
        background: var(--iface-white12);
    }

    .field__group {
        display: flex;
        align-items: center;
        justify-content: space-between;
    }

    .field__flex-group {
        display: flex;
        align-items: center;
        gap: 6px;
    }

    .field__text {
        opacity: 0.6;
        font-size: 13px;
        line-height: normal;
    }

    .field__balance {
        display: flex;
        align-items: center;
        gap: 6px;
        opacity: 0.6;
        font-size: 13px;
        line-height: normal;
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

    .theme-dark .green-impact {
        color: #5DFF54;
    }

    .theme-coffee .green-impact {
        color: #5DFF54;
    }

    .token-impact {
        margin-right: auto;
        margin-left: 4px;
        line-height: 16px;
        font-size: 13px;
        font-weight: 400;
        font-family: Harmony-Regular, sans-serif;
        opacity: 1;
    }

    .field__btn {
        border: none;
        outline: none;
        background: transparent;
        font-family: Harmony-Regular, sans-serif;
        color: var(--iface-accent-color);
        transition: .2s;
    }

    .field__btn:hover,
    .field__btn:active {
        color: var(--iface-accent-hover);
    }

    .field__label {
        display: flex;
        align-items: center;
        justify-content: space-between;
    }

    .field__input-plug {
        font-size: 28px;
        line-height: 36px;
        font-family: Harmony-Medium, sans-serif;
        opacity: 0.1;
        cursor: not-allowed;
    }

    .field__button {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 6px;
        border-radius: 100px;
        border: none;
        white-space: nowrap;
        text-overflow: ellipsis;
        background: var(--iface-white10);
        font-size: 16px;
        font-weight: 500;
        line-height: normal;
        transition: .2s;
    }

    .field__button:hover {
        background: var(--iface-white16);
    }

    .field__token-img {
        width: 24px;
        height: 24px;
        border-radius: 100px;
    }

    .field__btn-icon {
        width: 20px;
        height: 20px;
    }

    .field__balance-plug {
        font-size: 13px;
        opacity: 0.1;
    }

    .trust {
        font-size: 13px;
        line-height: normal;
        max-height: 16px;
        position: relative;
    }

    .trust::after {
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

    .trust .trust__name{
        opacity: 0.6;
    }

    .btn-tooltip {
        top: 120px;
        position: absolute;
        right: 5px;
    }

    .skeleton__token {
        height: 36px;
        width: 120px;
    }

    .skeleton__input {
        height: 36px;
        width: 140px;
    }

    .skeleton__balance {
        height: 16px;
        width: 70px;
    }

    @media screen and (max-width: 576px) {
        .btn-tooltip {
            position: absolute;
            right: -12px;
        }

    }
</style>
