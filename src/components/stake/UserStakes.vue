<template>
  <div class="user__stakes">
    <StakeItem
        :tonConnectUi="tonConnectUi"
        v-for="(position, index) in sortedPositions"
        :key="position.id"
        :position="position"
    />
  </div>
</template>

<script>
import {mapGetters} from "vuex";
import StakeItem from "@/components/stake/StakeItem.vue";

export default {
  name: "UserStakes",
  components: {StakeItem},
  props: {
    tonConnectUi: {
      type: Object,
      default() {
        return {}
      }
    },
  },
  methods: {
  },
  computed: {
    ...mapGetters(['GET_STAKE_WALLET_INFO']),
    sortedPositions() {
      return this.GET_STAKE_WALLET_INFO?.positions
          ? [...this.GET_STAKE_WALLET_INFO.positions].sort((a, b) => a.start_lock_seconds_utc - b.start_lock_seconds_utc)
          : [];
    }
  }
}
</script>

<style scoped>
.user__stakes {
    width: 100%;
    display: flex;
    gap: 6px;
    flex-direction: column;
}
</style>
