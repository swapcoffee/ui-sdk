<template>
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path :fill="computedFillColor" fill-rule="evenodd" clip-rule="evenodd" d="M13.3089 9.16567C13.1899 9.35507 13.3296 9.59798 13.5566 9.59798H20.6009C20.8041 9.59798 20.9459 9.39698 20.8439 9.22486C20.8215 9.18701 20.7977 9.14969 20.7722 9.11301L17.9271 5.02296C17.6289 4.59054 17.1963 4.27877 16.7047 4.12073C16.5859 4.08254 16.4596 4.13484 16.3943 4.2393C15.9627 4.92946 14.3441 7.51687 13.3089 9.16567Z"/>
        <path :fill="computedFillColor" fill-rule="evenodd" clip-rule="evenodd" d="M11.1725 9.59801C11.2732 9.59801 11.3667 9.54685 11.4195 9.46286L14.5812 4.43318C14.7002 4.24386 14.5612 4 14.3343 4H8.04661C7.25774 4 6.52301 4.38267 6.08217 5.02109L3.22929 9.11304C3.20403 9.14948 3.18037 9.1865 3.15807 9.22402C3.05569 9.39633 3.19753 9.59801 3.40102 9.59801H11.1725Z"/>
        <path :fill="computedFillColor" fill-rule="evenodd" clip-rule="evenodd" d="M10.1976 11.0188C10.0013 11.0188 9.8617 11.2059 9.92121 11.3892L12.6551 19.8097C12.7062 19.9669 12.884 20.0502 13.0297 19.9675C13.2036 19.8689 13.3631 19.7454 13.5007 19.5968L20.5638 11.9916C20.7404 11.8023 20.8782 11.5907 20.9786 11.3666C21.055 11.1961 20.9162 11.0188 20.7259 11.0188H10.1976Z"/>
        <path :fill="computedFillColor" fill-rule="evenodd" clip-rule="evenodd" d="M8.34315 11.2169C8.30486 11.099 8.19307 11.0188 8.06677 11.0188H3.27425C3.08375 11.0188 2.94476 11.1966 3.02151 11.3674C3.12185 11.5908 3.25907 11.8016 3.43543 11.9907L10.4985 19.5968C10.5593 19.6626 10.6244 19.7236 10.6931 19.7797C10.8825 19.9344 11.1112 19.7412 11.0365 19.5109L8.34315 11.2169Z"/>
    </svg>
</template>

<script lang="ts">
import IconColorMixin from '@/mixins/IconColorMixin.ts';

export default {
    name: "ClaimIcon",
    mixins: [IconColorMixin],
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
