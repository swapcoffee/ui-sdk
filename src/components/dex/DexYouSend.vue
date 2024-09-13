<template>
	<div class="dex__you-send"
		 @click.self="focusInput"
		 :class="{active: inputFocused}"
	>
		<div class="dex__group group-margin">
			<h4 class="dex__heading">{{ $t("dexInterface.youSend") }}</h4>
      <button class="token-balance"
              v-if="showBalanceCondition"
              @click="maxBalance"
              :disabled="getTokenBalance === 0"
      >
        <span class="balance-text">{{ $t("dexInterface.balance", {currentBalance: getTokenBalance}) }}</span>
        <span class="color-text" v-show="getTokenBalance > 0"> {{ $t("dexInterface.max") }}</span>
      </button>
			<p class="skeleton skeleton_row" v-else></p>
		</div>
		<label for="" class="dex__label">
			<p class="skeleton skeleton_balance" v-if="showBalanceSkeleton && swapMode === 'reverse'"></p>
			<input type="number" class="dex__input" v-model="youSend" id="sendInput" placeholder="0" inputmode="decimal"
				   autocomplete="off"
				   v-else
				   @input="changeInput"
				   @focus="onFocus"
				   @blur="onBlur"
			>
			<button class="dex__btn"
					@click="$emit('chooseSendToken')"
					v-if="loaded"
			>
				<img :src="sendToken?.image" alt="Logo of send selected token for send" class="token-image">
				<p class="btn-text">{{ sendToken?.symbol }}</p>
				<!--				<p class="skeleton skeleton_row" v-if="!loaded"></p>-->
				<!--				<div class="skeleton skeleton_round" v-if="!loaded"></div>-->
			</button>
			<div class="skeleton skeleton_token" v-if="!loaded"></div>
		</label>
		<div class="dex__group">
			<p class="token-price" v-if="!showSkeleton && !showBalanceSkeleton">${{ getTokenPrice }}</p>
			<p class="skeleton skeleton_row" v-else></p>
			<p class="token-name" v-if="sendToken">{{ sendToken?.name }}</p>
			<p class="skeleton skeleton_row" v-else></p>
		</div>
    <button class="dex__switch-btn"
            @click="switchToken"
    >
      <img src="@/assets/dex/switch.svg" alt="switch tokens icon" class="dex__switch-icon">
    </button>
	</div>
</template>

<script lang="ts">
import { useDexStore } from "@/stores/dex";

