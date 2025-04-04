<template>
	<modal-wrapper
			id="popup"
			@closeModal="closePopup"
			:title="titleText"
			:paddingZero="true"
	>
			<div class="tokens-popup__wrapper">
					<div class="tokens-popup__block" v-if="!isStakingPage && !isLimitPage">
							<TokenSearchInput
											v-if="!isStakingPage"
											v-model="searchValue"
											@setLoading="(value) => loading = value"
											@updateUnlistedToken="(value) => unlistedToken = value"
											:placeholder="$t('dexTokens.searchPlaceholder')"
							/>
					</div>
					<ul class="tokens-popup__pinned-list pinned-list" v-if="!isStakingPage && !isLimitPage">
							<TokenPinnedItem
											v-for="(item, index) in getPinnedList"
											:key="item.id"
											:item="item"
											:mode="mode"
											@token-selected="chooseToken"
							/>
					</ul>
					<div class="tokens-popup__categories" v-if="!isStakingPage">
							<div class="tokens-popup__filters">
									<TokenFilterItem
													:name="$t('dexTokens.filters[0]')"
													value="all"
													:isActive="activeFilter.name === 'all'"
													@filter-selected="setActiveFilter"
									/>
									<TokenFilterItem
													v-for="(filter, index) in GET_TOKEN_LABELS"
													:key="index"
													:name="getLabelName(filter)"
													:value="filter.name"
													:isActive="activeFilter.name === filter.name"
													@filter-selected="setActiveFilter"
									/>
							</div>
							<div class="dividing-dashed"></div>
							<div class="tokens-popup__icon-info">
									<p class="info-text">
											$ {{ $t("dexTokens.info[0]") }}
									</p>
									<div class="info-dividing"></div>
									<LiquidityIcon class="info-icon" />
									<p class="info-text">
											{{ $t("dexTokens.info[1]") }}
									</p>
									<div class="info-dividing"></div>
									<HoldersIcon class="info-icon" />
									<p class="info-text">
											{{ $t("dexTokens.info[2]") }}
									</p>
							</div>
					</div>
					<div class="custom-scroll tokens-popup__scroll-block" id="scroll"
							 :style="{'max-height': `${maxHeight}`}" v-if="!isStakingPage">
							<div v-if="loading" class="loading-blur"></div>
							<div v-if="loading" class="loader-image"></div>
							<div class="empty-search"
									 v-if="emptyResponse && !unlistedToken"
							>
									<p class="empty-search__text">
											{{ $t('dexTokens.emptySearch[0]') }}
											<br>
											{{ $t('dexTokens.emptySearch[1]') }}
									</p>
							</div>
							<div class="empty-search"
									 v-if="searchValue.length > 10 && searchResults.length === 0 && unlistedToken === null">
									<p class="empty-search__text">
											{{ $t('dexTokens.validAddress') }}
									</p>
							</div>
							<TokenUnlisted
											v-if="searchValue.length > 10 && searchResults.length === 0 && unlistedToken !== null"
											:unlistedToken="unlistedToken"
											:userPinnedTokens="userPinnedTokens"
											:userUnpinnedTokens="userUnpinnedTokens"
											:tonPrice="getTonPrice"
											@importToken="importToken"
							/>
							<template v-for="(tokenListDex, index) in tokenLists" :key="index">
									<TokenList
													v-if="tokenListDex.condition"
													:title="tokenListDex.title"
													:token-list="tokenListDex.tokenList"
													:mode="mode"
													:user-pinned-tokens="userPinnedTokens"
													:user-unpinned-tokens="userUnpinnedTokens"
													:ton-price="getTonPrice"
													:active-filter="activeFilter"
													@chooseToken="chooseToken"
													@pinToken="pinToken"
													@unpinToken="unpinToken"
									/>
							</template>
					</div>
					<TokenStakeList
									v-if="isStakingPage"
									:stakeItems="stakeItems"
									:isStakingPage="isStakingPage"
									:userPinnedTokens="userPinnedTokens"
									:userUnpinnedTokens="userUnpinnedTokens"
									:tonPrice="getTonPrice"
									:title="$t('dexTokens.titles[0]')"
									:mode="mode"
									@chooseToken="chooseToken"
					/>
			</div>
	</modal-wrapper>
</template>

<script lang="ts">
import {Address} from '@ton/core';
import methodsMixins from '@/mixins/methodsMixins.ts';
import TokenItem from '@/components/dex/tokens-popup/TokenItem.vue';
import {profileService, tokenService} from '@/api/coffeeApi/services';
import CloseIcon from '@/assets/dex/icons/CloseIcon.vue';
import SearchIcon from '@/assets/dex/icons/SearchIcon.vue';
import LiquidityIcon from '@/assets/dex/icons/LiquidityIcon.vue';
import HoldersIcon from '@/assets/dex/icons/HoldersIcon.vue';
import InformationIcon from '@/assets/dex/icons/InformationIcon.vue';
import TokenList from '@/components/dex/tokens-popup/TokenList.vue';
import TokenSearchInput from '@/components/dex/tokens-popup/TokenSearchInput.vue';
import TokenFilterItem from '@/components/dex/tokens-popup/TokenFilterItem.vue';
import TokenPinnedItem from '@/components/dex/tokens-popup/TokenPinnedItem.vue';
import TokenUnlisted from '@/components/dex/tokens-popup/TokenUnlisted.vue';
import TokenStakeList from '@/components/dex/tokens-popup/TokenStakeList.vue';
import TokenLimitList from "@/components/dex/tokens-popup/TokenLimitList.vue";
import ModalWrapper from "@/components/ui/ModalWrapper.vue";
import {writeReceiveQuery, writeSendQuery} from "@/helpers/swap-interface/swap-query-params.ts";

