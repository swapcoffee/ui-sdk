<template>
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path :fill="fillColorForTheme" fill-rule="evenodd" clip-rule="evenodd" d="M12.4365 11.2374C12.4365 11.4169 12.5827 11.564 12.7631 11.564H20.7191C20.8815 11.564 21.0115 11.4278 20.9987 11.2659C20.6507 6.86438 17.1361 3.34971 12.7347 3.00088C12.5727 2.98804 12.4365 3.11801 12.4365 3.28048V11.2374Z" fill="white"/>
        <path :fill="fillColorForTheme" fill-rule="evenodd" clip-rule="evenodd" d="M12.7629 12.9879C11.7973 12.9879 11.0121 12.2027 11.0121 11.2371V3.33933C11.0121 3.1695 10.864 3.03708 10.696 3.06191C6.3485 3.70457 3 7.45738 3 11.9805C3 16.9545 7.04642 21 12.0195 21C16.5427 21 20.2955 17.6515 20.9381 13.304C20.963 13.136 20.8305 12.9879 20.6607 12.9879H12.7629Z" fill="white"/>
    </svg>
</template>

<script>
import IconColorMixin from '@/mixins/IconColorMixin.js';

export default {
    name: "PortfolioIcon",
    mixins: [IconColorMixin],
    data() {
        return {}
    }
}
</script>

<style scoped>
</style>
