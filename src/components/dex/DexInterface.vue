<template>
	<div class="dex__main" :class="{without_chart: !showChartOption}">
		<DexTitle
			:refreshInfo="refreshInfo"
			@refresh="refreshHandlerEvent('compareTokens')"
		/>
		<div class="dex__interface-group">
			<div class="dex__interface">
				<DexYouSend
					ref="youSend"
					@chooseSendToken="chooseSendToken"
					:poolNotFound="poolNotFound"
          :refreshInfo="refreshInfo"
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
<!--				<DexRouteInfo-->
<!--					v-if="GET_DEAL_CONDITIONS !== null && GET_SEND_AMOUNT > 0 && GET_SEND_AMOUNT !== ''"-->
<!--				/>-->
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
import DexReverseInfo from '@/components/dex/DexReverseInfo.vue';
import DexYouSend from '@/components/dex/DexYouSend.vue';
import DexButton from '@/components/dex/DexButton.vue';
import DexInfo from '@/components/dex/DexInfo.vue';
import DexYouReceive from '@/components/dex/DexYouReceive.vue';
import DexCashback from '@/components/dex/DexCashback.vue';
import computedMixins from '@/mixins/computedMixins';
import tonConnectMixin from '@/mixins/tonConnectMixin';
import {mapActions, mapGetters} from 'vuex';
import {defineAsyncComponent} from 'vue';
import {setTransactionMessage} from '@/helpers/dex/calculate';
import {Address} from '@ton/core';
import DexUnstakeButton from '@/components/dex/DexUnstakeButton.vue';
import DexStakeButton from '@/components/dex/DexStakeButton.vue';
import {dexService, tokenService} from '@/api/coffeeApi/services';
import SwapFieldController from "@/components/swap-interface/SwapFieldController.vue";

