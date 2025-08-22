<template>
    <div class="info">
        <div class="info__group">
            <SwapInfoIcon :mode="mode" />
            <h4 :class="[mode, 'info__title']">{{ title }}</h4>
        </div>
        <p class="info__text">{{ text }}</p>
    </div>
</template>

<script lang="ts">
import SwapInfoIcon from "@/assets/swap-interface/SwapInfoIcon.vue";

export default {
    name: "SwapInfo",
    components: {
        SwapInfoIcon
    },
    props: {
        title: {
            type: String,
            default() {
                return ''
            }
        },
        text: {
            type: String,
            default() {
                return ''
            }
        },
        mode: {
            type: String,
            required: true,
            validator(value: string) {
                return ['swap', 'limit'].includes(value);
            }
        }
    },
    data() {
        return {}
    }
}
</script>

<style scoped>
    .info{
        border: 1px solid var(--iface-white6);
        border-radius: 12px;
        padding: 12px;
    }

    .info__group {
        display: flex;
        align-items: center;
        gap: 6px;
        justify-content: center;
        margin-bottom: 8px;
    }

    .info__title {
        font-size: 14px;
        text-align: center;
        font-weight: 500;
        font-family: Harmony-Medium, sans-serif;
    }

    .swap {
        color: var(--main-red);
    }

    .reverse {
        color: var(--main-yellow);
    }

    .info__text {
        font-size: 13px;
        line-height: normal;
        text-align: center;
        opacity: 0.6;
    }
</style>
