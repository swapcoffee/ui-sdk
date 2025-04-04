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

<script>

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
        (this.mode === 'SEND' && (this.dexStore.GET_SEND_TOKEN?.symbol === this.item.symbol || this.dexStore.GET_RECEIVE_TOKEN?.symbol === this.item.symbol)) ||
        (this.mode === 'RECEIVE' && (this.dexStore.GET_SEND_TOKEN?.symbol === this.item.symbol || this.dexStore.GET_RECEIVE_TOKEN?.symbol === this.item.symbol))
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
  padding: 5px 12px 5px 6px;
  border-radius: 20px;
  border: 1px solid var(--iface-white20);
  cursor: pointer;
}

.pinned-list__item:hover {
  background: var(--iface-white20);
  border: 1px solid var(--iface-white24);
}

.active_pinned {
  background: var(--iface-white20);
  border: 1px solid var(--iface-white24);
}

.theme-light .pinned-list__item {
  border: 1px solid var(--iface-white10);
}

.theme-light .pinned-list__item:hover {
  background: var(--iface-white10);
  border: 1px solid var(--iface-white14);
}

.theme-light .active_pinned {
  background: var(--iface-white10);
  border: 1px solid var(--iface-white14);
}

.pinned-list__image {
  margin-right: 8px;
  border-radius: 100px;
  width: 24px;
  height: 24px;
}

.pinned-list__name {
  font-size: 16px;
  font-family: Harmony-Medium, sans-serif;
}
</style>
