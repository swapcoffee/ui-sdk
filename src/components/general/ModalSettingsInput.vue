<template>
    <input
        type="text"
        class="settings__input"
        :placeholder="getPlaceholder"
        inputmode="decimal"
        autocomplete="off"
        :value="modelValue"
        @input="changeInput"
        @focus="onFocus"
        @blur="onBlur"
    />
</template>

<script lang="ts">
export default {
    name: "ModalSettingsInput",
    props: {
        modelValue: {
            type: String,
            required: true,
        },
        minValue: {
            type: Number,
            default: 1
        },
        maxValue: {
            type: Number,
            default: 100
        },
        symbol: {
            type: String,
            default: ''
        },
    },
    data() {
        return {
            rawValue: '',
        }
    },
    computed: {
       getPlaceholder() {
           return this.symbol === '%'
               ? `${this.$t("myPoolAction.custom")} ${this.symbol}`
               : `${this.$t("myPoolAction.custom")}`
       }
    },
    methods: {
        onFocus() {
            if (this.modelValue === "0") {
                this.emitUpdateValue('');
            }
        },
        onBlur(event) {
            const actualValue = event.target.value;

            if (actualValue === '' || actualValue === '0' || Number(actualValue) < this.minValue) {
                this.emitUpdateValue(this.minValue.toString());
                event.target.value = this.minValue.toString();
            }
        },
        changeInput(event) {
            this.rawValue = event.target.value.replace(',', '.').replace(/[^0-9.]/g, '')

            if (Number(this.rawValue) > this.maxValue) {
                this.rawValue = this.maxValue.toString()
            }

            if (this.rawValue !== '' && Number(this.rawValue) >= this.minValue) {
                this.emitUpdateValue(this.rawValue);
            }

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
    background: var(--iface-white6);
    width: 100%;
    height: 40px;
    font-size: 14px;
    font-weight: 500;
    padding: 10px 12px;
    text-align: center;
    border-radius: 12px;
    transition: 0.15s;
    outline: none;
    border: 0px solid var(--iface-white6);
}

.settings__input:hover {
    background: var(--iface-white4);
}

.settings__input:active {
    background: var(--iface-white6);
}

.settings__input:focus {
    background: var(--iface-white6);
}

.settings__input:disabled {
    cursor: not-allowed;
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

.settings__input::placeholder {
    color: var(--main-text-color);
    opacity: 0.4;
}

.settings__input:focus::placeholder {
    color: transparent;
}
</style>
