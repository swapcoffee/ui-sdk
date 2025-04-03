<template>
    <div class="stake__catalogue-buttons">
        <button
            :class="['catalogue__button', { active__item: modelValue === 'explore' }]"
            @click="updateTab('explore')"
        >
            {{ $t("stakeMenu.explore") }}
        </button>
        <button
            :disabled="!isWalletConnected || !hasWalletData"
            :class="['catalogue__button', { active__item: modelValue === 'myStakes' }]"
            @click="updateTab('myStakes')"
        >
            {{ $t("stakeMenu.stakes") }}
        </button>
    </div>
</template>

<script>
export default {
    name: 'StakingTabs',
    props: {
        modelValue: {
            type: String,
            required: true
        },
        isWalletConnected: {
            type: Boolean,
            default: false
        },
        hasWalletData: {
            type: Boolean,
            default: false
        }
    },
    methods: {
        updateTab(tab) {
            this.$emit('update:modelValue', tab)
        }
    }
}
</script>

<style scoped>
.stake__catalogue-buttons {
    width: fit-content;
    height: 40px;
    display: flex;
    padding: 3px;
    align-items: flex-start;
    gap: 3px;
    border-radius: 12px;
    background: var(--iface-white4);
}

.catalogue__button {
    font-family: Harmony-Regular, sans-serif;
    height: 34px;
    display: flex;
    padding: 0 16px;
    border-radius: 6px;
    justify-content: center;
    align-items: center;
    opacity: 0.6;
    border: none;
    outline: none;
    background: transparent;
    font-weight: 500;
    font-size: 14px;
    color: var(--main-text-color);
    transition: 0.2s all;
}

.catalogue__button:disabled {
    cursor: not-allowed;
    opacity: 0.2;
}

.active__item {
    opacity: 1;
    border-radius: 10px;
    background: var(--iface-white10);
}

@media screen and (max-width: 576px) {
    .stake__catalogue-buttons {
        width: 100%;
    }

    .catalogue__button {
        flex: 1;
        padding: 0;
    }
}
</style>
