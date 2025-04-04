<template>
	<li class="tokens-popup__item" v-if="!isStakingRewards">
		<div class="item__group">
			<div class="item__image-block">
				<img
          :src="item?.image"
          alt="Token logo in TON blockchain"
          class="item__image"
          v-if="item?.image !== 'null'"
        >
				<img
          src="../../../assets/dex/default.svg"
          alt="token without logo"
          class="item__image"
          v-else
        >
			</div>
			<div class="item__info">
				<div class="item__info-group">
					<p class="item__name">
            {{ item?.symbol }}
          </p>
					<a :href="`https://tonviewer.com/${item?.address}`" target="_blank" class="item__link" v-if="item?.address !== 'native'">
            <TonviewerLinkIcon class="item__link-icon"/>
					</a>
					<InterfaceTag
						v-for="(tag, index) in getPriorityTag"
						:key="index"
						:tag="tag.name"
						:color="tag.color"
					/>
				</div>
				<p class="item__stake-tag" v-if="getLPTokenTag">
          POINTS x2.5
        </p>
				<div class="item__group" v-if="status !== 'unlisted' && item?.imported !== true && !isStakingPage && hasData">
          <UpPriceArrowIcon class="item__price-arrow up-price" v-if="item?.price_change_24h > 0"/>
          <DownPriceArrowIcon class="item__price-arrow down-price" v-else/>
					<p class="item__price price-for-one" :class="item?.price_change_24h > 0 ? 'up-price' : 'down-price'">
						{{ getTokenPrice }}
					</p>
					<div class="item__group" v-if="!isStakingPage" v-show="item?.type !== 'native'">
						<div class="info-line"></div>
						<LiquidityIcon class="item__icon"/>
						<p class="item__tvl-count">
              {{ getTokenTvl }}
            </p>
						<div class="info-line"></div>
						<HoldersIcon class="item__icon"/>
						<p class="item__holders-count">
              {{ getTokenHolders }}
            </p>
					</div>
				</div>
        <div class="item__holders-count" v-if="!hasData"> {{ $t("dexTokens.noData") }} </div>
        <p class="item__status" v-if="status === 'unlisted'">
          Not on the list
        </p>
        <div class="import__info" v-if="item?.imported === true">
          <p class="item__holders-count">
            Imported
          </p>
          <div class="info-line"></div>
          <p class="item__status remove__import" @click="removeImportedToken(item, $event)"> Remove </p>
        </div>
      </div>
		</div>
		<div class="item__group">
			<div class="item__info">
				<p class="item__balance">
					{{ getTokenBalance }}
				</p>
				<p class="item__price">
          {{ getTotalPrice }}
        </p>
			</div>
			<div class="item__pin-group" v-if="status !== 'unlisted' && !isStakingPage">
				<button class="item__pin-btn" @click.stop="pinToken(item)" :disabled="userPinnedTokens.length === 3" v-show="!checkItemIsPinned(item)">
          <NotActivePinIcon class="item__pin-icon"/>
				</button>
				<button class="item__pin-btn" @click.stop="unpinToken(item)" :disabled="isStaticToken(item)" v-show="checkItemIsPinned(item)">
          <ActivePinIcon class="item__pin-icon active-pin"/>
				</button>
			</div>
		</div>
	</li>
	<li class="tokens-popup__item item" v-else>
		<div class="item__group">
			<div class="item__image-block">
				<img
          :src="item?.image"
          alt="Token logo in TON blockchain"
          class="item__image"
          v-if="item?.image !== 'null'"
        >
				<img
          src="../../../assets/dex/default.svg"
          alt="token without logo"
          class="item__image" v-else
        >
			</div>
			<div class="item__info">
				<div class="item__group">
					<p class="item__name">
            {{ item?.symbol }}
          </p>
					<a :href="`https://tonviewer.com/${item?.address}`" target="_blank" class="item__link" v-if="item?.address !== 'native'">
						<TonviewerLinkIcon class="item__link-icon"/>
					</a>
				</div>
				<div class="item__group" v-if="status !== 'unlisted' && item?.imported !== true">
          <UpPriceArrowIcon class="item__price-arrow up-price" v-if="item?.price_change_24h > 0"/>
          <DownPriceArrowIcon class="item__price-arrow down-price" v-else/>
					<p class="item__price price-for-one" :class="item?.price_change_24h > 0 ? 'up-price' : 'down-price'">
						{{ getTokenPrice }}
					</p>
					<div class="item__group" v-if="!isStakingPage" v-show="item?.type !== 'native'">
						<div class="info-line"></div>
            <LiquidityIcon class="item__icon"/>
						<p class="item__tvl-count">
              {{ getTokenTvl }}
            </p>
						<div class="info-line"></div>
            <HoldersIcon class="item__icon"/>
						<p class="item__holders-count">
              {{ getTokenHolders }}
            </p>
					</div>
				</div>
				<p class="item__status" v-if="status === 'unlisted'">
          Not on the list
        </p>
				<p class="item__status" v-if="item?.imported === true">
          Imported
        </p>
			</div>
		</div>
		<div class="item__group">
			<div class="item__info">
				<p class="item__balance">
					{{ (item.asset_raw / Math.pow(10, item.decimals)).toFixed(6) }}
				</p>
				<p class="item__price">
          ${{ item.asset_usd.toFixed(6) }}
        </p>
			</div>
		</div>
	</li>
