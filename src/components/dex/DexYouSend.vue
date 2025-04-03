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
				<span class="color-text" v-show="isBalanceAvailable"> {{ $t("dexInterface.max") }}</span>
			</button>
			<p class="skeleton skeleton_row" v-else></p>
		</div>
		<label for="" class="dex__label">
			<p class="skeleton skeleton_balance" v-if="showBalanceSkeleton && GET_SWAP_MODE === 'reverse'"></p>
			<DexInput id="sendInput" v-else
					  :model-value="youSend"
					  @update:model-value="updateValue"
					  @changeFocus="changeFocus"
			/>
			<button class="dex__btn"
					@click="$emit('chooseSendToken')"
					v-if="loaded"
			>
				<img :src="GET_SEND_TOKEN?.image" alt="Logo of send selected token for send" class="token-image">
				<p class="btn-text">{{ GET_SEND_TOKEN?.symbol }}</p>
				<!--				<p class="skeleton skeleton_row" v-if="!loaded"></p>-->
				<!--				<div class="skeleton skeleton_round" v-if="!loaded"></div>-->
			</button>
			<div class="skeleton skeleton_token" v-if="!loaded"></div>
		</label>
		<div class="dex__group">
			<p class="token-price" v-if="!showSkeleton && !showBalanceSkeleton">${{ getTokenPrice }}</p>
			<p class="skeleton skeleton_row" v-else></p>
			<p class="token-name" v-if="GET_SEND_TOKEN">{{ GET_SEND_TOKEN?.name }}</p>
			<p class="skeleton skeleton_row" v-else></p>
		</div>
		<button class="dex__switch-btn"
				@click="switchToken"
        :disabled="refreshInfo"
		>
			<img src="@/assets/dex/switch.svg" alt="switch tokens icon" class="dex__switch-icon">
		</button>
	</div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import DexInput from '@/components/dex/DexInput.vue';
import methodsMixins from '@/mixins/methodsMixins.ts';

