import { defineStore } from 'pinia';

export interface DexState {
	dealConditions: any | null;
	pinnedTokens: any[];
	tonTokens: any[];
	userTokens: any[];
	dexWallet: any | null;
	sendToken: any | null;
	receiveToken: any | null;
	sendAmount: number;
	receiveAmount: number;
	swapMode: string;
	slippage: number;
	priceImpact: number;
	maxPoolVolatility: number;
	maxIntermediateTokens: number;
	cashback: boolean;
	isExpertMode: boolean;
	dexWalletVersion: any | null;
	maxSplitsValue: number;
	stakingPool: any | null;
	proofVerification: any | null;
	payloadId: any | null;
	tokenLabels: any[],
}

export const useDexStore = defineStore('dex', {
	state: (): DexState => ({
		dealConditions: null,
		pinnedTokens: [],
		tonTokens: [],
		userTokens: [],
		dexWallet: null,
		sendToken: null,
		receiveToken: null,
		sendAmount: 0,
		receiveAmount: 0,
		swapMode: 'default',
		slippage: 5,
		priceImpact: 10,
		maxPoolVolatility: -1,
		maxIntermediateTokens: 1,
		cashback: false,
		isExpertMode: false,
		dexWalletVersion: null,
		maxSplitsValue: 4,
		stakingPool: null,
		proofVerification: null,
		payloadId: null,
		tokenLabels: [],
	}),
	actions: {
		DEX_DEAL_CONDITIONS(item: any) {
			this.dealConditions = item;
		},
		DEX_STAKING_POOL(item: any) {
			this.stakingPool = item;
		},
		DEX_TON_TOKENS(item: any[]) {
			this.tonTokens = item;
		},
		DEX_PROOF_VERIFICATION(item: any) {
			this.proofVerification = item;
		},
		DEX_PAYLOAD_ID(item: any) {
			this.payloadId = item;
		},
		DEX_PINNED_TOKENS(item: any[]) {
			this.pinnedTokens = item;
		},
		DEX_USER_TOKENS(item: any[]) {
			this.userTokens = item;
		},
		DEX_TOKEN_LABELS(item: any[]) {
			this.tokenLabels = item;
		},
		DEX_WALLET(item: any) {
			this.dexWallet = item;
		},
		DEX_SEND_TOKEN(item: any) {
			this.sendToken = item;
		},
		DEX_RECEIVE_TOKEN(item: any) {
			this.receiveToken = item;
		},
		DEX_SEND_AMOUNT(item: number) {
			this.sendAmount = item;
		},
		DEX_RECEIVE_AMOUNT(item: number) {
			this.receiveAmount = item;
		},
		CHANGE_SWAP_MODE(item: string) {
			this.swapMode = item;
		},
		DEX_SLIPPAGE(item: number) {
			this.slippage = item;
		},
		DEX_PRICE_IMPACT(item: number) {
			this.priceImpact = item;
		},
		DEX_MAX_POOL_VOLATILITY(item: number) {
			this.maxPoolVolatility = item;
		},
		DEX_MAX_INTERMEDIATE_TOKENS(item: number) {
			this.maxIntermediateTokens = item;
		},
		DEX_CASHBACK(item: boolean) {
			this.cashback = item;
		},
		CLEAR_DEX_STORE() {
			this.dealConditions = null;
			this.dexWallet = null;
			this.sendToken = null;
			this.receiveToken = null;
			this.sendAmount = 0;
			this.receiveAmount = 0;
			this.swapMode = 'default';
			this.dexWalletVersion = null;
		},
		CLEAR_DEX_EXPERTS_SETTINGS() {
			this.priceImpact = 10;
			this.maxPoolVolatility = -1;
			this.maxIntermediateTokens = 1;
		},
		DEX_EXPERT_MODE(item: boolean) {
			this.isExpertMode = item;
		},
		DEX_WALLET_VERSION(item: any) {
			this.dexWalletVersion = item;
		},
		DEX_MAX_SPLITS(item: number) {
			this.maxSplitsValue = item;
		}
	},
	getters: {
		GET_DEAL_CONDITIONS: (state) => state.dealConditions,
		GET_STAKING_POOL: (state) => state.stakingPool,
		GET_PROOF_VERIFICATION: (state) => state.proofVerification,
		GET_PAYLOAD_ID: (state) => state.payloadId,
		GET_TON_TOKENS: (state) => state.tonTokens,
		GET_PINNED_TOKENS: (state) => state.pinnedTokens,
		GET_USER_TOKENS: (state) => state.userTokens,
		GET_DEX_WALLET: (state) => state.dexWallet,
		GET_SEND_TOKEN: (state) => state.sendToken,
		GET_RECEIVE_TOKEN: (state) => state.receiveToken,
		GET_SEND_AMOUNT: (state) => state.sendAmount,
		GET_RECEIVE_AMOUNT: (state) => state.receiveAmount,
		GET_SWAP_MODE: (state) => state.swapMode,
		GET_SLIPPAGE: (state) => state.slippage,
		GET_PRICE_IMPACT: (state) => state.priceImpact,
		GET_MAX_POOL_VOLATILITY: (state) => state.maxPoolVolatility,
		GET_MAX_INTERMEDIATE_TOKENS: (state) => state.maxIntermediateTokens,
		GET_CASHBACK: (state) => state.cashback,
		GET_EXPERT_MODE_VALUE: (state) => state.isExpertMode,
		GET_DEX_WALLET_VERSION: (state) => state.dexWalletVersion,
		GET_MAX_SPLITS: (state) => state.maxSplitsValue,
		GET_TOKEN_LABELS: (state) => state.tokenLabels
	}
});
