<template>
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path  :fill="fillColorForTheme" d="M4 4L12 12" :stroke="fillColorForTheme" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        <path  :fill="fillColorForTheme" d="M12 4L4 12" :stroke="fillColorForTheme" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
</template>

<script>
import IconColorMixin from '@/mixins/IconColorMixin.ts';

export default {
    name: "CloseIcon",
    mixins: [IconColorMixin],
    data() {
        return {}
    }
}
</script>

<style scoped>

</style>
