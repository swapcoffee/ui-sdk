<template>
    <div class="controller">
        <div class="controller__unit"
             v-for="([key, token], index) in dexStore.GET_SEND_MULTI_TOKENS"
             :key="key"
        >
            <SwapField
                :title="getFirstTitle(index + 1)"
                :position="key === 'first' ? 'up' : 'middle'"
                :token="token"
                :assetKey="key"
                :routeInfo="routeInfo"
                @openTokenModal="updateTokenModalVisible(key)"
            />
            <button class="fields__swap-btn"
                    v-if="index + 1 === dexStore.GET_SEND_MULTI_TOKENS?.size"
                    :disabled="dexStore.GET_SEND_MULTI_TOKENS?.size > 1"
                    @click="swapPositions(key)"
            >
                <SwitchTokenIcon class="icon"/>
            </button>
            <div class="fields__without-switch"
                 v-else
            >
                <DisabledSwitch />
            </div>
        </div>
        <SwapField
            :title="getSecondTitle"
            :position="'down'"
            :token="dexStore.GET_RECEIVE_MULTI_TOKEN"
            :assetKey="'receive'"
            :routeInfo="routeInfo"
            @openTokenModal="updateTokenModalVisible('RECEIVE')"
        />
    </div>
</template>

<script lang="ts">
import DisabledSwitch from "@/assets/swap-interface/DisabledSwitch.vue";
import SwapField from "@/components/swap-interface/SwapField.vue";
import SwitchTokenIcon from "@/assets/swap-interface/SwitchTokenIcon.vue";
import {useDexStore} from "@/stores/dex";

export default {
    name: "MultiSwapController",
    components: {SwitchTokenIcon, SwapField, DisabledSwitch},
    inject: ['updateTokenModalVisible', 'swapPositions'],
    props: {
        routeInfo: {
            type: [Object, null],
            default() {
                return {}
            },
            required: true
        },
    },
    data() {
        return {}
    },
    computed: {
        dexStore() {
          return useDexStore()
        },
        getSecondTitle() {
            return this.$t("dexInterface.youReceive")
        },
    },
    methods: {
        getFirstTitle(number) {
            return this.$t('swapPlug.assetByNumber', {number: number})
        },
    }
}
</script>

<style scoped>
.controller {
    display: flex;
    flex-direction: column;
    gap: 1px;
}

.controller__unit {
    position: relative;
}

.fields__swap-btn {
    position: absolute;
    z-index: 10;
    left: 50%;
    bottom: 0px;
    display: flex;
    align-items: center;
    justify-content: center;
    transform: translateX(-50%) translateY(50%);
    width: 36px;
    height: 36px;
    border: none;
    border-radius: 100%;
    background: var(--iface-white10);
    backdrop-filter: blur(20px);
}

.fields__swap-btn:hover {
    background: var(--iface-white14);
}


.fields__swap-btn:disabled {
    background: var(--earn-bg);
}

.icon {
    transition: .15s ease;
}

.fields__swap-btn:hover .icon {
    transform: rotate(180deg);
}

.fields__swap-btn:disabled .icon {
    transform: rotate(0deg);
}

.theme-light .icon {
    filter: invert(1);
}

.fields__without-switch {
    position: absolute;
    z-index: 10;
    left: 50%;
    bottom: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    transform: translateX(-50%) translateY(50%);
    width: 36px;
    height: 36px;
    border-radius: 100%;
    background: var(--earn-bg);
    backdrop-filter: blur(20px);
}
</style>
