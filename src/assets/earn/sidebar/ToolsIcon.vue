<template>
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path :fill="fillColorForTheme" d="M8.9586 10.4999H14.2289C14.6617 10.4999 15.0502 10.2762 15.2676 9.9022C15.4858 9.52821 15.4876 9.07906 15.273 8.70236L12.6551 4.10581C12.4395 3.72729 12.0492 3.50091 11.6137 3.5H11.6101C11.1754 3.5 10.786 3.72458 10.5687 4.10038L7.91632 8.69692C7.69989 9.07272 7.69989 9.52278 7.91722 9.89858C8.13546 10.2753 8.52394 10.4999 8.9586 10.4999Z" fill="white"/>
        <path :fill="fillColorForTheme" d="M13.2214 16.8081C13.2214 18.8438 14.8776 20.5 16.9133 20.5C18.949 20.5 20.6052 18.8438 20.6052 16.8081C20.6052 14.7724 18.949 13.1153 16.9133 13.1153C14.8776 13.1153 13.2214 14.7724 13.2214 16.8081Z" fill="white"/>
        <path :fill="fillColorForTheme" d="M5.45558 20.2763H8.28179C9.49253 20.2763 10.3374 19.397 10.3374 18.1383V15.476C10.3374 14.2173 9.49253 13.3389 8.28179 13.3389H5.45558C4.24577 13.3389 3.39999 14.2173 3.39999 15.476V18.1383C3.39999 19.397 4.24577 20.2763 5.45558 20.2763Z" fill="white"/>
    </svg>
</template>

<script lang="ts">
import IconColorMixin from '@/mixins/IconColorMixin.ts';

export default {
    name: "ToolsIcon",
    mixins: [IconColorMixin],
    data() {
        return {}
    }
}
</script>

<style scoped>

</style>
