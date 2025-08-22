<template>
  <div class="dex-page">
    <teleport defer to="#swap_header"
              :disabled="screenSize > 576"
    >
      <SwapHeader
          :refreshInfo="refreshInfo"
          :isListedPair="isListedPair"
          @updateRoute="updateRoute"
          @updateBalances="updateBalances"
      />
    </teleport>
    <SwapInterface
        :routeInfo="dexStore.GET_DEAL_CONDITIONS"
        :interfaceStatus="interfaceStatus"
        :swapMode="dexStore.GET_SWAP_MODE"
        :isListedPair="isListedPair"
    />
    <TokensPopup
        v-if="modals.token === true"
        :mode="tokenModalMode"
        @closePopup="modals.token = false"
    />
    <SwapSettingsModal
        v-if="modals.settings === true"
        :isListedPair="isListedPair"
        @closeModal="modals.settings = false"
    />
    <TransactionStatusModal
        v-if="successModalState.show === true"
        :status="getTransactionStatus"
        @closeModal="closeSuccess"
    />
  </div>
</template>

<script lang="ts">
import {Address} from "@ton/core";
import {defineAsyncComponent, defineComponent} from "vue";

import SwapInterface from "@/components/swap-interface/SwapInterface.vue";
import SwapHeader from "@/components/swap-interface/SwapHeader.vue";
import TransactionStatusModal from "@/components/modals/TransactionStatusModal.vue";
import swapSettings from "@/mixins/swapSettings.ts";
import methodsMixins from '@/mixins/methodsMixins.ts';
import {useDexStore} from "@/stores/dex/index.ts";
import {useDexSettingsStore} from "@/stores/dex/settings.ts";
import {useTransactionStore} from "@/stores/transaction/index.ts";
import {DEFAULT_ADDRESSES, ReadonlySdkEvent} from "@/utils/consts.ts";

import * as SwapRouting from "@/helpers/swap-routing";
import {dispatchSdkEvent} from "@/helpers/events";
import numberFormatting from "@/mixins/numberFormatting.ts";

import {
  dexTransaction,
  stakeTransaction,
  unstakeTransaction
} from "@/helpers/swap-interface/send-transaction.ts";
import {changeMaxSplits} from "@/helpers/swap-interface/swap-settings.ts";

