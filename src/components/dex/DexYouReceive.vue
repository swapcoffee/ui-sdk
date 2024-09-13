<template>
	<div class="dex__you-receive">
		<div class="dex__content_empty"
			 v-if="receiveToken === null && !getRouteQuery"
			 @click="$emit('chooseReceiveToken')"
		>
			<p class="dex__text_empty">{{ $t("dexInterface.selectToken") }}</p>
		</div>
		<div class="dex__content"
			 v-else
			 @click.self="focusInput"
			 :class="{'active_you-receive': inputFocused}"
		>
			<div class="dex__group group-margin">
				<h4 class="dex__heading">{{ $t("dexInterface.youReceive") }}</h4>
        <p class="token-balance" v-if="receiveToken">
          {{ $t("dexInterface.balance", {currentBalance: getTokenBalance})}}
        </p>
        <div class="skeleton skeleton_row" v-if="!receiveToken"></div>
			</div>
			<div class="dex__flex-block">
				<!--				<p class="dex__receive-amount" v-if="!showSkeleton">{{ getReceive }}</p>-->
				<label for="" class="dex__label">
					<p class="skeleton skeleton_balance" v-if="showSkeleton && swapMode === 'default'"></p>
					<input type="number" class="dex__input" v-model="youReceive" id="receiveInput" placeholder="0"
						   inputmode="decimal" autocomplete="off"
						   v-else
						   @input="changeInput"
						   @focus="onFocus"
						   @blur="onBlur"
					>
					<button class="dex__btn"
							v-if="!showTokenSkeleton"
							@click="$emit('chooseReceiveToken')"
					>
						<img :src="receiveToken?.image" alt="Logo of the selected token for receive" class="token-image">
						<p class="btn-text">{{ receiveToken?.symbol }}</p>
						<!--					<div class="skeleton skeleton_round" v-if="showTokenSkeleton"></div>-->
						<!--					<p class="skeleton skeleton_row" v-if="showTokenSkeleton"></p>-->
					</button>
					<div class="skeleton skeleton_token" v-if="showTokenSkeleton"></div>
				</label>
			</div>
			<div class="dex__group">
				<div class="dex__price-block"
					 v-if="!showSkeleton"
				>
					<p class="token-price">~${{ getTokenPrice }}</p>
					<p class="token-impact"
					   v-show="getTokenPrice > 0"
					   :class="getClassImpact"
					>
						({{ getPriceImpactDisplay }}%)
					</p>
				</div>
				<div class="skeleton skeleton_row" v-if="showSkeleton"></div>
				<p class="token-name" v-if="receiveToken">{{ receiveToken?.name }}</p>
				<div class="skeleton skeleton_row" v-if="!receiveToken"></div>
			</div>
		</div>
	</div>
</template>

<script lang="ts">
import { useDexStore } from "@/stores/dex";

export default {
  name: "DexYouReceive",
  props: {
    poolNotFound: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      youReceive: null as number | null,
      inputFocused: false,
      pageLoaded: false,
    };
  },
  computed: {
    dexStore() {
      return useDexStore();
    },
    receiveToken() {
      return this.dexStore.GET_RECEIVE_TOKEN
    },
    swapMode() {
      return this.dexStore.GET_SWAP_MODE
    },
    getRouteQuery() {
      const urlParams = new URLSearchParams(window.location.search);
      return urlParams.get('st') !== null || undefined;
    },
    showTokenSkeleton() {
      return this.getRouteQuery && this.dexStore.GET_RECEIVE_TOKEN === null;
    },
    showSkeleton() {
      return (
          this.dexStore.GET_SEND_AMOUNT > 0 &&
          this.dexStore.GET_SEND_AMOUNT !== "" &&
          this.dexStore.GET_DEAL_CONDITIONS === null &&
          !this.poolNotFound
      );
    },
    getClassImpact() {
      const usdPriceImpact = this.getUsdPriceImpact;
      if (usdPriceImpact <= -5) {
        return "red-impact";
      } else if (usdPriceImpact <= -1) {
        return "yellow-impact";
      } else {
        return "green-impact";
      }
    },
    getReceive() {
      if (Number.isInteger(this.youReceive)) {
        return this.youReceive;
      } else {
        return this.youReceive?.toFixed(4);
      }
    },
    getTokenPrice() {
      return this.dexStore.GET_DEAL_CONDITIONS
          ? this.dexStore.GET_DEAL_CONDITIONS.output_usd.toFixed(2)
          : 0;
    },
    getTokenBalance() {
      return this.dexStore.GET_RECEIVE_TOKEN?.balance
          ? this.dexStore.GET_RECEIVE_TOKEN.balance.toFixed(2)
          : 0;
    },
    getPriceImpactDisplay() {
      const priceImpact = this.getUsdPriceImpact;
      return priceImpact > 0 ? `+${priceImpact}` : priceImpact;
    },
    getUsdPriceImpact() {
      if (this.dexStore.GET_DEAL_CONDITIONS) {
        const inUsd = this.dexStore.GET_DEAL_CONDITIONS.input_usd;
        const outUsd = this.dexStore.GET_DEAL_CONDITIONS.output_usd;
        const priceImpact = ((outUsd - inUsd) / inUsd) * 100;
        return priceImpact.toFixed(2);
      } else {
        return 0;
      }
    },
  },
  methods: {
    focusInput() {
      const input = document.getElementById("receiveInput") as HTMLInputElement;
      input.focus();
    },
    onFocus() {
      this.inputFocused = true;
    },
    onBlur() {
      this.inputFocused = false;
      if (this.youReceive === 0 || this.youReceive?.toString().length === 0) {
        this.youReceive = null;
      }
    },
    changeInput() {
      if (this.youReceive! < 0) {
        this.youReceive = null;
      }
      this.dexStore.DEX_RECEIVE_AMOUNT(Number(this.youReceive));
    },
  },
  watch: {
    "dexStore.GET_RECEIVE_AMOUNT": {
      handler() {
        if (
            this.youReceive !== this.dexStore.GET_RECEIVE_AMOUNT &&
            this.pageLoaded === false
        ) {
          this.pageLoaded = true;
          this.youReceive = this.dexStore.GET_RECEIVE_AMOUNT;
        }
      },
    },
    "dexStore.GET_DEAL_CONDITIONS": {
      handler() {
        if (this.dexStore.GET_SWAP_MODE !== "reverse") {
          if (this.dexStore.GET_DEAL_CONDITIONS) {
            this.dexStore.GET_DEAL_CONDITIONS.output_amount > 0
                ? (this.youReceive = this.dexStore.GET_DEAL_CONDITIONS.output_amount.toFixed(4))
                : (this.youReceive = 0);
          } else {
            this.youReceive = 0;
          }
        }
      },
    },
  },
};
</script>


