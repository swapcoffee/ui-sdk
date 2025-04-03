<template>
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path opacity="0.8" fill-rule="evenodd" clip-rule="evenodd" d="M3.71406 3.55555C3.55682 3.55555 3.45884 3.73274 3.53807 3.87383L7.38876 10.7308V3.55555H3.71406ZM8.61123 3.55555V10.7308L12.462 3.87383C12.5411 3.73274 12.4432 3.55555 12.2859 3.55555H8.61123ZM2.48214 4.51367C1.9275 3.52603 2.61332 2.28571 3.71406 2.28571H12.2859C13.3867 2.28571 14.0725 3.52603 13.5179 4.51367L8.52796 13.3993C8.41843 13.5944 8.21739 13.7143 8 13.7143C7.7826 13.7143 7.58157 13.5944 7.47202 13.3993L2.48214 4.51367Z" fill="#007AFF"/>
  </svg>
</template>

<script>
import IconColorMixin from '@/mixins/IconColorMixin';

export default {
  name: 'TonIcon',
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