<template>
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="16" viewBox="0 0 18 16" fill="none">
        <g opacity="0.2">
            <path :fill="fillColorForTheme" d="M2.25 8H15.75M15.75 8L12 4.66666M15.75 8L12 11.3333" stroke="white" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
        </g>
    </svg>
</template>

<script lang="ts">
import iconColorMixin from "@/mixins/IconColorMixin.ts";

export default {
    name: "HistoryArrowIcon",
    mixins: [iconColorMixin],
    data() {
        return {}
    }
}
</script>

<style scoped>
.theme-light svg path {
  filter: invert(1);
}
</style>
