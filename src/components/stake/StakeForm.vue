<template>
    <div class="stake__form">
        <StakeFormTabs
            v-if="!hideButtons"
            v-model="selectedButton"
            class="stake-buttons-margin"
        />
        <div class="form__wrapper" v-if="effectiveSelectedTab === 'new'">
            <h2 class="form__title">{{ $t("stakeFormInfo.earn") }} <span>${{ calculateIncome }}</span> {{ $t("stakeFormInfo.yearly") }} </h2>
            <p class="form__desc">{{ $t("stakeFormInfo.estimated", {points: calculatePoints.formattedResult}) }}</p>
            <div class="form__buttons">
                <template v-if="!GET_STAKE_GLOBAL_INFO?.periods">
                    <skeleton-item
                        v-for="i in 3"
                        :key="i"
                        class="skeleton__period-btn"
                    />
                </template>
                <template v-else>
                    <button v-for="period in GET_STAKE_GLOBAL_INFO.periods"
                            :key="period.period_id"
                            class="btn select__btn period__btn"
                            :class="{ active: GET_STAKE_PERIOD_ID === period.period_id }"
                            @click="selectPeriod(period.period_id)">
                        <span class="btn__text">{{ convertSecondsToTime(period.lock_duration) }}</span>
                        <span v-if="period.percentage > 0" class="bonus-label" :class="bonusClass(period.percentage)">
                            x{{ ((100 + period.percentage) / 100).toFixed(2) }}
                        </span>
                    </button>
                </template>
            </div>
            <SwapField
                :title="$t('stakeForm.stake')"
                :token="GET_STAKE_TOKEN"
                position="up"
            />
            <StakeRange/>
            <StakeButton :tonConnectUi="tonConnectUi"/>
        </div>
        <div v-else>
            <UserStakes class="user-stakes" :tonConnectUi="tonConnectUi"/>
        </div>
    </div>
    <StakeFormInfo
        class="staking__form-details"
        :points="calculatePoints.formattedResult"
        :apr="`≈ ${String(getApr)}%`"
        v-if="effectiveSelectedTab === 'new'"
    />
    <TokensPopup
        :mode="tokenMode"
        @closePopup="closePopup"
        v-if="showTokens"
        :isStakingPage="true"
        :stakeTokens="tokenData"
    />
</template>

<script lang="ts">
import StakeButton from "@/components/stake/StakeButton.vue";
import StakeRange from "@/components/stake/StakeRange.vue";
import UserStakes from "@/components/stake/UserStakes.vue";
import {mapActions, mapGetters} from "vuex";
import TokensPopup from "@/components/dex/tokens-popup/TokensPopup.vue";
import {disablePageScroll, enablePageScroll} from "scroll-lock";
import {Address} from "@ton/core";
import methodsMixins from '@/mixins/methodsMixins.ts';
import SwapField from "@/components/swap-interface/SwapField.vue";
import StakeFormInfo from "@/components/stake/StakeFormInfo.vue";
import StakeFormTabs from "@/components/stake/StakeFormTabs.vue";

