<template>
    <div class="plug">
        <div class="plug__icon-wrapper">
            <SwapCoffeeDarkIcon :custom-class="'plug__swap-logo'"/>
        </div>
        <div class="plug__info">
            <h4 class="plug__title">{{ title }}</h4>
            <p class="plug__text">{{ firstText }}</p>
            <p class="plug__text">{{ secondText }}</p>
        </div>
    </div>
</template>

<script>
import SwapCoffeeDarkIcon from "@/assets/limit/SwapCoffeeDarkIcon.vue";

export default {
    name: "SwapInterfacePlug",
    components: {SwapCoffeeDarkIcon},
    props: {
        title: {
            type: String,
            default() {
                return ''
            }
        },
        firstText: {
            type: String,
            default() {
                return ''
            }
        },
        secondText: {
            type: String,
            default() {
                return ''
            }
        },
    },
    data() {
        return {}
    }
}
</script>

<style scoped>
.plug {
    position: absolute;
    z-index: 50;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    border-radius: 12px;
    background: rgba(21, 21, 21, 0.80);
    backdrop-filter: blur(10px);
    padding: 14px;
}

.theme-light .plug {
    background-color: rgba(255, 255, 255, 0.8);
}

.plug__icon-wrapper {
    display: flex;
    margin-bottom: 24px;
    padding: 12.5px;
    border-radius: 28px;
    border: 1px solid var(--iface-white10);
}

.plug__swap-logo {
    width: 75px;
    height: 75px;
}

.theme-light .plug__swap-logo {
    filter: brightness(.2) contrast(1.5);
}

.plug__info {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
}

.plug__title {
    font-size: 18px;
    line-height: normal;
    font-weight: 500;
}

.plug__text {
    font-size: 14px;
    line-height: normal;
    text-align: center;
    white-space: pre-wrap;
    opacity: 0.8;
}
</style>
