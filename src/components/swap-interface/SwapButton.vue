<template>
    <button
        :class="[colorScheme, 'swap-button']"
    >
        <slot name="icon"></slot>
        <span v-if="loading" class="btn-loader" />
        <span class="btn-text" v-else>{{ text }}</span>
    </button>
</template>

<script lang="ts">
import TooltipWrapper from "@/components/ui/TooltipWrapper.vue";

export default {
    name: "SwapButton",
    components: {TooltipWrapper},
    props: {
        text: {
            type: String,
            default() {
                return ''
            },
            required: true
        },
        loading: {
            type: Boolean,
            default() {
                return false
            }
        },
        colorScheme: {
            type: String,
            default() {
                return 'accent'
            }
        }
    },
    data() {
        return {}
    }
}
</script>

<style scoped>
    .swap-button {
        width: 100%;
        height: 48px;
        padding: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        border-radius: 12px;
        border: none;
        outline: none;
        transition: .2s;
    }

    @keyframes Shimmer {
      0% {
        background-position: -150px 0px;
      }
      25% {
        background-position: 0 0;
      }
      50% {
        background-position: -150px 0px;
      }
      75% {
        background-position: 0 0;
      }
      100% {
        background-position: -150px 0px;
      }
    }

    @keyframes Loader {
      0% {
        transform: rotateZ(0deg);
      }
      100% {
        transform: rotateZ(360deg);
      }
    }

    @keyframes LoaderReverse {
      0% {
        transform: rotateZ(0deg);
      }
      100% {
        transform: rotateZ(-360deg);
      }
    }

    .accent {
        background: var(--iface-accent-color);
    }

    .accent:hover {
        background: var(--iface-accent-hover);
    }

    .light {
        background: var(--main-text-color);
    }

    .swap-button:disabled {
        background: var(--iface-white10);
        backdrop-filter: blur(20px);
    }

    .btn-text {
        font-size: 16px;
        line-height: normal;
        color: #fff;
    }

    .light .btn-text {
        color: var(--text-color-reverse);
    }

    .btn-loader {
        display: block;
        width: 24px;
        height: 24px;
        background: url('@/assets/general/spinner-light.png') no-repeat;
        background-size: cover;
        animation: 1s forwards linear infinite Loader;
    }

    .theme-light .btn-loader {
        display: block;
        width: 24px;
        height: 24px;
        background: url('@/assets/general/spinner-light.png') no-repeat;
        background-size: cover;
        animation: 1s forwards linear infinite Loader;
        filter: invert(1);
    }

    .swap-button:disabled .btn-text {
        opacity: 0.6;
        color: var(--main-text-color);
    }
</style>
