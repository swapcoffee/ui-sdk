<template>
  <modal-wrapper
      id="popup"
      @closeModal="closePopup"
      :title="titleText"
      :paddingZero="true"
  >
    <div class="tokens-popup__wrapper">
      <div class="tokens-popup__block" v-if="!isStakingPage">
        <TokenSearchInput
            ref="tokenSearch"
            v-if="!isStakingPage"
            v-model="searchValue"
            @inputChanged="handleSearchInput"
            @setLoading="(value) => loading = value"
            @updateUnlistedToken="(value) => unlistedToken = value as any"
            :placeholder="$t('dexTokens.searchPlaceholder')"
        />
      </div>
      <ul class="tokens-popup__pinned-list pinned-list" v-if="!isStakingPage && !isLimitPage && !isBoostLiquidityPage">
        <TokenPinnedItem
            v-for="(item, index) in getPinnedList"
            :key="item.address"
            :item="item"
            :mode="mode"
            @token-selected="chooseToken"
        />
      </ul>
      <div class="tokens-popup__categories" v-if="!isStakingPage && !isLimitPage">
        <div class="tokens-popup__filters">
          <TokenFilterItem
              :name="$t('dexTokens.filters[0]')"
              value="all"
              :isActive="activeFilter.name === 'all'"
              @filter-selected="setActiveFilter"
          />
          <TokenFilterItem
              v-if="GET_COMMUNITY_TOKENS_SETTING && !limitedJettonLists?.length"
              :name="$t('interfaceTag.community')"
              value="community"
              :isActive="activeFilter.name === 'community'"
              @filter-selected="setActiveFilter"
          />
          <TokenFilterItem
              v-if="!limitedJettonLists?.length"
              v-for="filter in getSortedTokenLabels"
              :key="filter.id"
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
      <TokenVirtualList
          id="scroll"
          v-if="!isStakingPage"
          :virtualizedItems="virtualizedItems"
          :unlistedToken="unlistedToken"
          :userPinnedTokens="userPinnedTokens"
          :userUnpinnedTokens="userUnpinnedTokens"
          :tonPrice="getTonPrice"
          :activeFilter="activeFilter"
          :mode="mode"
          @scroll="onScrollLoadMore"
          @token-selected="chooseToken"
      />
      <TokenStakeList
          v-if="isStakingPage"
          :stakeItems="stakeItems"
          :isStakingPage="isStakingPage"
          :userPinnedTokens="userPinnedTokens"
          :userUnpinnedTokens="userUnpinnedTokens"
          :tonPrice="getTonPrice"
          :title="$t('dexTokens.titles[0]')"
          :mode="mode"
      />
      <div v-if="loading && (isSearching || isLoadingCommunity)" class="loading-blur" :style="{ top: loadingPositions.blur }"></div>
      <div v-if="loading && (isSearching || isLoadingCommunity)" class="loader-image"></div>
    </div>
  </modal-wrapper>
</template>

<script lang="ts">
import { Address } from "@ton/core"
import { TON_COIN_ADDRESS } from "@/utils/consts.ts";
import methodsMixins from "@/mixins/methodsMixins.ts"
import TokenItem from "@/components/dex/tokens-popup/TokenItem.vue"
import computedMixins from "@/mixins/computedMixins.ts"
import { profileService, tokenService } from "@/api/coffeeApi/services"
import CloseIcon from "@/assets/dex/icons/CloseIcon.vue"
import SearchIcon from "@/assets/dex/icons/SearchIcon.vue"
import LiquidityIcon from "@/assets/dex/icons/LiquidityIcon.vue"
import HoldersIcon from "@/assets/dex/icons/HoldersIcon.vue"
import InformationIcon from "@/assets/dex/icons/InformationIcon.vue"
import TokenSearchInput from "@/components/dex/tokens-popup/TokenSearchInput.vue"
import TokenFilterItem from "@/components/dex/tokens-popup/TokenFilterItem.vue"
import TokenPinnedItem from "@/components/dex/tokens-popup/TokenPinnedItem.vue"
import TokenUnlisted from "@/components/dex/tokens-popup/TokenUnlisted.vue"
import TokenStakeList from "@/components/dex/tokens-popup/TokenStakeList.vue"
import ModalWrapper from "@/components/ui/ModalWrapper.vue"
// @ts-ignore
import TokenVirtualList from '@/components/dex/tokens-popup/TokenVirtualList.vue';
import { writeTokenListEntries } from "@/utils/tokenUtils.ts";
import {useLimitStore} from "@/stores/limit";
import {useDexStore} from "@/stores/dex";
import {useSettingsStore} from "@/stores/settings";

