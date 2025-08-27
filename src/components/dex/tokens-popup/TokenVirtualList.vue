<template>
  <DynamicScroller
      ref="scroller"
      class="custom-scroll tokens-popup__scroll-block"
      :items="virtualizedItems"
      :min-item-size="60"
      :buffer="isMobile ? 800 : 600"
      :emit-update="false"
      key-field="uniqueId"
      @scroll="onScrollLoadMore"
  >
    <template v-slot="{ item, index, active }">
      <DynamicScrollerItem
          :item="item"
          :active="active"
          :data-index="index"
          :size-dependencies="getSizeDependencies(item)"
          :watch-data="false"
      >
        <template v-if="item.type === 'token'">
          <div v-show="showSkeleton" class="token-skeleton">
            <div class="token-skeleton__left">
              <skeleton-item class="token-skeleton__icon" />
              <div class="token-skeleton__info">
                <skeleton-item class="token-skeleton__symbol" />
                <skeleton-item class="token-skeleton__name" />
              </div>
            </div>
            <div class="token-skeleton__middle">
              <skeleton-item class="token-skeleton__balance-tokens" />
              <skeleton-item class="token-skeleton__balance-usd" />
            </div>
            <div class="token-skeleton__right">
              <skeleton-item class="token-skeleton__pin" />
            </div>
          </div>

          <TokenItem
              v-show="!showSkeleton"
              :item="item.data"
              :userPinnedTokens="userPinnedTokens"
              :userUnpinnedTokens="userUnpinnedTokens"
              :activeFilter="activeFilter"
              :tonPrice="tonPrice"
              :isLastItem="index === virtualizedItems.length - 1"
              :totalItems="virtualizedItems.length"
              :class="generateTokenClass(item.data, item.index)"
              @click="$emit('token-selected', item.data)"
          />
        </template>

        <template v-else>
          <div v-if="item.type === 'title'" class="tokens-popup__list-title">
            {{ item.title }}
          </div>
          <div v-else-if="item.type === 'empty'" class="empty-search">
            <div class="empty-search__text">
              <p class="empty-search__text">{{ item.content.mainText }}</p>
              <p v-if="item.content.subText" class="empty-search__text">{{ item.content.subText }}</p>
            </div>
          </div>
          <TokenUnlisted
              v-else-if="item.type === 'unlisted'"
              :unlistedToken="unlistedToken"
              :userPinnedTokens="userPinnedTokens"
              :userUnpinnedTokens="userUnpinnedTokens"
              :tonPrice="tonPrice"
          />
        </template>
      </DynamicScrollerItem>
    </template>
  </DynamicScroller>
</template>

<script lang="ts">
import TokenItem from './TokenItem.vue'
import TokenUnlisted from './TokenUnlisted.vue'
import SkeletonItem from '@/components/ui/SkeletonItem.vue'
import {useDexStore} from "@/stores/dex";
import {SwapActiveTab} from "@/utils/types.ts";
import {useLimitStore} from "@/stores/limit";
import { DynamicScroller, DynamicScrollerItem } from 'vue-virtual-scroller'
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'

