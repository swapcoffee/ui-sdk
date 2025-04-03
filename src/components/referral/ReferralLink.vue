<template>
  <div class="link">
    <div class="link__button-block">
      <button class="link__button link__button--qr" @click="showQr">
        <ReferralIcon class="btn-icon"/>
        <p>
          {{ $t('referralLink.qrBtn') }}
        </p>
      </button>
      <button class="link__button link__button--copy" @click="copyLink">
        <LinkIcon class="btn-icon"/>
        <p>
          {{ $t('referralLink.copyBtn') }}
        </p>
      </button>
    </div>
  </div>
  <app-notification v-show="showNotification" @close-copy-notification="closeCopyNotification">
    {{ $t('referralLink.linkCopied') }}
  </app-notification>
  <transition name="slide">
    <div v-if="qrVisible" class="popup-background" @click.self="closeQr">
      <div class="qr__popup">
        <div class="close__icon">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            @click="closeQr"
          >
            <g opacity="0.8">
              <path
                d="M19.2806 18.2194C19.3502 18.2891 19.4055 18.3718 19.4432 18.4629C19.4809 18.5539 19.5003 18.6515 19.5003 18.7501C19.5003 18.8486 19.4809 18.9462 19.4432 19.0372C19.4055 19.1283 19.3502 19.211 19.2806 19.2807C19.2109 19.3504 19.1281 19.4056 19.0371 19.4433C18.9461 19.4811 18.8485 19.5005 18.7499 19.5005C18.6514 19.5005 18.5538 19.4811 18.4628 19.4433C18.3717 19.4056 18.289 19.3504 18.2193 19.2807L11.9999 13.0604L5.78055 19.2807C5.63982 19.4214 5.44895 19.5005 5.24993 19.5005C5.05091 19.5005 4.86003 19.4214 4.7193 19.2807C4.57857 19.1399 4.49951 18.9491 4.49951 18.7501C4.49951 18.551 4.57857 18.3602 4.7193 18.2194L10.9396 12.0001L4.7193 5.78068C4.57857 5.63995 4.49951 5.44907 4.49951 5.25005C4.49951 5.05103 4.57857 4.86016 4.7193 4.71943C4.86003 4.5787 5.05091 4.49963 5.24993 4.49963C5.44895 4.49963 5.63982 4.5787 5.78055 4.71943L11.9999 10.9397L18.2193 4.71943C18.36 4.5787 18.5509 4.49963 18.7499 4.49963C18.949 4.49963 19.1398 4.5787 19.2806 4.71943C19.4213 4.86016 19.5003 5.05103 19.5003 5.25005C19.5003 5.44907 19.4213 5.63995 19.2806 5.78068L13.0602 12.0001L19.2806 18.2194Z"
                fill="white"
              />
            </g>
          </svg>
        </div>
        <div class="qr__wrapper">
          <qrcode-vue v-if="qrCodeUrl !== null" :value="qrCodeUrl" :size="180" level="H" />
          <div class="img__wrapper">
            <img src="@/assets/header/swap-logo-mob.svg" class="qr__img" />
          </div>
        </div>
        <div class="popup__content">
          <p class="popup__title">{{ $t('qr-modal.title') }}</p>
          <p class="popup__subtitle">{{ $t('qr-modal.description') }}</p>
        </div>
        <button class="link__button" @click="copyLink">
          <svg
            class="link__btn-icon"
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
          >
            <path
              d="M10.7453 14.5594C10.8624 14.6766 10.9282 14.8355 10.9282 15.0012C10.9282 15.1669 10.8624 15.3258 10.7453 15.443L9.9687 16.2243C9.14746 17.045 8.03383 17.5059 6.87279 17.5055C5.71175 17.5051 4.59841 17.0436 3.77768 16.2223C2.95696 15.4011 2.49609 14.2874 2.49646 13.1264C2.49683 11.9654 2.9584 10.852 3.77964 10.0313L5.66401 8.14692C6.45283 7.35748 7.51352 6.89932 8.62903 6.86621C9.74454 6.8331 10.8305 7.22753 11.6648 7.9688C11.7264 8.02338 11.7766 8.08955 11.8125 8.16353C11.8485 8.23752 11.8696 8.31786 11.8745 8.39998C11.8794 8.48211 11.8682 8.5644 11.8413 8.64215C11.8144 8.71991 11.7725 8.79162 11.7179 8.85318C11.6633 8.91473 11.5972 8.96494 11.5232 9.00092C11.4492 9.03691 11.3689 9.05796 11.2867 9.0629C11.2046 9.06783 11.1223 9.05654 11.0446 9.02967C10.9668 9.0028 10.8951 8.96088 10.8335 8.9063C10.2377 8.37716 9.46222 8.09564 8.66569 8.11932C7.86916 8.14299 7.11176 8.47006 6.54839 9.03364L4.66401 10.9157C4.07784 11.5018 3.74854 12.2969 3.74854 13.1258C3.74854 13.9548 4.07784 14.7498 4.66401 15.336C5.25018 15.9222 6.0452 16.2515 6.87417 16.2515C7.70314 16.2515 8.49816 15.9222 9.08433 15.336L9.86089 14.5594C9.91893 14.5013 9.98786 14.4552 10.0637 14.4238C10.1396 14.3923 10.2209 14.3761 10.3031 14.3761C10.3852 14.3761 10.4665 14.3923 10.5424 14.4238C10.6183 14.4552 10.6872 14.5013 10.7453 14.5594ZM16.2203 3.77818C15.3989 2.95866 14.286 2.49841 13.1257 2.49841C11.9655 2.49841 10.8526 2.95866 10.0312 3.77818L9.25464 4.55552C9.13747 4.67279 9.07168 4.83181 9.07175 4.99759C9.07183 5.16337 9.13775 5.32233 9.25503 5.4395C9.3723 5.55667 9.53132 5.62246 9.6971 5.62239C9.86288 5.62231 10.0218 5.55639 10.139 5.43911L10.9156 4.66255C11.5017 4.07638 12.2968 3.74707 13.1257 3.74707C13.9547 3.74707 14.7497 4.07638 15.3359 4.66255C15.9221 5.24872 16.2514 6.04374 16.2514 6.87271C16.2514 7.70168 15.9221 8.49669 15.3359 9.08286L13.4515 10.9688C12.8878 11.5321 12.1303 11.8587 11.3337 11.8819C10.5372 11.9052 9.76191 11.6232 9.16636 11.0938C9.1048 11.0392 9.03309 10.9973 8.95534 10.9704C8.87758 10.9436 8.79529 10.9323 8.71317 10.9372C8.54731 10.9472 8.39221 11.0226 8.28198 11.1469C8.2274 11.2085 8.18548 11.2802 8.15861 11.3579C8.13174 11.4357 8.12045 11.518 8.12538 11.6001C8.13535 11.766 8.21079 11.9211 8.33511 12.0313C9.16917 12.7728 10.2551 13.1675 11.3706 13.1347C12.4861 13.1018 13.5469 12.644 14.3359 11.8547L16.2203 9.97036C17.0403 9.14894 17.5008 8.03571 17.5008 6.87505C17.5008 5.71439 17.0403 4.60116 16.2203 3.77974V3.77818Z"
              fill="white"
            />
          </svg>
          {{ $t('referralLink.copyBtn') }}
        </button>
      </div>
    </div>
  </transition>
