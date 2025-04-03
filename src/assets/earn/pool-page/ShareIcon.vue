<template>
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="17" viewBox="0 0 16 17" fill="none">
        <path :stroke="fillColorForTheme" d="M6.74707 2.83325H5.34422C3.49374 2.83325 2.33334 4.14351 2.33334 5.99777V11.0021C2.33334 12.8563 3.48808 14.1666 5.34422 14.1666H10.6545C12.5113 14.1666 13.6667 12.8563 13.6667 11.0021V9.90585" stroke="white" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
        <path :stroke="fillColorForTheme" d="M13.6665 5.88255V2.83325M13.6665 2.83325H10.6172M13.6665 2.83325L8.91273 7.58698" stroke="white" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
</template>

<script>
import IconColorMixin from "@/mixins/IconColorMixin.js";

export default {
    name: "ShareIcon",
    mixins: [IconColorMixin],
    data() {
        return {}
    }
}
</script>

<style scoped>
</style>
