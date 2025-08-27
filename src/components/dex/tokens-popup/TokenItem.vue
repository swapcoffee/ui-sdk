<template>
    <li class="tokens-popup__item" v-if="!isStakingRewards" :class="itemClasses">
        <div class="item__group">
            <div class="item__image-block">
                <img
                    :src="item?.image"
                    alt="Token logo in TON blockchain"
                    class="item__image"
                    v-if="item?.image !== 'null'"
                    @error="imageError"
                >
                <img
                    src="../../../assets/dex/default.svg"
                    alt="token without logo"
                    class="item__image"
                    @error="imageError"
                    v-else
                >
            </div>
            <div class="item__info">
                <div class="item__info-group">
                    <p class="item__name">
                        {{ item?.symbol }}
                    </p>
                    <a :href="`https://tonviewer.com/${item?.address}`" target="_blank" class="item__link" v-if="item?.address !== 'native'">
                        <ShareIcon class="item__link-icon"/>
                    </a>
                    <template v-if="showTags">
                        <InterfaceTag
                            v-for="(tag, index) in getDisplayTags"
                            :key="index"
                            :tag="tag.name"
                            :color="tag.color"
                            :show-icon="true"
                        />
                    </template>
                </div>
                <p class="item__stake-tag" v-if="getLPTokenTag">
                    POINTS x2.5
                </p>
                <div class="item__group" v-if="status !== 'unlisted' && !showAsImported && !isStakingPage && hasData">
                    <UpPriceArrowIcon class="item__price-arrow up-price" v-if="item?.price_change_24h > 0"/>
                    <DownPriceArrowIcon class="item__price-arrow down-price" v-else/>
                    <p
                        v-if="typeof getTokenPrice !== 'object'"
                        :class="['item__price price-for-one', item?.price_change_24h > 0 ? 'up-price' : 'down-price']">
                        {{ getTokenPrice }}
                    </p>
                    <span
                        v-else
                        :class="['price-part price-for-one', item?.price_change_24h > 0 ? 'up-price' : 'down-price']"
                    >
                        {{ '$' + getTokenPrice?.left }}
                        <sub class="price-sub">{{ getTokenPrice?.subText }}</sub>
                        {{ getTokenPrice?.right }}
                    </span>
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
                <p class="item__status" v-if="status === 'unlisted' && !showAsImported">
                    Not on the list
                </p>
                <div class="import__info" v-if="showAsImported">
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
            <div class="item__pin-group" v-if="status !== 'unlisted' && !isStakingPage && !isLimitPage">
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
                    @error="imageError"
                >
                <img
                    src="../../../assets/dex/default.svg"
                    alt="token without logo"
                    class="item__image"
                    @error="imageError"
                    v-else
                >
            </div>
            <div class="item__info">
                <div class="item__group">
                    <p class="item__name">
                        {{ item?.symbol }}
                    </p>
                    <a :href="`https://tonviewer.com/${item?.address}`" target="_blank" class="item__link" v-if="item?.address !== 'native'">
                        <ShareIcon class="item__link-icon"/>
                    </a>
                </div>
                <div class="item__group" v-if="status !== 'unlisted' && !showAsImported">
                    <UpPriceArrowIcon class="item__price-arrow up-price" v-if="item?.price_change_24h > 0"/>
                    <DownPriceArrowIcon class="item__price-arrow down-price" v-else/>
                    <p
                        v-if="typeof getTokenPrice !== 'object'"
                        :class="['item__price price-for-one', item?.price_change_24h > 0 ? 'up-price' : 'down-price']">
                        {{ getTokenPrice }}
                    </p>
                    <span
                        v-else
                        :class="['price-part price-for-one', item?.price_change_24h > 0 ? 'up-price' : 'down-price']"
                    >
                        {{ '$' + getTokenPrice?.left }}
                        <sub class="price-sub">{{ getTokenPrice?.subText }}</sub>
                        {{ getTokenPrice?.right }}
                    </span>
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
                <p class="item__status" v-if="showAsImported">
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
import { useDexStore } from "@/stores/dex"
import methodsMixins from "@/mixins/methodsMixins.ts";
import InterfaceTag from "@/components/ui/InterfaceTag.vue";
import UpPriceArrowIcon from "@/assets/dex/icons/UpPriceArrowIcon.vue";
import DownPriceArrowIcon from '@/assets/dex/icons/DownPriceArrowIcon.vue';
import LiquidityIcon from '@/assets/dex/icons/LiquidityIcon.vue';
import HoldersIcon from '@/assets/dex/icons/HoldersIcon.vue';
import NotActivePinIcon from '@/assets/dex/icons/NotActivePinIcon.vue';
import ActivePinIcon from '@/assets/dex/icons/ActivePinIcon.vue';
import computedMixins from "@/mixins/computedMixins.ts";
import ShareIcon from "@/assets/earn/pool-page/ShareIcon.vue";

