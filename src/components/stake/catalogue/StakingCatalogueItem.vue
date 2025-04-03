<template>
    <div class="catalogue__item">
        <router-link
            :to="{ name: 'Stake', params: { name: catalogueItemData.name.split(' ').join('-') } }"
            class="catalogue__meta"
            @click="stakeRedirectHandler"
        >
            <div class="catalogue__content">
                <div class="catalogue__main-info">
                    <div class="catalogue__img">
                        <img :src="getImgSrc" alt="catalogue-logo" class="icon">
                    </div>
                    <div class="catalogue__info">
                        <div class="catalog__info-name">
                            <p class="catalogue__symbol">
                                {{ catalogueItemData.name }}
                            </p>
                            <p class="catalogue__title">
                                {{ getTokenName }}
                            </p>
                        </div>
                        <p class="catalogue__tvl">
                            TVL: ${{ getTvl }}
                        </p>
                    </div>
                </div>
                <div class="catalogue__apr-wrapper">
                    <div class="catalogue__apr-number">
                        <GreenStarsIcon/>
                        <span class="catalogue__apr-amount">APR ≈ {{ getApr }}%</span>
                    </div>
                    <div class="catalogue__apr-text-wrapper">
                        <div class="catalogue__apr-text">
                            <div
                                class="info-wrapper"
                                @mouseenter="showTooltip = true"
                                @mouseleave="showTooltip = false"
                                @click.stop.prevent="toggleTooltip"
                            >
                                <svg
                                    class="tokens__info-icon"
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="16"
                                    height="16"
                                    viewBox="0 0 16 16"
                                    fill="none"
                                >
                                    <g opacity="0.5">
                                        <path
                                            d="M8 1.5C6.71442 1.5 5.45772 1.88122 4.3888 2.59545C3.31988 3.30968 2.48676 4.32484 1.99479 5.51256C1.50282 6.70028 1.37409 8.00721 1.6249 9.26809C1.8757 10.529 2.49477 11.6872 3.40381 12.5962C4.31285 13.5052 5.47104 14.1243 6.73192 14.3751C7.99279 14.6259 9.29973 14.4972 10.4874 14.0052C11.6752 13.5132 12.6903 12.6801 13.4046 11.6112C14.1188 10.5423 14.5 9.28558 14.5 8C14.4982 6.27665 13.8128 4.62441 12.5942 3.40582C11.3756 2.18722 9.72335 1.50182 8 1.5ZM7.75 4.5C7.89834 4.5 8.04334 4.54399 8.16668 4.6264C8.29002 4.70881 8.38615 4.82594 8.44291 4.96299C8.49968 5.10003 8.51453 5.25083 8.48559 5.39632C8.45665 5.5418 8.38522 5.67544 8.28033 5.78033C8.17544 5.88522 8.04181 5.95665 7.89632 5.98559C7.75083 6.01453 7.60003 5.99968 7.46299 5.94291C7.32595 5.88614 7.20881 5.79001 7.1264 5.66668C7.04399 5.54334 7 5.39834 7 5.25C7 5.05109 7.07902 4.86032 7.21967 4.71967C7.36032 4.57902 7.55109 4.5 7.75 4.5ZM8.5 11.5C8.23479 11.5 7.98043 11.3946 7.7929 11.2071C7.60536 11.0196 7.5 10.7652 7.5 10.5V8C7.36739 8 7.24022 7.94732 7.14645 7.85355C7.05268 7.75979 7 7.63261 7 7.5C7 7.36739 7.05268 7.24021 7.14645 7.14645C7.24022 7.05268 7.36739 7 7.5 7C7.76522 7 8.01957 7.10536 8.20711 7.29289C8.39465 7.48043 8.5 7.73478 8.5 8V10.5C8.63261 10.5 8.75979 10.5527 8.85356 10.6464C8.94732 10.7402 9 10.8674 9 11C9 11.1326 8.94732 11.2598 8.85356 11.3536C8.75979 11.4473 8.63261 11.5 8.5 11.5Z"
                                            fill="white"
                                        />
                                    </g>
                                </svg>
                                <transition name="tooltip">
                                    <tooltip-wrapper
                                        v-show="showTooltip === true"
                                        class="btn-tooltip custom-tooltip"
                                        @hidden-tooltip="hiddenTooltip"
                                    >
                                        {{ $t("stakeItem.aprTooltip") }}
                                    </tooltip-wrapper>
                                </transition>
                            </div>
                            <span class="dynamic-apr-span">Dynamic APR</span>
                        </div>
                    </div>
                </div>
            </div>
        </router-link>
        <div class="catalogue__spacer"></div>
        <div class="catalogue__footer">
            <div class="catalogue__description">
                {{ getDescription }}
            </div>
            <div class="catalogue__actions">
                <router-link
                    :to="{ name: 'Stake', params: { name: catalogueItemData.name.split(' ').join('-') } }"
                    @click="stakeRedirectHandler"
                >
                    <span class="deposit__actions-button">
                        {{ $t("stakeMenu.now") }}
                        <RightChevronIcon :isWhite="true"/>
                    </span>
                </router-link>
                <a
                    v-for="media in mediaItems"
                    :key="media.id"
                    :href="media.link"
                    class="media__item"
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    @click.stop
                >
                    <img class="media__icon" :src="media.icon" :alt="media.id">
                </a>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import socialIcon from '@/assets/cashback/social.svg';