export default {
  name: "DexYouSend",
  props: {
    poolNotFound: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      inputFocused: false,
      pageLoaded: false,
      debounce: null as any,
      loaded: false,
      youSend: null as number | null,
      currentSend: null as any,
      currentReceive: null as any,
      currentSendAmount: null as number | null,
      currentReceiveAmount: null as number | null,
      tokenSwitched: false,
    };
  },
  computed: {
    dexStore() {
      return useDexStore();
    },
    sendToken() {
      return this.dexStore.GET_SEND_TOKEN;
    },
    receiveToken() {
      return this.dexStore.GET_RECEIVE_TOKEN;
    },
    dealConditions() {
      return this.dexStore.GET_DEAL_CONDITIONS;
    },
    sendAmount() {
      return this.dexStore.GET_SEND_AMOUNT;
    },
    receiveAmount() {
      return this.dexStore.GET_RECEIVE_AMOUNT;
    },
    swapMode() {
      return this.dexStore.GET_SWAP_MODE;
    },
    showBalanceCondition() {
      if (this.dexStore.GET_DEX_WALLET !== null) {
        return this.sendToken !== null && this.sendToken.hasOwnProperty('balance')
      } else {
        return this.sendToken !== null
      }
    },
    showSkeleton() {
      return (
          this.sendAmount > 0 &&
          this.sendAmount !== "" &&
          this.receiveToken !== null &&
          this.dealConditions === null &&
          !this.poolNotFound
      );
    },
    showBalanceSkeleton() {
      return (
          this.receiveAmount > 0 &&
          this.receiveAmount !== "" &&
          this.dealConditions === null &&
          !this.poolNotFound
      );
    },
    getTokenBalance() {
      if (this.sendToken?.balance) {
        return this.dexStore.GET_SEND_TOKEN?.balance.toFixed(2)
      } else {
        return 0
      }
    },
    getTokenPrice() {
      return this.dealConditions !== null
          ? this.dealConditions.input_usd.toFixed(2)
          : 0;
    },
  },
  methods: {
    switchToken() {
      if (this.sendToken !== null && this.receiveToken !== null) {
        clearTimeout(this.debounce);
        this.debounce = setTimeout(() => {
          this.tokenSwitched = true;
          this.dexStore.DEX_SEND_TOKEN(this.currentReceive);
          this.dexStore.DEX_RECEIVE_TOKEN(this.currentSend);
          if (
              this.currentSendAmount !== null &&
              this.currentReceiveAmount !== null
          ) {
            if (this.currentReceiveAmount === 0) {
              this.youSend = 0;
            } else {
              this.youSend = this.currentReceiveAmount.toFixed(4);
            }
            this.dexStore.DEX_SEND_AMOUNT(Number(this.youSend));
          }
        }, 200);
      }
    },
    focusInput() {
      const input = document.getElementById("sendInput") as HTMLInputElement;
      input.focus();
    },
    onFocus() {
      this.inputFocused = true;
    },
    onBlur() {
      this.inputFocused = false;
      if (this.youSend === 0 || this.youSend?.toString().length === 0) {
        this.youSend = null;
      }
    },
    changeInput() {
      if (this.youSend! < 0) {
        this.youSend = null;
      }
      this.dexStore.DEX_SEND_AMOUNT(Number(this.youSend));
    },
    maxBalance() {
      let balance = this.sendToken?.balance;
      let fee = 0.23501;

      if (this.dealConditions !== null) {
        fee = this.dealConditions.recommended_gas + 0.00001;
      }
      if (this.sendToken?.address === "native") {
        balance = this.sendToken.balance - fee;
        if (balance <= 0) {
          balance = 0;
        }
      }

      this.youSend = balance!.toFixed(4);
      this.dexStore.DEX_SEND_AMOUNT(Number(this.youSend));
    },
    setCurrentSend() {
      if (this.sendToken !== null) {
        setTimeout(() => {
          this.currentSend = this.sendToken;
          this.loaded = true;
        }, 100);
      }
    },
    setCurrentReceive() {
      if (this.receiveToken !== null) {
        setTimeout(() => {
          this.currentReceive = this.receiveToken;
        }, 100);
      }
    },
    setCurrentSendAmount() {
      if (this.sendAmount > 0) {
        setTimeout(() => {
          this.currentSendAmount = this.sendAmount;
        }, 100);
      }
    },
    setCurrentReceiveAmount() {
      if (this.dealConditions !== null) {
        setTimeout(() => {
          this.currentReceiveAmount = this.dealConditions.output_amount;
        }, 100);
      }
    },
    clearAmounts() {
      this.youSend = 0;
      this.currentSendAmount = 0;
      this.currentReceiveAmount = 0;
      this.dexStore.DEX_SEND_AMOUNT(Number(this.youSend));
      this.dexStore.DEX_RECEIVE_AMOUNT(Number(this.youSend));
    },
  },
  mounted() {
    if (this.sendToken !== null) {
      this.loaded = true;
    }
  },
  unmounted() {
    clearTimeout(this.debounce);
  },
  watch: {
    tokenSwitched: {
      handler() {
        if (this.tokenSwitched === true) {
          setTimeout(() => {
            this.tokenSwitched = false;
          }, 400);
        }
      },
    },
    sendToken: {
      handler() {
        if (this.swapMode === "default" && !this.tokenSwitched) {
          this.clearAmounts();
        }
        this.setCurrentSend();
      },
    },
    receiveToken: {
      handler() {
        if (this.swapMode === "reverse" && !this.tokenSwitched) {
          this.clearAmounts();
        }
        this.setCurrentReceive();
      },
    },
    sendAmount: {
      handler() {
        this.setCurrentSendAmount();
        if (this.youSend !== this.sendAmount && this.pageLoaded === false) {
          this.pageLoaded = true;
          this.youSend = this.sendAmount;
        }
      },
    },
    dealConditions: {
      handler() {
        this.setCurrentReceiveAmount();
        if (this.swapMode !== "default") {
          if (this.dealConditions !== null) {
            this.youSend = this.dealConditions.input_amount > 0
                ? this.dealConditions.input_amount.toFixed(4)
                : 0;
          } else {
            this.youSend = 0;
          }
        }
      },
    },
  },
};
</script>

