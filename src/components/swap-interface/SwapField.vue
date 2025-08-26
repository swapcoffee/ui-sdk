v<template>
    <div class="field">
        <div
             @click.stop="focusInput"
             :class="[position, getBackgroundClass, 'field__content']"
        >
            <div
                :class="[{active: inputFocused}, 'field__content-wrapper']"
            >
                <div class="field__group">
                    <p class="field__text">{{ title }}</p>
                    <div class="field__flex-group" v-if="showBalanceCondition">
                        <p class="field__balance">
                            <BalanceIcon />
                            {{ getTokenBalance ?? 0 }}
                        </p>
                        <div class="field__flex-group" v-if="balanceActionCondition">
                            <button
                                class="field__btn"
                                v-if="+token.balance > 0"
                                @click.stop="setHalfBalance"
                            >
                                {{ $t('dexInterface.half') }}
                            </button>
                            <button
                                class="field__btn"
                                v-if="+token.balance > 0"
                                @click.stop="setMaxBalance"
                            >
                                {{ $t('dexInterface.max') }}
                            </button>
                        </div>
                    </div>
                    <skeleton-item v-else class="skeleton__balance" />
                </div>
                <label for="" class="field__label">
                    <skeleton-item
                        class="skeleton__input"
                        :border-radius="100"
                        v-if="showValuesSkeleton"
                    />
                    <p class="field__input-value" v-else-if="readOnlyValue">
                        {{ formattedValue }}
                    </p>
                    <p class="field__input-plug" v-else-if="isDisableInput">∗∗∗</p>
                    <SwapInput
                        v-else
                        :id="`${position}_input`"
                        :model-value="getModelValue"
                        @update:model-value="updateValue"
                        @changeFocus="changeFocus"
                        :position="position"
                    />
                    <skeleton-item
                        class="skeleton__token"
                        :border-radius="100"
                        v-if="showLoadingSkeleton"
                    />
                    <SwapTokenButton
                        v-else
                        :canTokenChange="canTokenChange"
                        :token="token"
                        :assetKey="assetKey"
                        @openTokenModal="$emit('openTokenModal')"
                    />
                </label>
                <div class="field__group">
                    <skeleton-item
                        class="skeleton__balance"
                        v-if="showValuesSkeleton || showLoadingSkeleton || !showBalanceCondition"
                    />
                    <p class="field__balance-plug" v-else-if="isDisableInput">∗∗∗</p>
                    <p class="field__text" v-else>
                        ~${{ getApproximateTokenPrice }}
                    </p>
                    <span
                        class="token-impact"
                        v-if="impactCondition"
                        v-show="!isNaN(getPriceImpactDisplay) && getPriceImpactDisplay !== 0"
                        :class="getClassImpact"
                    >
                        ({{ getPriceImpactDisplay }}%)
                    </span>
                    <skeleton-item class="skeleton__balance" v-if="showLoadingSkeleton" />
                    <p
                        class="field__text"
                        v-else-if="isShowTrustOnMiddle"
                    >
                        {{ token?.name }}
                    </p>
                    <p
                        class="field__trust trust"
                        v-else
                        @mouseenter="showTooltip"
                        @mouseleave="closeTooltip"
                    >
                        <span class="trust__name">{{ $t('dexInterface.trustShort') }}:</span>
                        {{ token?.trust_score }}
                    </p>
                </div>
                <transition name="tooltip">
                    <DexTrust
                        arrowPosition="top"
                        v-if="isTooltipVisible"
                        class="btn-tooltip"
                        :trustScore="token?.trust_score || 0"
                        :symbol="token?.symbol"
                        @mouseenter="showTooltip"
                        @hidden-tooltip="closeTooltip"
                        @mouseleave="closeTooltip"
                    >
                    </DexTrust>
                </transition>
            </div>
            <DexRouteInfo v-if="routeInfoCondition" ref="routeInfo" />
        </div>
    </div>
</template>

<script>
import methodsMixins from '@/mixins/methodsMixins.ts';
import computedMixins from '@/mixins/computedMixins.ts';
import WalletIcon from '@/assets/earn/swap-interface/WalletIcon.vue';
import SwapInput from '@/components/swap-interface/SwapInput.vue';
import DexTrust from '@/components/dex/DexTrust.vue';
import TooltipWrapper from '@/components/ui/TooltipWrapper.vue';
import ChevronRightIcon from '@/assets/earn/pool-page/ChevronRightIcon.vue';
import BalanceIcon from '@/assets/earn/swap-interface/BalanceIcon.vue';
import DexRouteInfo from '@/components/dex/DexRouteInfo.vue';
import SwapTokenButton from '@/components/swap-interface/SwapTokenButton.vue';
import SkeletonItem from '@/components/ui/SkeletonItem.vue';