export default {
  name: 'DexYouSend',
  components: {
    DexInput,
  },
  mixins: [methodsMixins],
  props: {
    poolNotFound: {
      type: Boolean,
      default() {
        return false;
      },
    },
    refreshInfo: {
      type: Boolean,
      default() {
        return false;
      },
    },
  },
  data() {
    return {
      inputFocused: false,
      pageLoaded: false,
      debounce: null,
      loaded: false,
      youSend: '0',
      currentSend: null,
      currentReceive: null,
      currentSendAmount: null,
      currentReceiveAmount: null,
      tokenSwitched: false,
    };
  },
  computed: {
    ...mapGetters([
      'GET_DEX_WALLET',
      'GET_SEND_TOKEN',
      'GET_RECEIVE_TOKEN',
      'GET_DEAL_CONDITIONS',
      'GET_SEND_AMOUNT',
      'GET_RECEIVE_AMOUNT',
      'GET_SWAP_MODE',
    ]),
    showBalanceCondition() {
      if (this.GET_DEX_WALLET !== null) {
        return this.GET_SEND_TOKEN !== null && this.GET_SEND_TOKEN.hasOwnProperty('balance');
      } else {
        return this.GET_SEND_TOKEN !== null;
      }
    },
    showSkeleton() {
      return (
        this.GET_SEND_AMOUNT > 0 &&
        this.GET_SEND_AMOUNT !== '' &&
        this.GET_RECEIVE_TOKEN !== null &&
        this.GET_DEAL_CONDITIONS === null &&
        !this.poolNotFound
      );
    },
    showBalanceSkeleton() {
      return (
        this.GET_RECEIVE_AMOUNT > 0 &&
        this.GET_RECEIVE_AMOUNT !== '' &&
        this.GET_DEAL_CONDITIONS === null &&
        !this.poolNotFound
      );
    },
    isBalanceAvailable() {
      const balance = this.GET_SEND_TOKEN?.balance;

      if (balance === null || balance === undefined) {
        return false;
      }

      const numericBalance = parseFloat(balance);

      return !isNaN(numericBalance) && numericBalance > 0;
    },
    getTokenBalance() {
      if (this.GET_SEND_TOKEN?.balance) {
        return this.prettyNumber(this.GET_SEND_TOKEN?.balance, 2);
      } else {
        return 0;
      }
    },
		getTokenPrice() {
			if (this.GET_DEAL_CONDITIONS !== null) {
				return this.prettyNumber(this.GET_DEAL_CONDITIONS?.input_usd, 2)
			} else {
				return 0
			}
		}
	},
	methods: {
		...mapActions([
			'DEX_SEND_TOKEN',
			'DEX_RECEIVE_TOKEN',
			'DEX_SEND_AMOUNT',
			'CHANGE_SWAP_MODE',
			'DEX_RECEIVE_AMOUNT'
		]),
		changeFocus(value) {
			this.inputFocused = value
		},
		switchToken() {
			if (this.GET_SEND_TOKEN !== null && this.GET_RECEIVE_TOKEN !== null) {
				clearTimeout(this.debounce)
        this.debounce = setTimeout(() => {
          this.tokenSwitched = true;
          this.DEX_SEND_TOKEN(this.currentReceive);
          this.DEX_RECEIVE_TOKEN(this.currentSend);

          if (this.currentSendAmount !== null && this.currentReceiveAmount !== null) {
            if (this.currentReceiveAmount === 0) {
              this.youSend = '0';
            } else if (typeof this.currentReceiveAmount === 'number' && !isNaN(this.currentReceiveAmount)) {
              this.youSend = this.currentReceiveAmount.toFixed(4);
            } else {
              this.youSend = '0';
            }
            this.DEX_SEND_AMOUNT(Number(this.youSend));
          }
        }, 200);
      }
		},
		updateValue(value) {
			this.youSend = value
			this.DEX_SEND_AMOUNT(Number(value))
		},
		focusInput() {
			let input = document.getElementById('sendInput')
			input.focus()
		},
    maxBalance() {
      let balance = this.GET_SEND_TOKEN?.balance;

      const currentDeal = this.GET_DEAL_CONDITIONS
        ? JSON.parse(JSON.stringify(this.GET_DEAL_CONDITIONS))
        : null;

      const partnerFee = currentDeal?.partner_commission_ton || 0;
      const recommendedGas = currentDeal?.recommended_gas || 0;

      if (this.GET_SWAP_MODE === 'reverse') {
        this.CHANGE_SWAP_MODE('default');
      }

      const fee = currentDeal ? parseFloat((recommendedGas + 0.00001).toFixed(8)) : 0;
      const totalFee = parseFloat((fee + partnerFee).toFixed(8));

      if (this.GET_SEND_TOKEN?.address === 'native' && balance > 0) {
        balance = parseFloat((balance - totalFee).toFixed(8));
        if (balance < 0) balance = 0;
      }

      this.youSend = balance.toFixed(4);
      this.DEX_SEND_AMOUNT(balance);
    },
    setCurrentSend() {
      if (this.GET_SEND_TOKEN !== null) {
        setTimeout(() => {
          this.currentSend = this.GET_SEND_TOKEN;
          this.loaded = true;
        }, 100);
      }
    },
    setCurrentReceive() {
      if (this.GET_RECEIVE_TOKEN !== null) {
        setTimeout(() => {
          this.currentReceive = this.GET_RECEIVE_TOKEN;
        }, 100);
      }
    },
    setCurrentSendAmount() {
      if (this.GET_SEND_AMOUNT > 0) {
        setTimeout(() => {
          this.currentSendAmount = this.GET_SEND_AMOUNT;
        }, 100);
      }
    },
    setCurrentReceiveAmount() {
      if (this.GET_DEAL_CONDITIONS !== null) {
        setTimeout(() => {
          this.currentReceiveAmount = this.GET_DEAL_CONDITIONS?.output_amount;
        }, 100);
      }
    },
    clearAmounts() {
      this.youSend = '0';
      this.currentSendAmount = 0;
      this.currentReceiveAmount = 0;
      this.DEX_SEND_AMOUNT(Number(this.youSend));
      this.DEX_RECEIVE_AMOUNT(Number(this.youSend));
    },
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
    GET_SEND_TOKEN: {
      handler() {
        if (this.GET_SWAP_MODE === 'default' && !this.tokenSwitched) {
          this.clearAmounts();
        }
        this.setCurrentSend();
      },
    },
    GET_RECEIVE_TOKEN: {
      handler() {
        if (this.GET_SWAP_MODE === 'reverse' && !this.tokenSwitched) {
          this.clearAmounts();
        }
        this.setCurrentReceive();
      },
    },
    GET_SEND_AMOUNT: {
      handler() {
        this.setCurrentSendAmount();
        if (Number(this.youSend) !== this.GET_SEND_AMOUNT && this.pageLoaded === false) {
          this.pageLoaded = true;
          this.youSend = String(this.GET_SEND_AMOUNT);
        }
      },
    },
    GET_DEAL_CONDITIONS: {
      handler() {
        this.setCurrentReceiveAmount();
        if (this.GET_SWAP_MODE !== 'default') {
          if (this.GET_DEAL_CONDITIONS !== null) {
            this.GET_DEAL_CONDITIONS?.input_amount > 0
              ? (this.youSend = this.GET_DEAL_CONDITIONS.input_amount.toFixed(4))
              : (this.youSend = '0');
          } else {
            this.youSend = '0';
          }
        }
      },
    },
  },
  mounted() {
    if (this.GET_SEND_TOKEN !== null) {
      this.loaded = true;
    }
    // this.setCurrentSend()
    // this.setCurrentReceive()
  },
  unmounted() {
    clearTimeout(this.debounce);
  },
};
</script>

<style scoped>
.dex__you-send {
  transition: 0.15s;
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
	line-height: 16px;
	font-family: Harmony-Regular, sans-serif;
	opacity: 0.7;
}

.dex__label {
	margin-bottom: 12px;
	display: flex;
	align-items: center;
	justify-content: space-between;
}

.dex__btn {
  transition: 0.15s;
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
  background: url('@/assets/dex/arrow-down.svg') no-repeat;
}

.theme-light .dex__btn::after {
  mix-blend-mode: difference;
  filter: invert(0.1);
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
  font-family: Harmony-Medium, sans-serif;
}

.token-image {
  border-radius: 100px;
  width: 24px;
  height: 24px;
}

.dex__group {
	max-height: 16px;
	display: flex;
	align-items: center;
	justify-content: space-between;
}

.group-margin {
	margin-bottom: 12px;
}

.token-price {
	font-size: 13px;
	line-height: 16px;
	opacity: 0.7;
}

.token-balance {
  border: none;
  outline: none;
  background: transparent;
}

.balance-text {
  transition: 0.2s;
  font-size: 13px;
  font-family: Harmony-Regular, sans-serif;
  opacity: 0.7;
}

.color-text {
	margin-left: 4px;
	transition: .2s;
	font-size: 13px;
	letter-spacing: 0.4px;
	color: var(--iface-accent-color);
}

.token-name {
	font-size: 13px;
	line-height: 16px;
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
  transition: 0.15s;
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
  filter: invert(0.8);
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
