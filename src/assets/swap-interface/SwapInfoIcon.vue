<template>
    <svg xmlns="http://www.w3.org/2000/svg" width="19" height="18" viewBox="0 0 19 18" fill="none">
        <path d="M2.75 9C2.75 12.7274 5.77181 15.75 9.5 15.75C13.2282 15.75 16.25 12.7274 16.25 9C16.25 5.27181 13.2282 2.25 9.5 2.25C5.77181 2.25 2.75 5.27181 2.75 9Z" :stroke="getColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M9.50428 11.7699V8.5452M9.5 6.26569V6.21826" :stroke="getColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
</template>

<script lang="ts">
export default {
    name: "SwapInfoIcon",
    inject: ['widgetTheme'],
    props: {
        mode: {
            type: String,
            required: true
        }
    },
    computed: {
        getColor(): string {
            if (this.mode === 'swap') {
                return this.widgetTheme === 'light'
                    ? "#ea3943"
                    : "#ff5449"
            } else {
                return this.widgetTheme === 'light'
                    ? "#ffab07"
                    : "#ffcf55"
            }
        }
    }
}
</script>

<style scoped>

</style>
