<template>
  <button
    class="dex__button desktop-btn unstake_button_margin"
    :disabled="loading"
    @click="$emit('stake')"
  >
    <img v-if="!loading" src="@/assets/dex/stake-icon.svg" alt="wallet_icon" class="wallet-icon" />
    <p v-if="!loading" class="btn-text">
      {{ btnText }}
    </p>
    <p v-if="loading" class="btn-loader" />
    <div
      v-if="!loading"
      class="info-wrapper"
      @mouseenter="showTooltip = true"
      @mouseleave="showTooltip = false"
    >
      <transition name="tooltip">
        <tooltip-wrapper v-show="showTooltip" class="btn-tooltip" @hidden-tooltip="hiddenTooltip">
          {{ $t('stakeButton.tooltip[0]', getTrParams) }}<br />
          {{ $t('stakeButton.tooltip[1]', getTrParams) }}<br />
        </tooltip-wrapper>
      </transition>
      <img src="@/assets/dex/details-info.svg" alt="info icon" class="btn-icon" />
    </div>
  </button>
</template>

<script lang="ts">
import TooltipWrapper from '@/components/ui/TooltipWrapper.vue';
import { useDexStore } from "@/stores/dex";

export default {
  name: 'DexStakeButton',
  components: { TooltipWrapper },
  props: {
    loading: {
      type: Boolean,
      default() {
        return false;
      },
    },
  },
  data() {
    return {
      showTooltip: false,
    };
  },
  computed: {
    dexStore() {
      return useDexStore();
    },
    btnText() {
      return this.$t('stakeButton.stake');
    },
    getTrParams() {
      return {
        symbol: this.getTokenSymbol,
        output_amount: this.getOutputAmount.toFixed(2),
      };
    },
    getTokenSymbol() {
      return this.dexStore.GET_RECEIVE_TOKEN?.symbol;
    },
    getInputAmount() {
      return this.dexStore.GET_SEND_AMOUNT;
    },
    getOutputAmount() {
      const rate = this.dexStore.GET_STAKING_POOL?.exchange_rate;
      return this.getInputAmount / rate;
    },
  },
  methods: {
    hiddenTooltip() {
      this.showTooltip = false;
    },
  },
};
</script>

<style scoped>
.tooltip-enter-active,
.tooltip-leave-active {
  transition: 0.1s ease-out;
}

.tooltip-enter-from,
.tooltip-leave-to {
  opacity: 0;
}

.dex__button {
  transition: 0.2s;
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

.unstake_button_margin {
  margin-top: 7px;
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
  font-family: Harmony-Medium, sans-serif;
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
  background: url('@/assets/dex/loader.png') no-repeat;
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
