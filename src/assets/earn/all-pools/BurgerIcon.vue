<template>
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path :fill="fillColorForTheme" fill-rule="evenodd" clip-rule="evenodd" d="M1.80005 5.66998C1.80005 5.32204 2.08211 5.03998 2.43005 5.03998H15.57C15.918 5.03998 16.2 5.32204 16.2 5.66998C16.2 6.01792 15.918 6.29998 15.57 6.29998H2.43005C2.08211 6.29998 1.80005 6.01792 1.80005 5.66998ZM2.43005 11.7C2.08211 11.7 1.80005 11.9821 1.80005 12.33C1.80005 12.6779 2.08211 12.96 2.43005 12.96H15.57C15.918 12.96 16.2 12.6779 16.2 12.33C16.2 11.9821 15.918 11.7 15.57 11.7H2.43005Z" fill="white"/>
    </svg>
</template>

<script>
import IconColorMixin from '@/mixins/IconColorMixin.js';

export default {
    name: "BurgerIcon",
    mixins: [IconColorMixin],
    data() {
        return {}
    }
}
</script>

<style scoped>
</style>