export default {
  name: "TokensPopup",
  components: {
    TokenVirtualList,
    ModalWrapper,
    TokenStakeList,
    TokenUnlisted,
    TokenPinnedItem,
    TokenFilterItem,
    TokenSearchInput,
    InformationIcon,
    HoldersIcon,
    LiquidityIcon,
    SearchIcon,
    CloseIcon,
    TokenItem
  },
  mixins: [methodsMixins, computedMixins],
  provide() {
    return {
      chooseTokenHandler: this.chooseToken,
      pinTokenHandler: this.pinToken,
      unpinTokenHandler: this.unpinToken,
      tokenRemovedHandler: this.tokenRemoved,
      importTokenHandler: this.importToken,
    }
  },
  inject: ["updateToken", "updateTokenPositions", "enableCommunityTokens", "limitedJettonLists"],
  props: {
    mode: {
      type: String,
      default() {
        return ""
      },
    },
    isStakingPage: {
      type: Boolean,
      default() {
        return false
      },
    },
    stakeTokens: {
      type: Array,
      default() {
        return []
      },
    },
  },
  data() {
    return {
      userPinnedTokens: [],
      userUnpinnedTokens: [],
      unlistedToken: null,
      searchValue: "",
      activeFilter: { name: "all" },
      stakeItems: [],
      maxHeight: "100%",
      loading: false,
      isSearching: false,
      searchResults: [],
      emptyResponse: false,
      debounceTimeout: null,
      DEBOUNCE_DELAY: 600,
      displayCount: 100,
      basePageSize: 100,
      observer: null,
      currentPage: 1,
      searchPage: 1,
      hasMoreSearch: true,
      hasMoreTokens: true,
      isLoadingMore: false,
      isPreloading: false,
      preloadThreshold: 0.5,
      lastScrollPosition: 0
    }
  },
  computed: {
    limitStore() {
      return useLimitStore()
    },
    dexStore() {
      return useDexStore()
    },
    settingsStore() {
      return useSettingsStore()
    },
    GET_USER_TOKENS() {
      return this.dexStore.GET_USER_TOKENS
    },
    GET_PINNED_TOKENS() {
      return this.dexStore.GET_PINNED_TOKENS
    },
    GET_TON_TOKENS() {
      return this.dexStore.GET_TON_TOKENS
    },
    GET_DEX_WALLET() {
      return this.dexStore.GET_DEX_WALLET
    },
    GET_RECEIVE_TOKEN() {
      return this.dexStore.GET_RECEIVE_TOKEN
    },
    GET_SEND_TOKEN() {
      return this.dexStore.GET_SEND_TOKEN
    },
    GET_USER_SETTINGS() {
      return this.settingsStore.GET_USER_SETTINGS
    },
    GET_PROOF_VERIFICATION() {
      return this.dexStore.GET_PROOF_VERIFICATION
    },
    GET_TOKEN_LABELS() {
      return this.dexStore.GET_TOKEN_LABELS
    },
    GET_TOKENS_BY_LABEL() {
      return this.dexStore.GET_TOKENS_BY_LABEL
    },
    GET_LIMIT_SEND_LIST() {
      return this.limitStore.GET_LIMIT_SEND_LIST
    },
    GET_LIMIT_RECEIVE_LIST() {
      return this.limitStore.GET_LIMIT_RECEIVE_LIST
    },
    GET_LIMIT_FIRST_TOKEN() {
      return this.limitStore.GET_LIMIT_FIRST_TOKEN
    },
    GET_SEND_MULTI_TOKENS() {
      return this.dexStore.GET_SEND_MULTI_TOKENS
    },
    GET_RECEIVE_MULTI_TOKEN() {
      return this.dexStore.GET_RECEIVE_MULTI_TOKEN
    },
    GET_LIMIT_SECOND_TOKEN() {
      return this.limitStore.GET_LIMIT_SECOND_TOKEN
    },
    GET_COMMUNITY_TOKENS_SETTING() {
      return this.enableCommunityTokens
    },
    GET_LAST_TOKEN_PAGE() {
      return this.dexStore.GET_LAST_TOKEN_PAGE
    },
    GET_COMMUNITY_TOKENS() {
      return this.dexStore.GET_COMMUNITY_TOKENS
    },
    GET_LAST_COMMUNITY_PAGE() {
      return this.dexStore.GET_LAST_COMMUNITY_PAGE
    },
    GET_LABEL_PAGE() {
      return this.dexStore.GET_LABEL_PAGE
    },
    isLabelFilter() {
      return this.activeFilter.id &&
          this.activeFilter.name !== "all" &&
          this.activeFilter.name !== "community"
    },
    isCommunityFilter() {
      return this.activeFilter.name === "community"
    },
    isAllFilter() {
      return this.activeFilter.name === "all"
    },
    virtualizedItems() {
      return [
        ...this.emptyStateItems,
        ...this.unlistedTokenItem,
        ...this.tokenItems
      ]
    },
    getCommunityTokensValue() {
      return this.GET_COMMUNITY_TOKENS_SETTING || this.enableCommunityTokens
    },
    emptyStateItems() {
      const states = [
        {
          condition: this.emptyResponse && !this.unlistedToken,
          id: 'empty-search',
          content: {
            mainText: this.$t("dexTokens.emptySearch[0]"),
            subText: this.$t("dexTokens.emptySearch[1]")
          }
        },
        {
          condition: this.searchValue.length > 10 && this.searchResults.length === 0 && !this.unlistedToken,
          id: 'valid-address',
          content: {
            mainText: this.$t("dexTokens.validAddress"),
            subText: null
          }
        },
        {
          condition: !this.searchValue.length && this.isFilterEmpty && this.activeFilter.name !== 'all' && !this.loading,
          id: 'no-tokens-tag',
          content: {
            mainText: this.$t("dexTokens.noTokensWithTag"),
            subText: null
          }
        }
      ]

      return states
          .filter(state => state.condition)
          .map(state => ({
            uniqueId: state.id,
            type: 'empty',
            content: state.content
          }))
    },
    unlistedTokenItem() {
      if (this.searchValue.length > 10 && !this.searchResults.length && this.unlistedToken) {
        return [{
          uniqueId: 'unlisted-token',
          type: 'unlisted'
        }]
      }
      return []
    },
    tokenItems() {
      const items = []
      let globalIndex = 0

      this.tokenLists.forEach((tokenList, listIndex) => {
        if (!tokenList.condition || !this.showTitle) return

        items.push({
          uniqueId: `title-${listIndex}`,
          type: 'title',
          title: tokenList.title
        })

        tokenList.tokenList.forEach((token, tokenIndex) => {
          items.push({
            uniqueId: `${listIndex}-${token.address}-${tokenIndex}`,
            type: 'token',
            data: token,
            index: globalIndex++
          })
        })
      })

      return items
    },
    getSortedTokenLabels() {
      const labelOrder = ['star', 'hot', 'new', 'cashback', 'contest']

      return this.GET_TOKEN_LABELS.sort((a, b) =>
          labelOrder.indexOf(a.name) - labelOrder.indexOf(b.name)
      )
    },
    isLoadingCommunity() {
      return this.activeFilter.name === 'community' && this.loading && !this.isSearching
    },
    isFilterEmpty() {
      if (this.searchValue.length > 0 || this.loading) {
        return false
      }

      if (this.activeFilter.name === "all") {
        return false
      }

      const hasYourTokens = this.filteredYourTokens.length > 0
      const hasAllTokens = this.filteredAllTokens.length > 0

      return !hasYourTokens && !hasAllTokens
    },
    initialDisplayCount() {
      const totalTokensLength = this.GET_TON_TOKENS.length
      const remainder = totalTokensLength % this.basePageSize

      if (remainder > 0) {
        return this.basePageSize + remainder
      }

      return this.basePageSize
    },
    searchValueLower() {
      return this.searchValue.trim().toLowerCase()
    },
    loadingPositions() {
      return this.isLimitPage
          ? { blur: "45px" }
          : { blur: "136px" }
    },
    showTitle() {
      return this.searchResults.length > 0 || this.searchValue.length === 0
    },
    getTokens() {
      if (this.isLimitPage) {
        return {
          first: this.GET_LIMIT_FIRST_TOKEN,
          second: this.GET_LIMIT_SECOND_TOKEN,
        }
      } else {
        return {
          first: this.GET_SEND_TOKEN,
          second: this.GET_RECEIVE_TOKEN,
        }
      }
    },
    isLimitPage() {
      return this.getRouteName === "Limit" || this.getRouteName === "Dca"
    },
    isBoostLiquidityPage() {
      return this.getRouteName === "BoostLiquidity"
    },
    tokenLists() {
      return [
        {
          condition:
              !this.isLimitPage &&
              this.searchValue.length > 0 &&
              this.searchResults.length > 0,
          title: this.$t("dexTokens.titles[2]"),
          tokenList: this.searchResults,
        },
        {
          condition:
              !this.isLimitPage &&
              this.filteredYourTokens.length > 0 &&
              this.searchValue.length === 0,
          title: this.$t("dexTokens.titles[0]"),
          tokenList: this.filteredYourTokens,
        },
        {
          condition:
              !this.isLimitPage &&
              this.filteredAllTokens.length > 0 &&
              this.searchValue.length === 0,
          title: this.$t("dexTokens.titles[1]"),
          tokenList: this.filteredAllTokens,
        },
        {
          condition: this.isLimitPage && this.searchValue.length === 0,
          title: `${this.getRouteName} tokens`,
          tokenList: this.sortedLimitTokensList,
        },
        {
          condition: this.isLimitPage && this.searchValue.length > 0,
          title: `${this.getRouteName} tokens`,
          tokenList: this.searchResults,
        },
      ]
    },
    getYourTokens() {
      const addCommunity = this.getCommunityTokensValue
      const tokens = this.GET_USER_TOKENS.filter((item) => {
        const isVerified = item.verification === 'WHITELISTED' || (item.verification === 'COMMUNITY' && addCommunity) || item.imported;
        return item.balance > 0 && isVerified;
      })
          .sort((a: any, b: any) => (b?.balance * b?.price_usd || 0) - (a?.balance * a?.price_usd || 0))
          .sort((a: any, b: any) => (b.imported ? 1 : 0) - (a.imported ? 1 : 0))
          .sort((a: any, b: any) => (this.checkItemIsPinned(b) ? 1 : 0) - (this.checkItemIsPinned(a) ? 1 : 0));

      return this.filterLPTokens(tokens);
    },
    getPinnedList() {
      const pinnedTokens = this.GET_PINNED_TOKENS.flatMap(item => {
        if (item?.address === "native") {
          const nativeToken = this.GET_TON_TOKENS.find(token => token.type === "native")
          return nativeToken ? [nativeToken] : []
        }

        if (this.userUnpinnedTokens.some(unpinned => unpinned.address === item.address)) {
          return []
        }

        const foundToken = this.GET_TON_TOKENS.find(token => token.address === item.address)
        return foundToken ? [foundToken] : []
      })

      return [...pinnedTokens, ...this.userPinnedTokens]
    },
    availableAllTokens() {
      const addCommunity = this.getCommunityTokensValue
      const tokens = this.GET_TON_TOKENS.filter((token) => {
        const isVerified = token.verification === 'WHITELISTED' || (token.verification === 'COMMUNITY' && addCommunity) || token.imported
        return isVerified && !this.GET_USER_TOKENS.some((userToken) => userToken.address === token.address && userToken.balance > 0)
      })

      return this.filterLPTokens(tokens)
    },
    filteredAllTokens() {
      const userTokenAddresses = this.GET_USER_TOKENS.map(token => token.address)

      if (this.activeFilter.name === "community") {
        const communityTokens = this.GET_COMMUNITY_TOKENS.filter(token => !userTokenAddresses.includes(token.address))
        return this.filterLPTokens(communityTokens).slice(0, this.displayCount)
      }

      if (this.activeFilter.name === "all") {
        const pinnedAddresses = [
          ...this.GET_PINNED_TOKENS.map(token => token.address),
          ...this.userPinnedTokens.map(token => token.address)
        ];

        return this.availableAllTokens.sort((a, b) => {
          const aIsPinned = pinnedAddresses.includes(a.address)
          const bIsPinned = pinnedAddresses.includes(b.address)

          if (aIsPinned !== bIsPinned) {
            return (bIsPinned ? 1 : 0) - (aIsPinned ? 1 : 0)
          }

          if (aIsPinned && bIsPinned) {
            const aIndex = pinnedAddresses.indexOf(a.address)
            const bIndex = pinnedAddresses.indexOf(b.address)
            return aIndex - bIndex
          }

          return (b?.balance * b?.price_usd || 0) - (a?.balance * a?.price_usd || 0)
        }).slice(0, this.displayCount)
      }

      const tokens = this.GET_TOKENS_BY_LABEL(this.activeFilter.id)
          .filter(token => !userTokenAddresses.includes(token.address))
      return this.filterLPTokens(tokens)
    },
    filteredYourTokens() {
      if (this.activeFilter.name === "all") {
        return this.getYourTokens
      } else if (this.activeFilter.name === "community") {
        return this.getYourTokens.filter(token => token.verification === 'COMMUNITY')
      } else {
        const tokens = this.GET_TOKENS_BY_LABEL(this.activeFilter.id).filter((el) => {
          return this.GET_USER_TOKENS.some((f) => el.address === f.address)
        })
        return this.filterLPTokens(tokens)
      }
    },
    getTonPrice() {
      return this.GET_TON_TOKENS.find((item) => item.address === "native").price_usd
    },
    titleText() {
      return this.$t("dexInterface.selectToken")
    },
    getLimitTokensList() {
      return this.mode === "first" ? this.GET_LIMIT_SEND_LIST : this.GET_LIMIT_RECEIVE_LIST
    },
    sortedLimitTokensList() {
      if (this.activeFilter.name === "all") {
        return this.getLimitTokensList
            .sort((a: any, b: any) => (b?.balance * b?.price_usd || 0) - (a?.balance * a?.price_usd || 0))
            .sort((a: any, b: any) => (this.checkItemIsPinned(b) ? 1 : 0) - (this.checkItemIsPinned(a) ? 1 : 0))
      } else {
        return this.getLimitTokensList.filter((token: any) =>
            token.labels?.some((label: any) => label.label_id === this.activeFilter.id),
        )
      }
    },
  },
  methods: {
    onScrollLoadMore(event) {
      if (this.isLoadingMore) return

      const { scrollTop, scrollHeight, clientHeight } = event.target
      const scrollPercent = scrollTop / (scrollHeight - clientHeight)

      const isScrollingDown = scrollTop > this.lastScrollPosition
      this.lastScrollPosition = scrollTop

      if (isScrollingDown && scrollPercent >= this.preloadThreshold && !this.isPreloading) {
        this.preloadNextPage()
      }

      if (isScrollingDown) {
        this.showMoreTokens()
      }
    },
    async preloadNextPage() {
      if (this.isPreloading || this.isLimitPage) return

      // If limitedJettonLists is set, don't preload - the list should end with the limited list
      if (this.limitedJettonLists?.length > 0) {
        return
      }

      const canPreload = this.searchValue.length > 0
          ? this.hasMoreSearch
          : (this.isAllFilter || this.isCommunityFilter || this.activeFilter.id) && this.hasMoreTokens

      if (!canPreload) return

      this.isPreloading = true

      try {
        if (this.searchValue.length > 0) {
          await this.searchTokensByText()
        } else {
          await this.fetchMoreTokens()
        }
      } finally {
        this.isPreloading = false
      }
    },
    showMoreTokens() {
      if (this.isLimitPage) return

      // If limitedJettonLists is set, don't show more tokens - the list should end with the limited list
      if (this.limitedJettonLists?.length > 0) {
        return
      }

      if (this.searchValue.length > 0 && this.hasMoreSearch) {
        return
      }

      if (this.isCommunityFilter && this.displayCount < this.GET_COMMUNITY_TOKENS.length) {
        this.displayCount += this.basePageSize
      } else if (this.isAllFilter && this.displayCount < this.availableAllTokens.length) {
        this.displayCount += this.basePageSize
      } else if (this.isLabelFilter) {
        this.displayCount += this.basePageSize
      }
    },
    async fetchMoreTokens() {
      // If limitedJettonLists is set, don't load more tokens - the list should end with the limited list
      if (this.limitedJettonLists?.length > 0) {
        this.hasMoreTokens = false
        return
      }

      if (!this.hasMoreTokens || this.isLoadingMore) return

      this.isLoadingMore = true

      try {
        if (this.isLabelFilter) {
          const currentTokens = this.GET_TOKENS_BY_LABEL(this.activeFilter.id) || []
          const nextPage = this.GET_LABEL_PAGE(this.activeFilter.id) + 1
          const addCommunity = this.getCommunityTokensValue

          const res = await tokenService.getTokensByLabel(this.activeFilter.id, addCommunity, false, nextPage, 100)

          if (res.items.length > 0) {
            const updatedTokens = [...currentTokens, ...res.items]
            this.dexStore.DEX_TOKENS_BY_LABEL({ labelId: this.activeFilter.id, tokens: updatedTokens })
            this.dexStore.DEX_LABEL_PAGE({ labelId: this.activeFilter.id, page: nextPage })
          }

          if (res.items.length < 100) {
            this.hasMoreTokens = false
          }
        } else {
          const nextPage = this.isCommunityFilter ? this.GET_LAST_COMMUNITY_PAGE + 1 : this.GET_LAST_TOKEN_PAGE + 1
          const addCommunity = this.isCommunityFilter ? false : this.getCommunityTokensValue

          const res = await tokenService.getTokenListV2({ page: nextPage, size: 100 }, addCommunity, this.isCommunityFilter)

          const newTokens = res.items.map((item) => {
            const isNative = item.address === TON_COIN_ADDRESS
            return {
              ...item,
              type: isNative ? "native" : "jetton",
              address: isNative ? "native" : item.address,
              imported: false,
              listed: true
            }
          })

          const currentTokens = this.isCommunityFilter ? this.GET_COMMUNITY_TOKENS : this.GET_TON_TOKENS
          const currentAddresses = currentTokens.map(token => token.address)
          const uniqueTokens = newTokens.filter(token => !currentAddresses.includes(token.address))

          if (uniqueTokens.length > 0) {
            writeTokenListEntries(uniqueTokens, this.isCommunityFilter, this.dexStore, this.limitStore)
            this.displayCount += this.basePageSize
          }

          if (this.isCommunityFilter) {
            this.dexStore.DEX_LAST_COMMUNITY_PAGE(nextPage)
          } else {
            this.dexStore.DEX_LAST_TOKEN_PAGE(nextPage)
          }

          if (!res.items?.length || res.items.length < 100) {
            this.hasMoreTokens = false
            if (!this.isCommunityFilter) this.loading = false
          }
        }

      } catch (error) {
        this.hasMoreTokens = false
        console.error(error)
      } finally {
        this.isLoadingMore = false
      }
    },
    async setActiveFilter(selectedFilter) {
      this.activeFilter = selectedFilter
      this.displayCount = this.initialDisplayCount

      if (this.limitedJettonLists?.length > 0) {
        this.hasMoreTokens = false
        this.isPreloading = false
        return
      }

      this.hasMoreTokens = true
      this.isPreloading = false

      if (this.observer) {
        this.observer.disconnect()
        this.observer = null
      }

      const needsLoading = (selectedFilter.name === "community" && this.GET_COMMUNITY_TOKENS.length === 0) ||
          (selectedFilter.name !== "all" && selectedFilter.name !== "community")

      if (needsLoading) {
        this.loading = true
        try {
          if (selectedFilter.name === "community") {
            const res = await tokenService.getTokenListV2({ page: 1, size: 100 }, false, true)
            const tokens = res.items.map((item) => {
              const isNative = item.address === TON_COIN_ADDRESS
              return {
                ...item,
                type: isNative ? "native" : "jetton",
                address: isNative ? "native" : item.address,
                imported: false,
                listed: true,
                balance: 0
              }
            })
            this.dexStore.DEX_COMMUNITY_TOKENS(tokens)
            this.dexStore.DEX_LAST_COMMUNITY_PAGE(1)
          } else {
            await this.loadLabelTokens()
          }
        } catch (err) {
          console.error(err)
        } finally {
          this.loading = false
        }
      }

      if (this.searchValue.trim().length > 0) {
        await this.applySearchForCurrentFilter()
      }

      await this.$nextTick(() => {
        const scrollContainer = document.getElementById("scroll")
        if (scrollContainer) {
          scrollContainer.scrollTop = 0
        }
      })
    },
    async applySearchForCurrentFilter() {
      this.searchPage = 1
      this.hasMoreSearch = true
      this.loading = true
      this.isSearching = true

      try {
        await this.fetchTokens()
      } finally {
        this.loading = false
        this.isSearching = false
      }
    },
    async loadLabelTokens() {
      let tokens = this.GET_TOKENS_BY_LABEL(this.activeFilter.id) || []

      if (tokens.length === 0) {
        try {
          const addCommunity = this.getCommunityTokensValue
          const response = await tokenService.getTokensByLabel(this.activeFilter.id, addCommunity, false, 1, 100)

          tokens = response.items.map((item) => {
            const userToken = this.GET_USER_TOKENS.find((token) => token.address === item.address)
            return userToken
                ? { ...userToken, labels: item.labels }
                : item
          })

          this.dexStore.DEX_TOKENS_BY_LABEL({ labelId: this.activeFilter.id, tokens })
          this.dexStore.DEX_LABEL_PAGE({ labelId: this.activeFilter.id, page: 1 })
        } catch (error) {
          console.error(error)
        }
      }
    },
    localSearchForLimitTokens() {
      const tokenList = this.getLimitTokensList
      const results = tokenList.filter((token) =>
          token.name.toLowerCase().includes(this.searchValueLower) ||
          token.symbol.toLowerCase().includes(this.searchValueLower))
      this.foundSearchResults(results)
      // Reset loading state after local search completes
      this.loading = false
      this.isSearching = false
    },
    localSearch() {
      const tokenList =
          this.activeFilter.name === "yourTokens"
              ? this.filteredYourTokens
              : this.GET_TOKENS_BY_LABEL(this.activeFilter.id)

      this.searchResults = tokenList.filter((token) =>
          token.name.toLowerCase().includes(this.searchValueLower) ||
          (token.symbol.toLowerCase().includes(this.searchValueLower) && (token?.listed || token?.imported)))
      this.emptyResponse = !this.searchResults.length
    },
    handleSearchInput(value) {
      if (value.length <= 10) {
        this.$refs.tokenSearch.$emit("updateUnlistedToken", null)
      }
    },
    isAddress(value) {
      try {
        const parsedAddress = Address.parseFriendly(value)
        return !!parsedAddress.address
      } catch (error) {
        return false
      }
    },
    async fetchTokens() {
      try {
        if (this.searchValue.trim().length === 0) {
          this.resetSearchResults()
          return
        }

        const trimmedValue = this.searchValue.trim()

        if (this.isAddress(trimmedValue) || trimmedValue.length > 10) {
          const address = Address.parse(trimmedValue).toRawString()
          const found = await this.searchTokenByAddress(address)

          if (found || this.isLimitPage) {
            return
          }
        }

        await this.searchTokensByText()
      } catch (error) {
        console.error(error)
        this.emptySearchResults()
      }
    },
    async searchTokenByAddress(address) {
      try {
        const response = await tokenService.getTokensByAddress([address])

        if (!response?.length) {
          this.emptySearchResults()
          return false
        }

        const foundToken = response[0]

        if (this.isLimitPage && !this.getLimitTokensList.some(token => token.address === foundToken.address)) {
          this.emptySearchResults()
          return false
        }

        const balance = (this.GET_TON_TOKENS.find(token => token.address === address) as any)?.balance || 0
        const isImported = this.GET_TON_TOKENS.some(token => token.address === address && token.imported)

        if (this.isTokenVerified(foundToken)) {
          const listedToken = this.formatTokenData(foundToken, { balance, imported: isImported })
          this.foundSearchResults([listedToken])
        } else {
          const unlistedToken = this.formatTokenData(foundToken, { balance, imported: false, listed: false })
          this.foundSearchResults([], unlistedToken)
        }

        return true
      } catch (err) {
        console.error(err)
        return false
      }
    },
    async searchTokensByText() {
      if (this.isAllFilter && this.isLimitPage) {
        this.localSearchForLimitTokens()
        return
      }

      try {
        const uniqueTokens = new Map()

        if (this.searchPage > 1) {
          this.searchResults.forEach(token => {
            uniqueTokens.set(token.address, token)
          })
        } else {
          this.filterUserTokensBySearch(uniqueTokens)
          this.filterImportedTokensBySearch(uniqueTokens)
        }

        await this.getTokensFromApi(uniqueTokens)

        const results = Array.from(uniqueTokens.values())
            .filter(token => token.listed || token.imported)
            .filter((token, index, self) => index === self.findIndex(t => t.address === token.address))

        this.foundSearchResults(results)
      } catch (err) {
        console.error(err)
        this.emptySearchResults()
      }
    },
    filterUserTokensBySearch(uniqueTokens) {
      const userTokens = this.GET_USER_TOKENS.filter(token => {
        const matchesSearch = (token?.name.toLowerCase().includes(this.searchValueLower)
            || token?.symbol.toLowerCase().includes(this.searchValueLower)) && token.balance > 0 && (token?.listed || token?.imported)

        if (this.isCommunityFilter) {
          return matchesSearch && token.verification === 'COMMUNITY'
        }

        return matchesSearch
      })

      userTokens.forEach(token => {
        uniqueTokens.set(token.address, token)
      })
    },
    filterImportedTokensBySearch(uniqueTokens) {
      const importedTokens = JSON.parse(localStorage.getItem("importTokens")) || []
      const matchingImportedTokens = importedTokens.filter(token =>
          token.name.toLowerCase().includes(this.searchValueLower) ||
          token.symbol.toLowerCase().includes(this.searchValueLower)
      )

      matchingImportedTokens.forEach(token => {
        if (!uniqueTokens.has(token.address)) {
          const balance = this.GET_TON_TOKENS.find(t => t.address === token.address)?.balance || 0
          const normalizedToken = this.formatTokenData(token as any, {
            balance,
            imported: true,
            listed: false
          })
          uniqueTokens.set(token.address, normalizedToken)
        }
      })
    },
    async getTokensFromApi(uniqueTokens) {
      if (this.limitedJettonLists?.length > 0) {
        this.hasMoreSearch = false
        return
      }

      const addCommunity = this.getCommunityTokensValue

      let response

      if (this.isLabelFilter) {
        response = await tokenService.getTokensByLabel(
            this.activeFilter.id,
            addCommunity,
            false,
            this.searchPage,
            100,
            this.searchValue.trim()
        )
      } else {
        const params = {
          search: this.searchValue.trim(),
          page: this.searchPage,
          size: 100
        }
        response = await tokenService.getTokenListV2(params, addCommunity, this.isCommunityFilter)
      }

      const apiResults = response.items || []

      apiResults.forEach((token: any) => {
        if (!uniqueTokens.has(token.address)) {
          const normalizedToken = this.formatTokenData(token, { balance: 0, imported: false })
          uniqueTokens.set(token.address, normalizedToken)
        }
      });

      if (apiResults.length < 100) {
        this.hasMoreSearch = false
      } else {
        this.searchPage++
      }
    },
    chooseToken(item) {
      if (this.getRouteName === "MultiSwap") {
        this.chooseMultiToken(item)
        return
      }

      if (this.getRouteName === "BoostLiquidity" || this.isStakingPage) {
        this.updateToken(this.mode, item)
        this.closePopup()
        return
      }

      if (this.mode === "first") {
        if (this.getTokens.second?.address === item?.address) {
          this.updateTokenPositions()
          this.closePopup()
        } else if (this.getTokens.first?.address !== item?.address) {
          this.updateToken(this.mode, item)
          this.closePopup()
        }
      } else if (this.mode === "second") {
        if (this.getTokens.first?.address === item?.address) {
          this.updateTokenPositions()
          this.closePopup()
        } else if (this.getTokens.second?.address !== item?.address) {
          this.updateToken(this.mode, item)
          this.closePopup()
        }
      }
    },
    chooseMultiToken(item) {
      let findAmongSendTokens = Array.from(this.GET_SEND_MULTI_TOKENS.values()).find((findItem: any) => findItem.address === item.address)
      let isReceive = this.GET_RECEIVE_MULTI_TOKEN?.address === item.address

      if (!findAmongSendTokens && !isReceive) {
        this.updateToken(this.mode, item)
        this.closePopup()
      }
    },
    importToken() {
      this.closePopup()
      (this.unlistedToken as any).imported = true
      let allTokens = this.GET_TON_TOKENS
      let storage = JSON.parse(localStorage.getItem("importTokens")) || []
      let existingToken = allTokens.find((token) => token.address === (this.unlistedToken as any).address)

      if (existingToken) {
        existingToken.imported = true
      } else {
        allTokens.unshift(this.unlistedToken as any)
      }

      const tokenToSave = {
        ...(this.unlistedToken as any),
        verification: (this.unlistedToken as any).verification
      }

      storage.push(tokenToSave)

      localStorage.setItem("importTokens", JSON.stringify(storage))

      this.dexStore.DEX_TON_TOKENS(allTokens)

      setTimeout(() => {
        this.searchValue = ""
        this.chooseToken(this.unlistedToken as any)
      }, 200)
    },
    tokenRemoved(token) {
      this.searchResults = this.searchResults.filter((item) => item.address !== token.address)
      if (this.searchValue.length > 0) {
        this.fetchTokens()
      }
    },
    pinToken(item) {
      let pinTokens = this.GET_PINNED_TOKENS.slice()
      let findNative = this.GET_PINNED_TOKENS.findIndex((item) => item?.address === "native")
      pinTokens.splice(findNative, 1)

      let findInStock = pinTokens.findIndex((findToken) => findToken?.address === item?.address)
      let findIndex = this.userPinnedTokens.findIndex((findItem) => item?.address === findItem?.address)

      if (findIndex === -1 && findInStock === -1) {
        if (this.userPinnedTokens.length < 3) {
          this.userPinnedTokens.push(item)

          let addressList = []
          this.userPinnedTokens.forEach((item) => {
            addressList.push(item?.address)
          })
          this.saveToStorage(addressList, "userPin")
        }
      } else {
        let findUnpinIndex = this.userUnpinnedTokens.findIndex((find) => item?.address === find?.address)
        if (findUnpinIndex !== -1) {
          this.userUnpinnedTokens.splice(findUnpinIndex, 1)
        }

        let addressList = []
        this.userUnpinnedTokens.forEach((item) => {
          addressList.push(item?.address)
        })
        this.saveToStorage(addressList, "userUnpin")
      }
    },
    unpinToken(item) {
      let findIndex = this.userPinnedTokens.findIndex((findItem) => item?.address === findItem?.address)

      if (findIndex !== -1) {
        if (this.userPinnedTokens.length <= 3) {
          this.userPinnedTokens.splice(findIndex, 1)

          let addressList = []
          this.userPinnedTokens.forEach((item) => {
            addressList.push(item?.address)
          })
          this.saveToStorage(addressList, "userPin")
        }
      } else {
        let findInList = this.userUnpinnedTokens.find((find) => item?.address === find?.address)
        if (!findInList) {
          this.userUnpinnedTokens.push(item)
        }

        let addressList = []
        this.userUnpinnedTokens.forEach((item) => {
          addressList.push(item?.address)
        })
        this.saveToStorage(addressList, "userUnpin")
      }
    },
    checkItemIsPinned(item: any): boolean {
      let pinTokens = []
      this.GET_PINNED_TOKENS.forEach((findItem) => {
        let findInUnpin = this.userUnpinnedTokens.find((find) => find?.address === findItem?.address)
        if (findInUnpin) {
          return
        }
        pinTokens.push(findItem)
      })

      let findNative = this.GET_PINNED_TOKENS.findIndex((item) => item?.address === "native")
      pinTokens.splice(findNative, 1)

      let findItem = this.userPinnedTokens.find((find) => find?.address === item?.address)
      let findInStock = pinTokens.find((findToken) => findToken?.address === item?.address)

      return !!(findInStock || findItem || item.type === "native")
    },
    async saveToStorage(value, key) {
      try {
        let settings = this.GET_USER_SETTINGS
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
        if (this.GET_PROOF_VERIFICATION) {
          await profileService.writeStorage(
              this.GET_DEX_WALLET?.address,
              this.GET_PROOF_VERIFICATION,
              settings,
          )
        }
      } catch (err) {
        console.error(err)
      }
    },
    processStakeTokens() {
      return this.stakeTokens.map((tokenData) => {
        const token = tokenData.token
        const metadata = token.metadata
        const balance = tokenData.balance
        const normalizer = tokenData.normalizer

        return {
          address: token.address.address,
          blockchain: token.address.blockchain,
          name: metadata.name,
          symbol: metadata.symbol,
          decimals: metadata.decimals,
          listed: metadata.listed,
          image: metadata.image_url,
          normalizer: normalizer,
          balance: balance.asset_amount_raw / Math.pow(10, 9),
          price_usd: balance.asset_amount_usd,
        }
      })
    },
    checkMaxHeight() {
      if (window.innerWidth <= 768 && !this.isStakingPage) {
        let popup = document.getElementById("popup")
        let block = document.getElementById("scroll")
        let height = 400
        if (popup) {
          height = popup.offsetHeight - block.getBoundingClientRect().top
        }
        this.maxHeight = `${height}px`
      }
    },
    isLpToken(item) {
      const index = this.stakeItems.indexOf(item)
      return index !== 0
    },
    getLabelName(label) {
      if (label.name === "new") {
        return this.$t("interfaceTag.new")
      } else if (label.name === "cashback") {
        return this.$t("interfaceTag.cashback")
      } else if (label.name === "contest") {
        return this.$t("interfaceTag.contest")
      } else if (label.name === "hot") {
        return this.$t("interfaceTag.hot")
      } else if (label.name === "star") {
        return this.$t("interfaceTag.star")
      }
    },
    closePopup() {
      this.$emit("closePopup")
      this.searchValue = ""
    },
    filterLPTokens(tokens) {
      return tokens.filter(token => !token.symbol?.includes('LP'))
    },
    inputFocused() {
      if (window.innerWidth <= 640) {
        setTimeout(() => {
          document.documentElement.style.overflow = "hidden"
        }, 1000)
      }
    },
    formatTokenData(token: any, options: { balance?: number; imported?: boolean; listed?: boolean | null } = {}) {
      const { balance = 0, imported = false, listed = null } = options
      const addCommunity = this.getCommunityTokensValue
      const isWhitelisted = token.verification === "WHITELISTED"
      const isCommunity = token.verification === "COMMUNITY" && addCommunity
      const isNative = token.address === TON_COIN_ADDRESS

      return {
        ...token,
        type: isNative ? "native" : "jetton",
        address: isNative ? "native" : token.address,
        imported,
        listed: listed !== null ? listed : (isWhitelisted || isCommunity),
        balance,
        price_usd: token.price_usd || token.market_stats?.price_usd || 0
      }
    },
    isTokenVerified(token) {
      const addCommunity = this.getCommunityTokensValue
      const isWhitelisted = token.verification === "WHITELISTED"
      const isCommunity = token.verification === "COMMUNITY" && addCommunity
      const isImported = this.GET_TON_TOKENS.some((t) => t.address === token.address && t.imported)

      return isWhitelisted || isCommunity || isImported
    },
    emptySearchResults() {
      this.searchResults = []
      this.emptyResponse = true
      this.$refs.tokenSearch.$emit("updateUnlistedToken", null)
    },
    resetSearchResults() {
      this.searchResults = []
      this.emptyResponse = false
      this.$refs.tokenSearch.$emit("updateUnlistedToken", null)
    },
    foundSearchResults(results, unlistedToken = null) {
      const filteredResults = this.filterLPTokens(results)
      this.searchResults = filteredResults
      this.emptyResponse = filteredResults.length === 0
      this.$refs.tokenSearch.$emit("updateUnlistedToken", unlistedToken)
    },
    initializeDragScroll() {
      const container = this.$el.querySelector('.tokens-popup__filters')
      let isDragging = false, startX, scrollLeft

      const stopDrag = () => isDragging = false

      container.addEventListener('mousedown', e => {
        isDragging = true
        startX = e.pageX - container.offsetLeft
        scrollLeft = container.scrollLeft
      })

      container.addEventListener('mousemove', e => {
        if (!isDragging) return
        e.preventDefault()
        const walk = (e.pageX - container.offsetLeft - startX) * 1.3
        container.scrollLeft = scrollLeft - walk
      })

      container.addEventListener('mouseup', stopDrag)
      container.addEventListener('mouseleave', stopDrag)
    }
  },
  mounted() {
    if (!this.isStakingPage && !this.isLimitPage) {
      this.initializeDragScroll()
    }

    if (window.innerWidth > 768) {
      this.maxHeight = "400px"
    }

    this.checkMaxHeight()

    if (!this.isStakingPage) {
      window.addEventListener("resize", this.checkMaxHeight)
    }

    if (this.stakeTokens.length > 0) {
      this.stakeItems = this.processStakeTokens()

      const cesTokenIndex = this.stakeItems.findIndex((item) => item.symbol === "CES")

      if (cesTokenIndex > -1) {
        const cesToken = this.stakeItems.splice(cesTokenIndex, 1)[0]
        this.stakeItems.unshift(cesToken)
      }
    }

    let userPinned = []
    let userUnpinned = []

    if (this.GET_USER_SETTINGS !== null) {
      userPinned = this.GET_USER_SETTINGS?.userPin
      userUnpinned = this.GET_USER_SETTINGS?.userUnpin
    } else {
      userPinned = JSON.parse(localStorage.getItem("userPin"))
      userUnpinned = JSON.parse(localStorage.getItem("userUnpin"))
    }

    if (userPinned) {
      userPinned.forEach((item) => {
        let findPinned = this.GET_TON_TOKENS.find((find) => item === find.address)
        if (findPinned) {
          this.userPinnedTokens.push(findPinned)
        }
      })
    }
    if (userUnpinned) {
      userUnpinned.forEach((item) => {
        let findUnpinned = this.GET_TON_TOKENS.find((find) => item === find.address)
        if (findUnpinned) {
          this.userUnpinnedTokens.push(findUnpinned)
        }
      })
    }
  },
  unmounted() {
    if (this.observer) {
      this.observer.disconnect()
    }

    if (this.debounceTimeout) {
      clearTimeout(this.debounceTimeout)
    }

    if (!this.isStakingPage) {
      window.addEventListener("resize", this.checkMaxHeight)
    }
  },
  watch: {
    searchValue(newValue) {
      if (this.observer) {
        this.observer.disconnect()
        this.observer = null
      }

      this.searchPage = 1
      this.hasMoreSearch = true

      if (newValue.trim().length === 0) {
        this.searchResults = []
        this.emptyResponse = false
        this.isPreloading = false
        this.loading = false
        this.isSearching = false
        this.isLoadingMore = false
        this.$refs.tokenSearch.$emit("updateUnlistedToken", null)
        return
      }

      this.loading = true
      this.isSearching = true
      clearTimeout(this.debounceTimeout)

      this.debounceTimeout = setTimeout(async () => {
        try {
          await this.fetchTokens()
        } finally {
          // Ensure loader is visible for at least 200ms for better UX
          setTimeout(() => {
            this.loading = false
            this.isSearching = false
          }, 200)
        }
      }, this.DEBOUNCE_DELAY)
    }
  },
}
</script>

<style scoped>
.tokens-popup__wrapper {
  position: relative;
  margin-top: -4px;
}

.tokens-popup__block {
  padding: 0 16px;
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

.tokens-popup__pinned-list {
  margin-bottom: 16px;
  padding: 0 16px;
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
  overflow: hidden;
  overflow-x: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
}

@keyframes Loader {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.tokens-popup__filters::-webkit-scrollbar {
  display: none;
}


.tokens-popup__icon-info {
  display: flex;
  align-items: center;
  gap: 0 4px;
  padding: 0 16px 6px 16px;
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

.loading-blur {
  position: absolute;
  top: 228px;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
  backdrop-filter: blur(4px);
  pointer-events: none;
  border-radius: 0 0 20px 20px;
}

.loader-image {
  position: absolute;
  left: 43%;
  top: 50%;
  width: 70px;
  height: 70px;
  transform: translate(-50%, -50%);
  background: url(/src/assets/dex/loader.png) no-repeat;
  background-size: cover;
  animation: 1s linear infinite Loader;
  z-index: 2;
}

.theme-light svg path {
  fill: #141414;
}

@media screen and (max-width: 960px) {
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