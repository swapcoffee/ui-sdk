<template>
  <div class="mev-plug">
    <div class="mev-plug__left" @click="updateMevModal">
      <div class="mev-plug__info">
        <ProtectIcon />
        <p class="mev-plug__left-title">
          {{ $t('mevProtect.title') }}
        </p>
      </div>

      <RightChevronIcon />
    </div>
    <div class="mev-plug__right">
      <button class="mev-plug__button"
              :class="{
                'mev-plug__button--active': !dexSettingsStore.GET_MEV_PROTECTION_VALUE,
                'mev-plug__button--disabled': dexSettingsStore.GET_MEV_PROTECTION_VALUE }"
              @click="updateMevProtection"
      >
        {{
          mevProtectionStatusText
        }}
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import {useDexSettingsStore} from "@/stores/dex/settings.ts";
import {useSettingsStore} from "@/stores/settings";
import {useDexStore} from "@/stores/dex";

import ProtectIcon from '@/assets/dex/icons/ProtectIcon.vue';
import RightChevronIcon from '@/assets/stake/icons/RightChevronIcon.vue';
import {profileService} from "@/api/coffeeApi/services";

export default {
  name: 'MevPlug',
  components: { RightChevronIcon, ProtectIcon },
  inject: ['updateMevModal'],
  computed: {
    dexSettingsStore() {
      return useDexSettingsStore()
    },
    settingsStore() {
      return useSettingsStore()
    },
    dexStore() {
      return useDexStore()
    },
    mevProtectionStatusText() {
      return !this.dexSettingsStore.GET_MEV_PROTECTION_VALUE ? this.$t('mevProtect.status.enabled') : this.$t('mevProtect.status.disabled')
    }
  },
  methods: {
    updateMevProtection() {
      const newValue = !this.dexSettingsStore.GET_MEV_PROTECTION_VALUE;
      this.dexSettingsStore.DEX_MEV_PROTECTION(newValue);
      this.saveToStorage('mevProtection', newValue);
    },
    async saveToStorage(key, value) {
      try {
        let settings = this.settingsStore.GET_USER_SETTINGS;
        if (!settings) {
          let storage = JSON.parse(localStorage.getItem('dexSettings'));
          if (storage) {
            settings = storage;
          } else {
            settings = {};
          }
        }

        if (!settings.hasOwnProperty('dexSettings')) {
          settings.dexSettings = {};
        }
        settings.dexSettings[key] = value;

        localStorage.removeItem('dexSettings');
        localStorage.setItem('dexSettings', JSON.stringify(settings));
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
  },
  watch: {
    'dexSettingsStore.GET_MEV_PROTECTION_VALUE': {
      handler() {
        this.isMevEnabled = !!this.dexSettingsStore.GET_MEV_PROTECTION_VALUE;
      },
    },
    'settingsStore.GET_USER_SETTINGS': {
      handler() {
        if (this.settingsStore.GET_USER_SETTINGS?.dexSettings.mevProtection) {
          this.isMevEnabled = this.settingsStore.GET_USER_SETTINGS?.dexSettings.mevProtection;
          this.dexSettingsStore.DEX_MEV_PROTECTION(this.isMevEnabled);
        }
        if (this.settingsStore.GET_USER_SETTINGS?.dexSettings.mevProtectionVolumeUsd) {
          this.dexSettingsStore.DEX_MEV_MIN_USD(this.settingsStore.GET_USER_SETTINGS?.dexSettings.mevProtectionVolumeUsd);
        }
      },
      immediate: true,
    }
  },
};
</script>


<style scoped>
.mev-plug {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  border-radius: 12px;
  padding: 10px 14px;
  background: rgba(93, 255, 84, 0.10);
}

.theme-light .mev-plug {
  background: rgba(16, 163, 127, 0.10);
}

.mev-plug__left {
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  transition: opacity 0.2s ease-out;
}

.mev-plug__left:hover {
  opacity: 0.8;
}

.mev-plug__info {
  display: flex;
  align-items: center;
  gap: 6px;
}

.mev-plug__left-title {
  font-size: 15px;
  font-weight: 500;
}

.mev-plug__button {
  min-width: 90px;
  padding: 7px 19.5px;
  font-size: 13px;
  font-weight: 400;
  border-radius: 10px;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  transition: all 0.2s ease-in-out;
}

.theme-light .mev-plug__button--disabled {
  border: 1px solid rgba(95, 180, 159, 0.40) !important;
  background: transparent;
  color: #5FB49F;
}

.theme-light .mev-plug__button--disabled:hover {
  border: 1px solid rgba(16, 163, 127, 0.40) !important;
  background: transparent;
  color: #10A37F;
}

.mev-plug__button--active {
  border: 1px solid #99FF94;
  background: #99FF94;
  color: #0D0D0D;
}

.mev-plug__button--active:hover {
  color: #0D0D0D;
  background: #5DFF54;
}

.theme-light .mev-plug__button--active {
  color: #fff;
  background: #5FB49F;
  border: 1px solid #5FB49F;
}

.theme-light .mev-plug__button--active:hover {
  color: #fff;
  background: #10A37F;
  border: 1px solid #10A37F;
}

.mev-plug__button--disabled {
  background: transparent;
  color: #99FF94;
  border: 1px solid rgba(153, 255, 148, 0.40);
}

.mev-plug__button--disabled:hover {
  background: transparent;
  color: #5DFF54;
  border: 1px solid rgba(93, 255, 84, 0.40);
}
</style>
