<template>
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path :stroke="fillColorForTheme" d="M5.88475 9.70316L4.73775 10.8502C2.42075 13.1672 2.42075 16.9442 4.73775 19.2612C7.04676 21.5702 10.8317 21.5782 13.1487 19.2612L14.2957 18.1142M18.1152 14.2969L19.2623 13.1499C21.5792 10.8329 21.5792 7.05585 19.2623 4.73884C16.9533 2.42984 13.1683 2.42184 10.8513 4.73884L9.70431 5.88585M14.6367 9.45316L9.40431 14.6855" stroke="white" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>
</template>

<script>
import IconColorMixin from '@/mixins/IconColorMixin.js';

export default {
  name: 'LinkIcon',
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