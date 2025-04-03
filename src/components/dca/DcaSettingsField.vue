<template>
    <div class="settings-field">
        <div class="settings-field__row">
            <p class="settings-field__name">{{ $t('dcaSettings.everyField') }}</p>
            <p class="settings-field__name">{{ $t('dcaSettings.overField') }}</p>
        </div>
        <div class="settings-field__group">
            <settings-input
                :class="{default_value: checkDefaultTime }"
                :reverse-icon="showSelect"
                :with-select="true"
                :label-name="timeMode"
                :min-value="getTimeMin"
                :max-value="getTimeMax"
                :model-value="timeValue"
                @update:model-value="updateTime"
                @updateSelectVisible="updateSelectVisible"
            >
                <CustomSelect
                    v-if="showSelect"
                    :select-list="Object.keys(this.getTimeUnits)"
                    @updateSelect="updateSelect"
                    @closeSelect="closeSelect"
                />
            </settings-input>
            <SettingsInput
                :class="{default_value: checkDefaultOrders }"
                :label-name="$t('dcaSettings.orders')"
                :min-value="2"
                :max-value="255"
                :model-value="maxSuborders"
                @update:model-value="updateOrders"
            />
        </div>
    </div>
</template>

<script>
import SettingsInput from "@/components/general/SettingsInput.vue";
import DexInput from "@/components/dex/DexInput.vue";

import CustomSelect from "@/components/general/CustomSelect.vue";

import {useLimitSettingsStore} from "@/stores/limit/settings.js";
import {useDcaStore} from "@/stores/dca/index.js";

export default {
    name: "DcaSettingsField",
    components: {CustomSelect, DexInput, SettingsInput},
    data() {
        return {
            timeMode: 'minute',
            timeValue: '10',
            maxSuborders: '2',
            showSelect: false,
        }
    },
    computed: {
        limitSettingStore() {
          return useLimitSettingsStore();
        },
        dcaStore() {
          return useDcaStore()
        },
        getTimeUnits() {
            return {
                minute: 60,
                hour: 3600,
                day: 86400,
                week: 604800,
                month: 2592000
            }
        },
        defaultTimeValue() {
            return {
                minute: 10,
                hour: 5,
                day: 1,
                week: 2,
                month: 1
            }
        },
        defaultOrderValue() {
            return 2
        },
        getTimeMin() {
            return 1
        },
        getTimeMax() {
            switch(this.timeMode) {
                case "minute":
                    return 60
                case "hour":
                    return 24
                case "day":
                    return 31
                case "week":
                    return 4
                case "month":
                    return 6
            }
        },
        checkDefaultTime() {
            return Number(this.timeValue) === this.defaultTimeValue[this.timeMode]
        },
        checkDefaultOrders() {
            return Number(this.maxSuborders) === this.defaultOrderValue
        }
    },
    methods: {
        closeSelect() {
            this.showSelect = false
        },
        updateSelectVisible() {
            setTimeout(() => {
                this.showSelect = !this.showSelect
            }, 10)
        },
        updateTime(value) {
            this.timeValue = value
            this.dcaStore.DCA_EVERY_TIME(Number(value) * this.getTimeUnits[this.timeMode])
        },
        updateOrders(value) {
            this.maxSuborders = value
            this.limitSettingStore.LIMIT_MAX_SUBORDERS(Number(value))
        },
        updateSelect(value) {
            this.timeMode = value
            this.showSelect = false
            this.setDefaultTimeValue()
        },
        setDefaultTimeValue() {
            this.updateTime(this.defaultTimeValue[this.timeMode].toString())
        },
        setDefaultOrdersValue() {
            this.updateOrders(this.defaultOrderValue.toString())
        },
        checkTimeValueRange() {
            if (this.timeValue > this.getTimeMax) {
                this.timeValue = this.getTimeMax.toString()
            }
        }
    },
    mounted() {
        this.setDefaultTimeValue()
        this.setDefaultOrdersValue()
    }
}
</script>

<style scoped>
    .settings-field {
        display: flex;
        flex-direction: column;
        gap: 10px;
        padding: 14px 8px 8px 8px;
        background: var(--iface-white3);
    }

    .settings-field__row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 6px;
    }

    .settings-field__name {
        font-size: 13px;
        opacity: 0.6;
    }

    .settings-field__group {
        display: flex;
        align-items: center;
        gap: 8px;
    }
</style>
