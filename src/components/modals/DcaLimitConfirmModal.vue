<template>
  <modal-wrapper class="modal" :title="getTitle"  @closeModal="$emit('closeModal')">
    <EarnModalFirstStep v-if="modalState.step === 1" :status="status" :details="getDetails" :ton-connect-ui="tonConnectUi"/>
  </modal-wrapper>
</template>

<script lang="ts">
import EarnModalFirstStep from "@/components/modals/EarnModalFirstStep.vue";
import { useDcaStore } from '@/stores/dca';
import { useLimitStore } from '@/stores/limit';
import { useTransactionStore } from '@/stores/transaction';
import ModalWrapper from "@/components/ui/ModalWrapper.vue";
import methodsMixins from "@/mixins/methodsMixins.ts";

export default {
  name: 'DcaLimitConfirmModal',
  mixins: [methodsMixins],
  props: {
    status: {
      type: String,
      required: true,
    },
    details: {
      type: Array,
      default() {
        return []
      },
    },
    tonConnectUi: {
      type: Object,
      default() {
        return {}
      },
    },
    modalState: { type: Object, required: true },
  },
  inject: ['interfaceAction'],
  components: {
    ModalWrapper,
    EarnModalFirstStep,
  },
  provide() {
    return {
      interfaceAction: this.interfaceAction,
      modalState: this.modalState,
    }
  },
  mounted() {

  },
  data() {
    return {
    };
  },
  computed: {
    dcaStore() {
      return useDcaStore();
    },
    limitStore() {
      return useLimitStore();
    },
    transactionStore() {
      return useTransactionStore();
    },
    transactionInfo() {
      return this.transactionStore.GET_LIMIT_TRANSACTION_INFO;
    },
    getTitle() {
      if (this.modalState.step === 1) {
        switch (this.modalState.mode) {
          case "dca":
            return this.$t("earnModal.createOrderTitle", { mode: "DCA" })
          case "limit":
            return this.$t("earnModal.createOrderTitle", { mode: "limit" })
          default:
            return "Confirm Order"
        }
      } else {
        return '';
      }
    },
    getDetails() {
      return this.details || [];
    },
    limitDetails() {
      return [
        {
          name: this.$t('transactionStatusModal.limitDetails.price'),
          value: this.getLimitSummary,
          symbol: ''
        },
        {
          name: this.$t('transactionStatusModal.limitDetails.buying'),
          value: this.getLimitBuying,
          symbol: ``
        },
        {
          name: this.$t('transactionStatusModal.limitDetails.suborders'),
          value: this.getLimitSuborders,
          symbol: ''
        },
        {
          name: this.$t('transactionStatusModal.limitDetails.created'),
          value: this.getLimitCreationDate,
          symbol: ''
        },
        {
          name: this.$t('transactionStatusModal.limitDetails.expiryTime'),
          value: 'Never',
          symbol: ''
        }
      ]
    },
    dcaDetails() {
      const details = [
        {
          name: this.$t('transactionStatusModal.dcaDetails.totalDeposited'),
          value: this.getDcaDeposit,
          symbol: ''
        },
        {
          name: this.$t('transactionStatusModal.dcaDetails.eachOrderSize'),
          value: this.getEachOrderSize,
          symbol: ``
        },
        {
          name: this.$t('transactionStatusModal.dcaDetails.orderCount'),
          value: this.getLimitSuborders,
          symbol: ''
        },
        {
          name: this.$t('transactionStatusModal.dcaDetails.created'),
          value: this.getLimitCreationDate,
          symbol: ''
        },
        {
          name: this.$t('transactionStatusModal.dcaDetails.estimatedEndDate'),
          value: this.getEstimatedEndDate,
          symbol: ''
        },
      ]
      if (this.dcaStore.GET_DCA_ENABLE_RANGE && this.dcaStore.GET_MIN_RANGE && this.dcaStore.GET_MAX_RANGE) {
        details.push({
          name: this.$t('limitHistoryDetails.dcaTitles.priceRange'),
          value: this.getPriceRange,
          symbol: ''
        })
      }
      return details
    },

    limitInfo() {
      return this.transactionInfo
    },
    getLimitSummary() {
      let first = this.limitInfo?.firstToken
      let second = this.limitInfo?.secondToken
      let calc = first.price_usd / second.price_usd
      let reverseCalc = first.price_usd / second.price_usd


      return `1 ${first?.symbol} = ${this.prettyNumber(calc, 2)} ${second?.symbol}`
    },
    getLimitBuying() {
      return `${this.prettyNumber(this.limitInfo?.secondAmount ?? 0, 2)} ${this.limitInfo?.secondToken?.symbol}`
    },
    getLimitSuborders() {
      if (this.modalState.mode === 'dca' && (!this.limitInfo?.maxSuborders || this.limitInfo?.maxSuborders < 2)) {
        return 2;
      }
      return this.limitInfo?.maxSuborders || 0;
    },
    getLimitCreationDate() {
      let date = new Date(Date.now())
      return `${date.toLocaleDateString()}, ${date.toLocaleTimeString()}`;
    },
    getDcaDeposit() {
      return `${this.prettyNumber( this.limitInfo?.firstAmount ?? 0, 2)} ${this.limitInfo?.firstToken?.symbol}`
    },
    getEachOrderSize() {
      let suborders = 2
      if (this.getLimitSuborders > 0) {
        suborders = this.getLimitSuborders
      }
      let calc = this.limitInfo?.firstAmount / suborders
      return `${calc} ${this.limitInfo?.firstToken?.symbol}`
    },
    getEstimatedEndDate() {
      let delay =
          this.getLimitSuborders > 1
              ? this.limitInfo?.intervalSec * (this.getLimitSuborders - 1)
              : 0

      let calcTimestamp = Date.now() + delay * 1000
      let date = new Date(calcTimestamp);
      return `${date.toLocaleDateString()}, ${date.toLocaleTimeString()}`;
    },
    getPriceRange() {
      const min = this.formatWithSeparatorsWithoutRounding(this.dcaStore.GET_MIN_RANGE, this.getPricePrecision(this.dcaStore.GET_MIN_RANGE))
      const max = this.formatWithSeparatorsWithoutRounding(this.dcaStore.GET_MAX_RANGE, this.getPricePrecision(this.dcaStore.GET_MAX_RANGE))
      return `${min} - ${max}`
    },
  },
};
</script>
