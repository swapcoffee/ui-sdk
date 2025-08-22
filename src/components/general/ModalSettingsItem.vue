<template>
    <div class="settings">
        <div class="settings__info">
            <p class="settings__text">{{ title }}</p>
        </div>
        <p class="settings__description">{{ text }}</p>
        <div class="settings__button-wrapper">
            <ModalSettingButton
                v-for="value in defaultValues"
                :class="{
                    active_btn: activeCondition(value),
                    red_btn: value === -1,
                }"
                :key="value"
                :value="getButtonText(value)"
                @click="updateValue(value, 'value')"
            />
        </div>
        <ModalSettingsInput
            v-if="!withoutInput"
            :class="{ active_input: isInputActive }"
            :model-value="getCurrentInput.toString()"
            :minValue="inputRanges[0]"
            :maxValue="inputRanges[1]"
            :getCurrentValue="getCurrentInput.toString()"
            :symbol="symbol"
            @update:model-value="(value) => updateValue(value, 'custom')"
            @changeFocus="changeFocus"
        />
    </div>
</template>

<script lang="ts">
import ModalSettingButton from "@/components/general/ModalSettingsButton.vue";
import ModalSettingsInput from "@/components/general/ModalSettingsInput.vue";

import {useLimitSettingsStore} from "@/stores/limit/settings.ts";
import {useDexSettingsStore} from "@/stores/dex/settings.ts";

export default {
    name: "ModalSettingsItem",
    components: {ModalSettingsInput, ModalSettingButton},
    inject: {
        settingsUpdaters: {
            type: Object,
            required: true
        },
        settingsValue: {
            type: Object,
            required: true
        }
    },
    props: {
        title: {
            type: String,
            required: true,
        },
        text: {
            type: String,
            required: true,
        },
        defaultValues: {
            type: Array as () => (number | string)[],
            required: true,
        },
        type: {
            type: String,
            required: true,
        },
        inputRanges: {
            type: Array as () => number[],
            default: () => [1, 100]
        },
        symbol: {
            type: String,
            default: ''
        },
        withoutInput: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            inputFocused: false,
        }
    },
    computed: {
        limitSettingStore() {
            return useLimitSettingsStore()
        },
        dexSettingsStore() {
            return useDexSettingsStore()
        },
        getCurrentButton() {
            return this.settingsValue[this.type]?.value || 0
        },
        getCurrentInput() {
            return this.settingsValue[this.type]?.custom || this.settingsValue[this.type]?.value || 0
        },
        isInputActive() {
            return this.inputFocused
        }
    },
    methods: {
        activeCondition(value: number | string) {
            let current = this.getCurrentButton
            if (typeof current !== 'number') {
                current = Number(current)
            }
            
            return value === current
        },
        getButtonText(value: number | string) {
            if (this.type === "max_volatility" && value === -1) {
                return "Ignore"
            }

            if (this.symbol === '$') {
                return `${this.symbol}${value}`
            } else if (this.symbol === '%') {
                return `${value}${this.symbol}`
            }

            return value.toString()
        },
        changeFocus(value: boolean) {
            this.inputFocused = value
        },
        updateValue(value: number | string, mode: 'value' | 'custom') {
            if (this.settingsUpdaters && this.settingsUpdaters[this.type]) {
                this.settingsUpdaters[this.type](value, mode)
            }
        },
    },
    mounted() {

    }
}
</script>

<style scoped>
.settings__text {
    margin-bottom: 4px;
    font-size: 15px;
    line-height: 18px;
    font-family: Harmony-Medium, sans-serif;
}

.settings__description {
    margin-bottom: 15px;
    font-size: 14px;
    line-height: 16px;
    font-weight: 400;
    opacity: 0.4;
}

.settings__button-wrapper {
    display: flex;
    gap: 8px;
    margin-bottom: 8px;
}
</style>
