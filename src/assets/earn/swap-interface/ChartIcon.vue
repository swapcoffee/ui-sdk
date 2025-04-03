<template>
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
    <g opacity="0.5">
      <path :fill="fillColorForTheme" :stroke="fillColorForTheme" d="M6.45833 17.295V14.495" stroke="white" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
      <path  :stroke="fillColorForTheme" fill-rule="evenodd" clip-rule="evenodd" d="M7.09599 14.495H5.81979C5.1371 14.495 4.58333 13.9653 4.58333 13.3117V8.47744C4.58333 7.82375 5.1371 7.29492 5.81979 7.29492H7.09599C7.7795 7.29492 8.33328 7.82375 8.33328 8.47744V13.3117C8.33328 13.9653 7.7795 14.495 7.09599 14.495Z" stroke="white" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
      <path :fill="fillColorForTheme" :stroke="fillColorForTheme" d="M6.45833 7.29492V4.49492" stroke="white" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
      <path :fill="fillColorForTheme" :stroke="fillColorForTheme" d="M14.375 15.695V12.895" stroke="white" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
      <path :stroke="fillColorForTheme" fill-rule="evenodd" clip-rule="evenodd" d="M15.0127 12.895H13.7365C13.0538 12.895 12.5 12.3653 12.5 11.7117V6.87741C12.5 6.22375 13.0538 5.69492 13.7365 5.69492H15.0127C15.6962 5.69492 16.2499 6.22375 16.2499 6.87741V11.7117C16.2499 12.3653 15.6962 12.895 15.0127 12.895Z" stroke="white" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
      <path :fill="fillColorForTheme" :stroke="fillColorForTheme" d="M14.375 5.69491V2.89491" stroke="white" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
    </g>
  </svg>
</template>

<script lang="ts">
import IconColorMixin from '@/mixins/IconColorMixin.ts';

export default {
    name: "ChartIcon",
    mixins: [IconColorMixin],
    data() {
        return {}
    }
}
</script>

<style scoped>
</style>