export default {
    name: "TokenItem",
    components: {
        ShareIcon,
        ActivePinIcon,
        NotActivePinIcon,
        HoldersIcon,
        LiquidityIcon,
        DownPriceArrowIcon,
        UpPriceArrowIcon,
        InterfaceTag
    },
    inject: [
        'pinTokenHandler',
        'unpinTokenHandler',
        'tokenRemovedHandler',
        'enableCommunityTokens'
    ],
    mixins: [methodsMixins, computedMixins],
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
        isLastItem: {
            type: Boolean,
            default: false
        },
        totalItems: {
            type: Number,
            default: 0
        }
    },
	data() {
		return {
		}
	},
    computed: {
        dexStore() {
            return useDexStore()
        },
        itemClasses() {
            return {
                'is-last-item': this.isLastItem && (this.isStakingPage || this.totalItems >= 6)
            }
        },
        showAsImported() {
            const addCommunity = this.enableCommunityTokens ?? false
            const isCommunity = this.item?.verification === 'COMMUNITY'
            const isImported = this.item?.imported === true

            if (isCommunity && addCommunity) {
                return false
            }

            return isImported
        },
        isLimitPage() {
            return this.getRouteName === 'Limit' || this.getRouteName === 'Dca'
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
            return this.item?.symbol?.endsWith(' LP') === true
        },
        showTags() {
            return this.getDisplayTags.length > 0
        },
        getActiveTags() {
            return (this.item.labels || []).map(label => this.dexStore.GET_TOKEN_LABELS.find(tokenLabel => tokenLabel.id === label.label_id))
        },
        getDisplayTags() {
            const tags = [...this.getActiveTags]

            if (this.item?.verification === 'COMMUNITY') {
                tags.push({ name: 'community', id: 'community' })
            }

            if (this.item?.verification === 'WHITELISTED') {
                tags.push({ name: 'whitelisted', id: 'whitelisted' })
            }

            const activeFilterTag = tags.find(tag => tag && tag.name === this.activeFilter.name)
            if (activeFilterTag) {
                const otherTags = tags.filter(tag => tag && tag.name !== this.activeFilter.name)
                return [activeFilterTag, ...otherTags].slice(0, 4)
            }

            return tags.slice(0, 4)
        },
		getTokenPrice() {
			let value = this.item?.price_usd
			if (!value || value === 0) return `$0`

			if (value >= 1000) {
				let filteredNum = this.prettyNumber(value, 2)
				return `$${filteredNum}`
			} else if (Number(value.toFixed(3)) >= 0.001) {
				const formatted = this.formatWithoutRounding(value, this.getPricePrecision(value))
				return `$${formatted}`
			} else if (value < 1) {
				return this.getSmallAmount(value)
			} else {
				return `$${value ?? 0}`
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
					return reduceNum
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
					return reduceNum
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

            this.tokenRemovedHandler(importedToken);

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
        pinToken(item) {
            this.pinTokenHandler(item);
            let pinnedTokens = JSON.parse(localStorage.getItem('pinnedTokens')) || [];
            if (!pinnedTokens.some(token => token.address === item.address)) {
                pinnedTokens.push(item);
                localStorage.setItem('pinnedTokens', JSON.stringify(pinnedTokens));
            }
        },
        unpinToken(item) {
            this.unpinTokenHandler(item);
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
            let staticTokens = [
                'native',
                '0:a5d12e31be87867851a28d3ce271203c8fa1a28ae826256e73c506d94d49edad',
                '0:b113a994b5024a16719f69139328eb759596c38a25f59028b146fecdc3621dfe'
            ]
            let findItem = staticTokens.find((find) => find === item?.address)
            return !!findItem
        },
    },
}
</script>

<style scoped>
.tokens-popup__item {
    transition: .2s;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 16px;
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

.tokens-popup__item.is-last-item:hover {
    border-radius: 0 0 12px 12px;
    background: var(--iface-white6);
}

.active_item {
    opacity: 0.5;
}

.item__info-group {
    margin-bottom: 6px;
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
    width: 32px;
    height: 32px;
    margin-right: 8px;
    border-radius: 100px;
}

.item__image {
    width: 32px;
    height: 32px;
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
    font-weight: 500;
    font-size: 14px;
    line-height: 18px;
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

.price-part {
    display: flex;
    height: 16px;
    font-size: 13px;
    line-height: 16px;
    opacity: 0.8;
    text-align: end;
    align-items: center;
}

.price-sub {
    padding: 8px 1px 0 1px;
    font-family: inherit;
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
    font-family: Harmony-Regular, sans-serif;
    font-weight: 400;
    font-size: 12px;
    margin-right: 6px;
}

.info-line {
    margin-right: 6px;
    width: 1px;
    height: 10px;
    background: var(--iface-white14);
}

.item__tvl-count {
    font-family: Harmony-Regular, sans-serif;
    font-weight: 400;
    margin-right: 6px;
    font-size: 12px;
    opacity: 0.8;
}

.item__holders-count {
    font-family: Harmony-Regular, sans-serif;
    font-weight: 400;
    font-size: 12px;
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
    display: flex;
    align-items: center;
    justify-content: center;
    margin-left: 10px;
    border: none;
    outline: none;
    background-color: transparent;
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

@media screen and (max-width: 576px) {
    .tokens-popup__item:last-child:hover {
        border-radius: 0;
    }
}
</style>
