<template>
  <div class="mev-popup__wrapper">
    <div class="mev-popup__item flex gap-6 justify-between">
      <div class="mev-popup__item-left">
        <div class="mev-popup__item-top mb-4 flex gap-6">
          <ProtectIcon />
          <p class="mev-popup__item-title">
            {{ $t('mevProtect.settings.first.title') }}
          </p>
        </div>
        <p class="mev-popup__item-description mb-4">
          {{ $t('mevProtect.settings.first.description') }}
        </p>

        <div class="flex-end gap-4 flex-wrap">
          <p class="mev-popup__item-description">
            {{ $t('mevProtect.settings.first.description2') }}
          </p>
          <span class="mev-popup__item-description--red">
                {{ $t('mevProtect.settings.first.oldPrice') }}
            </span>

          <span class="mev-popup__item-description--green">
                {{ $t('mevProtect.settings.first.newPrice') }}
            </span>
        </div>
      </div>
      <div class="mev-popup__item-right">
        <switch-toggle
            :class="{ active_switch: isMevEnabled }"
            @click="toggleMevProtection"
        />
      </div>
    </div>

    <!--        <div class="mev-popup__item">-->
    <!--            <p class="mev-popup__item-title mb-4">-->
    <!--                {{ $t('mevProtect.settings.second.title') }}-->
    <!--            </p>-->

    <!--            <p class="mev-popup__item-description mb-4">-->
    <!--                {{ $t('mevProtect.settings.second.description') }}-->
    <!--            </p>-->

    <!--            <p class="mev-popup__item-description">-->
    <!--                {{ $t('mevProtect.settings.second.description2') }}-->
    <!--            </p>-->

    <!--            <div class="mev-popup__item-actions flex gap-8 justify-between">-->
    <!--                <button-->
    <!--                    class="mev-popup__item-actions-btn mev-popup__item-actions-btn&#45;&#45;active"-->
    <!--                >-->
    <!--                    {{ $t('mevProtect.settings.second.yes') }}-->
    <!--                </button>-->
    <!--                <button-->
    <!--                    class="mev-popup__item-actions-btn"-->
    <!--                >-->
    <!--                    {{ $t('mevProtect.settings.second.no') }}-->
    <!--                </button>-->
    <!--            </div>-->
    <!--        </div>-->

    <div
        class="mev-popup__item"
        :class="{ 'mev-popup__item--disabled': !isMevEnabled }"
        v-if="!shouldHideDisabled"
    >
      <p class="mev-popup__item-title mb-4">
        {{ $t('mevProtect.settings.third.title') }}
      </p>

      <p class="mev-popup__item-description">
        {{ $t('mevProtect.settings.third.description') }}
      </p>

      <div class="mev-popup__item-actions flex gap-8 justify-between">
        <button
            class="mev-popup__item-actions-btn"
            :class="{ 'mev-popup__item-actions-btn--active': mevMinValueUsd === 10 }"
            @click="toggleMevMinVolume(10)"
        >
          $10
        </button>

        <button
            class="mev-popup__item-actions-btn"
            :class="{ 'mev-popup__item-actions-btn--active': mevMinValueUsd === 100 }"
            @click="toggleMevMinVolume(100)"
        >
          $100
        </button>

        <button
            class="mev-popup__item-actions-btn"
            :class="{ 'mev-popup__item-actions-btn--active': mevMinValueUsd === 500 }"
            @click="toggleMevMinVolume(500)"
        >
          $500
        </button>

        <button
            class="mev-popup__item-actions-btn"
            :class="{ 'mev-popup__item-actions-btn--active': mevMinValueUsd === 1000 }"
            @click="toggleMevMinVolume(1000)"
        >
          $1000
        </button>
      </div>

      <input
          class="mev-popup__item-input"
          type="number"
          inputmode="decimal"
          autocomplete="off"
          :placeholder="$t('mevProtect.settings.third.customField')"
          v-model.number="mevMinValueUsd"
          @input="toggleMevMinVolume(mevMinValueUsd)"
          @blur="blurInput"
      />

    </div>

    <div
        class="mev-popup__item"
        :class="{ 'mev-popup__item--disabled': !isMevEnabled }"
        v-if="!shouldHideDisabled"
    >
      <p class="mev-popup__item-title mb-4">
        {{ $t('mevProtect.settings.fourth.title') }}
      </p>

      <p class="mev-popup__item-description mb-4">
        {{ $t('mevProtect.settings.fourth.description1') }}
      </p>
      <p class="mev-popup__item-description mb-4">
        {{ $t('mevProtect.settings.fourth.description2') }}
      </p>
      <p class="mev-popup__item-description mb-4">
        {{ $t('mevProtect.settings.fourth.description3') }}
      </p>
    </div>
  </div>
</template>

<script lang="ts">
import ProtectIcon from '@/assets/dex/icons/ProtectIcon.vue';
import SwitchToggle from '@/components/ui/SwitchToggle.vue';

import { profileService } from '@/api/coffeeApi/services';

