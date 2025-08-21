<template>
    <div class="item">
        <div class="item__group">
            <div class="item__icon-wrapper">
                <img :src="item?.icon" alt="" class="item__icon">
            </div>
            <p class="item__name">{{ item?.name }}</p>
        </div>
        <switch-toggle
            :class="['item__toggle', { active_switch: item?.enabled }]"
            @click="$emit('toggle', item.id)"
        />
    </div>
</template>

<script lang="ts">

export default {
    name: "SourceItem",
    props: {
        item: {
            type: Object,
            required: true
        }
    },
    data() {
        return {}
    },
}
</script>

<style scoped>
.item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 0;
}

.item:not(:last-child) {
    border-bottom: 1px solid var(--iface-white6);
}

.item__name {
    font-size: 16px;
    line-height: 19px;
    font-family: Harmony-Medium, sans-serif;
    font-weight: 500;
}

.item__group {
    display: flex;
    align-items: center;
    gap: 10px;
}

.item__icon-wrapper {
    width: 28px;
    height: 28px;
    border-radius: 100px;
    overflow: hidden;
}

.item__icon {
    width: 28px;
    height: 28px;
}

.item__toggle {
    transition: .15s all linear;
}

.item__name {
    font-family: Harmony-Medium, sans-serif;
}
</style>
