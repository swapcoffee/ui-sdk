<template>
	<div class="dex__info">
		<div class="dex__high-price">
			<svg class="dex__info-icon" xmlns="http://www.w3.org/2000/svg" width="19" height="18" viewBox="0 0 19 18" fill="none">
				<path d="M2.75 9C2.75 12.7274 5.77181 15.75 9.5 15.75C13.2282 15.75 16.25 12.7274 16.25 9C16.25 5.27181 13.2282 2.25 9.5 2.25C5.77181 2.25 2.75 5.27181 2.75 9Z" stroke="#FFCF55" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
				<path d="M9.50428 11.7699V8.5452M9.5 6.26569V6.21826" stroke="#FFCF55" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
			</svg>
			<p class="dex__info-text">{{ $t("dexInfo.exactOut") }}</p>
		</div>
		<p class="dex__description">{{ $t("dexInfo.reverseSwap") }}</p>
	</div>
</template>

<script lang="ts">
export default {
  name: 'DexReverseInfo',
  data() {
    return {};
  },
};
</script>

<style scoped>
.dex__info {
	padding: 12px;
	border-radius: 12px;
	border: 1px solid var(--iface-white6);
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
}

.dex__high-price {
	margin-bottom: 5px;
	display: flex;
	align-items: center;
	justify-content: center;
}

.dex__info-icon {
	margin-right: 5px;
}

.theme-light .dex__info-icon path {
	fill: var(--main-yellow);
}

.dex__info-text {
	font-size: 14px;
	line-height: 17px;
	font-weight: 500;
	letter-spacing: 0.1px;
	color: var(--main-yellow);
}

.dex__description {
	font-size: 13px;
	line-height: 16px;
	text-align: center;
	opacity: 0.6;
	letter-spacing: 0.4px;
}

@media screen and (max-width: 640px) {
	.dex__info {
		margin-top: 6px;
		margin-bottom: 0;
	}
}
</style>
