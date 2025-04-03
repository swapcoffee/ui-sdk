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
    </div>
</template>

<script lang="ts">
import SwapHeader from "@/components/swap-interface/SwapHeader.vue";
import SwapInterfaceTest from "@/components/swap-interface/SwapInterfaceTest.vue";
import DexTitle from "@/components/dex/DexTitle.vue";
import {defineAsyncComponent} from "vue";
import SwapInterface from "@/components/swap-interface/SwapInterface.vue";
import {mapActions, mapGetters} from "vuex";
import {strategiesService, tokenService} from "@/api/coffeeApi/services";
import {Address} from "@ton/core";
import LimitSettingsModal from "@/components/modals/LimitSettingsModal.vue";
import {
    cancelOrder,
    checkStrategiesWallet,
    createOrder,
    createStrategiesWallet,
    removeLimitCheckerInterval
} from "@/helpers/strategies/strategies.ts";
import {stableRateTokens} from "@/helpers/strategies/stable-rate-tokens.ts";
import TransactionStatusModal from "@/components/modals/TransactionStatusModal.vue";
import {setLimitTokensByQuery} from "@/helpers/swap-interface/swap-query-params.ts";
import resetLimitTokens from "@/mixins/resetLimitTokens";
import { amountLimitWatcher } from "@/helpers/swap-interface/watchers";

