<template>
  <div class="snowflakes" id="snowflake-wrapper" ref="snow">
    <svg
      class="snowflake"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 512 512"
    >
      <path
        d="M475.6 384.1C469.7 394.3 458.9 400 447.9 400c-5.488 0-11.04-1.406-16.13-4.375l-25.09-14.64l5.379 20.29c3.393 12.81-4.256 25.97-17.08 29.34c-2.064 .5625-4.129 .8125-6.164 .8125c-10.63 0-20.36-7.094-23.21-17.84l-17.74-66.92L288 311.7l.0002 70.5l48.38 48.88c9.338 9.438 9.244 24.62-.1875 33.94C331.5 469.7 325.4 472 319.3 472c-6.193 0-12.39-2.375-17.08-7.125l-14.22-14.37L288 480c0 17.69-14.34 32-32.03 32s-32.03-14.31-32.03-32l-.0002-29.5l-14.22 14.37c-9.322 9.438-24.53 9.5-33.97 .1875c-9.432-9.312-9.525-24.5-.1875-33.94l48.38-48.88L223.1 311.7l-59.87 34.93l-17.74 66.92c-2.848 10.75-12.58 17.84-23.21 17.84c-2.035 0-4.1-.25-6.164-.8125c-12.82-3.375-20.47-16.53-17.08-29.34l5.379-20.29l-25.09 14.64C75.11 398.6 69.56 400 64.07 400c-11.01 0-21.74-5.688-27.69-15.88c-8.932-15.25-3.785-34.84 11.5-43.75l25.96-15.15l-20.33-5.508C40.7 316.3 33.15 303.1 36.62 290.3S53.23 270 66.09 273.4L132 291.3L192.5 256L132 220.7L66.09 238.6c-2.111 .5625-4.225 .8438-6.305 .8438c-10.57 0-20.27-7.031-23.16-17.72C33.15 208.9 40.7 195.8 53.51 192.3l20.33-5.508L47.88 171.6c-15.28-8.906-20.43-28.5-11.5-43.75c8.885-15.28 28.5-20.44 43.81-11.5l25.09 14.64L99.9 110.7C96.51 97.91 104.2 84.75 116.1 81.38C129.9 77.91 142.1 85.63 146.4 98.41l17.74 66.92L223.1 200.3l-.0002-70.5L175.6 80.88C166.3 71.44 166.3 56.25 175.8 46.94C185.2 37.59 200.4 37.72 209.8 47.13l14.22 14.37L223.1 32c0-17.69 14.34-32 32.03-32s32.03 14.31 32.03 32l.0002 29.5l14.22-14.37c9.307-9.406 24.51-9.531 33.97-.1875c9.432 9.312 9.525 24.5 .1875 33.94l-48.38 48.88L288 200.3l59.87-34.93l17.74-66.92c3.395-12.78 16.56-20.5 29.38-17.03c12.82 3.375 20.47 16.53 17.08 29.34l-5.379 20.29l25.09-14.64c15.28-8.906 34.91-3.75 43.81 11.5c8.932 15.25 3.785 34.84-11.5 43.75l-25.96 15.15l20.33 5.508c12.81 3.469 20.37 16.66 16.89 29.44c-2.895 10.69-12.59 17.72-23.16 17.72c-2.08 0-4.193-.2813-6.305-.8438L379.1 220.7L319.5 256l60.46 35.28l-65.95-17.87C458.8 270 471.9 277.5 475.4 290.3c3.473 12.78-4.082 25.97-16.89 29.44l-20.33 5.508l25.96 15.15C479.4 349.3 484.5 368.9 475.6 384.1z"
      ></path>
    </svg>
  </div>
</template>

<script>
import gsap from "gsap";
import { mapActions, mapGetters } from 'vuex';
import computedMixins from '@/mixins/computedMixins.js';