import {useDexSettingsStore} from "@/stores/dex/settings.ts";
import {useDexStore} from "@/stores/dex/index.ts";
import {useLimitStore} from "@/stores/limit/index.ts";
import {useSettingsStore} from "@/stores/settings";

export default {
name: 'TokensPopup',
components: {
			ModalWrapper,
			TokenLimitList,
	TokenStakeList,
	TokenUnlisted,
	TokenPinnedItem,
	TokenFilterItem,
	TokenSearchInput,
	TokenList,
	InformationIcon,
	HoldersIcon,
	LiquidityIcon,
	SearchIcon,
	CloseIcon,
	TokenItem
},
mixins: [methodsMixins],
	inject: ['updateFirstToken', 'updateSecondToken', 'updateTokenPositions'],
	props: {
	mode: {
		type: String,
		default() {
			return ''
		}
	},
	isStakingPage: {
		type: Boolean,
		default() {
			return false;
		}
	},
	stakeTokens: {
		type: Array,
		default() {
			return [];
		}
	}
},
data() {
	return {
		userPinnedTokens: [],
		userUnpinnedTokens: [],
		unlistedToken: null,
		searchValue: '',
		activeFilter: {
			name: 'all'
		},
		stakeItems: [],
		maxHeight: '100%',
		currentPage: 1,
		pageSize: 50,
		displayedTokensCount: 50,
		loading: false,
		hasMoreTokens: true,
		searchResults: [],
		emptyResponse: false,
		debounceTimeout: null,
		DEBOUNCE_DELAY: 600,
		isLoadingMore: false,
		isPreloading: false,
		hasPreloadedNextPage: false,
		scrollPosition: 0,
		scrollHeight: 0,
	}
},
computed: {
  dexStore() {
    return useDexStore()
  },
  dexStoreSettings() {
    return useDexSettingsStore()
  },
  limitStore() {
    return useLimitStore()
  },
  settingsStore() {
    return useSettingsStore()
  },
  getTokens() {
					if (this.isLimitPage) {
							return {
									first: this.limitStore.GET_LIMIT_FIRST_TOKEN,
									second: this.limitStore.GET_LIMIT_SECOND_TOKEN
							}
					} else {
							return {
									first: this.dexStore.GET_SEND_TOKEN,
									second: this.dexStore.GET_RECEIVE_TOKEN
							}
					}
			},
			isLimitPage() {
					return this.getRouteName === 'Limit' || this.getRouteName === 'Dca'
			},
	currentPageByTab() {
		return this.dexStore.GET_TOKENS_POPUP_STATE.currentPageByTab;
	},
	hasMoreTokensByTab() {
		return this.dexStore.GET_TOKENS_POPUP_STATE.hasMoreTokensByTab;
	},
	activeTab: {
		get() {
			return this.dexStore.GET_TOKENS_POPUP_STATE.activeTab;
		},
		set(value) {
			this.dexStore.SET_TOKENS_POPUP_STATE({
				activeTab: value
			});
		}
	},
	tokenLists() {
		return [
			{
				condition: !this.isLimitPage && this.searchValue.length > 0 && this.searchResults.length > 0,
				title: this.$t('dexTokens.titles[2]'),
				tokenList: this.searchResults
			},
			{
				condition: !this.isLimitPage && this.filteredYourTokens.length > 0 && this.searchValue.length === 0,
				title: this.$t('dexTokens.titles[0]'),
				tokenList: this.filteredYourTokens,
			},
			{
				condition: !this.isLimitPage && this.filteredAllTokens.length > 0 && this.searchValue.length === 0,
				title: this.$t('dexTokens.titles[1]'),
				tokenList: this.filteredAllTokens,
			},
							{
									condition: this.isLimitPage,
									title: `${this.getRouteName} tokens`,
									tokenList: this.sortedLimitTokensList
							},
		];
	},
	getAllTokens() {
		let array = []

		this.dexStore.GET_TON_TOKENS.forEach((item) => {
			let findItem = this.dexStore.GET_USER_TOKENS.find((find) => find.symbol === item.symbol);
			if (findItem?.balance > 0) {
				return;
			}

							if (item?.listed || item?.imported) {
									array.push(item);
							}
		});

		let sortedArray = array
							.sort((a, b) => b.tvl - a.tvl)
			.sort((a, b) => this.checkItemIsPinned(b) - this.checkItemIsPinned(a))
			.sort((a, b) => b.imported - a.imported)

		let pinnedArray = [];

		this.getPinnedList.forEach((item) => {
			let findItem = this.dexStore.GET_USER_TOKENS.find((find) => find.symbol === item.symbol);
			if (findItem?.balance > 0) {
				return;
			}
			pinnedArray.push(item);
		});
		return pinnedArray.concat(sortedArray)
							.filter((item, index, self) =>
				index === self.findIndex((t) => (
					t.address === item.address && t.name === item.name
				))
		)
	},
	getYourTokens() {
		return this.dexStore.GET_USER_TOKENS
			.filter((item) => item.balance > 0 && (item.listed || item.imported))
			.sort((a, b) => b?.balance * b?.price_usd - a?.balance * a?.price_usd)
			.sort((a, b) => b.imported - a.imported)
			.sort((a, b) => this.checkItemIsPinned(b) - this.checkItemIsPinned(a))
	},
	getPinnedList() {
		let array = []
		this.dexStore.GET_PINNED_TOKENS.forEach((item) => {
			if (item?.address === 'native') {
				let findNative = this.dexStore.GET_TON_TOKENS.find((find) => find.type === 'native');
				if (findNative) {
					array.push(findNative);
				}
			} else {
				let findInUnpin = this.userUnpinnedTokens.find((find) => item.address === find.address);
				if (findInUnpin) {
					return;
				}
				let findToken = this.dexStore.dexStore.GET_TON_TOKENS.find((find) => item.address === find.address);
				if (findToken) {
					array.push(findToken);
				}
			}
		});
		return array.concat(this.userPinnedTokens)
	},
	filteredAllTokens() {
		if (this.activeFilter.name === 'all') {
			return this.getAllTokens.slice(0, this.displayedTokensCount);
		} else {
			return this.dexStore.GET_TOKENS_BY_LABEL(this.activeFilter.id).filter((el) => {
				return !this.dexStore.GET_USER_TOKENS.some((f) => el.id === f.id);
			});
		}
	},
	filteredYourTokens() {
		if (this.activeFilter.name === 'all') {
			return this.getYourTokens
		} else {
			return this.dexStore.GET_TOKENS_BY_LABEL(this.activeFilter.id).filter((el) => {
				return this.dexStore.GET_USER_TOKENS.some((f) => el.id === f.id);
			});
		}
	},
	observer() {
		return new IntersectionObserver((entries) => {
			entries.forEach((entry) => {
				if (entry.isIntersecting) {
					this.showMoreTokens(entry);
					this.observer.unobserve(entry.target);
				}
			});
		}, { root: this.$refs.scroll, rootMargin: '0px', threshold: 0.1 });
	},
	getTarget() {
		return this.$refs.loadingMoreTokens;
	},
	getTonPrice() {
		return (this.dexStore.GET_TON_TOKENS.find((item) => item.address === 'native')).price_usd
	},
	titleText() {
		return this.$t("dexInterface.selectToken")
	},
			getLimitTokensList() {
					return this.mode === 'SEND'
							? this.limitStore.GET_LIMIT_SEND_LIST
							: this.limitStore.GET_LIMIT_RECEIVE_LIST
			},
			sortedLimitTokensList() {
					if (this.activeFilter.name === 'all') {
							return this.getLimitTokensList
									.sort((a, b) => b?.balance * b?.price_usd - a?.balance * a?.price_usd)
									.sort((a, b) => this.checkItemIsPinned(b) - this.checkItemIsPinned(a))
					} else {
							return this.getLimitTokensList.filter((token) =>
									token.labels?.some((label) => label.label_id === this.activeFilter.id)
							);
					}
			}
},
methods: {
	handleScroll(event) {
		if (this.activeTab !== 'all' || this.searchValue.length > 0) return;

		const container = event.target;
		const scrollTop = container.scrollTop;
		const clientHeight = container.clientHeight;
		const scrollHeight = container.scrollHeight;
		const tokenHeight = scrollHeight / this.displayedTokensCount;
		const bottomVisiblePosition = scrollTop + clientHeight;
		const lastVisibleToken = Math.ceil(bottomVisiblePosition / tokenHeight);

		const currentPageIndex = Math.floor((lastVisibleToken - 1) / this.pageSize);
		const currentPage = currentPageIndex + 1;

		const tokensVisibleInCurrentPage = lastVisibleToken - (currentPageIndex * this.pageSize);

		if (tokensVisibleInCurrentPage >= 25 &&
			tokensVisibleInCurrentPage <= 30 &&
			!this.isPreloading &&
			this.hasMoreTokens &&
			currentPage === this.currentPage) {
			this.preloadNextPage();
		}

		const totalScrollPercentage = (scrollTop / (scrollHeight - clientHeight)) * 100;
		if (totalScrollPercentage >= 99.9 && !this.isLoadingMore) {
			this.showMoreTokens();
		}
	},
	async preloadNextPage() {
		if (this.isPreloading || !this.hasMoreTokens) return;

		this.isPreloading = true;
		try {
			const nextPage = this.currentPage + 1;

			if (this.dexStore.GET_TON_TOKENS.length >= nextPage * this.pageSize) {
				this.isPreloading = false;
				return;
			}

			const opts = {
				page: nextPage,
				size: this.pageSize
			};

			const res = await tokenService.getTokenListV2(opts);

			if (res.items.length < this.pageSize) {
				this.hasMoreTokens = false;
				this.hasMoreTokensByTab[this.activeTab] = false;
			}

			if (res.items.length > 0) {
				const newTokens = res.items.map(item => ({
					type: item.address === "0:0000000000000000000000000000000000000000000000000000000000000000" ? "native" : "jetton",
					address: item.address === "0:0000000000000000000000000000000000000000000000000000000000000000" ? "native" : item.address,
					imported: false,
          listed: true,
					...item
				}));

				const updatedTokens = [...this.dexStore.GET_TON_TOKENS, ...newTokens];
				this.dexStore.DEX_TON_TOKENS(updatedTokens);
			}
		} catch (err) {
			console.error(err);
		} finally {
			this.isPreloading = false;
		}
	},
	async showMoreTokens() {
		if (this.isLoadingMore) return;

		this.isLoadingMore = true;
		try {
			if (this.dexStore.GET_TON_TOKENS.length > this.displayedTokensCount) {
				if (!this.hasMoreTokens) {
					this.displayedTokensCount = this.dexStore.GET_TON_TOKENS.length;
				} else {
					this.displayedTokensCount += this.pageSize;
					this.currentPage++;
					if (this.dexStore.GET_TON_TOKENS.length <= this.currentPage * this.pageSize &&
						this.hasMoreTokens &&
						!this.isPreloading) {
						await this.preloadNextPage();
					}
				}
			}
		} finally {
			this.isLoadingMore = false;
		}
	},
	resetPaginationState() {
		if (this.activeTab === 'all') {
			this.displayedTokensCount = this.pageSize;
			this.currentPage = 1;
		} else {
			this.currentPage = this.currentPageByTab[this.activeTab] || 1;
			this.displayedTokensCount = this.currentPage * this.pageSize;
		}

		this.hasMoreTokens = this.hasMoreTokensByTab[this.activeTab] !== undefined
			? this.hasMoreTokensByTab[this.activeTab]
			: true;
		if (this.dexStore.GET_TON_TOKENS.length <= this.currentPage * this.pageSize &&
			this.hasMoreTokens &&
			!this.isPreloading) {
			this.$nextTick(() => {
				this.preloadNextPage();
			});
		}

		this.isLoadingMore = false;
		this.isPreloading = false;
	},
	async setActiveFilter(selectedFilter) {
		if (this.loading) return;

		this.loading = true;
		this.savePopupState();

		this.activeTab = selectedFilter.name;
		this.activeFilter = selectedFilter;
		this.searchValue = '';
		this.isLoadingMore = false;
		this.hasPreloadedNextPage = false;
		this.scrollPosition = 0;

		this.resetPaginationState();

		if (selectedFilter.name !== 'all') {
			await this.loadLabelTokens();
		} else {
			this.displayedTokensCount = this.pageSize;
			this.currentPage = 1;
			if (this.dexStore.GET_TON_TOKENS.length <= this.pageSize && this.hasMoreTokens) {
				await this.preloadNextPage();
			}
		}

		await this.$nextTick(() => {
			const scrollContainer = document.getElementById('scroll');
			if (scrollContainer) {
				scrollContainer.scrollTop = 0;
			}
		});

		this.loading = false;
	},
	async loadLabelTokens() {
		let tokens = this.dexStore.GET_TOKENS_BY_LABEL(this.activeFilter.id) || [];
		if (tokens.length === 0) {
			try {
				const response = await tokenService.getTokensByLabel(this.activeFilter.id);
				tokens = response.items.map(item => {
					const found3 = this.dexStore.GET_USER_TOKENS.find(token => token.id === item.id);
					return found3
						? {...found3, labels: item.labels}
						: item
				});
				this.dexStore.DEX_TOKENS_BY_LABEL({ labelId: this.activeFilter.id, tokens });
			} catch (error) {
				console.error(error);
			}
		}
	},
	filterLabels() {
		const filteredLabels = this.dexStore.GET_TOKEN_LABELS.filter((label) => {
			return this.dexStore.GET_TON_TOKENS.some((token) =>
				token.labels?.some((tokenLabel) => tokenLabel.label_id === label.id)
			);
		});
		const sortedLabels = filteredLabels.sort((a, b) => a.id - b.id);
		this.dexStore.DEX_TOKEN_LABELS(sortedLabels);
	},
	localSearch() {
		const tokenList = this.activeFilter.name === 'yourTokens'
			? this.filteredYourTokens
			: this.dexStore.GET_TOKENS_BY_LABEL(this.activeFilter.id);

		this.searchResults = tokenList.filter(token =>
			token.name.toLowerCase().includes(this.searchValue.toLowerCase()) ||
			token.symbol.toLowerCase().includes(this.searchValue.toLowerCase())
							&& (token?.listed || token?.imported)
		);
		this.emptyResponse = this.searchResults.length === 0;
	},
	debouncedSearch() {
		this.loading = true;
		clearTimeout(this.debounceTimeout);

		this.debounceTimeout = setTimeout(() => {
			this.fetchTokens();
		}, this.DEBOUNCE_DELAY);
	},
	async fetchTokens() {
		if (this.searchValue.trim().length === 0) {
			this.searchResults = [];
			this.emptyResponse = false;
			this.loading = false;
			return;
		}

		try {
			const params = {
				search: this.searchValue,
				page: 1,
				size: 100
			};

			const response = await tokenService.getTokenListV2(params);
			let apiResults = response.items || [];

			const uniqueTokensMap = new Map();

			const userTokens = this.dexStore.GET_USER_TOKENS.filter(token =>
				(token.name.toLowerCase().includes(this.searchValue.toLowerCase()) ||
					token.symbol.toLowerCase().includes(this.searchValue.toLowerCase())) &&
				token.balance > 0 &&
									(token?.listed || token?.imported)
			);

			userTokens.forEach(token => {
				uniqueTokensMap.set(token.address, token);
			});

			const otherUserTokens = this.dexStore.GET_USER_TOKENS.filter(token =>
				(token.name.toLowerCase().includes(this.searchValue.toLowerCase()) ||
					token.symbol.toLowerCase().includes(this.searchValue.toLowerCase())) &&
				(!token.balance || token.balance === 0)
									&& (token?.listed || token?.imported)
			);

			otherUserTokens.forEach(token => {
				if (!uniqueTokensMap.has(token.address)) {
					uniqueTokensMap.set(token.address, token);
				}
			});

			apiResults.forEach(token => {
				if (!uniqueTokensMap.has(token.address)) {
					const processedToken = {
						...token,
						type: token.address === "0:0000000000000000000000000000000000000000000000000000000000000000" ? "native" : "jetton",
						address: token.address === "0:0000000000000000000000000000000000000000000000000000000000000000" ? "native" : token.address,
						imported: false,
						balance: 0
					};
					uniqueTokensMap.set(token.address, processedToken);
				}
			});

			this.searchResults = Array.from(uniqueTokensMap.values());

			this.searchResults.sort((a, b) => {
				if ((a.balance > 0) && (!b.balance || b.balance === 0)) return -1;
				if ((!a.balance || a.balance === 0) && (b.balance > 0)) return 1;

				if (a.balance > 0 && b.balance > 0) {
					const aBalanceUsd = a.balance * (a.price_usd || 0);
					const bBalanceUsd = b.balance * (b.price_usd || 0);
					if (aBalanceUsd !== bBalanceUsd) return bBalanceUsd - aBalanceUsd;
				}
				return (b.tvl || 0) - (a.tvl || 0);
			});

			this.emptyResponse = this.searchResults.length === 0 && !this.unlistedToken;
		} catch (err) {
			console.error(err);
			this.emptyResponse = true;
			this.searchResults = [];
		} finally {
			this.loading = false;
		}
	},
			chooseToken(item) {
					if (this.mode === 'SEND') {
							if (this.isStakingPage) {
									this.updateFirstToken(item)
									this.closePopup()
							} else {
									if (this.getTokens.second?.address === item?.address) {
											writeSendQuery(this.$route, this.getTokens.second)
											writeReceiveQuery(this.$route, this.getTokens.first)
											this.updateTokenPositions()
											this.closePopup()
									} else if (this.getTokens.first?.address !== item?.address) {
											writeSendQuery(this.$route, item)
											this.updateFirstToken(item)
											this.closePopup()
									}
							}
					} else if (this.mode === 'RECEIVE') {
							if (this.getTokens.first?.address === item?.address) {
									writeSendQuery(this.$route, this.getTokens.second)
									writeReceiveQuery(this.$route, this.getTokens.first)
									this.updateTokenPositions()
									this.closePopup()
							} else if (this.getTokens.second?.address !== item?.address) {
									writeReceiveQuery(this.$route, item)
									this.updateSecondToken(item);
									this.closePopup();
							}
					}

					if (this.isLpToken(item)) {
							const walletAddress = this.dexStore.GET_DEX_WALLET?.address || 'No wallet';
							tracking.trackEvent(Events.STAKE_TOKEN_TOGGLE, {
									token: item.symbol,
									walletAddress,
							});
					}
			},
	importToken() {
		this.unlistedToken.imported = true
					this.unlistedToken.id = null
		let allTokens = this.dexStore.GET_TON_TOKENS
		let storage = JSON.parse(localStorage.getItem('importTokens')) || []
					let existingToken = allTokens.find(token => token.address === this.unlistedToken.address)

					if (existingToken) {
							existingToken.imported = true
					} else {
							allTokens.unshift(this.unlistedToken)
					}

					storage.push(this.unlistedToken)

		localStorage.setItem('importTokens', JSON.stringify(storage))

		this.dexStore.DEX_TON_TOKENS(allTokens)
		const walletAddress = this.dexStore.GET_DEX_WALLET?.address;
		tracking.trackEvent(Events.TOKEN_IMPORT, {
			tokenInfo: this.unlistedToken,
			walletAddress,
		});
		setTimeout(() => {
			this.searchValue = ''
			this.chooseToken(this.unlistedToken)
		}, 200)
	},
	pinToken(item) {
		let pinTokens = this.dexStore.GET_PINNED_TOKENS.slice()
		let findNative = this.dexStore.GET_PINNED_TOKENS.findIndex((item) => item?.address === 'native')
		pinTokens.splice(findNative, 1)

		let findInStock = pinTokens.findIndex((findToken) => findToken?.address === item?.address);
		let findIndex = this.userPinnedTokens.findIndex(
			(findItem) => item?.address === findItem?.address,
		);
		if (findIndex === -1 && findInStock === -1) {
			if (this.userPinnedTokens.length < 3) {
				this.userPinnedTokens.push(item);

				let addressList = [];
				this.userPinnedTokens.forEach((item) => {
					addressList.push(item?.address);
				});
				this.saveToStorage(addressList, 'userPin');
			}
		} else {
			let findUnpinIndex = this.userUnpinnedTokens.findIndex(
				(find) => item?.address === find?.address,
			);
			if (findUnpinIndex !== -1) {
				this.userUnpinnedTokens.splice(findUnpinIndex, 1);
			}

			let addressList = [];
			this.userUnpinnedTokens.forEach((item) => {
				addressList.push(item?.address);
			});
			this.saveToStorage(addressList, 'userUnpin');
		}
	},
	unpinToken(item) {
		let findIndex = this.userPinnedTokens.findIndex(
			(findItem) => item?.address === findItem?.address,
		);
		if (findIndex !== -1) {
			if (this.userPinnedTokens.length <= 3) {
				this.userPinnedTokens.splice(findIndex, 1);

				let addressList = [];
				this.userPinnedTokens.forEach((item) => {
					addressList.push(item?.address);
				});
				this.saveToStorage(addressList, 'userPin');
			}
		} else {
			let findInList = this.userUnpinnedTokens.find((find) => item?.address === find?.address);
			if (!findInList) {
				this.userUnpinnedTokens.push(item);
			}

			let addressList = [];
			this.userUnpinnedTokens.forEach((item) => {
				addressList.push(item?.address);
			});
			this.saveToStorage(addressList, 'userUnpin');
		}
	},
	checkItemIsPinned(item) {
		let pinTokens = [];
		this.dexStore.GET_PINNED_TOKENS.forEach((findItem) => {
			let findInUnpin = this.userUnpinnedTokens.find(
				(find) => find?.address === findItem?.address,
			);
			if (findInUnpin) {
				return;
			}
			pinTokens.push(findItem);
		});

		let findNative = this.dexStore.GET_PINNED_TOKENS.findIndex((item) => item?.address === 'native');
		pinTokens.splice(findNative, 1);

		let findItem = this.userPinnedTokens.find((find) => find?.address === item?.address)
		let findInStock = pinTokens.find((findToken) => findToken?.address === item?.address)
		if (findInStock || findItem || item.type === 'native') {
			return true
		} else {
			return false
		}
	},
	// toSafeAddress(rawAddress) {
	// 	try {
	// 		if (rawAddress === 'native') {
	// 			return 'TON'
	// 		}
	// 		const address = Address.parseRaw(rawAddress);
	// 		return address.toString({ bounceable: true, urlSafe: true });
	// 	} catch (error) {
	// 		console.log(error);
	// 		return null;
	// 	}
	// },
	async saveToStorage(value, key) {
		try {
			let settings = this.settingsStore.GET_USER_SETTINGS
			let local = JSON.parse(localStorage.getItem(key))
			if (!settings) {
				if (local) {
					settings = JSON.parse(localStorage.getItem(key))
				} else {
					settings = {}
				}
			}
			settings[key] = value
			localStorage.removeItem(key)
			localStorage.setItem(key, JSON.stringify(value))
			if (this.dexStore.GET_PROOF_VERIFICATION) {
				await profileService.writeStorage(this.dexStore.GET_DEX_WALLET?.address, this.dexStore.GET_PROOF_VERIFICATION, settings)
			}
		} catch (err) {
			console.error(err)
		}
	},
	processStakeTokens() {
		return this.stakeTokens.map((tokenData) => {
			const token = tokenData.token;
			const metadata = token.metadata;
			const balance = tokenData.balance
			const normalizer = tokenData.normalizer;

			return {
				address: token.address.address,
				blockchain: token.address.blockchain,
				name: metadata.name,
				symbol: metadata.symbol,
				decimals: metadata.decimals,
				listed: metadata.listed,
				image: metadata.image_url,
				normalizer: normalizer,
				balance: (balance.asset_amount_raw / Math.pow(10, 9)),
				price_usd: balance.asset_amount_usd
			};
		});
	},
	checkMaxHeight() {
		if (window.innerWidth <= 768 && !this.isStakingPage) {
			let popup = document.getElementById('popup')
			let block = document.getElementById('scroll')
			let height = 400
			if (popup) {
				height = popup.offsetHeight - block.getBoundingClientRect().top
			}
			this.maxHeight = `${height}px`
		}
	},
	isLpToken(item) {
		const index = this.stakeItems.indexOf(item);
		return index !== 0;
	},
	getLabelName(label) {
		if (label.name === 'new') {
			return this.$t('interfaceTag.new')
		} else if (label.name === 'cashback') {
			return this.$t('interfaceTag.cashback')
		} else if (label.name === 'contest') {
			return this.$t('interfaceTag.contest')
		}
	},
	savePopupState() {
		const state = {
			currentPageByTab: {
				...this.currentPageByTab,
				[this.activeTab]: this.currentPage
			},
			hasMoreTokensByTab: {
				...this.hasMoreTokensByTab,
				[this.activeTab]: this.hasMoreTokens
			}
		};
		this.dexStore.SET_TOKENS_POPUP_STATE(state);
	},
	closePopup() {
		this.savePopupState();
		this.$emit('closePopup');
		this.searchValue = '';

		if (this.observer) {
			this.observer.disconnect();
		}
	},
	inputFocused() {
		if (window.innerWidth <= 640) {
			setTimeout(() => {
				document.documentElement.style.overflow = 'hidden'
			}, 1000)
		}
	},
	// updateTokensList(selectedToken) {
	// 	this.GET_TON_TOKENS = this.GET_TON_TOKENS.filter(token => token.address !== selectedToken.address);
	// 	this.GET_TON_TOKENS.unshift(selectedToken);
	// 	this.DEX_TON_TOKENS(this.GET_TON_TOKENS);
	// },
	// addedSendQuery(value) {
	// 	let queryParams = {
	// 		ft: this.toSafeAddress(value.address)
	// 	}
	// 	if (this.GET_RECEIVE_TOKEN !== null) {
	// 		queryParams.st = this.toSafeAddress(this.GET_RECEIVE_TOKEN?.address);
	// 	}
	// 	if (this.GET_SWAP_MODE === 'default') {
	// 		if (this.GET_SEND_AMOUNT > 0) {
	// 			queryParams.fa = this.GET_SEND_AMOUNT
	// 		}
	// 	} else if (this.GET_SWAP_MODE === 'reverse') {
	// 		if (this.GET_RECEIVE_AMOUNT > 0) {
	// 			queryParams.sa = this.GET_RECEIVE_AMOUNT
	// 		}
	// 	}
	// 	if (!this.isStakingPage) {
	// 		this.$router.push({name: 'Dex', query: queryParams})
	// 	}
	// },
	// addedReceiveQuery(value) {
	// 	let queryParams = {
	// 		ft: this.toSafeAddress(this.GET_SEND_TOKEN?.address)
	// 	}
	// 	if (value !== null) {
	// 		queryParams.st = this.toSafeAddress(value.address);
	// 	}
	// 	if (this.GET_SWAP_MODE === 'default') {
	// 		if (this.GET_SEND_AMOUNT > 0) {
	// 			queryParams.fa = this.GET_SEND_AMOUNT
	// 		}
	// 	} else if (this.GET_SWAP_MODE === 'reverse') {
	// 		if (this.GET_RECEIVE_AMOUNT > 0) {
	// 			queryParams.sa = this.GET_RECEIVE_AMOUNT
	// 		}
	// 	}
	// 	if (!this.isStakingPage) {
	// 		this.$router.push({name: 'Dex', query: queryParams})
	// 	}
	// },
},
mounted() {
	const scrollContainer = document.getElementById('scroll');
	if (scrollContainer) {
		scrollContainer.addEventListener('scroll', this.handleScroll);
	}

	const { activeTab } = this.dexStore.GET_TOKENS_POPUP_STATE;
	this.activeFilter = { name: activeTab };

	if (activeTab !== 'all') {
		const filter = this.dexStore.GET_TOKEN_LABELS.find(f => f.name === activeTab);
		if (filter) this.setActiveFilter(filter);
	}

	this.resetPaginationState();
	this.filterLabels();
	if (window.innerWidth > 768) {
		this.maxHeight = '400px';
	}
	this.checkMaxHeight();
	if (!this.isStakingPage) {
		window.addEventListener('resize', this.checkMaxHeight);
	}

	setTimeout(() => {
		if (this.getTarget && this.getRouteName === 'Dex') {
			this.observer.observe(this.getTarget);
		}
	}, 500);

	if (this.stakeTokens.length > 0) {
		this.stakeItems = this.processStakeTokens();

		const cesTokenIndex = this.stakeItems.findIndex(item => item.symbol === 'CES');

		if (cesTokenIndex > -1) {
			const cesToken = this.stakeItems.splice(cesTokenIndex, 1)[0];
			this.stakeItems.unshift(cesToken);
		}
	}

	let userPinned = [];
	let userUnpinned = [];

	if (this.settingsStore.GET_USER_SETTINGS !== null) {
		userPinned = this.settingsStore.GET_USER_SETTINGS?.userPin;
		userUnpinned = this.settingsStore.GET_USER_SETTINGS?.userUnpin;
	} else {
		userPinned = JSON.parse(localStorage.getItem('userPin'));
		userUnpinned = JSON.parse(localStorage.getItem('userUnpin'));
	}

	if (userPinned) {
		userPinned.forEach((item) => {
			let findPinned = this.dexStore.GET_TON_TOKENS.find((find) => item === find.address);
			if (findPinned) {
				this.userPinnedTokens.push(findPinned);
			}
		});
	}
	if (userUnpinned) {
		userUnpinned.forEach((item) => {
			let findUnpinned = this.dexStore.GET_TON_TOKENS.find((find) => item === find.address);
			if (findUnpinned) {
				this.userUnpinnedTokens.push(findUnpinned);
			}
		});
	}
},
unmounted() {
	if (!this.isStakingPage) {
		window.addEventListener('resize', this.checkMaxHeight);
	}
},
beforeDestroy() {
	const scrollContainer = document.getElementById('scroll');
	if (scrollContainer) {
		scrollContainer.removeEventListener('scroll', this.handleScroll);
	}

	if (this.observer) {
		this.observer.disconnect();
	}
},
beforeUnmount() {
	if (this.debounceTimeout) {
		clearTimeout(this.debounceTimeout);
	}
},
watch: {
	searchValue(newValue) {
		if (newValue.trim().length === 0) {
			this.searchResults = [];
			this.emptyResponse = false;
			this.loading = false;
			if (this.activeFilter.name === 'all') {
				this.displayedTokensCount = this.pageSize;
				this.currentPage = 1;
			}
			return;
		}
		if (this.activeFilter.name === 'all') {
			this.debouncedSearch();
		} else {
			this.localSearch();
		}
	}
},
}
</script>

