<template>
	<div class="dex__main">
		<DexTitle
			:refreshInfo="refreshInfo"
			@refresh="refreshHandlerEvent('compareTokens')"
		/>
		<div class="dex__interface-group">
			<!--			<DexCashback-->
			<!--				v-if="GET_CASHBACK === true"-->
			<!--			/>-->
<!--			<main-color class="dex__interface">-->
			<div class="dex__interface">
				<DexYouSend
					ref="youSend"
					@chooseSendToken="chooseSendToken"
					:poolNotFound="poolNotFound"
				/>
				<DexYouReceive
					@chooseReceiveToken="chooseReceiveToken"
					:poolNotFound="poolNotFound"
				/>
				<transition name="slide-info">
					<DexInfo
						v-show="checkDexStatus === 'HIGH_PRICE_IMPACT' && GET_SWAP_MODE !== 'reverse'"
					/>
				</transition>
				<transition name="slide-reverse">
					<DexReverseInfo v-show="GET_SWAP_MODE === 'reverse'"/>
				</transition>
				<!-- <transition name="slide-plan"> -->
				<DexDistributionButton
					v-if="GET_DEAL_CONDITIONS !== null && GET_SEND_AMOUNT > 0 && GET_SEND_AMOUNT !== ''"
				/>
				<!-- </transition> -->
				<div class="dex__button-wrapper">
					<DexButton
						:checkDexStatus="checkDexStatus"
						@dexAction="dexAction"
					/>
					<DexUnstakeButton
						@unstake="unstakeAction"
						:loading="unstakeProcessing"
						v-if="canUnstake"
					/>
					<DexStakeButton
						@stake="stakeAction"
						:loading="stakeProcessing"
						v-if="canStake"
					/>
				</div>
			</div>
<!--			</main-color>-->
			<DexDetails
				v-if="GET_DEAL_CONDITIONS !== null && GET_SEND_AMOUNT > 0 && GET_SEND_AMOUNT !== ''"
			/>
		</div>
		<TokensPopup
			:mode="tokenMode"
			@closePopup="closePopup"
			v-if="showTokens"
		/>
		<DexSuccess
			:transaction="transactionStatus"
			:trInfo="trInfo"
			@closeSuccess="closeSuccess"
			v-if="showSuccess"
		/>
	</div>
</template>

<script lang="ts">
import DexReverseInfo from "@/components/dex/DexReverseInfo.vue";
import DexTitle from "@/components/dex/DexTitle.vue";
import DexYouSend from "@/components/dex/DexYouSend.vue";
import DexButton from "@/components/dex/DexButton.vue";
import DexInfo from "@/components/dex/DexInfo.vue";
import DexYouReceive from "@/components/dex/DexYouReceive.vue";
import DexCashback from "@/components/dex/DexCashback.vue";
import computedMixins from "@/mixins/computedMixins";
import tonConnectMixin from "@/mixins/tonConnectMixin";
import { defineAsyncComponent } from "vue";
import { setTransactionMessage } from "@/helpers/dex/calculate";
import DexUnstakeButton from "@/components/dex/DexUnstakeButton.vue";
import DexStakeButton from "@/components/dex/DexStakeButton.vue";
import { Address } from "@ton/core";
import { useDexStore } from "@/stores/dex";

