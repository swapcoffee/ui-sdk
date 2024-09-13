<template>
  <div class="distribution-btn" @click="showMore">
    <div class="distribution-btn__group">
      <div class="distribution-btn__plan">
        <svg class="distribution-btn__icon" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M5.42499 11.7542C4.87908 11.7542 4.41689 11.5641 4.0384 11.184C3.66001 10.8038 3.47082 10.3446 3.47082 9.80629V5.42618C3.1111 5.30952 2.817 5.10496 2.58853 4.81252C2.36006 4.52007 2.24582 4.19987 2.24582 3.85191C2.24582 3.40576 2.40415 3.02654 2.7208 2.71427C3.03745 2.40199 3.41603 2.24585 3.85655 2.24585C4.29716 2.24585 4.67356 2.40199 4.98574 2.71427C5.29801 3.02654 5.45415 3.40576 5.45415 3.85191C5.45415 4.21931 5.33749 4.54438 5.10415 4.8271C4.87082 5.10982 4.57915 5.30466 4.22915 5.4116V9.80089C4.22915 10.1295 4.34665 10.4108 4.58163 10.6448C4.81662 10.8788 5.09915 10.9958 5.42921 10.9958C5.75919 10.9958 6.04031 10.8787 6.27257 10.6445C6.50474 10.4104 6.62082 10.1289 6.62082 9.80002V4.20002C6.62082 3.65411 6.81001 3.19192 7.1884 2.81343C7.56689 2.43504 8.02908 2.24585 8.57499 2.24585C9.12089 2.24585 9.58308 2.43504 9.96157 2.81343C10.34 3.19192 10.5292 3.65411 10.5292 4.20002V8.58843C10.8792 8.69538 11.1708 8.89021 11.4042 9.17293C11.6375 9.45566 11.7542 9.78072 11.7542 10.1481C11.7542 10.5943 11.5983 10.9735 11.2865 11.2858C10.9747 11.598 10.5961 11.7542 10.1507 11.7542C9.71496 11.7542 9.33857 11.598 9.02153 11.2858C8.70439 10.9735 8.54582 10.5943 8.54582 10.1481C8.54582 9.80988 8.66249 9.48968 8.89582 9.18752C9.12915 8.88535 9.42082 8.68191 9.77082 8.5772V4.19462C9.77082 3.8664 9.65333 3.58596 9.41834 3.35331C9.18335 3.12056 8.90083 3.00418 8.57076 3.00418C8.24078 3.00418 7.95967 3.12129 7.7274 3.3555C7.49524 3.58961 7.37915 3.87111 7.37915 4.20002V9.80002C7.37915 10.3459 7.18996 10.8081 6.81157 11.1866C6.43308 11.565 5.97089 11.7542 5.42499 11.7542Z" fill="#55FF85"/>
        </svg>
        <p class="distribution-btn__text">{{ planDisplay }}</p>
      </div>
      <p class="distribution-btn__desc">{{ $t('dexDistribution.plan', {dexNames: getDexNames}) }}</p>
    </div>
    <svg class="distribution-btn__arrow-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
      <g opacity="0.5">
        <path d="M11.3537 8.35378L6.35372 13.3538C6.30727 13.4002 6.25212 13.4371 6.19142 13.4622C6.13072 13.4874 6.06567 13.5003 5.99997 13.5003C5.93428 13.5003 5.86922 13.4874 5.80852 13.4622C5.74783 13.4371 5.69268 13.4002 5.64622 13.3538C5.59977 13.3073 5.56292 13.2522 5.53778 13.1915C5.51263 13.1308 5.49969 13.0657 5.49969 13C5.49969 12.9343 5.51263 12.8693 5.53778 12.8086C5.56292 12.7479 5.59977 12.6927 5.64622 12.6463L10.2931 8.00003L5.64622 3.35378C5.5524 3.25996 5.49969 3.13272 5.49969 3.00003C5.49969 2.86735 5.5524 2.7401 5.64622 2.64628C5.74004 2.55246 5.86729 2.49976 5.99997 2.49976C6.13265 2.49976 6.2599 2.55246 6.35372 2.64628L11.3537 7.64628C11.4002 7.69272 11.4371 7.74786 11.4623 7.80856C11.4874 7.86926 11.5004 7.93433 11.5004 8.00003C11.5004 8.06574 11.4874 8.13081 11.4623 8.1915C11.4371 8.2522 11.4002 8.30735 11.3537 8.35378Z" fill="white"/>
      </g>
    </svg>
  </div>
  <DistributionPopup
      v-if="showDistribution"
      @closeDistribution="closeDistribution"
  />
