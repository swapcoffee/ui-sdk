<template>
  <svg :class="combinedClasses" xmlns="http://www.w3.org/2000/svg" width="14" height="14"
       viewBox="0 0 14 14" fill="none">
    <path opacity="0.8" fill-rule="evenodd" clip-rule="evenodd"
          d="M3.24981 3.61111C3.11222 3.61111 3.02649 3.76615 3.09582 3.8896L6.46518 9.88944V3.61111H3.24981ZM7.53483 3.61111V9.88944L10.9042 3.8896C10.9735 3.76615 10.8878 3.61111 10.7502 3.61111H7.53483ZM2.17188 4.44946C1.68657 3.58528 2.28666 2.5 3.24981 2.5H10.7502C11.7133 2.5 12.3134 3.58528 11.8281 4.44946L7.46197 12.2244C7.36613 12.3951 7.19023 12.5 7 12.5C6.80978 12.5 6.63388 12.3951 6.53803 12.2244L2.17188 4.44946Z"
          :fill="fillColorForTheme"/>
  </svg>
</template>

<script lang="ts">
import IconColorMixin from '@/mixins/IconColorMixin.ts';

export default {
  name: 'LiquidityIcon',
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
};
</script>

<style scoped>
</style>
