<template>
    <input
        type="text"
        class="dex__input"
        placeholder="0"
        inputmode="decimal"
        autocomplete="off"
        :value="formattedValue"
        @input="changeInput"
        @focus="onFocus"
        @blur="onBlur"
    />
</template>

<script>
import methodsMixins from '@/mixins/methodsMixins.ts';

export default {
    mixins: [methodsMixins],
    name: "DexInput",
    props: {
        modelValue: {
            type: String,
            required: true,
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
            if (this.modelValue === "0" || this.modelValue.length === 0) {
                this.emitUpdateValue('0');
            }
        },
        changeInput(event) {
            let rawValue = event.target.value.replace(",", ".")
                .replace(/[^0-9.]/g, '')
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
.dex__input {
    width: 100%;
    height: 36px;
    border: none;
    outline: none;
    background: transparent;
    font-size: 28px;
    font-family: Harmony-Medium, sans-serif;
}

.dex__input::placeholder {
    color: var(--main-text-color);
}
</style>