</template>

<script lang="ts">
import { defineAsyncComponent } from 'vue';
import { useDexStore } from '@/stores/dex';

export default {
  name: "DexDistributionButton",
  components: {
    DistributionPopup: defineAsyncComponent(() => import("@/components/dex/DistributionPopup.vue"))
  },
  data() {
    return {
      showDistribution: false as boolean,
    };
  },
  computed: {
    dexStore() {
      return useDexStore();
    },
    planDisplay(): string {
      return `${this.getSplitCount} Split + ${this.getHopCount} Hop`;
    },
    getSplitCount(): number {
      return this.dexStore.GET_DEAL_CONDITIONS?.paths.length;
    },
    getHopCount(): number {
      let count = 0;
      const paths = this.dexStore.GET_DEAL_CONDITIONS?.paths || [];
      for (const routeStart of paths) {
        function traverse(current: any) {
          count++;
          if (current.next?.length > 0) {
            for (const next of current.next) {
              traverse(next);
            }
          }
        }
        traverse(routeStart);
      }
      return count;
    },
    getDexNames() {
      let array = []
      this.dexStore.GET_DEAL_CONDITIONS?.paths.forEach((item) => {
        if (array.includes(item?.dex)) {
          return
        }
        if (item?.dex === 'dedust') {
          if (!array.includes('DeDust')) {
            array.push('DeDust')
          }
        } else if (item?.dex === 'stonfi') {
          if (!array.includes('STONfi')) {
            array.push('STONfi')
          }
        }
      })
      if (array.length === 2) {
        return `${array[0]}, ${array[1]}`
      } else if (array.length === 1) {
        return `${array[0]}`
      }
    }
  },
  methods: {
    showMore() {
      this.showDistribution = true;
    },
    closeDistribution() {
      console.log('close');
      this.showDistribution = false;
    },
  },
  watch: {
    showDistribution: {
      handler() {
        document.documentElement.style.overflow = this.showDistribution ? 'hidden' : 'auto';
      },
    },
  },
};
</script>

<style scoped>
	.distribution {
		margin-bottom: 6px;
		display: flex;
		align-items: center;
		justify-content: space-between;
		cursor: pointer;
	}

	.distribution__group {
		display: flex;
		align-items: center;
	}

	.distribution__plan {
		display: flex;
		align-items: center;
		margin-right: 8px;
		padding: 7px 8px;
		border-radius: 10px;
		border: 1px solid rgba(85, 255, 133, 0.16);
		background: rgba(85, 255, 133, 0.04);
	}

	.theme-light .distribution__plan {
		border: 1px solid rgba(75, 179, 75, 0.24);
		background: rgba(75, 179, 75, 0.12);
	}

	.distribution__icon {
		width: 14px;
		height: 14px;
		margin-right: 4px;
	}

	.distribution__icon path {
		fill: var(--main-green);
	}

	.distribution__text {
		font-size: 11px;
		color: var(--main-green);
		line-height: 14px;
	}

	.distribution__desc {
		font-size: 11px;
		line-height: 18px;
		opacity: 0.5;
	}

	.distribution__arrow-icon path {
		fill: var(--main-text-color);
	}

	@media screen and (max-width: 640px) {
		.distribution {
			margin-top: 6px;
			margin-bottom: 0px;
		}
	}
</style>