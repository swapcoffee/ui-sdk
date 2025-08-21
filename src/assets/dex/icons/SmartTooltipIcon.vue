<template>
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none">
        <g opacity="0.6">
            <path d="M2.25 9C2.25 12.7274 5.27181 15.75 9 15.75C12.7282 15.75 15.75 12.7274 15.75 9C15.75 5.27181 12.7282 2.25 9 2.25C5.27181 2.25 2.25 5.27181 2.25 9Z" :stroke="reverseFillColorForTheme" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M9.00428 11.7699V8.5452M9 6.26569V6.21826" :stroke="reverseFillColorForTheme" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
        </g>
    </svg>
</template>

<script lang="ts">
import iconColorMixin from "@/mixins/IconColorMixin.ts";

export default {
    name: "SmartTooltipIcon",
    mixins: [iconColorMixin],
    data() {
        return {}
    }
}
</script>

<style scoped>

</style>