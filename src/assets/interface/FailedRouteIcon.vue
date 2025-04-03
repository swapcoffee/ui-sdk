<template>
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path :fill="fillColorForTheme" fill-rule="evenodd" clip-rule="evenodd" d="M12 16.469C11.586 16.469 11.25 16.157 11.25 15.742V15.695C11.25 15.281 11.586 14.945 12 14.945C12.414 14.945 12.75 15.281 12.75 15.695C12.75 16.109 12.414 16.469 12 16.469ZM11.246 8.308C11.246 7.894 11.582 7.558 11.996 7.558C12.41 7.558 12.746 7.894 12.746 8.308V12.607C12.746 13.021 12.41 13.357 11.996 13.357C11.582 13.357 11.246 13.021 11.246 12.607V8.308ZM12 2.5C6.762 2.5 2.5 6.762 2.5 12C2.5 17.239 6.762 21.5 12 21.5C17.238 21.5 21.5 17.239 21.5 12C21.5 6.762 17.238 2.5 12 2.5Z" fill="#EA3943"/>
    </svg>
</template>

<script lang="ts">
import IconColorMixin from '@/mixins/IconColorMixin.ts';

export default {
    name: "FailedRouteIcon",
    mixins: [IconColorMixin],
    data() {
        return {}
    }
}
</script>

<style scoped>
</style>
