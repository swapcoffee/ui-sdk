<template>
    <div class="dca-page">
        <teleport defer to="#swap_header"
                  :disabled="screenSize >= 576"
        >
            <SwapHeader />
        </teleport>
        <SwapInterfaceTest
            class="dca-page__interface"
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
    </div>
</template>

<script lang="ts">
import {Address} from "@ton/core";

import DexSuccess from "@/components/dex/DexSuccess.vue";
import SwapInterfaceTest from "@/components/swap-interface/SwapInterfaceTest.vue";
import SwapHeader from "@/components/swap-interface/SwapHeader.vue";
import LimitSettingsModal from "@/components/modals/LimitSettingsModal.vue";
import TokensPopup from "@/components/dex/tokens-popup/TokensPopup.vue";
import LimitOrdersHistory from "@/components/limit/LimitOrdersHistory.vue";
import TransactionStatusModal from "@/components/modals/TransactionStatusModal.vue";

import {strategiesService, tokenService} from "@/api/coffeeApi/services";

import {
    cancelOrder,
    checkStrategiesWallet,
    createOrder,
    createStrategiesWallet,
    removeLimitCheckerInterval
} from "@/helpers/strategies/strategies.ts";

import resetLimitTokens from "@/mixins/resetLimitTokens";

import {useDexStore} from "@/stores/dex";
import {useLimitStore} from "@/stores/limit";
import {useLimitSettingsStore} from "@/stores/limit/settings.ts";
import {useDcaStore} from "@/stores/dca";
import {useTransactionStore} from "@/stores/transaction";

