<template>
    <div class="interface">
<!--        <DexTitle-->
<!--            :refreshInfo="refreshInfo"-->
<!--            @refresh="refreshHandlerEvent('compareTokens')"-->
<!--        />-->
        <div class="interface__swap">
            <SwapFieldController
                :firstToken="dexStore.GET_SEND_TOKEN"
                :secondToken="dexStore.GET_RECEIVE_TOKEN"
                @swapTokenPositions="swapTokenPositions"
                :routeInfo="dexStore.GET_DEAL_CONDITIONS"
            />
            <transition name="slide-info">
                <DexInfo
                    v-show="checkDexStatus === 'HIGH_PRICE_IMPACT' && dexStore.GET_SWAP_MODE !== 'reverse'"
                />
            </transition>
            <transition name="slide-reverse">
                <DexReverseInfo v-show="dexStore.GET_SWAP_MODE === 'reverse'"/>
            </transition>
            <div class="interface__button-wrapper">
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
        <TokensPopup
            :mode="tokenModalMode"
            @closePopup="modals.token = false"
            v-if="modals.token === true"
        />
    </div>
</template>

<script lang="ts">
import SwapFieldController from "@/components/swap-interface/SwapFieldController.vue";
import SwapButton from "@/components/swap-interface/SwapButton.vue";
import SwapHeader from "@/components/swap-interface/SwapHeader.vue";
import DexInfo from "@/components/dex/DexInfo.vue";
import DexReverseInfo from "@/components/dex/DexReverseInfo.vue";
import {dexService, tokenService} from "@/api/coffeeApi/services";
import DexButton from "@/components/dex/DexButton.vue";
import DexStakeButton from "@/components/dex/DexStakeButton.vue";
import DexUnstakeButton from "@/components/dex/DexUnstakeButton.vue";
import TokensPopup from "@/components/dex/tokens-popup/TokensPopup.vue";
import {Address} from "@ton/core";
import {setTransactionMessage} from "@/helpers/dex/calculate.ts";
import {useDexStore} from "@/stores/dex";
import {useDexSettingsStore} from "@/stores/dex/settings.ts";

