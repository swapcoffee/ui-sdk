<template>
	<div class="popup-background"
		 @click.self="$emit('closeDistribution')"
	>
		<div class="distribution">
			<div class="distribution__menu">
				<h2 class="distribution__heading">{{ getCaption }}</h2>
				<button class="distribution__close-btn"
						@click="$emit('closeDistribution')"
				>
					<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
						<g opacity="0.8">
							<path d="M19.2806 18.2194C19.3502 18.2891 19.4055 18.3718 19.4432 18.4628C19.4809 18.5539 19.5003 18.6515 19.5003 18.75C19.5003 18.8485 19.4809 18.9461 19.4432 19.0372C19.4055 19.1282 19.3502 19.2109 19.2806 19.2806C19.2109 19.3503 19.1281 19.4056 19.0371 19.4433C18.9461 19.481 18.8485 19.5004 18.7499 19.5004C18.6514 19.5004 18.5538 19.481 18.4628 19.4433C18.3717 19.4056 18.289 19.3503 18.2193 19.2806L11.9999 13.0603L5.78055 19.2806C5.63982 19.4214 5.44895 19.5004 5.24993 19.5004C5.05091 19.5004 4.86003 19.4214 4.7193 19.2806C4.57857 19.1399 4.49951 18.949 4.49951 18.75C4.49951 18.551 4.57857 18.3601 4.7193 18.2194L10.9396 12L4.7193 5.78062C4.57857 5.63989 4.49951 5.44902 4.49951 5.25C4.49951 5.05097 4.57857 4.8601 4.7193 4.71937C4.86003 4.57864 5.05091 4.49958 5.24993 4.49958C5.44895 4.49958 5.63982 4.57864 5.78055 4.71937L11.9999 10.9397L18.2193 4.71937C18.36 4.57864 18.5509 4.49958 18.7499 4.49958C18.949 4.49958 19.1398 4.57864 19.2806 4.71937C19.4213 4.8601 19.5003 5.05097 19.5003 5.25C19.5003 5.44902 19.4213 5.63989 19.2806 5.78062L13.0602 12L19.2806 18.2194Z" fill="white"/>
						</g>
					</svg>
				</button>
			</div>
			<div class="distribution__scroll-block custom-scroll">
				<div class="distribution__tokens-list">
					<div class="distribution__flex"
						 v-for="(route, index) in getRoutes.slice(0, routeCount)"
						 :key="index"
					>
						<div class="distribution__group">
							<div class="distribution__dex-info">
								<img :src="route.dex.imageUrl" alt="DEX logo" class="distribution__route-image">
								<p class="distribution__percentage">{{ route.inputPercentage }}%</p>
							</div>
							<p class="distribution__route-path">{{ route.path }}</p>
						</div>
					</div>
					<button class="distribution__toggle-btn"
							v-if="getRoutes.length > 4"
							@click="showMore"
					>
						{{ getBtnText }}
					</button>
				</div>
			</div>
		</div>
	</div>
</template>

<script lang="ts">
import transactionRoutesMixin from "@/mixins/transactionRoutesMixin";

export default {
  name: "DistributionPopup",
  mixins: [transactionRoutesMixin],
  data() {
    return {
      routeCount: 4,
    };
  },
  computed: {
    getCaption() {
      return window.innerWidth > 640
          ? this.$t("dexDistribution.caption[0]")
          : this.$t("dexDistribution.caption[1]");
    },
    getBtnText() {
      return this.routeCount === 4 ? "Show all" : "Hide all";
    },
  },
  methods: {
    showMore() {
      this.routeCount = this.routeCount === 4 ? 20 : 4;
    },
  },
};
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

.distribution {
	width: 460px;
	z-index: 999;
	padding: 18px;
	background: var(--iface-main-bg);
	border-radius: 20px;
}

.distribution__menu {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 18px;
}

.distribution__heading {
	font-size: 24px;
	line-height: 28px;
	font-family: Roboto, sans-serif;
	font-weight: 500;
}

.distribution__close-btn {
	width: 24px;
	height: 24px;
	background: transparent;
	border: none;
	outline: none;
}

.distribution__scroll-block {
	max-height: 223px;
	height: auto;
	overflow-y: auto;
}

.distribution__tokens-list {
	display: flex;
	flex-direction: column;
	border-radius: 14px;
	overflow: hidden;
	gap: 1px 0;
}

.distribution__dex-info {
	font-size: 16px;
	text-align: center;
}

.distribution__flex {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 3px;
	background: var(--iface-white8);
	padding: 8px 12px 8px 8px;
}

.distribution__route-image {
	margin-right: 6px;
	width: 18px;
	height: 18px;
	border-radius: 100px;
}

.distribution__dex-info {
	display: flex;
	align-items: center;
	padding: 6px;
	margin-right: 6px;
	border-radius: 10px;
	background: var(--iface-white6);
	min-width: 82px;
}

.distribution__route-path {
	font-size: 13px;
	line-height: 16px;
}

.distribution__percentage {
	font-size: 14px;
	line-height: 16px;
	color: var(--main-green);
}

.distribution__toggle-btn {
	padding: 10px 12px;
	border: none;
	background: var(--iface-white4);
	font-family: Roboto, sans-serif;
	font-weight: 400;
	font-size: 13px;
	color: var(--main-text-color);
}

.distribution__group {
	display: flex;
	flex-direction: row;
	align-items: center;
}

.theme-light svg path {
	fill: #141414;
}

.custom-scroll::-webkit-scrollbar {
	display: none;
}

@media screen and (max-width: 640px) {
	.distribution {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		width: 100%;
		border-radius: 20px 20px 0 0;
		display: flex;
		flex-direction: column;
	}

	.distribution__scroll-block {
		max-height: none;
		height: auto;
		overflow-y: auto;
	}
}

@media screen and (max-height: 680px) {
	.distribution {
		max-height: 100dvh;
	}
}
</style>
