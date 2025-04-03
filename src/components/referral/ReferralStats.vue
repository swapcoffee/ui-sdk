<template>
  <div class="info">

    <ul class="info__stats">
      <li class="info__item active-item">
        <p class="info__name">
          {{ $t('referralInfo.blockNames[0]') }}
        </p>
        <div v-if="isLoading && isWalletConnected" class="skeleton-item" />
        <p v-else class="info__value" :class="+getAvailableWithdrawal.slice(1) === 0 ? 'info__value--opacity' : ''">
          {{ getAvailableWithdrawal }}
        </p>
      </li>
      <li class="info__item">
        <div class="info__name" :class="showTooltip ? 'info__name--active' : ''">
          {{ $t('referralInfo.blockNames[1]') }}
          <div
              class="icon-wrapper"
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
                  class="tokens__tooltip"
                  @hidden-tooltip="showTooltip = false"
                >
                  {{ $t('referralInfo.tooltip-income') }}
                </tooltip-wrapper>
              </transition>
            </div>
          </div>
        <div v-if="isLoading && isWalletConnected" class="skeleton-item"></div>
        <p v-else class="info__value" :class="+totalIncome.slice(1) === 0 ? 'info__value--opacity' : ''">{{ totalIncome }}</p>
      </li>
      <li class="info__item">
        <p class="info__name">
          {{ $t('referralInfo.blockNames[2]') }}
        </p>
        <div v-if="isLoading && isWalletConnected" class="skeleton-item"></div>
        <p v-else class="info__value" :class="+monthlyIncome.slice(1) === 0 ? 'info__value--opacity' : ''">{{ monthlyIncome }}</p>
      </li>
      <li class="info__item">
        <p class="info__name">
          {{ $t('referralInfo.blockNames[3]') }}
        </p>
        <div v-if="isLoading && isWalletConnected" class="skeleton-item"></div>
        <p v-else class="info__value" :class="+totalVolume.slice(1) === 0 ? 'info__value--opacity' : ''">{{ totalVolume }}</p>
      </li>
      <li class="info__item">
        <p class="info__name">
          {{ $t('referralInfo.blockNames[4]') }}
        </p>
        <div v-if="isLoading && isWalletConnected" class="skeleton-item"></div>
        <p v-else class="info__value" :class="+monthlyVolume.slice(1) === 0 ? 'info__value--opacity' : ''">{{ monthlyVolume }}</p>
      </li>
    </ul>

  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import TooltipWrapper from '@/components/ui/TooltipWrapper.vue';

