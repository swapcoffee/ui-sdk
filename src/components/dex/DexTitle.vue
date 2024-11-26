<template>
	<div class="dex__wrapper">
<!--		<TradeNav class="trade__nav-top"/>-->
		<div class="dex__title title">
			<div class="dex__buttons">
        <button class="title__back-btn" @click="redirectToSwapCoffee">
          <span class="by-text slippage-text">powered by</span>
          <img src="@/assets/main/swap-logo.svg" alt="swap-logo" class="swap-logo">
        </button>
<!--				<TradeNav class="trade__nav-bottom"/>-->
			</div>
			<div class="title__group">
				<div
					class="title__refresh-btn"
					@click="refreshCompare"
				>
					<svg class="refresh-icon" id="arrow_loading" viewBox="0 0 24 24" color="textSubtle" xmlns="http://www.w3.org/2000/svg"
						:key="`ANIMATION_STATUS_${shouldAnimate}`"
						:class="{ refresh: refreshInfo }"
					>
						<path stroke="none" fill="#E9E9EB" d="M11.9911 20.86C14.1557 20.8665 16.2485 20.0838 17.8778 18.6586C19.507 17.2333 20.5609 15.2631 20.8422 13.1168C20.9068 12.6239 20.5597 12.172 20.0668 12.1074C19.574 12.0428 19.1221 12.39 19.0575 12.8828C18.833 14.5951 17.9923 16.1668 16.6926 17.3038C15.3929 18.4408 13.7233 19.0652 11.9965 19.06C10.2696 19.0549 8.60383 18.4205 7.31095 17.2758C6.01806 16.131 5.18672 14.5542 4.97252 12.8407C4.75833 11.1272 5.17598 9.39433 6.14729 7.96653C7.1186 6.53873 8.57698 5.51387 10.2494 5.08379C11.9219 4.65371 13.6938 4.84791 15.2334 5.63002C16.3568 6.20071 17.3003 7.05589 17.9766 8.0998H14.9498C14.4528 8.0998 14.0498 8.50275 14.0498 8.9998C14.0498 9.49686 14.4528 9.8998 14.9498 9.8998H19.4294C19.4432 9.90012 19.457 9.90012 19.4708 9.8998H19.9498C20.4469 9.8998 20.8498 9.49686 20.8498 8.9998V3.9998C20.8498 3.50275 20.4469 3.0998 19.9498 3.0998C19.4528 3.0998 19.0498 3.50275 19.0498 3.9998V6.50489C18.2508 5.47492 17.2289 4.62481 16.0486 4.02522C14.1187 3.04482 11.8976 2.8014 9.80114 3.34051C7.70469 3.87962 5.87658 5.1643 4.65902 6.95408C3.44146 8.74386 2.91793 10.916 3.18642 13.064C3.45492 15.2119 4.49703 17.1884 6.11769 18.6234C7.73834 20.0584 9.82644 20.8536 11.9911 20.86Z"></path>
						<defs>
							<path id="arrow" stroke="none" fill="none" d="M11.9911 20.86C14.1557 20.8665 16.2485 20.0838 17.8778 18.6586C19.507 17.2333 20.5609 15.2631 20.8422 13.1168C20.9068 12.6239 20.5597 12.172 20.0668 12.1074C19.574 12.0428 19.1221 12.39 19.0575 12.8828C18.833 14.5951 17.9923 16.1668 16.6926 17.3038C15.3929 18.4408 13.7233 19.0652 11.9965 19.06C10.2696 19.0549 8.60383 18.4205 7.31095 17.2758C6.01806 16.131 5.18672 14.5542 4.97252 12.8407C4.75833 11.1272 5.17598 9.39433 6.14729 7.96653C7.1186 6.53873 8.57698 5.51387 10.2494 5.08379C11.9219 4.65371 13.6938 4.84791 15.2334 5.63002C16.3568 6.20071 17.3003 7.05589 17.9766 8.0998H14.9498C14.4528 8.0998 14.0498 8.50275 14.0498 8.9998C14.0498 9.49686 14.4528 9.8998 14.9498 9.8998H19.4294C19.4432 9.90012 19.457 9.90012 19.4708 9.8998H19.9498C20.4469 9.8998 20.8498 9.49686 20.8498 8.9998V3.9998C20.8498 3.50275 20.4469 3.0998 19.9498 3.0998C19.4528 3.0998 19.0498 3.50275 19.0498 3.9998V6.50489C18.2508 5.47492 17.2289 4.62481 16.0486 4.02522C14.1187 3.04482 11.8976 2.8014 9.80114 3.34051C7.70469 3.87962 5.87658 5.1643 4.65902 6.95408C3.44146 8.74386 2.91793 10.916 3.18642 13.064C3.45492 15.2119 4.49703 17.1884 6.11769 18.6234C7.73834 20.0584 9.82644 20.8536 11.9911 20.86Z"></path>
							<clipPath id="arrow-clip">
								<use href="#arrow"></use>
							</clipPath>
						</defs>
						<g clip-path="url(#arrow-clip)">
							<circle cx="12" cy="12" r="5" transform="rotate(360,12,12)" fill="none" stroke="#898B8F" stroke-width="16" stroke-dasharray="30" stroke-dashoffset="60"
							>
								<animate attributeName="stroke-dashoffset" values="60;30" begin="0" repeatCount="indefinite" ease-in-out="sine" dur="9s"
									v-if="shouldAnimate"
								></animate>
							</circle>
						</g>
						<use href="#arrow"></use>
					</svg>
				</div>
				<div class="title__slippage-btn" @click="showSettings">
          <p class="slippage-text"> {{ $t('dexInterface.slippage', { slippageCount: getSlippage.toString() }) }}</p>
          <!--					<img src="@/assets/dex/slippage-icon.svg" alt="slippage icon" class="slippage-icon"/>-->
					<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
						<g opacity="0.8">
							<path d="M18.589 8.37581C18.5716 8.28779 18.5354 8.20456 18.483 8.13177C18.4305 8.05897 18.363 7.99832 18.2851 7.95393L15.9546 6.62581L15.9452 3.99924C15.9449 3.90879 15.925 3.81947 15.8868 3.73746C15.8487 3.65545 15.7932 3.5827 15.7241 3.52424C14.8788 2.80916 13.9053 2.26117 12.8554 1.9094C12.7727 1.88142 12.6851 1.87106 12.5981 1.879C12.5112 1.88694 12.4269 1.913 12.3507 1.95549L9.9999 3.26956L7.64678 1.95315C7.57049 1.91041 7.48609 1.88416 7.39902 1.87608C7.31195 1.86801 7.22416 1.87829 7.14131 1.90628C6.09207 2.26031 5.11962 2.81042 4.27569 3.52737C4.20675 3.58574 4.15129 3.65836 4.11313 3.74023C4.07496 3.8221 4.05499 3.91126 4.05459 4.00159L4.04287 6.63049L1.7124 7.95862C1.63444 8.00301 1.56694 8.06366 1.5145 8.13645C1.46206 8.20925 1.42591 8.29248 1.4085 8.38049C1.19521 9.45228 1.19521 10.5556 1.4085 11.6274C1.42591 11.7154 1.46206 11.7986 1.5145 11.8714C1.56694 11.9442 1.63444 12.0049 1.7124 12.0492L4.04287 13.3774L4.05225 16.0047C4.05253 16.0952 4.07245 16.1845 4.11062 16.2665C4.14879 16.3485 4.20431 16.4213 4.27334 16.4797C5.11871 17.1948 6.09221 17.7428 7.14209 18.0946C7.22477 18.1225 7.31239 18.1329 7.39932 18.125C7.48624 18.117 7.57054 18.091 7.64678 18.0485L9.9999 16.7305L12.353 18.0469C12.4462 18.0988 12.5511 18.1257 12.6577 18.125C12.726 18.125 12.7938 18.1139 12.8585 18.0922C13.9075 17.7383 14.8799 17.1888 15.7241 16.4727C15.7931 16.4143 15.8485 16.3417 15.8867 16.2598C15.9249 16.178 15.9448 16.0888 15.9452 15.9985L15.9569 13.3696L18.2874 12.0414C18.3654 11.997 18.4329 11.9364 18.4853 11.8636C18.5378 11.7908 18.5739 11.7076 18.5913 11.6196C18.8034 10.5486 18.8026 9.44643 18.589 8.37581ZM9.9999 13.125C9.38184 13.125 8.77765 12.9417 8.26375 12.5984C7.74984 12.255 7.3493 11.7669 7.11278 11.1959C6.87626 10.6249 6.81437 9.99656 6.93495 9.39037C7.05553 8.78418 7.35316 8.22736 7.7902 7.79032C8.22723 7.35328 8.78406 7.05565 9.39025 6.93507C9.99644 6.81449 10.6248 6.87638 11.1958 7.1129C11.7668 7.34943 12.2549 7.74996 12.5982 8.26387C12.9416 8.77777 13.1249 9.38196 13.1249 10C13.1249 10.8288 12.7957 11.6237 12.2096 12.2097C11.6236 12.7958 10.8287 13.125 9.9999 13.125Z" fill="white"/>
						</g>
					</svg>
				</div>
			</div>
			<DexSettings v-show="show" @closeSettings="closeSettings"/>
		</div>
	</div>
