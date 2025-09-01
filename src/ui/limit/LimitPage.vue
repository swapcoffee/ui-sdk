<template>
  <div class="limit-page">
    <teleport defer to="#swap_header"
              :disabled="screenSize >= 576"
    >
      <SwapHeader/>
    </teleport>
    <SwapInterfaceTest
        class="limit-page__interface"
        :ton-connect-ui="tonConnectUi"
        :routeInfo="null"
        :interfaceStatus="interfaceStatus"
    />
    <teleport defer to="#limit_history"
              :disabled="screenSize < 1220"
    >
      <LimitOrdersHistory
          :ton-connect-ui="tonConnectUi"
      />
    </teleport>
    <TokensPopup
        v-if="modals.token === true"
        :mode="tokenModalMode"
        @closePopup="modals.token = false"
    />
    <LimitSettingsModal
        v-if="modals.settings === true"
        @closeModal="modals.settings = false"
    />
    <TransactionStatusModal
        v-if="successModalState.show === true"
        :status="getTransactionStatus"
        @closeModal="closeSuccess"
    />
    <DcaLimitConfirmModal
        v-if="confirmationModal.show === true"
        :status="confirmationModal.status"
        :details="confirmationModal.details"
        :ton-connect-ui="tonConnectUi"
        :modal-state="confirmationModal"
        @closeModal="confirmationModal.show = false"
    />

  </div>
</template>

<script lang="ts">
import {defineAsyncComponent} from "vue";
import {Address} from "@ton/core";

import resetLimitTokens from "@/mixins/resetLimitTokens";

import {strategiesService, tokenService} from "@/api/coffeeApi/services";

import LimitSettingsModal from "@/components/modals/LimitSettingsModal.vue";
import SwapHeader from "@/components/swap-interface/SwapHeader.vue";
import SwapInterface from "@/components/swap-interface/SwapInterface.vue";
import TransactionStatusModal from "@/components/modals/TransactionStatusModal.vue";
import EarnModalFirstStep from "@/components/modals/EarnModalFirstStep.vue";

import {
  cancelOrder,
  checkStrategiesWallet,
  createOrder,
  createStrategiesWallet,
  removeLimitCheckerInterval
} from "@/helpers/strategies/strategies.ts";

import {stableRateTokens} from "@/helpers/strategies/stable-rate-tokens.ts";

import {useLimitStore} from "@/stores/limit";
import {useDexStore} from "@/stores/dex";
import {useLimitSettingsStore} from "@/stores/limit/settings.ts";
import {useTransactionStore} from "@/stores/transaction";
import DcaLimitConfirmModal from "@/components/modals/DcaLimitConfirmModal.vue";
import methodsMixins from "@/mixins/methodsMixins.ts";