</template>

<script>
import { mapGetters } from 'vuex';
import QrcodeVue from 'qrcode.vue';

import TooltipWrapper from '@/components/ui/TooltipWrapper.vue';
import AppNotification from '@/components/AppNotification.vue';

import ReferralIcon from "@/assets/referral/icons/ReferralIcon.vue"
import LinkIcon from '@/assets/referral/icons/LinkIcon.vue';

export default {
  name: 'ReferralLink',
  components: {
    AppNotification,
    TooltipWrapper,
    QrcodeVue,
    ReferralIcon,
    LinkIcon
  },
  data() {
    return {
      showNotification: false,
      copyTimeout: null,
      qrVisible: false,
      qrCodeUrl: null,
    };
  },
  computed: {
    ...mapGetters(['GET_REFERRAL_INFO']),
    createReferralLink() {
      const currentUrl = window.location.href;
      const userReferral = this.GET_REFERRAL_INFO?.link;

      let baseUrl;
      if (userReferral !== undefined) {
        if (currentUrl.includes('localhost')) {
          baseUrl = 'http://localhost:8080';
        } else if (currentUrl.includes('dev.swap.coffee')) {
          baseUrl = 'https://dev.swap.coffee';
        } else if (currentUrl.includes('swap.coffee')) {
          baseUrl = 'https://swap.coffee';
        }

        const referralPath = `/dex?referral=${userReferral}`;
        return `${baseUrl}${referralPath}`;
      }
    },
  },
  watch: {
    GET_REFERRAL_INFO: {
      handler() {
        if (!this.qrCodeUrl) {
          this.qrCodeUrl = this.createReferralLink;
        }
      },
    },
    qrVisible: {
      handler() {
        if (this.qrVisible) {
          document.documentElement.style.overflow = 'hidden';
          return;
        }
        document.documentElement.style.overflow = 'auto';
      },
    },
  },
  methods: {
    copyLink() {
      const referralLink = this.createReferralLink;
      navigator.clipboard.writeText(referralLink).then(() => {
        this.closeQr();
        this.showNotification = true;
        if (this.copyTimeout) {
          clearTimeout(this.copyTimeout);
        }
        this.copyTimeout = setTimeout(() => {
          this.showNotification = false;
          this.copyTimeout = null;
        }, 3000);
      });
    },
    closeCopyNotification() {
      this.showNotification = false;

      if (this.copyTimeout) {
        clearTimeout(this.copyTimeout);
        this.copyTimeout = null;
      }
    },
    showQr() {
      if (!this.qrCodeUrl) {
        this.qrCodeUrl = this.createReferralLink;
      }
      this.qrVisible = true;
    },
    closeQr() {
      this.qrVisible = false;
    },
    connectWallet() {
      this.tonConnectUi.openModal();
    },
  },
};
</script>

