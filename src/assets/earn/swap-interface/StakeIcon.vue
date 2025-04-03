<template>
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path :fill="fillColorForTheme" fill-rule="evenodd" clip-rule="evenodd" d="M16.8183 2.6875H7.18272C4.87282 2.6875 3 4.56032 3 6.87022V14.3046C3 16.6145 4.87282 18.4864 7.18272 18.4864H16.8173C19.1282 18.4864 21 16.6136 21 14.3037V6.87022C21 4.56032 19.1282 2.6875 16.8183 2.6875Z" stroke="#181413" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
        <path :fill="fillColorForTheme" d="M18.3683 20.8181H16.1055" stroke="#181413" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
        <path :fill="fillColorForTheme" d="M7.89665 20.8181H5.63379" stroke="#181413" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
        <path :fill="fillColorForTheme" d="M14.4121 7.36719V8.44129" stroke="#181413" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
        <path :fill="fillColorForTheme" d="M14.4121 12.7344V13.8085" stroke="#181413" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
        <path :fill="fillColorForTheme" d="M11.6191 8.97931L12.5462 9.51636" stroke="#181413" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
        <path :fill="fillColorForTheme" d="M16.2754 11.6629L17.2025 12.1999" stroke="#181413" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
        <path :fill="fillColorForTheme" d="M11.6191 12.1999L12.5462 11.6629" stroke="#181413" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
        <path :fill="fillColorForTheme" d="M16.2754 9.51636L17.2025 8.97931" stroke="#181413" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
        <path :fill="fillColorForTheme" d="M15.9302 9.06594C16.7691 9.90483 16.7691 11.2651 15.9302 12.104C15.0913 12.9429 13.732 12.9429 12.8931 12.104C12.0552 11.2651 12.0552 9.90483 12.8931 9.06594C13.732 8.22802 15.0913 8.22802 15.9302 9.06594Z" stroke="#181413" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
        <path :fill="fillColorForTheme" d="M8.30021 7.375H7.91017C7.29667 7.375 6.7998 7.87187 6.7998 8.48536V12.6887C6.7998 13.3012 7.29667 13.799 7.91017 13.799H8.30021" stroke="#181413" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
</template>

<script lang="ts">
import IconColorMixin from '@/mixins/IconColorMixin.ts';

export default {
    name: "StakeIcon",
    mixins: [IconColorMixin],
    data() {
        return {}
    }
}
</script>

<style scoped>

</style>