export default {
  name: "SwapWidget",
  mixins: [computedMixins, tonConnectMixin],
  props: {
  },
  components: {
    DexUnstakeButton,
    DexStakeButton,
    DexDistributionButton: defineAsyncComponent(() =>
        import("@/components/dex/DexDistributionButton.vue")
    ),
    TokensPopup: defineAsyncComponent(() =>
        import("@/components/dex/TokensPopup.vue")
    ),
    DexSuccess: defineAsyncComponent(() =>
        import("@/components/dex/DexSuccess.vue")
    ),
    DexDetails: defineAsyncComponent(() =>
        import("@/components/dex/DexDetails.vue")
    ),
    DexCashback,
    DexYouReceive,
    DexInfo,
    DexButton,
    DexYouSend,
    DexTitle,
    DexReverseInfo,
  },
  data() {
    return {
      startTransaction: false,
      poolAbortController: null as AbortController | null,
      abortController: null as AbortController | null,
      interval: null as number | null,
      requestInterval: null as number | null,
      intervalTime: 300,
      poolNotFound: false,
      calculateRequestData: null as any,
      debounce: null as number | null,
      showTokens: false,
      tokenMode: "SEND",
      showSuccess: false,
      transactionStatus: null as any,
      trInfo: null as any,
      refreshInfo: false,
      isVisible: true,
      unstakeProcessing: false,
      stakeProcessing: false,
    };
  },
  computed: {
    dexStore() {
      return useDexStore();
    },
    GET_DEAL_CONDITIONS() {
      return this.dexStore.GET_DEAL_CONDITIONS;
    },
    GET_SEND_AMOUNT() {
      return this.dexStore.GET_SEND_AMOUNT
    },
    GET_SWAP_MODE() {
      return this.dexStore.GET_SWAP_MODE
    },
    canStake() {
      const findTokenInUser = this.dexStore.GET_USER_TOKENS.find(
          (item) => item.symbol === "TON"
      );
      const enoughBalance =
          findTokenInUser &&
          findTokenInUser?.balance >= this.dexStore.GET_SEND_AMOUNT;
      const validAmount = this.dexStore.GET_SEND_AMOUNT > 0 && enoughBalance;

      return (
          this.dexStore.GET_STAKING_POOL != null &&
          this.dexStore.GET_RECEIVE_TOKEN?.stacking_pool_id != null &&
          validAmount
      );
    },
    canUnstake() {
      const findTokenInUser = this.dexStore.GET_USER_TOKENS.find(
          (item) => item.symbol === this.dexStore.GET_SEND_TOKEN?.symbol
      );
      const enoughBalance =
          findTokenInUser &&
          findTokenInUser?.balance >= this.dexStore.GET_SEND_AMOUNT;
      const validAmount = this.dexStore.GET_SEND_AMOUNT > 0 && enoughBalance;

      return (
          this.dexStore.GET_STAKING_POOL != null &&
          this.dexStore.GET_RECEIVE_TOKEN?.type === "native" &&
          validAmount
      );
    },
    checkDexStatus() {
      let priceImpact = 0;
      if (this.dexStore.GET_DEAL_CONDITIONS != null) {
        const inputUsd = this.dexStore.GET_DEAL_CONDITIONS?.input_usd;
        const outputUsd = this.dexStore.GET_DEAL_CONDITIONS?.output_usd;
        priceImpact = ((outputUsd - inputUsd) / inputUsd) * 100;
      }

      if (
          this.poolNotFound ||
          this.dexStore.GET_DEAL_CONDITIONS?.output_usd === 0
      ) {
        return "POOL_NOT_FOUND";
      } else if (
          this.loadingConditions || this.startTransaction ||
          this.firstLoading
      ) {
        return "LOADING";
      } else if (this.dexStore.GET_DEX_WALLET === null) {
        return "NOT_CONNECTED";
      } else if (this.dexStore.GET_RECEIVE_TOKEN === null) {
        return "NOT_SELECTED";
      } else if (priceImpact < -this.dexStore.GET_PRICE_IMPACT) {
        return "HIGH_PRICE_IMPACT";
      } else if (this.notEnoughConditions) {
        return "NOT_ENOUGH";
      } else {
        return "READY_DEX";
      }
    },
    loadingConditions() {
      return (
          this.dexStore.GET_RECEIVE_TOKEN !== null &&
          this.dexStore.GET_SEND_TOKEN !== null &&
          this.dexStore.GET_SEND_AMOUNT > 0 &&
          this.dexStore.GET_DEAL_CONDITIONS === null
      );
    },
    firstLoading() {
      const urlParams = new URLSearchParams(window.location.search);
      return (
          urlParams.get('ft') &&
          urlParams.get('st') &&
          this.dexStore.GET_DEAL_CONDITIONS === null &&
          this.dexStore.GET_TON_TOKENS.length === 0
      );
    },
    notEnoughConditions() {
      const findTokenInUser = this.dexStore.GET_USER_TOKENS.find(
          (item) => item.symbol === this.dexStore.GET_SEND_TOKEN?.symbol
      );
      return !(
          findTokenInUser &&
          findTokenInUser?.balance >=
          this.dexStore.GET_DEAL_CONDITIONS?.input_amount &&
          this.dexStore.GET_DEAL_CONDITIONS?.input_amount > 0
      );
    },
  },
  methods: {
    getTransactionParams(trInfo: any) {
      const cashback =
          this.dexStore.GET_DEAL_CONDITIONS?.paths.length <= 3
              ? this.dexStore.GET_CASHBACK
              : false;
      const messages = setTransactionMessage(
          this.calculateRequestData,
          cashback,
          trInfo?.transactions
      );
      return {
        validUntil: Math.floor(Date.now() / 1000) + 300,
        messages: messages,
      };
    },
    chooseSendToken() {
      if (this.tokenMode !== "SEND") {
        this.tokenMode = "SEND";
      }
      this.showTokens = true;
    },
    chooseReceiveToken() {
      if (this.tokenMode !== "RECEIVE") {
        this.tokenMode = "RECEIVE";
      }
      this.showTokens = true;
    },
    closePopup() {
      this.showTokens = false;
    },
    closeSuccess() {
      this.showSuccess = false;
      this.transactionStatus = null;
      this.$emit("updateWalletInfo");
      clearInterval(this.requestInterval as number);
      this.$refs.youSend.clearAmounts();
    },
    refreshDex() {
      this.interval = setInterval(() => {
        if (!this.showSuccess && this.isVisible) {
          this.compareTokens();
        }
      }, 10000);
    },
    setDebounceForRequest() {
      clearTimeout(this.debounce as number);
      this.debounce = setTimeout(() => {
        if (this.poolAbortController !== null) {
          this.poolAbortController.abort();
        }
        if (this.abortController !== null) {
          this.abortController.abort();
        }
        if (
            this.dexStore.GET_SEND_AMOUNT > 0 ||
            (this.dexStore.GET_RECEIVE_AMOUNT > 0 && !this.showSuccess)
        ) {
          this.compareTokens();
        }
      }, 200) as unknown as number;
    },
    async compareTokens() {
      try {
        const requestData = this.setAsset();
        this.refreshInfo = true;
        this.abortController = new AbortController();

        if (this.dexStore.GET_SEND_TOKEN?.stacking_pool_id != null) {
          this.dexStore.DEX_STAKING_POOL(
              await this.tokensApi.getStakingPool(
                  this.dexStore.GET_SEND_TOKEN?.stacking_pool_id
              )
          );
        }
        if (this.dexStore.GET_RECEIVE_TOKEN?.stacking_pool_id != null) {
          this.dexStore.DEX_STAKING_POOL(
              await this.tokensApi.getStakingPool(
                  this.dexStore.GET_RECEIVE_TOKEN?.stacking_pool_id
              )
          );
        }

        this.calculateRequestData = await this.dexApiV2.getRoute(requestData);

        if (this.calculateRequestData.paths.length > 0) {
          this.dexStore.DEX_DEAL_CONDITIONS(this.calculateRequestData);
        } else {
          this.poolNotFound = true;
        }
      } catch (err) {
        console.error(err);
      } finally {
        setTimeout(() => {
          this.refreshInfo = false;
        }, 1000);
      }
    },
    getPoolSelector() {
      const allowStonfi = true;
      const allowDedust = true;
      const maxVolatility = this.dexStore.GET_MAX_POOL_VOLATILITY;

      const result: Record<string, any> = {};
      let valid = false;

      if (allowStonfi !== allowDedust) {
        valid = true;
        if (allowStonfi) {
          result.dexes = ["stonfi"];
        } else {
          result.dexes = ["dedust"];
        }
      }
      if (Number(maxVolatility) !== -1) {
        valid = true;
        result.max_volatility = maxVolatility / 100;
      }
      if (valid) {
        return result;
      }
      return undefined;
    },
    setAsset() {
      let fromTokenAddress = "native";
      let toTokenAddress = "native";

      if (this.dexStore.GET_SEND_TOKEN && this.dexStore.GET_SEND_TOKEN.type !== "native") {
        fromTokenAddress = Address.parse(
            this.dexStore.GET_SEND_TOKEN?.address
        ).toString();
      }

      if (this.dexStore.GET_RECEIVE_TOKEN && this.dexStore.GET_RECEIVE_TOKEN.type !== "native") {
        toTokenAddress = Address.parse(
            this.dexStore.GET_RECEIVE_TOKEN?.address
        ).toString();
      }

      const asset = {
        input_token: {
          blockchain: "ton",
          address: fromTokenAddress,
        },
        output_token: {
          blockchain: "ton",
          address: toTokenAddress,
        },
        max_length: this.dexStore.GET_MAX_INTERMEDIATE_TOKENS + 2,
        pool_selector: this.getPoolSelector(),
        max_splits: this.dexStore.GET_MAX_SPLITS,
      };


      if (this.dexStore.GET_SWAP_MODE === "default") {
        asset.input_amount = Number(this.dexStore.GET_SEND_AMOUNT);
      } else if (this.dexStore.GET_SWAP_MODE === "reverse") {
        asset.output_amount = Number(this.dexStore.GET_RECEIVE_AMOUNT);
      }

      if (this.dexStore.GET_DEX_WALLET?.version) {
        if (this.dexStore.GET_DEX_WALLET?.version >= 5) {
          this.dexStore.DEX_MAX_SPLITS(parseInt(this.dexStore.GET_MAX_SPLITS)) || 20;
        } else {
          this.dexStore.DEX_MAX_SPLITS(parseInt(this.dexStore.GET_MAX_SPLITS) || 4);
        }
      }

      return asset;
    },
    dexAction() {
      if (this.checkDexStatus === "NOT_CONNECTED") {
        if (this.tonConnectUi.wallet !== null) {
          this.dexStore.DEX_WALLET(this.tonConnectUi.wallet.account);
        } else {
          this.showTonconnect();
        }
      } else if (this.checkDexStatus === "READY_DEX") {
        this.dexTransaction();
      }
    },
    async showTonconnect() {
      try {
        await this.tonConnectUi.openModal();
      } catch (err) {
        console.error(err);
      }
    },
    async stakeAction() {
      try {
        this.stakeProcessing = true;
        const sender = Address.parseRaw(
            this.dexStore.GET_DEX_WALLET?.address
        ).toString();
        const referralName = JSON.parse(sessionStorage.getItem("referral_name"));

        const transaction = await this.dexApiV2.getStakeTransaction(
            sender,
            this.dexStore.GET_RECEIVE_TOKEN?.address,
            this.dexStore.GET_SEND_AMOUNT,
            referralName
        );

        await this.tonConnectUi.sendTransaction({
          validUntil: Math.floor(Date.now() / 1000) + 300,
          messages: [
            {
              address: transaction.address,
              amount: transaction.value,
              payload: transaction.payload_cell,
            },
          ],
        });

        this.dexStore.DEX_SEND_AMOUNT(0);
      } finally {
        this.stakeProcessing = false;
      }
    },
    async unstakeAction() {
      try {
        this.unstakeProcessing = true;
        const sender = Address.parseRaw(
            this.dexStore.GET_DEX_WALLET?.address
        ).toString();

        const transaction = await this.dexApiV2.getUnstakeTransaction(
            sender,
            this.dexStore.GET_SEND_TOKEN?.address,
            this.dexStore.GET_SEND_AMOUNT
        );

        await this.tonConnectUi.sendTransaction({
          validUntil: Math.floor(Date.now() / 1000) + 300,
          messages: [
            {
              address: transaction.address,
              amount: transaction.value,
              payload: transaction.payload_cell,
            },
          ],
        });

        this.dexStore.DEX_SEND_AMOUNT(0);
      } catch (err) {
        console.error(err);
      } finally {
        this.unstakeProcessing = false;
      }
    },
    async dexTransaction() {
      try {
        this.startTransaction = true;
        await this.compareTokens();

        const sender = Address.parseRaw(
            this.dexStore.GET_DEX_WALLET?.address
        ).toString();
        const referralName = JSON.parse(sessionStorage.getItem("referral_name"));
        this.trInfo = await this.dexApiV2.getRouteTransactions(
            this.dexStore.GET_DEAL_CONDITIONS,
            sender,
            this.dexStore.GET_SLIPPAGE / 100,
            referralName
        );
        await this.tonConnectUi.sendTransaction(
            this.getTransactionParams(this.trInfo)
        );
        this.transactionStatus = await this.dexApiV2.getTransactions(
            this.trInfo?.route_id
        );
        this.showSuccess = true;
      } catch (err) {
        console.error(err);
      } finally {
        this.startTransaction = false;
      }
    },
    sendWatchEvent() {
      const url = new URL(window.location.href);
      if (this.dexStore.GET_RECEIVE_TOKEN !== null &&
          this.dexStore.GET_SEND_TOKEN !== null &&
          this.dexStore.GET_SEND_AMOUNT > 0) {
        this.setDebounceForRequest();
        clearInterval(this.interval as number);
        this.refreshDex();

        url.searchParams.set('ft', this.dexStore.GET_SEND_TOKEN?.symbol);
        url.searchParams.set('st', this.dexStore.GET_RECEIVE_TOKEN?.symbol);
        url.searchParams.set('fa', this.dexStore.GET_SEND_AMOUNT.toString());

        window.history.replaceState(null, '', url.toString());
      } else if (this.dexStore.GET_SEND_TOKEN !== null &&
          this.dexStore.GET_SEND_AMOUNT > 0) {
        url.searchParams.set('ft', this.dexStore.GET_SEND_TOKEN?.symbol);
        url.searchParams.set('fa', this.dexStore.GET_SEND_AMOUNT.toString());

        window.history.replaceState(null, '', url.toString());
      } else {
        if (this.abortController !== null) {
          this.abortController.abort();
        }

        if (this.dexStore.GET_SEND_AMOUNT === 0) {
          url.searchParams.delete('fa');
          window.history.replaceState(null, '', url.toString());
        }
        if (this.dexStore.GET_RECEIVE_TOKEN === null) {
          url.searchParams.delete('st');
          window.history.replaceState(null, '', url.toString());
        }
        clearInterval(this.interval as number);
      }
    },
    receiveWatchEvent() {
      const url = new URL(window.location.href);
      if (this.dexStore.GET_RECEIVE_TOKEN !== null &&
          this.dexStore.GET_SEND_TOKEN !== null &&
          this.dexStore.GET_RECEIVE_AMOUNT > 0) {
        this.setDebounceForRequest();
        clearInterval(this.interval as number);
        this.refreshDex();

        url.searchParams.set('ft', this.dexStore.GET_SEND_TOKEN?.symbol);
        url.searchParams.set('st', this.dexStore.GET_RECEIVE_TOKEN?.symbol);
        url.searchParams.set('sa', this.dexStore.GET_RECEIVE_AMOUNT.toString());

        window.history.replaceState(null, '', url.toString());
      } else {
        if (this.abortController !== null) {
          this.abortController.abort();
        }

        if (this.dexStore.GET_RECEIVE_AMOUNT === 0) {
          url.searchParams.delete('sa');
          window.history.replaceState(null, '', url.toString());
        }
        if (this.dexStore.GET_RECEIVE_TOKEN === null) {
          url.searchParams.delete('st');
          window.history.replaceState(null, '', url.toString());
        }
        clearInterval(this.interval as number);
      }
    },
    refreshHandlerEvent(action: string) {
      if (action === "compareTokens") {
        clearInterval(this.interval as number);
        this.compareTokens();
        this.refreshDex();
      }
    },
    observingTabVisibilityChange() {
      this.isVisible = !document.hidden;
      if (this.isVisible) {
        this.refreshDex();
      } else {
        clearInterval(this.interval as number);
      }
    },
  },
  mounted() {
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        this.showTokens = false;
      }
    });
    document.addEventListener(
        "visibilitychange",
        this.observingTabVisibilityChange
    );
  },
  unmounted() {
    document.removeEventListener(
        "visibilitychange",
        this.observingTabVisibilityChange
    );
    clearTimeout(this.debounce as number);
    clearInterval(this.interval as number);
    clearInterval(this.requestInterval as number);
  },
  watch: {
    showTokens: {
      handler(newVal: boolean) {
        if (newVal) {
          document.documentElement.style.overflow = "hidden";
          return;
        }
        document.documentElement.style.overflow = "auto";
      },
    },
    showSuccess: {
      handler(newVal: boolean) {
        if (newVal) {
          document.documentElement.style.overflow = "hidden";
          return;
        }
        document.documentElement.style.overflow = "auto";
      },
    },
    "dexStore.GET_SEND_TOKEN": {
      handler() {
        if (
            this.dexStore.GET_RECEIVE_TOKEN !== null &&
            this.dexStore.GET_SEND_TOKEN !== null &&
            (this.dexStore.GET_SEND_AMOUNT > 0 ||
                this.dexStore.GET_RECEIVE_AMOUNT > 0)
        ) {
          this.setDebounceForRequest();
          clearInterval(this.interval as number);
          this.refreshDex();
          if (this.dexStore.GET_DEAL_CONDITIONS !== null) {
            this.dexStore.DEX_DEAL_CONDITIONS(null);
          }

          if (
              this.dexStore.GET_SEND_TOKEN?.stacking_pool_id == null ||
              this.dexStore.GET_STAKING_POOL?.id !==
              this.dexStore.GET_SEND_TOKEN?.stacking_pool_id
          ) {
            this.dexStore.DEX_STAKING_POOL(null);
          }
          if (
              this.dexStore.GET_RECEIVE_TOKEN?.stacking_pool_id == null ||
              this.dexStore.GET_STAKING_POOL?.id !==
              this.dexStore.GET_RECEIVE_TOKEN?.stacking_pool_id
          ) {
            this.dexStore.DEX_STAKING_POOL(null);
          }
        }
        if (this.poolNotFound) {
          this.poolNotFound = false;
        }
      },
    },
    "dexStore.GET_RECEIVE_TOKEN": {
      handler() {
        if (
            this.dexStore.GET_RECEIVE_TOKEN !== null &&
            this.dexStore.GET_SEND_TOKEN !== null &&
            (this.dexStore.GET_SEND_AMOUNT > 0 ||
                this.dexStore.GET_RECEIVE_AMOUNT > 0)
        ) {
          this.setDebounceForRequest();
          clearInterval(this.interval as number);
          this.refreshDex();
          if (this.dexStore.GET_DEAL_CONDITIONS !== null) {
            this.dexStore.DEX_DEAL_CONDITIONS(null);
          }
        }
        if (this.poolNotFound) {
          this.poolNotFound = false;
        }
      },
    },
    "dexStore.GET_SEND_AMOUNT": {
      handler() {
        this.dexStore.CHANGE_SWAP_MODE("default");
        this.sendWatchEvent();

        if (this.dexStore.GET_DEAL_CONDITIONS !== null) {
          this.dexStore.DEX_DEAL_CONDITIONS(null);
        }
        if (this.poolNotFound) {
          this.poolNotFound = false;
        }
      },
    },
    "dexStore.GET_RECEIVE_AMOUNT": {
      handler() {
        this.dexStore.CHANGE_SWAP_MODE("reverse");
        this.receiveWatchEvent();

        if (this.dexStore.GET_DEAL_CONDITIONS !== null) {
          this.dexStore.DEX_DEAL_CONDITIONS(null);
        }
        if (this.poolNotFound) {
          this.poolNotFound = false;
        }
      },
    },
    "dexStore.GET_SLIPPAGE": {
      handler() {
        if (
            this.dexStore.GET_RECEIVE_TOKEN !== null &&
            this.dexStore.GET_SEND_TOKEN !== null &&
            (this.dexStore.GET_SEND_AMOUNT > 0 ||
                this.dexStore.GET_RECEIVE_AMOUNT > 0)
        ) {
          this.setDebounceForRequest();
          clearInterval(this.interval as number);
          this.refreshDex();
          if (this.dexStore.GET_DEAL_CONDITIONS !== null) {
            this.dexStore.DEX_DEAL_CONDITIONS(null);
          }
        }
      },
    },
    "dexStore.GET_MAX_POOL_VOLATILITY": {
      handler() {
        if (
            this.dexStore.GET_RECEIVE_TOKEN !== null &&
            this.dexStore.GET_SEND_TOKEN !== null &&
            (this.dexStore.GET_SEND_AMOUNT > 0 ||
                this.dexStore.GET_RECEIVE_AMOUNT > 0)
        ) {
          this.setDebounceForRequest();
          clearInterval(this.interval as number);
          this.refreshDex();
          if (this.dexStore.GET_DEAL_CONDITIONS !== null) {
            this.dexStore.DEX_DEAL_CONDITIONS(null);
          }
        }
      },
    },
    "dexStore.GET_MAX_INTERMEDIATE_TOKENS": {
      handler() {
        if (
            this.dexStore.GET_RECEIVE_TOKEN !== null &&
            this.dexStore.GET_SEND_TOKEN !== null &&
            (this.dexStore.GET_SEND_AMOUNT > 0 ||
                this.dexStore.GET_RECEIVE_AMOUNT > 0)
        ) {
          this.setDebounceForRequest();
          clearInterval(this.interval as number);
          this.refreshDex();
          if (this.dexStore.GET_DEAL_CONDITIONS !== null) {
            this.dexStore.DEX_DEAL_CONDITIONS(null);
          }
        }
      },
    },
    "dexStore.GET_EXPERT_MODE_VALUE": {
      handler() {
        if (
            this.dexStore.GET_RECEIVE_TOKEN !== null &&
            this.dexStore.GET_SEND_TOKEN !== null &&
            (this.dexStore.GET_SEND_AMOUNT > 0 ||
                this.dexStore.GET_RECEIVE_AMOUNT > 0)
        ) {
          this.setDebounceForRequest();
          clearInterval(this.interval as number);
          this.refreshDex();
          this.receiveWatchEvent();
        }
      },
    },
  },
};
</script>

