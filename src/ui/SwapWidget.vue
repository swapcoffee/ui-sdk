<template>
  <div class="dex">
    <div class="dex__group dex__group-centered">
      <div class="dex__column-flex hidden">
        <div id="limit_history" class="dex__history"></div>
      </div>
      <div class="dex__content">
        <DexPageTest
            :screen-size="600"
            v-if="dexStore.GET_SWAP_ACTIVE_TAB === SwapActiveTab.Dex"
            :ton-connect-ui="tonConnect"
        />
        <DcaPage
            :screen-size="600"
            v-if="dexStore.GET_SWAP_ACTIVE_TAB === SwapActiveTab.DCA"
            :ton-connect-ui="tonConnect"
        />
        <LimitPage
            :screen-size="600"
            v-if="dexStore.GET_SWAP_ACTIVE_TAB === SwapActiveTab.Limit"
            :ton-connect-ui="tonConnect"
        />
        <MultiSwapPage
            :screen-size="600"
            v-if="dexStore.GET_SWAP_ACTIVE_TAB === SwapActiveTab.Multi"
            :ton-connect-ui="tonConnect"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {throttle} from "@/helpers/perfomance/perfomance";

import {useDexStore} from "@/stores/dex";

import {SwapActiveTab} from "@/utils/types.ts";

import DexPageTest from "@/ui/dex/DexPageTest.vue";
import DcaPage from "@/ui/dca/DcaPage.vue";
import LimitPage from "@/ui/limit/LimitPage.vue";
import MultiSwapPage from "@/ui/multi/MultiSwapPage.vue";

export default {
  name: "DexContainer",
  components: {MultiSwapPage, LimitPage, DcaPage, DexPageTest},
  data() {
    return {
      screenSize: window.innerWidth,
    };
  },
  props: {
    tonConnect: {
      type: Object,
      required: true,
    },
  },
  computed: {
    SwapActiveTab() {
      return SwapActiveTab
    },
    dexStore() {
      return useDexStore()
    }
  },
  methods: {
    checkWindowSize() {
      this.screenSize = window.innerWidth;
    },
  },
  mounted() {
    window.addEventListener("resize", throttle(this.checkWindowSize, 100));
  },
  beforeUnmount() {
    window.removeEventListener("resize", this.checkWindowSize);
  },
};
</script>

<style scoped>
.dex {
  display: flex;
  width: 100%;
  max-width: 100%;
}

.dex__group {
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 100%;
}

.dex__column-flex {
  display: flex;
  flex-direction: column;
  gap: 14px;
  width: 100%;
  max-width: 100%;
}


.hidden {
  width: 0;
}
</style>