<style scoped>
.popup-background {
	position: fixed;
	z-index: 999;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	display: flex;
	align-items: center;
	justify-content: center;
	background: rgba(10, 7, 6, 0.8);
}

.tokens-popup {
	margin: 0 auto;
	z-index: 999;
	background: transparent;
}

.tokens-popup__menu {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 20px;
	padding: 0 18px;
}

.tokens-popup__close-btn {
	width: 24px;
	height: 24px;
	background: transparent;
	border: none;
	outline: none;
}

.tokens-popup__mode-name {
	font-family: Harmony-Medium, sans-serif;
	font-size: 24px;
	line-height: 28px;
}

.tokens-popup__block {
	padding: 0 18px;
}

.staking-close-btn {
	height: 36px;
	width: 36px;
	display: flex;
	padding: 6px;
	align-items: center;
	gap: 10px;
	border-radius: 12px;
	background: var(--iface-white4);
	transition: 0.3s ease-in;
}

.staking-close-btn:hover {
	background: var(--iface-white6);
}

.h-auto {
	height: auto;
	padding-bottom: 14px;
}

.hidden {
	display: none;
}

.no-margin {
	margin-bottom: 0;
}

.empty-search {
	padding-top: 30px;
}

.empty-search__text {
	text-align: center;
	font-size: 14px;
	line-height: 16px;
}

