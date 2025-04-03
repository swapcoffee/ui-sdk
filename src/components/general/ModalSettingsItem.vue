<template>
    <div class="settings">
        <div class="settings__info">
            <p class="settings__text">{{ title }}</p>
        </div>
        <p class="settings__description">{{ text }}</p>
        <div class="settings__button-wrapper">
            <ModalSettingButton
                v-for="value in defaultValues"
                :class="{active_btn: value === this.getCurrentValue}"
                :key="value"
                :value="value"
                @click="$emit('changeValue', value.toString())"
            />
        </div>
        <label for="" class="settings__label">
            <ModalSettingsInput
                :class="{active_input: this.isInputActive}"
                :model-value="getModelValue"
                :getCurrentValue="this.getCurrentValue.toString()"
                @update:model-value="updateValue"
                @changeFocus="changeFocus"
            />
        </label>
    </div>
</template>

<script lang="ts">
import ModalSettingButton from "@/components/general/ModalSettingsButton.vue";

import ModalSettingsInput from "@/components/general/ModalSettingsInput.vue";
import DexInput from "@/components/dex/DexInput.vue";
import {useLimitSettingsStore} from "@/stores/limit/settings.ts";

export default {
    name: "ModalSettingsItem",
    components: {DexInput, ModalSettingsInput, ModalSettingButton},
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
            type: Array,
            required: true,
        },
        type: {
            type: String,
            required: true,
        }
    },
    inject: ['settingsValue', 'updateMaxSuborders', 'updateMaxInvocations'],
    data() {
        return {
            inputFocused: false,
        }
    },
    computed: {
        limitSettingStore() {
            return useLimitSettingsStore()
        },
        getModelValue() {
            switch (this.type) {
                case "orders":
                    return this.settingsValue.maxSuborders
                case "invocations":
                    return this.settingsValue.maxInvocations
            }
        },
        getCurrentValue() {
            switch (this.type) {
                case "orders":
                    return this.limitSettingStore.GET_LIMIT_SUBORDERS
                case "invocations":
                    return this.limitSettingStore.GET_LIMIT_INVOCATIONS
            }
        },
        isInputActive() {
            return this.inputFocused
        }
    },
    methods: {
        changeFocus(value) {
            this.inputFocused = value
        },
        focusInput() {
            let input = document.getElementById(`${this.position}_input`)
            input.focus()
        },
        updateValue(value) {
            if (this.type === 'orders') {
                this.updateMaxSuborders(value)
            } else {
                this.updateMaxInvocations(value)
            }
        },
    },
}
</script>

<style scoped>

.settings__text {
    margin-bottom: 5px;
    font-size: 14px;
    line-height: 16px;
    font-family: Harmony-Medium, sans-serif;
}

.settings__description {
    margin-bottom: 15px;
    font-size: 14px;
    line-height: 16px;
    font-weight: 400;
    color: #8c8c8d;
}

.settings__button-wrapper {
    display: flex;
    gap: 8px;
    margin-bottom: 8px;
}
</style>