import {useDexStore} from "@/stores/dex";
import {useDexSettingsStore} from "@/stores/dex/settings.ts";
import {useSettingsStore} from "@/stores/settings";

export default {
  name: 'MevSettings',
  components: { SwitchToggle, ProtectIcon },
  data() {
    return {
      isMevEnabled: false,
      mevMinValueUsd: 10
    };
  },
  props: {
    isHidden: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    dexStore() {
      return useDexStore()
    },
    dexSettingsStore() {
      return useDexSettingsStore()
    },
    settingsStore() {
      return useSettingsStore()
    },
    isDefaultValue() {
      return this.mevMinValueUsd === 10 || this.mevMinValueUsd === 100 || this.mevMinValueUsd === 500 || this.mevMinValueUsd === 1000;
    },
    shouldHideDisabled() {
      return this.isHidden && !this.isMevEnabled;
    }
  },
  methods: {
    toggleMevProtection() {
      const newValue = !this.isMevEnabled;
      this.isMevEnabled = newValue;
      this.dexSettingsStore.DEX_MEV_PROTECTION(newValue);
      this.saveToStorage('mevProtection', newValue);
    },
    toggleMevMinVolume(valueUsd) {
      this.mevMinValueUsd = valueUsd;
      this.dexSettingsStore.DEX_MEV_MIN_USD(valueUsd);
      this.saveToStorage('mevProtectionVolumeUsd', valueUsd);
    },
    blurInput() {
      if (this.mevMinValueUsd < 10) {
        this.mevMinValueUsd = 10;
        this.dexSettingsStore.DEX_MEV_MIN_USD(this.mevMinValueUsd);
      }
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
        this.isMevEnabled = this.dexSettingsStore.GET_MEV_PROTECTION_VALUE;
      },
      immediate: true,
    },
    'dexSettingsStore.GET_MEV_MIN_USD': {
      handler() {
        this.mevMinValueUsd = this.dexSettingsStore.GET_MEV_MIN_USD;
      },
      immediate: true,
    }
  },
}
</script>

<style scoped>
.mev-popup__item--disabled {
  opacity: 0.2;
  pointer-events: none;
}

.mev-popup__item:not(:last-child) {
  padding-bottom: 20px;
  border-bottom: 1px solid var(--iface-white6);
}

.mev-popup__item:not(:first-child) {
  padding-top: 20px;
}

.mev-popup__item-title {
  font-size: 15px;
  font-weight: 500;
}

.mev-popup__item-description {
  font-size: 14px;
  opacity: 0.4;
  font-weight: 400;
}

.mev-popup__item-description--green {
  font-family: Harmony-Regular, sans-serif;
  font-size: 14px;
  font-weight: 400;
  color: var(--main-green);
}

.mev-popup__item-description--red {
  font-family: Harmony-Regular, sans-serif;
  font-size: 14px;
  font-weight: 400;
  color: var(--main-red);
  padding-right: 5px;
  text-decoration: line-through;
}

.mev-popup__item-actions {
  margin-top: 14px;
  width: 100%;
}

.mev-popup__item-actions-btn {
  width: 100%;
  border: 1px solid var(--iface-white10);
  background: transparent;
  border-radius: 12px;
  font-size: 14px;
  padding: 10px 12px;
  font-weight: 500;
  user-select: none;
}

.mev-popup__item-actions-btn--active {
  border: 1px solid var(--earn-accent);
  color: var(--iface-accent-color) !important;
}

.mev-popup__item-input {
  background: var(--iface-white6);
  margin-top: 8px;
  width: 100%;
  font-size: 14px;
  font-weight: 500;
  padding: 10px 12px;
  text-align: center;
  border-radius: 12px;
  transition: 0.15s;
  outline: none;
  border: 0px solid var(--iface-white6);
}

.mev-popup__item-input--active {
  /* border: 1px solid var(--iface-accent-color); */
  color: var(--iface-accent-color);
}
.mev-popup__item-input--active:hover {
  /* border: 1px solid var(--iface-accent-color); */
  color: var(--iface-accent-color);
  background: var(--iface-white4);
}

.mev-popup__item-input:hover {
  /* border: 1px solid var(--iface-white24); */
  background: var(--iface-white4);
}

.mev-popup__item-input:active {
  /* border: 2px solid var(--iface-accent-color); */
  background: var(--iface-white6);
}

.mev-popup__item-input:focus {
  /* border: 2px solid var(--iface-accent-color); */
  background: var(--iface-white6);
}

.mev-popup__item-input:disabled {
  cursor: not-allowed;
}

.mb-4 {
  margin-bottom: 4px;
}

.flex {
  display: flex;
  align-items: center;
}

.flex-end {
  display: flex;
  align-items: flex-end;
}

.gap-4 {
  gap: 4px;
}

.flex-wrap {
  flex-wrap: wrap;
}

.gap-6 {
  gap: 6px;
}

.gap-8 {
  gap: 8px;
}

.justify-between {
  justify-content: space-between;
}
</style>
