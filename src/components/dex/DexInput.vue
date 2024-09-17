<template>
  <input type="text" class="dex__input" placeholder="0" inputmode="decimal"
         autocomplete="off"
         :value="formattedValue"
         @input="changeInput"
         @focus="onFocus"
         @blur="onBlur"
  >
</template>

<script lang="ts">
import { useDexStore } from "@/stores/dex";
import methodsMixins from "@/mixins/methodsMixins";

export default {
  mixins: [methodsMixins],
  name: "DexInput",
  props: {
    modelValue: {
      type: [String],
      required: true,
      defaultValue: ''
    },
  },
  computed: {
    formattedValue() {
      const rawValue = this.modelValue ? this.modelValue.replace(/[^0-9.]/g, '') : '';
      return this.formattedInput(rawValue);
    },
    dexStore() {
      return useDexStore();
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
        let rawValue = event.target.value.replace(",", ".").replace(/[^0-9.]/g, '');
        this.emitUpdateValue(rawValue);
        this.dexStore.DEX_SEND_AMOUNT(Number(rawValue));
        event.target.value = this.formattedValue;
      },
    emitUpdateValue(value) {
      this.$emit('update:modelValue', value);
    }
  }
};
</script>

<style scoped>
.dex__input {
  width: 100%;
  height: 36px;
  border: none;
  outline: none;
  background: transparent;
  font-size: 28px;
  font-family: Roboto, sans-serif;
  font-weight: 500;
}

.dex__input::placeholder {
  color: var(--main-text-color);
}
</style>
