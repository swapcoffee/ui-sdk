<template>
    <ul class="custom-select" v-click-outside="closeSelect">
        <li class="custom-select__item"
            v-for="(item, index) in selectList"
            :key="index"
            @click="$emit('updateSelect', item)"
        >
            {{ $t(`timeZone.${item}`) }}
        </li>
    </ul>
</template>

<script lang="ts">
export default {
    name: "CustomSelect",
    props: {
        selectList: {
            type: Array,
            default() {
                return []
            }
        }
    },
    data() {
        return {}
    },
    methods: {
        closeSelect() {
            this.$emit('closeSelect')
        }
    }
}
</script>

<style scoped>
    .custom-select {
        min-width: 160px;
        top: 40px;
        right: 0;
        position: absolute;
        z-index: 100;
        border-radius: 10px;
        background: rgba(255, 255, 255, 0.10);
        box-shadow: 0px 4px 30px 0px rgba(0, 0, 0, 0.15);
        backdrop-filter: blur(40px);
        -webkit-backdrop-filter: blur(40px);
    }

    .custom-select__item {
        font-size: 14px;
        padding: 10px 12px;
        cursor: pointer;
    }

    .custom-select__item:not(:last-child) {
        border-bottom: 1px solid var(--iface-white6);
    }
</style>
