<template>
  <div class="my__info">
    <div class="info__stats stats">
      <div class="stats__top">
        <div v-if="!isLoading" class="stats__user">
          <div class="stats__user-img">
            <img :src="getLevelIcon" alt="level" />
          </div>
          <div class="stats__user-info">
            <div class="stats__user-head">
              <p>
                {{ $t('referralInfo.statsNames[1]') }}
              </p>

              <div
              class="info-wrapper"
              @mouseenter="showTooltip = true"
              @mouseleave="showTooltip = false"
            >
              <svg
                class="tokens__info-icon"
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
              >
                <g opacity="0.5">
                  <path
                    d="M8 1.5C6.71442 1.5 5.45772 1.88122 4.3888 2.59545C3.31988 3.30968 2.48676 4.32484 1.99479 5.51256C1.50282 6.70028 1.37409 8.00721 1.6249 9.26809C1.8757 10.529 2.49477 11.6872 3.40381 12.5962C4.31285 13.5052 5.47104 14.1243 6.73192 14.3751C7.99279 14.6259 9.29973 14.4972 10.4874 14.0052C11.6752 13.5132 12.6903 12.6801 13.4046 11.6112C14.1188 10.5423 14.5 9.28558 14.5 8C14.4982 6.27665 13.8128 4.62441 12.5942 3.40582C11.3756 2.18722 9.72335 1.50182 8 1.5ZM7.75 4.5C7.89834 4.5 8.04334 4.54399 8.16668 4.6264C8.29002 4.70881 8.38615 4.82594 8.44291 4.96299C8.49968 5.10003 8.51453 5.25083 8.48559 5.39632C8.45665 5.5418 8.38522 5.67544 8.28033 5.78033C8.17544 5.88522 8.04181 5.95665 7.89632 5.98559C7.75083 6.01453 7.60003 5.99968 7.46299 5.94291C7.32595 5.88614 7.20881 5.79001 7.1264 5.66668C7.04399 5.54334 7 5.39834 7 5.25C7 5.05109 7.07902 4.86032 7.21967 4.71967C7.36032 4.57902 7.55109 4.5 7.75 4.5ZM8.5 11.5C8.23479 11.5 7.98043 11.3946 7.7929 11.2071C7.60536 11.0196 7.5 10.7652 7.5 10.5V8C7.36739 8 7.24022 7.94732 7.14645 7.85355C7.05268 7.75979 7 7.63261 7 7.5C7 7.36739 7.05268 7.24021 7.14645 7.14645C7.24022 7.05268 7.36739 7 7.5 7C7.76522 7 8.01957 7.10536 8.20711 7.29289C8.39465 7.48043 8.5 7.73478 8.5 8V10.5C8.63261 10.5 8.75979 10.5527 8.85356 10.6464C8.94732 10.7402 9 10.8674 9 11C9 11.1326 8.94732 11.2598 8.85356 11.3536C8.75979 11.4473 8.63261 11.5 8.5 11.5Z"
                    fill="white"
                  />
                </g>
              </svg>
              <transition name="tooltip">
                <tooltip-wrapper
                  v-show="showTooltip === true"
                  class="btn-tooltip"
                  @hidden-tooltip="showTooltip = false"
                >
                  {{ $t('referralInfo.level-tooltip') }}
                </tooltip-wrapper>
              </transition>
            </div>

            </div>
            <p class="stats__user-level" :class="getReferralLevel">
              {{ getDisplayLevel }}
            </p>
          </div>
        </div>
        <div v-else class="skeleton-block" />
        <div class="stats__links">
          <ReferralLink />
        </div>
      </div>
      <div class="stats__bottom">
        <div class="stats__item">
          <p class="stats__name">{{ $t('referralInfo.statsNames[0]') }}:</p>
          <p class="stats__value" :class="getReferralLevel" v-if="!isLoading">{{ percentage }}%</p>
          <div v-else class="skeleton-stats" />
        </div>

        <div class="stats__item">
          <p class="stats__name">{{ $t('referralInfo.statsNames[2]') }}:</p>
          <p class="stats__value" :class="getReferralLevel" v-if="!isLoading"> {{ $t('referralInfo.referrals', { count: numberOfReferrals }) }}</p> <div v-else class="skeleton-stats" />
        </div>

      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

import TooltipWrapper from '@/components/ui/TooltipWrapper.vue';
import ReferralLink from '@/components/referral/ReferralLink.vue';