<style scoped>
.dex__you-receive {
	margin-bottom: 6px;
	position: relative;
}

.dex__content {
	transition: .15s;
	padding: 12px;
	border-radius: 0 0 12px 12px;
	cursor: pointer;
	background: var(--iface-white4);
}

.theme-light .dex__content {
	color: #141414;
}

.dex__content:hover {
	background: var(--iface-white12);
}

.dex__content:active,
.active_you-receive {
	background: var(--iface-white16);
}

.dex__content_empty {
	transition: .15s;
	height: 112px;
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 12px;
	border-radius: 0 0 12px 12px;
	cursor: pointer;
	background: var(--iface-white4);
}

.dex__content_empty:hover {
	background: var(--iface-white12);
}

.dex__content_empty:active {
	background: var(--iface-white16);
}

.dex__text_empty {
	font-size: 16px;
	font-family: Roboto, sans-serif;
	font-weight: 500;
	color: var(--main-text-color);
}

.dex__content_empty:hover .dex__text_empty {
	color: var(--iface-accent-color);
}

.dex__heading {
	font-size: 13px;
	font-family: Roboto, sans-serif;
	font-weight: 400;
	opacity: 0.5;
	letter-spacing: 0.4px;
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
	color: var(--main-text-color);
	font-size: 28px;
	font-family: Roboto, sans-serif;
	font-weight: 500;
}

.dex__input::placeholder {
	color: var(--main-text-color);
}

.dex__receive-amount {
	font-size: 28px;
	line-height: 34px;
	font-family: Roboto, sans-serif;
	font-weight: 500;
}

.dex__btn {
	transition: .15s;
	display: flex;
	align-items: center;
	gap: 6px;
	height: 36px;
	padding: 6px 10px 6px 6px;
	border: 1px solid var(--iface-white20);
	border-radius: 20px;
	background: transparent;
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
	display: flex;
	align-items: center;
	justify-content: space-between;
}

.group-margin {
	margin-bottom: 10px;
}

.dex__price-block {
	display: flex;
	align-items: center;
}

.token-price {
	font-size: 13px;
	line-height: 15px;
	opacity: 0.5;
}

.token-impact {
	margin-left: 4px;
	font-size: 13px;
	line-height: 15px;
	opacity: 1;
}

.token-name {
	font-size: 13px;
	line-height: 15px;
	opacity: 0.5;
}

.red-impact {
	color: var(--main-red);
}

.yellow-impact {
	color: var(--main-yellow);
}

.green-impact {
	color: var(--main-green)
}

.token-balance {
	font-size: 13px;
	line-height: 15px;
	opacity: 0.5;
}

.skeleton_balance {
	width: 150px;
	height: 32px;
}

/*.skeleton_row {
	width: 100px;
	height: 16px;
	border-radius: 6px;
}*/

.skeleton_row {
	width: 75px;
	height: 15px;
}

.skeleton_token {
	min-width: 100px;
	height: 36px;
	border-radius: 100px;
	overflow: hidden;
}

/*.dex__text_empty::after {
	content: '';
	display: inline-block;
	width: 16px;
	height: 16px;
	margin-left: 6px;
	position: relative;
	top: 2px;
	background: url("@/assets/dex/arrow-down.svg") no-repeat;
	filter: invert(39%) sepia(98%) saturate(2450%) hue-rotate(-18deg) brightness(103%) contrast(104%);
}*/

/*.dex__content_empty:hover .dex__text_empty::after {
	filter: none;
}*/


@media screen and (max-width: 640px) {
	.dex__you-receive {
		margin-bottom: 0;
	}
}
</style>