export default {
  mixins: [computedMixins],
  props: {
    snowflakeCount: {
      type: Number,
      default() {
        return 0;
      },
      required: true
    }
  },
  data() {
    return {
      observer: null,
      collectedPoints: 0
    };
  },
  computed: {
    ...mapGetters(['GET_SNOWFLAKE_TOKEN', 'GET_SNOWFLAKE_POINTS', 'GET_PROOF_VERIFICATION', 'GET_DEX_WALLET']),
  },
  methods: {
    ...mapActions(['SAVE_SNOWFLAKE_POINTS', 'SAVE_SNOWFLAKE_TOKEN']),
    initObserver() {
      this.observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.target.childNodes.length === 0) {
            this.$emit('closeSnowfall');
            if (this.collectedPoints > 0) {
              this.sendPointsToServer();
            }
          }
        });
      });
    },

    incrementSnowflakePoints(amount) {
      this.collectedPoints += amount;
      this.SAVE_SNOWFLAKE_POINTS(this.GET_SNOWFLAKE_POINTS + amount);
    },

    async sendPointsToServer() {
      try {
        const token = this.GET_SNOWFLAKE_TOKEN;
        await this.callIncrement(token);
      } catch (err) {
        console.error(err);
        if (err?.response?.status === 401) {
          setTimeout(() => {
            localStorage.removeItem("snowflake_token")
            this.SAVE_SNOWFLAKE_TOKEN(null)
            this.callIncrement()
          }, 1000)
        }
      }
    },
    async callIncrement(token = null) {
      try {
        let currentToken = ""
        if (token) {
          currentToken = token
        } else {
          currentToken = await this.getTokenByProof();
        }
        await this.snowflakeApi.incrementPoints(this.collectedPoints, currentToken);
      } catch (err) {
        throw err
      }
    },
    async getTokenByProof() {
      try {
        const proof = this.formattedSnowflakeProof;
        let res = await this.snowflakeApi.getToken(proof);
        localStorage.setItem("snowflake_token", JSON.stringify(res));
        this.SAVE_SNOWFLAKE_TOKEN(res)
        return res;
      } catch (err) {
        throw err;
      }
    },
    startSnowfall() {
      const snowflakeTemplate = this.$el.querySelector('.snowflake');
      for (let i = 0; i < this.snowflakeCount; i++) {
        this.createSnowflake();
      }
      snowflakeTemplate.remove();
    },

    createSnowflake() {
      const snowflakeTemplate = this.$el.querySelector('.snowflake');
      const snowflakeClone = snowflakeTemplate.cloneNode(true);
      snowflakeClone.style.display = 'block';
      snowflakeClone.clicked = false;

      this.$el.appendChild(snowflakeClone);

      const windowWidth = window.innerWidth;
      const snowflakeWidth = snowflakeClone.getBoundingClientRect().width;
      const snowflakeHeight = snowflakeClone.getBoundingClientRect().height;
      const container = this.$el;
      const containerHeight = container.clientHeight || window.innerHeight;
      const minX = snowflakeWidth;
      const maxX = windowWidth - snowflakeWidth;
      const randomX = minX + Math.random() * (maxX - minX);
      const maxSway = Math.min(50 + Math.random() * 60, maxX - randomX, randomX - minX);
      const fallDuration = 9 + Math.random() * 6;
      const swayDuration = 1 + Math.random() * 2;

      snowflakeClone.addEventListener('click', () => {
        if (!snowflakeClone.clicked) {
          snowflakeClone.clicked = true;
          this.incrementSnowflakePoints(1);

          gsap.to(snowflakeClone, {
            scale: 1.2,
            opacity: 0.7,
            duration: 0.2,
            ease: 'back.out(1.7)',
            onComplete: () => {
              this.fadeOutSnowflake(snowflakeClone, true);
            }
          });
        }
      });

      const rotateDistance = 180 + Math.random() * 360;
      const rotateTween = gsap.to(snowflakeClone, {
        rotation: `+=${rotateDistance}`,
        yoyo: true,
        repeat: -1,
        ease: 'sine.inOut',
        duration: 2 + Math.random() * 3
      });

      const swayTween = gsap.to(snowflakeClone, {
        x: `+=${maxSway}`,
        yoyo: true,
        duration: swayDuration,
        repeat: -1,
        ease: 'sine.inOut',
      });

      const fallTimeline = gsap.timeline({
        onComplete: () => {
          swayTween.kill();
          rotateTween.kill();
          setTimeout(() => this.fadeOutSnowflake(snowflakeClone, false), 500);
        },
      });

      fallTimeline.fromTo(
        snowflakeClone,
        {
          x: randomX,
          y: -100,
          rotation: Math.random() * 360,
        },
        {
          y: containerHeight - snowflakeHeight,
          duration: fallDuration,
          ease: 'power1.out',
        }
      );
    },

    fadeOutSnowflake(el, clicked) {
      if (el.fadeStarted) return;
      el.fadeStarted = true;

      gsap.to(el, {
        scale: 0,
        opacity: 0,
        duration: clicked ? 0.5 : 1,
        ease: 'power1.in',
        onComplete: () => {
          el.remove();
        },
      });
    },
  },

  mounted() {
    this.startSnowfall();
    this.initObserver();
    this.observer.observe(this.$refs.snow, {
      childList: true,
      subtree: true,
      characterData: true
    });
  },

  beforeDestroy() {
    this.observer.disconnect();
    this.sendPointsToServer();
  },
};
</script>

<style scoped>
.snowflakes {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  width: 100vw;
  height: 100dvh;
  pointer-events: none;
  overflow: hidden;
  z-index: 1000;
}

.snowflake {
  position: absolute;
  top: 0;
  transform: translateX(-50%);
  width: 55px;
  height: 55px;
  cursor: pointer;
  pointer-events: auto;
  fill: var(--snowflake-color);
  stroke: #000000;
  stroke-width: 1px;
  filter: drop-shadow(0 0 2px var(--snowflake-shadow)) drop-shadow(0 0 5px var(--snowflake-shadow));
  background-color: transparent;
  border-radius: 50%;
  outline: none;
  user-select: none;
  tap-highlight-color: transparent;
  -webkit-tap-highlight-color: transparent;
}

.snowflake:focus, .snowflake:active {
  outline: none;
  background-color: transparent;
  border-radius: 50%;
}


@media (max-width: 800px) {
  .snowflake {
    width: 50px;
    height: 50px;
  }
}
</style>
