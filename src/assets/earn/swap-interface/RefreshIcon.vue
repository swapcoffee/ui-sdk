<template>
    <svg
        id="arrow_loading"
        :key="`ANIMATION_STATUS_${shouldAnimate}`"
        class="refresh-icon"
        viewBox="0 0 24 24"
        color="textSubtle"
        xmlns="http://www.w3.org/2000/svg"
        :class="{ refresh: refreshInfo }"
    >
        <path
            stroke="none"
            :fill="getColor"
            d="M11.9911 20.86C14.1557 20.8665 16.2485 20.0838 17.8778 18.6586C19.507 17.2333 20.5609 15.2631 20.8422 13.1168C20.9068 12.6239 20.5597 12.172 20.0668 12.1074C19.574 12.0428 19.1221 12.39 19.0575 12.8828C18.833 14.5951 17.9923 16.1668 16.6926 17.3038C15.3929 18.4408 13.7233 19.0652 11.9965 19.06C10.2696 19.0549 8.60383 18.4205 7.31095 17.2758C6.01806 16.131 5.18672 14.5542 4.97252 12.8407C4.75833 11.1272 5.17598 9.39433 6.14729 7.96653C7.1186 6.53873 8.57698 5.51387 10.2494 5.08379C11.9219 4.65371 13.6938 4.84791 15.2334 5.63002C16.3568 6.20071 17.3003 7.05589 17.9766 8.0998H14.9498C14.4528 8.0998 14.0498 8.50275 14.0498 8.9998C14.0498 9.49686 14.4528 9.8998 14.9498 9.8998H19.4294C19.4432 9.90012 19.457 9.90012 19.4708 9.8998H19.9498C20.4469 9.8998 20.8498 9.49686 20.8498 8.9998V3.9998C20.8498 3.50275 20.4469 3.0998 19.9498 3.0998C19.4528 3.0998 19.0498 3.50275 19.0498 3.9998V6.50489C18.2508 5.47492 17.2289 4.62481 16.0486 4.02522C14.1187 3.04482 11.8976 2.8014 9.80114 3.34051C7.70469 3.87962 5.87658 5.1643 4.65902 6.95408C3.44146 8.74386 2.91793 10.916 3.18642 13.064C3.45492 15.2119 4.49703 17.1884 6.11769 18.6234C7.73834 20.0584 9.82644 20.8536 11.9911 20.86Z"
        />
        <defs>
            <path
                id="arrow"
                stroke="none"
                fill="none"
                d="M11.9911 20.86C14.1557 20.8665 16.2485 20.0838 17.8778 18.6586C19.507 17.2333 20.5609 15.2631 20.8422 13.1168C20.9068 12.6239 20.5597 12.172 20.0668 12.1074C19.574 12.0428 19.1221 12.39 19.0575 12.8828C18.833 14.5951 17.9923 16.1668 16.6926 17.3038C15.3929 18.4408 13.7233 19.0652 11.9965 19.06C10.2696 19.0549 8.60383 18.4205 7.31095 17.2758C6.01806 16.131 5.18672 14.5542 4.97252 12.8407C4.75833 11.1272 5.17598 9.39433 6.14729 7.96653C7.1186 6.53873 8.57698 5.51387 10.2494 5.08379C11.9219 4.65371 13.6938 4.84791 15.2334 5.63002C16.3568 6.20071 17.3003 7.05589 17.9766 8.0998H14.9498C14.4528 8.0998 14.0498 8.50275 14.0498 8.9998C14.0498 9.49686 14.4528 9.8998 14.9498 9.8998H19.4294C19.4432 9.90012 19.457 9.90012 19.4708 9.8998H19.9498C20.4469 9.8998 20.8498 9.49686 20.8498 8.9998V3.9998C20.8498 3.50275 20.4469 3.0998 19.9498 3.0998C19.4528 3.0998 19.0498 3.50275 19.0498 3.9998V6.50489C18.2508 5.47492 17.2289 4.62481 16.0486 4.02522C14.1187 3.04482 11.8976 2.8014 9.80114 3.34051C7.70469 3.87962 5.87658 5.1643 4.65902 6.95408C3.44146 8.74386 2.91793 10.916 3.18642 13.064C3.45492 15.2119 4.49703 17.1884 6.11769 18.6234C7.73834 20.0584 9.82644 20.8536 11.9911 20.86Z"
            />
            <clipPath id="arrow-clip">
                <use href="#arrow" />
            </clipPath>
        </defs>
        <g clip-path="url(#arrow-clip)">
            <circle
                cx="12"
                cy="12"
                r="5"
                transform="rotate(360,12,12)"
                fill="none"
                :stroke="getBackgroundColor"
                stroke-width="16"
                stroke-dasharray="30"
                stroke-dashoffset="60"
            >
                <animate
                    v-if="shouldAnimate"
                    attributeName="stroke-dashoffset"
                    values="60;30"
                    begin="0"
                    repeatCount="indefinite"
                    ease-in-out="sine"
                    dur="9s"
                />
            </circle>
        </g>
        <use href="#arrow" />
    </svg>
</template>

<script lang="ts">
import IconColorMixin from '@/mixins/IconColorMixin.ts';

export default {
    name: "RefreshIcon",
    mixins: [IconColorMixin],
    inject: ["widgetTheme"],
    props: {
        refreshInfo: {
            type: Boolean,
            data() {
                return false
            }
        },
        shouldAnimate: {
            type: Boolean,
            data() {
                return false
            }
        },
    },
    data() {
        return {}
    },
  computed: {
    GET_THEME(): string {
      return this.widgetTheme;
    },
    getColor() {
      return this.GET_THEME === 'dark' || this.GET_THEME === 'coffee' ? '#E9E9EB' : '#0D0D0D';
    },
    getBackgroundColor() {
      return this.GET_THEME === 'dark' || this.GET_THEME === 'coffee' ? '#898B8F' : '#898B8F';
    }
  },
}
</script>

<style scoped>
.refresh-icon {
    transition: 0.15s;
    opacity: 0.8;
    width: 20px;
    height: 20px;
}

.refresh {
    animation: 1s forwards ease-out Loader;
}

.theme-light .refresh-icon svg path {
    filter: invert(1) brightness(1.2) contrast(1.1) drop-shadow(0 0 2px rgba(0, 0, 0, 0.2));
}

</style>
