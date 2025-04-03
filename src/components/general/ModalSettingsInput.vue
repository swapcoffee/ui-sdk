<template>
    <input
        type="text"
        class="settings__input"
        :placeholder="this.getCurrentValue"
        inputmode="decimal"
        autocomplete="off"
        :value="modelValue"
        @input="changeInput"
        @focus="onFocus"
        @blur="onBlur"
    />
</template>

<script>
export default {
    name: "ModalSettingsInput",
    props: {
        modelValue: {
            type: String,
            required: true,
        },
        getCurrentValue: {
            type: String,
            required: true
        }
    },
    data() {
        return {
            minValue: 1,
            maxValue: 5,
            rawValue: '',
        }
    },
    computed: {
        activeConditions() {

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
            if (this.modelValue === "0" || this.modelValue.length === 0 && this.minValue > 0) {
                this.emitUpdateValue(this.minValue.toString());
            }
        },
        changeInput(event) {
            this.rawValue = event.target.value
                .replace(/[^0-9.]/g, '')

            if (Number(this.rawValue) > this.maxValue) {
                this.rawValue = this.maxValue.toString()
            }

            if (Number(this.rawValue) < this.minValue) {
                this.rawValue = ''
            }

            this.emitUpdateValue(this.rawValue);

            if (this.rawValue.length > 0) event.target.value = this.rawValue
        },
        emitUpdateValue(value) {
            this.$emit('update:modelValue', value);
        },
    }
}
</script>

<style scoped>
.settings__input {
    transition: 0.15s;
    padding: 10px 12px 10px 12px;
    width: 100%;
    height: 40px;
    border-radius: 12px;
    outline: none;
    border: 1px solid var(--iface-white14);
    background: transparent;
    text-align: center;
    font-size: 14px;
    font-family: Harmony-Medium, sans-serif;
}

.settings__input:hover {
    border: 1px solid var(--iface-white24);
    background: var(--iface-white4);
}

.settings__input:active {
    border: 2px solid var(--iface-accent-color);
    background: var(--main-bg-color);
}

.settings__input:focus {
    border: 2px solid var(--iface-accent-color);
    background: var(--main-bg-color);
}

.active_input {
    border: 1px solid var(--iface-accent-color);
    color: var(--iface-accent-color);
}

.active_input:hover {
    border: 1px solid var(--iface-accent-color);
    color: var(--iface-accent-color);
    background: var(--iface-white4);
}
</style>
