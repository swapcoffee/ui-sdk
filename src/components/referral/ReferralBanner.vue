<template>
  <div class="referral_banner banner">

      <div class="banner__background"></div>
      <div class="banner__background banner__background--blue" :class="{ 'visible': isBlueHover }"></div>
      <div class="banner__background banner__background--gold" :class="{ 'visible': isGoldHover }"></div>

      <div class="banner__figure-wrapper mobile">
          <img :src="mobileSrc" alt="figure" class="banner__figure">
      </div>

      <div class="banner__content">
          <h1 class="banner__heading">
            {{ $t('referral-banner.title') }}
          </h1>
          <p class="banner__description">
            {{ $t('referral-banner.description') }}
          </p>
          <div class="banner__button-block">
            <button
        class="banner__button connect-btn"
        v-if="!isWalletConnected"
        @click="connectWallet"
        @mouseover="changeImage('decorBanner2')"
        @mouseleave="resetImage"
      >
        <WalletIcon :isWhite="true"/>
        <span class="banner__button-text">
          {{ $t('referral-banner.connect-button') }}
        </span>
      </button>
      <router-link :to="{name: 'Claim' }"
        class="banner__button connect-btn"
        @mouseover="changeImage('decorBanner2')"
        @mouseleave="resetImage"
        v-else
      >
        <DiamondIcon />
        <span class="banner__button-text">
          {{ $t('referral-banner.claim-rewards') }}
        </span>
      </router-link>

              <a class="banner__link" href="https://t.me/addlist/tShqOXNZ89tmYTg8" target="_blank">
        <button
          class="banner__button"
          @mouseover="changeImage('decorBanner3')"
          @mouseleave="resetImage"
        >
          <TelegramIcon/>
          <span class="banner__button-text">
            {{ $t('referral-banner.detail-button') }}
          </span>
        </button>
      </a>
          </div>
      </div>

      <div class="banner__figure-wrapper desktop">
          <img :src="decorBanner2" alt="figure" class="banner__figure banner__figure-blue" :class="{ 'visible': isBlueHover }">
          <img :src="decorBanner3" alt="figure" class="banner__figure banner__figure-gold" :class="{ 'visible': isGoldHover }">
          <img :src="decorBanner1" alt="figure" class="banner__figure banner__figure-base">
      </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

import decorBannerMobile from "@/assets/referral/banner/referral-banner-mobile.png"
import decorBanner1 from "@/assets/referral/banner/referral-banner-gray.png"
import decorBanner2 from "@/assets/referral/banner/referral-banner-blue.png"
import decorBanner3 from "@/assets/referral/banner/referral-banner-yellow.png"

import TelegramIcon from "@/assets/referral/icons/TelegramIcon.vue";
import WalletIcon from "@/assets/earn/swap-interface/WalletIcon.vue";
import DiamondIcon from "@/assets/referral/icons/DiamondIcon.vue";

export default {
  name: "ReferralBanner",
  components: {
    WalletIcon,
    TelegramIcon,
    DiamondIcon
  },
  data() {
      return {
          isBlueHover: false,
          isGoldHover: false,
          decorBanner1,
          decorBanner2,
          decorBanner3,
          mobileSrc: decorBannerMobile
      }
  },
  props: {
      tonConnectUi: {
          type: Object,
          default() {
              return {};
          },
      },
  },
  computed: {
      ...mapGetters(['GET_DEX_WALLET']),
      isWalletConnected() {
          return this.GET_DEX_WALLET !== null;
      },
  },
  methods: {
      changeImage(image) {
          if (image === 'decorBanner2') {
              this.isBlueHover = true;
              this.isGoldHover = false;
          } else if (image === 'decorBanner3') {
              this.isGoldHover = true;
              this.isBlueHover = false;
          }
      },
      resetImage() {
          this.isBlueHover = false;
          this.isGoldHover = false;
      },
      connectWallet() {
          this.tonConnectUi.openModal();
      },
  }
}
</script>

<style scoped>
.referral_banner {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  overflow: hidden;
  width: 100%;
  max-width: 1100px;
  border-radius: 14px;
  height: 266px;
  padding: 0 30px;
  margin-bottom: 20px;
}

.banner__background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--iface-white4);
  transition: opacity 0.3s ease;
}

