<template>
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
        <g opacity="0.8">
            <path :stroke="fillColorForTheme" d="M6.46436 13.5355L13.5354 6.46445" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            <path :stroke="fillColorForTheme" d="M6.46436 6.46448L13.5354 13.5355" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </g>
    </svg>
</template>

<script lang="ts">
import iconColorMixin from "@/mixins/IconColorMixin.ts";

export default {
    name: "RemoveTokenIcon",
    mixins: [iconColorMixin],
    data() {
        return {}
    }
}
</script>

<style scoped>

</style>
