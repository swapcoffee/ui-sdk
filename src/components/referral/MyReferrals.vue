<template>
  <div class="referral">
    <div v-if="GET_REFERRAL_INFO?.referrals_count === 0 && !showLoader" class="referral__empty">
      <p class="referral__empty-text">
        {{ $t('referralInfo.empty[0]') }}<br />{{ $t('referralInfo.empty[1]') }}
      </p>
    </div>
    <div v-else class="referral__content">
      <div class="referral__table-wrapper">
        <div class="referral__table table">
          <ul v-if="!showLoader" class="table__title-list">
            <li class="table__title-item">
              <p class="table__title-name">
                {{ $t('referralInfo.tableTitles[0]') }}
              </p>
            </li>
            <li class="table__title-item cursor-pointer" @click="toggleCategory('transactions')">
              <p class="table__title-name">
                {{ $t('referralInfo.tableTitles[1]') }}
              </p>
              <FilterActive 
                :isUp="isDown('transactions')"
                :isDown="isUp('transactions')"
              />
            </li>
            <li class="table__title-item cursor-pointer" @click="toggleCategory('turnover')">
              <p class="table__title-name">
                {{ $t('referralInfo.tableTitles[2]') }}
              </p>
              <FilterActive 
                :isUp="isDown('turnover')"
                :isDown="isUp('turnover')"
              />
            </li>
            <li class="table__title-item cursor-pointer" @click="toggleCategory('rewards')">
              <p class="table__title-name">
                {{ $t('referralInfo.tableTitles[3]') }}
              </p>
              <FilterActive 
                :isUp="isDown('rewards')"
                :isDown="isUp('rewards')"
              />
            </li>
          </ul>
          <div v-if="showLoader" class="skeleton-wrapper">
            <div v-for="item in 10" :key="item" class="skeleton-large table-skeleton" />
          </div>
          <ul v-else class="table__list" :class="['table__list', { loading: loadingPage }]">
            <li v-for="(referral, index) in getFilteredReferrals" :key="index" class="table__item">
              <div class="table__group">
                <UserIcon class="table__icon" />
                <a
                :href="`https://tonviewer.com/${referral.address}`"
                  target="_blank"
                  class="table__link"
                >
                <p class="table__address">
                  {{ getAddress(referral.address) }}
                </p>
                </a>
              </div>
              <p class="table__value">
                {{ referral?.transactions_count }}
              </p>
              <p class="table__value">
                {{ getFormattedValue(referral?.rewards.volume) }}
              </p>
              <p class="table__value value_colored">
                {{ getFormattedValue(referral?.rewards.fees) }}
              </p>
            </li>
          </ul>
        </div>
      </div>
      <AppPagination
        v-if="!showLoader"
        :display-count="displayCount"
        :items-total="GET_REFERRAL_INFO?.referrals_count"
        :current-length="getDisplayReferrals?.length"
        :current-page="currentPage"
        @pagination-action="paginationAction"
      />
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import AppPagination from '@/components/AppPagination.vue';
import { referralService } from '@/api/coffeeApi/services';

import UserIcon from '@/assets/referral/icons/UserIcon.vue';
import FilterActive from '@/assets/claim/icons/FilterActive.vue';

