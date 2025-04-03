<template>
    <div class="dex__row">
        <p class="dex__name">
            {{ title }}
        </p>
        <p class="dex__value"
            :style="{color: textColor}"
        >
            {{ text }}
        </p>
    </div>
</template>

<script>
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
            required: true
        }
    },
    data() {
        return {}
    }
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

.red-impact {
    color: var(--main-red);
}

.yellow-impact {
    color: var(--main-yellow);
}

.green-impact {
    color: var(--main-green);
}

.dex__value {
    font-size: 14px;
    letter-spacing: 0.25px;
    line-height: 18px;
}
</style>
