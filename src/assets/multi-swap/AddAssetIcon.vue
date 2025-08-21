<template>
    <svg xmlns="http://www.w3.org/2000/svg" width="19" height="18" viewBox="0 0 19 18" fill="none">
        <path d="M5 9H14" :stroke="fillColorForTheme" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M9.5 4.5V13.5" :stroke="fillColorForTheme" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
</template>

<script lang="ts">
import iconColorMixin from "@/mixins/IconColorMixin.ts";

export default {
    name: "AddAssetIcon",
    mixins: [iconColorMixin],
    data() {
        return {}
    }
}
</script>

<style scoped>

</style>
