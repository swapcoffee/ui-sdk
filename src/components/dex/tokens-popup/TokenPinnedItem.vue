<template>
  <li
      class="pinned-list__item"
      :class="{ active_pinned: isActive }"
      @click="$emit('token-selected', item)"
  >
    <img :src="item?.image" alt="Pinned token logo" class="pinned-list__image" />
    <p class="pinned-list__name">
      {{ item?.symbol }}
    </p>
  </li>
</template>

<script lang="ts">
import {useDexStore} from "@/stores/dex";

export default {
  props: {
    item: {
      type: Object,
      required: true
    },
    mode: {
      type: String,
      required: true
    }
  },
  computed: {
    dexStore() {
      return useDexStore()
    },
    isActive() {
      return (
          (this.mode === 'first' && (this.dexStore.GET_SEND_TOKEN?.symbol === this.item.symbol || this.dexStore.GET_RECEIVE_TOKEN?.symbol === this.item.symbol)) ||
          (this.mode === 'second' && (this.dexStore.GET_SEND_TOKEN?.symbol === this.item.symbol || this.dexStore.GET_RECEIVE_TOKEN?.symbol === this.item.symbol))
      );
    }
  }
};
</script>

<style scoped>
.pinned-list__item {
  transition: 0.2s;
  display: flex;
  align-items: center;
  padding: 6px 10px 6px 6px;
  border-radius: 12px;
  outline: 1px solid var(--iface-white10);
  cursor: pointer;
  height: 36px;
}

.pinned-list__item:hover {
  background: var(--iface-white10);
}

.active_pinned {
  background: var(--iface-white10);
}

.pinned-list__image {
  margin-right: 6px;
  border-radius: 100px;
  width: 24px;
  height: 24px;
}

.pinned-list__name {
  font-size: 16px;
  font-family: Harmony-Medium, sans-serif;
}
</style>
