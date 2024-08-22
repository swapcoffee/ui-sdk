<template>
  <div class="title__button-block">
    <button class="title__choose-btn"
            :class="{ active: getRouteName === 'Dex' }"
            @click="linkTo('Dex')"
    >
      {{ $t("dexNavigation.swap") }}
    </button>
    <button class="title__choose-btn disabled"
            :class="{ active: getRouteName === 'Limit' }"
            @click="linkTo('Limit')"
    >
      {{ $t("dexNavigation.limit") }}
      <img src="@/assets/main/coming-soon.svg" alt="soon" class="coming-soon">
    </button>
  </div>
</template>

<script lang="ts">
import computedMixins from "@/mixins/computedMixins";

export default {
  name: "TradeNav",
  mixins: [computedMixins],
  computed: {
    getRouteName() {
      return this.$route.name;
    }
  },
  methods: {
    linkTo(value: string) {
      this.$router.push({ name: value, query: this.$route.query });
    }
  }
}
</script>

<style scoped>
.title__button-block {
  display: flex;
  align-items: center;
  gap: 0 6px;
}

.title__choose-btn {
  position: relative;
  transition: .2s;
  height: 36px;
  padding: 0 20px;
  border-radius: 14px;
  border: 1px solid transparent;
  letter-spacing: 0.1px;
  font-weight: 500;
  outline: none;
  background: var(--iface-white4);
  font-size: 14px;
  line-height: 16px;
}

.title__choose-btn::after {
  content: "";
  position: absolute;
  left: 50%;
  bottom: 0;
  transform: translateX(-50%);
  width: 45%;
  height: 3px;
  background-color: transparent;
  border-radius: 2px 2px 0 0;
  transition: .2s;
}

.title__choose-btn.active::after {
  background-color: var(--iface-accent-color);
}

.active {
  background: var(--iface-white6);
  opacity: 1;
}

.disabled {
  pointer-events: none;
  cursor: not-allowed;
}

.coming-soon {
  position: absolute;
  top: -5px;
  right: -10px;
  width: 30px;
  height: 30px;
}

.theme-light .coming-soon {
  mix-blend-mode: difference;
  filter: invert(.7);
}

@media screen and (max-width: 860px) {
  .title__button-block {
    padding: 12px 10px;
    border-bottom: 1px solid var(--iface-white6);
  }

  .title__choose-btn {
    margin-right: 6px;
  }
}
</style>
