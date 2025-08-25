<template>
    <div class="multi-swap">
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
            class="multi-swap__interface"
            :routeInfo="dexStore.dealConditions"
            :interfaceStatus="interfaceStatus"
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
import SwapHeader from "@/components/swap-interface/SwapHeader.vue";
import MevSettingPopup from "@/components/dex/mev/MevSettingPopup.vue";
import SwapInterface from "@/components/swap-interface/SwapInterface.vue";
import TokensPopup from "@/components/dex/tokens-popup/TokensPopup.vue";
import DexSettings from "@/components/modals/DexSettingsModal.vue";
import TransactionStatusModal from "@/components/modals/TransactionStatusModal.vue";
import * as SwapRouting from "@/helpers/swap-routing";
import {Address} from "@ton/core";
import {
    dexTransaction,
    multiTransaction
} from "@/helpers/swap-interface/send-transaction.js";
import resetLimitTokens from "@/mixins/resetLimitTokens.js";
import numberFormatting from "@/mixins/numberFormatting.ts";
import SwapSettingsModal from "@/components/modals/SwapSettingsModal.vue";
import {defineComponent} from "vue";
import {useDexStore} from "@/stores/dex";
import {useDexSettingsStore} from "@/stores/dex/settings.ts";
import {useTransactionStore} from "@/stores/transaction";
import {dispatchSdkEvent, ReadonlySdkEvent} from "@/helpers/events";
import type { DefineComponent } from 'vue';