</template>

<script lang="ts">
import methodsMixins from "@/mixins/methodsMixins.ts";
import InterfaceTag from "@/components/ui/InterfaceTag.vue";
import TonviewerLinkIcon from '@/assets/dex/icons/TonviewerLinkIcon.vue';
import UpPriceArrowIcon from '@/assets/dex/icons/UpPriceArrowIcon.vue';
import DownPriceArrowIcon from '@/assets/dex/icons/DownPriceArrowIcon.vue';
import LiquidityIcon from '@/assets/dex/icons/LiquidityIcon.vue';
import HoldersIcon from '@/assets/dex/icons/HoldersIcon.vue';
import NotActivePinIcon from '@/assets/dex/icons/NotActivePinIcon.vue';
import ActivePinIcon from '@/assets/dex/icons/ActivePinIcon.vue';
import {useDexStore} from "@/stores/dex";

export default {
	name: "TokenItem",
	components: {
    ActivePinIcon,
    NotActivePinIcon,
    HoldersIcon,
    LiquidityIcon,
    DownPriceArrowIcon,
    UpPriceArrowIcon,
    TonviewerLinkIcon,
    InterfaceTag
  },
	mixins: [methodsMixins],
	props: {
		item: {
			type: Object,
			default() {
				return {}
			},
			required: true
		},
		userPinnedTokens: {
			type: Array,
			default() {
				return []
			}
		},
		userUnpinnedTokens: {
			type: Array,
			default() {
				return []
			}
		},
		status: {
			type: String,
			default() {
				return ''
			}
		},
		tonPrice: {
			type: Number,
			default() {
				return 0
			}
		},
		activeFilter: {
			type: Object,
			default() {
				return {}
			}
		},
		isStakingPage: {
			type: Boolean,
			default() {
				return false
			}
		},
		isStakingRewards: {
			type: Boolean,
			default() {
				return false
			}
		},
	},
	data() {
		return {
			activeTags: [],
		}
	},
	computed: {
    dexStore() {
      return useDexStore()
    },
    hasData() {
      if (this.status !== 'unlisted' && this.item?.imported !== true) {
        return (
          this.getTokenPrice !== '$0' ||
          this.getTokenTvl !== 0 ||
          this.getTokenHolders !== 0 ||
          this.getTotalPrice !== '$0' ||
          this.getTokenBalance !== 0
        );
      }
      return true
    },
		getLPTokenTag() {
			return this.item?.symbol === "STON.fi LP" || this.item?.symbol === "DeDust LP";
		},
		getPriorityTag() {
			if (this.activeTags.length <= 1) {
				return this.activeTags
			} else if (this.activeTags.length > 1) {
				let priorityTags = this.activeTags.sort((a, b) => b.id - a.id)
				if (this.activeFilter.name === 'all') {
					return [priorityTags[0]]
				} else {
					return [this.activeFilter]
				}
			}
		},
		getTokenPrice() {
			let value = this.item?.price_usd
			if (value) {
				if (value >= 1000) {
					let filteredNum = this.prettyNumber(value, 2)
					return `$${filteredNum}`
				} else if (Number.isInteger(value)) {
					return `$${value}`
				} else if (Number(value.toFixed(2)) > 0.01) {
					return `$${value.toFixed(2)}`
				} else if (Number(value.toFixed(4)) > 0.0001) {
					return `$${value.toFixed(4)}`
				} else {
					return `$${value.toFixed(4)}`
				}
			} else {
				return `$0`
			}
		},
		getTotalPrice() {
			if (!this.isStakingPage) {
				if (this.item?.balance > 0) {
					let total = this.item?.price_usd * this.item?.balance;

					if (total > 0 && total < 0.01) {
						return `$${total.toFixed(6)}`;
					}

					return `$${total.toFixed(2)}`;
				} else {
					return `$0`;
				}
			} else {
				const balance = this.item?.price_usd.toFixed(2);
				return '$' + balance;
			}
		},
		getTokenTvl() {
			if (this.item?.tvl) {
				let tvlInTon = this.item?.tvl / this.tonPrice
				let reduceNum = this.filterBalance(tvlInTon)
				if (typeof reduceNum === 'number') {
					if (Number.isInteger(reduceNum)) {
						return reduceNum
					} else {
						return reduceNum.toFixed(1)
					}
				} else if (typeof reduceNum === 'object') {
					return reduceNum.result + reduceNum.unit
				} else {
					return 0
				}
			} else {
				return 0
			}
		},
		getTokenHolders() {
			if (this.item?.holders_count) {
				let reduceNum = this.filterBalance(this.item?.holders_count)
				if (typeof reduceNum === 'number') {
					if (Number.isInteger(reduceNum)) {
						return reduceNum
					} else {
						return reduceNum.toFixed(1)
					}
				} else if (typeof reduceNum === 'object') {
					return reduceNum.result + reduceNum.unit
				} else {
					return 0
				}
			} else {
				return 0
			}
		},
		getTokenBalance() {
			if (this.item?.balance > 0) {
				let balance = this.item?.balance;

				if (balance > 0 && balance < 0.01) {
					return this.prettyNumber(balance, 6);
				}

				return this.prettyNumber(balance, 2);
			} else {
				return 0;
			}
		},
	},
	methods: {
    removeImportedToken(importedToken, event) {
      event.stopPropagation();
      event.preventDefault();

      const tokens = JSON.parse(localStorage.getItem('importTokens'))
        .filter(token => token.address !== importedToken.address);
      localStorage.setItem('importTokens', JSON.stringify(tokens));

      this.dexStore.GET_TON_TOKENS.forEach(token => {
        if (token.address === importedToken.address) {
          token.imported = false;
        }
      });

      if (this.dexStore.GET_SEND_TOKEN?.address === importedToken?.address) {
        this.dexStore.DEX_SEND_TOKEN(
          this.dexStore.GET_TON_TOKENS.find(token => token.address === 'native')
        );

        const url = new URL(window.location.href);
        if (url.searchParams.get('ft') !== 'TON') {
          url.searchParams.set('ft', 'TON');
          window.history.replaceState({}, '', url);
        }
      }
    },
    findLabels() {
			if (this.item.hasOwnProperty("labels")) {
				this.item?.labels.forEach((label) => {
					let find = this.dexStore.GET_TOKEN_LABELS.find((findItem) => label.label_id === findItem.id)
					if (find) {
						this.activeTags.push(find)
					}
				})
			}
		},
		pinToken(item) {
			this.$emit('pinToken', item);
			let pinnedTokens = JSON.parse(localStorage.getItem('pinnedTokens')) || [];
			if (!pinnedTokens.some(token => token.address === item.address)) {
				pinnedTokens.push(item);
				localStorage.setItem('pinnedTokens', JSON.stringify(pinnedTokens));
			}
		},
		unpinToken(item) {
			this.$emit('unpinToken', item);
			let pinnedTokens = JSON.parse(localStorage.getItem('pinnedTokens')) || [];
			pinnedTokens = pinnedTokens.filter(token => token.address !== item.address);
			localStorage.setItem('pinnedTokens', JSON.stringify(pinnedTokens));
		},
		checkItemIsPinned(item) {
			let pinTokens = []
			this.dexStore.GET_PINNED_TOKENS.slice().forEach((findItem) => {
				let findInUnpin = this.userUnpinnedTokens.find((find) => find?.address === findItem?.address)
				if (findInUnpin) {
					return
				}
				pinTokens.push(findItem)
			})
			let findNative = this.dexStore.GET_PINNED_TOKENS.findIndex((item) => item?.address === 'native')
			pinTokens.splice(findNative, 1)

      let findItem = this.userPinnedTokens.find((find) => find?.address === item?.address);
      let findInStock = pinTokens.find((findToken) => findToken?.address === item?.address);

			if (findItem || findInStock || item.type === 'native') {
				return true
			} else {
				return false
			}
		},
		isStaticToken(item) {
			let staticTokens = ['native', '0:a5d12e31be87867851a28d3ce271203c8fa1a28ae826256e73c506d94d49edad', '0:b113a994b5024a16719f69139328eb759596c38a25f59028b146fecdc3621dfe']
			let findItem = staticTokens.find((find) => find === item?.address)
			if (findItem) {
				return true
			} else {
				return false
			}
		}
	},
	mounted() {
		this.findLabels()
	}
}
</script>

