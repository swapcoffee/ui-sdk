<template>
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path :fill="computedFillColor" fill-rule="evenodd" clip-rule="evenodd" d="M6.35225 14.6477C6.13258 14.4281 6.13258 14.0719 6.35225 13.8523L11.2045 9L6.35225 4.14773C6.13258 3.92805 6.13258 3.57195 6.35225 3.35228C6.57192 3.1326 6.92808 3.1326 7.14774 3.35228L12.3977 8.60228C12.5032 8.70773 12.5625 8.85083 12.5625 9C12.5625 9.14918 12.5032 9.29228 12.3977 9.39773L7.14775 14.6477C6.92808 14.8674 6.57192 14.8674 6.35225 14.6477Z"/>
    </svg>
</template>

<script>
import IconColorMixin from '@/mixins/IconColorMixin.js';

export default {
    name: "RightChevronIcon",
    mixins: [IconColorMixin],
    data() {
        return {}
    },
    props: {
        isWhite: {
            type: Boolean,
            default: false
        }
    },
    computed: {
        computedFillColor() {
            return this.isWhite ? 'white' : this.fillColorForTheme;
        }
    }
}
</script>

<style scoped>

</style>
