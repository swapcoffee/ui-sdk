<template>
    <div class="settings toggle">
        <div class="toggle__group">
            <div class="toggle__info">
                <ProtectIcon v-if="type === 'mev_protection'"/>
                <ExpertModeIcon v-if="type === 'expert_mode'"/>
                <p class="toggle__name">
                    {{ title }}
                </p>
            </div>
            <p class="toggle__text-info">
                {{ text }}
            </p>
        </div>
        <switch-toggle
            :class="{ active_switch: getCurrentValue }"
            @click="switchToggle"
        />
    </div>
</template>

<script lang="ts">
import SwitchToggle from "@/components/ui/SwitchToggle.vue"
import ProtectIcon from "@/assets/dex/icons/ProtectIcon.vue";
import ExpertModeIcon from "@/assets/dex/expert-mode.svg";
import {useDexSettingsStore} from "@/stores/dex/settings.ts";

export default {
    name: "ModalSettingsToggle",
    components: {ExpertModeIcon, ProtectIcon, SwitchToggle },
    inject: ['settingsValue', 'settingsUpdaters'],
    props: {
        type: {
            type: String,
            required: true,
        },
        title: {
            type: String,
            required: true,
        },
        text: {
            type: String,
            required: true,
        },
    },
    data() {
        return {}
    },
    computed: {
        dexSettingStore() {
          return useDexSettingsStore()
        },
        getCurrentValue() {
            switch(this.type) {
                case "expert_mode":
                    return this.dexSettingStore.GET_EXPERT_MODE_VALUE
                case "mev_protection":
                    return this.dexSettingStore.GET_MEV_PROTECTION_VALUE
                    
            }
            return this.settingsValue[this.type]
        }
    },
    methods: {
        switchToggle() {
            this.settingsUpdaters[this.type](!this.getCurrentValue)
        }
    }
}
</script>

<style scoped>
.toggle {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.toggle__info {
    margin-bottom: 5px;
    display: flex;
    gap: 6px;
    align-items: center;
}

.toggle__icon {
    margin-right: 5px;
    width: 20px;
    height: 20px;
}

.toggle__name {
    font-size: 15px;
    line-height: 18px;
    font-family: Harmony-Medium, sans-serif;
}

.toggle__text-info {
    font-size: 14px;
    line-height: 16px;
    opacity: 0.4;
}
</style>