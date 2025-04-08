<template>
  <div class="dex">
    <div class="dex__group dex__group-centered">
      <div class="dex__column-flex hidden">
        <div id="limit_history" class="dex__history"></div>
      </div>
      <div class="dex__content">
        <DexPageTest :screen-size="600" v-if="dexStore.GET_SWAP_ACTIVE_TAB === SwapActiveTab.Dex" />
        <DcaPage :screen-size="600" v-if="dexStore.GET_SWAP_ACTIVE_TAB === SwapActiveTab.DCA" />
        <LimitPage screen-size="600" v-if="dexStore.GET_SWAP_ACTIVE_TAB === SwapActiveTab.Limit" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { throttle } from "@/helpers/perfomance/perfomance";
import DexPageTest from "@/ui/dex/DexPageTest.vue";
import {useDexStore} from "@/stores/dex";
import {SwapActiveTab} from "@/utils/types.ts";
import DcaPage from "@/ui/dca/DcaPage.vue";
import LimitPage from "@/ui/limit/LimitPage.vue";

export default {
  name: "DexContainer",
  components: {LimitPage, DcaPage, DexPageTest },
  data() {
    return {
      screenSize: window.innerWidth,
    };
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
}

.dex__group {
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin: 0 auto;
}

.dex__column-flex {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.dex__history {
  width: 686px;
}

.hidden {
  width: 0;
}
</style>
