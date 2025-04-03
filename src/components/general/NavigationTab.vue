<template>
    <button
        class="navigation-tab"
    >
<!--        :class="{ active: getRouteName === 'Dex' }"-->
        {{ text }}
    </button>
</template>

<script>
export default {
    name: "NavigationTab",
    props: {
        text: {
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
.navigation-tab {
    position: relative;
    transition: 0.2s;
    height: 36px;
    padding: 10px;
    border-radius: 14px;
    border: none;
    letter-spacing: 0.1px;
    font-weight: 500;
    outline: none;
    background: var(--iface-white6);
    font-size: 13px;
    line-height: 16px;
    opacity: 0.6;
}

.navigation-tab:hover {
    opacity: 1;
}

.navigation-tab::after {
    content: '';
    position: absolute;
    left: 50%;
    bottom: 0;
    transform: translateX(-50%);
    width: 45%;
    height: 3px;
    background-color: transparent;
    border-radius: 2px 2px 0 0;
    transition: 0.2s;
}

.navigation-tab.active::after {
    background-color: var(--iface-accent-color);
}

.active {
    opacity: 1;
}

.navigation-tab:disabled {
    opacity: 0.3;
    pointer-events: none;
    cursor: not-allowed;
}
</style>
