<template>
	<div class="main-color">
		<slot></slot>
	</div>
</template>

<script lang="ts">
export default {
	name: "main-color",
	data() {
		return {}
	}
}
</script>

<style scoped>
	.main-color {
		background: var(--iface-main-bg);
	}
</style>