.banner__background--blue {
  opacity: 0;
  background: linear-gradient(0deg, rgba(255, 255, 255, 0.04), rgba(255, 255, 255, 0.04)),
  linear-gradient(90deg, rgba(255, 255, 255, 0) 0%, rgba(44, 149, 255, 0.08) 100%);
}

.banner__background--gold {
  opacity: 0;
  background: linear-gradient(0deg, rgba(255, 255, 255, 0.04), rgba(255, 255, 255, 0.04)),
  linear-gradient(90deg, rgba(255, 255, 255, 0) 0%, rgba(238, 149, 98, 0.08) 100%);
}

.banner__background.visible {
  opacity: 1;
}

.banner__figure-wrapper {
  position: absolute;
  right: -88px;
  top: 0;
  width: 486px;
  height: 486px;
  z-index: 2;
}

.banner__figure-wrapper.mobile {
  display: none;
}

.banner__figure {
  width: 82%;
  height: 55%;
  position: absolute;
  top: 0;
  left: 5px;
  transform-origin: center;
  transition: all 0.3s ease;
  filter: brightness(0.95) saturate(0.9);
  transform: scale(1);
}

.banner__figure-base {
  opacity: 1;
}

.banner__figure-blue,
.banner__figure-gold {
  opacity: 0;
}

.banner__figure-blue.visible {
  opacity: 1;
  transform: scale(1.05);
  filter: brightness(1.03) saturate(1.1) hue-rotate(-5deg);
}

.banner__figure-gold.visible {
  opacity: 1;
  transform: scale(1.03);
  filter: brightness(1.03) saturate(1.1) hue-rotate(5deg);
}

.banner__figure-blue.visible ~ .banner__figure-base,
.banner__figure-gold.visible ~ .banner__figure-base {
  opacity: 0;
}

.banner__link {
  width: max-content;
}

.banner__content {
  position: relative;
  z-index: 3;
}

.banner__heading {
  font-family: Harmony-Medium, sans-serif;
  margin-bottom: 10px;
  font-size: 36px;
  font-weight: 500;
}

.banner__description {
  margin-bottom: 30px;
  font-size: 14px;
  opacity: 0.8;
  max-width: 584px;
  position: relative;
}

.banner__button-block {
  display: flex;
  align-items: center;
  gap: 14px;
}

.banner__button {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 44px;
  padding: 10px 20px 10px 14px;
  border-radius: 12px;
  border: none;
  outline: none;
  background: var(--iface-white8);
  font-size: 14px;
  font-weight: 500;
  min-width: max-content;
  transition: .3s;
}

.banner__button-text {
  margin-top: 1px;
}

.banner__button:hover {
  background: var(--iface-white12);
}


.connect-btn {
  background: var(--iface-accent-color);
}

.theme-light .connect-btn {
    color: #fff;
}

.connect-btn:hover {
  background: var(--iface-accent-hover);
}

@media screen and (max-width: 1180px) {
  .referral_banner {
      max-width: unset;
  }
}

@media screen and (max-width: 1220px) {
  .banner__figure {
      width: 82%;
      height: 55%;
      object-fit: contain;
  }

  .referral_banner {
      max-width: 100%;
  }
}

@media screen and (max-width: 576px) {
  .referral_banner {
      flex-direction: column;
      height: auto;
      align-items: center;
      text-align: center;
      background: var(--earn-bg);
      padding: 14px !important;
      border-radius: 20px;
      margin-bottom: 14px;
  }

  .theme-coffee .referral_banner {
    background: var(--main-bg-color);
  }

  .banner__link {
    width: 100%;
  }

  .banner__background {
    background: transparent;
  }

  .banner__figure-wrapper.desktop {
      display: none;
  }

  .banner__figure-wrapper.mobile {
      display: block;
      width: 185px;
      height: 185px;
      margin: 16px auto 6px;
      position: static;
      right: auto;
      top: auto;
  }

  .banner__figure {
      position: relative;
      width: 100%;
      height: 100%;
  }

  .banner__content {
      width: 100%;
  }

  .banner__button-block {
      flex-direction: column;
      width: 100%;
      gap: 10px;
  }

  .banner__button {
      width: 100%;
      justify-content: center;
  }

    .banner__heading {
        font-size: 26px;
        margin-bottom: 6px;
    }

    .banner__description {
        margin-bottom: 20px;
    }
}
</style>
