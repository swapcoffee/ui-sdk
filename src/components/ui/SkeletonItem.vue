<template>
    <div class="skeleton"
        :style="{borderRadius: `${borderRadius}px`}"
    >

    </div>
</template>

<script>
export default {
    name: "SkeletonItem",
    props: {
        borderRadius: {
            type: Number,
            default() {
                return 10
            }
        }
    },
    data() {
        return {}
    }
}
</script>

<style scoped>
    .skeleton {
        overflow: hidden;
    }
</style>