import telegramIcon from '@/assets/cashback/Telegram.svg';
import twitterIcon from '@/assets/cashback/x.svg';
import dfcIcon from '@/assets/stake/dfc.png'
import discordIcon from '@/assets/cashback/Discord.svg';
import {mapActions, mapGetters} from 'vuex';
import computedMixins from '@/mixins/computedMixins.ts';
import methodsMixins from '@/mixins/methodsMixins.ts';
import GreenStarsIcon from "@/assets/stake/icons/GreenStarsIcon.vue";
import RightArrowIcon from "@/assets/earn/transfer-liquidity/RightArrowIcon.vue";
import RightChevronIcon from "@/assets/stake/icons/RightChevronIcon.vue";
import TooltipWrapper from "@/components/ui/TooltipWrapper.vue";

export default {
    name: 'StakingCatalogueItem',
    components: {
        TooltipWrapper,
        RightChevronIcon,
        RightArrowIcon,
        GreenStarsIcon,
    },
    mixins: [computedMixins, methodsMixins],
    data() {
        return {
            showTooltip: false,
            mediaReferences: {
                CES: {
                    description:
                        "The utility token for the swap.coffee project offers various benefits to its holders, including the ability to profit from the protocol.",
                    media: [
                        {id: "telegramm", icon: telegramIcon, link: "https://t.me/addlist/tShqOXNZ89tmYTg8"},
                        {id: "twitter", icon: twitterIcon, link: "https://x.com/swap_coffee_ton"},
                        {id: "discord", icon: discordIcon, link: "https://discord.com/invite/7wfjBH8pRu"},
                    ],
                },
                XROCK: {
                    description: "The utility token for the xRocket project.",
                    media: [
                        {id: "social", icon: socialIcon, link: "https://t.me/xrocket"},
                        {id: "telegramm", icon: telegramIcon, link: "https://t.me/xrocketnews"},
                        {id: "twitter", icon: twitterIcon, link: "https://x.com/xRocket_tg"},
                    ],
                },
                JETTON: {
                    description: "The utility token for the JetTon project.",
                    media: [
                        {id: "social", icon: socialIcon, link: "https://t.me/jetton"},
                        {id: "telegramm", icon: telegramIcon, link: "https://jetton.fan/?click=ceGAQC9KdFs"}
                    ],
                },
                DFC: {
                    description: "DFC Fund — an investment fund on the TON blockchain dedicated to fueling innovation and driving the future of decentralized finance.",
                    media: [
                        {id: "telegramm", icon: telegramIcon, link: "https://t.me/de_findercapital"}
                    ],
                },
            },
        };
    },
    props: {
        catalogueItemData: {
            type: Object,
            required: true,
        },
        stakingCatalogueItem: {
            type: Object,
            required: true
        }
    },
    computed: {
        ...mapGetters(['GET_TON_TOKENS', 'GET_STAKE_CATALOGUE_DATA', 'GET_STAKE_PROCESSED_CATALOGUE', 'GET_STAKE_TOKEN_DETAILS_DATA']),
        getTokenName() {
            if (!this.catalogueItemData?.name) return null;
            if (this.catalogueItemData.name === 'CES TEST') return 'swap.coffee (TEST)';
            const token = this.getTokenBySymbol();
            return token?.name || null;
        },
        getDescription() {
            return this.mediaReferences[this.catalogueItemData.name]?.description || null;
        },
        getImgSrc() {
            if (!this.stakingCatalogueItem || !this.catalogueItemData) return null;
            const token = this.getTokenBySymbol();

            if (token.symbol === 'DFC') {
                return dfcIcon;
            }

            return token?.image || null;
        },
        getApr() {
            if (!this.stakingCatalogueItem || !this.catalogueItemData) return 0;
            return this.prettyNumber(this.stakingCatalogueItem?.apr, 2);
        },
        getTvl() {
            if (!this.stakingCatalogueItem || !this.catalogueItemData) return 0;
            const token = this.getTokenBySymbol();
            if (!token) return 0;
            return this.prettyNumber(
                (this.stakingCatalogueItem?.total_locked_native / Math.pow(10, token.decimals)) * token.price_usd,
                0
            );
        },
        mediaItems() {
            return this.mediaReferences[this.catalogueItemData.name]?.media || [];
        },
    },
    methods: {
        ...mapActions(['STAKE_GLOBAL_INFO']),
        toggleTooltip(event) {
            event.preventDefault();
            event.stopPropagation();
            this.showTooltip = !this.showTooltip;
        },
        hiddenTooltip() {
            this.showTooltip = false;
        },
        stakeRedirectHandler() {
            if (this.stakingCatalogueItem) {
                this.STAKE_GLOBAL_INFO(this.stakingCatalogueItem);
            }
        },
        getTokenBySymbol(symbol = this.catalogueItemData.name) {
            if (symbol) {
                if (symbol === 'CES TEST') {
                    symbol = 'CES';
                }

                if (symbol === 'JETTON') {
                    return this.GET_STAKE_TOKEN_DETAILS_DATA.find(
                        (token) => token.address === '0:105e5589bc66db15f13c177a12f2cf3b94881da2f4b8e7922c58569176625eb5'
                    );
                }

                return this.GET_STAKE_TOKEN_DETAILS_DATA.find((find) => find.symbol === symbol);
            }
        }
    },
    mounted() {
    }
};
</script>