export default defineComponent({
  name: 'DexPageTest',
  components: {
    SwapHeader,
    SwapInterface,
    TransactionStatusModal,
    TokensPopup: defineAsyncComponent(() => {
      return import("@/components/dex/tokens-popup/TokensPopup.vue")
    }),
    SwapSettingsModal: defineAsyncComponent(() => {
      return import('@/components/modals/SwapSettingsModal.vue');
    }),
  },
  mixins: [swapSettings, numberFormatting, methodsMixins],
  props: {
    tonConnectUi: {
      type: Object,
      default() {
        return {};
      },
    },
    screenSize: {
      type: Number,
      required: true
    }
  },
  provide() {
    return {
      updateToken: this.changeToken,
      updateTokenValue: this.changeTokenValue,
      updateSettingsModalVisible: this.openSettingsModal,
      updateTokenModalVisible: this.openTokenModal,
      updateShowModal: this.closeSuccess,
      updateMevModal: this.openMevModal,
      updateTokenPositions: this.swapTokenPositions,
      dexAction: this.dexAction,
      stakeTransaction: () => stakeTransaction(this.stakeTransactionData),
      unstakeTransaction: () => unstakeTransaction(this.stakeTransactionData),
      isUpdatingBalances: () => this.isUpdatingBalances,
      tokenValues: this.tokenValues,
      processing: this.processing,
      modalState: this.successModalState,
      addNewAsset: () => {} 
    }
  },
  inject: ['updateWalletInfo', 'sendReceiveTokenAddresses', 'firstTokenAmount', 'customFeeSettings', 'widgetReferral'],
  data() {
    return {
      modals: {
        token: false,
        settings: false,
        mevSettings: false
      },
      successModalState: {
        mode: 'swap',
        show: false
      },
      tokenValues: {
        first: '0',
        second: '0'
      },
      processing: {
        dex: false,
        stake: false,
        unstake: false
      },

      tokenModalMode: 'first',
      refreshInfo: false,
      poolNotFound: false,

      transactionStatus: null,
      isVisible: true,
      tabVisibilityWatcher: null,
      pageLoaded: false,
      debounce: null,
      isOnlyCoffeeSourceOnly: false,
      isUpdatingBalances: false,
      balanceUpdateCooldown: false
    }
  },
  computed: {
    dexStore() {
      return useDexStore()
    },
    dexSettingsStore() {
      return useDexSettingsStore()
    },
    transactionStore() {
      return useTransactionStore()
    },
    isListedPair() {
      return !this.exceptionCondition && this.dexStore.GET_SEND_TOKEN?.listed
    },
    exceptionCondition() {
      const mevDisabled = [
        'EQCAj5oiRRrXokYsg_B-e0KG9xMwh5upr5I8HQzErm0_BLUM',
        "EQA2XBW7MAbSjq5n7tW2_SRlr0XqwJZU0L6u6mLFMKdC5S4Z",
        "EQBE_gBrU3mPI9hHjlJoR_kYyrhQgyCFD6EUWfa42W8T7EBP"
      ]
      const sendFriendly = this.dexStore.GET_SEND_TOKEN && this.dexStore.GET_SEND_TOKEN?.address !== 'native'
          ? Address.parse(this.dexStore.GET_SEND_TOKEN?.address).toString()
          : ''

      return mevDisabled.includes(sendFriendly)
    },
    interfaceStatus() {
      let priceImpact = 0
      if (this.dexStore.GET_CALCULATED_PI) {
        priceImpact = this.dexStore.GET_CALCULATED_PI
      }
      if (this.poolNotFound) {
        return 'POOL_NOT_FOUND'
      } else if (this.loadingConditions || this.processing.dex === true || this.firstLoading) {
        return 'LOADING'
      } else if (this.dexStore.GET_DEX_WALLET === null) {
        return 'NOT_CONNECTED'
      } else if (this.dexStore.GET_RECEIVE_TOKEN === null) {
        return 'NOT_SELECTED'
      } else if ((priceImpact < -this.dexSettingsStore.GET_PRICE_IMPACT) && this.dexStore.GET_DEAL_CONDITIONS !== null) {
        return 'HIGH_PRICE_IMPACT'
      } else if (this.notEnoughConditions.reason === "noBalance") {
        return 'NOT_ENOUGH'
      } else if (this.notEnoughConditions.reason === "noGas") {
        return 'NOT_ENOUGH_GAS'
      } else {
        return 'READY_DEX'
      }
    },
    loadingConditions() {
      return (this.dexStore.GET_SEND_AMOUNT > 0 || this.dexStore.GET_RECEIVE_AMOUNT > 0) && this.dexStore.GET_DEAL_CONDITIONS === null;
    },
    firstLoading() {
      return this.dexStore.GET_DEAL_CONDITIONS === null && this.dexStore.GET_TON_TOKENS.length === 0
    },
    notEnoughConditions() {
      const userTonBalance = this.dexStore.GET_USER_TOKENS.find(
          (item) => item.address === 'native'
      );

      const {
        mev_protection_fee = 0,
        recommended_gas = 0
      } = this.dexStore.GET_DEAL_CONDITIONS || {};

      const tonGas = recommended_gas + mev_protection_fee + 0.00001;

      const findTokenInUser = this.dexStore.GET_USER_TOKENS.find(
          (item) => item.address === this.dexStore.GET_SEND_TOKEN?.address
      );

      const hasEnoughBalance =
          findTokenInUser &&
          findTokenInUser?.balance >= this.dexStore.GET_DEAL_CONDITIONS?.input_amount &&
          this.dexStore.GET_DEAL_CONDITIONS?.input_amount > 0;

      if (!hasEnoughBalance) {
        return {result: true, reason: "noBalance"};
      }

      if (this.dexStore.GET_SEND_TOKEN?.address === 'native' && this.dexStore.GET_SWAP_MODE === 'default') {
        if (userTonBalance?.balance < tonGas + this.dexStore.GET_SEND_AMOUNT) {
          return {result: true, reason: "noGas"};
        }
      } else if (this.dexStore.GET_SEND_TOKEN?.address === 'native' && this.dexStore.GET_SWAP_MODE === 'reverse') {
        if (userTonBalance?.balance < tonGas + this.dexStore.GET_DEAL_CONDITIONS?.input_amount) {
          return {result: true, reason: "noGas"};
        }
      }

      if (userTonBalance?.balance < tonGas) {
        return {result: true, reason: "noGas"};
      }

      return {result: false, reason: null};
    },
    mevCondition() {
      return this.dexSettingsStore.GET_MEV_PROTECTION_VALUE && this.isListedPair && ((Number(this.tokenValues?.first) * Number(this.getTokens?.first?.price_usd)) >= Number(this.dexSettingsStore.GET_MEV_MIN_USD))
    },
    smartModeReady() {
      return this.dexSettingsStore.GET_SMART_MODE_VALUE && this.isListedPair
    },
    baseSwapInfo() {
      return {
        tokens: this.getTokens,
        amounts: this.tokenValues
      }
    },
    baseCompareAsset() {
      return {
        ...this.baseSwapInfo,
        wallet: this.dexStore.GET_DEX_WALLET,
        swapMode: this.dexStore.GET_SWAP_MODE,
      }
    },
    compareActions() {
      return {
        changePoolNotFound: this.changePoolNotFound,
        changeRefreshInfo: this.changeRefreshInfo,
        createAbortController: this.createAbortController,
      }
    },
    assetForCompare() {
      let splits = this.dexSettingsStore.GET_MAX_SPLITS
      if (!this.dexStore.GET_DEX_WALLET && this.dexSettingsStore.GET_MAX_SPLITS > 4) {
        splits = 4
      }
      
      return {
        ...this.baseCompareAsset,
        ...this.compareActions,
        maxIntermediate: this.dexSettingsStore.GET_MAX_INTERMEDIATE_TOKENS,
        maxVolatility: this.dexSettingsStore.GET_MAX_POOL_VOLATILITY,
        maxSplits: splits,
        liquiditySources: this.isOnlyCoffeeSourceOnly ? ["coffee"] : this.dexSettingsStore.GET_LIQUIDITY_SOURCES,
        mevProtection: this.mevCondition,
        customFeeSettings: this.customFeeSettings,
        widgetReferral: this.widgetReferral,
      }
    },
    assetForSmartCompare() {
      return {
        ...this.baseCompareAsset,
        ...this.compareActions,
        smartRoutingUpdater: this.startRoutingUpdater,
        maxSplits: this.dexStore.GET_DEX_WALLET_VERSION >= 5 ? 20 : 4,
        isSmartMode: this.dexSettingsStore.GET_SMART_MODE_VALUE
      }
    },
    getTokens() {
      return {
        first: this.dexStore.GET_SEND_TOKEN,
        second: this.dexStore.GET_RECEIVE_TOKEN
      }
    },
    generalData() {
      return {
        tokens: this.getTokens,
        amounts: this.tokenValues,
        dealConditions: this.dexStore.GET_DEAL_CONDITIONS,
        liquiditySources: this.isOnlyCoffeeSourceOnly ? ["coffee"] : this.dexSettingsStore.GET_LIQUIDITY_SOURCES
      }
    },
    amountWatcherData() {
      return {
        ...this.baseSwapInfo,
        abortController: this.abortController,
        refreshData: this.refreshData
      }
    },
    tokenWatcherData() {
      return {
        ...this.generalData,
        stakingPool: this.dexStore.GET_STAKING_POOL,
        refreshData: this.refreshData
      }
    },
    changeSettingsWatcherData() {
      return {
        ...this.generalData,
        refreshData: this.refreshData
      }
    },
    refreshData() {
      return {
        compareAsset: this.smartModeReady ? this.assetForSmartCompare : this.assetForCompare,
        showSuccess: this.successModalState.show,
        abortController: this.abortController,
        tabVisibility: this.isVisible,
        refreshCallback: SwapRouting.compareTokens
      }
    },
    trackingData() {
      return {
        ...this.generalData,
        wallet: this.dexStore.GET_DEX_WALLET
      }
    },
    stakeTransactionData() {
      return {
        ...this.baseSwapInfo,
        updateProcessing: this.updateProcessing,
        wallet: this.dexStore.GET_DEX_WALLET,
        tonConnectUi: this.tonConnectUi
      }
    },
    dexTransactionData() {
      return {
        updateProcessing: this.updateProcessing,
        compareAsset: this.smartModeReady ? this.assetForSmartCompare : this.assetForCompare,
        wallet: this.dexStore.GET_DEX_WALLET,
        dealConditions: this.dexStore.GET_DEAL_CONDITIONS,
        tonConnectUi: this.tonConnectUi,
        trackingData: this.trackingData,
        mevProtection: this.mevCondition,
        slippage: this.smartModeReady ? false : this.dexSettingsStore.GET_SLIPPAGE,
        widgetReferral: this.widgetReferral,
        customFeeSettings: this.customFeeSettings,
      }
    },
    getTransactionStatus() {
      const trResult = this.transactionStore.GET_SWAP_TRANSACTION_STATUS
      if (trResult !== null) {
        return trResult.status
      }
      return 'pending'
    }
  },
  methods: {
    stakeTransaction,
    unstakeTransaction,
    closeSuccess() {
      this.successModalState.show = false
      this.transactionStore.SAVE_SWAP_TRANSACTION_STATUS(null)
      SwapRouting.removeRefreshInterval()
      this.updateRoute()
      this.tokenValues.first = '0'
      this.tokenValues.second = '0'
    },
    openSettingsModal() {
      this.modals.settings = true
    },
    async updateRoute() {
      SwapRouting.refreshAll(this.refreshData)

      if (this.dexStore.GET_DEX_WALLET && !this.balanceUpdateCooldown) {
        await this.updateBalances()
      }
    },
    async updateBalances() {
      if (!this.dexStore.GET_DEX_WALLET || this.balanceUpdateCooldown) {
        return
      }

      this.balanceUpdateCooldown = true
      this.isUpdatingBalances = true
      this.changeRefreshInfo(true)

      try {
        await this.updateWalletInfo()
      } finally {
        this.isUpdatingBalances = false

        setTimeout(() => {
          this.balanceUpdateCooldown = false
          this.changeRefreshInfo(false)
        }, 1500)
      }
    },
    openMevModal() {
      this.modals.mevSettings = true
    },
    openTokenModal(value) {
      this.tokenModalMode = value
      this.modals.token = true
    },
    changeTokenValue(data) {
      this.tokenValues[data.key] = data.value

      data.key === 'first'
        ? this.dexStore.DEX_SEND_AMOUNT(Number(data.value))
        : this.dexStore.DEX_RECEIVE_AMOUNT(Number(data.value))
    },
    changeToken(key, value) {
      key === 'first'
        ? this.dexStore.DEX_SEND_TOKEN(value)
        : this.dexStore.DEX_RECEIVE_TOKEN(value)
    },
    changeFirstValue(value) {
      this.tokenValues.first = value
      this.dexStore.DEX_SEND_AMOUNT(Number(value))
    },
    changeSecondValue(value) {
      this.tokenValues.second = value
      this.dexStore.DEX_RECEIVE_AMOUNT(Number(value))
    },
    changeFirstToken(value) {
      this.dexStore.DEX_SEND_TOKEN(value)
    },
    changeSecondToken(value) {
      this.dexStore.DEX_RECEIVE_TOKEN(value)
    },
    swapTokenPositions() {
      if (this.dexStore.GET_SEND_TOKEN !== null && this.dexStore.GET_RECEIVE_TOKEN !== null) {
        clearTimeout(this.debounce)
        this.debounce = setTimeout(() => {
          let first = this.dexStore.GET_RECEIVE_TOKEN
          let second = this.dexStore.GET_SEND_TOKEN
          this.dexStore.DEX_SEND_TOKEN(first)
          this.dexStore.DEX_RECEIVE_TOKEN(second)

          let firstAmount = this.tokenValues.second
          this.changeTokenValue({ key: 'first', value: firstAmount })
        }, 200)
      }
    },
    changePoolNotFound(value) {
      this.poolNotFound = value
    },
    changeRefreshInfo(value) {
      this.refreshInfo = value
    },
    createAbortController() {
      this.abortController = new AbortController()
    },
    startRoutingUpdater() {
      this.smartModeReady
        ? SwapRouting.setSmartRefreshTimeout(this.assetForSmartCompare, this.successModalState.show, this.isVisible, SwapRouting.compareTokens)
        : SwapRouting.setRefreshInterval(this.assetForCompare, this.successModalState.show, this.isVisible, SwapRouting.compareTokens)
    },
    async dexAction() {
      try {
        if (this.interfaceStatus === 'NOT_CONNECTED') {
          if (this.tonConnectUi?.wallet !== null) {
            this.dexStore.DEX_WALLET(this.tonConnectUi?.wallet?.account);
          } else {
            await this.showTonconnect();
          }
        } else if (this.interfaceStatus === 'READY_DEX') {
          SwapRouting.removeRefreshInterval();
          await dexTransaction(this.dexTransactionData);

          this.successModalState.mode = 'swap';
          this.successModalState.show = true;
        }
      } catch (err) {
        // юзер отказался от транзакции, ничего не делаем
      }
    },
    async showTonconnect() {
      try {
        await this.tonConnectUi.openModal();
      } catch (err) {
        console.error(err);
      }
    },
    updateProcessing(value, mode) {
      switch (mode) {
        case "dex":
          this.processing.dex = value;
          break;
        case "stake":
          this.processing.stake = value;
          break;
        case "unstake":
          this.processing.unstake = value;
          break;
      }
    },
    observingTabVisibilityChange() {
      this.isVisible = !document.hidden;
      if (
          this.isVisible && Number(this.tokenValues.first) > 0
          || this.isVisible && Number(this.tokenValues.second) > 0
      ) {
        this.startRoutingUpdater()
      } else {
        SwapRouting.removeRefreshInterval()
      }
    },
    toRawAddress(address) {
      try {
        if (address === '0:0000000000000000000000000000000000000000000000000000000000000000') {
          return "native";
        }
        const parsedAddress = Address.parseFriendly(address);
        return parsedAddress.address.toRawString();
      } catch (error) {
        return address;
      }
    },
    setDexTokens() {
      const startTokensAddresses: string[] = this.sendReceiveTokenAddresses?.length > 0 ?
          this.sendReceiveTokenAddresses
          : DEFAULT_ADDRESSES

      const rawAddresses: string[] = startTokensAddresses.map(addr => this.toRawAddress(addr));

      const startTokens = this.dexStore.GET_TON_TOKENS.filter(token =>
          rawAddresses.includes(token.address)
      );

      const [rawSend, rawReceive] = rawAddresses

      const sendToken = startTokens?.find(t => this.toRawAddress(t?.address) === rawSend)
      const receiveToken = startTokens?.find(t => this.toRawAddress(t?.address) === rawReceive)

      this.dexStore.DEX_SEND_TOKEN(sendToken);
      this.dexStore.DEX_RECEIVE_TOKEN(receiveToken);

      if (this.firstTokenAmount) {
        this.changeFirstValue(String(this.firstTokenAmount));
      }
    },
    checkWindowSize() {
      this.screenSize = window.innerWidth
    }
  },
  mounted() {
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.modals.token = false
      }
    })

    document.addEventListener('visibilitychange', this.observingTabVisibilityChange);

    if ((window as any)?.Telegram?.WebApp && (window as any).Telegram.WebApp.platform !== 'unknown') {
      (window as any).Telegram.WebApp.ready();
      (window as any).Telegram.WebApp.expand();
    }

    const liquiditySource = history.state?.liquiditySource;

    if (liquiditySource && liquiditySource === "coffee") {
      this.isOnlyCoffeeSourceOnly = true;
    }
  },
  beforeRouteLeave(to, from, next) {
    if (history.state?.liquiditySource) {
      this.clearHistoryStateKey('liquiditySource');
    }
    next();
  },
  unmounted() {
    document.removeEventListener('visibilitychange', this.observingTabVisibilityChange);
    SwapRouting.removeRefreshDebounce()
    SwapRouting.removeRefreshInterval()
    this.dexStore.DEX_DEAL_CONDITIONS(null)
  },
  watch: {
    'transactionStore.GET_SWAP_TRANSACTION_STATUS': {
      handler(newStatus) {
        if (newStatus === null) {
          SwapRouting.removeRefreshInterval()
        }
      },
    },
    'dexStore.GET_DEX_WALLET': {
      handler() {
        if (!this.dexStore.GET_DEX_WALLET && this.dexSettingsStore.GET_MAX_SPLITS > 4) {
          changeMaxSplits(4)
        }
      },
    },
    'dexStore.GET_TON_TOKENS': {
      handler() {
        if (!this.dexStore.GET_SEND_TOKEN && !this.dexStore.GET_RECEIVE_TOKEN) {
          this.setDexTokens();
        }

        if (this.dexStore.GET_SEND_TOKEN && this.dexStore.GET_SEND_TOKEN?.address !== 'native') {
          const receiveTokenBalance = this.dexStore.GET_TON_TOKENS.find(t => t.address === this.dexStore.GET_SEND_TOKEN?.address)?.balance ?? 0

          this.dexStore.DEX_SEND_TOKEN({
            ...this.dexStore.GET_SEND_TOKEN,
            balance: receiveTokenBalance
          })
        } else {
          const balanceTon = this.dexStore.GET_TON_TOKENS.find(t => t.address === 'native')?.balance ?? 0
          this.dexStore.DEX_SEND_TOKEN({
            ...this.dexStore.GET_SEND_TOKEN,
            balance: balanceTon
          })
        }

        if (this.dexStore.GET_RECEIVE_TOKEN && this.dexStore.GET_RECEIVE_TOKEN?.address !== 'native') {
          const receiveTokenBalance = this.dexStore.GET_TON_TOKENS.find(t => t.address === this.dexStore.GET_RECEIVE_TOKEN?.address)?.balance ?? 0

          this.dexStore.DEX_RECEIVE_TOKEN({
            ...this.dexStore.GET_RECEIVE_TOKEN,
            balance: receiveTokenBalance
          })
        } else {
          const balanceTon = this.dexStore.GET_TON_TOKENS.find(t => t.address === 'native')?.balance ?? 0
          this.dexStore.DEX_RECEIVE_TOKEN({
            ...this.dexStore.DEX_RECEIVE_TOKEN,
            balance: balanceTon
          })
        }
      }
    },
    'dexStore.GET_DEAL_CONDITIONS': {
      handler() {
        if (this.dexStore.GET_DEAL_CONDITIONS !== null) {
          dispatchSdkEvent(ReadonlySdkEvent.ROUTE_BUILT, this.dexStore.GET_DEAL_CONDITIONS);
        }

        if (this.dexStore.GET_SWAP_MODE !== 'default') {
          if (this.dexStore.GET_DEAL_CONDITIONS !== null) {
            this.tokenValues.first = this.formattedAmountNumber(this.dexStore.GET_DEAL_CONDITIONS.input_amount)
          } else {
            this.tokenValues.first = '0';
          }
        } else {
          if (this.dexStore.GET_DEAL_CONDITIONS !== null) {
            this.tokenValues.second = this.formattedAmountNumber(this.dexStore.GET_DEAL_CONDITIONS.output_amount)
          } else {
            this.tokenValues.second = '0'
          }
        }
      }
    },
    'dexSettingsStore.GET_MEV_PROTECTION_VALUE': {
      handler() {
        SwapRouting.changeSettingsWatcher(this.changeSettingsWatcherData)
      }
    },
    'dexSettingsStore.GET_MEV_MIN_USD': {
      handler() {
        SwapRouting.changeSettingsWatcher(this.changeSettingsWatcherData)
      }
    },
    'dexStore.GET_SEND_AMOUNT': {
      handler() {
        if (this.dexStore.GET_SEND_AMOUNT > 0) {
          this.dexStore.CHANGE_SWAP_MODE('default');
          if (this.dexStore.GET_RECEIVE_AMOUNT > 0) this.dexStore.DEX_RECEIVE_AMOUNT(0)
          
          if (Number(this.tokenValues.first) !== this.dexStore.GET_SEND_AMOUNT && this.pageLoaded === false) {
            this.tokenValues.first = String(this.dexStore.GET_SEND_AMOUNT)
          }
          
          SwapRouting.sendAmountWatcher(this.amountWatcherData)
          
          if (this.dexStore.GET_DEAL_CONDITIONS !== null) {
            this.dexStore.DEX_DEAL_CONDITIONS(null);
          }
        } else if (this.dexStore.GET_SWAP_MODE === 'default') {
          this.tokenValues.second = '0'
        }
      },
    },
    'dexStore.GET_RECEIVE_AMOUNT': {
      handler() {
        if (this.dexStore.GET_RECEIVE_AMOUNT > 0) {
          this.dexStore.CHANGE_SWAP_MODE('reverse');
          if (this.dexStore.GET_SEND_AMOUNT > 0) this.dexStore.DEX_SEND_AMOUNT(0)
          
          if (Number(this.tokenValues.second) !== this.dexStore.GET_RECEIVE_AMOUNT && this.pageLoaded === false) {
            this.tokenValues.second = String(this.dexStore.GET_RECEIVE_AMOUNT)
          }
          
          SwapRouting.receiveAmountWatcher(this.amountWatcherData)
          
          if (this.dexStore.GET_DEAL_CONDITIONS !== null) {
            this.dexStore.DEX_DEAL_CONDITIONS(null);
          }
        } else if (this.dexStore.GET_SWAP_MODE === 'reverse') {
          this.tokenValues.first = '0'
        }
      },
    },
    'dexSettingsStore.GET_LIQUIDITY_SOURCES': {
      handler() {
        SwapRouting.changeSettingsWatcher(this.changeSettingsWatcherData)
      }
    },
    'dexStore.GET_SEND_TOKEN': {
      handler(newToken, oldToken) {
        if (newToken?.address === oldToken?.address) {
          return
        }

        SwapRouting.sendTokenWatcher(this.tokenWatcherData)
      },
    },
    'dexSettingsStore.GET_MAX_SPLITS': {
      handler() {
        SwapRouting.sendTokenWatcher(this.tokenWatcherData)
      },
    },
    'dexStore.GET_RECEIVE_TOKEN': {
      handler(newToken, oldToken) {
        if (newToken?.address === oldToken?.address) {
          return
        }

        SwapRouting.receiveTokenWatcher(this.tokenWatcherData)
      },
    },
    'dexSettingsStore.GET_SLIPPAGE': {
      handler() {
        SwapRouting.changeSettingsWatcher(this.changeSettingsWatcherData)
      },
    },
    'dexSettingsStore.GET_MAX_POOL_VOLATILITY': {
      handler() {
        SwapRouting.changeSettingsWatcher(this.changeSettingsWatcherData)
      },
    },
    'dexSettingsStore.GET_MAX_INTERMEDIATE_TOKENS': {
      handler() {
        SwapRouting.changeSettingsWatcher(this.changeSettingsWatcherData)
      },
    },
    'dexSettingsStore.GET_EXPERT_MODE_VALUE': {
      handler() {
        SwapRouting.expertModeWatcher(this.changeSettingsWatcherData)
      },
    },
    'dexSettingsStore.GET_SMART_MODE_VALUE': {
      handler() {
        SwapRouting.changeSettingsWatcher(this.changeSettingsWatcherData)
      }
    }
  }
} as any)
</script>

<style scoped>
.dex-page {
  display: flex;
  flex-direction: column;
  gap: 14px;
  width: 400px;
  max-width: 400px;
}

@media screen and (max-width: 1220px) {
  .dex-page {
    width: 440px;
    max-width: 440px;
    margin: 0 auto;
  }
}

@media screen and (max-width: 576px) {
  .dex-page {
    width: 100%;
    max-width: 100%;
  }
}
</style>