export default {
  name: 'TokenVirtualList',
  components: {
    TokenItem,
    TokenUnlisted,
    SkeletonItem,
    DynamicScroller,
    DynamicScrollerItem,
  },
  props: {
    virtualizedItems: {
      type: Array,
      required: true
    },
    unlistedToken: {
      type: Object,
      default: null
    },
    userPinnedTokens: {
      type: Array,
      required: true
    },
    userUnpinnedTokens: {
      type: Array,
      required: true
    },
    tonPrice: {
      type: Number,
      required: true
    },
    activeFilter: {
      type: Object,
      required: true
    },
    mode: {
      type: String,
      required: true
    }
  },
  emits: ['scroll', 'token-selected'],
  data() {
    return {
      showSkeleton: false,
      skeletonHideTimer: null,
      isMobile: false,
      scrollThrottle: null,
      previousScrollTimestamp: 0,
      currentScrollSpeed: 0,
      previousScrollPosition: 0,
      minScrollDistanceForSkeleton: 600,
      lastSkeletonChange: 0,
      minSkeletonChangeInterval: 100,
      MOBILE_SPEED_LIMIT_FOR_SKELETON: 3.0,
      DESKTOP_SPEED_LIMIT_FOR_SKELETON: 10.0,
      MOBILE_SKELETON_HIDE_DELAY: 200,
      DESKTOP_SKELETON_HIDE_DELAY: 100,
      LIST_END_THRESHOLD: 10
    }
  },
  computed: {
    dexStore() {
      return useDexStore()
    },
    limitStore() {
      return useLimitStore()
    },
    routeName() {
      return this.dexStore.GET_SWAP_ACTIVE_TAB as SwapActiveTab
    },
    isLimitPage() {
      const limitTabs = [SwapActiveTab.Limit, SwapActiveTab.DCA]
      return limitTabs.includes(this.routeName)
    },
    getTokens() {
      if (this.isLimitPage) {
        return {
          first: this.limitStore.GET_LIMIT_FIRST_TOKEN,
          second: this.limitStore.GET_LIMIT_SECOND_TOKEN,
        }
      } else {
        return {
          first: this.dexStore.GET_SEND_TOKEN,
          second: this.dexStore.GET_RECEIVE_TOKEN,
        }
      }
    },
    multiIsActive() {
      return (item: any) => {
        const findAmongSendTokens = Array.from(this.dexStore.GET_SEND_MULTI_TOKENS.values())
            .find((findItem: any) => findItem.address === item.address)
        const isReceive = this.dexStore.GET_RECEIVE_MULTI_TOKEN?.address === item.address
        return findAmongSendTokens || isReceive
      }
    },
    boostIsActive() {
      return false
    },
    createPoolIsActive() {
      return false
    },
    limitIsActive() {
      return (item) => {
        return this.limitStore.GET_LIMIT_FIRST_TOKEN?.address === item.address || this.limitStore.GET_LIMIT_SECOND_TOKEN?.address === item.address
      }
    },
    swapIsActive() {
      return (item) => {
        return this.dexStore.GET_SEND_TOKEN?.address === item.address || this.dexStore.GET_RECEIVE_TOKEN?.address === item.address
      }
    }
  },
  methods: {
    updateSkeletonDisplay(newState, reason = '') {
      const now = Date.now()
      if (this.showSkeleton === newState) return

      if (now - this.lastSkeletonChange < this.minSkeletonChangeInterval) {
        return
      }

      this.showSkeleton = newState
      this.lastSkeletonChange = now
    },
    onScrollLoadMore(event) {
      const scrollMetrics = this.calculateScrollMetrics(event)

      this.isMobile
          ? this.mobileScrollBehavior(scrollMetrics)
          : this.desktopScrollBehavior(scrollMetrics)

      this.updateScrollTrackingData(scrollMetrics)
      this.$emit('scroll', event)
    },
    calculateScrollMetrics(event) {
      const currentTime = Date.now()
      const currentScrollPosition = event.target.scrollTop
      const timeDiff = currentTime - this.previousScrollTimestamp
      const scrollDiff = Math.abs(currentScrollPosition - this.previousScrollPosition)
      let currentScrollSpeed = 0

      if (timeDiff > 0) {
        currentScrollSpeed = scrollDiff / timeDiff
      }

      const speedLimitForSkeleton = this.isMobile
          ? this.MOBILE_SPEED_LIMIT_FOR_SKELETON
          : this.DESKTOP_SPEED_LIMIT_FOR_SKELETON

      const isFastScroll = currentScrollSpeed > speedLimitForSkeleton
      const isAtListEnd = this.isMobile && (
          currentScrollPosition <= this.LIST_END_THRESHOLD ||
          currentScrollPosition >= (event.target.scrollHeight - event.target.clientHeight - this.LIST_END_THRESHOLD)
      )

      return {
        currentTime,
        currentScrollPosition,
        scrollDiff,
        currentScrollSpeed,
        isFastScroll,
        isAtListEnd,
        scrollTarget: event.target
      }
    },
    mobileScrollBehavior(scrollMetrics) {
      const { isAtListEnd, isFastScroll, scrollDiff } = scrollMetrics

      if (isAtListEnd) {
        this.clearSkeletonHideTimer()
        this.updateSkeletonDisplay(false, 'list-end')
      } else if (this.showSkeletonOnMobileFastScroll(isFastScroll, scrollDiff)) {
        this.clearSkeletonHideTimer()
        this.updateSkeletonDisplay(true, 'mobile-fast-scroll')
      } else if (this.hideSkeletonOnMobileSlowScroll(isFastScroll)) {
        this.skeletonHide(this.MOBILE_SKELETON_HIDE_DELAY, 'mobile-scroll-stopped')
      }
    },
    desktopScrollBehavior(scrollMetrics) {
      const { isFastScroll, scrollDiff } = scrollMetrics

      const shouldShowSkeletonForFastScroll = isFastScroll && scrollDiff > this.minScrollDistanceForSkeleton

      if (shouldShowSkeletonForFastScroll) {
        this.updateSkeletonDisplay(true, 'desktop-fast-scroll')
      }

      if (this.showSkeleton) {
        this.clearSkeletonHideTimer()
        this.skeletonHide(this.DESKTOP_SKELETON_HIDE_DELAY, 'desktop-scroll-stopped')
      }
    },
    showSkeletonOnMobileFastScroll(isFastScroll, scrollDiff) {
      return isFastScroll && !this.showSkeleton && scrollDiff > this.minScrollDistanceForSkeleton
    },
    hideSkeletonOnMobileSlowScroll(isFastScroll) {
      return !isFastScroll && this.showSkeleton && !this.skeletonHideTimer
    },
    clearSkeletonHideTimer() {
      if (this.skeletonHideTimer) {
        clearTimeout(this.skeletonHideTimer)
        this.skeletonHideTimer = null
      }
    },
    skeletonHide(delay, reason) {
      this.skeletonHideTimer = setTimeout(() => {
        this.updateSkeletonDisplay(false, reason)
        this.skeletonHideTimer = null
      }, delay)
    },
    updateScrollTrackingData(scrollMetrics) {
      const { currentTime, currentScrollPosition, currentScrollSpeed } = scrollMetrics

      this.currentScrollSpeed = currentScrollSpeed
      this.previousScrollTimestamp = currentTime
      this.previousScrollPosition = currentScrollPosition
    },
    getSizeDependencies(item) {
      return [item.type, item.title, item.content]
    },
    generateTokenClass(item, index) {
      const baseClass = 'token_' + (index + 1)
      return [
        baseClass,
        {'active_item': this.isActiveCondition(item)}
      ]
    },
    isActiveCondition(item) {
      switch (this.routeName) {
        case 'MultiSwap':
          return this.multiIsActive(item)
        case 'BoostLiquidity':
          return this.boostIsActive(item)
        case 'CreatePool':
          return this.createPoolIsActive(item)
        case 'Limit':
        case 'Dca':
          return this.limitIsActive(item)
        default:
          return this.swapIsActive(item)
      }
    },
    checkIsMobile() {
      this.isMobile = window.innerWidth <= 768
    }
  },
  mounted() {
    this.checkIsMobile()
    window.addEventListener('resize', this.checkIsMobile)
  },
  unmounted() {
    if (this.skeletonHideTimer) {
      clearTimeout(this.skeletonHideTimer)
    }
    if (this.scrollThrottle) {
      clearTimeout(this.scrollThrottle)
    }
    window.removeEventListener('resize', this.checkIsMobile)
  }
}
</script>

