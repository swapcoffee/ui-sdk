import { defineStore } from 'pinia';
import { DexState, TokensByLabelPayload } from "@/utils/types";

export const useDexStore = defineStore('dex', {
	state: (): DexState => ({
		dealConditions: null,
		pinnedTokens: [],
		tonTokens: [],
		userTokens: [],
		tokenLabels: [],
		dexWallet: null,
		dexWalletVersion: null,
		sendToken: null,
		receiveToken: null,
		sendAmount: 0,
		receiveAmount: 0,
		swapMode: 'default',
		stakingPool: null,
		tokenPagination: {
			currentPage: 0,
			totalPages: 0,
		},
		tokensByLabel: {},
		proofVerification: null,
		payloadId: null,
		areTokensLoaded: false,
		tokensPopupState: {
			currentPageByTab: {
				all: 1,
				new: 1,
				cashback: 1,
				contest: 1,
			},
			hasMoreTokensByTab: {
				all: true,
				new: true,
				cashback: true,
				contest: true,
			},
			activeTab: 'all',
		},
		calculatedPriceImpact: null,
	}),

	actions: {
		DEX_TOKENS_BY_LABEL(payload: TokensByLabelPayload) {
			this.tokensByLabel[payload.labelId] = payload.tokens;
		},
		DEX_TOKENS_OPTIONS(options: { current_page: number; total_pages: number }) {
			this.tokenPagination.currentPage = options.current_page;
			this.tokenPagination.totalPages = options.total_pages;
		},
		DEX_DEAL_CONDITIONS(item: any) {
			this.dealConditions = item;
		},
		DEX_TON_TOKENS(item: any[]) {
			this.tonTokens = item;
			this.areTokensLoaded = true;
		},
		DEX_TOKEN_LABELS(item: any[]) {
			this.tokenLabels = item;
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
		CLEAR_DEX_STORE() {
			this.dealConditions = null;
			this.dexWallet = null;
			this.dexWalletVersion = null;
			this.sendToken = null;
			this.receiveToken = null;
			this.sendAmount = 0;
			this.receiveAmount = 0;
			this.swapMode = 'default';
			this.stakingPool = null;
			this.areTokensLoaded = false;
		},
		DEX_WALLET_VERSION(item: any) {
			this.dexWalletVersion = item;
		},
		DEX_STAKING_POOL(item: any) {
			this.stakingPool = item;
		},
		DEX_CALCULATED_PI(item: any) {
			this.calculatedPriceImpact = item;
		},
		SET_TOKENS_POPUP_STATE(item: any) {
			this.tokensPopupState = {
				...item,
				...this.tokensPopupState,
			}
		}
	},
	getters: {
		GET_TOKENS_POPUP_STATE: (state) => state.tokensPopupState,
		GET_TOKENS_BY_LABEL: (state) => (labelId: string) => state.tokensByLabel[labelId] || [],
		GET_DEAL_CONDITIONS: (state) => state.dealConditions,
		GET_PROOF_VERIFICATION: (state) => state.proofVerification,
		GET_PAYLOAD_ID: (state) => state.payloadId,
		GET_TON_TOKENS: (state) => state.tonTokens,
		GET_TOKEN_LABELS: (state) => state.tokenLabels,
		GET_PINNED_TOKENS: (state) => state.pinnedTokens,
		GET_USER_TOKENS: (state) => state.userTokens,
		GET_DEX_WALLET: (state) => state.dexWallet,
		GET_SEND_TOKEN: (state) => state.sendToken,
		GET_RECEIVE_TOKEN: (state) => state.receiveToken,
		GET_SEND_AMOUNT: (state) => state.sendAmount,
		GET_RECEIVE_AMOUNT: (state) => state.receiveAmount,
		GET_SWAP_MODE: (state) => state.swapMode,
		GET_DEX_WALLET_VERSION: (state) => state.dexWalletVersion,
		GET_STAKING_POOL: (state) => state.stakingPool,
		GET_TOKENS_LOADED: (state) => state.areTokensLoaded,
		GET_CALCULATED_PI: (state) => state.calculatedPriceImpact,
	},
});
