<template>
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path :fill="fillColorForTheme" fill-rule="evenodd" clip-rule="evenodd" d="M10.3536 13.5202C10.5488 13.325 10.5488 13.0084 10.3536 12.8131L6.04047 8.50001L10.3536 4.18687C10.5488 3.99161 10.5488 3.67507 10.3536 3.47981C10.1583 3.28454 9.84171 3.28454 9.64645 3.47981L4.9798 8.14647C4.886 8.24021 4.83333 8.36741 4.83333 8.50001C4.83333 8.63261 4.886 8.75981 4.9798 8.85354L9.64645 13.5202C9.84171 13.7155 10.1583 13.7155 10.3536 13.5202Z" fill="white"/>
    </svg>
</template>

<script>
import IconColorMixin from '@/mixins/IconColorMixin.js';

export default {
    name: "LeftChevronIcon",
    mixins: [IconColorMixin],
    data() {
        return {}
    }
}
</script>

<style scoped>

</style>
