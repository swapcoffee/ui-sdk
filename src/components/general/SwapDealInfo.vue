<template>
    <div class="transaction__swap swap">
        <template v-if="(modalState as any)?.mode === 'multi'">
            <div class="multi-input-tokens">
                <img
                    v-for="(token, index) in getMultiInputTokens"
                    :key="`input-${index}`"
                    :src="(token as any).image"
                    :class="['swap__icon', 'multi-token', { 'overlapped': index > 0 }]"
                    :style="{ 'z-index': 10 - index }"
                    :alt="(token as any).symbol"
                >
                <p class="swap__token-name multi-tokens-text">
                    {{ getMultiInputTokensText }}
                </p>
            </div>
        </template>
        <template v-else>
            <img :src="firstImage" alt="" class="swap__icon">
            <p class="swap__token-name">{{ displayFirst }}</p>
        </template>

        <RouteRightIcon class="arrow-icon" />

        <img :src="secondImage" alt="" class="swap__icon">
        <p class="swap__token-name">{{ displaySecond }}</p>
    </div>
</template>

<script lang="ts">
import methodsMixins from "@/mixins/methodsMixins.ts";

import RouteRightIcon from "@/assets/general/RouteRightIcon.vue";

import {useDexStore} from "@/stores/dex";

export default {
    name: "SwapDealInfo",
    mixins: [methodsMixins],
    components: {RouteRightIcon},
    inject: ["modalState"],
    data() {
        return {}
    },
    computed: {
        dexStore() {
          return useDexStore()
        },
        firstImage() {
            if (this.modalState?.mode === 'multi') {
                const sendTokens = this.dexStore.GET_SEND_MULTI_TOKENS;
                if (sendTokens && sendTokens.size > 0) {
                    const firstToken = Array.from(sendTokens.values())[0] as any;
                    return firstToken?.image;
                }
                const receiveToken = this.dexStore.GET_RECEIVE_MULTI_TOKEN as any;
                return receiveToken?.image;
            } else {
                return (this.dexStore.GET_SEND_TOKEN as any)?.image;
            }
        },
        firstSymbol() {
            if (this.modalState?.mode === 'multi') {
                const sendTokens = this.dexStore.GET_SEND_MULTI_TOKENS;
                if (sendTokens && sendTokens.size > 0) {
                    const firstToken = Array.from(sendTokens.values())[0] as any;
                    return firstToken?.symbol;
                }
                const receiveToken = this.dexStore.GET_RECEIVE_MULTI_TOKEN as any;
                return receiveToken?.symbol;
            } else {
                return (this.dexStore.GET_SEND_TOKEN as any)?.symbol;
            }
        },
        secondImage() {
            if (this.modalState?.mode === 'multi') {
                const receiveToken = this.dexStore.GET_RECEIVE_MULTI_TOKEN as any;
                return receiveToken?.image;
            } else {
                return (this.dexStore.GET_RECEIVE_TOKEN as any)?.image;
            }
        },
        secondSymbol() {
            if (this.modalState?.mode === 'multi') {
                const receiveToken = this.dexStore.GET_RECEIVE_MULTI_TOKEN as any;
                return receiveToken?.symbol;
            } else {
                return (this.dexStore.GET_RECEIVE_TOKEN as any)?.symbol;
            }
        },
        firstAmount() {
            if (this.modalState?.mode === 'multi') {
                const dealConditions = this.dexStore.GET_DEAL_CONDITIONS;
                return dealConditions?.total_input_amount || 0;
            } else {
                return this.dexStore.GET_DEAL_CONDITIONS?.input_amount || 0;
            }
        },
        secondAmount() {
            if (this.modalState?.mode === 'multi') {
                const dealConditions = this.dexStore.GET_DEAL_CONDITIONS;
                return dealConditions?.total_output_amount || 0;
            } else {
                return this.dexStore.GET_DEAL_CONDITIONS?.output_amount || 0;
            }
        },
        displayFirst() {
            return `${this.prettyNumber(this.firstAmount, 2)} ${this.firstSymbol}`
        },
        displaySecond() {
            return `${this.prettyNumber(this.secondAmount, 2)} ${this.secondSymbol}`
        },
        getMultiInputTokens() {
            if ((this.modalState as any)?.mode !== 'multi') return []

            const sendTokens = this.dexStore.sendMultiTokens
            if (!sendTokens || sendTokens.size === 0) return []

            return Array.from(sendTokens.values())
        },
        getMultiInputTokensText() {
            const tokens = this.getMultiInputTokens
            if (tokens.length === 0) return ''

            if (tokens.length === 1) {
                return (tokens[0] as any).symbol
            }

            if (tokens.length === 2) {
                return `${(tokens[0] as any).symbol}, ${(tokens[1] as any).symbol}`
            }

            // For 3+ tokens, show first two and count
            return `${(tokens[0] as any).symbol}, ${(tokens[1] as any).symbol} +${tokens.length - 2}`
        }
    },
}
</script>

<style scoped>
.swap {
    margin: 4px 0 14px 0;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
}

.swap__icon {
    width: 20px;
    height: 20px;
    border-radius: 100px;
}

.swap__token-name {
    font-size: 16px;
}

.arrow-icon {
    margin: 0 4px;
    width: 16px;
    height: 16px;
}

.theme-light .arrow-icon {
  filter: invert(1);
}


.multi-input-tokens {
    display: flex;
    align-items: center;
    gap: 4px;
}

.multi-token {
    position: relative;
    border: 2px solid var(--modal-bg);
    border-radius: 50%;
}

.multi-token.overlapped {
    margin-left: -8px;
}

.multi-tokens-text {
    white-space: nowrap;
}
</style>
