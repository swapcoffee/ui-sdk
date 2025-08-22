<template>
    <button class="add-btn"
        :disabled="disabledButton"
    >
        <AddAssetIcon />
        Add asset {{ getCurrentAsset }}
    </button>
</template>

<script lang="ts">
import AddAssetIcon from "@/assets/multi-swap/AddAssetIcon.vue";
import { useDexStore } from "@/stores/dex";

export default {
    name: "AddAssetButton",
    components: {AddAssetIcon},
    data() {
        return {}
    },
    computed: {
        dexStore() {
         return useDexStore()
        },
        disabledButton() {
            return (this.dexStore.GET_DEX_WALLET_VERSION === 5 && this.dexStore.GET_SEND_MULTI_TOKENS?.size >= 20)
                || ((!this.dexStore.GET_DEX_WALLET || this.dexStore.GET_DEX_WALLET_VERSION === 4) && this.dexStore.GET_SEND_MULTI_TOKENS?.size >= 4)
        },
        getCurrentAsset() {
            return (this.dexStore.GET_SEND_MULTI_TOKENS?.size ?? 0) + 1
        }
    },
    watch: {
		disabledButton: {
			handler() {
				console.log(this.disabledButton)
            }
        }
    }
}
</script>

<style scoped>
    .add-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        height: 40px;
        border-radius: 12px;
        border: none;
        background: var(--iface-white10);
        backdrop-filter: blur(50px);
        font-size: 14px;
        font-family: Harmony-Regular, sans-serif;
        font-weight: 400;
        transition: .2s;
    }

    .add-btn:hover {
        background: var(--iface-white14);
    }

    .add-btn:disabled {
        opacity: 0.6;
        background: var(--iface-white10);
        cursor: not-allowed;
    }

</style>