<style scoped>
.custom-tooltip :deep(.close-btn) {
    display: none !important;
}

.custom-tooltip :deep(.tooltip__arrow--bottom),
.custom-tooltip :deep(.tooltip__arrow--top) {
    display: none !important;
}

.catalogue__content {
    width: 100%;
    display: flex;
    align-items: flex-start;
    gap: 10px;
}

.catalogue__main-info {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-grow: 1;
}

.catalogue__item {
    position: relative;
    width: 100%;
    padding: 14px;
    display: flex;
    flex-direction: column;
    background: var(--iface-white4);
    border-radius: 14px;
}

.theme-light .media__icon {
    filter: invert(100%);
}

.theme-light .deposit__actions-button {
    color: white;
}

.catalogue__img {
    height: 38px;
    width: 38px;
}

.catalogue__img .icon {
    height: 38px;
    width: 38px;
    background-color: transparent;
    border-radius: 100px;
}

.catalogue__meta {
    height: 46px;
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;
}

.catalogue__symbol {
    color: var(--main-text-color);
    font-weight: 500;
    font-size: 18px;
    line-height: 24px;
}

.catalogue__title {
    color: var(--main-text-color);
    font-size: 18px;
    font-weight: 400;
    opacity: 0.6;
    line-height: 24px;
}

.catalog__info-name {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-bottom: 4px;
}

.catalogue__tvl {
    color: var(--main-text-color);
    font-size: 14px;
    font-weight: 400;
    line-height: 17px;
    opacity: 0.6;
}

.catalogue__apr-wrapper {
    display: flex;
    flex-direction: column;
    text-align: right;
    margin-left: auto;
    flex-shrink: 0;
}

.catalogue__apr-text-wrapper {
    height: 16px;
    position: relative;
    display: inline-block;
}

.catalogue__apr-number {
    font-family: Harmony-Regular, sans-serif;
    display: flex;
    color: var(--main-green);
    font-weight: 400;
    font-size: 18px;
    line-height: 24px;
    margin-bottom: 4px;
    text-align: right;
}