import { useLimitStore } from '@/stores/limit';
import { useDcaStore } from '@/stores/dca';
import { useDexStore } from '@/stores/dex';

export default {
    name: 'SwapField',
    components: {
        SwapTokenButton,
        DexRouteInfo,
        BalanceIcon,
        ChevronRightIcon,
        TooltipWrapper,
        DexTrust,
        SwapInput,
        WalletIcon,
        SkeletonItem,
    },
    inject: {
        updateTokenModalVisible: { required: true },
        updateTokenValue: { required: true },
        tokenValues: { required: true },
        isUpdatingBalances: { required: false, default: () => () => false }
    },
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
                return null;
            },
        },
        interfaceStatus: {
            type: String,
            default() {
                return '';
            },
        },
        assetKey: {
            type: String,
            default() {
                return '';
            },
        },
        isToncoSingle: {
            type: Boolean,
            default: false,
        },
    },
    data() {
        return {
            inputFocused: false,
            isTooltipVisible: false,
            closeTooltipTimeout: null,
            currentBlockchainSrc: null,
        };
    },
    computed: {
        dexStore() {
            return useDexStore();
        },
        limitStore() {
            return useLimitStore();
        },
        dcaStore() {
            return useDcaStore();
        },
        getBackgroundClass() {
            if (this.getRouteName === 'MultiSwap') {
                if (this.position === 'up' || this.position === 'middle') {
                    return 'light-bg';
                }
            } else {
                if (this.position === 'up') {
                    return 'light-bg';
                }
            }
        },
        getModelValue() {
            return String(this.tokenValues[this.assetKey]);
        },
        formattedValue() {
            const value = String(this.getModelValue ?? '');
            const rawValue = value.replace(/[^0-9.]/g, '');

            return this.formattedInput(rawValue);
        },
        routeInfoCondition() {
            return (
                this.routeInfo !== null &&
                this.tokenValues.first > 0 &&
                this.tokenValues.first !== '' &&
                this.position === 'down'
            );
        },
        impactCondition() {
            if (this.getRouteName === 'MultiSwap') {
                return this.position === 'down';
            }
            return this.position !== 'up';
        },
        balanceActionCondition() {
            if (this.getRouteName === 'MultiSwap') {
                return this.assetKey !== 'receive' && this.dexStore.GET_DEX_WALLET;
            }

            return (
                this.position === 'up' &&
                this.dexStore.GET_DEX_WALLET
            );
        },
        isDisableInput() {
            return (
                (this.position !== 'up' && this.getRouteName === 'Dca') ||
                this.interfaceStatus === 'LOADING'
            );
        },
        isShowTrustOnMiddle() {
            if ((this.position === 'middle' || this.position === 'up') && this.getRouteName !== 'PoolPage') {
                return true;
            }
            return false;
        },
        readOnlyValue() {
            return (
                this.getRouteName === 'MultiSwap' &&
                this.position === 'down' &&
                this.assetKey === 'receive'
            );
        },
        showBalanceCondition() {
            if (this.isUpdatingBalances()) {
                return false;
            }

            if (this.dexStore.GET_DEX_WALLET !== null) {
                return this.token !== null && 'balance' in this.token && this.token.balance !== undefined;
            }

            return this.token !== null;
        },
        getClassImpact() {
            if (this.getUsdPriceImpact <= -5) {
                return 'red-impact';
            } else if (this.getUsdPriceImpact <= -1) {
                return 'yellow-impact';
            } else {
                return 'green-impact';
            }
        },
        getInputPriceUsd() {
            return {
                Dex: this.dexStore.GET_SEND_TOKEN?.price_usd,
                Limit: this.limitStore.GET_LIMIT_FIRST_TOKEN?.price_usd,
                Dca: this.limitStore.GET_LIMIT_FIRST_TOKEN?.price_usd,
            };
        },
        getOutputPriceUsd() {
            return {
                Dex: this.dexStore.GET_RECEIVE_TOKEN?.price_usd,
                Limit: this.limitStore.GET_LIMIT_SECOND_TOKEN?.price_usd,
                Dca: this.limitStore.GET_LIMIT_SECOND_TOKEN?.price_usd,
                MultiSwap: this.dexStore.GET_RECEIVE_MULTI_TOKEN?.price_usd,
            };
        },
        getUsdPriceImpact() {
            if (this.dexStore.GET_DEAL_CONDITIONS !== null) {
                let inputUsd = 0;
                let outputUsd = 0;

                if (this.getRouteName === 'MultiSwap') {
                    this.dexStore.GET_SEND_MULTI_TOKENS?.forEach((token, key) => {
                        const tokenPrice = Number(token?.price_usd) || 0;
                        const tokenAmount = Number(this.tokenValues[key]) || 0;
                        inputUsd += tokenPrice * tokenAmount;
                    });
                    const outputPrice = Number(this.getOutputPriceUsd[this.getRouteName]) || 0;
                    const outputAmount = Number(this.tokenValues?.receive) || 0;
                    outputUsd = outputPrice * outputAmount;
                } else {
                    const inputPrice = Number(this.getInputPriceUsd[this.getRouteName]) || 0;
                    const inputAmount = Number(this.tokenValues?.first) || 0;
                    inputUsd = inputPrice * inputAmount;
                    
                    const outputPrice = Number(this.getOutputPriceUsd[this.getRouteName]) || 0;
                    const outputAmount = Number(this.tokenValues?.second) || 0;
                    outputUsd = outputPrice * outputAmount;
                }
                
                if (inputUsd === 0 || outputUsd === 0 || isNaN(inputUsd) || isNaN(outputUsd)) {
                    this.dexStore.DEX_CALCULATED_PI(0);
                    return 0;
                }
                
            
                let priceImpact = ((inputUsd - outputUsd) / inputUsd) * 100;
                
                if (isNaN(priceImpact) || !isFinite(priceImpact)) {
                    this.dexStore.DEX_CALCULATED_PI(0);
                    return 0;
                }
                
                const roundedImpact = -Number(priceImpact.toFixed(2));
                this.dexStore.DEX_CALCULATED_PI(roundedImpact);
                return roundedImpact;
            }
            
            this.dexStore.DEX_CALCULATED_PI(0);
            return 0;
        },
        getPriceImpactDisplay() {
            let priceImpact = this.getUsdPriceImpact;
            
            if (isNaN(priceImpact) || !isFinite(priceImpact)) {
                return 0;
            }
            
            if (priceImpact > 0) {
                return `+${priceImpact}`;
            } else {
                return priceImpact;
            }
        },
        showLoadingSkeleton() {
            return (
                !this.token?.name ||
                this.interfaceStatus === 'LOADING' ||
                !this.token?.symbol ||
                (this.token && (!('price_usd' in this.token) || this.token.price_usd === undefined))
            );
        },
        showValuesSkeleton() {
            const isLoading = this.dexStore.GET_DEAL_CONDITIONS === null || this.interfaceStatus === 'LOADING';

            if (isLoading) {
                if (this.getRouteName === 'MultiSwap') {
                    const keysToCheck = Object.keys(this.tokenValues).filter(
                        (key) => key !== 'receive',
                    );
                    return (
                        this.assetKey === 'receive' &&
                        keysToCheck.every((key) => Number(this.tokenValues[key]) > 0)
                    );
                }

                // Для Dex показываем скелетон для соответствующего поля
                if (this.getRouteName === 'Dex') {
                    if (this.dexStore.GET_SWAP_MODE === 'default') {
                        return (
                            this.position === 'down' &&
                            this.tokenValues?.first !== '' &&
                            Number(this.tokenValues?.first) > 0
                        );
                    } else if (this.dexStore.GET_SWAP_MODE === 'reverse') {
                        return (
                            this.position === 'up' &&
                            this.tokenValues.second !== '' &&
                            Number(this.tokenValues?.second) > 0
                        );
                    }
                }

                // Для Limit и DCA показываем скелетон только во время загрузки
                if (this.getRouteName === 'Limit' || this.getRouteName === 'Dca') {
                    return false; // Не показываем скелетон постоянно для этих страниц
                }
            }

            return false;
        },
        canTokenChange() {
            const allowedRoutes = [
                'Dex',
                'Limit',
                'Dca',
                'MultiSwap',
            ];
            return allowedRoutes.includes(this.getRouteName);
        },
        getTokenBalance() {
            if (this.token?.balance) {
                return this.prettyNumber(this.token?.balance, 2);
            } else {
                return 0;
            }
        },
        getApproximateTokenPrice() {
            const tokenPrice = Number(this.token?.price_usd ?? this.token?.price ?? 0);
            const amount = Number(this.tokenValues[this.assetKey] || 0);
            
            if (isNaN(tokenPrice) || isNaN(amount)) {
                return this.prettyNumber(0, 2);
            }
            
            const product = tokenPrice * amount;
            const result = isNaN(product) || !isFinite(product) ? 0 : product;

            return this.prettyNumber(result, 2);
        },
    },
    methods: {
        changeFocus(value) {
            this.inputFocused = value;
        },
        focusInput(event) {
            let routeInfo = this.$refs.routeInfo;

            if (routeInfo && routeInfo.$el.contains(event.target)) {
                let input = document.getElementById(`${this.assetKey}_input`);
                if (input) input.blur();
                event.preventDefault();
                return;
            }

            if (!(this.getRouteName === 'Dca' && this.position === 'middle')) {
                let input = document.getElementById(`${this.assetKey}_input`);
                if (input) input.focus();
            }
        },
        updateValue(value) {
            this.updateTokenValue({ key: this.assetKey, value: value });
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
            if (this.dexStore.GET_SWAP_MODE !== 'default') {
                this.dexStore.CHANGE_SWAP_MODE('default');
            }
            
            if (this.token.balance > 0) {
                let balance = this.getAvailableBalance(this.token?.balance / 2);
                this.updateTokenValue({ key: this.assetKey, value: balance.toString() });
            }
        },
        setMaxBalance() {
            if (this.dexStore.GET_SWAP_MODE !== 'default') {
                this.dexStore.CHANGE_SWAP_MODE('default');
            }
            
            if (this.token.balance > 0) {
                let balance = this.getAvailableBalance(this.token?.balance);
                this.updateTokenValue({ key: this.assetKey, value: balance.toString() });
            }
        },
        getAvailableBalance(value) {
            let balance = value;

            if (this.getRouteName === 'Dex' || this.getRouteName === 'MultiSwap') {
                const currentDeal = this.dexStore.GET_DEAL_CONDITIONS
                    ? JSON.parse(JSON.stringify(this.dexStore.GET_DEAL_CONDITIONS))
                    : null;

                let partnerFee = 0;
                let recommendedGas = 0;
                let mevFee = 0;

                if (currentDeal) {
                    if (this.getRouteName === 'Dex') {
                        partnerFee = currentDeal.partner_commission_ton ?? 0;
                        recommendedGas = currentDeal.recommended_gas ?? 0;
                        mevFee = currentDeal?.mev_protection_fee ?? 0;
                    } else if (
                        this.getRouteName === 'MultiSwap' &&
                        Array.isArray(currentDeal.routes)
                    ) {
                        partnerFee = currentDeal.routes.reduce(
                            (sum, route) => sum + (route.partner_commission_ton ?? 0),
                            0,
                        );
                        recommendedGas = currentDeal.routes.reduce(
                            (sum, route) => sum + (route.recommended_gas ?? 0),
                            0,
                        );
                        mevFee = currentDeal?.total_mev_protection_fee ?? 0;
                    }
                }

                const fee = parseFloat((recommendedGas + 0.00001001).toFixed(8));
                const totalFee = parseFloat((fee + partnerFee + mevFee).toFixed(8));

                if (this.token?.address === 'native' && this.token?.balance > 0) {
                    if (balance + totalFee > this.token.balance) {
                        balance = parseFloat((balance - totalFee).toFixed(8));
                    }
                    if (balance < 0) balance = 0;
                }
            }

            return balance;
        },
    },
}
</script>

