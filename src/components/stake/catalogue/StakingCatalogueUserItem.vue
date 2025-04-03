<template>
    <div class="catalogue__item">
        <router-link
            :to="{ name: 'Stake', params: { name: userStakeData.name.split(' ').join('-') } }"
            class="catalogue__meta"
            @click="stakeRedirectHandler"
        >
            <div class="catalogue__content">
                <div class="catalogue__main-info">
                    <div class="catalogue__img">
                        <img :src="getImgSrc" alt="catalogue-logo" class="icon">
                    </div>
                    <div class="catalogue__info">
                        <div class="catalogue__block-first">
                            <p class="catalogue__earned-amount">
                                {{ this.prettyNumber(calculateEarnedAmount.totalLockedAmountRaw, 2)}} {{ this.getTokenBySymbol().symbol }}
                                <span class="catalogue__earned-amount-position">
                                    ({{ getPositionsCount }}<span class="position-word"> {{ getPositionWord(getPositionsCount) }}</span>)
                                </span>
                            </p>
                            <p class="catalogue__earned-amount-usd">
                                ${{ this.prettyNumber(calculateEarnedAmount.totalLockedUsd, 2)}}
                            </p>
                        </div>
                    </div>
                </div>
                <div class="catalogue__apr-wrapper">
                    <div class="catalogue__block">
                        <p class="catalogue__earned-usd-block">
                            <GreenStarsIcon/>
                            <span class="catalogue__earned-usd">${{ this.prettyNumber(calculateEarnedUsd, 2) }}</span>
                        </p>
                        <p class="catalogue__total-earned">
                            {{ $t("stakeItem.totalEarned") }}
                        </p>
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
                    :to="{ name: 'Stake', params: { name: userStakeData.name.split(' ').join('-') } }"
                    class="deposit__actions-button"
                    @click="stakeRedirectHandler"
                >
                    <span> {{ $t("stakeMenu.now") }} </span>
                    <RightChevronIcon :isWhite="true"/>
                </router-link>
                <div
                    class="catalogue__actions-position-btn"
                    @click="togglePositions"
                    :class="{ 'catalogue__actions-position-btn--active': showPositions }"
                >
                    <span class="catalogue__actions-position-btn-text">{{ $t("stakeItem.position") }}</span>
                    <ChevronBottom :class="{ 'chevron--rotated': showPositions }"/>
                </div>
            </div>
        </div>
        <transition name="slide">
            <div v-if="showPositions" class="catalogue__positions">
                <div class="positions__wrapper">
                    <template v-if="isLoading">
                        <skeleton-item
                            v-for="n in getPositionsCount"
                            :key="`skeleton-${n}`"
                            class="skeleton__position"
                        />
                    </template>
                    <StakeItem
                        class="stake-item"
                        v-else
                        :tonConnectUi="tonConnectUi"
                        v-for="(position, index) in sortedPositions"
                        :key="position.id"
                        :position="position"
                    />
                </div>
            </div>
        </transition>
    </div>
</template>

<script>
import socialIcon from '@/assets/cashback/social.svg';
import telegramIcon from '@/assets/cashback/Telegram.svg';
import twitterIcon from '@/assets/cashback/x.svg';
import discordIcon from '@/assets/cashback/Discord.svg';
import {mapActions, mapGetters} from 'vuex';
import methodsMixins from '@/mixins/methodsMixins.js';
import dfcIcon from '@/assets/stake/dfc.png';
import GreenStarsIcon from "@/assets/stake/icons/GreenStarsIcon.vue";
import RightChevronIcon from "@/assets/stake/icons/RightChevronIcon.vue";
import ChevronBottom from "@/assets/earn/transfer-liquidity/ChevronBottom.vue";
import StakeItem from "@/components/stake/StakeItem.vue";
import {stakingService} from "@/api/coffeeApi/services/index.js";

