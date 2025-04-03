<template>
    <div class="stake__buttons">
        <div class="buttons-group">
            <button class="select__btn btn"
                    :class="{ active: modelValue === 'new' }"
                    @click="updateSelectedTab('new')"
            >
                <span class="btn__text">{{ $t("stakeMenu.new") }}</span>
            </button>
            <template v-if="isStakesLoaded">
                <button class="select__btn btn"
                        :class="{ active: modelValue === 'my', disabled: !GET_STAKE_USER_STAKES || GET_STAKE_USER_STAKES.length === 0 }"
                        :disabled="!GET_STAKE_USER_STAKES || GET_STAKE_USER_STAKES.length === 0"
                        @click="updateSelectedTab('my')"
                >
                    <span class="btn__text">{{ $t("stakeMenu.stakes") }}
                        <span v-if="GET_STAKE_USER_STAKES && GET_STAKE_USER_STAKES.length > 0"> ({{ GET_STAKE_USER_STAKES.length }}) </span>
                    </span>
                </button>
            </template>
            <div v-if="(GET_DEX_WALLET && GET_STAKE_USER_STAKES === null) && (!GET_STAKE_GLOBAL_INFO || !isStakesLoaded)"
                 class="skeleton-button">
            </div>
        </div>
        <div v-if="modelValue === 'my' && isStakesLoaded" class="stakes-amount-info">
            <p class="stakes-amount">{{ prettyNumber(calculateEarnedAmount.totalLockedAmountRaw, 2) }} {{ getTokenSymbol }}</p>
            <p class="stakes-amount-usd">${{ prettyNumber(calculateEarnedAmount.totalLockedUsd, 2) }}</p>
        </div>
    </div>
</template>

<script>
import { mapGetters } from "vuex";

export default {
    name: "StakeFormTabs",
    props: {
        modelValue: {
            type: String,
            default: 'new'
        }
    },
    emits: ['update:modelValue'],
    computed: {
        ...mapGetters([
            'GET_DEX_WALLET',
            'GET_STAKE_USER_STAKES',
            'GET_STAKE_GLOBAL_INFO',
            'GET_STAKE_TOKEN',
            'GET_STAKE_MERGED_TOKENS'
        ]),

        isStakesLoaded() {
            return Array.isArray(this.GET_STAKE_USER_STAKES) && this.GET_STAKE_USER_STAKES.length > 0;
        },

        getTokenSymbol() {
            if (!this.GET_STAKE_USER_STAKES?.length) {
                return this.GET_STAKE_TOKEN?.symbol || 'TON';
            }

            const uniqueSymbols = new Set(
                this.GET_STAKE_USER_STAKES
                    .map(stake => this.findTokenInMergedTokens(stake.locked_asset_address)?.token?.metadata?.symbol)
                    .filter(Boolean)
            );

            return uniqueSymbols.size === 0 ? 'TON' :
                uniqueSymbols.size === 1 ? Array.from(uniqueSymbols)[0] : 'Mixed';
        },

        calculateEarnedAmount() {
            if (!this.GET_STAKE_USER_STAKES) return { totalLockedAmountRaw: 0, totalLockedUsd: 0 };

            const totals = this.GET_STAKE_USER_STAKES.reduce((acc, stake) => ({
                totalLockedAmountRaw: acc.totalLockedAmountRaw + Number(stake.locked_asset_amount_raw || 0),
                totalLockedUsd: acc.totalLockedUsd + Number(stake.locked_usd || 0)
            }), { totalLockedAmountRaw: 0, totalLockedUsd: 0 });

            return {
                totalLockedAmountRaw: totals.totalLockedAmountRaw / Math.pow(10, this.decimals || 9),
                totalLockedUsd: totals.totalLockedUsd
            };
        },

        decimals() {
            return this.GET_STAKE_TOKEN?.decimals ?? 9;
        },
    },
    methods: {
        updateSelectedTab(value) {
            this.$emit('update:modelValue', value);
        },

        findTokenInMergedTokens(tokenAddress) {
            return this.GET_STAKE_MERGED_TOKENS?.find(token =>
                token.token.address === tokenAddress ||
                token.token.address?.address === tokenAddress
            );
        },

        prettyNumber(value, decimals = 2) {
            if (!value || isNaN(Number(value))) return '0';
            return Number(value).toLocaleString('en-US', {
                minimumFractionDigits: decimals,
                maximumFractionDigits: decimals
            });
        },
    }
};
</script>

<style scoped>
.stake__buttons {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
}

.buttons-group {
    display: flex;
    gap: 8px;
}

.skeleton-button {
    width: 100px;
    height: 36px;
    border-radius: 12px;
    background-color: var(--iface-white8);
    animation: pulse 1.2s infinite ease-in-out;
}

.stakes-amount-info {
    text-align: right;
}

.stakes-amount {
    font-weight: 500;
    font-size: 15px;
    line-height: 18px;
    color: var(--main-text-color);
}

.stakes-amount-usd {
    font-weight: 400;
    font-size: 13px;
    line-height: 16px;
    color: var(--main-text-color);
    opacity: 0.6;
}

.select__btn {
    font-weight: 400;
    background: var(--iface-white4);
    position: relative;
    border-radius: 12px;
    white-space: nowrap;
    padding: 0 10px;
    height: 36px;
    transition: 0.2s background-color;
    border: 1px solid transparent;
    box-sizing: border-box;
    outline: none;
}

.select__btn:hover {
    background: var(--iface-white6);
}

.select__btn::after {
    content: "";
    position: absolute;
    left: 50%;
    bottom: 0;
    transform: translateX(-50%);
    width: 70%;
    height: 3px;
    background-color: transparent;
    border-radius: 2px 2px 0 0;
    transition: .2s;
}

.select__btn.active::after {
    background-color: var(--iface-accent-color);
}

.select__btn.active:hover {
    background-color: var(--iface-white6);
}

.btn__text {
    transition: 0.2s opacity;
    opacity: 0.4;
    font-size: 13px;
    font-weight: 500;
    line-height: 16px;
}

.active {
    background: var(--iface-white8);
}

.active .btn__text {
    opacity: 1;
    font-size: 13px;
    line-height: 16px;
}

@keyframes pulse {
    0% {
        background-image: linear-gradient(
            to top right,
            var(--iface-white6) 0%,
            var(--iface-white10) 15%,
            var(--iface-white6),
            var(--iface-white10) 45%,
            var(--iface-white6),
            var(--iface-white10) 75%,
            var(--iface-white6) 100%
        );
    }
    50% {
        background-image: linear-gradient(
            to top right,
            var(--iface-white6) 0%,
            var(--iface-white10) 15%,
            var(--iface-white6),
            var(--iface-white10) 45%,
            var(--iface-white6),
            var(--iface-white10) 75%,
            var(--iface-white6) 100%
        );
    }
    100% {
        background-image: linear-gradient(
            to top right,
            var(--iface-white6) 0%,
            var(--iface-white10) 15%,
            var(--iface-white6),
            var(--iface-white10) 45%,
            var(--iface-white6),
            var(--iface-white10) 75%,
            var(--iface-white6) 100%
        );
    }
}

@media screen and (max-width: 576px) {
    .stake__buttons {
        padding: 14px;
        border-radius: 20px;
        background: var(--earn-bg);
    }
}
</style>
