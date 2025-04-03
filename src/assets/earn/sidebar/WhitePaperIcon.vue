<template>
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="25" viewBox="0 0 24 25" fill="none">
        <path :fill="fillColorForTheme" fill-rule="evenodd" clip-rule="evenodd" d="M18.7151 8.50975C17.9971 8.51252 17.1506 8.50975 16.5413 8.50329C15.5753 8.50329 14.7795 7.68326 14.7795 6.68777V4.31541C14.7795 3.92756 15.2367 3.73548 15.4974 4.01529C15.97 4.52134 16.6201 5.21855 17.2674 5.91114C17.912 6.60189 18.5539 7.28986 19.0147 7.78391C19.27 8.05633 19.0826 8.50883 18.7151 8.50975ZM19.1071 9.81829C19.3253 9.81829 19.5 9.99836 19.5 10.2228V17.459C19.5 19.691 17.7445 21.5 15.5689 21.5H8.6239C6.35236 21.5 4.5 19.6014 4.5 17.2613V7.55951C4.5 5.32752 6.26545 3.5 8.44012 3.5H13.1055C13.3327 3.5 13.5074 3.68931 13.5074 3.91463V6.81244C13.5074 8.45896 14.8265 9.80905 16.4254 9.81829H19.1071Z" fill="white"/>
    </svg>
</template>

<script lang="ts">
import IconColorMixin from '@/mixins/IconColorMixin.ts';

export default {
    name: "WhitePaperIcon",
    mixins: [IconColorMixin],
    data() {
        return {}
    }
}
</script>

<style scoped>

</style>