export default {
    name: 'StakingCatalogueUserItem',
    components: {StakeItem, ChevronBottom, RightChevronIcon, GreenStarsIcon},
    mixins: [methodsMixins],
    props: {
        userStakeData: {
            type: Object,
            required: true,
        },
        tonConnectUi: {
            type: Object,
            default() {
                return {}
            }
        },
        activeStake: {
            type: String,
            default: null
        }
    },
    data() {
        return {
            isLoading: false,
            mediaReferences: {
                CES: {
                    description:
                        "The utility token for the swap.coffee project offers various benefits to its holders, including the ability to profit from the protocol.",
                    media: [
                        { id: "telegramm", icon: telegramIcon, link: "https://t.me/addlist/tShqOXNZ89tmYTg8" },
                        { id: "twitter", icon: twitterIcon, link: "https://x.com/swap_coffee_ton" },
                        { id: "discord", icon: discordIcon, link: "https://discord.com/invite/7wfjBH8pRu" },
                    ],
                },
                XROCK: {
                    description: "The utility token for the xRocket project.",
                    media: [
                        { id: "social", icon: socialIcon, link: "https://t.me/xrocket" },
                        { id: "telegramm", icon: telegramIcon, link: "https://t.me/xrocketnews" },
                        { id: "twitter", icon: twitterIcon, link: "https://x.com/xRocket_tg" },
                    ],
                },
                JETTON: {
                    description: "The utility token for the JetTon project.",
                    media: [
                        { id: "social", icon: socialIcon, link: "https://t.me/jetton" },
                        { id: "telegramm", icon: telegramIcon, link: "https://t.me/jettontoken_en" }
                    ],
                },
                DFC: {
                    description: "DFC Fund — an investment fund on the TON blockchain dedicated to fueling innovation and driving the future of decentralized finance.",
                    media: [
                        { id: "telegramm", icon: telegramIcon, link: "https://t.me/de_findercapital" }
                    ],
                },
            },
            showPositions: false,
        };
    },
    computed: {
        ...mapGetters([
            'GET_TON_TOKENS',
            'GET_STAKE_GLOBAL_INFO',
            'GET_STAKE_MASTER',
            'GET_DEX_WALLET',
            'GET_PROOF_VERIFICATION',
            'GET_STAKE_CATALOGUE_DATA',
            'GET_STAKE_WALLET_INFO',
            'GET_STAKE_USER_STAKES',
            'GET_STAKE_TRANSACTION_ID',
            'GET_STAKE_NATIVE',
            'GET_STAKE_BALANCES',
            'GET_STAKE_MERGED_TOKENS',
            'GET_STAKE_TOKEN',
            'GET_STAKE_TOKEN_DETAILS_DATA'
        ]),
        sortedPositions() {
            return this.GET_STAKE_WALLET_INFO?.positions
                ? [...this.GET_STAKE_WALLET_INFO.positions].sort((a, b) => a.start_lock_seconds_utc - b.start_lock_seconds_utc)
                : [];
        },
        getDescription() {
            return this.mediaReferences[this.userStakeData.name]?.description || null;
        },
        getPositionsCount() {
            return this.userStakeData.userStakingData.positions.length
        },
        calculateEarnedAmount() {
            const positions = this.userStakeData.userStakingData.positions;

            const result = positions.reduce(
                (acc, position) => {
                    acc.totalLockedUsd += position.locked_usd || 0;
                    acc.totalLockedAmountRaw += (position.locked_asset_amount_raw / Math.pow(10, this.getTokenBySymbol().decimals)) || 0;
                    return acc;
                },
                { totalLockedUsd: 0, totalLockedAmountRaw: 0 }
            );
            return result;
        },
        getImgSrc() {
            if (!this.userStakeData) return null;
            const token = this.getTokenBySymbol();

            if (token.symbol === 'DFC') {
                return dfcIcon;
            }

            return token?.image || null;
        },
        calculateEarnedUsd() {
            const paidRewards = this.userStakeData.userStakingData.paid_rewards;

            const totalEarnedUsd = paidRewards.reduce((acc, reward) => {
                acc += reward.asset_usd || 0;
                return acc;
            }, 0);

            return totalEarnedUsd;
        },
    },
    methods: {
        ...mapActions([
            'STAKE_GLOBAL_INFO',
            'STAKE_WALLET_INFO',
            'STAKE_USER_STAKES',
            'STAKE_WALLET_BALANCES',
            'STAKE_CLEAR_STORE',
            'STAKE_CATALOGUE_DATA',
            'STAKE_CATALOGUE_MASTER',
            'DEX_SEND_TOKEN',
            'STAKE_TOKEN',
            'STAKE_MAX',
            'STAKE_MERGED_TOKENS'
        ]),
        getPositionWord(number) {
            const currentLocale = this.$i18n.locale;

            if (currentLocale !== 'ru') {
                return this.$t("stakeItem.positionNumber");
            }

            const lastDigit = number % 10;
            const lastTwoDigits = number % 100;

            if (lastTwoDigits >= 11 && lastTwoDigits <= 19) {
                return this.$t("stakeItem.positionNumber") + 'й';
            }

            switch (lastDigit) {
                case 1:
                    return this.$t("stakeItem.positionNumber") + 'я';
                case 2:
                case 3:
                case 4:
                    return this.$t("stakeItem.positionNumber") + 'и';
                default:
                    return this.$t("stakeItem.positionNumber") + 'й';
            }
        },
        async togglePositions() {
            this.$emit('toggle-stake', this.userStakeData.name);

            const shouldOpen = !this.showPositions;
            this.showPositions = shouldOpen;

            if (shouldOpen) {
                this.isLoading = true;
                try {
                    const catalogueItem = this.GET_STAKE_CATALOGUE_DATA?.find(
                        item => item.name === this.userStakeData.name
                    );

                    if (catalogueItem) {
                        await this.loadStakeData(catalogueItem);
                    }
                } catch (error) {
                    console.error('Failed to process staking data:', error);
                    this.showPositions = false;
                } finally {
                    this.isLoading = false;
                }
            }
        },
        async loadStakeData(catalogueItem) {
            if (!this.GET_DEX_WALLET || !this.GET_PROOF_VERIFICATION) return;

            const masterAddress = catalogueItem.master_address;
            await this.STAKE_CATALOGUE_MASTER(masterAddress);

            const [globalInfo, userInfo, tokenBalance] = await Promise.all([
                stakingService.getStakingGlobalInfo(masterAddress),
                stakingService.getStakingUserInfo(
                    this.GET_DEX_WALLET.address,
                    this.GET_PROOF_VERIFICATION,
                    masterAddress
                ),
                stakingService.getStakingTokenBalance(
                    this.GET_DEX_WALLET.address,
                    this.GET_PROOF_VERIFICATION,
                    masterAddress
                )
            ]);
            await Promise.all([
                this.STAKE_GLOBAL_INFO(globalInfo.data),
                this.STAKE_WALLET_INFO(userInfo.data),
                this.STAKE_WALLET_BALANCES(tokenBalance.data)
            ]);

            if (globalInfo.data.locked_tokens) {
                const mergedTokens = globalInfo.data.locked_tokens.map((tokenData) => {
                    const matchingBalance = userInfo.data.balances?.find(
                        balance => balance.asset_address === tokenData.token.address.address
                    );

                    return {
                        ...tokenData,
                        balance: matchingBalance
                            ? {
                                asset_amount_raw: matchingBalance.asset_amount_raw,
                                asset_amount_usd: matchingBalance.asset_amount_usd
                            }
                            : {
                                asset_amount_raw: 0,
                                asset_amount_usd: 0
                            },
                        price_per_token_usd: tokenData.price_per_token_usd || 0
                    };
                });

                await this.STAKE_MERGED_TOKENS(mergedTokens);
            }
        },
        stakeRedirectHandler() {
            this.STAKE_CLEAR_STORE();
            this.STAKE_GLOBAL_INFO(this.userStakeData);
        },
        getTokenBySymbol(symbol = this.userStakeData.name) {
            if (symbol) {
                if (symbol === 'CES TEST') {
                    symbol = 'CES'
                }

                if (symbol === 'JETTON') {
                    return this.GET_STAKE_TOKEN_DETAILS_DATA.find(
                        (token) => token.address === '0:105e5589bc66db15f13c177a12f2cf3b94881da2f4b8e7922c58569176625eb5'
                    );
                }

                return this.GET_STAKE_TOKEN_DETAILS_DATA.find((find) => find.symbol === symbol)
            }
        }
    },
    async beforeMount() {
        const stakeName = this.$route.params.name;
        if (!this.GET_STAKE_CATALOGUE_DATA) {
            try {
                const { data } = await stakingService.getStakingCatalogueList();
                this.STAKE_CATALOGUE_DATA(data);
            } catch (error) {
                console.error(error);
            }
        }
        if (this.GET_STAKE_CATALOGUE_DATA) {
            const catalogueItem = this.GET_STAKE_CATALOGUE_DATA.find(
                item => item.name.split(' ').join('-') === stakeName
            );

            if (catalogueItem) {
                try {
                    const { data } = await stakingService.getStakingGlobalInfo(catalogueItem.master_address);
                    this.STAKE_GLOBAL_INFO(data);
                    await this.STAKE_CATALOGUE_MASTER(catalogueItem.master_address);
                } catch (error) {
                    console.error(error);
                }
            }
        }
    },
    beforeUnmount() {
        this.STAKE_CLEAR_STORE();
    },
    watch: {
        activeStake(newVal) {
            if (newVal !== this.userStakeData.name) {
                this.showPositions = false;
                this.isLoading = false;
            }
        },
        GET_STAKE_WALLET_INFO: {
            handler(newInfo) {
                if (newInfo?.positions) {
                    this.STAKE_USER_STAKES(newInfo.positions);
                } else {
                    this.STAKE_USER_STAKES([]);
                }
            }
        },
        GET_DEX_WALLET: {
            handler(newWallet) {
                if (!newWallet?.address) {
                    this.STAKE_CLEAR_STORE();
                }
            }
        }
    },
};
</script>