export default {
    name: "DexInterface",
    mixins: [computedMixins, tonConnectMixin],
    props: {
        tonConnectUi: {
            type: Object,
            default() {
                return {}
            }
        }
    },
    components: {
        SwapFieldController,
        DexUnstakeButton,
        DexStakeButton,
        DexRouteInfo: defineAsyncComponent(() => {
            return import("@/components/dex/DexRouteInfo.vue")
        }),
        TokensPopup: defineAsyncComponent(() => {
            return import("@/components/dex/tokens-popup/TokensPopup.vue")
        }),
        DexSuccess: defineAsyncComponent(() => {
            return import("@/components/dex/DexSuccess.vue")
        }),
        DexDetails: defineAsyncComponent(() => {
            return import("@/components/dex/DexDetails.vue")
        }),
        DexCashback,
        DexYouReceive,
        DexInfo,
        DexButton,
        DexYouSend,
        DexReverseInfo,
    },
    data() {
        return {
            startTransaction: false,
            poolAbortController: null,
            abortController: null,
            interval: null,
            requestInterval: null,
            intervalTime: 300,
            poolNotFound: false,
            calculateRequestData: null,
            debounce: null,
            showTokens: false,
            tokenMode: 'SEND',
            showSuccess: false,
            transactionStatus: null,
            trInfo: null,
            refreshInfo: false,
            isVisible: true,
            unstakeProcessing: false,
            stakeProcessing: false,
            getRouteRequestCounter: 0,
        }
    },
    computed: {
        ...mapGetters([
            'GET_TON_TOKENS',
            'GET_DEAL_CONDITIONS',
            'GET_USER_TOKENS',
            'GET_DEX_WALLET',
            'GET_RECEIVE_TOKEN',
            'GET_RECEIVE_AMOUNT',
            'GET_SEND_TOKEN',
            'GET_SEND_AMOUNT',
            'GET_SWAP_MODE',
            'GET_SLIPPAGE',
            // 'GET_CASHBACK',
            'GET_PRICE_IMPACT',
            'GET_MAX_POOL_VOLATILITY',
            'GET_MAX_INTERMEDIATE_TOKENS',
            'GET_EXPERT_MODE_VALUE',
            'GET_MAX_SPLITS',
            'GET_STAKING_POOL',
            'GET_CHART_VISIBLE_SETTING',
            'GET_LIQUIDITY_SOURCES'
        ]),
        canStake() {
            let findTokenInUser = this.GET_USER_TOKENS.find((item) => item.symbol === "TON")
            let enoughBalance = findTokenInUser && findTokenInUser?.balance >= this.GET_SEND_AMOUNT
            let validAmount = this.GET_SEND_AMOUNT > 0 && enoughBalance

            return (
                this.GET_STAKING_POOL !== null &&
                this.GET_SEND_TOKEN?.address === 'native' &&
                this.GET_RECEIVE_TOKEN?.stacking_pool_id !== null &&
                this.GET_RECEIVE_TOKEN.hasOwnProperty('stacking_pool_id') &&
                validAmount
            );
        },
        canUnstake() {
            let findTokenInUser = this.GET_USER_TOKENS.find(
                (item) => item.symbol === this.GET_SEND_TOKEN?.symbol,
            );
            let enoughBalance = findTokenInUser && findTokenInUser?.balance >= this.GET_SEND_AMOUNT;
            let validAmount = this.GET_SEND_AMOUNT > 0 && enoughBalance;

            return this.GET_STAKING_POOL !== null && this.GET_RECEIVE_TOKEN?.address === 'native' &&
                this.GET_SEND_TOKEN?.stacking_pool_id !== null && this.GET_SEND_TOKEN.hasOwnProperty("stacking_pool_id") && validAmount
        },
        checkDexStatus() {
            let priceImpact = 0
            if (this.GET_DEAL_CONDITIONS != null) {
                let inputUsd = this.GET_DEAL_CONDITIONS?.input_usd
                let outputUsd = this.GET_DEAL_CONDITIONS?.output_usd
                priceImpact = (outputUsd - inputUsd) / inputUsd * 100
            }

            if (this.poolNotFound || this.GET_DEAL_CONDITIONS?.output_usd === 0) {
                return 'POOL_NOT_FOUND'
            } else if (this.loadingConditions || this.startTransaction === true || this.firstLoading) {
                return 'LOADING'
            } else if (this.GET_DEX_WALLET === null) {
                return 'NOT_CONNECTED'
            } else if (this.GET_RECEIVE_TOKEN === null) {
                return 'NOT_SELECTED'
            } else if (priceImpact < -this.GET_PRICE_IMPACT) {
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
            return this.GET_RECEIVE_TOKEN !== null && this.GET_SEND_TOKEN !== null && this.GET_SEND_AMOUNT > 0 && this.GET_DEAL_CONDITIONS === null;
        },
        firstLoading() {
            let route = this.$route
            if (route.query?.ft && route.query?.st) {
                return this.GET_DEAL_CONDITIONS === null && this.GET_TON_TOKENS.length === 0
            }
        },
        notEnoughConditions() {
            const userTonBalance = this.GET_USER_TOKENS.find(
                (item) => item.address === 'native'
            );

            const partnerFee = this.GET_DEAL_CONDITIONS?.partner_commission_ton;
            let tonGas;

            if (partnerFee) {
                tonGas = (this.GET_DEAL_CONDITIONS?.recommended_gas) + partnerFee
            } else {
                tonGas = this.GET_DEAL_CONDITIONS?.recommended_gas;
            }

            if (this.GET_SEND_TOKEN?.address === 'native' && this.GET_SWAP_MODE === 'default') {
                if (userTonBalance?.balance < tonGas + this.GET_SEND_AMOUNT) {
                    return {result: true, reason: "noGas"};
                }
            } else if (this.GET_SEND_TOKEN?.address === 'native' && this.GET_SWAP_MODE === 'reverse') {
                if (userTonBalance?.balance < tonGas + this.GET_RECEIVE_AMOUNT) {
                    return {result: true, reason: "noGas"};
                }
            }

            if (userTonBalance?.balance < tonGas) {
                return {result: true, reason: "noGas"};
            }

            const findTokenInUser = this.GET_USER_TOKENS.find(
                (item) => item.address === this.GET_SEND_TOKEN?.address
            );

            const hasEnoughBalance =
                findTokenInUser &&
                findTokenInUser?.balance >= this.GET_DEAL_CONDITIONS?.input_amount &&
                this.GET_DEAL_CONDITIONS?.input_amount > 0;

            if (!hasEnoughBalance) {
                return {result: true, reason: "noBalance"};
            }

            return {result: false, reason: null};
        },
        showChartOption() {
            return this.GET_CHART_VISIBLE_SETTING;
        }
    },
    methods: {
        ...mapActions([
            'DEX_DEAL_CONDITIONS',
            'DEX_WALLET',
            'CHANGE_SWAP_MODE',
            'DEX_MAX_SPLITS',
            'DEX_STAKING_POOL',
            'DEX_SEND_AMOUNT',
        ]),
        getTransactionParams(trInfo) {
            // let cashback = this.GET_DEAL_CONDITIONS?.paths.length <= 3 ? this.GET_CASHBACK : false
            let cashback = false

            let messages = setTransactionMessage(this.calculateRequestData.data, cashback, trInfo.transactions)
            return {
                validUntil: Math.floor(Date.now() / 1000) + 60, // 60 sec
                messages: messages,
            }

        },
        chooseSendToken() {
            if (this.tokenMode !== 'SEND') {
                this.tokenMode = 'SEND'
            }
            this.showTokens = true
        },
        chooseReceiveToken() {
            if (this.tokenMode !== 'RECEIVE') {
                this.tokenMode = 'RECEIVE'
            }
            this.showTokens = true
        },
        closePopup() {
            this.showTokens = false
        },
        closeSuccess() {
            this.showSuccess = false
            this.transactionStatus = null
            this.$emit('updateWalletInfo')
            clearInterval(this.requestInterval)
            // this.getAccountInfo(this.GET_DEX_WALLET)
            this.$refs.youSend.clearAmounts()
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
                if ((this.GET_SEND_AMOUNT > 0 && this.GET_SWAP_MODE === 'default') || (this.GET_RECEIVE_AMOUNT > 0 && this.GET_SWAP_MODE === 'reverse') && !this.showSuccess) {
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
                    this.GET_SEND_TOKEN &&
                    typeof this.GET_SEND_TOKEN === 'object' &&
                    this.GET_SEND_TOKEN.hasOwnProperty('stacking_pool_id') &&
                    this.GET_SEND_TOKEN.stacking_pool_id !== null
                ) {
                    const response = await tokenService.getStakingPool(this.GET_SEND_TOKEN.stacking_pool_id);
                    this.DEX_STAKING_POOL(response?.data);
                }
                if (
                    this.GET_RECEIVE_TOKEN &&
                    typeof this.GET_RECEIVE_TOKEN === 'object' &&
                    this.GET_RECEIVE_TOKEN.hasOwnProperty('stacking_pool_id') &&
                    this.GET_RECEIVE_TOKEN.stacking_pool_id !== null
                ) {
                    const response = await tokenService.getStakingPool(this.GET_RECEIVE_TOKEN.stacking_pool_id);
                    this.DEX_STAKING_POOL(response?.data);
                }

                let requestKey = ++this.getRouteRequestCounter;

                if (
                    this.GET_SEND_AMOUNT || this.GET_RECEIVE_AMOUNT &&
                    this.GET_SEND_AMOUNT > 0 || this.GET_RECEIVE_AMOUNT > 0
                ) {
                    const routeResponse = await dexService.getRoute(requestData);

                    if (this.getRouteRequestCounter === requestKey) {
                        this.calculateRequestData = routeResponse;
                        if (Array.isArray(this.calculateRequestData.data?.paths) && this.calculateRequestData.data.paths.length > 0) {
                            this.DEX_DEAL_CONDITIONS(this.calculateRequestData.data);
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
            const maxVolatility = this.GET_MAX_POOL_VOLATILITY;

            const result = {
                dexes
            };

            if (Number(maxVolatility) !== -1) {
                result.max_volatility = maxVolatility / 100;
            }

            return result;
        },
        setAsset() {
            let fromTokenAddress = 'native';
            let toTokenAddress = 'native';

            if (this.GET_SEND_TOKEN.type !== 'native') {
                fromTokenAddress = Address.parse(this.GET_SEND_TOKEN?.address).toString();
            }

            if (this.GET_RECEIVE_TOKEN?.type !== 'native') {
                toTokenAddress = Address.parse(this.GET_RECEIVE_TOKEN?.address).toString();
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
                max_length: this.GET_MAX_INTERMEDIATE_TOKENS + 2,
                pool_selector: this.getPoolSelector(this.GET_LIQUIDITY_SOURCES),
                max_splits: this.GET_MAX_SPLITS,
                additional_data: null
            }

			if (this.GET_DEX_WALLET !== null) {
                if (this.GET_DEX_WALLET) {
                    const referralName = sessionStorage.getItem('referral_name');
                    asset.additional_data = {
                        sender_address: Address.parseRaw(this.GET_DEX_WALLET.address).toString(),
                        referral_name: referralName ? JSON.parse(referralName) : null
                    };
                }
            }

            if (this.GET_SWAP_MODE === 'default') {
                asset.input_amount = Number(this.GET_SEND_AMOUNT);
            } else if (this.GET_SWAP_MODE === 'reverse') {
                asset.output_amount = Number(this.GET_RECEIVE_AMOUNT);
            }

            if (this.GET_DEX_WALLET?.version) {
                if (this.GET_DEX_WALLET?.version >= 5) {
                    this.DEX_MAX_SPLITS(parseInt(this.GET_MAX_SPLITS)) || 20;
                } else {
                    this.DEX_MAX_SPLITS(parseInt(this.GET_MAX_SPLITS) || 4);
                }
            }
            // console.log(asset)
            return asset;
        },
        dexAction() {
            if (this.checkDexStatus === 'NOT_CONNECTED') {
                if (this.tonConnectUi.wallet !== null) {
                    this.DEX_WALLET(this.tonConnectUi.wallet.account);
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
                let sender = Address.parseRaw(this.GET_DEX_WALLET?.address).toString()
                let referralName = JSON.parse(sessionStorage.getItem('referral_name'))
                let transaction = await dexService.getStakeTransaction(sender, this.GET_RECEIVE_TOKEN?.address, this.GET_SEND_AMOUNT, referralName)
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
                this.DEX_SEND_AMOUNT(0)
            } finally {
                this.stakeProcessing = false
            }
        },
        async unstakeAction() {
            try {
                this.unstakeProcessing = true
                let sender = Address.parseRaw(this.GET_DEX_WALLET?.address).toString()
                let transaction = await dexService.getUnstakeTransaction(sender, this.GET_SEND_TOKEN?.address, this.GET_SEND_AMOUNT)
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

                let sender = Address.parseRaw(this.GET_DEX_WALLET?.address).toString();
                let referralName = JSON.parse(sessionStorage.getItem('referral_name'));
                this.trInfo = (await dexService.getRouteTransactions(
                    this.GET_DEAL_CONDITIONS,
                    sender,
                    this.GET_SLIPPAGE / 100,
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
            if (this.GET_RECEIVE_TOKEN !== null && this.GET_SEND_TOKEN !== null && this.GET_SEND_AMOUNT > 0) {
                this.setDebounceForRequest()
                clearInterval(this.interval)
                this.refreshDex()

                this.$router.replace({
                    name: 'Dex',
                    query: {
                        ft: this.toSafeAddress(this.GET_SEND_TOKEN?.address),
                        st: this.toSafeAddress(this.GET_RECEIVE_TOKEN?.address),
                        fa: this.GET_SEND_AMOUNT
                    }
                })
            } else if (this.GET_SEND_TOKEN !== null && this.GET_SEND_AMOUNT > 0) {
                this.$router.replace({
                    name: 'Dex',
                    query: {ft: this.toSafeAddress(this.GET_SEND_TOKEN?.address), fa: this.GET_SEND_AMOUNT}
                })
            } else {

                if (this.abortController !== null) {
                    this.abortController.abort();
                }

                if (this.GET_SEND_AMOUNT === 0) {
                    const updatedQuery = {...this.$route.query};

                    delete updatedQuery.fa;

                    if (this.GET_SEND_TOKEN !== null && this.GET_SEND_TOKEN?.address) {
                        updatedQuery.ft = this.toSafeAddress(this.GET_SEND_TOKEN?.address);
                    }

                    this.$router.replace({query: updatedQuery});
                }

                if (this.GET_RECEIVE_TOKEN === null) {
                    const updatedQuery = {...this.$route.query};
                    delete updatedQuery?.st;
                    this.$router.replace({query: updatedQuery});
                }

                clearInterval(this.interval);
            }
        },
        receiveWatchEvent() {
            if (this.GET_RECEIVE_TOKEN !== null && this.GET_SEND_TOKEN !== null && this.GET_RECEIVE_AMOUNT > 0) {
                this.setDebounceForRequest()
                clearInterval(this.interval)
                this.refreshDex()
                this.$router.replace({
                    name: 'Dex',
                    query: {
                        ft: this.toSafeAddress(this.GET_SEND_TOKEN?.address),
                        st: this.toSafeAddress(this.GET_RECEIVE_TOKEN?.address),
                        sa: this.GET_RECEIVE_AMOUNT
                    }
                })

            } else {
                if (this.abortController !== null) {
                    this.abortController.abort()
                }
                if (this.GET_RECEIVE_AMOUNT === 0) {
                    const updatedQuery = {...this.$route.query};

                    delete updatedQuery.sa;

                    if (this.GET_RECEIVE_TOKEN !== null && this.GET_RECEIVE_TOKEN?.address) {
                        updatedQuery.sa = this.toSafeAddress(this.GET_RECEIVE_TOKEN?.address);
                    }

                    this.$router.replace({query: updatedQuery});
                }
                if (this.GET_RECEIVE_TOKEN === null) {
                    const updatedQuery = {...this.$route.query};
                    delete updatedQuery?.st;
                    this.$router.replace({query: updatedQuery});
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
        showTokens: {
            handler: function () {
                // if (window.innerWidth <= 640) {
                if (this.showTokens) {
                    document.documentElement.style.overflow = 'hidden'
                    // disablePageScroll()
                    return
                }
                // enablePageScroll()
                document.documentElement.style.overflow = 'auto'
                // }
            }
        },
        showSuccess: {
            handler: function () {
                if (this.showSuccess) {
                    document.documentElement.style.overflow = 'hidden'
                    return
                }
                document.documentElement.style.overflow = 'auto'
            }
        },
        GET_SEND_TOKEN: {
            handler() {
                if (this.GET_RECEIVE_TOKEN !== null && this.GET_SEND_TOKEN !== null && (this.GET_SEND_AMOUNT > 0 || this.GET_RECEIVE_AMOUNT > 0)) {
                    this.setDebounceForRequest()
                    clearInterval(this.interval)
                    this.refreshDex()
                    if (this.DEX_DEAL_CONDITIONS !== null) {
                        this.DEX_DEAL_CONDITIONS(null)
                    }

                    if (
                        this.GET_RECEIVE_TOKEN?.stacking_pool_id == null ||
                        this.GET_SEND_TOKEN?.stacking_pool_id == null ||
                        this.GET_STAKING_POOL?.id !== this.GET_SEND_TOKEN?.stacking_pool_id
                    ) {
                        this.DEX_STAKING_POOL(null);
                    }
                }
            },
        },
        GET_RECEIVE_TOKEN: {
            handler() {
                if (
                    this.GET_RECEIVE_TOKEN !== null &&
                    this.GET_SEND_TOKEN !== null &&
                    (this.GET_SEND_AMOUNT > 0 || this.GET_RECEIVE_AMOUNT > 0)
                ) {
                    this.setDebounceForRequest();
                    clearInterval(this.interval);
                    this.refreshDex();
                    if (this.DEX_DEAL_CONDITIONS !== null) {
                        this.DEX_DEAL_CONDITIONS(null);
                    }

                    if (
                        this.GET_RECEIVE_TOKEN?.stacking_pool_id == null ||
                        this.GET_SEND_TOKEN?.stacking_pool_id == null ||
                        this.GET_STAKING_POOL?.id !== this.GET_RECEIVE_TOKEN?.stacking_pool_id
                    ) {
                        this.DEX_STAKING_POOL(null);
                    }
                }
            },
        },
        GET_SEND_AMOUNT: {
            handler() {
                this.CHANGE_SWAP_MODE('default');
                this.sendWatchEvent();

                if (this.DEX_DEAL_CONDITIONS !== null) {
                    this.DEX_DEAL_CONDITIONS(null);
                }
            },
        },
        GET_RECEIVE_AMOUNT: {
            handler() {
                this.CHANGE_SWAP_MODE('reverse');
                this.receiveWatchEvent();

                if (this.DEX_DEAL_CONDITIONS !== null) {
                    this.DEX_DEAL_CONDITIONS(null);
                }
            },
        },
        GET_SLIPPAGE: {
            handler() {
                if (
                    this.GET_RECEIVE_TOKEN !== null &&
                    this.GET_SEND_TOKEN !== null &&
                    (this.GET_SEND_AMOUNT > 0 || this.GET_RECEIVE_AMOUNT > 0)
                ) {
                    this.setDebounceForRequest();
                    clearInterval(this.interval);
                    this.refreshDex();
                    if (this.DEX_DEAL_CONDITIONS !== null) {
                        this.DEX_DEAL_CONDITIONS(null);
                    }
                }
            },
        },
        GET_MAX_POOL_VOLATILITY: {
            handler() {
                if (
                    this.GET_RECEIVE_TOKEN !== null &&
                    this.GET_SEND_TOKEN !== null &&
                    (this.GET_SEND_AMOUNT > 0 || this.GET_RECEIVE_AMOUNT > 0)
                ) {
                    this.setDebounceForRequest();
                    clearInterval(this.interval);
                    this.refreshDex();
                    if (this.DEX_DEAL_CONDITIONS !== null) {
                        this.DEX_DEAL_CONDITIONS(null);
                    }
                }
            },
        },
        GET_MAX_INTERMEDIATE_TOKENS: {
            handler() {
                if (
                    this.GET_RECEIVE_TOKEN !== null &&
                    this.GET_SEND_TOKEN !== null &&
                    (this.GET_SEND_AMOUNT > 0 || this.GET_RECEIVE_AMOUNT > 0)
                ) {
                    this.setDebounceForRequest();
                    clearInterval(this.interval);
                    this.refreshDex();
                    if (this.DEX_DEAL_CONDITIONS !== null) {
                        this.DEX_DEAL_CONDITIONS(null);
                    }
                }
            },
        },
        GET_EXPERT_MODE_VALUE: {
            handler() {
                if (
                    this.GET_RECEIVE_TOKEN !== null &&
                    this.GET_SEND_TOKEN !== null &&
                    (this.GET_SEND_AMOUNT > 0 || this.GET_RECEIVE_AMOUNT > 0)
                ) {
                    this.setDebounceForRequest();
                    clearInterval(this.interval);
                    this.refreshDex();
                    this.receiveWatchEvent();
                    // if (this.DEX_DEAL_CONDITIONS !== null) {
                    //   this.DEX_DEAL_CONDITIONS(null);
                    // }
                }
            },
        },
    },
    // mounted() {
    //   document.addEventListener('keydown', (e) => {
    //     if (e.key === 'Escape') {
    //       this.showTokens = false;
    //     }
    //   });
    //
    //   if (window?.Telegram?.WebApp?.platform !== 'unknown') {
    //     window.Telegram.WebApp.ready();
    //     window.Telegram.WebApp.expand();
    //   }
    //   document.addEventListener('visibilitychange', this.observingTabVisibilityChange);
    // },
    // unmounted() {
    //   document.removeEventListener('visibilitychange', this.observingTabVisibilityChange);
    //   clearTimeout(this.debounce);
    //   clearInterval(this.interval);
    //   clearInterval(this.requestInterval);
    // },
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

.slide-info-enter-active,
.slide-info-leave-active {
    transition: 0.15s ease-out;
}

.slide-info-enter-from,
.slide-info-leave-to {
    margin-top: -75px;
    transform-origin: bottom;
    transform: translateY(65px);
    opacity: 0;
}

.slide-reverse-enter-active,
.slide-reverse-leave-active {
    transition: 0.15s ease-out;
}

.slide-reverse-enter-from,
.slide-reverse-leave-to {
    margin-top: -62px;
    transform-origin: bottom;
    transform: translateY(62px);
}

.slide-plan-enter-active,
.slide-plan-leave-active {
    transition: 0.15s ease-out;
}

.slide-plan-enter-from,
.slide-plan-leave-to {
    margin-top: -30px;
    transform-origin: bottom;
    transform: translateY(30px);
}

.dex__main {
    max-width: 400px;
    width: 400px;
    min-width: 400px;
    margin: 0 auto 0 16px;
    display: flex;
    flex-direction: column;
}

.without_chart {
    margin: 0 auto;
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
        width: auto;
        flex: 30%;
    }
}

@media screen and (max-width: 1000px) {
    .dex__main {
        flex: 40%;
    }
}

@media screen and (max-width: 880px) {
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
