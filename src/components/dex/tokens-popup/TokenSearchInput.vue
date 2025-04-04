<template>
	<label class="tokens-popup__label">
		<SearchIcon class="tokens-popup__search-icon" />
		<input
			type="search"
			class="tokens-popup__input"
			:placeholder="placeholder"
			v-model="inputValue"
			@input="onInput"
			@focus="handleFocus"
		>
		<button class="tokens-popup__remove-btn" v-show="inputValue.length > 0" @click="clearInput"></button>
	</label>
</template>

<script lang="ts">
import SearchIcon from '@/assets/dex/icons/SearchIcon.vue';
import { Address } from '@ton/core';
import { tokenService } from '@/api/coffeeApi/services';
import {useDexStore} from "@/stores/dex";

export default {
	components: {
		SearchIcon
	},
	props: {
		modelValue: {
			type: String,
			default: ''
		},
		placeholder: {
			type: String,
			default: 'Search...'
		}
	},
	data() {
		return {
			debounceTimeout: null,
		};
	},
	computed: {
    dexStore() {
      return useDexStore()
    },
		inputValue: {
			get() {
				return this.modelValue;
			},
			set(value) {
				this.$emit('update:modelValue', value);
			}
		}
	},
	methods: {
		onInput() {
			clearTimeout(this.debounceTimeout);

			this.debounceTimeout = setTimeout(() => {
				this.performSearch();
			}, 300);
		},
		async performSearch() {
			if (this.$parent.activeFilter && this.$parent.activeFilter.name !== 'all') {
				this.$emit('updateUnlistedToken', null);
				return;
			}

			if (this.isAddress(this.inputValue) || this.inputValue.length > 10) {
				try {
					let res = await tokenService.getSingleToken(this.inputValue);
					if (res && res.metadata) {
                        const rawAddress = Address.parse(this.inputValue).toRawString();
                        const balance = this.dexStore.GET_TON_TOKENS.find(token => token.address === rawAddress)?.balance;

                        const unlistedToken = {
                            ...res.metadata,
                            price_usd: 0,
                            balance: balance || 0,
                        }

						this.$emit('updateUnlistedToken', unlistedToken);
					} else {
						this.$emit('updateUnlistedToken', null);
					}
				} catch (err) {
					console.error(err);
					this.$emit('updateUnlistedToken', null);
				}
			} else {
				this.$emit('updateUnlistedToken', null);
			}
		},
		handleFocus() {
			if (window.innerWidth <= 640) {
				setTimeout(() => {
					document.documentElement.style.overflow = 'hidden';
				}, 1000);
			}
		},
		clearInput() {
			this.inputValue = '';
			this.$emit('updateUnlistedToken', null);
		},
		isAddress(value) {
			try {
				const parsedAddress = Address.parseFriendly(value);
				return !!parsedAddress.address;
			} catch (error) {
				return false;
			}
		},
		async getUnlistedToken() {
			try {
				let res = await tokenService.getSingleToken(this.inputValue);
				this.$emit('updateUnlistedToken', res?.metadata);
			} catch (err) {
				console.error(err);
			}
		}
	}
};
</script>

<style scoped>
.tokens-popup__label {
	position: relative;
	display: flex;
	align-items: center;
}

.tokens-popup__search-icon {
	position: absolute;
	z-index: 100;
	left: 15px;
	top: 15px;
	margin-right: 15px;
	width: 20px;
	height: 20px;
}

.tokens-popup__input {
	transition: 0.2s;
	width: 100%;
	height: 50px;
	padding: 14px 50px 11px 50px;
	margin-bottom: 20px;
	border: 2px solid transparent;
	outline: none;
	border-radius: 15px;
	background: var(--iface-white6);
	color: var(--main-text-color);
	font-size: 14px;
	line-height: 16px;
}

.tokens-popup__remove-btn {
	position: absolute;
	z-index: 100;
	top: 15px;
	right: 15px;
	width: 20px;
	height: 20px;
	border: none;
	outline: none;
	background: url('@/assets/dex/erase-icon.svg') no-repeat;
}

.tokens-popup__input:hover {
	background: var(--iface-white10);
}

.tokens-popup__input:focus {
	background: var(--iface-main-bg);
	border: 2px solid var(--iface-accent-color);
}

.active_input {
	background: var(--iface-main-bg);
	border: 2px solid var(--iface-accent-color);
}

.tokens-popup__input div div div {
	line-height: 16px;
}

.tokens-popup__input::placeholder {
	font-size: 14px;
	line-height: 16px;
	color: var(--main-text-color);
	opacity: 0.8;
}

input[type='search']::-webkit-search-decoration,
input[type='search']::-webkit-search-cancel-button,
input[type='search']::-webkit-search-results-button,
input[type='search']::-webkit-search-results-decoration {
	display: none;
}
</style>
