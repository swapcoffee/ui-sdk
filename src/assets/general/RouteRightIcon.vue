<template>
    <svg xmlns="http://www.w3.org/2000/svg" width="17" height="16" viewBox="0 0 17 16" fill="none">
        <path :fill="fillColorForTheme" d="M2.5 7.99999H14.5M14.5 7.99999L11.1667 4.66666M14.5 7.99999L11.1667 11.3333" stroke="white" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
</template>

<script lang="ts">
import IconColorMixin from '@/mixins/IconColorMixin.ts';

export default {
    name: "RouteRightIcon",
    mixins: [IconColorMixin],
    data() {
        return {}
    }
}
</script>

<style scoped>
</style>
