<template>
  <svg
    :class="combinedClasses"
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
  >
    <path
    :fill="fillColorForTheme"
      opacity="0.8"
      fill-rule="evenodd"
      clip-rule="evenodd"
      d="M3.99987 3.85181C3.85312 3.85181 3.76167 4.01718 3.83562 4.14887L7.4296 10.5487V3.85181H3.99987ZM8.57057 3.85181V10.5487L12.1646 4.14887C12.2385 4.01718 12.1471 3.85181 12.0003 3.85181H8.57057ZM2.85008 4.74605C2.33243 3.82426 2.97252 2.66663 3.99987 2.66663H12.0003C13.0276 2.66663 13.6677 3.82426 13.1501 4.74605L8.49285 13.0393C8.39062 13.2214 8.20299 13.3333 8.00009 13.3333C7.79718 13.3333 7.60955 13.2214 7.50731 13.0393L2.85008 4.74605Z"
      fill="white"
    />
  </svg>
</template>

<script>
import IconColorMixin from '@/mixins/IconColorMixin.js';

export default {
  name: 'LiqIcon',
  mixins: [IconColorMixin],
  props: {
    customClass: {
      type: String,
      default: ''
    }
  },
  computed: {
    combinedClasses() {
      return `icon ${this.customClass}`.trim();
    }
  }
}
</script>

<style scoped>

</style>