export default {
    name: "StakeForm",
    props: {
        tonConnectUi: {
            type: Object,
            default: () => ({})
        },
        showPopup: {
            type: Boolean,
            default: false
        },
        hideButtons: {
            type: Boolean,
            default: false
        },
        selectedTab: {
            type: String,
            default: null
        }
    },
    provide() {
        return {
            tokenValues: this.tokenValues,
            updateFirstToken: this.changeFirstToken,
            updateTokenModalVisible: this.chooseSendToken,
            updateFirstValue: this.changeFirstValue,
        }
    },
    emits: ["closePopup", "update:selectedTab"],
    components: {
        StakeFormTabs,
        StakeFormInfo,
        SwapField,
        TokensPopup,
        UserStakes,
        StakeRange,
        StakeButton,
    },
    mixins: [methodsMixins],
    data() {
        return {
            selectedButton: 'new',
            tokenMode: 'SEND',
            showTokens: false,
            tokenValues: {
                first: '0',
            }
        }
    },
    computed: {
        ...mapGetters([
            'GET_DEX_WALLET',
            'GET_STAKE_GLOBAL_INFO',
            'GET_STAKE_PERIOD_ID',
            'GET_STAKE_TOKEN',
            'GET_STAKE_VALUE',
            'GET_STAKE_USER_STAKES',
            'GET_TON_TOKENS',
            'GET_STAKE_BALANCES',
            'GET_STAKE_MERGED_TOKENS'
        ]),
        effectiveSelectedTab() {
            return this.selectedTab !== null ? this.selectedTab : this.selectedButton;
        },
        getApr() {
            if (this.GET_STAKE_GLOBAL_INFO) {
                const apr = this.GET_STAKE_GLOBAL_INFO?.apr;

                return apr ? apr.toFixed(2) : '0.00';
            }
        },
        decimals() {
            return this.GET_STAKE_TOKEN?.decimals ?? 9;
        },
        normalizer() {
            return this.findTokenInMergedTokens(this.GET_STAKE_TOKEN?.address)?.normalizer;
        },
        tokenData() {
            return this.GET_STAKE_MERGED_TOKENS ?? [];
        },
        calculateIncome() {
            if (!this.GET_STAKE_GLOBAL_INFO?.actual_rewards || !this.GET_STAKE_TOKEN || !this.GET_STAKE_VALUE) {
                return '0.00';
            }

            const nowUnix = Math.floor(Date.now() / 1000);
            const totalRewardsInUsd = this.GET_STAKE_GLOBAL_INFO.actual_rewards.reduce((total, reward) => {
                if (nowUnix > reward.end_distribution_unix) return total;

                const tokenInfo = this.getTokenAddress(reward.token_address);
                if (!tokenInfo?.price_usd) return total;

                const remainingRewards = 60 * 60 * 24 * 365 * reward.reward_rate;
                return total + (remainingRewards / Math.pow(10, tokenInfo.decimals) * tokenInfo.price_usd);
            }, 0);

            const calculated = Number(this.calculatePoints.result);
            const totalPoints = Number(this.GET_STAKE_GLOBAL_INFO.total_points);
            const result = (totalRewardsInUsd * calculated) / (totalPoints + calculated);

            return this.prettyNumber(result, 2);
        },
        calculatePoints() {
            if (!this.GET_STAKE_TOKEN || !this.GET_STAKE_VALUE) return { result: 0, formattedResult: '0' };

            const amountInNanotons = this.GET_STAKE_VALUE * Math.pow(10, this.decimals);
            const selectedPeriod = this.GET_STAKE_GLOBAL_INFO?.periods?.find(period => period.period_id === this.GET_STAKE_PERIOD_ID);
            const periodPercentage = selectedPeriod?.percentage || 0;

            const result = amountInNanotons * this.normalizer * (1 + periodPercentage / 100);
            return {
                result,
                formattedResult: this.prettyNumber(result / Math.pow(10, this.decimals), 0)
            };
        }
    },
    methods: {
        ...mapActions([
            'STAKE_PERIOD_ID',
            'STAKE_MERGED_TOKENS',
            'STAKE_VALUE',
            'STAKE_TOKEN',
            'STAKE_MAX',
            'DEX_SEND_TOKEN'
        ]),
        setInitialMaxBalance() {
            if (!this.GET_STAKE_MERGED_TOKENS || !this.GET_STAKE_TOKEN) return;

            const tokenAddress = this.GET_STAKE_TOKEN.address;
            const token = this.GET_STAKE_MERGED_TOKENS.find(t => t.token.address.address === tokenAddress);

            if (!token) return;

            let balance = token.balance?.asset_amount_raw / Math.pow(10, token.token.metadata.decimals || 9) ?? 0;

            if (tokenAddress === 'native') {
                balance = Math.max(0, balance - 0.23501);
            }

            this.STAKE_MAX(balance);
        },
        changeFirstValue(value) {
            this.tokenValues.first = value;
            this.STAKE_VALUE(Number(value));
        },
        changeFirstToken(value) {
            const mergedToken = this.findTokenInMergedTokens(value.address);
            const updatedValue = {
                ...value,
                price_usd: mergedToken?.price_per_token_usd || value.price_usd
            };

            this.tokenValues.first = '0';
            this.STAKE_VALUE(0);
            this.STAKE_TOKEN(updatedValue);
            this.DEX_SEND_TOKEN(updatedValue);
            this.setInitialMaxBalance();
        },
        prettyNumber(value, decimals = 2) {
            if (!value || isNaN(Number(value))) return '0';
            return Number(value).toLocaleString('en-US', {
                minimumFractionDigits: decimals,
                maximumFractionDigits: decimals
            });
        },
        findTokenInMergedTokens(tokenAddress) {
            if (!tokenAddress || !this.GET_STAKE_MERGED_TOKENS) return null;

            return this.GET_STAKE_MERGED_TOKENS.find(token =>
                token.token.address === tokenAddress ||
                token.token.address?.address === tokenAddress
            );
        },
        mergedTokenData() {
            if (!this.GET_STAKE_GLOBAL_INFO?.locked_tokens) return [];

            const balances = this.GET_STAKE_BALANCES;
            const hasRealBalances = balances && Array.isArray(balances);
            const isWalletConnected = this.GET_DEX_WALLET !== null;

            const mergedTokens = this.GET_STAKE_GLOBAL_INFO.locked_tokens.map(tokenData => ({
                ...tokenData,
                balance: hasRealBalances ?
                    (this.GET_STAKE_BALANCES?.find(
                        balance => balance.asset_address === tokenData.token.address.address
                    ) || { asset_amount_raw: 0, asset_amount_usd: 0 })
                    :
                    { asset_amount_raw: isWalletConnected ? null : 0, asset_amount_usd: 0 },
                price_per_token_usd: tokenData.price_per_token_usd || 0
            }));

            this.STAKE_MERGED_TOKENS(mergedTokens);

            if (!isWalletConnected && mergedTokens.length) {
                this.setCurrentToken(mergedTokens[0]);
            }

            return mergedTokens;
        },
        selectPeriod(periodId) {
            tracking.trackEvent(Events.STAKE_PERIOD_TOGGLE, {
                walletAddress: this.GET_DEX_WALLET?.address || 'No wallet',
                periodId
            });
            this.STAKE_PERIOD_ID(periodId);
        },
        closePopup() {
            this.showTokens = false;
            this.$emit('closePopup');
        },
        getTokenAddress(tokenAddress) {
            if (!this.GET_TON_TOKENS) return null;

            const searchAddress = tokenAddress === 'native'
                ? 'native'
                : Address.parseFriendly(tokenAddress).address.toRawString();

            return this.GET_TON_TOKENS.find(token => token.address === searchAddress);
        },
        chooseSendToken() {
            this.tokenMode = 'SEND';
            this.showTokens = true;
        },
        convertSecondsToTime(seconds) {
            const timeFrames = {
                minutes: seconds / 60,
                hours: seconds / 3600,
                days: seconds / 86400,
                months: seconds / 2592000,
                years: seconds / 31536000
            };

            if (seconds < 3600) return `${timeFrames.minutes.toFixed(0)} ${this.$t('stakeTimeframes[0]')}`;
            if (seconds < 86400) return `${timeFrames.hours.toFixed(0)} ${this.$t('stakeTimeframes[1]')}`;
            if (seconds < 2592000) return `${timeFrames.days.toFixed(0)} ${this.$t('stakeTimeframes[2]')}`;
            if (seconds < 31536000) return `${timeFrames.months.toFixed(0)} ${this.$t('stakeTimeframes[3]')}`;

            const currentLocale = this.$i18n.locale;
            if ((currentLocale === 'ru' || currentLocale === 'ua') && seconds === 63115200) {
                return `${timeFrames.years.toFixed(0)} ${this.$t('stakeTimeframes[5]')}`;
            }
            return `${timeFrames.years.toFixed(0)} ${this.$t('stakeTimeframes[4]')}`;
        },
        bonusClass(percentage) {
            return percentage >= 20 ? 'bonus-orange' : 'bonus-blue';
        },
        setCurrentToken() {
            if (!this.GET_STAKE_MERGED_TOKENS?.length) return;

            const tokenWithBalance = this.GET_STAKE_MERGED_TOKENS.find(token =>
                token.balance?.asset_amount_raw && Number(token.balance.asset_amount_raw) > 0
            );

            const defaultToken = tokenWithBalance || this.GET_STAKE_MERGED_TOKENS[0];

            const decimals = defaultToken.token.metadata.decimals || 9;
            const tokenData = {
                address: defaultToken.token.address.address,
                blockchain: defaultToken.token.address.blockchain,
                name: defaultToken.token.metadata.name,
                symbol: defaultToken.token.metadata.symbol,
                decimals,
                listed: defaultToken.token.metadata.listed,
                image: defaultToken.token.metadata.image_url,
                normalizer: defaultToken.normalizer,
                balance: defaultToken.balance?.asset_amount_raw !== null ?
                    defaultToken.balance.asset_amount_raw / Math.pow(10, decimals) : 0,
                price_usd: defaultToken.price_per_token_usd
            };

            this.STAKE_TOKEN(tokenData);
            this.DEX_SEND_TOKEN(tokenData);
            this.setInitialMaxBalance();
        }
    },
    mounted() {
        document.addEventListener('keydown', e => {
            if (e.key === 'Escape') this.showTokens = false;
        });

        if (this.GET_STAKE_MERGED_TOKENS?.length) {
            this.setCurrentToken();
        }
    },
    watch: {
        GET_STAKE_BALANCES() {
            this.mergedTokenData();
        },
        GET_DEX_WALLET() {
            this.mergedTokenData();
        },
        showTokens(value) {
            document.documentElement.style.overflow = value ? 'hidden' : 'auto';
            value ? disablePageScroll() : enablePageScroll();
        },
        GET_STAKE_VALUE() {
            this.tokenValues.first = String(this.GET_STAKE_VALUE);
        },
        GET_STAKE_GLOBAL_INFO: {
            handler() {
                this.mergedTokenData();

                if (this.GET_STAKE_GLOBAL_INFO?.periods?.length >= 2) {
                    const secondPeriod = this.GET_STAKE_GLOBAL_INFO.periods[1];
                    this.STAKE_PERIOD_ID(secondPeriod.period_id);
                }
            },
            immediate: true
        },
        GET_STAKE_MERGED_TOKENS: {
            handler(newTokens, oldTokens) {
                if (!newTokens) return;

                const isInitialLoad = !oldTokens || oldTokens.length === 0;
                const hasRealBalances = newTokens.some(token =>
                    token.balance?.asset_amount_raw !== null &&
                    token.balance?.asset_amount_raw !== undefined
                );
                if ((isInitialLoad && hasRealBalances) || (!isInitialLoad && hasRealBalances)) {
                    this.setInitialMaxBalance();
                    this.setCurrentToken();
                }
            },
            deep: true
        },
        selectedButton(newValue) {
            this.$emit('update:selectedTab', newValue);
        },
    }
}
</script>