const component: Record<string, any> = {
  name: "LimitPage",
  props: {
    tonConnectUi: {
      type: Object,
      default() {
        return {};
      },
    },
    screenSize: {
      type: Number,
      required: true,
    },
  },
  inject: ["limitedJettonLists", "enableCommunityTokens"],
  mixins: [resetLimitTokens, methodsMixins],
  components: {
    DcaLimitConfirmModal,
    TransactionStatusModal,
    LimitSettingsModal,
    SwapHeader,
    SwapInterfaceTest: SwapInterface,
    EarnModalFirstStep,
    TokensPopup: defineAsyncComponent(() => {
      return import("@/components/dex/tokens-popup/TokensPopup.vue")
    }),
    DexSettings: defineAsyncComponent(() => {
      return import('@/components/modals/DexSettingsModal.vue');
    }),
    LimitOrdersHistory: defineAsyncComponent(() => {
      return import('@/components/limit/LimitOrdersHistory.vue')
    }),
  },
  provide() {
    return {
      updateToken: this.changeToken,
      updateFirstToken: this.changeFirstToken,
      updateSecondToken: this.changeSecondToken,
      updateSettingsModalVisible: this.openSettingsModal,
      updateTokenModalVisible: this.openTokenModal,
      updateShowModal: this.closeSuccess,
      updateFirstValue: this.changeFirstValue,
      updateTokenPositions: this.swapTokenPositions,
      updateSecondValue: this.changeSecondValue,
      updateRate: this.updateRate,
      setToMarket: this.setToMarket,
      limitAction: this.limitAction,
      interfaceAction: this.interfaceAction,
      cancelAction: this.cancelAction,
      tokenValues: this.tokenValues,
      processing: this.processing,
      modalState: this.confirmationModal.show ? this.confirmationModal : this.successModalState,
      addNewAsset: () => {
      },
      updateTokenValue: (data) => {
        if (data.key === 'first') {
          this.changeFirstValue(data.value);
        } else if (data.key === 'second') {
          this.changeSecondValue(data.value);
        }
      },
      isUpdatingBalances: () => false,
      dexAction: () => {
      },
      stakeTransaction: () => {
      },
      unstakeTransaction: () => {
      }
    }
  },
  data() {
    return {
      modals: {
        token: false,
        settings: false,
      },
      successModalState: {
        mode: null,
        show: false
      },
      processing: {
        limit: false,
        createWallet: false,
        cancel: false
      },
      tokenValues: {
        first: '0',
        second: '0',
        rate: '0'
      },
      tokenModalMode: 'SEND',
      debounce: null,
      isAutochange: false,
      usdtAddress: "0:b113a994b5024a16719f69139328eb759596c38a25f59028b146fecdc3621dfe",
      rateEdited: false,
      isSwapPositions: false,
      historyLength: 0,
      pageLoaded: false,
      historyActiveLength: false,
      confirmationModal: {
        show: false,
        status: '',
        details: [],
        title: 'Confirm Order',
        step: 1,
        mode: null
      }
    }
  },
  computed: {
    limitStore() {
      return useLimitStore()
    },
    dexStore() {
      return useDexStore()
    },
    limitSettingsStore() {
      return useLimitSettingsStore()
    },
    transactionStore() {
      return useTransactionStore()
    },
    getTransactionStatus() {
      if (this.successModalState.mode === 'deploy-smart') {
        if (this.limitStore.GET_STRATEGIES_WALLET === null) {
          return "pending"
        } else {
          return 'success'
        }
      } else if (this.successModalState.mode === 'cancel') {
        return this.getCancelStatus
      } else {
        return this.getLimitTransactionStatus
      }
    },
    getCancelStatus() {
      let activeLength = this.limitStore.GET_LIMIT_HISTORY.filter((item) => item?.status === 'active').length
      if (this.historyActiveLength === activeLength) {
        return 'pending'
      } else if (activeLength < this.historyActiveLength) {
        removeLimitCheckerInterval()
        return 'success'
      }
    },
    getLimitTransactionStatus() {
      if (this.historyLength === this.limitStore.GET_LIMIT_HISTORY.length) {
        return 'pending'
      } else if (this.limitStore.GET_LIMIT_HISTORY.length > this.historyLength) {
        removeLimitCheckerInterval()
        return 'success'
      }
    },
    setLimitTransactionInfo() {
      return {
        firstToken: this.getTokens?.first,
        secondToken: this.getTokens?.second,
        firstAmount: Number(this.tokenValues?.first),
        secondAmount: Number(this.tokenValues?.second),
        slippage: this.getSlippage,
        maxSuborders: this.getSuborders,
        maxInvocations: this.limitSettingsStore.GET_LIMIT_INVOCATIONS * this.getSuborders
      }
    },
    setCreateOrderBody() {
      return {
        type: "limit",
        token_from: {
          blockchain: "ton",
          address: this.getTokens?.first?.address
        },
        token_to: {
          blockchain: "ton",
          address: this.getTokens?.second?.address
        },
        input_amount: Math.floor(Number(this.tokenValues?.first) * Math.pow(10, this.getTokens.first?.decimals)).toString(),
        slippage: this.getSlippage,
        max_suborders: this.getSuborders,
        max_invocations: this.limitSettingsStore.GET_LIMIT_INVOCATIONS * this.getSuborders,
        settings: {
          min_output_amount: (this.tokenValues?.second * Math.pow(10, this.getTokens.second?.decimals)).toString()
        }
      }
    },
    getSuborders() {
      let first = this.tokenValues.first * this.limitStore.GET_LIMIT_FIRST_TOKEN?.price_usd
      if (!this.limitSettingsStore.GET_LIMIT_ENABLE_SUBORDERS) {
        if (first < 100) {
          return 1
        } else if (first <= 1000) {
          return Math.floor(first / 100)
        } else if (first <= 10000) {
          return Math.floor(first / 1000) + 9
        } else {
          return 20
        }
      } else {
        return this.limitSettingsStore.GET_LIMIT_SUBORDERS
      }
    },
    isTonToUsdt() {
      if (this.getTokens.first.address === 'native' && this.getTokens.second.address === this.usdtAddress) {
        return 'first'
      } else if (this.getTokens.first.address === this.usdtAddress && this.getTokens.second.address === 'native') {
        return 'second'
      }
    },
    isStableRate() {
      let stableTokens = stableRateTokens()
      if (stableTokens.includes(this.getTokens?.first?.address)) {
        return 'first'
      } else if (stableTokens.includes(this.getTokens?.second?.address)) {
        return 'second'
      }
    },
    getSlippage() {
      return (this.getTokens.first?.address === 'native' || this.getTokens.second?.address === this.usdtAddress)
      && (this.getTokens.first?.address === this.usdtAddress || this.getTokens.second?.address === 'native')
          ? 0.01
          : 0.001
    },
    interfaceStatus() {
      if (this.processing.limit === true || this.processing.createWallet === true) {
        return 'LOADING'
      } else if (this.dexStore.GET_DEX_WALLET === null) {
        return 'NOT_CONNECTED'
      } else if (!this.limitStore.GET_STRATEGIES_ELIGIBLE) {
        return 'NOT_ELIGIBLE'
      } else if (this.limitStore.GET_STRATEGIES_ELIGIBLE && !this.limitStore.GET_STRATEGIES_WALLET) {
        return 'NOT_STRATEGIES_WALLET'
      } else if (this.limitStore.GET_LIMIT_FIRST_AMOUNT === 0 && this.limitStore.GET_LIMIT_SECOND_AMOUNT === 0) {
        return 'NOT_AMOUNT'
      } else if (this.notEnoughConditions.reason === "noBalance") {
        return 'NOT_ENOUGH'
      } else {
        return 'READY_DEX'
      }
    },
    notEnoughConditions() {
      if (this.limitStore.GET_LIMIT_FIRST_TOKEN?.balance < this.limitStore.GET_LIMIT_FIRST_AMOUNT) {
        return {result: true, reason: 'noBalance'}
      }

      return {result: false, reason: null};
    },
    getTokens() {
      return {
        first: this.limitStore.GET_LIMIT_FIRST_TOKEN,
        second: this.limitStore.GET_LIMIT_SECOND_TOKEN
      }
    },
    calculateRate() {
      let calc = this.getTokens.first.price_usd / this.getTokens.second.price_usd

      if (this.isTonToUsdt === 'first') {
        calc = this.getTokens.first.price_usd / this.getTokens.second.price_usd
      } else if (this.isTonToUsdt === 'second') {
        calc = this.getTokens.second.price_usd / this.getTokens.first.price_usd
      } else if (this.isStableRate === 'first') {
        calc = this.getTokens.second.price_usd / this.getTokens.first.price_usd
      } else if (this.isStableRate === 'second') {
        calc = this.getTokens.first.price_usd / this.getTokens.second.price_usd
      }

      return Number.isInteger(calc) ? calc.toString() : calc.toFixed(4)
    },
    calculateSecond() {
      const operations = {
        '*': (a, b) => a * b,
        '/': (a, b) => a / b,
      };
      let operator = '*'

      if (this.isTonToUsdt === 'second') {
        operator = '/'
      } else if (this.isStableRate === 'first' && !this.isTonToUsdt) {
        operator = '/'
      }
      let calc = operations[operator](this.tokenValues.first, this.tokenValues.rate)

      return Number.isInteger(calc) ? calc.toString() : calc.toFixed(4)
    },
    calculateFirst() {
      const operations = {
        '*': (a, b) => a * b,
        '/': (a, b) => a / b,
      };
      let operator = '/'

      if (this.isTonToUsdt === 'second') {
        operator = '*'
      } else if (this.isStableRate === 'first' && !this.isTonToUsdt) {
        operator = '*'
      }

      let calc = operations[operator](this.tokenValues.second, this.tokenValues.rate)
      return Number.isInteger(calc) ? calc.toString() : calc.toFixed(4)
    },
    equalizeSecond() {
      let firstInUsd = this.limitStore.GET_LIMIT_FIRST_AMOUNT * this.getTokens.first.price_usd
      let calculate = firstInUsd / this.getTokens.second.price_usd
      return calculate.toFixed(4)
    },
    equalizeFirst() {
      let secondInUsd = this.limitStore.GET_LIMIT_SECOND_AMOUNT * this.getTokens.second.price_usd
      let calculate = secondInUsd / this.getTokens.first.price_usd
      return calculate.toFixed(4)
    },
    getLimitSummary() {
      let first = this.getTokens?.first
      let second = this.getTokens?.second

      if (!first?.price_usd || !second?.price_usd) return ''

      const calc = Number(first.price_usd) / Number(second.price_usd)

      return `1 ${first?.symbol} = ${this.prettyNumber(calc, 2)} ${second?.symbol}`
    },
    secondTokenValue(): string {
      const rawAmount = this.tokenValues?.second
      const amount = Number(rawAmount)
      const symbol = this.getTokens.second?.symbol || ''

      if (!rawAmount || isNaN(amount)) {
        return symbol ? `0 ${symbol}` : ''
      }

      return `${this.prettyNumber(amount, 2)} ${symbol}`
    },
    limitDetails() {
      if (!this.getTokens.first || !this.getTokens.second) {
        return []
      }

      return [
        {
          name: this.$t('transactionStatusModal.limitDetails.price'),
          value: this.getLimitSummary,
          symbol: ''
        },
        {
          name: this.$t('transactionStatusModal.limitDetails.buying'),
          value: this.secondTokenValue,
          symbol: ``
        },
        {
          name: this.$t('transactionStatusModal.limitDetails.suborders'),
          value: this.getSuborders.toString(),
          symbol: ''
        },
        {
          name: this.$t('transactionStatusModal.limitDetails.created'),
          value: new Date().toLocaleString('uk-UA', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
          }).replace(/\./g, '/'),
          symbol: ''
        },
        {
          name: this.$t('transactionStatusModal.limitDetails.expiryTime'),
          value: 'Never',
          symbol: ''
        }
      ]
    }
  },
  methods: {
    closeSuccess() {
      this.successModalState.show = false
      this.successModalState.mode = null
      this.clearValues()
      this.transactionStore.SAVE_LIMIT_TRANSACTION_INFO(null)
      this.historyLength = 0
      this.historyActiveLength = 0
    },
    openSettingsModal() {
      this.modals.settings = true
    },
    openTokenModal(value) {
      this.tokenModalMode = value
      this.modals.token = true
    },
    changeFirstValue(value) {
      this.tokenValues.first = value
      this.limitStore.LIMIT_FIRST_AMOUNT(Number(value))
    },
    changeSecondValue(value) {
      this.tokenValues.second = value
      this.limitStore.LIMIT_SECOND_AMOUNT(Number(value))
    },
    clearValues() {
      if (!this.isSwapPositions) {
        this.tokenValues.first = '0'
        this.tokenValues.second = '0'
        this.tokenValues.rate = '0'
      }
    },
    changeToken(key, value) {
      key === 'first'
          ? this.limitStore.LIMIT_FIRST_TOKEN(value)
          : this.limitStore.LIMIT_SECOND_TOKEN(value)
    },
    changeFirstToken(value) {
      this.limitStore.LIMIT_FIRST_TOKEN(value);
    },
    changeSecondToken(value) {
      this.limitStore.LIMIT_SECOND_TOKEN(value);
    },
    validateTokens(changedToken) {
      if (changedToken === 'send') {
        const availableReceiveTokens = this.limitStore.GET_LIMIT_RECEIVE_LIST;
        if (!availableReceiveTokens.some(token => token.address === this.getTokens.second.address)) {
          this.changeSecondToken(availableReceiveTokens[0]);
        }
      } else if (changedToken === 'receive') {
        const availableSendTokens = this.limitStore.GET_LIMIT_SEND_LIST;
        if (!availableSendTokens.some(token => token.address === this.getTokens.first.address)) {
          this.changeFirstToken(availableSendTokens[0]);

        }
      }
    },
    updateRate(value) {
      if (Number(value) > 0) {
        this.rateEdited = true
      } else {
        this.rateEdited = false
      }
      this.tokenValues.rate = value
      this.limitStore.LIMIT_TOKEN_RATE(Number(value))
    },
    setToMarket() {
      this.tokenValues.rate = this.calculateRate
      this.limitStore.LIMIT_TOKEN_RATE(Number(this.calculateRate))
    },
    swapTokenPositions() {
      clearTimeout(this.debounce)
      this.debounce = setTimeout(() => {
        this.isSwapPositions = true
        let first = this.limitStore.GET_LIMIT_SECOND_TOKEN
        let second = this.limitStore.GET_LIMIT_FIRST_TOKEN
        this.limitStore.LIMIT_FIRST_TOKEN(first)
        this.limitStore.LIMIT_SECOND_TOKEN(second)

        let firstAmount = this.tokenValues.second
        this.changeFirstValue(firstAmount)

        setTimeout(() => {
          this.isSwapPositions = false
        }, 100)
      }, 200)
    },
    updateProcessing(value, mode) {
      switch (mode) {
        case "create-wallet":
          this.processing.createWallet = value;
          break;
        case "order":
          this.processing.limit = value;
          break;
        case "cancel":
          this.processing.cancel = value
      }
    },
    async interfaceAction(mode) {
      try {
        this.confirmationModal.show = false

        if (!this.dexStore.GET_DEX_WALLET) {
          this.tonConnectUi.openModal()
        } else if (this.interfaceStatus === 'NOT_ELIGIBLE') {
        } else if (this.interfaceStatus === 'NOT_STRATEGIES_WALLET') {
          await createStrategiesWallet(this.updateProcessing)
          this.successModalState.mode = 'deploy-smart'
          this.successModalState.show = true
        } else {
          this.transactionStore.SAVE_LIMIT_TRANSACTION_INFO(this.setLimitTransactionInfo)
          this.historyLength = this.limitStore.GET_LIMIT_HISTORY.length
          await createOrder(this.updateProcessing, this.setCreateOrderBody)
          this.successModalState.mode = 'limit'
          this.successModalState.show = true
        }
      } catch (err) {
        console.error(err)
      }
    },
    async limitAction() {
      try {
        if (!this.dexStore.GET_DEX_WALLET) {
          this.tonConnectUi.openModal()
        } else if (this.interfaceStatus === 'NOT_ELIGIBLE') {
        } else if (this.interfaceStatus === 'NOT_STRATEGIES_WALLET') {
          await createStrategiesWallet(this.updateProcessing)
          this.successModalState.mode = 'deploy-smart'
          this.successModalState.show = true
        } else {
          this.transactionStore.SAVE_LIMIT_TRANSACTION_INFO(this.setLimitTransactionInfo)

          this.confirmationModal.status = 'pending'
          this.confirmationModal.details = this.limitDetails
          this.limitStore.LIMIT_TRANSACTION_DETAILS(this.limitDetails)
          this.confirmationModal.title = this.$t("earnModal.createOrderTitle", { mode: "limit" })
          this.confirmationModal.mode = 'limit'
          this.confirmationModal.show = true
        }
      } catch (err) {
        console.error(err)
      }
    },
    async cancelAction(id) {
      try {
        this.historyActiveLength = this.limitStore.GET_LIMIT_HISTORY.filter((item) => item?.status === 'active').length
        let res = await cancelOrder(this.updateProcessing, {type: 'limit', id: id})
        this.successModalState.mode = 'cancel'
        this.successModalState.show = true
      } catch (err) {
        console.error(err)
      }
    },
    setDefaultTokenPair() {
      const native = this.dexStore.GET_TON_TOKENS.find((item) => item.type === 'native')
      const usdt = this.dexStore.GET_TON_TOKENS.find((item) => item?.address === this.usdtAddress)

      if (native) {
        this.limitStore.LIMIT_FIRST_TOKEN(native)
      }
      if (usdt) this.limitStore.LIMIT_SECOND_TOKEN(usdt)
    },
    async getSupportedSendTokens() {
      try {
        const res = await strategiesService.getSupportedFromTokens('limit')
        const tokens = await this.getTokensByAddress(res)
        this.limitStore.LIMIT_SEND_SUPPORTED_TOKENS(tokens)
        return tokens
      } catch (err) {
        console.error(err)
      }
    },
    async getSupportedReceiveTokens(firstToken) {
      try {
        const res = await strategiesService.getSupportedToTokens(firstToken, 'limit')
        const tokens = await this.getTokensByAddress(res)
        this.limitStore.LIMIT_RECEIVE_SUPPORTED_TOKENS(tokens)
        return tokens
      } catch (err) {
        console.error(err)
      }
    },
    async getTokensByAddress(addresses) {
      try {
        const tokensFromStore = this.dexStore.GET_TON_TOKENS.filter((item) => {
          const friendly =
              item.address === "native"
                  ? item.address
                  : Address.parse(item.address).toString();
          return addresses.includes(friendly);
        });

        const filteredAddresses = addresses.filter((address) => {
          if (address === "native") return false;
          return tokensFromStore.every(
              (token) =>
                  token.address !== Address.parse(address).toRawString()
          );
        });

        if (filteredAddresses.length === 0) {
          return tokensFromStore;
        }

        const res = await tokenService.getTokensByAddress(filteredAddresses);

        return this.mergeArrays(tokensFromStore, res);
      } catch (err) {
        console.error("getTokensByAddress failed:", err);
        throw err;
      }
    },
    mergeArrays(first, second) {
      return first.concat(second)
          .filter((obj, index, self) => {
            return obj.id == null || index === self.findIndex((t) => t?.id === obj?.id);
          });
    },
  },
  mounted() {
    if (this.limitStore.GET_STRATEGIES_ELIGIBLE) {
      checkStrategiesWallet()
    }

    if (this.dexStore.GET_TON_TOKENS.length > 0 && !this.pageLoaded) {
      this.setDefaultTokenPair()
      this.getSupportedSendTokens()
      setTimeout(() => {
        this.pageLoaded = true
      }, 500)
    }
  },
  unmounted() {
    this.limitStore.LIMIT_FIRST_AMOUNT(0)
    this.limitStore.LIMIT_SECOND_AMOUNT(0)
    this.resetLimitTokens()
  },
  watch: {
    'dexStore.GET_TON_TOKENS': {
      handler() {
        if (this.dexStore.GET_TON_TOKENS.length > 0 && !this.pageLoaded) {
          this.setDefaultTokenPair()
          setTimeout(() => {
            if (this.limitStore.GET_LIMIT_FIRST_TOKEN) {
              this.getSupportedSendTokens()
            }
          }, 300)
          setTimeout(() => {
            this.pageLoaded = true
          }, 5000)
        }
      },
    },
    'limitStore.GET_LIMIT_RECEIVE_LIST': {
      handler() {
        this.validateTokens('send');
      },
      immediate: true
    },
    'limitStore.GET_LIMIT_SEND_LIST': {
      handler() {
        this.validateTokens('receive');
      },
      immediate: true
    },
    'limitStore.GET_LIMIT_FIRST_TOKEN': {
      handler() {
        this.rateEdited = false
        if (this.limitStore.GET_LIMIT_FIRST_TOKEN) {
          this.getSupportedReceiveTokens(this.limitStore.GET_LIMIT_FIRST_TOKEN?.address)
        }
      }
    },
    'limitStore.GET_LIMIT_SECOND_TOKEN': {
      handler() {
        this.rateEdited = false

        if (this.limitStore.GET_LIMIT_SECOND_TOKEN) {
          this.getSupportedSendTokens()
        }

        setTimeout(() => {
          this.pageLoaded = true
        }, 500)
      }
    },
    'limitStore.GET_STRATEGIES_ELIGIBLE': {
      handler() {
        if (this.limitStore.GET_STRATEGIES_ELIGIBLE) {
          checkStrategiesWallet()
        }
      }
    },
    'limitStore.GET_LIMIT_FIRST_AMOUNT': {
      handler() {
        if (Number(this.tokenValues.first) !== this.limitStore.GET_LIMIT_FIRST_AMOUNT && !this.pageLoaded) {
          this.tokenValues.first = this.limitStore.GET_LIMIT_FIRST_AMOUNT.toString()
        }

        clearTimeout(this.debounce)
        this.debounce = setTimeout(() => {
          if (this.limitStore.GET_LIMIT_FIRST_AMOUNT > 0) {
            this.isAutochange = true
            if (!this.rateEdited) {
              this.tokenValues.second = this.equalizeSecond
              this.tokenValues.rate = this.calculateRate
            } else {
              this.tokenValues.second = this.calculateSecond
            }
          } else {
            this.tokenValues.second = '0'
          }
        }, 200)

        setTimeout(() => {
          this.isAutochange = false
        }, 1000)
      }
    },
    'limitStore.GET_LIMIT_SECOND_AMOUNT': {
      handler() {
        clearTimeout(this.debounce)
        this.debounce = setTimeout(() => {
          if (this.limitStore.GET_LIMIT_SECOND_AMOUNT > 0) {
            this.isAutochange = true
            if (!this.rateEdited) {
              this.tokenValues.first = this.equalizeFirst
              this.tokenValues.rate = this.calculateRate
            } else {
              this.tokenValues.first = this.calculateFirst
            }
          } else {
            this.tokenValues.first = '0'
          }
        }, 200)

        setTimeout(() => {
          this.isAutochange = false
        }, 1000)

      }
    },
    'limitStore.GET_LIMIT_TOKEN_RATE': {
      handler() {
        clearTimeout(this.debounce)
        this.debounce = setTimeout(() => {
          if (this.limitStore.GET_LIMIT_FIRST_AMOUNT > 0) {
            this.isAutochange = true
            this.tokenValues.second = this.calculateSecond
          }
        }, 200)
        setTimeout(() => {
          this.isAutochange = false
        }, 1000)
      }
    },
  }
}

export default component
</script>

<style scoped>
.limit-page {
  display: flex;
  flex-direction: column;
  gap: 14px;
  width: 100%;
  max-width: 100%;
}
</style>
