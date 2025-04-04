<template>
    <div class="dex-page">
        <teleport defer to="#swap_header"
                  :disabled="screenSize > 576"
        >
            <SwapHeader
                :refreshInfo="refreshInfo"
                @refresh="refreshHandlerEvent('compareTokens')"
            />
        </teleport>
        <SwapInterfaceTest
            class="dex-page__interface"
            :ton-connect-ui="tonConnectUi"
            :routeInfo="GET_DEAL_CONDITIONS"
            :interfaceStatus="interfaceStatus"
            :swapMode="GET_SWAP_MODE"
        />
        <TokensPopup
            v-if="modals.token === true"
            :mode="tokenModalMode"
            @closePopup="modals.token = false"
        />
        <DexSettings
            v-if="modals.settings === true"
            @closeSettings="modals.settings = false"
        />
        <TransactionStatusModal
            v-if="successModalState.show === true"
            @closeModal="closeSuccess"
            :status="'pending'"
        />
<!--      Убрать trInfo и transaction из пропсов, поменять на геттеры -->

<!--        <DexSuccess-->
<!--            v-if="modals.success === true"-->
<!--            :trInfo="GET_TRANSACTION_INFO"-->
<!--            :transaction="GET_TRANSACTION_STATUS"-->
<!--            @closeSuccess="closeSuccess"-->
<!--        />-->
    </div>
</template>

<script lang="ts">
import SwapInterface from "@/components/swap-interface/SwapInterface.vue";
import SwapInterfaceTest from "@/components/swap-interface/SwapInterfaceTest.vue";
import {
    clearRequestInterval,
    dexTransaction,
    stakeTransaction,
    unstakeTransaction
} from "@/helpers/swap-interface/send-transaction.ts";
import {
    changeSettingsWatcher, expertModeWatcher,
    receiveAmountWatcher, receiveTokenWatcher,
    refreshAll,
    refreshDex,
    removeInterval,
    removeTimeout,
    sendAmountWatcher, sendTokenWatcher
} from "@/helpers/swap-interface/watchers.ts";
import DexTitle from "@/components/dex/DexTitle.vue";
import SwapHeader from "@/components/swap-interface/SwapHeader.vue";
import {defineAsyncComponent} from "vue";
import DexSuccess from "@/components/dex/DexSuccess.vue";
import TransactionStatusModal from "@/components/modals/TransactionStatusModal.vue";

import swapSettings from "@/mixins/swapSettings.ts";

import {useDexStore} from "@/stores/dex/index.ts";
import {useDexSettingsStore} from "@/stores/dex/settings.ts";
import {useTransactionStore} from "@/stores/transaction/index.ts";