<style scoped>
.skeleton__period-btn {
    flex: 1;
    height: 36px;
    border-radius: 12px;
    background-color: var(--iface-white4);
}

.stake__form {
    width: 420px;
}

.stake-buttons-margin {
    margin-bottom: 14px;
}

.form__buttons .select__btn {
    padding: 10px 12px;
    flex: 1;
}

.form__buttons .select__btn.active::after {
    background-color: transparent;
}

.select__btn {
    font-weight: 400;
    background: var(--iface-white4);
    position: relative;
    border-radius: 12px;
    white-space: nowrap;
    padding: 0 10px;
    height: 36px;
    transition: 0.2s background-color;
    border: 1px solid transparent;
    box-sizing: border-box;
    outline: none;
}

.form__title {
    font-family: Harmony-Medium, sans-serif;
    padding: 8px 8px 6px 8px;
    color: var(--main-text-color);
    font-size: 18px;
    font-weight: 500;
    line-height: 22px;
}

.form__desc {
    padding-left: 8px;
    font-weight: 400;
    font-size: 14px;
    line-height: 17px;
    color: var(--main-text-color);
    margin-bottom: 14px;
}

.form__title span {
    color: var(--iface-accent-color);
}

.form__wrapper {
    padding: 6px;
    border-radius: 14px;
    border: 1px solid var(--iface-white8);
    background: transparent;
}

