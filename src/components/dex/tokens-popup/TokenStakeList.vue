<template>
  <ul class="tokens-popup__list" v-if="stakeItems.length > 0">
    <li class="tokens-popup__list-title">
      {{ title }}
    </li>
    <TokenItem
        v-for="(item, index) in stakeItems"
        :key="index"
        :item="item"
        :isStakingPage="isStakingPage"
        :userPinnedTokens="userPinnedTokens"
        :userUnpinnedTokens="userUnpinnedTokens"
        :tonPrice="tonPrice"
        :isLastItem="index === stakeItems.length - 1"
        :totalItems="stakeItems.length"
        :class="{ active_item: isActiveItem(item) }"
        @click="chooseTokenHandler(item)"
    />
  </ul>
</template>

<script lang="ts">
import TokenItem from '@/components/dex/tokens-popup/TokenItem.vue';
import {useDexStore} from "@/stores/dex";

export default {
  name: 'StakeTokenList',
  components: {
    TokenItem,
  },
  inject: ['chooseTokenHandler'],
  props: {
    stakeItems: {
      type: Array,
      required: true,
    },
    isStakingPage: {
      type: Boolean,
      default: false,
    },
    userPinnedTokens: Array,
    userUnpinnedTokens: Array,
    tonPrice: Number,
    title: String,
    mode: String
  },
  computed: {
    dexStore() {
      return useDexStore()
    }
  },
  methods: {
    isActiveItem(item) {
      return this.mode === 'first' && this.dexStore.GET_SEND_TOKEN?.symbol === item.symbol ||
          this.mode === 'second' && this.dexStore.GET_RECEIVE_TOKEN?.symbol === item.symbol;
    }
  }
};
</script>

<style scoped>
.tokens-popup__list {
  margin-top: 20px;
}

.tokens-popup__list-title {
  margin-bottom: 10px;
  padding: 0 20px;
  font-size: 14px;
  opacity: 0.8;
}
</style>
