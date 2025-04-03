<template>
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="25" viewBox="0 0 24 25" fill="none">
        <path :fill="fillColorForTheme" fill-rule="evenodd" clip-rule="evenodd" d="M8.92844 20.4991C8.37644 20.4991 7.92844 20.0465 7.92844 19.4888V7.48853L4.58644 9.93243C4.13844 10.2608 3.51244 10.1587 3.18944 9.70613C2.86644 9.25453 2.96644 8.62309 3.41344 8.29576L8.34244 4.69204C8.64644 4.46876 9.05044 4.43845 9.38344 4.6102C9.71844 4.78296 9.92844 5.13151 9.92844 5.51038V19.4888C9.92844 20.0465 9.48044 20.4991 8.92844 20.4991Z" fill="white"/>
        <path :fill="fillColorForTheme" fill-rule="evenodd" clip-rule="evenodd" d="M15.0701 20.5C14.9151 20.5 14.7591 20.4636 14.6151 20.3899C14.2801 20.2171 14.0701 19.8696 14.0701 19.4897V5.51029C14.0701 4.95261 14.5181 4.5 15.0701 4.5C15.6221 4.5 16.0701 4.95261 16.0701 5.51029V17.5115L19.4121 15.0656C19.8601 14.7383 20.4851 14.8393 20.8091 15.2919C21.1321 15.7435 21.0321 16.375 20.5851 16.7023L15.6561 20.308C15.4831 20.4353 15.2771 20.5 15.0701 20.5Z" fill="white"/>
    </svg>
</template>

<script>
import IconColorMixin from '@/mixins/IconColorMixin.js';

export default {
    name: "DexIcon",
    mixins: [IconColorMixin],
    data() {
        return {}
    }
}
</script>

<style scoped>
</style>
