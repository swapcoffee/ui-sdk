<template>
    <button class="setting__button">
        {{ value }}
    </button>
</template>

<script lang="ts">
export default {
    name: "ModalSettingsButton",
    props: {
        value: {
            type: Number,
            required: true,
        },
    },
    data() {
        return {}
    },
}
</script>

<style scoped>
    .setting__button {
        width: 100%;
        height: 40px;
        padding: 10px 12px;
        border: 1px solid var(--iface-white10);
        border-radius: 12px;
        outline: none;
        background: transparent;
        font-size: 14px;
        line-height: normal;
        transition: .2s;
        color: var(--iface-white40);
    }

    .setting__button:hover {
        border: 1px solid var(--iface-white20);
        color: rgba(255, 255, 255, 0.8);
    }

    .active_btn,
    .active_btn:hover {
        border: 1px solid var(--iface-accent-color);
        color: var(--iface-accent-color);
    }

</style>
