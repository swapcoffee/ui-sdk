<template>
  <svg :class="combinedClasses" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
    <g opacity="0.6">
      <path :stroke="fillColorForTheme" d="M6.74711 2.33331H5.34426C3.49378 2.33331 2.33337 3.64357 2.33337 5.49783V10.5021C2.33337 12.3564 3.48811 13.6666 5.34426 13.6666H10.6546C12.5113 13.6666 13.6667 12.3564 13.6667 10.5021V9.40591" stroke="white" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
      <path :stroke="fillColorForTheme" d="M13.6665 5.38261V2.33331M13.6665 2.33331H10.6172M13.6665 2.33331L8.91272 7.08705" stroke="white" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
    </g>
  </svg>
</template>

<script lang="ts">
import IconColorMixin from '@/mixins/IconColorMixin.ts';

export default {
  name: "LinkIcon",
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
