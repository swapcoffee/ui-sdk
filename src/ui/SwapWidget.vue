<template>
  <div class="dex">
    <h1 class="dex__heading">DEX Aggregator</h1>
    <div class="dex__group dex__group-centered">
      <div class="dex__column-flex hidden">
        <div id="limit_history" class="dex__history"></div>
      </div>
      <div class="dex__content">
        <DexPage/>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { throttle } from "@/helpers/perfomance/perfomance";
import DexPage from "@/ui/dex/DexPage.vue";

export default {
  name: "DexContainer",
  components: { DexPage },
  data() {
    return {
      screenSize: window.innerWidth,
    };
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