<style scoped>
.tokens-popup__list-title {
  font-family: Harmony-Regular, sans-serif;
  font-size: 14px;
  font-weight: 400;
  opacity: 0.6;
  color: var(--main-text-color);
  padding: 6px 16px 12px 16px;
}

.empty-search {
  padding-top: 30px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-search__text {
  font-family: Harmony-Regular, sans-serif;
  font-weight: 400;
  text-align: center;
  font-size: 14px;
}

.tokens-popup__scroll-block {
  max-height: 400px;
  height: 400px;
  overflow-y: auto;
  transform: translateZ(0);
  scroll-behavior: auto;
  -webkit-overflow-scrolling: touch;
  will-change: scroll-position;
}

.token-skeleton {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 16px;
  height: 60px;
  will-change: transform;
  backface-visibility: hidden;
}

.token-skeleton__left {
  display: flex;
  align-items: center;
  gap: 6px;
  flex: 1;
  min-width: 0;
}

.token-skeleton__icon {
  width: 32px;
  height: 32px;
  border-radius: 100px !important;
  animation: none !important;
}

.token-skeleton__info {
  min-width: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.token-skeleton__symbol {
  height: 22px;
  width: 100px;
  border-radius: 18px !important;
}

.token-skeleton__name {
  height: 16px;
  width: 200px;
  border-radius: 18px !important;
}

.token-skeleton__middle {
  display: flex;
  flex-direction: column;
  text-align: right;
  flex-shrink: 0;
  gap: 6px;
}

.token-skeleton__right {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 10px;
}

.token-skeleton__balance-tokens {
  height: 17px;
  width: 30px;
  border-radius: 18px !important;
}

.token-skeleton__balance-usd {
  height: 17px;
  width: 30px;
  border-radius: 18px !important;
}

.token-skeleton__pin {
  height: 17px;
  width: 16px;
  border-radius: 5px !important;
}

.token-skeleton .skeleton::after {
  animation: none !important;
}

.custom-scroll::-webkit-scrollbar-track {
  margin: 5px 0 15px 0;
}

@media screen and (max-width: 960px) {
  .tokens-popup__scroll-block {
    max-height: none;
  }

  .custom-scroll::-webkit-scrollbar-track {
    margin: 0;
  }
}

@media screen and (max-width: 768px) {
  .tokens-popup__scroll-block {
    height: calc(100dvh - 235px);
  }
}
</style>