.catalogue__apr-amount {
    margin-left: 6px;
}

.catalogue__apr-text {
    font-family: Harmony-Regular, sans-serif;
    font-weight: 400;
    font-size: 13px;
    line-height: 16px;
    color: var(--main-text-color);
    text-align: right;
    display: flex;
    align-items: center;
    justify-content: flex-end;
}

.catalogue__spacer {
    margin-top: 14px;
    margin-bottom: 14px;
    display: block;
    height: 1px;
    background: var(--iface-white6);
}

.media__item {
    position: relative;
    z-index: 5;
    width: 44px;
    height: 32px;
    transition: background-color 0.2s ease;
    border-radius: 12px;
    display: flex;
    justify-content: center;
    align-items: center;
    border: none;
    background: var(--iface-white6);
}

.media__item:hover {
    background: var(--iface-white10);
}

.catalogue__description {
    font-family: Harmony-Regular, sans-serif;
    font-size: 13px;
    color: var(--main-text-color);
    opacity: 0.6;
    margin-bottom: 14px;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
}

.catalogue__actions {
    display: flex;
    gap: 8px;
}

.deposit__actions-button {
    font-family: Harmony-Medium, sans-serif;
    align-items: center;
    padding: 7px 12px;
    max-height: 32px;
    font-size: 13px;
    background: var(--iface-accent-color);
    color: var(--main-text-color);
    outline: none;
    border: none;
    border-radius: 12px;
    display: flex;
    gap: 4px;
}

.deposit__actions-button:hover {
    background: var(--iface-accent-hover);
}

.btn-tooltip {
    bottom: 25px;
    left: 50%;
    transform: translateX(-49.5%);
    min-width: 200px;
    width: 200px;
}

.tokens__info-icon {
    cursor: help;
}

.theme-light .tokens__info-icon {
    filter: invert(1);
}

.dynamic-apr-span {
    margin-left: 3px;
    opacity: 0.6;
}

.info-wrapper {
    position: relative;
    display: inline-flex;
    align-items: center;
}

.tooltip-enter-active,
.tooltip-leave-active {
    transition: 0.1s ease-out;
}

.tooltip-enter-from,
.tooltip-leave-to {
    opacity: 0;
}

.custom-tooltip :deep(.close-btn) {
    display: none !important;
}

.custom-tooltip :deep(.tooltip__arrow--bottom),
.custom-tooltip :deep(.tooltip__arrow--top) {
    display: none !important;
}

@media screen and (max-width: 640px) {
    .info-wrapper {
        position: static;
    }

    .btn-tooltip[data-v-8facfdbc] {
        width: calc(100% - 10px);
        left: -92px;
        right: 5px;
        top: -79px;
        bottom: auto;
        transform: translateX(0);
    }
}

@media screen and (max-width: 576px) {
    .btn-tooltip {
        left: 7%;
    }

    .catalogue__spacer {
        display: none;
    }

    .catalogue__symbol {
        font-weight: 500;
        font-size: 20px;
        line-height: 24px;
    }

    .catalogue__title {
        font-weight: 400;
        font-size: 20px;
        line-height: 24px;
    }

    .catalogue__content {
        flex-direction: column;
        gap: 0;
    }

    .catalogue__main-info {
        width: 100%;
        padding: 0 0 14px 0;
    }

    .catalogue__meta {
        height: auto;
    }

    .catalogue__apr-wrapper {
        justify-content: space-between;
        flex-direction: row;
        align-items: center;
        width: calc(100% + 28px);
        margin-left: -14px;
        padding: 14px 14px;
        border-top: 1px solid var(--iface-white6);
        border-bottom: 1px solid var(--iface-white6);
    }

    .catalogue__apr-number {
        justify-content: flex-start;
        margin-bottom: 0;
    }

    .catalogue__apr-text {
        text-align: left;
    }

    .catalogue__footer {
        padding-top: 14px;
    }

    .apr__tooltip {
        position: absolute;
        bottom: -437%;
        left: -9%;
        transform: translateX(-55%);
        margin-bottom: 8px;
        z-index: 10;
        min-width: 200px;
    }
}
</style>