export default {
    name: "MultiSwapPage",
    components: {SwapSettingsModal, DexSettings, TokensPopup, SwapInterface, MevSettingPopup, SwapHeader, TransactionStatusModal},
    mixins: [resetLimitTokens, numberFormatting],
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
			addNewAsset: this.addNewAsset,
			updateTokenValue: this.changeTokenValue,
			updateTokenModalVisible: this.openTokenModal,
            updateMevModal: this.openMevModal,
			updateSettingsModalVisible: this.openSettingsModal,
			swapPositions: this.swapTokenPositions,
			removeTokenAsset: this.removeTokenAsset,
			updateToken: this.changeToken,
			multiSwapAction: this.multiSwapAction,
			tokenValues: this.tokenValues,
            processing: this.processing,
            isUpdatingBalances: () => this.isUpdatingBalances,
            multiSwapAmountsReady: () => this.allAmountsReady,
            modalState: this.successModalState,
            updateShowModal: this.closeSuccess,
		}
	},
	inject: ['updateWalletInfo'],
    data() {
        return {
            modals: {
                token: false,
                settings: false,
                mevSettings: false
            },
            successModalState: {
                mode: 'multi',
                show: false
            },
            tokenValues: {
                first: '0',
                receive: '0'
            },
            processing: {
                multi: false,
            },

            tokenModalMode: 'first',
            poolNotFound: false,
            refreshInfo: false,
            isUpdatingBalances: false,
            balanceUpdateCooldown: false,

	        isVisible: true,
	        tabVisibilityWatcher: null,
	        pageLoaded: false,
            debounce: null,

            usdtAddress: "0:b113a994b5024a16719f69139328eb759596c38a25f59028b146fecdc3621dfe"
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
            const tokens = Array.from(this.dexStore.sendMultiTokens?.values() || []);
            return !this.exceptionCondition && tokens.every((token: any) => token?.listed);
        },
        exceptionCondition() {
            const mevDisabled = [
                'EQCAj5oiRRrXokYsg_B-e0KG9xMwh5upr5I8HQzErm0_BLUM',
                "EQA2XBW7MAbSjq5n7tW2_SRlr0XqwJZU0L6u6mLFMKdC5S4Z",
                "EQBE_gBrU3mPI9hHjlJoR_kYyrhQgyCFD6EUWfa42W8T7EBP"
            ]
            
            let found: any = false
            if (this.dexStore.sendMultiTokens) {
                found = Array.from(this.dexStore.sendMultiTokens.entries()).find(([key, value]: [any, any]) => {
                    if (value.address !== 'native') {
                        const friendly =  Address.parse(value?.address).toString()
                        return mevDisabled.includes(friendly)
                    }
                });
            }
            
            return !!found
        },
        interfaceStatus() {
            let priceImpact = 0
            if (this.dexStore.calculatedPriceImpact) {
                priceImpact = this.dexStore.calculatedPriceImpact
            }

            if (this.poolNotFound || this.dexStore.dealConditions?.output_usd === 0) {
                return 'POOL_NOT_FOUND'
            } else if (this.loadingConditions || this.processing.multi === true || this.firstLoading) {
                return 'LOADING'
            } else if (this.dexStore.dexWallet === null) {
                return 'NOT_CONNECTED'
            } else if ((priceImpact < -this.dexSettingsStore.GET_PRICE_IMPACT) && this.dexStore.dealConditions !== null) {
                return 'HIGH_PRICE_IMPACT'
            } else if (!this.allAmountsReady) {
                return 'NOT_AMOUNT'
            } else if (this.notEnoughConditions.reason === "noBalance") {
                return 'NOT_ENOUGH'
            } else if (this.notEnoughConditions.reason === "noGas") {
                return 'NOT_ENOUGH_GAS'
            } else {
                return 'READY_DEX'
            }
        },
        loadingConditions() {
            return this.dexStore.sendMultiTokens !== null && this.dexStore.receiveMultiToken !== null && this.allAmountsReady && this.dexStore.dealConditions === null;
        },
        firstLoading() {
            // Перевіряємо активний таб через store замість router
            return this.dexStore.dealConditions === null && this.dexStore.tonTokens.length === 0
        },
        allAmountsReady() {
            const keysToCheck = Object.keys(this.tokenValues).filter(key => key !== 'receive');
            return keysToCheck.every(key => Number(this.tokenValues[key]) > 0);
        },
        getTonGas() {
	        const {
		        total_mev_protection_fee = 0,
	        } = this.dexStore.dealConditions || {};

            let recommended_gas = this.dexStore.dealConditions.routes.reduce((sum, route) => sum + (route.recommended_gas ?? 0), 0);

	        return recommended_gas + total_mev_protection_fee + 0.00001;
        },
        allBalancesReady() {
			let result = true

	        this.dexStore.sendMultiTokens.forEach((token, key) => {
				if (token?.balance < Number(this.tokenValues[key])) {
					result = false
                } else if (token?.address === 'native' && token?.balance < Number(this.tokenValues[key]) + this.getTonGas) {
					result = false
                }
            })

            return result
        },
        notEnoughConditions() {
            const userTonBalance = this.dexStore.userTokens.find(
                (item) => item.address === 'native'
            );

            if (userTonBalance?.balance < this.getTonGas) {
                return {result: true, reason: "noGas"};
            }

			if (!this.allBalancesReady) {
				return {result: true, reason: "noBalance"}
            }

            return {result: false, reason: null};
        },
        assetForCompare() {
            let asset = {
                wallet: this.dexStore.dexWallet,
                inputAssets: this.getInputAssets,
                outputAsset: this.getOutputAsset,
                maxIntermediate: this.dexSettingsStore.GET_MAX_INTERMEDIATE_TOKENS,
                maxVolatility: this.dexSettingsStore.GET_MAX_POOL_VOLATILITY,
                maxSplits: this.dexStore.dexWalletVersion >= 5 ? 20 : 4,
                changePoolNotFound: this.changePoolNotFound,
                changeRefreshInfo: this.changeRefreshInfo,
                liquiditySources: this.dexSettingsStore.GET_LIQUIDITY_SOURCES,
                mevProtection: false,
                amounts: this.tokenValues,
                swapMode: 'default',
            }

            let total_usd = 0
            this.dexStore.sendMultiTokens.forEach((token, key) => {
                total_usd += Number(this.tokenValues[key]) * token.price_usd
            })

            if (this.dexSettingsStore.GET_MEV_PROTECTION_VALUE && this.isListedPair && (total_usd >= Number(this.dexSettingsStore.GET_MEV_MIN_USD))) {
                asset = {
                    ...asset,
                    mevProtection: true
                }
            }

            return asset
        },
        getInputAssets() {
			let array = []

			this.dexStore.sendMultiTokens.forEach((token, key) => {
                let asset = {
					token: {
						blockchain: "ton",
                        address: token.address !== 'native'
                            ? Address.parse(token.address).toString()
                            : token.address
                    },
                    amount: +this.tokenValues[key]
                }

				array.push(asset)
            })

            return array
        },
        getOutputAsset() {
			let asset = {
                blockchain: "ton",
                address: this.dexStore.receiveMultiToken.address !== 'native'
                    ? Address.parse(this.dexStore.receiveMultiToken.address).toString()
                    : this.dexStore.receiveMultiToken.address
            }

			return asset
        },
	    refreshData() {
		    return {
			    compareAsset: this.assetForCompare,
			    showSuccess: this.successModalState.show,
			    tabVisibility: this.isVisible,
			    refreshCallback: SwapRouting.multiCompare
		    }
	    },
        tokensWatcherData() {
			return {
				tokens: this.dexStore.sendMultiTokens,
                amounts: this.dexStore.sendMultiValues,
                dealConditions: this.dexStore.dealConditions,
                refreshData: this.refreshData
            }
        },
        amountsWatcherData() {
			return {
				...this.tokensWatcherData
            }
        },
	    changeSettingsWatcherData() {
		    return {
			    ...this.tokensWatcherData,
			    liquiditySources: this.dexSettingsStore.GET_LIQUIDITY_SOURCES
		    }
	    },
	    trackingData() {
		    return {
			    ...this.tokensWatcherData,
			    wallet: this.dexStore.dexWallet,
			    liquiditySources: this.dexSettingsStore.GET_LIQUIDITY_SOURCES
		    }
	    },
        getTransactionStatus() {
            const trResult = this.transactionStore.GET_SWAP_TRANSACTION_STATUS
            if (trResult !== null) {
                return trResult.status
            }
            return 'pending'
        },
	    multiTransactionData() {
		    let data = {
			    updateProcessing: this.updateProcessing,
			    compareAsset: this.assetForCompare,
			    wallet: this.dexStore.dexWallet,
			    dealConditions: this.dexStore.dealConditions,
			    slippage: this.dexSettingsStore.GET_SLIPPAGE,
			    tonConnectUi: this.tonConnectUi,
			    trackingData: this.trackingData,
			    mevProtection: false
		    }

			let total_usd = 0

			this.dexStore.sendMultiTokens?.forEach((token, key) => {
				total_usd += token?.price_usd * this.tokenValues[key]
            })

		    if (this.dexSettingsStore.GET_MEV_PROTECTION_VALUE && this.isListedPair && (total_usd >= Number(this.dexSettingsStore.GET_MEV_MIN_USD))) {
			    data = {
				    ...data,
				    mevProtection: true
			    }
		    }

		    return data
	    }
    },
    methods: {
        openTokenModal(value) {
            this.tokenModalMode = value
            this.modals.token = true
        },
        openSettingsModal() {
            this.modals.settings = true
        },
        openMevModal() {
            this.modals.mevSettings = true
        },
        setDefaultAsset() {
			this.dexStore.CLEAR_MULTI_STORE()

            let map = new Map()

            let findTon = this.dexStore.tonTokens.find((item) => item.address === 'native')
            let findUsdt = this.dexStore.tonTokens.find((item) => item.address === this.usdtAddress)

            map.set('first', findTon)
            this.dexStore.SAVE_SEND_MULTI_TOKENS(map)
            this.dexStore.SAVE_RECEIVE_MULTI_TOKEN(findUsdt)
        },
        addNewAsset() {
            let map = this.setNewMap();

            let availableIndex = 0;
            while (availableIndex < this.dexStore.assetKeys.length && map.has(this.dexStore.assetKeys[availableIndex])) {
                availableIndex++;
            }

            if (availableIndex >= this.dexStore.assetKeys.length) {
                console.error('Достигнуто максимальное количество ассетов');
                return;
            }

            let newKey = this.dexStore.assetKeys[availableIndex];
            let findToken = this.getAvailableToken(newKey)

            this.tokenValues[newKey] = '0';
            map.set(newKey, findToken);

	        const {receive, ...otherValues} = this.tokenValues
			this.dexStore.SAVE_SEND_MULTI_VALUES(otherValues)
            this.dexStore.SAVE_SEND_MULTI_TOKENS(map);
        },
        getAvailableToken(key) {
            let selectedTokens = [
				...Array.from(this.dexStore.sendMultiTokens.values()),
                this.dexStore.receiveMultiToken
            ]

            const allUserTokensSelected = this.dexStore.userTokens.length > 0 &&
                this.dexStore.userTokens.every(userToken =>
                    selectedTokens.some(selected => selected.address === userToken.address)
                );

            let array;
            if (this.dexStore.dexWallet && this.dexStore.userTokens.length > 0 && !allUserTokensSelected) {
                array = this.dexStore.userTokens
            } else {
                array = this.dexStore.tonTokens
            }

			array = array
                .filter((item) => item?.listed)
				.sort((a, b) => b.imported - a.imported)
                .sort((a, b) => b?.balance * b?.price_usd - a?.balance * a?.price_usd)
            
            if (key === 'first') {
                return array.find(item => item.address === 'native') || null;
            } else {
                return array.find(item =>
                    item.address !== 'native' &&
                    !selectedTokens.some(selected => selected.address === item.address)
                ) || null;
            }
        },
        setNewMap() {
            let map = new Map()
            this.dexStore.sendMultiTokens.forEach((token, key) => map.set(key, token))
            return map
        },
        changeTokenValue(data) {
			this.tokenValues[data.key] = data.value

	        const {receive, ...otherValues} = this.tokenValues

	        data.key !== 'receive'
                ? this.dexStore.SAVE_SEND_MULTI_VALUES(otherValues)
                : this.dexStore.SAVE_RECEIVE_MULTI_VALUE(receive)
        },
        changeToken(key, value) {
            if (key === 'receive') {
                this.dexStore.SAVE_RECEIVE_MULTI_TOKEN(value)
                return
            }

            if (this.dexStore.assetKeys.includes(key)) {
                let map = this.setNewMap()
                map.set(key, value)
                this.dexStore.SAVE_SEND_MULTI_TOKENS(map)
            }
        },
        removeTokenAsset(key) {
            let map = this.setNewMap();
            map.delete(key);
            delete this.tokenValues[key]; // Очищаем значение
            this.dexStore.SAVE_SEND_MULTI_TOKENS(map);
        },
        swapTokenPositions(key) {
	        clearTimeout(this.debounce)
	        this.debounce = setTimeout(() => {
		        let map = this.setNewMap();
		        let receive = this.dexStore.receiveMultiToken
		        let send = this.dexStore.sendMultiTokens.get(key)

                map.set(key, receive)

                this.dexStore.SAVE_SEND_MULTI_TOKENS(map)
                this.dexStore.SAVE_RECEIVE_MULTI_TOKEN(send)

		        let firstAmount = this.tokenValues.receive

		        this.changeTokenValue({ key: key, value: firstAmount })
	        }, 200)
        },
        async multiSwapAction() {
		    try {
			    if (this.interfaceStatus === 'NOT_CONNECTED') {
				    if (this.tonConnectUi?.wallet !== null) {
					    this.dexStore.DEX_WALLET(this.tonConnectUi?.wallet?.account);
				    } else {
					    await this.showTonconnect();
				    }
			    } else if (this.interfaceStatus === 'READY_DEX') {
                    SwapRouting.removeRefreshInterval()
					await multiTransaction(this.multiTransactionData)

					this.successModalState.mode = 'multi'
					this.successModalState.show = true
			    }
		    } catch(err) {
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
        clearValues() {
            this.transactionStore.SAVE_SWAP_TRANSACTION_STATUS(null);
            SwapRouting.removeRefreshInterval();
            this.updateWalletInfo();
            this.dexStore.sendMultiTokens.forEach((token, key) => {
                this.tokenValues[key] = '0'
            })
        },
	    updateProcessing(value, mode) {
		    this.processing[mode] = value
	    },
	    changePoolNotFound(value) {
		    this.poolNotFound = value
	    },
	    changeRefreshInfo(value) {
		    this.refreshInfo = value
	    },
        async updateRoute() {
            SwapRouting.refreshAll(this.refreshData)

            if (this.dexStore.dexWallet && !this.balanceUpdateCooldown) {
                await this.updateBalances()
            }
        },
        async updateBalances() {
            if (!this.dexStore.dexWallet || this.balanceUpdateCooldown) {
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
        closeSuccess() {
            this.successModalState.show = false
            this.transactionStore.SAVE_SWAP_TRANSACTION_STATUS(null)
            SwapRouting.removeRefreshInterval()
            this.updateRoute()
            this.clearValues()
        },
	    observingTabVisibilityChange() {
		    this.isVisible = !document.hidden;
		    if (
			    this.isVisible && Number(this.tokenValues.first) > 0
			    || this.isVisible && Number(this.tokenValues.second) > 0
		    ) {
			    SwapRouting.setRefreshInterval(this.assetForCompare, this.successModalState.show, this.isVisible, SwapRouting.multiCompare)
		    } else {
                SwapRouting.removeRefreshInterval()
		    }
	    },
    },
    mounted() {
        if (this.dexStore.tonTokens.length > 0 && (!this.dexStore.sendMultiTokens || this.dexStore.sendMultiTokens?.size === 0)) {
            this.setDefaultAsset()
        }

	    document.addEventListener('visibilitychange', this.observingTabVisibilityChange);
    },
    unmounted() {
	    document.removeEventListener('visibilitychange', this.observingTabVisibilityChange);
	    SwapRouting.removeRefreshDebounce()
        SwapRouting.removeRefreshInterval()
	    this.setDefaultAsset()
    },
    watch: {
        'transactionStore.GET_SWAP_TRANSACTION_STATUS': {
            handler(newStatus) {
                if (newStatus === null) {
                    SwapRouting.removeRefreshInterval()
                }
            },
        },
        'dexStore.tonTokens': {
            handler() {
                if (this.dexStore.tonTokens.length > 0 && (!this.dexStore.sendMultiTokens || this.dexStore.sendMultiTokens?.size === 0)) {
                    this.setDefaultAsset()
                }
            }
        },
        'dexStore.dealConditions': {
            handler() {
                if (this.dexStore.dealConditions !== null) {
                    this.tokenValues.receive = this.formattedAmountNumber(this.dexStore.dealConditions?.total_output_amount)
                    // this.dexStore.dealConditions?.total_output_amount > 0
                    //     ? this.tokenValues.receive = this.dexStore.dealConditions.total_output_amount.toFixed(4)
                    //     : this.tokenValues.receive = '0'
                } else {
                    this.tokenValues.receive = '0'
                }
            }
        },
        'dexStore.sendMultiTokens': {
            handler(newToken, oldToken) {
                if (newToken?.address === oldToken?.address) {
                    return
                }

                SwapRouting.multiTokensWatcher(this.tokensWatcherData)

	            if (this.dexStore.dealConditions !== null) {
		            this.dexStore.DEX_DEAL_CONDITIONS(null);
	            }
            }
        },
        'dexStore.receiveMultiToken': {
            handler(newToken, oldToken) {
                if (newToken?.address === oldToken?.address) {
                    return
                }

                SwapRouting.multiTokensWatcher(this.tokensWatcherData)

	            if (this.dexStore.dealConditions !== null) {
		            this.dexStore.DEX_DEAL_CONDITIONS(null);
	            }
            }
        },
        'dexStore.sendMultiValues': {
            handler() {
                SwapRouting.multiAmountsWatcher(this.amountsWatcherData)

                if (this.dexStore.dealConditions !== null) {
                    this.dexStore.DEX_DEAL_CONDITIONS(null);
                }
            },
            deep: true
        },
	    'dexSettingsStore.GET_SLIPPAGE': {
		    handler() {
                if (this.allAmountsReady) {
                    SwapRouting.changeSettingsWatcher(this.changeSettingsWatcherData)
                }
		    },
	    },
	    'dexSettingsStore.GET_MAX_POOL_VOLATILITY': {
		    handler() {
                if (this.allAmountsReady) {
                    SwapRouting.changeSettingsWatcher(this.changeSettingsWatcherData)
                }
		    },
	    },
	    'dexSettingsStore.GET_MAX_INTERMEDIATE_TOKENS': {
		    handler() {
                if (this.allAmountsReady) {
                    SwapRouting.changeSettingsWatcher(this.changeSettingsWatcherData)
                }
		    },
	    },
	    'dexSettingsStore.GET_EXPERT_MODE_VALUE': {
		    handler() {
                if (this.allAmountsReady) {
                    SwapRouting.expertModeWatcher(this.changeSettingsWatcherData)
                }
		    },
	    },
	    'dexSettingsStore.GET_LIQUIDITY_SOURCES': {
		    handler() {
                if (this.allAmountsReady) {
                    SwapRouting.changeSettingsWatcher(this.changeSettingsWatcherData)
                }
		    }
	    },
	    'dexSettingsStore.GET_MEV_PROTECTION_VALUE': {
		    handler() {
                if (this.allAmountsReady) {
                    SwapRouting.changeSettingsWatcher(this.changeSettingsWatcherData)
                }
		    }
	    },
	    'dexSettingsStore.GET_MEV_MIN_USD': {
		    handler() {
                if (this.allAmountsReady) {
                    SwapRouting.changeSettingsWatcher(this.changeSettingsWatcherData)
                }
		    }
	    }
    }
}
</script>

<style scoped>
.multi-swap {
    display: flex;
    flex-direction: column;
    gap: 14px;
    width: 400px;
    max-width: 400px;
}

@media screen and (max-width: 1220px) {
    .multi-swap {
        width: 440px;
        max-width: 440px;
        margin: 0 auto;
    }
}

@media screen and (max-width: 576px) {
    .multi-swap {
        width: 100%;
        max-width: 100%;
    }
}
</style>
