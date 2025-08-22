<template>
  <div ref="limit_details" class="dex__details" :class="{ active: showMore }">
    <div class="dex__switch" @click="toggleDetails">
      <div class="dex__group">
        <p class="dex__title">
          {{ 'More details' }}
        </p>
      </div>
      <ChevronBottom class="arrow-icon"/>
    </div>
    <div class="dex__more-info">
      <DetailsItem
          v-for="(item, index) in getDetails"
          :key="index"
          :title="item.title"
          :text="item.text"
          :textColor="item.textColor"
      />
    </div>
  </div>
</template>

<script lang="ts">
import {useDexStore} from '@/stores/dex';
import {useDexSettingsStore} from '@/stores/dex/settings';
import TooltipWrapper from '@/components/ui/TooltipWrapper.vue';
import transactionRoutesMixin from '@/mixins/transactionRoutesMixin.ts';
import methodsMixins from '@/mixins/methodsMixins.ts';
import DetailsIcon from "@/assets/earn/swap-interface/DetailsIcon.vue";
import ChevronBottom from "@/assets/earn/transfer-liquidity/ChevronBottom.vue";
import DetailsItem from "@/components/general/DetailsItem.vue";

export default {
  name: 'MultiSwapDetails',
  components: {DetailsItem, ChevronBottom, DetailsIcon, TooltipWrapper},
  mixins: [transactionRoutesMixin, methodsMixins],
  data() {
    return {
      isReverse: false,
      showMore: false,
      tooltipList: [],
    };
  },
  inject: ['tokenValues'],
  computed: {
    dexStore() {
      return useDexStore();
    },
    dexSettingsStore() {
      return useDexSettingsStore();
    },
    getDetails() {
      return [
        {
          title: this.$t('dexDetails.priceImpact.name'),
          text: this.displayPriceImpact,
          textColor: this.getPriceImpactColor,
        },
        {
          title: this.$t('dexDetails.minimumReceive.name'),
          text: this.displayMinimumReceive,
        },
        {
          title: this.$t('dexDetails.fee.name'),
          text: this.displayBlockchainFee,
        },
        {
          title: this.$t('dexDetails.mev.name'),
          text: this.getMevProtectionFee,
          display: this.displayConditionMevProtection
        },
        {
          title: this.$t('dexDetails.economy'),
          text: this.displayProfit,
          textColor: 'green'
        },
        {
          title: this.$t('dexNavigation.cashback'),
          text: this.getEstimatedCashbackAndFee.cashback,
          textColor: 'green'
        },
      ]
    },
    getPriceImpact() {
      if (this.dexStore.GET_CALCULATED_PI) {
        return this.dexStore.GET_CALCULATED_PI;
      }
      return 0;
    },
    displayPriceImpact() {
      let pi = this.getPriceImpact;
      return (pi > 0 ? `+${pi}` : pi) + '%';
    },
    displayMinimumReceive() {
      let slippagePercentage = this.dexSettingsStore.GET_SLIPPAGE;
      let receiveAmount = this.dexStore.GET_DEAL_CONDITIONS?.total_output_amount;
      let minimumReceive = receiveAmount - (receiveAmount * slippagePercentage) / 100;

      return `${this.prettyNumber(minimumReceive, 2)} ${this.dexStore.GET_RECEIVE_MULTI_TOKEN?.symbol}`;
    },
    getMevProtectionFee() {
      const fee = this.dexStore.GET_DEAL_CONDITIONS?.total_mev_protection_fee;
      return fee ? `${fee} TON` : '0 TON';
    },
    displayConditionMevProtection() {
      return Boolean(this.dexSettingsStore.GET_MEV_PROTECTION_VALUE && this.dexStore.GET_DEAL_CONDITIONS?.total_mev_protection_fee);
    },
    displayBlockchainFee() {
      let gasFee = 0;

      if (this.dexStore.GET_DEAL_CONDITIONS?.routes && Array.isArray(this.dexStore.GET_DEAL_CONDITIONS.routes)) {
        this.dexStore.GET_DEAL_CONDITIONS.routes.forEach((item) => {
          gasFee += item?.recommended_gas * 1.0 || 0;
        });
      }

      return this.$t('dexDetails.fee.text', {gasFee: gasFee.toFixed(3)});
    },
    displayProfit() {
      const savings = this.dexStore.GET_DEAL_CONDITIONS?.total_savings || 0;

      if (isNaN(savings)) {
        return '0%';
      }

      let profit = (savings * 100).toFixed(2);
      return (Number(profit) > 100 ? '>100' : profit) + '%';
    },
    getEstimatedCashbackAndFee() {
      const cashback = this.dexStore.GET_DEAL_CONDITIONS?.total_estimated_cashback_usd || 0;
      const partnerFee = this.dexStore.GET_DEAL_CONDITIONS?.partner_commission_ton || 0;

      const formatAmount = (value, prefix = '') => {
        if (value > 0 && !isNaN(value)) {
          let count = 2;
          while (Number(value.toFixed(count)) <= 0 && count < 10) {
            count++;
          }
          return `${prefix}${value.toFixed(count)}`;
        }
        return '';
      };

      return {
        cashback: formatAmount(cashback, '≈ $') || '0',
        fee: !!partnerFee ? formatAmount(partnerFee, '≈ ') + ' TON' : null
      };
    },
    getPriceImpactColor() {
      const pi = this.getPriceImpact;
      if (pi <= -5) {
        return 'red';
      } else if (pi <= -1) {
        return 'yellow';
      } else {
        return 'green';
      }
    }
  },
  watch: {
    showMore: {
      handler() {
        if (this.showMore === true) {
          setTimeout(() => {
            this.$refs.limit_details.classList.add('visible');
          }, 300);
        } else {
          this.$refs.limit_details.classList.remove('visible');
        }
      },
    },
  },
  methods: {
    toggleDetails() {
      this.showMore = !this.showMore;
      const walletAddress = this.dexStore.GET_DEX_WALLET?.address;
    },
  },
};
</script>

<style scoped>
.tooltip-enter-active,
.tooltip-leave-active {
  transition: 0.1s ease-out;
}

.tooltip-enter-from,
.tooltip-leave-to {
  opacity: 0;
}

.slide-enter-active,
.slide-leave-active {
  transition: 0.2s ease-out;
}

.slide-enter-from,
.slide-leave-to {
  margin-bottom: -240px;
  transform-origin: top;
  transform: scaleY(0.01) translateY(-120px);
}

.dex__details {
  transition: height 0.3s ease-out,
  overflow 2s;
  height: 20px;
  overflow: hidden;
}

.active {
  height: 140px;
}

.visible {
  overflow: visible;
}

.dex__switch {
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  padding: 0 5px;
}

.arrow-icon {
  width: 18px;
  height: 18px;
}

.active .arrow-icon {
  transform: rotateX(180deg);
}

.dex__title {
  display: flex;
  align-items: center;
  flex-wrap: nowrap;
  gap: 4px;
  font-size: 14px;
  font-family: Harmony-Regular, sans-serif;
  white-space: nowrap;
}

.dex__more-info {
  display: flex;
  flex-direction: column;
  gap: 10px 0;
  margin-top: 14px;
  padding: 0 5px;
}

.dex__group {
  display: flex;
  flex-direction: row;
  align-items: center;
}

@media screen and (max-width: 640px) {
  .dex__details {
    position: relative;
  }

  .icon-wrapper {
    position: static;
  }
}
</style>
