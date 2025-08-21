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
            :routeInfo="GET_DEAL_CONDITIONS"
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
    </div>
</template>

<script lang="ts">
import SwapHeader from "@/components/swap-interface/SwapHeader.vue";
import MevSettingPopup from "@/components/dex/mev/MevSettingPopup.vue";
import SwapInterface from "@/components/swap-interface/SwapInterface.vue";
import TokensPopup from "@/components/dex/tokens-popup/TokensPopup.vue";
import DexSettings from "@/components/modals/DexSettingsModal.vue";
import * as SwapRouting from "@/helpers/swap-routing";
import {Address} from "@ton/core";
import {
    dexTransaction,
    multiTransaction
} from "@/helpers/swap-interface/send-transaction.js";
import resetLimitTokens from "@/mixins/resetLimitTokens.js";
import numberFormatting from "@/mixins/numberFormatting.ts";
import SwapSettingsModal from "@/components/modals/SwapSettingsModal.vue";
import {useDexStore} from "@/stores/dex";
import {useDexSettingsStore} from "@/stores/dex/settings.ts";

export default {
    name: "MultiSwapPage",
    components: {SwapSettingsModal, DexSettings, TokensPopup, SwapInterface, MevSettingPopup, SwapHeader},
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
		}
	},
	inject: ['updateWalletInfo', 'openTransactionModal'],
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
        isListedPair() {
            const tokens = Array.from(this.GET_SEND_MULTI_TOKENS?.values() || []);
            return !this.exceptionCondition && tokens.every(token => token?.listed);
        },
        exceptionCondition() {
            const mevDisabled = [
                'EQCAj5oiRRrXokYsg_B-e0KG9xMwh5upr5I8HQzErm0_BLUM',
                "EQA2XBW7MAbSjq5n7tW2_SRlr0XqwJZU0L6u6mLFMKdC5S4Z",
                "EQBE_gBrU3mPI9hHjlJoR_kYyrhQgyCFD6EUWfa42W8T7EBP"
            ]
            
            let found = false
            if (this.GET_SEND_MULTI_TOKENS) {
                found = Array.from(this.GET_SEND_MULTI_TOKENS.entries()).find(([key, value]) => {
                    if (value.address !== 'native') {
                        const friendly =  Address.parse(value?.address).toString()
                        return mevDisabled.includes(friendly)
                    }
                });
            }
            
            return found
        },
        interfaceStatus() {
            let priceImpact = 0
            if (this.GET_CALCULATED_PI) {
                priceImpact = this.GET_CALCULATED_PI
            }

            if (this.poolNotFound || this.GET_DEAL_CONDITIONS?.output_usd === 0) {
                return 'POOL_NOT_FOUND'
            } else if (this.loadingConditions || this.processing.multi === true || this.firstLoading) {
                return 'LOADING'
            } else if (this.GET_DEX_WALLET === null) {
                return 'NOT_CONNECTED'
            } else if ((priceImpact < -this.GET_PRICE_IMPACT) && this.GET_DEAL_CONDITIONS !== null) {
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
            return this.GET_SEND_MULTI_TOKENS !== null && this.GET_RECEIVE_MULTI_TOKEN !== null && this.allAmountsReady && this.GET_DEAL_CONDITIONS === null;
        },
        firstLoading() {
            let route = this.$route
            if (route.query?.ft && route.query?.st) {
                return this.GET_DEAL_CONDITIONS === null && this.GET_TON_TOKENS.length === 0
            }
        },
        allAmountsReady() {
            const keysToCheck = Object.keys(this.tokenValues).filter(key => key !== 'receive');
            return keysToCheck.every(key => Number(this.tokenValues[key]) > 0);
        },
        getTonGas() {
	        const {
		        total_mev_protection_fee = 0,
	        } = this.GET_DEAL_CONDITIONS || {};

            let recommended_gas = this.GET_DEAL_CONDITIONS.routes.reduce((sum, route) => sum + (route.recommended_gas ?? 0), 0);

	        return recommended_gas + total_mev_protection_fee + 0.00001;
        },
        allBalancesReady() {
			let result = true

	        this.GET_SEND_MULTI_TOKENS.forEach((token, key) => {
				if (token?.balance < Number(this.tokenValues[key])) {
					result = false
                } else if (token?.address === 'native' && token?.balance < Number(this.tokenValues[key]) + this.getTonGas) {
					result = false
                }
            })

            return result
        },
        notEnoughConditions() {
            const userTonBalance = this.GET_USER_TOKENS.find(
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
                wallet: this.GET_DEX_WALLET,
                inputAssets: this.getInputAssets,
                outputAsset: this.getOutputAsset,
                maxIntermediate: this.GET_MAX_INTERMEDIATE_TOKENS,
                maxVolatility: this.GET_MAX_POOL_VOLATILITY,
                maxSplits: this.GET_DEX_WALLET_VERSION >= 5 ? 20 : 4,
                changePoolNotFound: this.changePoolNotFound,
                changeRefreshInfo: this.changeRefreshInfo,
                liquiditySources: this.GET_LIQUIDITY_SOURCES,
                mevProtection: false,
                amounts: this.tokenValues,
                swapMode: 'default',
            }

            let total_usd = 0
            this.GET_SEND_MULTI_TOKENS.forEach((token, key) => {
                total_usd += Number(this.tokenValues[key]) * token.price_usd
            })

            if (this.GET_MEV_PROTECTION_VALUE && this.isListedPair && (total_usd >= Number(this.GET_MEV_MIN_USD))) {
                asset = {
                    ...asset,
                    mevProtection: true
                }
            }

            return asset
        },
        getInputAssets() {
			let array = []

			this.GET_SEND_MULTI_TOKENS.forEach((token, key) => {
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
                address: this.GET_RECEIVE_MULTI_TOKEN.address !== 'native'
                    ? Address.parse(this.GET_RECEIVE_MULTI_TOKEN.address).toString()
                    : this.GET_RECEIVE_MULTI_TOKEN.address
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
				tokens: this.GET_SEND_MULTI_TOKENS,
                amounts: this.GET_SEND_MULTI_VALUES,
                dealConditions: this.GET_DEAL_CONDITIONS,
                refreshData: this.refreshData
            }
        },
        amountsWatcherData() {
			return {
				...this.tokensWatcherData,
                route: this.$route,
                router: this.$router
            }
        },
	    changeSettingsWatcherData() {
		    return {
			    ...this.tokensWatcherData,
			    liquiditySources: this.GET_LIQUIDITY_SOURCES
		    }
	    },
	    trackingData() {
		    return {
			    ...this.tokensWatcherData,
			    wallet: this.GET_DEX_WALLET,
			    liquiditySources: this.GET_LIQUIDITY_SOURCES
		    }
	    },
	    multiTransactionData() {
		    let data = {
			    updateProcessing: this.updateProcessing,
			    compareAsset: this.assetForCompare,
			    wallet: this.GET_DEX_WALLET,
			    dealConditions: this.GET_DEAL_CONDITIONS,
			    slippage: this.GET_SLIPPAGE,
			    tonConnectUi: this.tonConnectUi,
			    trackingData: this.trackingData,
			    mevProtection: false
		    }

			let total_usd = 0

			this.GET_SEND_MULTI_TOKENS?.forEach((token, key) => {
				total_usd += token?.price_usd * this.tokenValues[key]
            })

		    if (this.GET_MEV_PROTECTION_VALUE && this.isListedPair && (total_usd >= Number(this.GET_MEV_MIN_USD))) {
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
			this.CLEAR_MULTI_STORE()

            let map = new Map()

            let findTon = this.GET_TON_TOKENS.find((item) => item.address === 'native')
            let findUsdt = this.GET_TON_TOKENS.find((item) => item.address === this.usdtAddress)

            map.set('first', findTon)
            this.SAVE_SEND_MULTI_TOKENS(map)
            this.SAVE_RECEIVE_MULTI_TOKEN(findUsdt)
        },
        addNewAsset() {
            let map = this.setNewMap();

            let availableIndex = 0;
            while (availableIndex < this.GET_SEND_ASSET_KEYS.length && map.has(this.GET_SEND_ASSET_KEYS[availableIndex])) {
                availableIndex++;
            }

            if (availableIndex >= this.GET_SEND_ASSET_KEYS.length) {
                console.error('Достигнуто максимальное количество ассетов');
                return;
            }

            let newKey = this.GET_SEND_ASSET_KEYS[availableIndex];
            let findToken = this.getAvailableToken(newKey)

            this.tokenValues[newKey] = '0';
            map.set(newKey, findToken);

	        const {receive, ...otherValues} = this.tokenValues
			this.SAVE_SEND_MULTI_VALUES(otherValues)
            this.SAVE_SEND_MULTI_TOKENS(map);
        },
        getAvailableToken(key) {
            let selectedTokens = [
				...Array.from(this.GET_SEND_MULTI_TOKENS.values()),
                this.GET_RECEIVE_MULTI_TOKEN
            ]

            const allUserTokensSelected = this.GET_USER_TOKENS.length > 0 &&
                this.GET_USER_TOKENS.every(userToken =>
                    selectedTokens.some(selected => selected.address === userToken.address)
                );

            let array;
            if (this.GET_DEX_WALLET && this.GET_USER_TOKENS.length > 0 && !allUserTokensSelected) {
                array = this.GET_USER_TOKENS
            } else {
                array = this.GET_TON_TOKENS
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
            this.GET_SEND_MULTI_TOKENS.forEach((token, key) => map.set(key, token))
            return map
        },
        changeTokenValue(data) {
			this.tokenValues[data.key] = data.value

	        const {receive, ...otherValues} = this.tokenValues

	        data.key !== 'receive'
                ? this.SAVE_SEND_MULTI_VALUES(otherValues)
                : this.SAVE_RECEIVE_MULTI_VALUE(receive)
        },
        changeToken(key, value) {
            if (key === 'receive') {
                this.SAVE_RECEIVE_MULTI_TOKEN(value)
                return
            }

            if (this.GET_SEND_ASSET_KEYS.includes(key)) {
                let map = this.setNewMap()
                map.set(key, value)
                this.SAVE_SEND_MULTI_TOKENS(map)
            }
        },
        removeTokenAsset(key) {
            let map = this.setNewMap();
            map.delete(key);
            delete this.tokenValues[key]; // Очищаем значение
            this.SAVE_SEND_MULTI_TOKENS(map);
        },
        swapTokenPositions(key) {
	        clearTimeout(this.debounce)
	        this.debounce = setTimeout(() => {
		        let map = this.setNewMap();
		        let receive = this.GET_RECEIVE_MULTI_TOKEN
		        let send = this.GET_SEND_MULTI_TOKENS.get(key)

                map.set(key, receive)

                this.SAVE_SEND_MULTI_TOKENS(map)
                this.SAVE_RECEIVE_MULTI_TOKEN(send)

		        let firstAmount = this.tokenValues.receive

		        this.changeTokenValue({ key: key, value: firstAmount })
	        }, 200)
        },
        async multiSwapAction() {
		    try {
			    if (this.interfaceStatus === 'NOT_CONNECTED') {
				    if (this.tonConnectUi?.wallet !== null) {
					    this.DEX_WALLET(this.tonConnectUi?.wallet?.account);
				    } else {
					    await this.showTonconnect();
				    }
			    } else if (this.interfaceStatus === 'READY_DEX') {
                    SwapRouting.removeRefreshInterval()
					await multiTransaction(this.multiTransactionData)

				    this.openTransactionModal('pending', this.GET_DEAL_CONDITIONS, 'multi', this.clearValues)
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
            this.SAVE_TRANSACTION_STATUS(null);
            this.updateWalletInfo();
            this.GET_SEND_MULTI_TOKENS.forEach((token, key) => {
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

            if (this.GET_DEX_WALLET && !this.balanceUpdateCooldown) {
                await this.updateBalances()
            }
        },
        async updateBalances() {
            if (!this.GET_DEX_WALLET || this.balanceUpdateCooldown) {
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
	    observingTabVisibilityChange() {
		    this.isVisible = !document.hidden;
		    if (
			    this.isVisible && Number(this.tokenValues.first) > 0
			    || this.isVisible && Number(this.tokenValues.second) > 0
		    ) {
			    SwapRouting.setRefreshInterval(this.assetForCompare, this.successModalState.show, this.isVisible)
		    } else {
                SwapRouting.removeRefreshInterval()
		    }
	    },
    },
    mounted() {
        if (this.GET_TON_TOKENS.length > 0 && (!this.GET_SEND_MULTI_TOKENS || this.GET_SEND_MULTI_TOKENS?.size === 0)) {
            this.setDefaultAsset()
        }

	    document.addEventListener('visibilitychange', this.observingTabVisibilityChange);
    },
    unmounted() {
	    document.removeEventListener('visibilitychange', this.observingTabVisibilityChange);
	    SwapRouting.removeRefreshDebounce()
        SwapRouting.removeRefreshInterval()
	    this.setDefaultAsset()
        this.setSwapTokens()
    },
    watch: {
        GET_TON_TOKENS: {
            handler() {
                if (this.GET_TON_TOKENS.length > 0 && (!this.GET_SEND_MULTI_TOKENS || this.GET_SEND_MULTI_TOKENS?.size === 0)) {
                    this.setDefaultAsset()
                }
            }
        },
        GET_DEAL_CONDITIONS: {
            handler() {
                if (this.GET_DEAL_CONDITIONS !== null) {
                    this.tokenValues.receive = this.formattedAmountNumber(this.GET_DEAL_CONDITIONS?.total_output_amount)
                    // this.GET_DEAL_CONDITIONS?.total_output_amount > 0
                    //     ? this.tokenValues.receive = this.GET_DEAL_CONDITIONS.total_output_amount.toFixed(4)
                    //     : this.tokenValues.receive = '0'
                } else {
                    this.tokenValues.receive = '0'
                }
            }
        },
        GET_SEND_MULTI_TOKENS: {
            handler(newToken, oldToken) {
                if (newToken?.address === oldToken?.address) {
                    return
                }

                SwapRouting.multiTokensWatcher(this.tokensWatcherData)

	            if (this.GET_DEAL_CONDITIONS !== null) {
		            this.DEX_DEAL_CONDITIONS(null);
	            }
            }
        },
        GET_RECEIVE_MULTI_TOKEN: {
            handler(newToken, oldToken) {
                if (newToken?.address === oldToken?.address) {
                    return
                }

                SwapRouting.multiTokensWatcher(this.tokensWatcherData)

	            if (this.GET_DEAL_CONDITIONS !== null) {
		            this.DEX_DEAL_CONDITIONS(null);
	            }
            }
        },
        GET_SEND_MULTI_VALUES: {
            handler() {
                SwapRouting.multiAmountsWatcher(this.amountsWatcherData)

                if (this.GET_DEAL_CONDITIONS !== null) {
                    this.DEX_DEAL_CONDITIONS(null);
                }
            },
            deep: true
        },
	    GET_SLIPPAGE: {
		    handler() {
                if (this.allAmountsReady) {
                    SwapRouting.changeSettingsWatcher(this.changeSettingsWatcherData)
                }
		    },
	    },
	    GET_MAX_POOL_VOLATILITY: {
		    handler() {
                if (this.allAmountsReady) {
                    SwapRouting.changeSettingsWatcher(this.changeSettingsWatcherData)
                }
		    },
	    },
	    GET_MAX_INTERMEDIATE_TOKENS: {
		    handler() {
                if (this.allAmountsReady) {
                    SwapRouting.changeSettingsWatcher(this.changeSettingsWatcherData)
                }
		    },
	    },
	    GET_EXPERT_MODE_VALUE: {
		    handler() {
                if (this.allAmountsReady) {
                    SwapRouting.expertModeWatcher(this.changeSettingsWatcherData)
                }
		    },
	    },
	    GET_LIQUIDITY_SOURCES: {
		    handler() {
                if (this.allAmountsReady) {
                    SwapRouting.changeSettingsWatcher(this.changeSettingsWatcherData)
                }
		    }
	    },
	    GET_MEV_PROTECTION_VALUE: {
		    handler() {
                if (this.allAmountsReady) {
                    SwapRouting.changeSettingsWatcher(this.changeSettingsWatcherData)
                }
		    }
	    },
	    GET_MEV_MIN_USD: {
		    handler() {
                if (this.allAmountsReady) {
                    SwapRouting.changeSettingsWatcher(this.changeSettingsWatcherData)
                }
		    }
	    },
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