export default {
    name: 'DexPageTest',
    components: {
        TransactionStatusModal,
	    DexSuccess,
	    SwapHeader,
        DexTitle,
        SwapInterfaceTest,
        TokensPopup: defineAsyncComponent(() => {
            return import("@/components/dex/tokens-popup/TokensPopup.vue")
        }),
        SwapInterface,
        DexSettings: defineAsyncComponent(() => {
            return import('@/components/modals/DexSettingsModal.vue');
        }),
    },
    mixins: [swapSettings],
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
            updateFirstToken: this.changeFirstToken,
            updateSecondToken: this.changeSecondToken,
            updateSettingsModalVisible: this.openSettingsModal,
            updateTokenModalVisible: this.openTokenModal,
            updateShowModal: this.closeSuccess,
            updateFirstValue: this.changeFirstValue,
            updateTokenPositions: this.swapTokenPositions,
            updateSecondValue: this.changeSecondValue,
            dexAction: this.dexAction,
            stakeTransaction: () => stakeTransaction(this.stakeTransactionData),
            unstakeTransaction: () => unstakeTransaction(this.stakeTransactionData),
            tokenValues: this.tokenValues,
            processing: this.processing,
            modalState: this.successModalState
        }
    },
    inject: ['updateWalletInfo'],
    data() {
        return {
            modals: {
                token: false,
                settings: false,
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

            tokenModalMode: 'SEND',
            refreshInfo: false,
            poolNotFound: false,
            abortController: null,

            transactionStatus: null,
            isVisible: true,
            tabVisibilityWatcher: null,
            pageLoaded: false,
            debounce: null,
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
        interfaceStatus() {
            let priceImpact = 0
            if (this.dexStore.GET_CALCULATED_PI) {
                priceImpact = this.dexStore.GET_CALCULATED_PI
            }
            if (this.poolNotFound || this.dexStore.GET_DEAL_CONDITIONS?.output_usd === 0) {
                return 'POOL_NOT_FOUND'
            } else if (this.loadingConditions || this.processing.dex === true || this.firstLoading) {
                return 'LOADING'
            } else if (this.dexStore.GET_DEX_WALLET === null) {
                return 'NOT_CONNECTED'
            } else if (this.dexStore.GET_RECEIVE_TOKEN === null) {
                return 'NOT_SELECTED'
            } else if (priceImpact < -this.dexSettingsStore.GET_PRICE_IMPACT) {
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
            return this.dexStore.GET_RECEIVE_TOKEN !== null && this.dexStore.GET_SEND_TOKEN !== null && this.dexStore.GET_SEND_AMOUNT > 0 && this.dexStore.GET_DEAL_CONDITIONS === null;
        },
        firstLoading() {
            let route = this.$route
            if (route.query?.ft && route.query?.st) {
                return this.dexStore.GET_DEAL_CONDITIONS === null && this.dexStore.GET_TON_TOKENS.length === 0
            }
        },
        notEnoughConditions() {
            const userTonBalance = this.dexStore.GET_USER_TOKENS.find(
                (item) => item.address === 'native'
            );

            const tonGas = this.dexStore.GET_DEAL_CONDITIONS?.recommended_gas + 0.00001;

            if (this.dexStore.GET_SEND_TOKEN?.address === 'native' && this.dexStore.GET_SWAP_MODE === 'default') {
                if (userTonBalance?.balance < tonGas + this.dexStore.GET_SEND_AMOUNT) {
                    return {result: true, reason: "noGas"};
                }
            } else if (this.dexStore.GET_SEND_TOKEN?.address === 'native' && this.dexStore.GET_SWAP_MODE === 'reverse') {
                if (userTonBalance?.balance < tonGas + this.dexStore.GET_RECEIVE_AMOUNT) {
                    return {result: true, reason: "noGas"};
                }
            }

            if (userTonBalance?.balance < tonGas) {
                return {result: true, reason: "noGas"};
            }

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

            return {result: false, reason: null};
        },
        assetForCompare() {
            return {
                wallet: this.dexStore.GET_DEX_WALLET,
                tokens: this.getTokens,
                tokenAmounts: this.tokenValues,
                maxIntermediate: this.dexSettingsStore.GET_MAX_INTERMEDIATE_TOKENS,
                maxVolatility: this.dexSettingsStore.GET_MAX_POOL_VOLATILITY,
                maxSplits: this.dexSettingsStore.GET_MAX_SPLITS,
                swapMode: this.dexStore.GET_SWAP_MODE,
                changePoolNotFound: this.changePoolNotFound,
                changeRefreshInfo: this.changeRefreshInfo,
                createAbortController: this.createAbortController,
                liquiditySources: this.dexSettingsStore.GET_LIQUIDITY_SOURCES
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
                liquiditySources: this.dexSettingsStore.GET_LIQUIDITY_SOURCES
            }
        },
        amountWatcherData() {
            return {
                tokens: this.getTokens,
                amounts: this.tokenValues,
                abortController: this.abortController,
                router: this.$router,
                route: this.$route,
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
                compareAsset: this.assetForCompare,
                showSuccess: this.successModalState.show,
                amounts: this.tokenValues,
                swapMode: this.dexStore.GET_SWAP_MODE,
                abortController: this.abortController,
                tabVisibility: this.isVisible
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
                updateProcessing: this.updateProcessing,
                wallet: this.dexStore.GET_DEX_WALLET,
                tokens: this.getTokens,
                amounts: this.tokenValues,
                tonConnectUi: this.tonConnectUi
            }
        },
        dexTransactionData() {
            return {
                updateProcessing: this.updateProcessing,
                compareAsset: this.assetForCompare,
                wallet: this.dexStore.GET_DEX_WALLET,
                dealConditions: this.dexStore.GET_DEAL_CONDITIONS,
                slippage: this.dexSettingsStore.GET_SLIPPAGE,
                tonConnectUi: this.tonConnectUi,
            }
        }
    },
    methods: {
        stakeTransaction,
        unstakeTransaction,
	    closeSuccess() {
		    this.successModalState.show = false
            clearRequestInterval()
		    this.transactionStore.SAVE_SWAP_TRANSACTION_STATUS(null)
		    this.updateWalletInfo()
		    this.tokenValues.first = '0'
            this.tokenValues.second = '0'
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
                    this.changeFirstValue(firstAmount)
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
        async dexAction() {
            try {
                if (this.interfaceStatus === 'NOT_CONNECTED') {
                    if (this.tonConnectUi?.wallet !== null) {
                        this.DEX_WALLET(this.tonConnectUi?.wallet?.account);
                    } else {
                        await this.showTonconnect();
                    }
                } else if (this.interfaceStatus === 'READY_DEX') {
                    removeInterval()
                    await dexTransaction(this.dexTransactionData)
                    this.successModalState.show = true
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
        refreshHandlerEvent(action) {
            if (action === 'compareTokens') {
                refreshAll(this.refreshData)
            }
        },
        observingTabVisibilityChange() {
            this.isVisible = !document.hidden;
            if (
                this.isVisible && Number(this.tokenValues.first) > 0
                || this.isVisible && Number(this.tokenValues.second) > 0
            ) {
                refreshDex(this.assetForCompare, this.successModalState.show, this.isVisible)
            } else {
                removeInterval()
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

        if (window?.Telegram?.WebApp && window.Telegram.WebApp.platform !== 'unknown') {
            window.Telegram.WebApp.ready();
            window.Telegram.WebApp.expand();
        }

        // if ((!this.GET_SEND_TOKEN || !this.GET_RECEIVE_TOKEN) && this.GET_TON_TOKENS) {
        //     setSwapTokensByQuery(this.$route, this.GET_TON_TOKENS)
        // }
    },
    unmounted() {
        document.removeEventListener('visibilitychange', this.observingTabVisibilityChange);
        removeTimeout()
        removeInterval()
    },
    watch: {
        'dexStore.GET_DEAL_CONDITIONS': {
            handler() {
                if (this.dexStore.GET_SWAP_MODE !== 'default') {
                    if (this.dexStore.GET_DEAL_CONDITIONS !== null) {
                        this.dexStore.GET_DEAL_CONDITIONS?.input_amount > 0
                            ? (this.tokenValues.first = this.dexStore.GET_DEAL_CONDITIONS.input_amount.toFixed(4))
                            : (this.tokenValues.first = '0');
                    } else {
                        this.tokenValues.first = '0';
                    }
                } else {
                    if (this.dexStore.GET_DEAL_CONDITIONS !== null) {
                        this.dexStore.GET_DEAL_CONDITIONS?.output_amount > 0
                            ? this.tokenValues.second = this.dexStore.GET_DEAL_CONDITIONS.output_amount.toFixed(4)
                            : this.tokenValues.second = '0'
                    } else {
                        this.tokenValues.second = '0'
                    }
                }
            }
        },
        'dexStore.GET_SEND_AMOUNT': {
            handler() {
                this.dexStore.CHANGE_SWAP_MODE('default');
                if (Number(this.tokenValues.first) !== this.dexStore.GET_SEND_AMOUNT && this.pageLoaded === false) {
                    this.tokenValues.first = String(this.dexStore.GET_SEND_AMOUNT)
                }

                sendAmountWatcher(this.amountWatcherData)

                if (this.GET_DEAL_CONDITIONS !== null) {
                    this.dexStore.DEX_DEAL_CONDITIONS(null);
                }
            },
        },
        'dexStore.GET_RECEIVE_AMOUNT': {
            handler() {
                this.dexStore.CHANGE_SWAP_MODE('reverse');
                if (Number(this.tokenValues.second) !== this.dexStore.GET_RECEIVE_AMOUNT && this.pageLoaded === false) {
                    this.tokenValues.second = String(this.dexStore.GET_RECEIVE_AMOUNT)
                }

                receiveAmountWatcher(this.amountWatcherData)

                if (this.GET_DEAL_CONDITIONS !== null) {
                    this.dexStore.DEX_DEAL_CONDITIONS(null);
                }
            },
        },
        'dexSettingsStore.GET_LIQUIDITY_SOURCES': {
            handler() {
                changeSettingsWatcher(this.changeSettingsWatcherData)
            }
        },
        'dexStore.GET_SEND_TOKEN': {
            handler() {
                sendTokenWatcher(this.tokenWatcherData)
            },
        },
        'dexSettingsStore.GET_MAX_SPLITS': {
            handler() {
                sendTokenWatcher(this.tokenWatcherData)
            },
        },
        'dexStore.GET_RECEIVE_TOKEN': {
            handler() {
                receiveTokenWatcher(this.tokenWatcherData)
            },
        },
        'dexSettingsStore.GET_SLIPPAGE': {
            handler() {
                changeSettingsWatcher(this.changeSettingsWatcherData)
            },
        },
        'dexSettingsStore.GET_MAX_POOL_VOLATILITY': {
            handler() {
                changeSettingsWatcher(this.changeSettingsWatcherData)
            },
        },
        'dexSettingsStore.GET_MAX_INTERMEDIATE_TOKENS': {
            handler() {
                changeSettingsWatcher(this.changeSettingsWatcherData)
            },
        },
        'dexSettingsStore.GET_EXPERT_MODE_VALUE': {
            handler() {
                expertModeWatcher(this.changeSettingsWatcherData)
            },
        },
    }
}
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