<style scoped>
.dex__you-send {
  transition: .15s;
  position: relative;
  padding: 12px;
  border-radius: 12px 12px 0 0;
  background: var(--iface-white8);
  cursor: pointer;
  color: var(--main-white);
}

.dex__you-send:hover {
  background: var(--iface-white12);
}

.dex__you-send:active,
.active {
  background: var(--iface-white16);
}

.active:hover {
  background: var(--iface-white16);
}

.dex__heading {
  font-size: 13px;
  line-height: 15px;
  font-family: Roboto, sans-serif;
  font-weight: 400;
  opacity: 0.7;
}

.dex__label {
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.dex__input {
  width: 100%;
  height: 36px;
  border: none;
  outline: none;
  background: transparent;
  font-size: 28px;
  font-family: Roboto, sans-serif;
  font-weight: 500;
}

.dex__input::placeholder {
  color: var(--main-text-color);
}

.dex__btn {
  transition: .15s;
  display: flex;
  align-items: center;
  gap: 6px;
  height: 36px;
  padding: 6px 10px 6px 6px;
  border: 1px solid var(--iface-white20);
  background: transparent;
  border-radius: 20px;
  font-size: 16px;
}

.theme-light .dex__btn {
  border: 1px solid var(--iface-white10);
}

.dex__btn::after {
  content: '';
  display: block;
  width: 16px;
  height: 16px;
  background: url("@/assets/dex/arrow-down.svg") no-repeat;
}

.theme-light .dex__btn::after {
  mix-blend-mode: difference;
  filter: invert(.1);
}

.dex__btn:hover {
  background: var(--iface-white20);
  border: 1px solid var(--iface-white24);
}

.theme-light .dex__btn:hover {
  background: var(--iface-white10);
  border: 1px solid var(--iface-white24);
}

.btn-text {
  font-family: Roboto, sans-serif;
  font-weight: 500;
}

.token-image {
  border-radius: 100px;
  width: 24px;
  height: 24px;
}

.dex__group {
  max-height: 15px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.group-margin {
  margin-bottom: 10px;
}

.token-price {
  font-size: 13px;
  line-height: 15px;
  opacity: 0.7;
}

.token-balance {
  padding: 0;
  border: none;
  outline: none;
  background: transparent;
}

.balance-text {
  transition: .2s;
  font-size: 13px;
  font-family: Roboto, sans-serif;
  font-weight: 400;
  opacity: 0.7;
}

.color-text {
  margin-left: 4px;
  transition: .2s;
  font-size: 13px;
  line-height: 15px;
  font-weight: 400;
  letter-spacing: 0.4px;
  color: var(--iface-accent-color);
}

.token-name {
  font-size: 13px;
  line-height: 15px;
  opacity: 0.7;
}

.token-balance:hover .balance-text {
  opacity: 0.7;
}

.token-balance:hover .color-text {
  color: var(--iface-accent-hover);
}

.token-balance:disabled .balance-text {
  opacity: 0.7;
}

.dex__switch-btn {
  transition: .15s;
  z-index: 2;
  position: absolute;
  bottom: -15px;
  left: 50%;
  transform: translate(-50%, 0);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border: 1px solid transparent;
  outline: none;
  border-radius: 100px;
  background: var(--iface-white12);
  backdrop-filter: blur(5px);
  padding: 0;
}

.dex__switch-btn:hover {
  transform: translate(-50%, 0) rotate(180deg);
  background: var(--iface-white10);
}

.dex__switch-icon {
  width: 18px;
  height: 18px;
}

.theme-light .dex__switch-icon {
  mix-blend-mode: difference;
  filter: invert(.8);
}

.skeleton_row {
  width: 75px;
  height: 15px;
}

.skeleton_balance {
  width: 150px;
  height: 32px;
}

.skeleton_token {
  min-width: 100px;
  height: 36px;
  border-radius: 100px;
  overflow: hidden;
}
</style>
