<template>
  <div class="tokens-popup__import-flex">
    <ul class="tokens-popup__group">
      <TokenItem
        :item="unlistedToken"
        :userPinnedTokens="userPinnedTokens"
        :userUnpinnedTokens="userUnpinnedTokens"
        :status="'unlisted'"
        :tonPrice="tonPrice"
      />
      <li class="tokens-popup__import-info" v-if="!isTokenInList">
        <InformationIcon class="tokens-popup__info-icon" />
        <p class="tokens-popup__info-text">
          {{ $t('dexTokens.importNotice') }}
        </p>
      </li>
    </ul>
    <div class="tokens-popup__button-wrapper">
      <button class="tokens-popup__import-btn" :disabled="isTokenInList" @click="importToken">
        {{ $t('dexTokens.importBtn') }}
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import TokenItem from '@/components/dex/tokens-popup/TokenItem.vue';
import InformationIcon from '@/assets/dex/icons/InformationIcon.vue';
import { Address } from '@ton/core';

export default {
  name: 'TokenUnlisted',
  components: {
    TokenItem,
    InformationIcon
  },
  props: {
    unlistedToken: Object,
    userPinnedTokens: Array,
    userUnpinnedTokens: Array,
    tonPrice: Number
  },
  computed: {
    isTokenInList() {
      const friendlyAddress = this.unlistedToken?.address;
      const rawAddress = this.toRawAddress(friendlyAddress);

      let find = this.userPinnedTokens.some((token) => token.address === rawAddress);

      if (!find) {
        find = this.userPinnedTokens.some((token) => token.address === friendlyAddress);
      }

      return !!find;
    }
  },
  methods: {
    importToken() {
      this.$emit('importToken');
    },
    toRawAddress(address) {
      try {
        if (address === 'native') {
          return 'TON';
        }
        const parsedAddress = Address.parseFriendly(address);
        return parsedAddress.address.toRawString();
      } catch (error) {
        return address;
      }
    }
  }
}
</script>

<style scoped>
.tokens-popup__import-flex {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding-top: 20px;
}

.tokens-popup__import-info {
  display: flex;
  align-items: center;
  margin: 8px 18px;
  padding: 14px;
  border-radius: 20px;
  background: var(--iface-white6);
}

.tokens-popup__info-icon {
  margin-right: 14px;
  min-width: 32px;
  min-height: 32px;
  border-radius: 100px;
}

.tokens-popup__info-text {
  font-size: 13px;
  line-height: 16px;
}

.tokens-popup__import-btn {
  transition: 0.2s;
  width: calc(100% - 40px);
  margin: 0 18px 20px 18px;
  padding: 19px 18px 18px 18px;
  outline: none;
  border: none;
  border-radius: 14px;
  background: var(--iface-accent-color);
  font-size: 16px;
  line-height: 19px;
  color: #fff;
}

.tokens-popup__import-btn:hover {
  background: var(--iface-accent-hover);
}

.tokens-popup__import-btn:disabled {
  background: #ffffff1a;
  color: rgba(255, 255, 255, 0.5);
}

@media screen and (max-width: 960px) {
  .tokens-popup__button-wrapper {
    position: fixed;
    z-index: 100;
    bottom: 0;
    left: 0;
    right: 0;
  }
}
</style>
