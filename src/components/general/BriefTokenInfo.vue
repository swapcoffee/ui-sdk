<template>
    <div
        :class="[size, 'token', position]"
    >
        <div class="token__group">
            <img :src="token?.image" alt="" class="token__icon">
            <div class="token__column">
                <p class="token__symbol">{{ getTokenSymbol }}</p>
                <p class="token__name">{{ token?.name }}</p>
            </div>
        </div>
        <div class="token__column">
            <p class="token__text">
                {{ displayAmount }}
            </p>
            <p class="token__desc">
                {{ "$" + Math.random(0, 10).toFixed(2) }}
            </p>
        </div>
    </div>
</template>

<script lang="ts">
import methodsMixins from "@/mixins/methodsMixins.ts";

export default {
    name: "BriefTokenInfo",
    mixins: [methodsMixins],
    props: {
        position: {
            type: String,
            default() {
                return ''
            }
        },
        token: {
            type: Object,
            default() {
                return {}
            }
        },
        amount: {
            type: Number,
            default() {
                return 0
            }
        },
        size: {
            type: String,
            default() {
                return ''
            }
        }
    },
    inject: ['modalState'],
    data() {
        return {}
    },
    computed: {
        getTokenSymbol() {
            let additional = ''
            if (this.modalState.mode === 'limit' || this.modalState.mode === 'dca') {
                switch (this.position) {
                    case "first":
                        additional = 'Sell'
                        break;
                    case "second":
                        additional = "To Buy"
                }
            }
            return `${additional} ${this.token?.symbol}`
        },
        getSymbol() {
            if (this.modalState.mode === 'limit') {
                if (this.position === 'first') {
                    return "~"
                } else if (this.position === 'second') {
                    return '-'
                }
            }

            // Special logic for multi-swap mode
            if (this.modalState.mode === 'multi') {
                if (this.position === 'first') {
                    return '-'  // Input tokens should have minus
                } else if (this.position === 'second') {
                    return '+'  // Output token should have plus
                }
            }

            // Default logic for other modes
            if (this.position === 'first') {
                return "+"
            } else if (this.position === 'second') {
                return '-'
            }
        },
        displayAmount() {
            if (this.amount) {
                return `${this.getSymbol}${this.prettyNumber(this.amount, 2)} ${this.token?.symbol}`
            } else {
                return `${this.token?.symbol}`
            }
        }
    }
}
</script>

<style scoped>
    .token {
        display: flex;
        align-items: center;
        justify-content: space-between;
    }

    .token__group {
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .token__icon {
        width: 28px;
        height: 28px;
        border-radius: 100px;
    }

    .token__symbol {
        font-size: 14px;
        line-height: normal;
    }

    .token__name {
        margin-top: 2px;
        font-size: 13px;
        line-height: normal;
        opacity: 0.4;
    }

    .token__text {
        font-size: 14px;
        line-height: normal;
        text-align: end;
    }

    .second .token__text {
        opacity: 0.4;
    }

    /* Multi-swap specific styles */
    .multi-swap .first .token__text {
        opacity: 0.4;
    }

    .multi-swap .second .token__text {
        opacity: 1;
    }

    .token__desc {
        margin-top: 2px;
        font-size: 13px;
        line-height: normal;
        opacity: 0.4;
        text-align: end;
    }

    .small .token__icon {
        width: 20px;
        height: 20px;
    }

    .small .token__desc {
        display: none;
    }

    .small .token__name {
        display: none;
    }
</style>
