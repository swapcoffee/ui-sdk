<template>
    <div class="settings additional-item">
        <p class="additional-item__title">
            {{ title }}
        </p>
        
        <p class="additional-item__description"
            v-for="(text, index) in textList"
           :key="index"
        >
            {{ text }}
        </p>
    </div>
</template>

<script lang="ts">
export default {
    name: "ModalSettingsAdditionalInfo",
    props: {
        title: {
            type: String,
            required: true,
        },
        textList: {
            type: Array,
            required: true,
        },
    },
    data() {
        return {}
    }
}
</script>

<style scoped>

.additional-item__title {
    font-size: 15px;
    font-weight: 500;
    font-family: Harmony-Medium, sans-serif;
    margin-bottom: 4px;
}

.additional-item__description {
    font-size: 14px;
    opacity: 0.4;
    font-weight: 400;
    margin-bottom: 4px;
    line-height: 16px;
}
</style>