<style scoped>
.tokens-popup__item {
	transition: .2s;
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 8px 18px;
	cursor: pointer;
}

.item {
	padding: 10px;
	border-radius: 12px;
	background: var(--iface-white4);
}

.tokens-popup__item:hover {
  background: var(--iface-white6);
}

.active_item {
  opacity: 0.5;
}

.item__info-group {
	margin-bottom: 4px;
	display: flex;
	align-items: center;
	gap: 6px;
}

.item__group {
  display: flex;
  align-items: center;
}

.item__info {
  display: flex;
  flex-direction: column;
}

.item__image-block {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 34px;
  height: 34px;
  margin-right: 12px;
  border-radius: 100px;
}

.item__image {
  width: 34px;
  height: 34px;
  border-radius: 100px;
}

.empty-image {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 100px;
}

.item__name {
	font-family: Harmony-Medium, sans-serif;
	font-size: 14px;
}

.item__link {
	display: flex;
	transition: .2s;
	opacity: 0.6;
}

.item__link-icon {
  width: 16px;
  height: 16px;
}

.item__link:hover {
  opacity: 1;
}

.item__balance {
  margin-bottom: 5px;
  font-size: 14px;
  font-family: Harmony-Medium, sans-serif;
  text-align: end;
}

.item__price {
  font-size: 13px;
  line-height: 16px;
  opacity: 0.8;
  text-align: end;
}