.form__buttons {
    display: flex;
    gap: 6px;
    margin-bottom: 6px;
}

.select__btn:hover {
    background: var(--iface-white6);
}

.select__btn::after {
    content: "";
    position: absolute;
    left: 50%;
    bottom: 0;
    transform: translateX(-50%);
    width: 70%;
    height: 3px;
    background-color: transparent;
    border-radius: 2px 2px 0 0;
    transition: .2s;
}

.select__btn.active::after {
    background-color: var(--iface-accent-color);
}

.select__btn.active:hover {
    background-color: var(--iface-white6);
}

.period__btn {
    box-sizing: border-box;
    background: var(--iface-white4);
}

.btn__text {
    transition: 0.2s opacity;
    opacity: 0.4;
    font-size: 13px;
    font-weight: 500;
    line-height: 16px;
}

.active {
    background: var(--iface-white8);
}

.active .btn__text {
    opacity: 1;
    font-size: 13px;
    line-height: 16px;
}

.bonus-label {
    position: absolute;
    color: white;
    text-align: center;
    font-size: 11px;
    font-style: italic;
    font-weight: 800;
    line-height: normal;
    padding: 3px 6px;
    right: -5px;
    top: -5px
}

.bonus-blue {
    border-radius: 12px;
    background: linear-gradient(75deg, #00C2FF 1.13%, #06F 101.13%);
    backdrop-filter: blur(15px);
}

.bonus-orange {
    border-radius: 12px;
    background: linear-gradient(75deg, #FF7A00 1.13%, #FF2E00 101.13%);
    backdrop-filter: blur(15px);
}

.staking__form-details {
    display: none;
}

@media screen and (max-width: 1219px) {
    .stake__form {
        min-width: 502px;
    }

    .staking__form-details {
        display: block;
        margin-top: 14px;
    }
}

@media screen and (max-width: 576px) {
    .user-stakes {
        margin-bottom: 18px;
    }

    .stake__form {
        width: 100%;
        min-width: 100%;
    }

    .form__wrapper {
        border: 1px solid var(--iface-white8);
        border-radius: 14px;
        background: transparent;
    }

    .staking__form-details {
        display: block;
        margin-top: 8px;
    }

    .stake-buttons-margin {
        margin-bottom: 0;
    }
}

@media screen and (max-width: 461px) {
    .stake__form {
        min-width: 100%;
        width: 100%;
    }
}
</style>
