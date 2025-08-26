<template>
    <modal-wrapper
        class="modal"
        :title="getTitle"
        @closeModal="$emit('closeModal')"
    >
        <div class="modal__content custom-scroll" :class="{ show_expert: getExpertMode }">
<!--            <div class="modal__expert-mode">-->
<!--                <div class="modal__group">-->
<!--                    <div class="modal__info">-->
<!--                        <img src="../../assets/dex/expert-mode.svg" alt="gift icon" class="modal__icon" />-->
<!--                        <p class="modal__name">-->
<!--                            {{ $t('dexSettings.expert.title') }}-->
<!--                        </p>-->
<!--                    </div>-->
<!--                    <p class="modal__text-info">-->
<!--                        {{ $t('dexSettings.expert.text') }}-->
<!--                    </p>-->
<!--                </div>-->
<!--                <switch-toggle :class="{ active_switch: getExpertMode }" @click="switchExpertMode" />-->
<!--            </div>-->
            <template
                v-for="(item, index) in settings"
                :key="index"
            >
                <ModalSettingItem
                    class="settings"
                    v-if="item.visible || getExpertMode"
                    :title="item.title"
                    :text="item.text"
                    :defaultValues="item.defaultValues"
                    :type="item.type"
                    @changeValue="item.action"
                />
            </template>
        </div>
    </modal-wrapper>
</template>

<script lang="ts">
import SwitchToggle from "@/components/ui/SwitchToggle.vue";
import ModalSettingItem from "@/components/general/ModalSettingsItem.vue";
import ModalWrapper from "@/components/ui/ModalWrapper.vue";

import {profileService} from "@/api/coffeeApi/services";

import computedMixins from "@/mixins/computedMixins.ts"
import {useLimitSettingsStore} from "@/stores/limit/settings.ts";

import {useSettingsStore} from "@/stores/settings";
import {useDexStore} from "@/stores/dex";