import BronzeLevel from "@/assets/referral/level/bronze.png";
import SilverLevel from "@/assets/referral/level/silver.png";
import GoldLevel from "@/assets/referral/level/gold.png";

export default {
  name: 'ReferralMyInfo',
  components: { TooltipWrapper, ReferralLink },
  data() {
    return {
      showTooltip: false,
      isLoading: true
    };
  },
  computed: {
    ...mapGetters(['GET_REFERRAL_INFO']),
    numberOfReferrals() {
      return this.GET_REFERRAL_INFO?.referrals_count || 0;
    },
    percentage() {
      return this.GET_REFERRAL_INFO?.fees_percentage * 100 || 0;
    },
    transactionsCount() {
      return this.GET_REFERRAL_INFO?.transactions_count;
    },
    getReferralLevel() {
      if (this.percentage < 15) {
        return 'bronze';
      } else if (this.percentage >= 15 && this.percentage < 20) {
        return 'silver';
      } else if (this.percentage >= 20) {
        return 'gold';
      }
    },
    getDisplayLevel() {
      if (this.getReferralLevel === 'bronze') {
        return this.$t('referralInfo.levels[0]');
      } else if (this.getReferralLevel === 'silver') {
        return this.$t('referralInfo.levels[1]');
      } else if (this.getReferralLevel === 'gold') {
        return this.$t('referralInfo.levels[2]');
      }
    },
    getLevelIcon() {
      if (this.getReferralLevel === 'bronze') {
        return BronzeLevel;
      } else if (this.getReferralLevel === 'silver') {
        return SilverLevel;
      } else if (this.getReferralLevel === 'gold') {
        return GoldLevel;
      }
    },
  },
  watch: {
    GET_REFERRAL_INFO: {
      handler(value) {
        if (value) {
          this.isLoading = false;
        }
      },
      immediate: true,
      deep: true
    },
  },
  methods: {
    hiddenTooltip() {
      this.showTooltip = false;
    },
  },
};
</script>

<style scoped>
.my__info {
  margin-bottom: 20px;
  padding: 14px;
  background: var(--iface-white4);
  border-radius: 14px;
}

.stats__top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 5px;
  padding-bottom: 14px;
  position: relative;
}

.stats__top::after {
  content: "";
  position: absolute;
  height: 1px;
  width: 100%;
  bottom: 0;
  right: 0;
  left: 0;
  background: var(--iface-white6);
}

.stats__user {
  display: flex;
  align-items: flex-end;
  gap: 10px;
}

.stats__user-img {
  width: 44px;
  height: 44px;
}
.stats__user-img img {
  width: 44px;
  height: 44px;
  aspect-ratio: 1/1;
}

.stats__user-head {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 4px;
}

.stats__user-head p {
  line-height: 133.33%;
  font-size: 12px;
  opacity: 0.6;
}

.stats__user-level {
  font-size: 18px;
  font-weight: 500;
  text-transform: uppercase;
  line-height: 133.33%;
}

.bronze {
  color: var(--bronze);
}

.silver {
  color: var(--silver);
}

.gold {
  color: var(--gold);
}

.stats__links--mobile {
  display: none;
}

.stats__bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 14px;
  padding-top: 14px;
}

.stats__item {
  display: inline-flex;
  align-items: flex-end;
  gap: 4px;
}

.stats__name,
.stats__value {
  font-size: 14px;
  font-weight: 400;
}

.stats__name {
  opacity: 0.6;
}

.btn-tooltip {
  bottom: 25px;
  left: 50%;
  transform: translateX(-49.5%);
}

.tokens__info-icon {
  cursor: help;
}

.theme-light .tokens__info-icon {
    filter: invert(1);
}

.info-wrapper {
  position: relative;
}

.skeleton-block,
.skeleton-stats {
  background-color: var(--iface-white4);
  border-radius: 8px;
  animation: pulse 1.5s ease-in-out infinite;
}

.skeleton-block {
  width: 20%;
  height: 44px;

}

.skeleton-stats {
  width: 100px;
  height: 24px;
}

@keyframes pulse {
  0% {
    background-color: var(--iface-white2);
  }
  50% {
    background-color: var(--iface-white4);
  }
  100% {
    background-color: var(--iface-white2);
  }
}

@media screen and (max-width: 660px) {
  .stats__links {
    display: none;
  }
}

@media (max-width: 576px) {
  .my__info {
    margin: 0 14px 20px 14px;
  }
}

</style>
