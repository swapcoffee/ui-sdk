<template>
    <div class="btn-wrapper">
        <button
            class="main-button"
            :class="{padding_large: !canTokenChange}"
            @click.stop="handleTokenClick"
        >
            <img :src="token?.image" alt="" class="token-img" @error="imageError" v-if="token?.image !== 'null'">
            <img
              src="@/assets/dex/default.svg"
              alt="token without logo"
              class="item__image"
              @error="imageError"
              v-else
          >
            {{ token?.symbol }}
            <ChevronRightIcon
                v-if="canTokenChange"
                class="btn-icon"
            />
        </button>
        <button class="remove-btn"
                v-if="removeCondition"
                @click.stop="handleRemoveToken"
        >
            <RemoveTokenIcon />
        </button>
    </div>
</template>

<script lang="ts">
import ChevronRightIcon from '@/assets/earn/pool-page/ChevronRightIcon.vue';
import RemoveTokenIcon from '@/assets/multi-swap/RemoveTokenIcon.vue';
import { useDexStore } from '@/stores/dex/index.ts';
import { SwapActiveTab } from '@/utils/types.ts';
import methodsMixins from '@/mixins/methodsMixins.ts';

export default {
    name: "SwapTokenButton",
    mixins: [methodsMixins],
    components: {
        RemoveTokenIcon,
        ChevronRightIcon,
    },
    inject: {
        updateTokenModalVisible: {
            from: 'updateTokenModalVisible',
            default: () => () => {}
        },
        removeTokenAsset: {
            from: 'removeTokenAsset', 
            default: () => () => {}
        }
    },
    props: {
        token: {
            type: Object,
            required: true,
        },
        canTokenChange: {
            type: Boolean,
            required: true
        },
        assetKey: {
            type: String,
            required: true,
        }
    },
    data() {
        return {}
    },
    computed: {
        dexStore() {
            return useDexStore();
        },
        removeCondition() {
            return this.dexStore.GET_SEND_ASSET_KEYS.includes(this.assetKey)
                && this.dexStore.GET_SWAP_ACTIVE_TAB === SwapActiveTab.Multi
                && this.dexStore.GET_SEND_MULTI_TOKENS && this.dexStore.GET_SEND_MULTI_TOKENS.size > 1
        }
    },
    methods: {
        handleTokenClick() {
            if (this.updateTokenModalVisible) {
                this.updateTokenModalVisible(this.assetKey, 'tokens-list');
            }
        },
        handleRemoveToken() {
            if (this.removeTokenAsset) {
                this.removeTokenAsset(this.assetKey);
            }
        }
    }
}
</script>

<style scoped>
.btn-wrapper {
    display: flex;
    align-items: center;
    background: var(--earn-bg);
    border-radius: 100px;
    gap: 6px;
}

.main-button {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px;
    border-radius: 100px;
    border: none;
    white-space: nowrap;
    text-overflow: ellipsis;
    background: var(--iface-white20);
    font-size: 16px;
    font-weight: 500;
    line-height: normal;
    transition: .2s;
}

.main-button:hover {
    background: var(--iface-white24);
}

.padding_large {
    padding: 6px 12px 6px 6px;
}

.token-img {
    width: 24px;
    height: 24px;
    border-radius: 100px;
}

.btn-icon {
    width: 20px;
    height: 20px;
}

.remove-btn {
    padding-right: 8px;
    height: 36px;
    display: flex;
    align-items: center;
    background: transparent;
    border: none;
    outline: none;
}
</style>