export default {
    name: "LimitSettingsModal",
    components: {ModalSettingItem, SwitchToggle, ModalWrapper},
    provide() {
        return {
            updateMaxSuborders: this.changeMaxSuborders,
            updateMaxInvocations: this.changeMaxInvocations,
            settingsValue: this.settingsValue,
            settingsUpdaters: {
                invocations: this.handleInvocationsUpdate
            }
        }
    },
    mixins: [computedMixins],
    data() {
        return {
            settingsValue: {
                maxSuborders: '1',
                maxInvocations: '1',
                invocations: {
                    value: '1',
                    custom: null
                }
            },
            settingsLoaded: false,
            settings: [
                {
                    type: 'invocations',
                    title: this.$t('invocations.title'),
                    text: this.$t('invocations.text'),
                    defaultValues: [1, 2, 3],
                    action: this.changeMaxInvocations,
                    visible: true
                }
            ]
        }
    },
    computed: {
        dexStore() {
          return useDexStore()
        },
        limitSettingsStore() {
          return useLimitSettingsStore()
        },
        settingsStore() {
          return useSettingsStore()
        },
        getTitle() {
            return `${this.dexStore.GET_SWAP_ACTIVE_TAB} ${this.$t('dexSettings.caption').toLowerCase()}`
        },
        getExpertMode() {
            return this.limitSettingsStore.GET_LIMIT_EXPERT_MODE
        },
    },
    methods: {
        switchExpertMode() {
            const updatedExpertMode = !this.getExpertMode;
            this.limitSettingsStore.LIMIT_EXPERT_MODE(updatedExpertMode);
            this.saveToStorage('limitExpertMode', updatedExpertMode);
            this.toggleExpertsSettingsValues(updatedExpertMode);
        },
        changeMaxSuborders(value, withoutSave = false) {
            this.settingsValue.maxSuborders = value
            this.limitSettingsStore.LIMIT_MAX_SUBORDERS(Number(value));
            if (!withoutSave) {
                this.saveToStorage('maxSuborders', this.settingsValue.maxSuborders)
            }
        },
        changeMaxInvocations(value, withoutSave = false) {
            this.settingsValue.maxInvocations = value
            this.settingsValue.invocations.value = value
            this.limitSettingsStore.LIMIT_MAX_INVOCATIONS(Number(value));
            if (!withoutSave) {
                this.saveToStorage('maxInvocations', this.settingsValue.maxInvocations)
            }
        },
        handleInvocationsUpdate(value, mode) {
            if (mode === 'custom') {
                this.settingsValue.invocations.custom = value;
            }
            this.changeMaxInvocations(value, false);
        },
        async saveToStorage(key, value) {
            try {
                let settings = this.settingsStore.GET_USER_SETTINGS;
                if (!settings) {
                    let storage = JSON.parse(localStorage.getItem('limitSettings'));
                    if (storage) {
                        settings = storage;
                    } else {
                        settings = {};
                    }
                }

                if (!settings.hasOwnProperty('limitSettings')) {
                    settings.limitSettings = {};
                }
                settings.limitSettings[key] = value;

                localStorage.removeItem('limitSettings');
                localStorage.setItem('limitSettings', JSON.stringify(settings));
                if (this.dexStore.GET_PROOF_VERIFICATION && this.dexStore.GET_DEX_WALLET) {
                    await profileService.writeStorage(
                        this.dexStore.GET_DEX_WALLET?.address,
                        this.dexStore.GET_PROOF_VERIFICATION,
                        settings,
                    );
                }
            } catch (err) {
                console.error(err);
            }
        },
        async checkStorageSettings() {
            try {
                let settings = this.settingsStore.GET_USER_SETTINGS?.limitSettings;
                if (!settings) {
                    let storage = JSON.parse(localStorage.getItem('limitSettings'))?.limitSettings;
                    if (storage) {
                        settings = storage;
                    } else {
                        settings = {};
                    }
                }

                if (settings.hasOwnProperty('limitExpertMode')) {
                    this.limitSettingsStore.LIMIT_EXPERT_MODE(settings.limitExpertMode);
                }
                settings.hasOwnProperty('maxSuborders')
                    ? this.changeMaxSuborders(settings.maxSuborders.toString(), true)
                    : (this.settingsValue.maxSuborders = this.limitSettingsStore.GET_LIMIT_SUBORDERS.toString());

                if (this.getExpertMode) {
                    settings.hasOwnProperty('maxInvocations')
                        ? this.changeMaxInvocations(settings.maxInvocations.toString(), true)
                        : (this.settingsValue.maxInvocations = this.limitSettingsStore.GET_LIMIT_INVOCATIONS.toString());
                }

                if (this.settingsLoaded) {
                    this.settingsValue.invocations.value = this.settingsValue.maxInvocations;
                }
            } catch (err) {
                console.error(err);
            }
        },
        toggleExpertsSettingsValues(expertModeValue) {
            let settings = this.settingsStore.GET_USER_SETTINGS?.limitSettings;
            if (!settings) {
                let storage = JSON.parse(localStorage.getItem('limitSettings'))?.limitSettings;
                if (storage) {
                    settings = storage;
                } else {
                    settings = {};
                }
            }

            if (expertModeValue) {
                settings.hasOwnProperty('maxInvocations')
                    ? this.changeMaxInvocations(settings.maxInvocations.toString(), true)
                    : this.changeMaxInvocations(this.limitSettingsStore.GET_LIMIT_INVOCATIONS.toString());
                this.settingsValue.invocations.value = this.settingsValue.maxInvocations;
            } else {
                this.limitSettingsStore.CLEAR_LIMIT_EXPERT_SETTINGS();
                this.settingsValue.maxInvocations = this.limitSettingsStore.GET_LIMIT_INVOCATIONS.toString();
                this.settingsValue.invocations.value = this.settingsValue.maxInvocations;
            }
        },
    },
    mounted() {
        // First check if we have saved settings in localStorage
        const savedSettings = JSON.parse(localStorage.getItem('limitSettings'))?.limitSettings;

        if (savedSettings?.maxSuborders) {
            this.settingsValue.maxSuborders = savedSettings.maxSuborders.toString();
        } else {
            this.settingsValue.maxSuborders = this.limitSettingsStore.GET_LIMIT_SUBORDERS.toString();
        }

        if (savedSettings?.maxInvocations) {
            this.settingsValue.maxInvocations = savedSettings.maxInvocations.toString();
        } else {
            this.settingsValue.maxInvocations = this.limitSettingsStore.GET_LIMIT_INVOCATIONS.toString();
        }

        this.settingsValue.invocations.value = this.settingsValue.maxInvocations;
        this.settingsLoaded = true;

        this.checkStorageSettings();
    },
    watch: {
        'settingsStore.GET_USER_SETTINGS': {
            handler() {
                this.checkStorageSettings();
            },
        },
        'limitSettingsStore.GET_LIMIT_INVOCATIONS': {
            handler() {
                if (this.settingsLoaded) {
                    this.settingsValue.maxInvocations = this.limitSettingsStore.GET_LIMIT_INVOCATIONS.toString();
                    this.settingsValue.invocations.value = this.settingsValue.maxInvocations;
                }
            },
        },
        'limitSettingsStore.GET_LIMIT_SUBORDERS': {
            handler() {
                if (this.settingsLoaded) {
                    this.settingsValue.maxSuborders = this.limitSettingsStore.GET_LIMIT_SUBORDERS.toString();
                }
            },
        },
    }
}
</script>

<style scoped>
.modal__content {
    max-height: 582px;
    height: auto;
    overflow-y: auto;
    overflow-x: hidden;
}

.modal__expert-mode {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-bottom: 20px;
    border-bottom: 1px solid var(--iface-white6);
    margin-bottom: 20px;
}

.modal__info {
    margin-bottom: 5px;
    display: flex;
    align-items: center;
}

.modal__icon {
    margin-right: 5px;
    width: 20px;
    height: 20px;
}

.modal__name {
    font-size: 14px;
    font-family: Harmony-Medium, sans-serif;
}

.modal__text-info {
    font-size: 14px;
    line-height: 16px;
    color: #8c8c8d;
}

.settings:not(:last-child) {
    margin-bottom: 20px;
    padding-bottom: 20px;
    border-bottom: 1px solid var(--iface-white6);
}

</style>
