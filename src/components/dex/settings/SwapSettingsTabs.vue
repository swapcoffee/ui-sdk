<template>
    <div class="tabs">
        <tab-item
            :class="[{ active_tab: smartMode }, 'tab-item']"
            @click="$emit('updateSmartMode', true)"
        >
            <SmartModeIcon />
            Smart mode
        </tab-item>
        <tab-item
            :class="[{ active_tab: !smartMode }, 'tab-item']"
            @click="$emit('updateSmartMode', false)"
        >
            Manual
        </tab-item>
    </div>
</template>

<script lang="ts">
import SmartModeIcon from "@/assets/dex/icons/SmartModeIcon.vue"

export default {
    name: "SwapSettingsTabs",
    components: { SmartModeIcon },
    props: {
        smartMode: {
            type: Boolean,
            required: true
        }
    },
    data() {
        return {}
    },
}
</script>

<style scoped>
    .tabs {
        display: flex;
        margin-bottom: 20px;
        border-radius: 12px;
        border: 1px solid var(--iface-white6);
        padding: 3px;
    }
    
    .tab-item {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        height: 40px;
        border-radius: 9px;
        font-size: 15px;
    }
</style>