</template>


<script lang="ts">
import { defineAsyncComponent } from "vue";
import { useDexStore } from "@/stores/dex";
import TradeNav from "@/components/navigation/TradeNav.vue";

export default {
  name: "DexTitle",
  components: {
    TradeNav,
    DexSettings: defineAsyncComponent(() => import("@/components/dex/DexSettings.vue")),
  },
  props: {
    refreshInfo: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      show: false,
      refresh: false,
    };
  },
  computed: {
    dexStore() {
      return useDexStore();
    },
    getSlippage (): number {
      return this.dexStore.GET_SLIPPAGE;
    },
    shouldAnimate(): boolean {
      return (
          (this.dexStore.GET_SEND_AMOUNT > 0 || this.dexStore.GET_RECEIVE_AMOUNT > 0) &&
          this.dexStore.GET_RECEIVE_TOKEN !== null &&
          this.dexStore.GET_SEND_TOKEN !== null &&
          !this.refreshInfo
      );
    },
  },
  methods: {
    refreshCompare() {
      if (
          this.dexStore.GET_SEND_TOKEN !== null &&
          this.dexStore.GET_RECEIVE_TOKEN !== null &&
          this.dexStore.GET_SEND_AMOUNT > 0
      ) {
        this.$emit("refresh", "compareTokens");
      }
    },
    redirectToSwapCoffee() {
      window.open("https://swap.coffee/dex", "_blank");
    },
    closeSettings() {
      this.show = false;
    },
    showSettings() {
      this.show = true;
    },
  },
  watch: {
    show: {
      handler(newVal: boolean) {
        if (window.innerWidth <= 860) {
          document.documentElement.style.overflow = newVal ? "hidden" : "auto";
        }
      },
    },
  },
};
</script>


