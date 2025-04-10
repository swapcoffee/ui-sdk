<template>
    <div
        :class="[{small_padding: showMore}, position, 'field']"
    >
        <div class="field__preview">
            <p class="field__text">{{ $t('limitSubordersField.text') }}</p>
            <button class="field__button"
                    @click="toggleSuborders"
            >
                {{ getBtnText }}
            </button>
        </div>
        <SettingsInput
            v-if="limitSettingsStore.GET_LIMIT_ENABLE_SUBORDERS"
            :class="{default_value: checkDefaultOrderValue}"
            :label-name="'Sub-orders'"
            :min-value="1"
            :max-value="255"
            :model-value="maxSuborders"
            @update:model-value="updateOrders"
        />
<!--        <label for="" class="field__label label"-->
<!--            v-if="showMore"-->
<!--        >-->
<!--            <input-->
<!--                type="text"-->
<!--                class="field__input"-->
<!--                :placeholder="GET_LIMIT_SUBORDERS"-->
<!--                v-model="maxSuborders"-->
<!--                inputmode="numeric"-->
<!--                autocomplete="off"-->
<!--                @input="changeInput"-->
<!--                @focus="onFocus"-->
<!--                @blur="onBlur"-->
<!--            >-->
<!--            <p class="label__text">Sub-orders</p>-->
<!--        </label>-->
    </div>
</template>

<script lang="ts">
import SettingsInput from "@/components/general/SettingsInput.vue";

import {useLimitSettingsStore} from "@/stores/limit/settings.ts";

export default {
    name: "LimitSubordersField",
    components: {SettingsInput},
    props: {
        position: {
            type: String,
            default() {
                return ''
            }
        }
    },
    data() {
        return {
            inputFocused: false,
            showMore: false,
            minValue: 1,
            maxValue: 255,
            maxSuborders: '1',
        }
    },
    computed: {
        limitSettingsStore() {
          return useLimitSettingsStore()
        },
        getBtnText() {
            if (this.limitSettingsStore.GET_LIMIT_ENABLE_SUBORDERS) {
                return this.$t('dcaSettings.disable')
            } else {
                return this.$t('dcaSettings.enable')
            }
        },
        defaultOrdersValue() {
            return 1
        },
        checkDefaultOrderValue() {
            return Number(this.maxSuborders) === this.defaultOrdersValue
        }
    },
    methods: {
        toggleSuborders() {
            this.limitSettingsStore.LIMIT_ENABLE_SUBORDERS(!this.limitSettingsStore.GET_LIMIT_ENABLE_SUBORDERS)
        },
        updateOrders(value) {
            this.maxSuborders = value
            console.log('updateOrders')
            this.limitSettingsStore.LIMIT_MAX_SUBORDERS(Number(value))
        },
        setDefaultOrdersValue() {
            this.updateOrders(this.defaultOrdersValue.toString())
        }
    },
    mounted() {
        this.setDefaultOrdersValue()
    }
}
</script>

<style scoped>
    .field {
        display: flex;
        flex-direction: column;
        gap: 10px;
        background: var(--iface-white3);
        padding: 14px 8px;
        transition: .2s;
    }

    .small_padding {
        padding: 14px 8px 8px 8px;
    }

    /*.field:hover {
        background: var(--iface-white12);
    }

    .field:active,
    .active {
        background: var(--iface-white16);
    }

    .active:hover {
        background: var(--iface-white16);
    }*/

    .down {
        border-radius:  0 0 12px 12px;
    }

    .field__preview {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 6px;
    }

    .field__text {
        font-size: 13px;
        line-height: normal;
        opacity: 0.6;
    }

    .field__button {
        padding-left: 10px;
        border: none;
        outline: none;
        background: transparent;
        color: var(--iface-accent-color);
        font-size: 13px;
        line-height: normal;
        font-weight: 400;
        transition: .2s;
    }

    .field__button:hover {
        color: var(--iface-accent-hover);
    }

</style>
