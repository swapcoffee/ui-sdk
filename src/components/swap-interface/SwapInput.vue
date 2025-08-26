<template>
    <input
        type="text"
        class="swap__input"
        placeholder="0"
        inputmode="decimal"
        autocomplete="off"
        :value="formattedValue"
        @input="changeInput"
        @focus="onFocus"
        @blur="onBlur"
    />
</template>

<script lang="ts">
import methodsMixins from '@/mixins/methodsMixins.ts';

export default {
    mixins: [methodsMixins],
    name: "SwapInput",
    props: {
        modelValue: {
            type: String,
            required: true,
        },
        position: {
            type: String,
            required: false,
        },
    },
    data() {
        return {
            inputFocused: false,
        }
    },
    computed: {
        formattedValue() {
            const value = String(this.modelValue ?? '');
            const rawValue = value.replace(/[^0-9.]/g, '');
            return this.formattedInput(rawValue);
        }
    },
    methods: {
        onFocus() {
            this.inputFocused = true;
            if (this.modelValue === "0") {
                this.emitUpdateValue('');
            }
        },
        onBlur() {
            this.inputFocused = false;
            if (this.modelValue === "0") {
                this.emitUpdateValue('0');
            }
        },
        changeInput(event) {
            let rawValue = event.target.value.replace(',', '.').replace(/[^0-9.]/g, '');

            if (rawValue === '.') {
                rawValue = '0.';
            }

            this.emitUpdateValue(rawValue);
            event.target.value = this.formattedValue;
        },
        emitUpdateValue(value) {
            this.$emit('update:modelValue', value);
        },
    },
    watch: {
        inputFocused: {
            handler() {
                this.$emit('changeFocus', this.inputFocused)
            }
        }
    },
}
</script>

<style scoped>
.swap__input {
    width: 100%;
    height: 36px;
    border: none;
    outline: none;
    background: transparent;
    font-size: 28px;
    font-family: Harmony-Medium, sans-serif;
}

.swap__input::placeholder {
    color: var(--main-text-color);
}

.swap__input--disabled {
    pointer-events: none;
    user-select: none;
    cursor: not-allowed;
}
</style>
