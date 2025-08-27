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
      <li
          class="tokens-popup__import-info"
          v-if="!isTokenInList"
          :style="{ backgroundColor: getBackgroundColor }"
      >
        <div
            class="tokens-popup__info-icon"
            :style="{ color: getImportNoticeTextColor }"
        >
          <InformationIcon />
        </div>
        <p
            class="tokens-popup__info-text"
            :style="{ color: getImportNoticeTextColor }"
        >
          {{ getImportNoticeText }}
        </p>
      </li>
    </ul>
    <div class="tokens-popup__button-wrapper">
      <button class="tokens-popup__import-btn" :disabled="isImportDisabled" @click="importTokenHandler">
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
  inject: ['importTokenHandler'],
  props: {
    unlistedToken: Object,
    userPinnedTokens: Array,
    userUnpinnedTokens: Array,
    tonPrice: Number
  },
  computed: {
    isImportDisabled() {
      return this.isTokenInList || this.unlistedToken?.verification === 'BLACKLISTED';
    },
    isTokenInList() {
      const friendlyAddress = this.unlistedToken?.address
      const rawAddress = this.toRawAddress(friendlyAddress)

      let find = this.userPinnedTokens.some((token) => token.address === rawAddress)

      if (!find) {
        find = this.userPinnedTokens.some((token) => token.address === friendlyAddress)
      }

      return !!find
    },
    getImportNoticeText() {
      const verification = this.unlistedToken?.verification

      switch (verification) {
        case 'COMMUNITY':
          return this.$t('dexTokens.importNotice')
        case 'UNKNOWN':
          return this.$t('dexTokens.importUnknown')
        case 'BLACKLISTED':
          return this.$t('dexTokens.importBlacklist')
        default:
          return this.$t('dexTokens.importNotice')
      }
    },
    getBackgroundColor() {
      const verification = this.unlistedToken?.verification

      switch (verification) {
        case 'UNKNOWN':
          return 'rgba(255, 207, 85, 0.08)'
        case 'BLACKLISTED':
          return 'rgba(234, 57, 67, 0.08)'
        case 'COMMUNITY':
        default:
          return 'var(--iface-white6)'
      }
    },
    getImportNoticeTextColor() {
      const verification = this.unlistedToken?.verification

      switch (verification) {
        case 'UNKNOWN':
          return 'rgba(255, 207, 85, 1)'
        case 'BLACKLISTED':
          return 'rgba(234, 57, 67, 1)'
        case 'COMMUNITY':
        default:
          return ''
      }
    }
  },
  methods: {
    toRawAddress(address) {
      try {
        if (address === 'native') {
          return 'TON';
        }
        const parsedAddress = Address.parseFriendly(address)
        return parsedAddress.address.toRawString()
      } catch (error) {
        return address
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
  display: flex;
  align-items: center;
  justify-content: center;
}

.tokens-popup__info-icon :deep(svg) {
  color: inherit;
}

.tokens-popup__info-icon :deep(svg path) {
  fill: currentColor;
}

.tokens-popup__info-text {
  font-size: 13px;
  line-height: 16px;
}

.tokens-popup__import-btn {
  transition: 0.2s;
  width: calc(100% - 40px);
  margin: 0 18px 20px 18px;
  padding: 12.5px 15px;
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