<style scoped>
.field {
    width: 100%;
}

.field__content {
    background: var(--iface-white3);
}

.light-bg .field__content-wrapper {
    background: var(--iface-white3);
}

.full-rounded {
    border-radius: 14px !important;
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

.solo-field {
    border-radius: 10px;
}

.solo-field .field__content-wrapper {
    background: var(--iface-white3);
    border-radius: 10px;
}

.field__content-wrapper {
    display: flex;
    flex-direction: column;
    gap: 14px;
    padding: 14px;
    transition: 0.2s;
    position: relative;
}

.field__content-wrapper:hover {
    background: var(--iface-white10);
}

.field__content-wrapper:active,
.active {
    background: var(--iface-white12) !important;
}

.active:hover {
    background: var(--iface-white12) !important;
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

.black-bg {
    background: var(--iface-white3) !important;
}

.red-impact {
    color: var(--main-red);
}

.from__text {
    opacity: 0.6;
}

.yellow-impact {
    color: var(--main-yellow);
}

.green-impact {
    color: var(--main-green);
}

.theme-dark .green-impact {
    color: #5dff54;
}

.theme-coffee .green-impact {
    color: #5dff54;
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
    transition: 0.2s;
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

.chain__image {
    width: 14px;
    height: 14px;
    display: block;
    border-radius: 50%;
}

.bridge__text {
    opacity: 1;
}

.field__input-plug {
    font-size: 28px;
    line-height: 36px;
    font-family: Harmony-Medium, sans-serif;
    opacity: 0.1;
    cursor: not-allowed;
}

.field__input-value {
    font-size: 28px;
    line-height: 36px;
    font-family: Harmony-Medium, sans-serif;
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
    transition: 0.2s;
}

.field__button:hover {
    background: var(--iface-white16);
}

.chain__info {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    cursor: pointer;
    transition: 0.2s;
}

.chain__info:hover {
    opacity: 0.9;
}

.padding_large {
    padding: 6px 12px 6px 6px;
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

.trust .trust__name {
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

.switch-icon {
    width: 20px;
    height: 20px;
    transform: rotate(90deg);
}

.skeleton__hide {
    display: none;
}

@media screen and (max-width: 576px) {
    .btn-tooltip {
        position: absolute;
        right: -12px;
    }
}
</style>
