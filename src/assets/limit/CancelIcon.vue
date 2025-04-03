<template>
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
        <g>
            <path :fill="fillColorForTheme" d="M5 5L15 15" stroke="#EA3943" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
            <path :fill="fillColorForTheme" d="M15 5L5 15" stroke="#EA3943" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
        </g>
    </svg>
</template>

<script>
import IconColorMixin from '@/mixins/IconColorMixin.js';

export default {
    name: "CancelIcon",
    mixins: [IconColorMixin],
    data() {
        return {}
    }
}
</script>

<style scoped>

</style>