<style scoped>
.catalogue__content {
    width: 100%;
    display: flex;
    align-items: flex-start;
    gap: 10px;
}

.catalogue__main-info {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-grow: 1;
}

.catalogue__info {
    width: 100%;
}

.positions__wrapper {
    display: flex;
    flex-direction: column;
    margin-top: 14px;
    gap: 6px;
}

.catalogue__item {
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

.catalogue__img .icon{
    height: 38px;
    width: 38px;
    border-radius: 100px;
}

.catalogue__meta {
    height: 46px;
    display: flex;
    align-items: center;
    gap: 12px;
}

.catalogue__title span {
    opacity: 0.6;
}

.catalogue__spacer {
    margin-top: 14px;
    margin-bottom: 14px;
    display: block;
    height: 1px;
    background: var(--iface-white8);
}

.catalogue__description {
    font-family: Harmony-Regular, sans-serif;
    font-size: 13px;
    color: var(--main-text-color);
    font-weight: 400;
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

.slide-enter-active,
.slide-leave-active {
    transition: all 0.3s ease-out;
    max-height: 1000px;
    opacity: 1;
    overflow: hidden;
}

.slide-enter-from,
.slide-leave-to {
    max-height: 0;
    opacity: 0;
    overflow: hidden;
}

.chevron--rotated {
    transform: rotateX(180deg);
    transition: transform 0.2s ease;
}

.catalogue__actions-position-btn :deep(svg) {
    transition: transform 0.2s ease;
}

.catalogue__actions-position-btn {
    display: flex;
    align-items: center;
    font-family: Harmony-Medium, sans-serif;
    font-size: 13px;
    padding: 7px 12px;
    background: var(--iface-white10);
    border-radius: 12px;
    cursor: pointer;
    transition: .2s all;
}

.theme-light .catalogue__actions-position-btn {
    color: var(--main-text-color);
}

.catalogue__actions-position-btn:hover {
    background: var(--iface-white12);
}

.catalogue__actions-position-btn-text {
    margin-right: 4px;
}

.catalogue__info {
    width: 100%;
    display: flex;
    justify-content: space-between;
}

.catalogue__earned-amount {
    display: flex;
    align-items: center;
    font-weight: 500;
    font-size: 18px;
    line-height: 24px;
    color: var(--main-text-color);
    margin-bottom: 4px;
}

.catalogue__earned-amount-position {
    font-weight: 400;
    font-size: 18px;
    line-height: 24px;
    color: var(--main-text-color);
    opacity: 0.6;
    margin-left: 6px;
}

.catalogue__earned-amount-usd {
    font-weight: 400;
    font-size: 14px;
    line-height: 17px;
    color: var(--main-text-color);
    opacity: 0.6;
}

.catalogue__earned-usd-block {
    display: flex;
    align-items: center;
    justify-content: right;
    font-weight: 400;
    font-size: 18px;
    line-height: 24px;
    color: var(--main-green);
    margin-bottom: 4px;
}

.catalogue__earned-usd {
    margin-left: 6px;
}

.catalogue__total-earned {
    font-family: Harmony-Regular, sans-serif;
    font-weight: 400;
    font-size: 13px;
    line-height: 16px;
    color: var(--main-text-color);
    opacity: 0.6;
    text-align: right;
}

.position-word {
    margin-left: 3px;
}

.skeleton__position {
    width: 100%;
    height: 66px;
    border-radius: 14px;
    background-color: var(--iface-white4);
}

@media screen and (max-width: 576px) {
    .catalogue__spacer {
        display: none;
    }

    .catalogue__block {
        display: flex;
        align-items: center;
        justify-content: space-between;
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
        max-height: 53px;
        justify-content: space-between;
        width: calc(100% + 28px);
        margin-left: -14px;
        padding: 14px 14px;
        border-top: 1px solid var(--iface-white8);
        border-bottom: 1px solid var(--iface-white8);
    }

    .catalogue__earned-usd-block {
        justify-content: flex-start;
        margin-bottom: 4px;
    }

    .catalogue__total-earned {
        text-align: left;
    }

    .catalogue__footer {
        padding-top: 14px;
    }

    .catalogue__earned-amount {
        font-size: 20px;
        line-height: 24px;
    }

    .catalogue__earned-amount-position {
        font-size: 20px;
        line-height: 24px;
    }

    .position-word {
        display: none;
    }

    .catalogue__positions {
        margin: 0 -8px;
    }
}
</style>