<style scoped>
.link {
  border: none;
}

.link__caption {
  margin-bottom: 8px;
  font-size: 16px;
  line-height: 19px;
  font-weight: 500;
}

img {
  max-width: 95%;
}

.link__description {
  margin-bottom: 14px;
  font-size: 13px;
  line-height: 15px;
  opacity: 0.7;
}

.popup-background {
  position: fixed;
  z-index: 999;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(10, 7, 6, 0.8);
}

.link__button-block {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 0 12px;
}

.link__button {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  width: 100%;
  outline: none;
  border-radius: 12px;
  background: transparent;
  border: 1px solid var(--iface-white10);
  min-width: max-content;
  transition: 0.2s all;
}

.link__button--qr:hover {
  border: 1px solid var(--iface-white20);
  background: transparent !important;
}

.link__button--copy:hover {
  background: var(--iface-white14);
}

.link__button p {
  font-size: 14px;
  font-weight: 500;
}

.link__button--copy {
  background: var(--iface-white12);
  border: 1px solid transparent;
}

.qr__img {
  position: absolute;
  width: 55px;
  height: 55px;
}

.img__wrapper {
  background-color: #ffffff;
  border-radius: 12px;
  position: absolute;
  width: 60px;
  height: 60px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.qr__popup {
  width: 460px;
  padding: 18px;
  border-radius: 16px;
  background: var(--iface-main-bg);
}

.popup__content {
  margin-top: 30px;
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.popup__title {
  font-size: 24px;
  font-weight: 500;
  line-height: 28px;
  color: var(--main-text-color);
}

.popup__subtitle {
  line-height: 18px;
  letter-spacing: 0.25px;
  font-weight: 400;
  font-size: 14px;
  color: var(--main-text-color);
}

.qr__popup .link__button {
  min-height: 56px;
}

.qr__wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  margin: 0 auto;
  width: 200px;
  height: 200px;
  border-radius: 16px;
  background: #ffffff;
}

.close__icon {
  margin-bottom: 30px;
  display: flex;
  justify-content: flex-end;
}

.close__icon svg {
  cursor: pointer;
}

.button_colored {
  background: #ea7a3b;
  color: #fff;
}

.link__btn-icon {
  margin-right: 8px;
}

svg path {
  transition: 0.2s;
  fill: var(--main-text-color);
}

@media (max-width: 768px) {
  .link__button-block {
    gap: 8px;
  }
}

@media (max-width: 460px) {
  .popup-background {
    display: flex;
    align-items: flex-end;
    justify-content: center;
    padding: 0 10px 10px 10px;
  }

  .link__button--copy {
    width: 100%;
  }

  .link__button--qr {
    width: max-content;
  }

  .close__icon {
    margin-bottom: 18px;
  }

  .popup__content {
    margin-top: 18px;
    margin-bottom: 20px;
  }

  .link__button--qr p {
    display: none;
  }
}

@media (max-width: 576px) {
  .link {
    position: fixed;
    z-index: 5;
    left: 0;
    right: 0;
    bottom: 0;
    padding: 10px;
    background: linear-gradient(180deg, rgba(16, 16, 16, 0.00) 0%, rgba(16, 16, 16, 0.30) 10%, var(--earn-bg) 100%);
  }

  .theme-light .link {
    background: linear-gradient(180deg, rgba(255, 255, 255, 0.00) 0%, rgba(255, 255, 255, 0.30) 10%, #FFF 100%);
  }

  .link__button-block {
    flex-direction: row-reverse;
  }
  .link__button--qr,
  .link__button--copy {
    background: var(--iface-white10);
    backdrop-filter: blur(50px);
    -webkit-backdrop-filter: blur(50px);
    opacity: 1;
    height: 48px;
    border: none;
  }
}
</style>
