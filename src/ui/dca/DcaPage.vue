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
import DexSuccess from "@/components/dex/DexSuccess.vue";
import SwapInterfaceTest from "@/components/swap-interface/SwapInterfaceTest.vue";
import SwapHeader from "@/components/swap-interface/SwapHeader.vue";
import LimitSettingsModal from "@/components/modals/LimitSettingsModal.vue";
import TokensPopup from "@/components/dex/tokens-popup/TokensPopup.vue";
import LimitOrdersHistory from "@/components/limit/LimitOrdersHistory.vue";
import {strategiesService, tokenService} from "@/api/coffeeApi/services";
import {
    cancelOrder,
    checkStrategiesWallet,
    createOrder,
    createStrategiesWallet,
    removeLimitCheckerInterval
} from "@/helpers/strategies/strategies.ts";
import {Address} from "@ton/core";
import TransactionStatusModal from "@/components/modals/TransactionStatusModal.vue";
import {setLimitTokensByQuery} from "@/helpers/swap-interface/swap-query-params.ts";
import resetLimitTokens from "@/mixins/resetLimitTokens";
import { amountLimitWatcher } from "@/helpers/swap-interface/watchers";

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
        ...mapGetters([
            "GET_USER_TOKENS",
            "GET_TON_TOKENS",
            "GET_DEX_WALLET",
            "GET_STRATEGIES_WALLET",
            "GET_STRATEGIES_ELIGIBLE",
            "GET_LIMIT_FIRST_TOKEN",
            "GET_LIMIT_SECOND_TOKEN",
            "GET_LIMIT_FIRST_AMOUNT",
            "GET_LIMIT_SECOND_AMOUNT",
            "GET_LIMIT_SUBORDERS",
            "GET_LIMIT_INVOCATIONS",
            "GET_DCA_EVERY_TIME",
            "GET_SEND_TOKEN",
            "GET_MIN_RANGE",
            "GET_MAX_RANGE",
            "GET_DCA_ENABLE_RANGE",
            "GET_LIMIT_HISTORY",
            "GET_DCA_EVERY_TIME"
        ]),
        getTransactionStatus() {
            if (this.successModalState.mode === 'deploy-smart') {
                if (this.GET_STRATEGIES_WALLET === null) {
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
            let activeLength = this.GET_LIMIT_HISTORY.filter((item) => item?.status === 'active').length
            if (this.historyActiveLength === activeLength) {
                return 'pending'
            } else if (activeLength < this.historyActiveLength) {
                removeLimitCheckerInterval()
                return 'success'
            }
        },
        getDcaTransactionStatus() {
            if (this.historyLength === this.GET_LIMIT_HISTORY.length) {
                return 'pending'
            } else if (this.GET_LIMIT_HISTORY.length > this.historyLength) {
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
                maxSuborders: this.GET_LIMIT_SUBORDERS,
                maxInvocations: this.GET_LIMIT_INVOCATIONS * this.GET_LIMIT_SUBORDERS,
                intervalSec: this.GET_DCA_EVERY_TIME
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
                max_suborders: this.GET_LIMIT_SUBORDERS,
                max_invocations: this.GET_LIMIT_SUBORDERS * this.GET_LIMIT_INVOCATIONS,
                settings: this.getOrderSettings
            }
        },
        getOrderSettings() {
            let asset = {
                delay: this.GET_DCA_EVERY_TIME
            }
            if (this.GET_DCA_ENABLE_RANGE && this.GET_MAX_RANGE !== null && this.GET_MIN_RANGE !== null) {
                asset.price_range_from = this.GET_MIN_RANGE < this.GET_MAX_RANGE
                    ? this.GET_MIN_RANGE
                    : this.GET_MAX_RANGE
                asset.price_range_to = this.GET_MIN_RANGE < this.GET_MAX_RANGE
                    ? this.GET_MAX_RANGE
                    : this.GET_MIN_RANGE
            }

            return asset
        },
        interfaceStatus() {
            if (this.processing.dca === true) {
                return 'LOADING'
            } else if (this.GET_DEX_WALLET === null) {
                return 'NOT_CONNECTED'
            } else if (!this.GET_STRATEGIES_ELIGIBLE) {
                return 'NOT_ELIGIBLE'
            } else if (this.GET_STRATEGIES_ELIGIBLE && !this.GET_STRATEGIES_WALLET) {
                return 'NOT_STRATEGIES_WALLET'
            } else if (this.GET_LIMIT_FIRST_AMOUNT === 0 && (this.tokenValues.first.length === 0 || Number(this.tokenValues.first) === 0)) {
                return 'NOT_AMOUNT'
            } else if (this.notEnoughConditions.reason === "noBalance") {
                return 'NOT_ENOUGH'
            } else if (this.GET_DCA_ENABLE_RANGE && !this.GET_MIN_RANGE || this.GET_DCA_ENABLE_RANGE && !this.GET_MAX_RANGE) {
                return 'NOT_RANGE'
            } else {
                return 'READY_DEX'
            }
        },
        notEnoughConditions() {
            if (this.GET_LIMIT_FIRST_TOKEN?.balance < this.GET_LIMIT_FIRST_AMOUNT) {
                return {result: true, reason: 'noBalance'}
            }

            return {result: false, reason: null};
        },
        getTokens() {
            return {
                first: this.GET_LIMIT_FIRST_TOKEN,
                second: this.GET_LIMIT_SECOND_TOKEN
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
        ...mapActions([
            "STRATEGIES_WALLET",
            "STRATEGIES_ELIGIBLE",
            "LIMIT_FIRST_TOKEN",
            "LIMIT_SECOND_TOKEN",
            "LIMIT_FIRST_AMOUNT",
            "LIMIT_SECOND_AMOUNT",
            "LIMIT_TOKEN_RATE",
            "LIMIT_SEND_SUPPORTED_TOKENS",
            "LIMIT_RECEIVE_SUPPORTED_TOKENS",
            "SAVE_LIMIT_TRANSACTION_INFO"
        ]),
        closeSuccess() {
            this.successModalState.show = false
            this.successModalState.mode = null
            this.clearValues()
            this.SAVE_LIMIT_TRANSACTION_INFO(null)
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
            this.LIMIT_FIRST_AMOUNT(Number(value))
        },
        changeSecondValue(value) {
            this.tokenValues.second = value
            this.LIMIT_SECOND_AMOUNT(Number(value))
        },
        swapTokenPositions() {
            clearTimeout(this.debounce)
            this.debounce = setTimeout(() => {
                this.isSwapPositions = true
                let first = this.GET_LIMIT_SECOND_TOKEN
                let second = this.GET_LIMIT_FIRST_TOKEN
                this.LIMIT_FIRST_TOKEN(first)
                this.LIMIT_SECOND_TOKEN(second)

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
            this.LIMIT_SECOND_TOKEN(value)
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
            let native = this.GET_TON_TOKENS.find((item) => item.type === 'native')
            let usdt = this.GET_TON_TOKENS.find((item) => item?.address === this.usdtAddress)

            if (native) {
                this.LIMIT_FIRST_TOKEN(native)
                // this.getSupportedReceiveTokens(native)
            }
            if (usdt) this.LIMIT_SECOND_TOKEN(usdt)
        },
        async getSupportedSendTokens() {
            try {
                let res = await strategiesService.getSupportedFromTokens('dca')
                let tokens = await this.getTokensByAddress(res)
                this.LIMIT_SEND_SUPPORTED_TOKENS(tokens)
                return tokens
            } catch (err) {
                console.error(err)
            }
        },
        async getSupportedReceiveTokens(firstToken) {
            try {
                let res = await strategiesService.getSupportedToTokens(firstToken, 'dca')
                let tokens = await this.getTokensByAddress(res)
                this.LIMIT_RECEIVE_SUPPORTED_TOKENS(tokens)
                return tokens
            } catch (err) {
                console.error(err)
            }
        },
        async getTokensByAddress(addresses) {
            try {

                let tokensFromStore = this.GET_TON_TOKENS.filter((item) => {
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
            return first.concat(second)
                .filter((obj, index, self) => {
                    return obj.id == null || index === self.findIndex((t) => t?.id === obj?.id);
                });
        },
        async dcaAction() {
            try {
                if (!this.GET_DEX_WALLET) {
                    this.tonConnectUi.openModal()
                } else if (this.interfaceStatus === 'NOT_ELIGIBLE') {
                    this.$router.push({name: 'Stake', params: {name: 'CES'}})
                } else if (this.interfaceStatus === 'NOT_STRATEGIES_WALLET') {
                    await createStrategiesWallet(this.updateProcessing)
                    this.successModalState.mode = 'deploy-smart'
                    this.successModalState.show = true
                } else {
                    this.historyLength = this.GET_LIMIT_HISTORY.length
                    this.SAVE_LIMIT_TRANSACTION_INFO(this.setDcaTransactionInfo)
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
                this.historyActiveLength = this.GET_LIMIT_HISTORY.filter((item) => item?.status === 'active').length
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
        if (this.GET_STRATEGIES_ELIGIBLE) {
            checkStrategiesWallet()
        }

        if (this.GET_TON_TOKENS.length > 0 && !this.pageLoaded) {
            if (this.$route.query?.ft || this.$route.query?.st) {
                setLimitTokensByQuery(this.$route, this.getSupportedSendTokens, this.getSupportedReceiveTokens)
            } else {
                this.setDefaultTokenPair()
                this.getSupportedSendTokens()
            }
            setTimeout(() => {
                this.pageLoaded = true
            }, 500)
            // this.pageLoaded = true
        }
    },
    unmounted() {
        this.LIMIT_FIRST_AMOUNT(0)
        this.LIMIT_SECOND_AMOUNT(0)
        this.resetLimitTokens();
    },
    watch: {
        GET_TON_TOKENS: {
            handler() {
                if (this.GET_TON_TOKENS.length > 0 && !this.pageLoaded) {
                    if (this.$route.query?.ft || this.$route.query?.st) {
                        setLimitTokensByQuery(this.$route, this.getSupportedSendTokens, this.getSupportedReceiveTokens)
                    } else {
                        this.setDefaultTokenPair()
                        setTimeout(() => {
                            if (this.GET_LIMIT_FIRST_TOKEN) {
                                this.getSupportedSendTokens()
                            }
                        }, 300)
                    }
                    setTimeout(() => {
                        this.pageLoaded = true
                    }, 500)
                }
            }
        },
        GET_LIMIT_FIRST_AMOUNT: {
            handler() {
                if (Number(this.tokenValues.first) !== Number(this.GET_LIMIT_FIRST_AMOUNT) && this.pageLoaded === false) {
                    this.tokenValues.first = this.GET_LIMIT_FIRST_AMOUNT.toString()
                }

                amountLimitWatcher({
                    tokens: this.getTokens,
                    amounts: this.tokenValues,
                    router: this.$router,
                    routeName: 'Dca',
                    type: 'send'
                })
            }
        },
        GET_STRATEGIES_ELIGIBLE: {
            handler() {
                if (this.GET_STRATEGIES_ELIGIBLE) {
                    checkStrategiesWallet()
                }
            }
        },
        GET_LIMIT_FIRST_TOKEN: {
            handler() {
                // this.clearValues()
                if (this.GET_LIMIT_FIRST_TOKEN) {
                    this.getSupportedReceiveTokens(this.GET_LIMIT_FIRST_TOKEN?.address)
                }
            }
        },
        GET_LIMIT_SECOND_TOKEN: {
            handler() {
                // this.clearValues()
                if (this.GET_LIMIT_SECOND_TOKEN) {
                    this.getSupportedSendTokens(this.GET_LIMIT_SECOND_TOKEN?.address)
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
    width: 400px;
    max-width: 400px;
}

@media screen and (max-width: 1220px) {
    .dca-page {
        width: 440px;
        max-width: 440px;
        margin: 0 auto;
    }
}

@media screen and (max-width: 576px) {
    .dca-page {
        width: 100%;
        max-width: 100%;
    }
}
</style>