export default {
  name: 'MyReferrals',
  components: { 
    AppPagination, 
    UserIcon,
    FilterActive,
  },
  data() {
    return {
      debounce: null,
      displayCount: 10,
      currentPage: 1,
      showLoader: true,
      activeCategory: null
    };
  },
  computed: {
    ...mapGetters([
      'GET_REFERRAL_INFO',
      'GET_REFERRAL_LIST',
      'GET_PROOF_VERIFICATION',
      'GET_DEX_WALLET',
    ]),
    getDisplayReferrals() {
      return this.GET_REFERRAL_LIST;
    },
    getFilteredReferrals() {
      const referrals = this.getDisplayReferrals || [];

      if (!this.activeCategory) {
        return [...referrals];
      }

      return [...referrals].sort((a, b) => {
        let result = 0;

        switch (this.activeCategory.category) {
          case 'transactions':
            result = +b.transactions_count - +a.transactions_count;
            break;
          case 'turnover':
            result = b.rewards.volume - a.rewards.volume;
            break;
          case 'rewards':
            result = b.rewards.fees - a.rewards.fees;
            break;
          default:
            return referrals;
        }

        return this.activeCategory.direction === 'asc' ? result * -1 : result;
      });
    },
    isUp() {
      return (category) => this.activeCategory?.category === category && this.activeCategory.direction === 'asc';
    },
    isDown() {
      return (category) => this.activeCategory?.category === category && this.activeCategory.direction === 'desc';
    }
  },
  methods: {
    ...mapActions(['REFERRAL_LIST']),
    getAddress(address) {
      if (address) {
        let stringLength = 4;
        let firstHalf = address.substring(0, stringLength);
        let secondHalf = address.substring(address.length - stringLength);
        return firstHalf + '...' + secondHalf;
      } else {
        return '';
      }
    },
    paginationAction(page) {
      if (page === this.currentPage) return;
      this.loadingPage = true;

      this.currentPage = page;

      this.getReferralList();

      setTimeout(() => {
        this.loadingPage = false;
      }, 200);
    },
    async getReferralList() {
      if (this.GET_DEX_WALLET?.address && this.GET_PROOF_VERIFICATION) {
        try {
          let opts = {
            page: this.currentPage,
            size: this.displayCount,
          };
          let res = await referralService.getReferralList(
            this.GET_DEX_WALLET.address,
            this.GET_PROOF_VERIFICATION,
            opts,
          );
          await this.REFERRAL_LIST(res?.data);
        } catch (err) {
          console.error(err);
        }
      }
    },
    getFormattedValue(value) {
      if (Number.isInteger(value)) {
        return '$' + value;
      } else {
        if (value < 0.01) {
          return '~$0.01';
        }
        return '$' + value.toFixed(2);
      }
    },
    toggleCategory(category) {
      if (!this.activeCategory || this.activeCategory.category !== category) {
        this.activeCategory = { category, direction: 'desc' };
      } else {
        this.activeCategory.direction = this.activeCategory.direction === 'asc' ? 'desc' : 'asc';
      }
    },
  },
  watch: {
    GET_REFERRAL_INFO: {
      handler(value) {
        if (value) {
          this.showLoader = false;
        }
      },
      immediate: true,
      deep: true
    }
  }
};
</script>

<style scoped>
.referral__empty-text {
  margin-bottom: 10px;
  text-align: center;
  font-size: 14px;
  font-weight: 500;
  line-height: 16px;
}

.referral__table-wrapper {
  padding-bottom: 10px;
  margin-bottom: 6px;
}

.referral__table {
  min-width: 534px;
  width: 100%;
  font-family: Harmony-Regular, sans-serif;
  overflow: hidden;
}

.table__title-list {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0 14px;
  padding: 0 14px 10px 14px;
  position: relative;
}

.table__title-list::after {
  content: '';
  position: absolute;
  left: 0;
  width: 100%;
  bottom: 0;
  height: 1px;
  background: var(--iface-white6);
}

.table__title-item {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  width: 100%;
}

.table__title-name {
  font-size: 13px;
  opacity: 0.4;
}

.cursor-pointer {
  cursor: pointer;
  transition: all 0.3s ease 0s;
}

.cursor-pointer:hover {
  opacity: 0.7;
}

.table__title-item:first-child {
  justify-content: start;
  min-width: 150px;
  width: 150px;
}

.table__title-item:last-child {
  min-width: max-content;
  justify-content: flex-end;
  text-align: end;
  width: 150px;
  min-width: 150px;
}

.table__title-item:not(:first-child):not(:last-child) {
  text-align: center;
}

.table__list {
  border-radius: 12px;
  overflow: hidden;
}

.table__item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0 14px;
  position: relative;
  padding: 16px 14px;
}

.table__item:not(:last-child):after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 1px;
  background: var(--iface-white6);
}

.table__group {
  min-width: 150px;
  display: flex;
  align-items: center;
}

.table__link {
  transition: all 0.3s ease 0s;
}

.table__link:hover {
  text-decoration: underline;
}

.table__icon {
  margin-right: 8px;
}

.table__address {
  font-size: 14px;
  font-weight: 400;
}

.table__value {
  width: 100%;
  font-size: 14px;
  font-weight: 400;
}

.table__value:not(:last-child) {
  text-align: center;
}

.table__value:last-child {
  text-align: end;
  min-width: 150px;
  width: 150px;
}

svg path {
  fill: var(--main-text-color);
}

.skeleton-wrapper {
  gap: 1px;
display: flex;
flex-direction: column;
margin-bottom: 3px;
}

.table-skeleton {
width: 100%;
height: 45px;
position: relative;
}

.table-skeleton:not(:last-child) {
  border-bottom: 1px solid var(--iface-white6);
}

.table-skeleton {
  width: 100%;
  height: 45px;
}

@media screen and (max-width: 880px) {
  .referral__table-wrapper {
    overflow-x: scroll;
  }
}

@media screen and (max-width: 576px) {
  .referral__table {
    width: 150%;
  }
}
</style>
