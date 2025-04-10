<template>
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path :stroke="fillColorForTheme"  d="M9.00737 14.2896H3.45093" stroke="white" stroke-width="1.29231" stroke-linecap="round" stroke-linejoin="round"/>
        <path :stroke="fillColorForTheme"  d="M10.9631 5.70459H16.5195" stroke="white" stroke-width="1.29231" stroke-linecap="round" stroke-linejoin="round"/>
        <path :stroke="fillColorForTheme"  fill-rule="evenodd" clip-rule="evenodd" d="M7.41602 5.61346C7.41602 6.81557 6.441 7.79088 5.23943 7.79088C4.03703 7.79088 3.06201 6.81557 3.06201 5.61346C3.06201 4.41134 4.03703 3.43604 5.23943 3.43604C6.441 3.43604 7.41602 4.41134 7.41602 5.61346Z" stroke="white" stroke-width="1.29231" stroke-linecap="round" stroke-linejoin="round"/>
        <path :stroke="fillColorForTheme" fill-rule="evenodd" clip-rule="evenodd" d="M12.554 14.3874C12.554 13.1853 13.5281 12.21 14.7306 12.21C15.933 12.21 16.908 13.1853 16.908 14.3874C16.908 15.5896 15.933 16.5649 14.7306 16.5649C13.5281 16.5649 12.554 15.5896 12.554 14.3874Z" stroke="white" stroke-width="1.29231" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
</template>

<script lang="ts">
import IconColorMixin from '@/mixins/IconColorMixin.ts';

export default {
    name: "SettingsIcon",
    mixins: [IconColorMixin],
    data() {
        return {}
    }
}
</script>
