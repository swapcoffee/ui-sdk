<template>
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="17" viewBox="0 0 16 17" fill="none">
        <path :fill="fillColorForTheme" fill-rule="evenodd" clip-rule="evenodd" d="M10.3536 13.5203C10.5488 13.325 10.5488 13.0085 10.3536 12.8132L6.04047 8.50008L10.3536 4.18695C10.5488 3.99168 10.5488 3.67515 10.3536 3.47988C10.1583 3.28462 9.84171 3.28462 9.64645 3.47988L4.9798 8.14655C4.886 8.24028 4.83333 8.36748 4.83333 8.50008C4.83333 8.63268 4.886 8.75988 4.9798 8.85362L9.64645 13.5203C9.84171 13.7156 10.1583 13.7156 10.3536 13.5203Z" fill="white"/>
    </svg>
</template>

<script lang="ts">
import IconColorMixin from '@/mixins/IconColorMixin.ts';

export default {
    name: "ChevronLeftIcon",
    mixins: [IconColorMixin],
    data() {
        return {}
    }
}
</script>

<style scoped>
</style>
