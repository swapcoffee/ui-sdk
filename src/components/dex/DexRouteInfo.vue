<template>
	<div class="route-info">
		<div class="cashback">
			<div class="cashback__wrapper">
				<div class="route-info__group">
					<svg class="cashback__icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none">
						<path d="M12.4622 7.4569C13.0259 7.03519 14.3444 6.04817 15.4083 5.25135C15.6687 5.0559 16.0526 5.26187 15.994 5.56707C15.7915 6.63226 15.3026 9.95939 15.0147 11.9507C14.8861 12.8407 14.0654 13.5 13.0942 13.5H4.9082C3.937 13.5 3.11628 12.8407 2.98695 11.9515C2.699 9.96011 2.20934 6.63377 2.00599 5.56783C1.94742 5.26262 2.33135 5.05666 2.59164 5.25135C3.65556 6.04893 4.97327 7.03519 5.53777 7.4569C5.68825 7.56966 5.90217 7.55388 6.03069 7.41932C6.61389 6.81418 8.11948 5.24985 8.73361 4.61163C8.8768 4.46279 9.1232 4.46279 9.26639 4.61163C9.87967 5.24985 11.3853 6.81418 11.9685 7.41932C12.0978 7.55388 12.3118 7.56966 12.4622 7.4569Z" stroke="#C172FF" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
						<path d="M10 10H8" stroke="#C172FF" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
					</svg>
					<p class="cashback__text">{{ $t("dexRouteInfo.cashback") }}</p>
				</div>
				<p class="cashback__text">{{ getEstimatedCashback }}</p>
			</div>
		</div>
		<div class="distribution"
			 @click="showMore"
		>
			<div class="distribution__wrapper">
				<div class="route-info__group">
					<svg class="distribution__icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none">
						<path d="M6.33909 4.06927L11.5519 4.05762C12.7164 4.0553 13.6603 5.00083 13.6557 6.1645L13.6526 6.9866C13.648 8.14328 12.7086 9.07875 11.5527 9.07875H6.56034C5.40054 9.07875 4.46045 10.0188 4.46045 11.1779V11.9867C4.46045 13.1465 5.40132 14.0874 6.56112 14.0867L15.3139 14.0828" stroke="#32D74B" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
						<path d="M15.3131 14.0829L13.6455 15.7505" stroke="#32D74B" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
						<path d="M13.6455 12.416L15.3131 14.0835" stroke="#32D74B" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
						<path fill-rule="evenodd" clip-rule="evenodd" d="M6.32426 4.06887C6.32426 5.0734 5.50993 5.88774 4.50539 5.88774C3.50087 5.88774 2.68652 5.0734 2.68652 4.06887C2.68652 3.06433 3.50087 2.25 4.50539 2.25C5.50993 2.25 6.32426 3.06433 6.32426 4.06887Z" stroke="#32D74B" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
					</svg>
					<p class="distribution__text">{{ planDisplay }}</p>
				</div>
				<div class="route-info__group">
					<p class="distribution__desc">{{ $t('dexRouteInfo.plan', {dexNames: getDexNames}) }}</p>
					<p class="distribution__desc_mob">{{ $t('dexRouteInfo.shortPlan', {dexNames: getDexNames}) }}</p>
					<svg class="distribution__arrow-icon" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none">
						<path d="M5.25 2.91665L9.33333 6.99998L5.25 11.0833" stroke="#32D74B" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
					</svg>
				</div>
			</div>
		</div>
		<DistributionPopup
			v-if="showDistribution"
			@closeDistribution="closeDistribution"
		/>
	</div>
</template>

<script lang="ts">
import {defineAsyncComponent} from "vue";
import { useDexStore } from "@/stores/dex/index.js";

export default {
	name: "DexRouteInfo",
	components: {
		DistributionPopup: defineAsyncComponent(() => {
			return import("@/components/dex/DistributionPopup.vue")
		})
	},
	data() {
		return {
			showDistribution: false,
		}
	},
	computed: {
    dexStore() {
      return useDexStore();
    },
		getEstimatedCashback() {
			let cashback = this.dexStore.GET_DEAL_CONDITIONS?.estimated_cashback_usd
			let count = 2
			if (cashback && cashback > 0) {
				while (Number(cashback.toFixed(count)) <= 0) {
					count++
				}
				return `~ $${cashback.toFixed(count)}`
			} else {
				return ''
			}
		},
		planDisplay() {
			return `${this.getSplitCount} Split + ${this.getHopCount} Hop`
		},
		getSplitCount() {
			return this.dexStore.GET_DEAL_CONDITIONS?.paths.length
		},
		getHopCount() {
			let count = 0
			const paths = this.dexStore.GET_DEAL_CONDITIONS?.paths
			for (const routeStart of paths) {
				function traverse(current) {
					count++
					if (current.next?.length > 0) {
						for (const next of current.next) {
							traverse(next)
						}
					}
				}

				traverse(routeStart)
			}
			// this.GET_DEAL_CONDITIONS?.paths.forEach((item) => {
			// 	count++
			// 	if (item?.next) {
			// 		count += item.next.length
			// 	}
			// })
			return count
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
				} else if (item?.dex === 'stonfi' || item?.dex === 'stonfi_v2') {
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
			this.showDistribution = true
		},
		closeDistribution() {
			this.showDistribution = false
		}
	},
	watch: {
		showDistribution: {
			handler: function () {
				if (this.showDistribution) {
					document.documentElement.style.overflow = 'hidden'
					return
				}
				document.documentElement.style.overflow = 'auto'
			}
		},
	}
}
</script>

<style scoped>
	.route-info {
		border-radius: 12px;
		overflow: hidden;
	}

	.cashback {
		margin-bottom: 1px;
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.cashback__wrapper {
		display: flex;
		align-items: center;
		justify-content: space-between;
		width: 100%;
		padding: 8px 8px;
		background: rgba(193, 114, 255, 0.10);
	}

	.route-info__group {
		display: flex;
		align-items: center;
		gap: 6px;
	}

	.cashback__icon {
		min-width: 18px;
		width: 18px;
		height: 18px;
	}

	.cashback__text {
		font-size: 12px;
		color: var(--main-purple);
		line-height: 15px;
	}

	.distribution {
		display: flex;
		align-items: center;
		justify-content: space-between;
		cursor: pointer;
	}

	.distribution__wrapper {
		transition: .2s;
		display: flex;
		align-items: center;
		justify-content: space-between;
		width: 100%;
		padding: 8px 8px;
		background: rgba(50, 215, 75, 0.10);
	}

	.distribution__wrapper:hover {
		background: rgba(50, 215, 75, 0.16);
	}

	.theme-light .distribution__wrapper {
		background: rgba(1, 166, 67, 0.10);
	}

	.theme-light .distribution__wrapper:hover {
		background: rgba(1, 166, 67, 0.16);
	}

	.distribution__icon {
		width: 18px;
		height: 18px;
	}

	.distribution__icon path {
		stroke: var(--main-green);
	}

	.distribution__text,
	.distribution__desc {
		font-size: 12px;
		color: var(--main-green);
		line-height: 15px;
	}

	.distribution__desc_mob {
		display: none;
	}

	.distribution__arrow-icon path {
		stroke: var(--main-green);
	}

	@media screen and (max-width: 460px) {
		.distribution__desc {
			display: none;
		}

		.distribution__desc_mob {
			display: block;
			font-size: 12px;
			color: var(--main-green);
			line-height: 15px;
		}
	}
</style>
