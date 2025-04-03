<template>
    <div class="details-item">
        <p class="details-item__title">{{ title }}</p>
        <p class="details-item__text">{{ text }}</p>
    </div>
</template>

<script>
export default {
    name: "LimitDetailsItem",
    props: {
        title: {
            type: String,
            default() {
                return ''
            }
        },
        text: {
            type: String,
            default() {
                return ''
            }
        }
    },
    data() {
        return {}
    },
}
</script>

<style scoped>
    .details-item {
        flex: 50%;
    }

    .details-item__title {
        font-size: 13px;
        line-height: 15px;
        opacity: 0.4;
        margin-bottom: 2px;
    }

    .details-item__text {
        font-size: 13px;
        line-height: 15px;
    }
</style>
