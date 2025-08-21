<template>
    <div class="info">
        <h4 class="info__title">{{ title }}</h4>
        <p class="info__text">{{ text }}</p>
    </div>
</template>

<script lang="ts">
export default {
    name: "SwapInfo",
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
    }
}
</script>

<style scoped>
    .info{
        border: 1px solid var(--iface-white6);
        border-radius: 8px;
        padding: 12px;
    }

    .info__title {
        font-size: 14px;
        margin-bottom: 8px;
        text-align: center;
        color: var(--main-yellow);
    }

    .info__text {
        font-size: 13px;
        line-height: normal;
        text-align: center;
    }
</style>
