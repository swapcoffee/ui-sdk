<template>
    <div class="dex__row">
        <p class="dex__name">
            {{ title }}
        </p>
        <p class="dex__value"
            :class="computedTextColor"
        >
            {{ text }}
        </p>
    </div>
</template>

<script lang="ts">
export default {
    name: "DetailsItem",
    props: {
        title: {
            type: String,
            required: true
        },
        text: {
            type: String,
            required: true
        },
        textColor: {
            type: String,
            default: ''
        }
    },
    data() {
        return {}
    },
    computed: {
        computedTextColor() {
            return this.textColor;
        }
    },
}
</script>

<style scoped>
.dex__row {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.dex__name {
    font-size: 14px;
    opacity: 0.5;
    letter-spacing: 0.25px;
    line-height: 18px;
}

.theme-light svg path {
    fill: #141414;
}

:global(.red-impact) {
    color: var(--main-red) !important;
}

:global(.yellow-impact) {
    color: var(--main-yellow) !important;
}

:global(.green-impact) {
    color: var(--main-green) !important;
}

.dex__value {
    font-size: 14px;
    letter-spacing: 0.25px;
    line-height: 18px;
}
</style>
