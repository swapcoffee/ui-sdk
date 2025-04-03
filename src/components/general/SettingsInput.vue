<template>
    <label
        for=""
        :class="[{focused: inputFocused}, 'settings__label']"
    >
        <input
            type="text"
            class="settings__input"
            :placeholder="getPlaceholder"
            :value="formattedValue"
            inputmode="numeric"
            autocomplete="off"
            @input="changeInput"
            @focus="onFocus"
            @blur="onBlur"
        >
        <button class="label__button"
                v-if="withSelect"
                @click.stop="$emit('updateSelectVisible')"
        >
            {{ $t(`timeZone.${labelName}`) }}
            <ChevronBottom :class="[{reverse: reverseIcon}, 'chevron-icon']"/>
        </button>
        <p class="label__text"
           v-if="!withSelect && (formattedValue.length > 0 || inputFocused)"
        >
            {{ labelName }}
        </p>
        <slot></slot>
    </label>
</template>

<script lang="ts">

import methodsMixins from "@/mixins/methodsMixins.ts";
import ChevronBottom from "@/assets/earn/transfer-liquidity/ChevronBottom.vue";

export default {
    name: "SettingsInput",
    components: {ChevronBottom},
    mixins: [methodsMixins],
    props: {
        reverseIcon: {
            type: Boolean,
            default() {
                return false
            }
        },
        withSelect: {
            type: Boolean,
            default() {
                return false
            }
        },
        modelValue: {
            type: String,
            required: true,
        },
        labelName: {
            type: String,
            default() {
                return ''
            }
        },
        maxValue: {
            type: Number,
            default() {
                return 100
            }
        },
        minValue: {
            type: Number,
            default() {
                return 1
            }
        },
        placeholder: {
            type: String,
            default() {
                return ''
            }
        }
    },
    data() {
        return {
            inputFocused: false,
        }
    },
    computed: {
        getPlaceholder() {
            return this.placeholder.length > 0 && !this.inputFocused
                ? this.placeholder
                : this.formattedValue
        },
        formattedValue() {
            const value = String(this.modelValue ?? '');
            const rawValue = value.replace(/[^0-9.]/g, '');
            return this.formattedInput(rawValue);
        }
    },
    methods: {
        onFocus() {
            this.inputFocused = true;
            this.emitUpdateValue('');
        },
        onBlur() {
            this.inputFocused = false;
            if (this.modelValue === "0" || this.modelValue.length === 0 && this.minValue > 0) {
                this.emitUpdateValue(this.minValue.toString());
            }
        },
        changeInput(event) {
            let rawValue = event.target.value.replace(",", ".")
                .replace(/[^0-9.]/g, '')

            if (Number(rawValue) > this.maxValue) {
                rawValue = this.formattedInput(this.maxValue.toString());
            }
            if (Number(rawValue) < this.minValue) {
                rawValue = ''
            }

            this.emitUpdateValue(rawValue);

            if (rawValue.length > 0) event.target.value = rawValue
        },
        emitUpdateValue(value) {
            this.$emit('update:modelValue', value);
        },
    },
    watch: {
        inputFocused: {
            handler() {
                // this.$emit('changeFocus', this.inputFocused)
            }
        }
    },
}
</script>

<style scoped>
.settings__label {
    position: relative;
    display: flex;
    align-items: center;
    padding: 0 10px;
    width: 100%;
    border-radius: 10px;
    background: var(--iface-white6);
    transition: .2s;
}

.settings__label:hover,
.focused {
    background: var(--iface-white10);
}

.settings__input {
    width: 100%;
    padding: 10px 0;
    height: 44px;
    background: transparent;
    border: none;
    outline: none;
    font-size: 15px;
    line-height: normal;
    font-weight: 400;
}

.settings__input::placeholder {
    color: #fff;
    opacity: 0.4;
}

.theme-light .settings__input::placeholder {
    color: #0D0D0D;
    opacity: 0.4;
}

.default_value .settings__input {
    opacity: 0.4;
}

.label__text {
    font-size: 14px;
    line-height: normal;
    white-space: nowrap;
}

.label__button {
    display: flex;
    align-items: flex-end;
    gap: 6px;
    padding: 13px 0;
    border: none;
    outline: none;
    background: transparent;
    font-size: 14px;
    line-height: normal;
    font-family: Harmony-Regular, sans-serif;
    white-space: nowrap;
}

.chevron-icon {
    width: 16px;
    height: 16px;
    transition: .2s;
}

.reverse {
    transform: rotateX(180deg);
}
</style>
