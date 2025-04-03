<template>
    <button class="empty">
        {{ $t("dexInterface.selectToken") }}
        <ChevronRightIcon />
    </button>
</template>

<script>
import ChevronRightIcon from "@/assets/earn/pool-page/ChevronRightIcon.vue";

export default {
    name: "SwapEmpty",
    components: {ChevronRightIcon},
    data() {
        return {}
    }
}
</script>

<style scoped>
.empty {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 6px;
    padding: 12px;
    background: var(--iface-white3);
    transition: .2s;
    height: 124px;
    border-radius: 0 0 8px 8px;
    outline: none;
    border: none;
    font-size: 16px;
    font-weight: 500;
    line-height: normal;
}

.empty:hover {
    background: var(--iface-white6);
}

.empty:active {
    background: var(--iface-white6);
}

</style>
