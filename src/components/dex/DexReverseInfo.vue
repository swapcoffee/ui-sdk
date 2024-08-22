<template>
	<div class="info">
		<p class="info__text">
			{{ $t("dexInfo.reverseSwap[0]") }} <br>
			{{ $t("dexInfo.reverseSwap[1]") }}
		</p>
	</div>
</template>

<script lang="ts">
export default {
	name: "DexReverseInfo",
	data() {
		return {}
	}
}
</script>

<style scoped>
.info {
	padding: 12px;
	margin-bottom: 6px;
	border-radius: 12px;
	border: 1px solid rgba(255, 207, 85, 0.4);
	background: rgba(255, 207, 85, 0.06);
}

.info__text {
	font-size: 13px;
	line-height: 16px;
	letter-spacing: 0.4px;
	text-align: center;
	color: var(--main-yellow);
}

.theme-light .info {
	border: 1px solid rgba(255, 160, 0, 0.4);
	background: rgba(255, 160, 0, 0.06);
}


@media screen and (max-width: 640px) {
	.info {
		margin: 6px 0 0 0;
	}
}

</style>