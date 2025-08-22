<template>
    <div class="info">
        <p class="info__title">{{ $t("smart.isActivated", {"mode": "Smart Mode"}) }}</p>
        <p class="info__text">{{ $t("smart.desc") }}</p>
    </div>
</template>

<script lang="ts">
export default {
    name: "SmartModeInfo",
    data() {
        return {}
    }
}
</script>

<style scoped>
    .info {
        margin-top: 20px;
        padding: 14px;
        border: 1px solid var(--iface-white6);
        border-radius: 14px;
        background:
            linear-gradient(var(--modal-bg), var(--modal-bg)) padding-box,
            linear-gradient(var(--angle), rgba(211, 190, 178, 0.1), rgba(211, 190, 178, 0.1), rgba(211, 190, 178, 1))
            border-box;
        animation: 5s snake linear infinite;
    }
    
    .theme-light .info {
        border: 1px solid rgba(35, 39, 57, 0.1);
        background:
            linear-gradient(var(--modal-bg), var(--modal-bg)) padding-box,
            linear-gradient(var(--angle), rgba(35, 39, 57, 0.1), rgba(35, 39, 57, 0.1), rgba(35, 39, 57, 1)) border-box;
    }
    
    .info__title {
        margin-bottom: 8px;
        font-size: 16px;
        font-family: Harmony-Medium, sans-serif;
        text-align: center;
    }
    
    .info__text {
        font-size: 14px;
        opacity: 0.4;
        text-align: center;
    }
    
    @keyframes snake {
        to {
            --angle: 360deg;
        }
    }
    
    @property --angle {
        syntax: "<angle>";
        initial-value: 0deg;
        inherits: false;
    }
</style>