<style scoped>

/*.cashback-enter-active, .cashback-leave-active {
	transition: .2s ease-out;
}

.cashback-enter-from, .cashback-leave-to {
	margin-top: -60px;
	transform-origin: bottom;
	transform: rotateX(90deg);
}*/

.slide-info-enter-active, .slide-info-leave-active {
	transition: .15s ease-out;
}


.slide-info-enter-from, .slide-info-leave-to {
	margin-top: -75px;
	transform-origin: bottom;
	transform: translateY(65px);
	opacity: 0;
}

.slide-reverse-enter-active, .slide-reverse-leave-active {
	transition: .15s ease-out;
}

.slide-reverse-enter-from, .slide-reverse-leave-to {
	margin-top: -62px;
	transform-origin: bottom;
	transform: translateY(62px);
}

.slide-plan-enter-active, .slide-plan-leave-active {
	transition: .15s ease-out;
}

.slide-plan-enter-from, .slide-plan-leave-to {
	margin-top: -30px;
	transform-origin: bottom;
	transform: translateY(30px);
}

.dex__main {
	max-width: 500px;
	width: 400px;
	min-width: 400px;
	margin: 0 auto 0 16px;
	display: flex;
	flex-direction: column;
}

.dex__interface {
	display: flex;
	flex-direction: column;
	border-radius: 16px;
	padding: 6px;
	border: 1px solid var(--iface-white8);
}

@media screen and (max-width: 1540px) {
	.dex__main {
		max-width: 100%;
		width: auto;
		flex: 30%;
	}
}

@media screen and (max-width: 1000px) {
	.dex__main {
		flex: 40%;
	}
}

@media screen and (max-width: 860px) {
	.dex__main {
		flex: none;
		margin: 0;
		max-width: 100%;
		width: 100%;
		padding: 0;
	}

	.dex__interface-group {
		padding: 0 10px;
	}
}

@media screen and (max-width: 640px) {
	.dex__main {
		margin-bottom: 0;
		max-width: 100%;
		min-width: auto;
		width: 100%;
		padding: 0;
	}

	.dex__interface {
		padding: 6px;
	}

	.dex__button-wrapper {
		position: fixed;
		z-index: 900;
		bottom: 0;
		left: 0;
		right: 0;
		padding: 10px 10px 20px 10px;
	}
}
</style>