export default {
  name: 'ReferralStats',
  components: {TooltipWrapper},
  props: {
    tonConnectUi: {
      type: Object,
      default() {
        return {};
      },
    },
  },
  data() {
    return {
      isLoading: true,
      showTooltip: false
    };
  },
  computed: {
    ...mapGetters(['GET_DEX_WALLET', 'GET_PROOF_VERIFICATION', 'GET_REFERRAL_INFO', 'GET_CLAIM_INFO']),
    isWalletConnected() {
      return this.GET_DEX_WALLET !== null;
    },
    totalIncome() {
      if (Number.isInteger(this.GET_REFERRAL_INFO?.rewards.total.fees)) {
        return '$' + this.GET_REFERRAL_INFO?.rewards.total.fees;
      } else {
        if (this.GET_REFERRAL_INFO?.rewards.total.fees < 0.01) {
          return '~$0.01';
        } else {
          return '$' + (this.GET_REFERRAL_INFO?.rewards.total.fees ?? 0).toFixed(2);
        }
      }
    },
    monthlyIncome() {
      if (Number.isInteger(this.GET_REFERRAL_INFO?.rewards.monthly.fees)) {
        return '$' + this.GET_REFERRAL_INFO?.rewards.monthly.fees;
      } else {
        if (this.GET_REFERRAL_INFO?.rewards.monthly.fees < 0.01) {
          return '~$0.01';
        } else {
          return '$' + (this.GET_REFERRAL_INFO?.rewards.monthly.fees ?? 0).toFixed(2);
        }
      }
    },
    totalVolume() {
      if (Number.isInteger(this.GET_REFERRAL_INFO?.rewards.total.volume)) {
        return '$' + this.GET_REFERRAL_INFO?.rewards.total.volume;
      } else {
        if (this.GET_REFERRAL_INFO?.rewards.total.volume < 0.01) {
          return '~$0.01';
        } else {
          return '$' + (this.GET_REFERRAL_INFO?.rewards.total.volume ?? 0).toFixed(2);
        }
      }
    },
    monthlyVolume() {
      if (Number.isInteger(this.GET_REFERRAL_INFO?.rewards.monthly.volume)) {
        return '$' + this.GET_REFERRAL_INFO?.rewards.monthly.volume;
      } else {
        if (this.GET_REFERRAL_INFO?.rewards.monthly.volume < 0.01) {
          return '~$0.01';
        } else {
          return '$' + (this.GET_REFERRAL_INFO?.rewards.monthly.volume ?? 0).toFixed(2);
        }
      }
    },
    getAvailableWithdrawal() {
      let totalAvailable = 0;
      this.GET_CLAIM_INFO?.detailed.forEach((item) => {
        if (item?.token?.metadata.listed) {
          totalAvailable += item?.available_usd;
        }
      });

      return `$${totalAvailable ? totalAvailable.toFixed(4) : '0.00'}`;
    },
  },
  mounted() {
    if (this.GET_DEX_WALLET === null) {
      this.isLoading = true;
    }
    // setTimeout(() => {
    //   this.isLoading = false;
    // }, 500);
  },
  watch: {
    GET_CLAIM_INFO: {
      handler(value) {
        if (value) {
          this.isLoading = false;
        }
      },
      immediate: true,
      deep: true
    },
    GET_REFERRAL_INFO: {
      handler(value) {
        if (value) {
          this.isLoading = false;
        }
      },
    }
  },
  methods: {
    goToClaim() {
      this.$router.push({ name: 'Claim' });
    },
    connectWallet() {
      this.tonConnectUi.openModal();
    },
  },
};
</script>

<style scoped>
.info {
  margin-bottom: 20px;
}

.info__stats {
  display: flex;
  gap: 0 12px;
}

.info__item {
  width: 100%;
  padding: 10px 12px;
  border-radius: 14px;
  background: var(--iface-white4);
}

.active-item .info__value {
  color: var(--main-green);
}

.theme-light .tokens__info-icon {
    filter: invert(1);
}

.info__name,
.info__value {
  text-align: left;
}

.info__name {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  line-height: 14px;
  margin-bottom: 6px;
  opacity: 0.6;
}

.info__name--active {
  opacity: 1 !important;
}

.info__value {
  font-size: 20px;
  line-height: 120%;
}

.info__value--opacity {
  opacity: 0.6;
}

.info-wrapper {
  cursor: pointer;
}

.icon-wrapper {
position: relative;
display: flex;
align-items: center;
justify-content: center;
}

.tokens__tooltip {
bottom: 25px;
left: 50%;
transform: translateX(-49.5%);
}

.skeleton-item {
  background-color: var(--iface-white4);
  border-radius: 8px;
  animation: pulse 1.5s ease-in-out infinite;
  height: 24px;
  width: 50%;
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

@media screen and (max-width: 768px) {
  .info__stats {
    width: 100%;
    overflow: auto;
  }
  .info__item {
    width: max-content;
    min-width: 137.6px;
  }
}

@media screen and (max-width: 576px) {
  .info {
    margin-bottom: 14px;
  }
  .info__item {
    background: var(--earn-bg);
  }

  .theme-coffee .info__item {
    background: var(--iface-white4) !important;
  }

  .info__item:first-child {
    margin-left: 14px;
  }

  .info__item:last-child {
    margin-right: 14px;
  }

  .info__value {
    font-size: 18px;
  }
}
</style>