.tokens-popup__pinned-list {
	margin-bottom: 16px;
	padding: 0 18px;
	display: flex;
	flex-wrap: wrap;
	gap: 8px;
}

.tokens-popup__filters {
	display: flex;
	align-items: center;
	gap: 18px;
	border-bottom: 1px dashed var(--iface-white10);
	margin-bottom: 12px;
	padding: 0 16px;
}

.tokens-popup__icon-info {
	display: flex;
	align-items: center;
	gap: 0 4px;
	margin-bottom: 10px;
	padding: 0 16px;
}

.info-text {
	font-size: 13px;
	line-height: 16px;
	opacity: 0.4;
}

.tokens-popup__icon-info svg {
	opacity: 0.5;
}

.info-dividing {
	height: 10px;
	width: 1px;
	background: var(--main-text-color);
	opacity: 0.15;
	margin: 0 2px;
}

.dividing-line {
	width: 100%;
	height: 1px;
	background: var(--iface-white6);
}

.tokens-popup__scroll-block {
	max-height: 400px;
	height: 400px;
	overflow-y: auto;
}

.loading-blur {
position: absolute;
top: 256px;
left: 0;
right: 0;
bottom: 0;
z-index: 1;
background: rgba(28, 28, 28, 0.32);
backdrop-filter: blur(4px);
pointer-events: none;
border-radius: 0 0 20px 20px;
}