.item__price-arrow {
  margin-right: 4px;
  width: 14px;
  height: 14px;
}

.up-price {
  color: var(--main-green);
}

.down-price {
  color: var(--main-red);
}

.item__stake-tag {
	display: flex;
	justify-content: center;
	align-items: center;
	border-radius: 8px;
	padding: 4px 6px;
	background: rgba(255, 86, 177, 0.10);
	color: #FF56B1;
	font-size: 12px;
	font-weight: 500;
	max-width: 81px;
	max-height: 23px;
}

.price-for-one {
  margin-right: 6px;
}

.info-line {
  margin-right: 6px;
  width: 1px;
  height: 10px;
  background: var(--iface-white14);
}

.item__tvl-count {
  margin-right: 6px;
  font-size: 13px;
  line-height: 16px;
  opacity: 0.8;
}

.item__holders-count {
  font-size: 13px;
  line-height: 16px;
  opacity: 0.8;
}

.import__info {
  display: flex;
  align-items: center;
  margin: 0;
  gap: 5px;
}

.import__info .item__status {
  margin: 0;
}

.import__info .info-line {
  margin: 0;
}

.remove__import {
  color: var(--main-red);
  transition: 0.2s all;
}

.remove__import:hover {
  text-decoration: underline;
}


.item__icon {
  margin-right: 4px;
  width: 14px;
  height: 14px;
}

.item__status {
	margin-right: 10px;
	font-size: 13px;
	line-height: 16px;
	letter-spacing: 0.4px;
	color: var(--iface-accent-color);
}

.item__pin-btn {
  position: relative;
  z-index: 10;
  all: unset;
  margin-left: 15px;
  padding: 9px 0;
  width: 18px;
  height: 18px;
}

.item__pin-btn:disabled {
  opacity: 0.3;
}

.theme-light svg path {
  fill: #141414;
}

.theme-light .active-pin path {
  fill: var(--iface-accent-color);
}

.theme-light .up-price path {
  fill: var(--main-green);
}

.theme-light .down-price path {
  fill: var(--main-red);
}
</style>
