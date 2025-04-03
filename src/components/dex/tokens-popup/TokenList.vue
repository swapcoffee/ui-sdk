<template>
  <ul class="tokens-popup__list">
    <li class="tokens-popup__list-title">
      {{ title }}
    </li>
    <TokenItem
      v-for="(item, index) in tokenList"
      :key="item.id"
      :item="item"
      :userPinnedTokens="userPinnedTokens"
      :userUnpinnedTokens="userUnpinnedTokens"
      :tonPrice="tonPrice"
      :class="generateClass(item, index)"
      @click="chooseToken(item)"
      @pinToken="pinToken"
      @unpinToken="unpinToken"
    />
  </ul>
</template>

<script lang="ts">
import TokenItem from '@/components/dex/tokens-popup/TokenItem.vue';

export default {
  name: 'TokenList',
  components: {
    TokenItem
  },
  props: {
    title: {
      type: String,
      required: true
    },
    tokenList: {
      type: Array,
      required: true
    },
    mode: {
      type: String,
      required: true
    },
    userPinnedTokens: Array,
    userUnpinnedTokens: Array,
    tonPrice: Number,
    activeFilter: Object
  },
  computed: {
    ...mapGetters([
      'GET_RECEIVE_TOKEN',
      'GET_SEND_TOKEN'
    ]),
  },
  methods: {
    chooseToken(item) {
      this.$emit('chooseToken', item);
    },
    pinToken(item) {
      this.$emit('pinToken', item);
    },
    unpinToken(item) {
      this.$emit('unpinToken', item);
    },
    generateClass(item, index) {
      const baseClass = 'token_' + (index + 1);
      const isActiveToken =
        (this.mode === 'SEND' && (this.GET_SEND_TOKEN?.symbol === item.symbol || this.GET_RECEIVE_TOKEN?.symbol === item.symbol)) ||
        (this.mode === 'RECEIVE' && (this.GET_SEND_TOKEN?.symbol === item.symbol || this.GET_RECEIVE_TOKEN?.symbol === item.symbol));
      return [
        baseClass,
        {'active_item': isActiveToken}
      ];
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
