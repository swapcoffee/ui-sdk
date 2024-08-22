<template>
  <button class="dex__button desktop-btn"
          @click="$emit('dexAction')"
          :disabled="isButtonDisabled"
  >
    <div class="wallet-icon" v-if="!isButtonDisabled"></div>
    <p class="btn-loader" v-if="checkDexStatus === 'LOADING' || loadingState"></p>
    <p class="btn-text" v-else>{{ btnText }}</p>
    <div class="info-wrapper"
         @mouseenter="showTooltip = true"
         @mouseleave="showTooltip = false"
    >
      <transition name="tooltip">
        <tooltip-wrapper class="btn-tooltip"
                         v-show="showTooltip"
                         @hiddenTooltip="hiddenTooltip"
        >
          {{ $t("dexButton.tooltip[0]") }}<br>
          {{ $t("dexButton.tooltip[1]") }}<br>
          {{ $t("dexButton.tooltip[2]") }}
        </tooltip-wrapper>
      </transition>
      <img src="@/assets/dex/details-info.svg" alt="info icon" class="btn-icon"
           v-if="checkDexStatus === 'POOL_NOT_FOUND'">
    </div>
  </button>
</template>

<script lang="ts">
import TooltipWrapper from "@/components/ui/TooltipWrapper.vue";
import { useDexStore } from '@/stores/dex';

export default {
  name: "DexButton",
  components: { TooltipWrapper },
  props: {
    checkDexStatus: {
      type: String,
      default: ''
    },
  },
  data() {
    return {
      showTooltip: false,
      loadingState: true
    };
  },
  computed: {
    dexStore() {
      return useDexStore();
    },
    btnText(): string {
      if (this.checkDexStatus === 'POOL_NOT_FOUND') {
        return this.$t("dexButton.poolNotFound") as string;
      } else if (this.checkDexStatus === 'NOT_CONNECTED') {
        return this.$t("dexButton.connectWallet") as string;
      } else if (this.checkDexStatus === 'HIGH_PRICE_IMPACT') {
        return this.$t("dexButton.highPriceImpact") as string;
      } else if (this.checkDexStatus === 'NOT_ENOUGH' && (this.dexStore.GET_SEND_AMOUNT > 0 || this.dexStore.GET_RECEIVE_AMOUNT > 0)) {
        return this.$t("dexButton.notEnough") as string;
      } else if (this.checkDexStatus === 'NOT_ENOUGH' && (this.dexStore.GET_SEND_AMOUNT === 0 || this.dexStore.GET_RECEIVE_AMOUNT === 0)) {
        return this.$t("dexButton.enterAmount") as string;
      } else if (this.checkDexStatus === 'NOT_SELECTED') {
        return this.$t("dexButton.selectToken") as string;
      } else if (this.checkDexStatus === 'READY_DEX') {
        return this.$t("dexButton.sendTransaction") as string;
      }
      return '';
    },
    isButtonDisabled(): boolean {
      return this.checkDexStatus === 'NOT_ENOUGH' ||
          this.checkDexStatus === 'NOT_SELECTED' ||
          this.checkDexStatus === 'POOL_NOT_FOUND' ||
          this.checkDexStatus === 'LOADING' ||
          this.checkDexStatus === 'HIGH_PRICE_IMPACT' ||
          this.loadingState === true;
    }
  },
  methods: {
    hiddenTooltip(): void {
      this.showTooltip = false;
    }
  },
  mounted() {
    setTimeout(() => {
      this.loadingState = false;
    }, 1000);
  },
};
</script>

<style scoped>
.tooltip-enter-active, .tooltip-leave-active {
  transition: .1s ease-out;
}

.tooltip-enter-from, .tooltip-leave-to {
  opacity: 0;
}

.dex__button {
  transition: .2s;
  width: 100%;
  border: none;
  outline: none;
  border-radius: 12px;
  background: var(--iface-accent-color);
  padding: 13px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.dex__button:hover {
  background: var(--iface-accent-hover);
}

.dex__button:disabled {
  background: var(--main-btn-disabled);
}

.btn-text {
  font-size: 16px;
  line-height: 24px;
  font-family: Roboto, sans-serif;
  font-weight: 500;
  color: #fff;
}

.theme-light .dex__button:disabled .btn-text {
  color: #141414;
}

.dex__button:disabled .btn-text {
  opacity: 0.4;
}

.btn-loader {
  margin: 0 auto;
  width: 24px;
  height: 24px;
  background: url("~@/assets/dex/loader.png") no-repeat;
  background-size: cover;
  animation: 1s forwards linear infinite Loader;
}

.btn-icon {
  padding-left: 5px;
  min-width: 20px;
  width: 20px;
  height: 20px;
  cursor: help;
}

.wallet-icon {
  margin-right: 5px;
  width: 20px;
  height: 20px;
  background: url("@/assets/dex/wallet-icon.svg") no-repeat;
  transition: background 0.2s ease;
}

.dex__button:hover .wallet-icon {
  background: url("@/assets/dex/wallet-filled.svg") no-repeat;
}

.info-wrapper {
  position: relative;
}

.btn-tooltip {
  z-index: 100;
  position: absolute;
  bottom: 30px;
  left: 50%;
  transform: translateX(-49.5%);
}

@media screen and (max-width: 640px) {
  .dex__button {
    position: relative;
  }

  .info-wrapper {
    position: static;
  }

  .btn-tooltip {
    z-index: 100;
    left: 0;
    bottom: 56px;
    transform: translateX(0);
  }

  .dex__button {
    box-shadow: 0px 2px 10px 0px rgba(0, 0, 0, 0.25);
  }
}
</style>