export default {
    name: "DcaPage",
    components: {
        TransactionStatusModal,
        LimitOrdersHistory, TokensPopup, LimitSettingsModal, SwapHeader, SwapInterfaceTest, DexSuccess},
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
    mixins: [resetLimitTokens],
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
            tokenValues: this.tokenValues,
            processing: this.processing,
            limitAction: this.dcaAction,
            cancelAction: this.cancelAction,
            modalState: this.successModalState
        }
    },
    data() {
        return {
            modals: {
                token: false,
                settings: false
            },
            successModalState: {
                mode: null,
                show: false
            },
            processing: {
                dca: false,
                createWallet: false,
                cancel: false
            },
            tokenValues: {
                first: '0',
            },
            isSwapPositions: false,
            tokenModalMode: 'SEND',
            debounce: null,
            usdtAddress: "0:b113a994b5024a16719f69139328eb759596c38a25f59028b146fecdc3621dfe",
            historyLength: 0,
            pageLoaded: false,
            historyActiveLength: false,
        }
    },
    computed: {
        dexStore() {
          return useDexStore()
        },
        limitStore() {
          return useLimitStore()
        },
        limitSettingsStore() {
            return useLimitSettingsStore()
        },
        dcaStore() {
          return useDcaStore()
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
                return this.getDcaTransactionStatus
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
        getDcaTransactionStatus() {
            if (this.historyLength === this.limitStore.GET_LIMIT_HISTORY.length) {
                return 'pending'
            } else if (this.limitStore.GET_LIMIT_HISTORY.length > this.historyLength) {
                removeLimitCheckerInterval()
                return 'success'
            }
        },
        setDcaTransactionInfo() {
            return {
                firstToken: this.getTokens?.first,
                secondToken: this.getTokens?.second,
                firstAmount: Number(this.tokenValues?.first),
                secondAmount: 0,
                slippage: this.getSlippage,
                maxSuborders: this.limitSettingsStore.GET_LIMIT_SUBORDERS,
                maxInvocations: this.limitSettingsStore.GET_LIMIT_INVOCATIONS * this.limitSettingsStore.GET_LIMIT_SUBORDERS,
                intervalSec: this.dcaStore.GET_DCA_EVERY_TIME
            }
        },
        setCreateOrderBody() {
            return {
                type: "dca",
                token_from: {
                    blockchain: "ton",
                    address: this.getTokens?.first?.address
                },
                token_to: {
                    blockchain: "ton",
                    address: this.getTokens?.second?.address
                },
                input_amount: (this.tokenValues?.first * Math.pow(10, this.getTokens.first?.decimals)).toString(),
                slippage: this.getSlippage,
                max_suborders: this.limitSettingsStore.GET_LIMIT_SUBORDERS,
                max_invocations: this.limitSettingsStore.GET_LIMIT_SUBORDERS * this.limitSettingsStore.GET_LIMIT_INVOCATIONS,
                settings: this.getOrderSettings
            }
        },
        getOrderSettings() {
            let asset = {
                delay: this.dcaStore.GET_DCA_EVERY_TIME
            }
            if (this.dcaStore.GET_DCA_ENABLE_RANGE && this.dcaStore.GET_MAX_RANGE !== null && this.dcaStore.GET_MIN_RANGE !== null) {
                asset.price_range_from = this.dcaStore.GET_MIN_RANGE < this.dcaStore.GET_MAX_RANGE
                    ? this.dcaStore.GET_MIN_RANGE
                    : this.dcaStore.GET_MAX_RANGE
                asset.price_range_to = this.dcaStore.GET_MIN_RANGE < this.dcaStore.dcaStore.GET_MAX_RANGE
                    ? this.dcaStore.GET_MAX_RANGE
                    : this.dcaStore.GET_MIN_RANGE
            }

            return asset
        },
        interfaceStatus() {
            if (this.processing.dca === true) {
                return 'LOADING'
            } else if (this.dexStore.GET_DEX_WALLET === null) {
                return 'NOT_CONNECTED'
            } else if (!this.limitStore.GET_STRATEGIES_ELIGIBLE) {
                return 'NOT_ELIGIBLE'
            } else if (this.limitStore.GET_STRATEGIES_ELIGIBLE && !this.limitStore.GET_STRATEGIES_WALLET) {
                return 'NOT_STRATEGIES_WALLET'
            } else if (this.limitStore.GET_LIMIT_FIRST_AMOUNT === 0 && (this.tokenValues.first.length === 0 || Number(this.tokenValues.first) === 0)) {
                return 'NOT_AMOUNT'
            } else if (this.notEnoughConditions.reason === "noBalance") {
                return 'NOT_ENOUGH'
            } else if (this.dcaStore.GET_DCA_ENABLE_RANGE && !this.dcaStore.GET_MIN_RANGE || this.dcaStore.GET_DCA_ENABLE_RANGE && !this.dcaStore.GET_MAX_RANGE) {
                return 'NOT_RANGE'
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
        getSlippage() {
            return (this.getTokens.first?.address === 'native' || this.getTokens.second?.address === this.usdtAddress)
            && (this.getTokens.first?.address === this.usdtAddress || this.getTokens.second?.address === 'native')
                ? 0.01
                : 0.001
        },
    },
    methods: {
        closeSuccess() {
            this.successModalState.show = false
            this.successModalState.mode = null
            this.clearValues()
            this.transactionStore.SAVE_LIMIT_TRANSACTION_INFO(null)
            this.historyLength = 0
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
        swapTokenPositions() {
            clearTimeout(this.debounce)
            this.debounce = setTimeout(() => {
                this.isSwapPositions = true
                let first = this.limitStore.GET_LIMIT_SECOND_TOKEN
                let second = this.limitStore.GET_LIMIT_FIRST_TOKEN
                this.limitStore.LIMIT_FIRST_TOKEN(first)
                this.limitStore.LIMIT_SECOND_TOKEN(second)

                setTimeout(() => {
                    this.isSwapPositions = false
                }, 100)
            }, 200)
        },
        clearValues() {
            if (!this.isSwapPositions) {
                this.tokenValues.first = '0'
            }
        },
        changeFirstToken(value) {
            this.LIMIT_FIRST_TOKEN(value)
        },
        changeSecondToken(value) {
            this.limitStore.LIMIT_SECOND_TOKEN(value)
        },
        updateProcessing(value, mode) {
            switch (mode) {
                case "create-wallet":
                    this.processing.createWallet = value;
                    break;
                case "dca":
                    this.processing.dca = value;
                    break;
            }
        },
        setDefaultTokenPair() {
            let native = this.dexStore.GET_TON_TOKENS.find((item) => item.type === 'native')
            let usdt = this.dexStore.GET_TON_TOKENS.find((item) => item?.address === this.usdtAddress)

            if (native) {
                this.limitStore.LIMIT_FIRST_TOKEN(native)
                // this.getSupportedReceiveTokens(native)
            }
            if (usdt) this.limitStore.LIMIT_SECOND_TOKEN(usdt)
        },
        async getSupportedSendTokens() {
            try {
                let res = await strategiesService.getSupportedFromTokens('dca')
                let tokens = await this.getTokensByAddress(res)
                this.limitStore.LIMIT_SEND_SUPPORTED_TOKENS(tokens)
                return tokens
            } catch (err) {
                console.error(err)
            }
        },
        async getSupportedReceiveTokens(firstToken) {
            try {
                let res = await strategiesService.getSupportedToTokens(firstToken, 'dca')
                let tokens = await this.getTokensByAddress(res)
                this.limitStore.LIMIT_RECEIVE_SUPPORTED_TOKENS(tokens)
                return tokens
            } catch (err) {
                console.error(err)
            }
        },
        async getTokensByAddress(addresses) {
            try {

                let tokensFromStore = this.dexStore.GET_TON_TOKENS.filter((item) => {
                    let friendly = item.address === 'native'
                        ? item.address
                        : Address.parse(item.address).toString()
                    return addresses.includes(friendly)
                })

                const filteredAddresses = addresses.filter((address) => {
                    if (address !== 'native') {
                        return tokensFromStore.every((token) => token.address !== Address.parse(address).toRawString())
                    }
                })

                let res = await tokenService.getTokensByAddress(filteredAddresses)
                return this.mergeArrays(tokensFromStore, res)
            } catch (err) {
                throw err
            }
        },
        mergeArrays(first, second) {
            const saveFirst = Array.isArray(first) ? first : []
            const saveSecond = Array.isArray(second) ? second : []

            return saveFirst.concat(saveSecond)
                .filter((obj, index, self) => {
                    return obj?.id == null || index === self.findIndex((t) => t?.id === obj?.id);
                });
        },
        async dcaAction() {
            try {
                if (!this.dexStore.GET_DEX_WALLET) {
                    this.tonConnectUi.openModal()
                } else if (this.interfaceStatus === 'NOT_ELIGIBLE') {
                    //TODO: SWAP-COFFEE LINK TO STAKING // this.$router.push({name: 'Stake', params: {name: 'CES'}})
                } else if (this.interfaceStatus === 'NOT_STRATEGIES_WALLET') {
                    await createStrategiesWallet(this.updateProcessing)
                    this.successModalState.mode = 'deploy-smart'
                    this.successModalState.show = true
                } else {
                    this.historyLength = this.limitStore.GET_LIMIT_HISTORY.length
                    this.transactionStore.SAVE_LIMIT_TRANSACTION_INFO(this.setDcaTransactionInfo)
                    await createOrder(this.updateProcessing, this.setCreateOrderBody)
                    this.successModalState.mode = 'dca'
                    this.successModalState.show = true
                }
            } catch(err) {
                console.error(err)
            }
        },
        async cancelAction(id) {
            try {
                this.historyActiveLength = this.limitStore.GET_LIMIT_HISTORY.filter((item) => item?.status === 'active').length
                console.log('historyActiveLength', this.historyActiveLength)
                let res = await cancelOrder(this.updateProcessing, {type: 'dca', id: id})
                this.successModalState.mode = 'cancel'
                this.successModalState.show = true
            } catch(err) {
                console.error(err)
            }
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
        this.resetLimitTokens();
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
                    }, 500)
                }
            }
        },
        'limitStore.GET_LIMIT_FIRST_AMOUNT': {
            handler() {
                if (Number(this.tokenValues.first) !== Number(this.limitStore.GET_LIMIT_FIRST_AMOUNT) && this.pageLoaded === false) {
                    this.tokenValues.first = this.limitStore.GET_LIMIT_FIRST_AMOUNT.toString()
                }

            }
        },
        'limitStore.GET_STRATEGIES_ELIGIBLE': {
            handler() {
                if (this.limitStore.GET_STRATEGIES_ELIGIBLE) {
                    checkStrategiesWallet()
                }
            }
        },
        'limitStore.GET_LIMIT_FIRST_TOKEN': {
            handler() {
                // this.clearValues()
                if (this.limitStore.GET_LIMIT_FIRST_TOKEN) {
                    this.getSupportedReceiveTokens(this.limitStore.GET_LIMIT_FIRST_TOKEN?.address)
                }
            }
        },
        'limitStore.GET_LIMIT_SECOND_TOKEN': {
            handler() {
                // this.clearValues()
                if (this.limitStore.GET_LIMIT_SECOND_TOKEN) {
                    this.getSupportedSendTokens(this.limitStore.GET_LIMIT_SECOND_TOKEN?.address)
                }
            }
        },
    }
}
</script>

<style scoped>
.dca-page {
    display: flex;
    flex-direction: column;
    gap: 14px;
    width: 100%;
    max-width: 100%;
}
</style>
