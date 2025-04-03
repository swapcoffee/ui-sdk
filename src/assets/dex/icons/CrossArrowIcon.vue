<template>
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g id="crossing-directions horizontal right">
            <path :fill="fillColorForTheme" id="Vector" d="M11.4086 9.07417V11.6667H8.81601M11.4076 11.6674L8.2965 8.55635M2.59302 2.85287L6.74115 7.001" stroke="white" stroke-linecap="round" stroke-linejoin="round"/>
            <path :fill="fillColorForTheme" id="Vector_2" d="M8.81485 2.33334H11.4075M11.4075 2.33334V4.92593M11.4075 2.33334L2.59302 11.1482" stroke="white" stroke-linecap="round" stroke-linejoin="round"/>
        </g>
    </svg>
</template>

<script lang="ts">
import IconColorMixin from '@/mixins/IconColorMixin.ts';

export default {
    name: 'CrossArrowIcon',
    mixins: [IconColorMixin],
};
</script>

<style scoped>
</style>