export default {
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
    mixins: [resetLimitTokens],
    components: {
        TransactionStatusModal,
        LimitSettingsModal,
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
        LimitOrdersHistory: defineAsyncComponent(() => {
            return import('@/components/limit/LimitOrdersHistory.vue')
        }),

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
            updateRate: this.updateRate,
            setToMarket: this.setToMarket,
            limitAction: this.limitAction,
            cancelAction: this.cancelAction,
            tokenValues: this.tokenValues,
            processing: this.processing,
            modalState: this.successModalState
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
            historyActiveLength: false
        }
    },
    computed: {
        ...mapGetters([
            "GET_STRATEGIES_ELIGIBLE",
            "GET_STRATEGIES_WALLET",
            "GET_LIMIT_FIRST_TOKEN",
            "GET_LIMIT_SECOND_TOKEN",
            "GET_LIMIT_FIRST_AMOUNT",
            "GET_LIMIT_SECOND_AMOUNT",
            "GET_LIMIT_TOKEN_RATE",
            "GET_DEX_WALLET",
            "GET_USER_TOKENS",
            "GET_DEAL_CONDITIONS",
            "GET_TON_TOKENS",
            "GET_PROOF_VERIFICATION",
            "GET_LIMIT_SUBORDERS",
            "GET_LIMIT_INVOCATIONS",
            "GET_SEND_TOKEN",
            "GET_STRATEGIES_WALLET",
            "GET_LIMIT_HISTORY",
            "GET_LIMIT_ENABLE_SUBORDERS",
            "GET_LIMIT_RECEIVE_LIST",
            "GET_LIMIT_SEND_LIST"
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
                return this.getLimitTransactionStatus
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
        getLimitTransactionStatus() {
            if (this.historyLength === this.GET_LIMIT_HISTORY.length) {
                return 'pending'
            } else if (this.GET_LIMIT_HISTORY.length > this.historyLength) {
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
                maxInvocations: this.GET_LIMIT_INVOCATIONS * this.getSuborders
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
                max_invocations: this.GET_LIMIT_INVOCATIONS * this.getSuborders,
                settings: {
                    min_output_amount: (this.tokenValues?.second * Math.pow(10, this.getTokens.second?.decimals)).toString()
                }
            }
        },
        getSuborders() {
            let first = this.tokenValues.first * this.GET_LIMIT_FIRST_TOKEN?.price_usd
            if (!this.GET_LIMIT_ENABLE_SUBORDERS) {
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
                return this.GET_LIMIT_SUBORDERS
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
            } else if (this.GET_DEX_WALLET === null) {
                return 'NOT_CONNECTED'
            } else if (!this.GET_STRATEGIES_ELIGIBLE) {
                return 'NOT_ELIGIBLE'
            } else if (this.GET_STRATEGIES_ELIGIBLE && !this.GET_STRATEGIES_WALLET) {
                return 'NOT_STRATEGIES_WALLET'
            } else if (this.GET_LIMIT_FIRST_AMOUNT === 0 && this.GET_LIMIT_SECOND_AMOUNT === 0) {
                return 'NOT_AMOUNT'
            } else if (this.notEnoughConditions.reason === "noBalance") {
                return 'NOT_ENOUGH'
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
            let firstInUsd = this.GET_LIMIT_FIRST_AMOUNT * this.getTokens.first.price_usd
            let calculate = firstInUsd / this.getTokens.second.price_usd
            return calculate.toFixed(4)
        },
        equalizeFirst() {
            let secondInUsd = this.GET_LIMIT_SECOND_AMOUNT * this.getTokens.second.price_usd
            let calculate = secondInUsd / this.getTokens.first.price_usd
            return calculate.toFixed(4)
        }
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
            "DEX_SEND_TOKEN",
            "DEX_RECEIVE_TOKEN",
            "SAVE_LIMIT_TRANSACTION_INFO"
        ]),
        closeSuccess() {
            this.successModalState.show = false
            this.successModalState.mode = null
            this.clearValues()
            this.SAVE_LIMIT_TRANSACTION_INFO(null)
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
            this.LIMIT_FIRST_AMOUNT(Number(value))
        },
        changeSecondValue(value) {
            this.tokenValues.second = value
            this.LIMIT_SECOND_AMOUNT(Number(value))
        },
        clearValues() {
            if (!this.isSwapPositions) {
                this.tokenValues.first = '0'
                this.tokenValues.second = '0'
                this.tokenValues.rate = '0'
            }
        },
        changeFirstToken(value) {
            this.LIMIT_FIRST_TOKEN(value);
        },
        changeSecondToken(value) {
            this.LIMIT_SECOND_TOKEN(value);
        },
         validateTokens(changedToken) {
             if (changedToken === 'send') {
                 const availableReceiveTokens = this.GET_LIMIT_RECEIVE_LIST;
                 if (!availableReceiveTokens.some(token => token.address === this.getTokens.second.address)) {
                     this.changeSecondToken(availableReceiveTokens[0]);
                     const { query } = this.$route;
                    //  if (query.st) {
                    //      delete query.st;
                    //      this.$router.replace({ query });
                    //  }
                 }
         } else if (changedToken === 'receive') {
                const availableSendTokens = this.GET_LIMIT_SEND_LIST;
                if (!availableSendTokens.some(token => token.address === this.getTokens.first.address)) {
                    this.changeFirstToken(availableSendTokens[0]);
                    const { query } = this.$route;
                    // if (query.ft) {
                    //     delete query.ft;
                    //     this.$router.replace({ query });
                    // }
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
            this.LIMIT_TOKEN_RATE(Number(value))
        },
        setToMarket() {
            this.tokenValues.rate = this.calculateRate
            this.LIMIT_TOKEN_RATE(Number(this.calculateRate))
        },
        swapTokenPositions() {
            clearTimeout(this.debounce)
            this.debounce = setTimeout(() => {
                this.isSwapPositions = true
                let first = this.GET_LIMIT_SECOND_TOKEN
                let second = this.GET_LIMIT_FIRST_TOKEN
                this.LIMIT_FIRST_TOKEN(first)
                this.LIMIT_SECOND_TOKEN(second)

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
        async limitAction() {
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
                    this.SAVE_LIMIT_TRANSACTION_INFO(this.setLimitTransactionInfo)
                    await createOrder(this.updateProcessing, this.setCreateOrderBody)
                    this.successModalState.mode = 'limit'
                    this.successModalState.show = true
                }
            } catch (err) {
                console.error(err)
            }
        },
        async cancelAction(id) {
            try {
                this.historyActiveLength = this.GET_LIMIT_HISTORY.filter((item) => item?.status === 'active').length
                let res = await cancelOrder(this.updateProcessing, {type: 'limit', id: id})
                this.successModalState.mode = 'cancel'
                this.successModalState.show = true
            } catch(err) {
                console.error(err)
            }
        },
        setDefaultTokenPair() {
            let native = this.GET_TON_TOKENS.find((item) => item.type === 'native')
            let usdt = this.GET_TON_TOKENS.find((item) => item?.address === this.usdtAddress)

            if (native) {
                this.LIMIT_FIRST_TOKEN(native)
                // this.getSupportedReceiveTokens(native.address)
            }
            if (usdt) this.LIMIT_SECOND_TOKEN(usdt)
        },
        async getSupportedSendTokens() {
            try {
                let res = await strategiesService.getSupportedFromTokens('limit')
                let tokens = await this.getTokensByAddress(res)
                this.LIMIT_SEND_SUPPORTED_TOKENS(tokens)
                return tokens
            } catch (err) {
                console.error(err)
            }
        },
        async getSupportedReceiveTokens(firstToken) {
            try {
                let res = await strategiesService.getSupportedToTokens(firstToken, 'limit')
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
        }
    },
    unmounted() {
        this.LIMIT_FIRST_AMOUNT(0)
        this.LIMIT_SECOND_AMOUNT(0)
        this.resetLimitTokens()
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
        GET_LIMIT_RECEIVE_LIST: {
            handler() {
                this.validateTokens('send');
            },
            immediate: true
        },
        GET_LIMIT_SEND_LIST: {
            handler() {
                this.validateTokens('receive');
            },
            immediate: true
        },
        GET_LIMIT_FIRST_TOKEN: {
            handler() {
                this.rateEdited = false
                // this.clearValues()
                if (this.GET_LIMIT_FIRST_TOKEN) {
                    this.getSupportedReceiveTokens(this.GET_LIMIT_FIRST_TOKEN?.address)
                }
            }
        },
        GET_LIMIT_SECOND_TOKEN: {
            handler() {
                this.rateEdited = false
                // this.clearValues()
                if (this.GET_LIMIT_SECOND_TOKEN) {
                    this.getSupportedSendTokens(this.GET_LIMIT_SECOND_TOKEN?.address)
                }
            }
        },
        GET_STRATEGIES_ELIGIBLE: {
            handler() {
                if (this.GET_STRATEGIES_ELIGIBLE) {
                    checkStrategiesWallet()
                }
            }
        },
        GET_LIMIT_FIRST_AMOUNT: {
            handler() {
                if (Number(this.tokenValues.first) !== this.GET_LIMIT_FIRST_AMOUNT && this.pageLoaded === false) {
                    this.tokenValues.first = this.GET_LIMIT_FIRST_AMOUNT.toString()
                }

                clearTimeout(this.debounce)
                this.debounce = setTimeout(() => {
                    if (this.GET_LIMIT_FIRST_AMOUNT > 0) {
                        this.isAutochange = true
                        if (!this.rateEdited) {
                            this.tokenValues.second = this.equalizeSecond
                            this.tokenValues.rate = this.calculateRate
                        } else {
                            console.log('calculateSecond', this.calculateSecond)
                            this.tokenValues.second = this.calculateSecond
                        }
                    } else {
                        this.tokenValues.second = '0'
                    }
                }, 200)

                amountLimitWatcher({
                    tokens: this.getTokens,
                    amounts: this.tokenValues,
                    router: this.$router,
                    routeName: 'Limit',
                    type: 'send'
                })

                setTimeout(() => {
                    this.isAutochange = false
                }, 1000)
            }
        },
        GET_LIMIT_SECOND_AMOUNT: {
            handler() {
                clearTimeout(this.debounce)
                this.debounce = setTimeout(() => {
                    if (this.GET_LIMIT_SECOND_AMOUNT > 0) {
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
        GET_LIMIT_TOKEN_RATE: {
            handler() {
                clearTimeout(this.debounce)
                this.debounce = setTimeout(() => {
                    if (this.GET_LIMIT_FIRST_AMOUNT > 0) {
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
</script>

<style scoped>
.limit-page {
    display: flex;
    flex-direction: column;
    gap: 14px;
    width: 400px;
    max-width: 400px;
}

@media screen and (max-width: 1220px) {
    .limit-page {
        width: 440px;
        max-width: 440px;
        margin: 0 auto;
    }
}

@media screen and (max-width: 576px) {
    .limit-page {
        width: 100%;
        max-width: 100%;
    }
}
</style>