<style scoped>
.title {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 15px;
}

.title__back-btn {
  display: flex;
  align-items: center;
  flex-direction: row;
  border: none;
  background: none;
  font-weight: 400;
  font-size: 14px;
  gap: 1px;
}

.swap-logo {
  height: 20px;
  width: 80px;
}


.title__group {
	display: flex;
	align-items: center;
}

.title__refresh-btn {
	transition: .15s;
	margin-right: 6px;
	width: 36px;
	height: 36px;
	max-height: 36px;
	outline: none;
	border-radius: 14px;
	border: 1px solid var(--iface-white14);
	cursor: pointer;
	display: flex;
	justify-content: center;
	align-items: center;
}

.title__refresh-btn:hover {
	border: 1px solid var(--iface-white20);
}

.refresh-icon {
	transition: .15s;
	opacity: 0.8;
	width: 20px;
	height: 20px;
}

.title__refresh-btn:hover svg {
	opacity: 1;
}

.title__slippage-btn {
	transition: .15s;
	display: flex;
	align-items: center;
	height: 36px;
	padding: 8px;
	border-radius: 14px;
	cursor: pointer;
	border: 1px solid var(--iface-white14);
}

.title__slippage-btn:hover {
	border: 1px solid var(--iface-white20);
}

.title__slippage-btn:hover img {
	opacity: 1;
}

.slippage-text {
	margin-right: 6px;
	font-size: 12px;
	opacity: 0.7;
}

.slippage-icon {
	transition: .15s;
	width: 20px;
	height: 20px;
	opacity: 0.8;
}

.refresh {
	animation: 1s forwards ease-out LoaderReverse;
}

.chart__toggle-btn {
	transition: .15s;
	margin-right: 6px;
	width: 36px;
	height: 36px;
	max-height: 36px;
	outline: none;
	border-radius: 14px;
	border: 1px solid var(--iface-white14);
	cursor: pointer;
	justify-content: center;
	align-items: center;
	display: none;
	opacity: 0.9;
	background: transparent;
}

.theme-light .chart__toggle-btn {
	background: transparent;
	border: 1px solid var(--iface-white8);
}

.trade__nav-top {
	display: none;
}

.chart__toggle-btn:hover {
	border: 1px solid var(--iface-white20);
}

.theme-light img {
	mix-blend-mode: difference;
	filter: invert(.25);
}

.theme-light svg path {
	fill: #141414;
}

.theme-light svg #arrow {
	fill: rgba(20, 20, 20, 0.4);
}

.theme-light svg circle {
	stroke: #fff;
}

@media screen and (max-width: 860px) {
	.chart__toggle-btn {
		display: flex;
	}

	.title {
		margin: 0;
		padding: 12px 10px 14px 10px;
	}

	.trade__nav-bottom {
		display: none;
	}

	.trade__nav-top {
		display: block;
	}
}

@media screen and (max-width: 359px) {
  .title__back-btn {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    gap: 2px;
  }

  .title__back-btn .slippage-text {
    text-align: left;
    margin-right: 0;
  }

}

</style>
