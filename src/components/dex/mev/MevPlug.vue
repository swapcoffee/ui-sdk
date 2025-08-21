<template>
  <div class="mev-plug">
    <div class="mev-plug__left" @click="updateSettingsModalVisible(true)">
      <div class="mev-plug__info">
        <ProtectIcon/>
        <p class="mev-plug__left-title">
          {{ $t("mevProtect.title") }}
        </p>
      </div>

      <RightChevronIcon/>
    </div>
    <div class="mev-plug__right">
      <button
          class="mev-plug__button"
          :disabled="!isListedPair"
          :class="{
                    'mev-plug__button--active': !dexSettingsStore.GET_MEV_PROTECTION_VALUE || !isListedPair,
                    'mev-plug__button--disabled': dexSettingsStore.GET_MEV_PROTECTION_VALUE && isListedPair,
                }"
          @mouseenter="onMouseEnter"
          @mouseleave="onMouseLeave"
          @click="updateMevProtection"
      >
        {{ btnText }}
        <MevTooltipIcon v-if="!isListedPair"/>
      </button>
    </div>
    <transition name="tooltip">
      <tooltip-wrapper
          v-show="showTooltip"
          class="btn-tooltip no-arrow"
          @hidden-tooltip="showTooltip = false"
          @mouseenter="onMouseEnter"
          @mouseleave="onMouseLeave"
      >
        {{ getTooltipText }}
      </tooltip-wrapper>
    </transition>
  </div>
</template>

<script lang="ts">
import ProtectIcon from "@/assets/dex/icons/ProtectIcon.vue"
import RightChevronIcon from "@/assets/stake/icons/RightChevronIcon.vue"
import {profileService} from "@/api/coffeeApi/services/index.js"
import MevTooltipIcon from "@/assets/dex/icons/MevTooltipIcon.vue"
import TooltipWrapper from "@/components/ui/TooltipWrapper.vue"
import {useDexStore} from "@/stores/dex";
import {useDexSettingsStore} from "@/stores/dex/settings.ts";
import {useSettingsStore} from "@/stores/settings";

export default {
  name: "MevPlug",
  components: {TooltipWrapper, MevTooltipIcon, RightChevronIcon, ProtectIcon},
  inject: ["updateSettingsModalVisible"],
  props: {
    isListedPair: {
      type: Boolean,
      default() {
        return false
      },
    },
  },
  data() {
    return {
      showTooltip: false,
      timeout: null
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
    mevIsActive() {
      return this.dexSettingsStore.GET_MEV_PROTECTION_VALUE && this.isListedPair
    },
    getTooltipText() {
      return this.$t("smart.tooltip", {mode: "MEV Protect"})
    },
    btnText() {
      return !this.mevIsActive
          ? this.$t("mevProtect.status.enabled")
          : this.$t("mevProtect.status.disabled")
    },
  },
  methods: {
    updateMevProtection() {
      if (!this.isListedPair) return
      const newValue = !this.dexSettingsStore.GET_MEV_PROTECTION_VALUE
      this.dexSettingsStore.DEX_MEV_PROTECTION(newValue)
      this.saveToStorage("mevProtection", newValue)
    },
    async saveToStorage(key, value) {
      try {
        let settings = this.settingsStore.GET_USER_SETTINGS
        if (!settings) {
          let storage = JSON.parse(localStorage.getItem("dexSettings"))
          if (storage) {
            settings = storage
          } else {
            settings = {}
          }
        }

        if (!settings.hasOwnProperty("dexSettings")) {
          settings.dexSettings = {}
        }
        settings.dexSettings[key] = value

        localStorage.removeItem("dexSettings")
        localStorage.setItem("dexSettings", JSON.stringify(settings))
        if (this.dexStore.GET_PROOF_VERIFICATION && this.dexStore.GET_DEX_WALLET) {
          await profileService.writeStorage(
              this.dexStore.GET_DEX_WALLET?.address,
              this.dexStore.GET_PROOF_VERIFICATION,
              settings,
          )
        }
      } catch (err) {
        console.error(err)
      }
    },
    onMouseLeave() {
      this.timeout = setTimeout(() => {
        this.showTooltip = false
      }, 100)
    },
    onMouseEnter() {
      clearTimeout(this.timeout)
      if (!this.isListedPair) this.showTooltip = true
    }
  },
  watch: {
    'dexSettingsStore.GET_MEV_PROTECTION_VALUE': {
      handler() {
        this.isMevEnabled = !!this.dexSettingsStore.GET_MEV_PROTECTION_VALUE
      },
    },
    'settingsStore.GET_USER_SETTINGS': {
      handler() {
        if (this.settingsStore.GET_USER_SETTINGS?.dexSettings.mevProtection) {
          this.isMevEnabled = this.settingsStore.GET_USER_SETTINGS?.dexSettings.mevProtection
          this.dexSettingsStore.DEX_MEV_PROTECTION(this.isMevEnabled)
        }
        if (this.settingsStore.GET_USER_SETTINGS?.dexSettings.mevProtectionVolumeUsd) {
          this.dexSettingsStore.DEX_MEV_MIN_USD(this.settingsStore.GET_USER_SETTINGS?.dexSettings.mevProtectionVolumeUsd)
        }
      },
      immediate: true,
    },
  },
}
</script>

<style scoped>
.mev-plug {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  border-radius: 12px;
  padding: 6px 6px 6px 10px;
  background: rgba(93, 255, 84, 0.1);
}

.theme-light .mev-plug {
  background: rgba(16, 163, 127, 0.1);
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
  gap: 6px;
  min-width: 90px;
  height: 30px;
  padding: 5px 17.5px;
  font-size: 13px;
  font-weight: 400;
  border-radius: 10px;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  transition: all 0.2s ease-in-out;
}

.theme-light .mev-plug__button--disabled {
  border: 1px solid rgba(95, 180, 159, 0.4) !important;
  background: transparent;
  color: #5fb49f;
}

.theme-light .mev-plug__button--disabled:hover {
  border: 1px solid rgba(16, 163, 127, 0.4) !important;
  background: transparent;
  color: #10a37f;
}

.mev-plug__button--active {
  border: 1px solid #99ff94;
  background: #99ff94;
  color: #0d0d0d;
}

.mev-plug__button--active:hover {
  color: #0d0d0d;
  background: #5dff54;
}

.theme-light .mev-plug__button--active {
  color: #fff;
  background: #5fb49f;
  border: 1px solid #5fb49f;
}

.theme-light .mev-plug__button--active:hover {
  color: #fff;
  background: #10a37f;
  border: 1px solid #10a37f;
}

.mev-plug__button--disabled {
  background: transparent;
  color: #99ff94;
  border: 1px solid rgba(153, 255, 148, 0.4);
}

.mev-plug__button--disabled:hover {
  background: transparent;
  color: #5dff54;
  border: 1px solid rgba(93, 255, 84, 0.4);
}

.mev-plug__button:disabled,
.mev-plug__button:disabled:hover {
  display: flex;
  align-items: center;
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-tooltip {
  z-index: 100;
  right: -87px;
  bottom: 33px;
  max-width: 150px;
}

@media screen and (max-width: 768px) {
  .btn-tooltip {
    left: -8px;
    right: -8px;
    width: auto;
    bottom: 47px;
    max-width: none;
    min-width: auto;
  }

  .no-arrow :deep(.tooltip__arrow--bottom),
  .no-arrow :deep(.tooltip__arrow--top) {
    display: none;
  }
}
</style>