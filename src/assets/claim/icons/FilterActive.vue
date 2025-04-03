<template>
  <svg :class="combinedClasses" xmlns="http://www.w3.org/2000/svg" :opacity="!isDown && !isUp ? 0.4 : 1" width="17" height="16" viewBox="0 0 17 16" fill="none">
    <path :stroke="fillColorForTheme" :opacity="isDown ? 0.4 : 1" d="M10.9 10.5882L8.16668 13.3334L5.43335 10.5882" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
    <path :stroke="fillColorForTheme" :opacity="isUp ? 0.4 : 1" d="M5.43335 5.41185L8.16668 2.66669L10.9 5.41185" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>
</template>

<script lang="ts">
import IconColorMixin from '@/mixins/IconColorMixin.ts';

export default {
  name: 'FilterActiveIcon',
  mixins: [IconColorMixin],
  props: {
    customClass: {
      type: String,
      default: ''
    },
    isUp: {
      type: Boolean,
      default: false
    },
    isDown: {
      type: Boolean,
      default: false
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
