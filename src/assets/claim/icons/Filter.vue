<template>
  <svg :class="combinedClasses" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
    <g opacity="0.4">
      <path :fill="fillColorForTheme" d="M10.7333 10.5882L7.99993 13.3333L5.2666 10.5882M5.2666 5.41182L7.99993 2.66666L10.7333 5.41182" stroke="white" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
    </g>
  </svg>
</template>

<script lang="ts">
import IconColorMixin from '@/mixins/IconColorMixin.ts';

export default {
  name: 'FilterIcon',
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
