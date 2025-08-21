<template>
  <div class="navigation">
    <div class="navigation__group">
      <NavigationTab
          v-for="(item, index) in filteredNavActions"
          :key="index"
          :text="item.text"
          :class="{active: item.isActive}"
          @click="item.action"
      />
      <button class="navigation__select-btn"
              v-if="navActions.length > filteredNavActions.length"
              @click="showMore = !showMore"
      >
        <ChevronBottom
            :class="[{rotate: showMore}, 'chevron-icon']"
        />
      </button>
    </div>
    <DexNavigationModal
        :navActions="navActions"
        v-if="showMore"
        @closeNavigation="showMore = false"
    />
  </div>
</template>

<script lang="ts">
import ChevronBottom from "@/assets/earn/transfer-liquidity/ChevronBottom.vue";
import DexNavigationModal from "@/components/modals/DexNavigationModal.vue";
import computedMixins from "@/mixins/computedMixins";
import {useDexStore} from "@/stores/dex";
import {SwapActiveTab} from "@/utils/types.ts";
import NavigationTab from "@/components/general/NavigationTab.vue";

export default {
  name: "TradeNav",
  components: {DexNavigationModal, ChevronBottom, NavigationTab},
  data() {
    return {
      showMore: false,
      screenSize: window.innerWidth
    };
  },
  mixins: [computedMixins],
  inject: ["limitDcaVisibility"],
  computed: {
    dexStore() {
      return useDexStore();
    },
    navActions() {
      const actions = [
        {
          key: "swap",
          text: this.$t("dexNavigation.swap"),
          desc: this.$t("tradeMode.descriptions[0]"),
          action: () => this.dexStore.SET_SWAP_ACTIVE_TAB(SwapActiveTab.Dex),
          isActive: this.dexStore.GET_SWAP_ACTIVE_TAB === SwapActiveTab.Dex
        },
        {
          key: "limit",
          text: this.$t("dexNavigation.limit"),
          desc: this.$t("tradeMode.descriptions[1]"),
          action: () => this.dexStore.SET_SWAP_ACTIVE_TAB(SwapActiveTab.Limit),
          isActive: this.dexStore.GET_SWAP_ACTIVE_TAB === SwapActiveTab.Limit
        },
        {
          key: "dca",
          text: "DCA",
          desc: this.$t("tradeMode.descriptions[2]"),
          action: () => this.dexStore.SET_SWAP_ACTIVE_TAB(SwapActiveTab.DCA),
          isActive: this.dexStore.GET_SWAP_ACTIVE_TAB === SwapActiveTab.DCA
        },
        {
          key: "multi",
          text: "Multi",
          desc: this.$t("tradeMode.descriptions[0]"),
          action: () => this.dexStore.SET_SWAP_ACTIVE_TAB(SwapActiveTab.Multi),
          isActive: this.dexStore.GET_SWAP_ACTIVE_TAB === SwapActiveTab.Multi
        }
      ];

      return this.limitDcaVisibility
          ? actions
          : actions.filter((a) => !["limit", "dca"].includes(a.key));
    },
    filteredNavActions() {
      return this.screenSize > 576
          ? this.navActions.slice(0, 3)
          : this.navActions.filter((item) => item.isActive);
    }
  }
};
</script>

<style scoped>
.navigation__group {
  display: flex;
  align-items: center;
  gap: 0 6px;
}

.theme-light .coming-soon {
  mix-blend-mode: difference;
  filter: invert(0.7);
}

.navigation__select-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 12px;
  border: 1px solid var(--iface-white8);
  outline: none;
  background: transparent;
  backdrop-filter: blur(50px);
}

.chevron-icon {
  width: 20px;
  height: 20px;
  opacity: 0.6;
  transition: .2s;
}

.rotate {
  transform: rotateX(180deg);
}

</style>