.loader-image {
position: absolute;
top: 57%;
left: 37%;
width: 100px;
height: 100px;
transform: translate(-50%, -50%);
background: url(/src/assets/dex/loader.png) no-repeat;
background-size: cover;
animation: 1s forwards linear infinite Loader;
z-index: 2;
}

.custom-scroll::-webkit-scrollbar-track {
	margin: 5px 0 15px 0;
}

.theme-light svg path {
	fill: #141414;
}

@media screen and (max-width: 960px) {
	.popup-background {
			z-index: 999;
	}

	.tokens-popup {
			width: 100%;
			position: fixed;
			z-index: 999;
			top: 0;
			bottom: 0;
			left: 0;
			right: 0;
			border-radius: 0;
			padding: 20px 0 0 0;
			display: flex;
			flex-direction: column;
	}

	.h-auto {
			position: absolute;
			bottom: 1%;
			left: 50%;
			transform: translateX(-50%);
			top: auto;
			width: 94%;
			animation: slide-up 0.3s ease-in-out forwards;
			border-radius: 16px;
	}

	.tokens-popup__scroll-block {
			max-height: none;
			height: auto;
			overflow-y: auto;
	}

	.custom-scroll::-webkit-scrollbar-track {
			margin: 0;
	}
}

@media screen and (max-height: 680px) {
	.tokens-popup {
			max-height: calc(100dvh);
	}

	.h-auto {
			max-height: 310px !important;
	}
}

@media screen and (max-width: 879px) {
	.h-auto {
			position: absolute;
			bottom: -100%;
			left: 50%;
			transform: translateX(-50%);
			top: auto;
			width: 94%;
			animation: slide-up 0.3s ease-in-out forwards;
			border-radius: 16px;
	}

	@keyframes slide-up {
			from {
					bottom: -100%;
			}
			to {
					bottom: 2%;
			}
	}
}
</style>
