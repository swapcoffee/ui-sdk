<template>
  <div class="popup-background"
       @click.self="$emit('closeStatus')"
  >
    <div class="stake-status" :class="status">
      <div class="stake-status__menu">
        <button class="stake-status__close-btn"
                @click="$emit('closeStatus')"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
            <g opacity="0.8">
              <path d="M19.2806 18.2194C19.3502 18.2891 19.4055 18.3718 19.4432 18.4628C19.4809 18.5539 19.5003 18.6515 19.5003 18.75C19.5003 18.8485 19.4809 18.9461 19.4432 19.0372C19.4055 19.1282 19.3502 19.2109 19.2806 19.2806C19.2109 19.3503 19.1281 19.4056 19.0371 19.4433C18.9461 19.481 18.8485 19.5004 18.7499 19.5004C18.6514 19.5004 18.5538 19.481 18.4628 19.4433C18.3717 19.4056 18.289 19.3503 18.2193 19.2806L11.9999 13.0603L5.78055 19.2806C5.63982 19.4214 5.44895 19.5004 5.24993 19.5004C5.05091 19.5004 4.86003 19.4214 4.7193 19.2806C4.57857 19.1399 4.49951 18.949 4.49951 18.75C4.49951 18.551 4.57857 18.3601 4.7193 18.2194L10.9396 12L4.7193 5.78062C4.57857 5.63989 4.49951 5.44902 4.49951 5.25C4.49951 5.05097 4.57857 4.8601 4.7193 4.71937C4.86003 4.57864 5.05091 4.49958 5.24993 4.49958C5.44895 4.49958 5.63982 4.57864 5.78055 4.71937L11.9999 10.9397L18.2193 4.71937C18.36 4.57864 18.5509 4.49958 18.7499 4.49958C18.949 4.49958 19.1398 4.57864 19.2806 4.71937C19.4213 4.8601 19.5003 5.05097 19.5003 5.25C19.5003 5.44902 19.4213 5.63989 19.2806 5.78062L13.0602 12L19.2806 18.2194Z" fill="white"/>
            </g>
          </svg>
        </button>
      </div>
      <div class="stake-status__wrapper">
        <div class="stake-status__lottie" id="loading"
             v-show="status === 'pending' || status === 'partially_complete'"></div>
        <div class="stake-status__lottie" id="success"
             v-show="status === 'succeeded'"
        ></div>
        <div class="stake-status__lottie" id="failed"
             v-show="status === 'failed' || status === 'timed_out'"
        ></div>
      </div>
      <h2 class="stake-status__title">{{ getStatusDisplay }}</h2>
      <p class="stake-status__description"
         v-show="status === 'failed' || status === 'timed_out'">
        {{ $t("stakeStatus.failedText") }}
      </p>
      <button class="stake-status__btn close-btn"
              v-show="status === 'succeeded'"
              @click="$emit('closeStatus')"
      >
        Close
      </button>
      <button class="stake-status__btn support-btn"
              v-show="status === 'failed' || status === 'timed_out'"
              @click="support"
      >
        Support
      </button>
    </div>
  </div>
</template>

<script>
import lottie from "lottie-web";
import computedMixins from "@/mixins/computedMixins";
import { mapActions, mapGetters } from 'vuex';
import { stakingService } from '@/api/coffeeApi/services';

export default {
  name: "StakeTransactionStatus",
  mixins: [computedMixins],
  props: {
    stakeStatus: {
      type: String,
      default() {
        return null
      }
    },
    queryId: {
      type: Number,
      default() {
        return null
      }
    }
  },
  data() {
    return {
      interval: null,
      status: null,
      lottieAnimations: ['loading', 'success', 'failed']
    }
  },
  computed: {
    ...mapGetters([
      'GET_STAKE_VALUE',
      'GET_STAKE_TOKEN',
      'GET_STAKE_MERGED_TOKENS'
    ]),
    getStatusDisplay() {
      if (this.status === 'failed') {
        return this.$t('stakeStatus.error')
      } else if (this.status === 'timed_out') {
        return this.$t('stakeStatus.timed_out')
      } else if (this.status === 'pending' || this.status === 'partially_complete') {
        return this.$t('stakeStatus.pending')
      } else if (this.status === 'succeeded') {
        return this.$t('stakeStatus.success')
      }
    },
  },
  methods: {
    ...mapActions(['REFRESH_USER_DATA']),
    support() {
      window.open('https://t.me/addlist/tShqOXNZ89tmYTg8', '_blank');
    },
    findTokenInMergedTokens(tokenAddress) {
      if (!this.GET_STAKE_MERGED_TOKENS || !tokenAddress) return null;
      return this.GET_STAKE_MERGED_TOKENS.find(token => token.token.address.address === tokenAddress);
    },
    async getStakeStatus() {
      try {
        let res = await stakingService.getStakingTransactionStatus(this.queryId);
        this.status = res?.data;
        if (this.status === 'failed' || this.status === 'succeeded') {
          clearInterval(this.interval)
        }

        if (this.status === 'succeeded') {
          this.$emit('successTrans');
          await this.REFRESH_USER_DATA();
        }
      } catch(err) {
        console.error(err)
      }
    },
    async loadAnimation(name) {
      try {
        const animationData = await import(`@/assets/lottie/${name}.json`);
        lottie.loadAnimation({
          container: document.getElementById(name), // the dom element that will contain the animation
          renderer: 'svg',
          loop: true,
          autoplay: true,
          name: name,
          animationData: animationData.default
        });
      } catch (error) {
        console.error(error + " asset loading failed");
      }
    }
  },
  mounted() {
    this.status = this.stakeStatus
    this.interval = setInterval(() => {
      this.getStakeStatus()
    }, 5_000)

    this.lottieAnimations.forEach((item) => {
      this.loadAnimation(item)
    })
  },
  unmounted() {
    clearInterval(this.interval)
  }
}
</script>

<style scoped>
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

.theme-light .stake-status__close-btn {
    filter: invert(1);
}

.stake-status {
  width: 460px;
  z-index: 999;
  padding: 18px;
  background: var(--iface-main-bg);
  border-radius: 20px;
}

.pending, .partially_complete {
  padding: 18px 18px 30px 18px;
}

.stake-status__menu {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  margin-bottom: 30px;
}

.stake-status__close-btn {
  width: 24px;
  height: 24px;
  background: transparent;
  border: none;
  outline: none;
}

.stake-status__wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 30px;
}

.stake-status__lottie {
  width: 200px;
  height: 200px;
}

.stake-status__title {
  font-size: 24px;
  font-family: Harmony-Medium, sans-serif;
  text-align: center;
}

.stake-status__description {
  margin-top: 10px;
  font-size: 14px;
  line-height: 16px;
  opacity: 0.7;
  text-align: center;
}

.stake-status__btn {
  transition: .2s;
  margin-top: 30px;
  width: 100%;
  padding: 16px;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  line-height: 18px;
}

.close-btn {
  background: var(--iface-white6);
}

.close-btn:hover {
  background: var(--iface-white12);
}

.support-btn {
  background: var(--iface-accent-color);
  box-shadow: 0px 2px 10px 0px rgba(0, 0, 0, 0.25);
}

.support-btn:hover {
  background: var(--iface-accent-hover);
}
</style>
