<template>
    <button class="tab-item">
        <slot></slot>
    </button>
</template>

<script>
export default {
    name: "TabItem",
    data() {
        return {}
    }
}
</script>

<style scoped>
    .tab-item {
        width: 100%;
        background: transparent;
        border: none;
        outline: none;
        border-radius: 8px;
        font-size: 13px;
        line-height: normal;
        transition: .2s;
        opacity: 0.6;
        text-align: center;
    }

    .tab-item:hover {
        opacity: 1;
    }

    .tab-item:disabled {
        opacity: 0.2;
    }

    .active_tab,
    .active_tab:hover,
    .active_tab:disabled {
        opacity: 1;
        background: var(--iface-white6);
    }
</style>
