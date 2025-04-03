<template>
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="25" viewBox="0 0 24 25" fill="none">
        <path :fill="fillColorForTheme" fill-rule="evenodd" clip-rule="evenodd" d="M20.3037 10.9077L15.4797 8.65579C15.4191 8.62642 15.3726 8.58094 15.3489 8.53168L13.0952 3.70105C12.8943 3.26905 12.4746 3 12 3C11.5254 3 11.1066 3.26905 10.9058 3.70105L8.65674 8.5241C8.62926 8.58 8.58095 8.62737 8.526 8.65294L3.69632 10.9086C3.26716 11.1104 3 11.5282 3 12C3 12.4718 3.26716 12.8905 3.69726 13.0933L8.52221 15.3461C8.5819 15.3736 8.62926 15.421 8.65295 15.4683L10.9058 20.2999C11.1066 20.7319 11.5263 21 12 21C12.4737 21 12.8943 20.7319 13.0952 20.2999L15.3461 15.474C15.3726 15.42 15.42 15.3745 15.4749 15.348L20.3046 13.0923C20.7338 12.8905 21 12.4718 21 12C21 11.5282 20.7338 11.1104 20.3037 10.9077Z" fill="white"/>
    </svg>
</template>

<script>
import IconColorMixin from '@/mixins/IconColorMixin.js';

export default {
    name: "EarnIcon",
    mixins: [IconColorMixin],
    data() {
        return {}
    }
}
</script>

<style scoped>
</style>
