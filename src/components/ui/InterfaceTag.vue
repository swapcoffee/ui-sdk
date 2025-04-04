<template>
	<div class="tag" :style="{backgroundColor: getBackgroundColor}" :class="color.length === 0 ? getClass : ''">
		<p class="tag__name" :style="{color: color}">{{ getLabelName }}</p>
	</div>
</template>

<script lang="ts">
export default {
	name: "InterfaceTag",
	props: {
		tag: {
			type: String,
			default() {
				return 'soon'
			},
			required: true
		},
		color: {
			type: String,
			default() {
				return ''
			}
		}
	},
	data() {
		return {}
	},
	computed: {
		getBackgroundColor() {
			return this.color + '1A'
		},
		getClass() {
			if (this.tag === 'new') {
				return 'green_color'
			} else if (this.tag === 'cashback') {
				return 'purple_color'
			} else if (this.tag === 'contest') {
				return 'purple_color'
			} else {
				return 'gray_color'
			}
		},
		getLabelName() {
			if (this.tag === 'new') {
				return this.$t('interfaceTag.new')
			} else if (this.tag === 'cashback') {
				return this.$t('interfaceTag.cashback')
			} else if (this.tag === 'contest') {
				return this.$t('interfaceTag.contest')
			} else {
				return this.$t('interfaceTag.soon')
			}
		}
	}
}
</script>

<style scoped>
	.tag {
		padding: 4px 6px;
		border-radius: 8px;
		background: var(--iface-white6);
	}

	.tag__name {
		font-size: 12px;
		line-height: 14px;
		font-weight: 500;
	}

	.green_color {
		background: var(--tag-green-bg);
	}

	.purple_color {
		background: var(--tag-purple-bg);
	}

	.gray_color {
		background: var(--iface-white6);
	}


	.green_color .tag__name {
		color: var(--main-green);
	}

	.purple_color .tag__name {
		color: var(--main-purple);
	}

	.gray_color .tag__name {
		color: var(--main-text-color);
	}
</style>
