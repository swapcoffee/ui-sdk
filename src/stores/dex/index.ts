import { defineStore } from 'pinia';
import type {DexState, TokensByLabelPayload} from "@/utils/types";
import { SwapActiveTab } from "@/utils/types";

export const useDexStore = defineStore('dex', {
	state: (): DexState => ({
		dealConditions: null,
		pinnedTokens: [],
		tonTokens: [],
		communityTokens: [],
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
		usersTokensBalances: [],
		swapActiveTab: SwapActiveTab.Dex,
		isModalOpen: false,
		assetKeys: [
			'first','second','third','fourth','fifth','sixth','seventh','eighth','ninth','tenth',
			'eleventh','twelfth','thirteenth','fourteenth','fifteenth','sixteenth','seventeenth','eighteenth','nineteenth','twentieth'
		],
		sendMultiTokens: null,
		receiveMultiToken: null,
		sendMultiValues: null,
		receiveMultiValue: null,
		liquidStakingPools: [],
		enableCommunityTokens: false,
		lastTokenPage: 1,
		lastCommunityPage: 1,
		labelPage: 1,
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
			this.sendMultiTokens = null;
			this.receiveMultiToken = null;
			this.sendMultiValues = null;
			this.receiveMultiValue = null;
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
		},
		SET_SWAP_ACTIVE_TAB(item: SwapActiveTab) {
			this.swapActiveTab = item;
		},
		SET_USER_TOKENS_BALANCES(item: any[]) {
			this.usersTokensBalances = item;
		},
		DEX_OPEN_MODAL(item: boolean) {
			this.isModalOpen = item;
		},
		SAVE_SEND_MULTI_TOKENS(item: any) {
			this.sendMultiTokens = item;
		},
		SAVE_RECEIVE_MULTI_TOKEN(item: any) {
			this.receiveMultiToken = item;
		},
		SAVE_SEND_MULTI_VALUES(item: any) {
			this.sendMultiValues = item;
		},
		SAVE_RECEIVE_MULTI_VALUE(item: any) {
			this.receiveMultiValue = item;
		},
		CLEAR_MULTI_STORE() {
			this.sendMultiTokens = null;
			this.receiveMultiToken = null;
			this.sendMultiValues = null;
			this.receiveMultiValue = null;
		},
		DEX_LIQUID_STAKING_POOLS(item: any[]) {
			this.liquidStakingPools = item;
		},
		DEX_COMMUNITY_TOKENS(item: any[]) {
			this.communityTokens = item;
		},
		DEX_LAST_TOKEN_PAGE(page: number) {
			this.lastTokenPage = page;
		},
		DEX_LAST_COMMUNITY_PAGE(page: number) {
			this.lastCommunityPage = page;
		},
		DEX_LABEL_PAGE(page: number) {
			this.labelPage = page;
		},
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
		GET_SWAP_ACTIVE_TAB: (state) => state.swapActiveTab,
		GET_USER_TOKENS_BALANCES: (state) => state.usersTokensBalances,
		GET_OPEN_MODAL: (state) => state.isModalOpen,
		GET_SEND_ASSET_KEYS: (state) => state.assetKeys,
		GET_SEND_MULTI_TOKENS: (state) => state.sendMultiTokens,
		GET_RECEIVE_MULTI_TOKEN: (state) => state.receiveMultiToken,
		GET_SEND_MULTI_VALUES: (state) => state.sendMultiValues,
		GET_RECEIVE_MULTI_VALUE: (state) => state.receiveMultiValue,
		GET_LIQUID_STAKING_POOLS: (state) => state.liquidStakingPools,
		GET_COMMUNITY_TOKENS: (state) => state.communityTokens,
		GET_LAST_TOKEN_PAGE: (state) => state.lastTokenPage,
		GET_LAST_COMMUNITY_PAGE: (state) => state.lastCommunityPage,
		GET_LABEL_PAGE: (state) => state.labelPage,
	},
});
