<template>
  <div class="modal__liquidity">
    <ModalDetails :detailsTitle="getTitle" :poolDetails="[]" :status="status" size="medium" :withDcaLimitDetails="details"/>
    <button class="modal__button" :disabled="isDisabled" @click="earnAction">
      {{ getButtonText }}
    </button>
  </div>
</template>

<script lang="ts">
import ModalDetails from "@/components/general/ModalDetails.vue"

export default {
  name: "EarnModalFirstStep",
  components: {
    ModalDetails,
  },
  props: {
    status: {
      type: String,
      default() {
        return ""
      },
    },
    details: {
      type: Array,
      required: true,
    },
    tonConnectUi: {
      type: Object,
      default() {
        return {}
      },
    },
  },
  inject: ["interfaceAction", "modalState"],
  data() {
    return {}
  },
  computed: {
    isDisabled() {
      return false;
    },
    getTitle() {
      switch (this.modalState.mode) {
        case 'limit':
          return this.$t('modalStatusSteps.detailsTitle.limit');
        case 'dca':
          return 'DCA'
        default:
          return 'Order Details'
      }
    },
    getButtonText() {
      switch (this.modalState.mode) {
        case "limit":
        case "dca":
          return this.$t('dexButton.createOrder')
        default:
          return this.$t('dexButton.createOrder')
      }
    },
  },
  methods: {
    earnAction() {
      this.interfaceAction(this.modalState.mode)
    },
  },
  mounted() {},
}
</script>

<style scoped>
.modal__button {
  width: 100%;
  height: 44px;
  margin-top: 20px;
  border-radius: 12px;
  border: none;
  outline: none;
  background: var(--iface-accent-color);
  backdrop-filter: blur(20px);
  font-size: 14px;
  line-height: normal;
  font-weight: 500;
  transition: 0.2s;
  color: #fff;
}

.modal__button:hover {
  background: var(--iface-accent-hover);
}

.modal__button:disabled {
  background: var(--iface-white10);
  cursor: not-allowed;
}
</style>
