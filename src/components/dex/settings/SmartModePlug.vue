<template>
    <div class="smart-mode">
        <div class="smart-mode__left" @click="updateSettingsModalVisible(true)">
            <div class="smart-mode__info">
                <SmartModeIcon :custom-color="widgetTheme === 'light' ? '#35343B' : ''" />
                <p class="smart-mode__left-title">Smart mode</p>
            </div>

            <RightChevronIcon :custom-color="widgetTheme === 'light' ? '#35343B' : ''" />
        </div>
        <div class="smart-mode__right">
            <skeleton-item class="skeleton-item"
                v-if="isLoading"
            ></skeleton-item>
            <button
                v-else
                class="smart-mode__button"
                :class="{ btn_active: dexSettingsStore.GET_SMART_MODE_VALUE && isListedPair }"
                :disabled="!isListedPair"
                @mouseenter="onMouseEnter"
                @mouseleave="onMouseLeave"
                @click="smartAction"
            >
                {{ displayButtonText }}
                <SmartTooltipIcon
                    v-if="!isListedPair"
                />
            </button>
        </div>
        <transition name="tooltip">
            <tooltip-wrapper
                v-show="showTooltip"
                class="btn-tooltip no-arrow"
                @hidden-tooltip="showTooltip = false"
                @mouseenter="onMouseEnter"
                @mouseleave="onMouseLeave"
            >
                {{ getTooltipText }}
            </tooltip-wrapper>
        </transition>
    </div>
</template>

<script lang="ts">
import RightChevronIcon from "@/assets/stake/icons/RightChevronIcon.vue"
import SmartModeIcon from "@/assets/dex/icons/SmartModeIcon.vue"
import { toggleSmartMode } from "@/helpers/swap-interface/swap-settings.ts"
import MevTooltipIcon from "@/assets/dex/icons/MevTooltipIcon.vue";
import SmartTooltipIcon from "@/assets/dex/icons/SmartTooltipIcon.vue"
import TooltipWrapper from "@/components/ui/TooltipWrapper.vue"
import {useDexStore} from "@/stores/dex";
import {useDexSettingsStore} from "@/stores/dex/settings.ts";
import SkeletonItem from "@/components/ui/SkeletonItem.vue";

export default {
    name: "SmartModePlug",
    components: {SkeletonItem, TooltipWrapper, SmartTooltipIcon, MevTooltipIcon, SmartModeIcon, RightChevronIcon },
    inject: ["updateSettingsModalVisible", 'widgetTheme'],
    data() {
        return {
            showTooltip: false,
            isLoading: true,
            timeout: null,
        }
    },
    props: {
        isListedPair: {
            type: Boolean,
            default() {
                return false
            },
        },
    },
    computed: {
        dexStore() {
          return useDexStore()
        },
        dexSettingsStore() {
          return useDexSettingsStore()
        },
        displayButtonText() {
            return !(this.dexSettingsStore.GET_SMART_MODE_VALUE && this.isListedPair)
                ? this.$t("mevProtect.status.enabled")
                : this.$t("mevProtect.status.disabled")
        },
        getTooltipText() {
            return this.$t('smart.tooltip', {mode: "Smart Mode"})
        },
    },
    methods: {
        smartAction() {
            if (this.isListedPair) {
                toggleSmartMode(!this.dexSettingsStore.GET_SMART_MODE_VALUE)
            }
        },
        onMouseLeave()  {
            this.timeout = setTimeout(() => {
                this.showTooltip = false
            }, 100)
        },
        onMouseEnter() {
            clearTimeout(this.timeout)
            if (!this.isListedPair) this.showTooltip = true
        }
    },
    watch: {
        'dexStore.GET_SEND_TOKEN': {
            immediate: true,
            handler() {
                if (this.dexStore.GET_SEND_TOKEN) {
                    if (this.isLoading) this.isLoading = false
                }
            },
        }
    }
}
</script>

<style scoped>
.smart-mode {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
    border-radius: 12px;
    padding: 6px 6px 6px 10px;
    background: rgba(211, 190, 178, 0.14);
}

.theme-light .smart-mode {
    background: rgba(35, 39, 57, 0.14);
}

.smart-mode__left {
    display: flex;
    align-items: center;
    gap: 4px;
    cursor: pointer;
    transition: opacity 0.2s ease-out;
}

.smart-mode__left:hover {
    opacity: 0.8;
}

.smart-mode__info {
    display: flex;
    align-items: center;
    gap: 6px;
}

.smart-mode__left-title {
    font-size: 15px;
    font-weight: 500;
}

.theme-light .smart-mode__left-title {
    color: #35343b;
}

.smart-mode__button {
    min-width: 90px;
    height: 30px;
    padding: 5px 17.5px;
    border: 1px solid transparent;
    border-radius: 10px;
    transition: all 0.2s ease-in-out;
    background: #fff;
    backdrop-filter: blur(20px);
    color: #0d0d0d;
    font-size: 14px;
    font-weight: 400;
}

.theme-light .smart-mode__button {
    color: #fff;
}

.btn_active {
    border: 1px solid rgba(255, 255, 255, 0.2);
    background: transparent;
    color: var(--main-text-color);
}

.smart-mode__button:hover {
    opacity: 0.8;
}

.smart-mode__button:disabled {
    position: relative;
    display: flex;
    align-items: center;
    gap: 6px;
    opacity: 0.6;
    backdrop-filter: blur(20px);
}

.btn-tooltip {
    z-index: 100;
    right: -87px;
    bottom: 33px;
    max-width: 150px;
}

.theme-light .smart-mode__button {
    background: #35343b;
}

.theme-light .btn_active {
    border: 1px solid rgba(53, 52, 59, 0.2);
    background: transparent;
    color: #35343b;
}

.skeleton-item {
    width: 90px;
    height: 30px;
}

@media screen and (max-width: 768px) {
    .btn-tooltip {
        left: -8px;
        right: -8px;
        width: auto;
        bottom: 40px;
        max-width: none;
        min-width: auto;
    }
    
    .no-arrow :deep(.tooltip__arrow--bottom),
    .no-arrow :deep(.tooltip__arrow--top) {
        display: none;
    }
}
</style>