export default {
    name: "SwapInterface",
    components: {
        TokensPopup,
	    DexUnstakeButton, DexStakeButton, DexButton,
		DexReverseInfo,
        DexInfo,
        SwapHeader,
        SwapButton,
        SwapFieldController
    },
    props: {
        tonConnectUi: {
            type: Object,
            default() {
                return {}
            }
        }
    },
	provide() {
		return {
            // routeInfo: this.GET_DEAL_CONDITIONS,
            updateTokenModalVisible: this.openTokenModal,
			updateFirstValue: this.changeFirstValue,
			updateSecondValue: this.changeSecondValue,
            tokenValues: this.tokenValues
		}
	},
    data() {
        return {
            modals: {
                token: false,
                settings: false,
                success: false,
            },
            tokenValues: {
                first: '0',
                second: '0'
            },
            startTransaction: false,
            tokenModalMode: 'SEND',
			refreshInfo: false,
            poolNotFound: false,
            abortController: null,
            poolAbortController: null,

            interval: null,
            requestInterval: null,
            intervalTime: 300,
            calculateRequestData: null,
            debounce: null,
            showTokens: false,
            tokenMode: 'SEND',
            showSuccess: false,
            transactionStatus: null,
            trInfo: null,
            isVisible: true,
            unstakeProcessing: false,
            stakeProcessing: false,
            getRouteRequestCounter: 0,
            pageLoaded: false,
        }
    },
    computed: {
        dexStore() {
          return useDexStore()
        },
        dexSettingsStore() {
          return useDexSettingsStore()
        },
        canStake() {
            let findTokenInUser = this.dexStore.GET_USER_TOKENS.find((item) => item.symbol === "TON")
            let enoughBalance = findTokenInUser && findTokenInUser?.balance >= this.dexStore.GET_SEND_AMOUNT
            let validAmount = this.dexStore.GET_SEND_AMOUNT > 0 && enoughBalance

            return (
                this.dexStore.GET_STAKING_POOL !== null &&
                this.dexStore.GET_SEND_TOKEN?.address === 'native' &&
                this.dexStore.GET_RECEIVE_TOKEN?.stacking_pool_id !== null &&
                this.dexStore.GET_RECEIVE_TOKEN.hasOwnProperty('stacking_pool_id') &&
                validAmount
            );
        },
        canUnstake() {
            let findTokenInUser = this.dexStore.GET_USER_TOKENS.find(
                (item) => item.symbol === this.dexStore.GET_SEND_TOKEN?.symbol,
            );
            let enoughBalance = findTokenInUser && findTokenInUser?.balance >= this.dexStore.GET_SEND_AMOUNT;
            let validAmount = this.dexStore.GET_SEND_AMOUNT > 0 && enoughBalance;

            return this.dexStore.GET_STAKING_POOL !== null && this.dexStore.GET_RECEIVE_TOKEN?.address === 'native' &&
                this.dexStore.GET_SEND_TOKEN?.stacking_pool_id !== null && this.dexStore.GET_SEND_TOKEN.hasOwnProperty("stacking_pool_id") && validAmount
        },
	    checkDexStatus() {
		    let priceImpact = 0
		    if (this.dexStore.GET_DEAL_CONDITIONS != null) {
			    let inputUsd = this.dexStore.GET_DEAL_CONDITIONS?.input_usd
			    let outputUsd = this.dexStore.GET_DEAL_CONDITIONS?.output_usd
			    priceImpact = (outputUsd - inputUsd) / inputUsd * 100
		    }

		    if (this.poolNotFound || this.dexStore.GET_DEAL_CONDITIONS?.output_usd === 0) {
			    return 'POOL_NOT_FOUND'
		    } else if (this.loadingConditions || this.startTransaction === true || this.firstLoading) {
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
          return false
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
    },
    methods: {
        getTransactionParams(trInfo) {
            // let cashback = this.dexStore.GET_DEAL_CONDITIONS?.paths.length <= 3 ? this.GET_CASHBACK : false
            let cashback = false

            let messages = setTransactionMessage(this.calculateRequestData.data, cashback, trInfo.transactions)
            return {
                validUntil: Math.floor(Date.now() / 1000) + 60, // 60 sec
                messages: messages,
            }

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
        swapTokenPositions() {
            let first = this.dexStore.GET_RECEIVE_TOKEN
            let second = this.dexStore.GET_SEND_TOKEN
            this.dexStore.DEX_SEND_TOKEN(first)
            this.dexStore.DEX_RECEIVE_TOKEN(second)

            let firstAmount = this.tokenValues.second
            let secondAmount = this.tokenValues.first
            this.changeFirstValue(firstAmount)
            this.changeSecondValue(secondAmount)
        },
        refreshDex() {
            this.interval = setInterval(() => {
                if (!this.showSuccess && this.isVisible) {
                    this.compareTokens();
                }
            }, 10000);
        },
        setDebounceForRequest() {
            clearTimeout(this.debounce);
            this.debounce = setTimeout(() => {
                if (this.poolAbortController !== null) {
                    this.poolAbortController.abort()
                }
                if (this.abortController !== null) {
                    this.abortController.abort()
                }
                if ((this.dexStore.GET_SEND_AMOUNT > 0 && this.dexStore.GET_SWAP_MODE === 'default') || (this.dexStore.GET_RECEIVE_AMOUNT > 0 && this.dexStore.GET_SWAP_MODE === 'reverse') && !this.showSuccess) {
                    this.compareTokens()
                }
            }, 200)
        },
        async compareTokens() {
            try {
                this.poolNotFound = false;
                let requestData = this.setAsset();
                this.refreshInfo = true;
                this.abortController = new AbortController();

                if (
                    this.dexStore.GET_SEND_TOKEN &&
                    typeof this.dexStore.GET_SEND_TOKEN === 'object' &&
                    this.dexStore.GET_SEND_TOKEN.hasOwnProperty('stacking_pool_id') &&
                    this.dexStore.GET_SEND_TOKEN.stacking_pool_id !== null
                ) {
                    const response = await tokenService.getStakingPool(this.dexStore.GET_SEND_TOKEN.stacking_pool_id);
                    this.dexStore.DEX_STAKING_POOL(response?.data);
                }
                if (
                    this.dexStore.GET_RECEIVE_TOKEN &&
                    typeof this.dexStore.GET_RECEIVE_TOKEN === 'object' &&
                    this.dexStore.GET_RECEIVE_TOKEN.hasOwnProperty('stacking_pool_id') &&
                    this.dexStore.GET_RECEIVE_TOKEN.stacking_pool_id !== null
                ) {
                    const response = await tokenService.getStakingPool(this.dexStore.GET_RECEIVE_TOKEN.stacking_pool_id);
                    this.dexStore.DEX_STAKING_POOL(response?.data);
                }

                let requestKey = ++this.getRouteRequestCounter;

                if (
                    this.dexStore.GET_SEND_AMOUNT || this.dexStore.GET_RECEIVE_AMOUNT &&
                    this.dexStore.GET_SEND_AMOUNT > 0 || this.dexStore.GET_RECEIVE_AMOUNT > 0
                ) {
                    const routeResponse = await dexService.getRoute(requestData);

                    if (this.getRouteRequestCounter === requestKey) {
                        this.calculateRequestData = routeResponse;
                        if (Array.isArray(this.calculateRequestData.data?.paths) && this.calculateRequestData.data.paths.length > 0) {
                            this.dexStore.DEX_DEAL_CONDITIONS(this.calculateRequestData.data);
                        } else {
                            this.poolNotFound = true;
                        }
                    } else {
                        console.warn('Ignoring route result response: counter mismatch');
                    }
                }
            } catch (err) {
                console.error(err);
            } finally {
                setTimeout(() => {
                    this.refreshInfo = false;
                }, 800);
            }
        },
        getPoolSelector(dexes) {
            const maxVolatility = this.dexSettingsStore.GET_MAX_POOL_VOLATILITY;

            const result = {
                dexes
            };

            if (Number(maxVolatility) !== -1) {
                result.max_volatility = maxVolatility / 100;
            }
        },
        setAsset() {
            let fromTokenAddress = 'native';
            let toTokenAddress = 'native';

            if (this.dexStore.GET_SEND_TOKEN.type !== 'native') {
                fromTokenAddress = Address.parse(this.dexStore.GET_SEND_TOKEN?.address).toString();
            }

            if (this.dexStore.GET_RECEIVE_TOKEN?.type !== 'native') {
                toTokenAddress = Address.parse(this.dexStore.GET_RECEIVE_TOKEN?.address).toString();
            }

            let asset = {
                input_token: {
                    blockchain: 'ton',
                    address: fromTokenAddress
                },
                output_token: {
                    blockchain: 'ton',
                    address: toTokenAddress
                },
                max_length: this.dexSettingsStore.GET_MAX_INTERMEDIATE_TOKENS + 2,
                pool_selector: this.getPoolSelector(this.dexSettingsStore.GET_LIQUIDITY_SOURCES),
                max_splits: this.dexSettingsStore.GET_MAX_SPLITS,
                additional_data: null
            }

            if (this.dexStore.GET_DEX_WALLET !== null) {
                asset.additional_data = {
                    sender_address: Address.parseRaw(this.dexStore.GET_DEX_WALLET?.address).toString(),
                    referral_name: JSON.parse(sessionStorage.getItem('referral_name'))
                }
            }

            if (this.dexStore.GET_SWAP_MODE === 'default') {
                asset.input_amount = Number(this.dexStore.GET_SEND_AMOUNT);
            } else if (this.dexStore.GET_SWAP_MODE === 'reverse') {
                asset.output_amount = Number(this.dexStore.GET_RECEIVE_AMOUNT);
            }

            if (this.dexStore.GET_DEX_WALLET?.version) {
                if (this.dexStore.GET_DEX_WALLET?.version >= 5) {
                    this.dexSettingsStore.DEX_MAX_SPLITS(parseInt(this.dexSettingsStore.GET_MAX_SPLITS)) || 20;
                } else {
                    this.dexSettingsStore.DEX_MAX_SPLITS(parseInt(this.dexSettingsStore.GET_MAX_SPLITS) || 4);
                }
            }
            // console.log(asset)
            return asset;
        },
        dexAction() {
            if (this.checkDexStatus === 'NOT_CONNECTED') {
                if (this.tonConnectUi?.wallet !== null) {
                    this.DEX_WALLET(this.tonConnectUi?.wallet?.account);
                } else {
                    this.showTonconnect();
                }
            } else if (this.checkDexStatus === 'READY_DEX') {
                this.dexTransaction();
            }
        },
        async showTonconnect() {
            try {
                await this.tonConnectUi.openModal();
                console.log('modal is open');
            } catch (err) {
                console.error(err);
            }
        },
        async stakeAction() {
            try {
                this.stakeProcessing = true
                let sender = Address.parseRaw(this.dexStore.GET_DEX_WALLET?.address).toString()
                let referralName = JSON.parse(sessionStorage.getItem('referral_name'))
                let transaction = await dexService.getStakeTransaction(sender, this.dexStore.GET_RECEIVE_TOKEN?.address, this.dexStore.GET_SEND_AMOUNT, referralName)
                await this.tonConnectUi.sendTransaction({
                    validUntil: Math.floor(Date.now() / 1000) + 60, // 60 sec
                    messages: [
                        {
                            address: transaction.address,
                            amount: transaction.value,
                            payload: transaction.payload_cell
                        }
                    ]
                })
                this.dexStore.DEX_SEND_AMOUNT(0)
            } finally {
                this.stakeProcessing = false
            }
        },
        async unstakeAction() {
            try {
                this.unstakeProcessing = true
                let sender = Address.parseRaw(this.dexStore.GET_DEX_WALLET?.address).toString()
                let transaction = await dexService.getUnstakeTransaction(sender, this.dexStore.GET_SEND_TOKEN?.address, this.dexStore.GET_SEND_AMOUNT)
                await this.tonConnectUi.sendTransaction({
                    validUntil: Math.floor(Date.now() / 1000) + 60, // 60 sec
                    messages: [
                        {
                            address: transaction.address,
                            amount: transaction.value,
                            payload: transaction.payload_cell
                        }
                    ]
                })
            } catch (err) {
                console.error(err)
            } finally {
                this.unstakeProcessing = false
            }
        },
        async dexTransaction() {
            try {
                this.startTransaction = true;
                await this.compareTokens();

                let sender = Address.parseRaw(this.dexStore.GET_DEX_WALLET?.address).toString();
                let referralName = JSON.parse(sessionStorage.getItem('referral_name'));
                this.trInfo = (await dexService.getRouteTransactions(
                    this.dexStore.GET_DEAL_CONDITIONS,
                    sender,
                    this.dexSettingsStore.GET_SLIPPAGE / 100,
                    referralName,
                )).data;

                await this.tonConnectUi.sendTransaction(this.getTransactionParams(this.trInfo));
                this.transactionStatus = await dexService.getTransactions(this.trInfo?.route_id);
                this.showSuccess = true;

                // setTimeout(() => {
                // 	this.testTransactionStatus()
                // 	this.showSuccess = true
                // }, 1000)
            } catch (err) {
                console.error(err)
            } finally {
                this.startTransaction = false
            }
        },
        toSafeAddress(rawAddress) {
            try {
                if (rawAddress === 'native') {
                    return 'TON'
                }
                const address = Address.parseRaw(rawAddress);
                return address.toString({bounceable: true, urlSafe: true});
            } catch (error) {
                console.log(error);
                return null;
            }
        },
        sendWatchEvent() {
            if (this.dexStore.GET_RECEIVE_TOKEN !== null && this.dexStore.GET_SEND_TOKEN !== null && this.dexStore.GET_SEND_AMOUNT > 0) {
                this.setDebounceForRequest()
                clearInterval(this.interval)
                this.refreshDex()

                // this.$router.replace({
                //     name: 'Dex',
                //     query: {
                //         ft: this.toSafeAddress(this.dexStore.GET_SEND_TOKEN?.address),
                //         st: this.toSafeAddress(this.dexStore.GET_RECEIVE_TOKEN?.address),
                //         fa: this.dexStore.GET_SEND_AMOUNT
                //     }
                // })
            } else if (this.dexStore.GET_SEND_TOKEN !== null && this.dexStore.GET_SEND_AMOUNT > 0) {
                // this.$router.replace({
                //     name: 'Dex',
                //     query: {ft: this.toSafeAddress(this.dexStore.GET_SEND_TOKEN?.address), fa: this.dexStore.GET_SEND_AMOUNT}
                // })
            } else {

                if (this.abortController !== null) {
                    this.abortController.abort();
                }

                if (this.dexStore.GET_SEND_AMOUNT === 0) {
                    const updatedQuery = {...this.$route.query};

                    delete updatedQuery.fa;

                    if (this.dexStore.GET_SEND_TOKEN !== null && this.dexStore.GET_SEND_TOKEN?.address) {
                        updatedQuery.ft = this.toSafeAddress(this.dexStore.GET_SEND_TOKEN?.address);
                    }

                    // this.$router.replace({query: updatedQuery});
                }

                if (this.dexStore.GET_RECEIVE_TOKEN === null) {
                    const updatedQuery = {...this.$route.query};
                    delete updatedQuery?.st;
                    // this.$router.replace({query: updatedQuery});
                }

                clearInterval(this.interval);
            }
        },
        receiveWatchEvent() {
            if (this.dexStore.GET_RECEIVE_TOKEN !== null && this.dexStore.GET_SEND_TOKEN !== null && this.dexStore.GET_RECEIVE_AMOUNT > 0) {
                this.setDebounceForRequest()
                clearInterval(this.interval)
                this.refreshDex()
                // this.$router.replace({
                //     name: 'Dex',
                //     query: {
                //         ft: this.toSafeAddress(this.dexStore.GET_SEND_TOKEN?.address),
                //         st: this.toSafeAddress(this.dexStore.GET_RECEIVE_TOKEN?.address),
                //         sa: this.dexStore.GET_RECEIVE_AMOUNT
                //     }
                // })

            } else {
                if (this.abortController !== null) {
                    this.abortController.abort()
                }
                if (this.dexStore.GET_RECEIVE_AMOUNT === 0) {
                    const updatedQuery = {...this.$route.query};

                    delete updatedQuery.sa;

                    if (this.dexStore.GET_RECEIVE_TOKEN !== null && this.dexStore.GET_RECEIVE_TOKEN?.address) {
                        updatedQuery.sa = this.toSafeAddress(this.dexStore.GET_RECEIVE_TOKEN?.address);
                    }

                    // this.$router.replace({query: updatedQuery});
                }
                if (this.dexStore.GET_RECEIVE_TOKEN === null) {
                    const updatedQuery = {...this.$route.query};
                    delete updatedQuery?.st;
                    // this.$router.replace({query: updatedQuery});
                }
                clearInterval(this.interval)
            }
        },
        refreshHandlerEvent(action) {
            if (action === 'compareTokens') {
                clearInterval(this.interval)
                this.compareTokens();
                this.refreshDex();
            }
        },
        observingTabVisibilityChange() {
            this.isVisible = !document.hidden;
            if (this.isVisible) {
                this.refreshDex();
            } else {
                clearInterval(this.interval);
            }
        }
    },
	mounted() {
		document.addEventListener('keydown', (e) => {
			if (e.key === 'Escape') {
				this.showTokens = false
			}
		})

		if (window?.Telegram?.WebApp && window.Telegram.WebApp.platform !== 'unknown') {
			window.Telegram.WebApp.ready();
			window.Telegram.WebApp.expand();
		}

		document.addEventListener('visibilitychange', this.observingTabVisibilityChange);
	},
	unmounted() {
		document.removeEventListener('visibilitychange', this.observingTabVisibilityChange);
		clearTimeout(this.debounce);
		clearInterval(this.interval);
		clearInterval(this.requestInterval);
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
                        this.dexStore.GET_DEAL_CONDITIONS?.output_amount > 0 ? this.tokenValues.second = this.dexStore.GET_DEAL_CONDITIONS.output_amount.toFixed(4) : this.tokenValues.second = '0'
                    } else {
                        this.tokenValues.second = '0'
                    }
                }
            }
        },
        'dexStore.GET_SEND_TOKEN': {
            handler() {
                if (this.dexStore.GET_RECEIVE_TOKEN !== null && this.dexStore.GET_SEND_TOKEN !== null && (this.dexStore.GET_SEND_AMOUNT > 0 || this.dexStore.GET_RECEIVE_AMOUNT > 0)) {
                    this.setDebounceForRequest()
                    clearInterval(this.interval)
                    this.refreshDex()
                    if (this.dexStore.DEX_DEAL_CONDITIONS !== null) {
                        this.dexStore.DEX_DEAL_CONDITIONS(null)
                    }

                    if (
                        this.dexStore.GET_RECEIVE_TOKEN?.stacking_pool_id == null ||
                        this.dexStore.GET_SEND_TOKEN?.stacking_pool_id == null ||
                        this.dexStore.GET_STAKING_POOL?.id !== this.dexStore.GET_SEND_TOKEN?.stacking_pool_id
                    ) {
                        this.dexStore.DEX_STAKING_POOL(null);
                    }
                }
            },
        },
        'dexStore.GET_RECEIVE_TOKEN': {
            handler() {
                if (
                    this.GET_RECEIVE_TOKEN !== null &&
                    this.dexStore.GET_SEND_TOKEN !== null &&
                    (this.dexStore.GET_SEND_AMOUNT > 0 || this.dexStore.GET_RECEIVE_AMOUNT > 0)
                ) {
                    this.setDebounceForRequest();
                    clearInterval(this.interval);
                    this.refreshDex();
                    if (this.dexStore.DEX_DEAL_CONDITIONS !== null) {
                        this.dexStore.DEX_DEAL_CONDITIONS(null);
                    }

                    if (
                        this.dexStore.GET_RECEIVE_TOKEN?.stacking_pool_id == null ||
                        this.dexStore.GET_SEND_TOKEN?.stacking_pool_id == null ||
                        this.dexStore.GET_STAKING_POOL?.id !== this.dexStore.GET_RECEIVE_TOKEN?.stacking_pool_id
                    ) {
                        this.dexStore.DEX_STAKING_POOL(null);
                    }
                }
            },
        },
        'dexStore.GET_SEND_AMOUNT': {
            handler() {
                this.dexStore.CHANGE_SWAP_MODE('default');
                this.sendWatchEvent();
                if (Number(this.tokenValues.first) !== this.dexStore.GET_SEND_AMOUNT && this.pageLoaded === false) {
                    console.log(this.GET_SEND_AMOUNT)
                    setTimeout(() => {
                        this.pageLoaded = true
                    }, 300)
                    this.tokenValues.first = String(this.dexStore.GET_SEND_AMOUNT)
                }

                if (this.dexStore.DEX_DEAL_CONDITIONS !== null) {
                    this.dexStore.DEX_DEAL_CONDITIONS(null);
                }
            },
        },
        'dexStore.GET_RECEIVE_AMOUNT': {
            handler() {
                this.dexStore.CHANGE_SWAP_MODE('reverse');
                this.receiveWatchEvent();

                if (Number(this.tokenValues.second) !== this.dexStore.GET_RECEIVE_AMOUNT && this.pageLoaded === false) {
                    setTimeout(() => {
                        this.pageLoaded = true
                    }, 300)
                    this.tokenValues.second = String(this.dexStore.GET_RECEIVE_AMOUNT)
                }

                if (this.dexStore.DEX_DEAL_CONDITIONS !== null) {
                    this.dexStore.DEX_DEAL_CONDITIONS(null);
                }
            },
        },
        'dexSettingsStore.GET_SLIPPAGE': {
            handler() {
                if (
                    this.dexStore.GET_RECEIVE_TOKEN !== null &&
                    this.dexStore.GET_SEND_TOKEN !== null &&
                    (this.dexStore.GET_SEND_AMOUNT > 0 || this.dexStore.GET_RECEIVE_AMOUNT > 0)
                ) {
                    this.setDebounceForRequest();
                    clearInterval(this.interval);
                    this.refreshDex();
                    if (this.dexStore.DEX_DEAL_CONDITIONS !== null) {
                        this.dexStore.DEX_DEAL_CONDITIONS(null);
                    }
                }
            },
        },
        'dexSettingsStore.GET_MAX_POOL_VOLATILITY': {
            handler() {
                if (
                    this.dexStore.GET_RECEIVE_TOKEN !== null &&
                    this.dexStore.GET_SEND_TOKEN !== null &&
                    (this.dexStore.GET_SEND_AMOUNT > 0 || this.dexStore.GET_RECEIVE_AMOUNT > 0)
                ) {
                    this.setDebounceForRequest();
                    clearInterval(this.interval);
                    this.refreshDex();
                    if (this.dexStore.DEX_DEAL_CONDITIONS !== null) {
                        this.dexStore.DEX_DEAL_CONDITIONS(null);
                    }
                }
            },
        },
        'dexSettingsStore.GET_MAX_INTERMEDIATE_TOKENS': {
            handler() {
                if (
                    this.dexStore.GET_RECEIVE_TOKEN !== null &&
                    this.dexStore.GET_SEND_TOKEN !== null &&
                    (this.dexStore.GET_SEND_AMOUNT > 0 || this.dexStore.GET_RECEIVE_AMOUNT > 0)
                ) {
                    this.setDebounceForRequest();
                    clearInterval(this.interval);
                    this.refreshDex();
                    if (this.dexStore.DEX_DEAL_CONDITIONS !== null) {
                        this.dexStore.DEX_DEAL_CONDITIONS(null);
                    }
                }
            },
        },
        'dexSettingsStore.GET_EXPERT_MODE_VALUE': {
            handler() {
                if (
                    this.dexStore.GET_RECEIVE_TOKEN !== null &&
                    this.dexStore.GET_SEND_TOKEN !== null &&
                    (this.dexStore.GET_SEND_AMOUNT > 0 || this.dexStore.GET_RECEIVE_AMOUNT > 0)
                ) {
                    this.setDebounceForRequest();
                    clearInterval(this.interval);
                    this.refreshDex();
                    this.receiveWatchEvent();
                    // if (this.dexStore.DEX_DEAL_CONDITIONS !== null) {
                    //   this.dexStore.DEX_DEAL_CONDITIONS(null);
                    // }
                }
            },
        },
    }
}
</script>

<style scoped>
.interface {
    display: flex;
    flex-direction: column;
    gap: 12px;
    max-width: 420px;
    width: 420px;
}

.interface__swap {
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding: 6px;
    border-radius: 12px;
    border: 1px solid var(--iface-white6);
}
</style>
