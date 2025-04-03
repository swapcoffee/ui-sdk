<template>
    <div class="stake__item" :class="{ expanded: isExpanded }">
        <div class="item__content" @click="toggleExpand">
            <div class="item__info">
                <div class="item__text">
                    <div class="item__title">
                        <div class="item__title-text">
                            {{ $t("stakeItem.staked") }} {{ formatAmount(position.locked_asset_amount_raw, getDecimals) }} {{ getSymbol }}
                        </div>
                        <p class="item__title-usd">
                            / ${{ formatSmallUsdAmount(position.locked_usd) }}
                        </p>
                    </div>
                    <div class="item__desc">
                        {{ isExpanded ? $t("stakeItem.hideDetails") : $t("stakeItem.showDetails") }}
                    </div>
                </div>
            </div>
            <div class="item__expand">
                <p class="item__expand-amount">
                    ${{ getEarnedRewards(position) }}
                </p>
                <p class="item__expand-description">
                    {{ $t("stakeItem.unclaimRewards") }}
                </p>
            </div>
        </div>
        <transition name="slide">
            <div v-if="isExpanded" class="extra-info">
                <div class="separation-line"></div>
                <div class="extra__item">
                    <div class="extra__name">{{ $t("stakeFormDetails.duration") }}</div>
                    <div class="extra__value">
                        {{ getDuration(position) }}
                        <button class="details__btn" @click="stakeButtonAction" :disabled="isMaxPeriodSelected">
                            (<span class="underline-text">{{ btnText }}</span>)
                        </button>
                    </div>
                </div>
                <div class="extra__item">
                    <div class="extra__name">{{ $t("stakeItem.stakeTime") }}</div>
                    <div class="extra__value">{{ formatDate(position.start_lock_seconds_utc) }}</div>
                </div>
                <div class="extra__item">
                    <div class="extra__name">{{ $t("stakeItem.unstakeTime") }}</div>
                    <div class="extra__value">{{ formatDate(position.end_lock_seconds_utc) }}</div>
                </div>
                <div class="extra__item">
                    <div class="extra__name"> {{ $t("stakeItem.points") }}</div>
                    <div class="extra__value">
                        {{ formatPoints(position.points_amount || 0, getDecimals) }}
                        <span> ({{ calculatePercentage(position.points_amount || 0) }}%) </span>
                    </div>
                </div>
                <div class="extra__item">
                    <div class="extra__name">{{ $t("stakeItem.rewards") }}</div>
                    <div class="extra__value">
                        TON/USDT
                        <button class="details__btn" @click="setShowRewards">
                            (<span class="underline-text">{{ $t("stakeItem.details") }}</span>)
                        </button>
                    </div>
                </div>
                <div class="extra__item">
                    <div class="extra__name">{{ $t("stakeItem.totalEarned") }}</div>
                    <div class="extra__value">{{ getEarnedRewards(position) }}$</div>
                </div>
            </div>
        </transition>
    </div>
    <StakingRestakeModal
        :tonConnectUi="tonConnectUi"
        v-if="showRestake"
        @closeRestake="setShowRestake"
        :stake="position"
    />
    <StakingRewardDetails
        v-if="showRewards"
        :stake="position"
        @closeRewards="setShowRewards"
    />
</template>

<script>
import {mapActions, mapGetters} from "vuex";
import {disablePageScroll, enablePageScroll} from "scroll-lock";
import { stakingService } from '@/api/coffeeApi/services';
import StakingRewardDetails from "@/components/modals/StakingRewardDetails.vue";
import StakingRestakeModal from "@/components/modals/StakingRestakeModal.vue";

export default {
    name: "StakeItem",
    components: {
        StakingRestakeModal,
        StakingRewardDetails,
    },
    props: {
        position: {
            type: Object,
            required: true
        },
        tonConnectUi: {
            type: Object,
            default() {
                return {}
            }
        },
    },
    data() {
        return {
            isExpanded: false,
            showRestake: false,
            isExpired: false,
            showRewards: false
        };
    },
    computed: {
        ...mapGetters(['GET_DEX_WALLET', 'GET_PROOF_VERIFICATION', 'GET_STAKE_GLOBAL_INFO', 'GET_STAKE_MERGED_TOKENS', 'GET_STAKE_MASTER', 'GET_STAKE_CATALOGUE_WALLET_DATA']),
        getDecimals() {
            const token = this.findTokenInMergedTokens(this.position.locked_asset_address);
            return token?.token?.metadata?.decimals || 9;
        },
        getSymbol() {
            if (!this.GET_STAKE_CATALOGUE_WALLET_DATA || !this.position?.locked_asset_address) {
                return '';
            }
            const catalogueItem = this.GET_STAKE_CATALOGUE_WALLET_DATA.find(
                item => item.master_address === this.GET_STAKE_MASTER
            );
            return catalogueItem?.name || '';
        },
        currentTime() {
            return Math.floor(Date.now() / 1000);
        },
        maxPeriodId() {
            if (!this.GET_STAKE_GLOBAL_INFO?.periods?.length) {
                return null;
            }
            return this.GET_STAKE_GLOBAL_INFO.periods[this.GET_STAKE_GLOBAL_INFO.periods.length - 1].period_id;
        },
        isMaxPeriodSelected() {
            if (!this.maxPeriodId || !this.position) {
                return false;
            }
            return this.position.period_id === this.maxPeriodId;
        },
        btnText() {
            if (this.isExpired) {
                return this.$t('stakeItem.closeStake');
            } else if (this.isMaxPeriodSelected) {
                return this.$t('stakeItem.restakeLocked');
            } else {
                return this.$t('stakeItem.restake');
            }
        }
    },
    methods: {
        ...mapActions(['STAKE_TRANSACTION_ID', 'REMOVE_USER_STAKE_ACTION']),
        formatSmallUsdAmount(value) {
            if (!value) return '0';

            const num = Number(value);
            if (isNaN(num)) return '0';

            if (num < 0.01) {
                return '<$0.01';
            } else if (num < 1) {
                return num.toFixed(2);
            } else {
                return num.toFixed(1);
            }
        },
        toggleExpand() {
            this.isExpanded = !this.isExpanded
        },
        formatAmount(amount, decimals) {
            if (!amount || !decimals) return '0';

            try {
                const formattedAmount = Number(amount) / Math.pow(10, decimals);

                if (isNaN(formattedAmount)) return '0';

                if (formattedAmount <= 0.01) {
                    return formattedAmount.toFixed(7);
                }

                return formattedAmount.toFixed(2);
            } catch (e) {
                console.error('Format amount error:', e);
                return '0';
            }
        },
        formatPoints(value, decimals) {
            if (!value || !decimals) return '0';

            try {
                const points = Number(value) / Math.pow(10, decimals);

                if (isNaN(points)) return '0';

                if (points >= 1000000) {
                    return (points / 1000000).toFixed(1) + 'KK';
                } else if (points >= 1000) {
                    return (points / 1000).toFixed(1) + 'K';
                }

                return points.toFixed(2);
            } catch (e) {
                console.error('Format points error:', e);
                return '0';
            }
        },
        calculatePercentage(pointsAmount) {
            if (!pointsAmount || !this.GET_STAKE_GLOBAL_INFO?.total_points) return '0.00';

            try {
                const points = Number(pointsAmount);
                const total = Number(this.GET_STAKE_GLOBAL_INFO.total_points);

                if (!points || !total) return '0.00';

                const percentage = (points / total) * 100;

                if (isNaN(percentage)) return '0.00';

                if (percentage < 0.0001 && percentage > 0) {
                    return '<0.0001';
                }

                return percentage.toFixed(2);
            } catch (e) {
                console.error('Calculate percentage error:', e);
                return '0.00';
            }
        },
        setShowRestake () {
            this.showRestake = !this.showRestake;
        },
        setShowRewards () {
            this.showRewards = !this.showRewards;
        },
        findTokenInMergedTokens(tokenAddress) {
            if (!this.GET_STAKE_MERGED_TOKENS || !tokenAddress) {
                console.warn('Missing tokens data or address');
                return null;
            }

            return this.GET_STAKE_MERGED_TOKENS.find(
                token => token.token?.address?.address === tokenAddress
            );
        },
        getTransactionParams(trInfo) {
            let messages = [];

            trInfo.forEach(item => {
                const { address, value, payload_cell } = item.message

                if (address && value) {
                    messages.push({
                        address,
                        amount: value.toString(),
                        payload: payload_cell || '',
                    });
                }
            });

            return {
                validUntil: Math.floor(Date.now() / 1000) + 60, // 60 sec
                messages: messages,
            };
        },
        formatDate(timestamp) {
            const date = new Date(timestamp * 1000);
            const options = {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
            };
            return date.toLocaleString('en-GB', options);
        },
        async closeStake() {
            try {
                const address = this.GET_DEX_WALLET.address;
                const verify = this.GET_PROOF_VERIFICATION;
                const id = this.position.id;

                const response = await stakingService.closeStakingPosition(address, id, verify, this.GET_STAKE_MASTER);

                this.transactionsList = [];

                this.transactionsList = [{
                    query_id: response?.data?.query_id,
                    message: {
                        payload_cell: response?.data?.message.payload_cell,
                        address: response?.data?.message.address,
                        value: response?.data?.message.value,
                    },
                }];


                if (this.transactionsList.length > 0) {
                    this.STAKE_TRANSACTION_ID(response?.data?.query_id);
                    const transaction = await this.tonConnectUi.sendTransaction(this.getTransactionParams(this.transactionsList));
                    if (transaction) {
                        await this.REMOVE_USER_STAKE_ACTION(id);
                    }
                }

            } catch (error) {
                console.error(error);
            }
        },
        stakeButtonAction() {
            if (!this.GET_STAKE_GLOBAL_INFO?.periods) {
                console.warn('Stake information not loaded yet');
                return;
            }

            if (this.isExpired) {
                this.closeStake();
            } else {
                this.setShowRestake();
            }
        },
        getEarnedRewards() {
            if (Array.isArray(this.position?.earned_rewards)) {
                return this.position.earned_rewards.reduce((total, reward) => {
                    return total + (reward.asset_usd || 0);
                }, 0).toFixed(3);
            }

            return '0.000000';
        },
        getPointsPercentage(points) {
            const totalPoints = this.$parent.positions.reduce((sum, pos) => sum + pos.points_amount, 0);
            return totalPoints ? ((points / totalPoints) * 100).toFixed(2) : 0;
        },
        getDuration(position) {
            if (!position.start_lock_seconds_utc || !position.end_lock_seconds_utc) {
                return 'Unknown duration';
            }

            const lockDuration = position.end_lock_seconds_utc - position.start_lock_seconds_utc;

            if (lockDuration <= 0) {
                return 'Invalid duration';
            }

            const SECONDS_IN_DAY = 3600 * 24;
            const DAYS_IN_MONTH = 30;
            const MONTHS_IN_YEAR = 12;

            const years = Math.floor(lockDuration / (SECONDS_IN_DAY * DAYS_IN_MONTH * MONTHS_IN_YEAR));
            const months = Math.floor((lockDuration % (SECONDS_IN_DAY * DAYS_IN_MONTH * MONTHS_IN_YEAR)) / (SECONDS_IN_DAY * DAYS_IN_MONTH));
            const days = Math.floor((lockDuration % (SECONDS_IN_DAY * DAYS_IN_MONTH)) / SECONDS_IN_DAY);
            const hours = Math.floor((lockDuration % SECONDS_IN_DAY) / 3600);
            const minutes = Math.floor((lockDuration % 3600) / 60);

            const currentLocale = this.$i18n.locale;

            const getWordForm = (number, forms) => {
                if (currentLocale === 'ru' || currentLocale === 'ua') {
                    const cases = [2, 0, 1, 1, 1, 2];
                    const index = (number % 100 > 4 && number % 100 < 20) ? 2 : cases[Math.min(number % 10, 5)];
                    return forms[index];
                }
                return number === 1 ? forms[0] : forms[1];
            };

            const yearForms = {
                'ru': ['год', 'года', 'лет'],
                'ua': ['рік', 'роки', 'років'],
                'en': ['year', 'years'],
            };

            const monthForms = {
                'ru': ['месяц', 'месяца', 'месяцев'],
                'ua': ['місяць', 'місяці', 'місяців'],
                'en': ['month', 'months'],
            };

            const dayForms = {
                'ru': ['день', 'дня', 'дней'],
                'ua': ['день', 'дні', 'днів'],
                'en': ['day', 'days'],
            };

            const hourForms = {
                'ru': ['час', 'часа', 'часов'],
                'ua': ['година', 'години', 'годин'],
                'en': ['hour', 'hours'],
            };

            const minuteForms = {
                'ru': ['минута', 'минуты', 'минут'],
                'ua': ['хвилина', 'хвилини', 'хвилин'],
                'en': ['minute', 'minutes'],
            };

            const lang = currentLocale in yearForms ? currentLocale : 'en';

            if (years > 0 && months > 0) {
                return `${years} ${getWordForm(years, yearForms[lang])} ${months} ${getWordForm(months, monthForms[lang])}`;
            } else if (years > 0) {
                return `${years} ${getWordForm(years, yearForms[lang])}`;
            } else if (months > 0 && days > 0) {
                return `${months} ${getWordForm(months, monthForms[lang])} ${days} ${getWordForm(days, dayForms[lang])}`;
            } else if (months > 0) {
                return `${months} ${getWordForm(months, monthForms[lang])}`;
            } else if (days > 0 && hours > 0) {
                return `${days} ${getWordForm(days, dayForms[lang])} ${hours} ${getWordForm(hours, hourForms[lang])}`;
            } else if (days > 0) {
                return `${days} ${getWordForm(days, dayForms[lang])}`;
            } else if (hours > 0) {
                return `${hours} ${getWordForm(hours, hourForms[lang])} ${minutes} ${getWordForm(minutes, minuteForms[lang])}`;
            } else {
                return `${minutes} ${getWordForm(minutes, minuteForms[lang])}`;
            }
        },
    },
    mounted() {
        if (this.position.end_lock_seconds_utc <= this.currentTime) {
            this.isExpired = true;
        }
    },
    watch: {
        showRestake: {
            handler: function () {
                if (this.showRestake) {
                    document.documentElement.style.overflow = 'hidden'
                    disablePageScroll()
                    return
                }
                enablePageScroll()
                document.documentElement.style.overflow = 'auto'
            }
        },
        showRewards: {
            handler: function () {
                if (this.showRewards) {
                    document.documentElement.style.overflow = 'hidden'
                    disablePageScroll()
                    return
                }
                enablePageScroll()
                document.documentElement.style.overflow = 'auto'
            }
        },
    }
};
</script>

<style scoped>
.user__stakes {
    display: flex;
    gap: 6px;
    flex-direction: column;
}

.stake__item {
    font-family: Harmony-Regular, sans-serif;
    display: flex;
    flex-direction: column;
    padding: 14px;
    background: var(--iface-white4);
    border-radius: 14px;
    transition: 0.2s all;
    cursor: pointer;
}

.stake__item:hover {
    background: var(--iface-white8);
}

.item__content {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.stake__item.expanded {
    background: var(--iface-white4);
}

.item__info {
    gap: 12px;
    display: flex;
}

.item__text {
    display: flex;
    flex-direction: column;
    gap: 2px;
}

.item__logo {
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 12px;
    background: var(--iface-white6);
    width: 38px;
    height: 38px;
    padding: 4px;
}

.item__logo img {
    border-radius: 100px;
    width: 30px;
    height: 30px;
}

.item__expand {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: flex-end;
    gap: 2px;
}

.item__expand-amount {
    font-weight: 500;
    font-size: 14px;
    line-height: 20px;
    color: var(--main-text-color);
}

.item__expand-description {
    font-weight: 400;
    font-size: 13px;
    line-height: 16px;
    color: var(--main-text-color);
    opacity: 0.6;
}

.item__title {
    display: flex;
    align-items: center;
    font-size: 14px;
    font-weight: 500;
    line-height: 20px;
    color: var(--main-text-color);
    max-width: 283px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.item__title-usd {
    font-weight: 500;
    font-size: 14px;
    line-height: 20px;
    color: var(--main-text-color);
    opacity: 0.6;
    margin-left: 4px;
}

.item__desc {
    font-size: 13px;
    font-weight: 400;
    line-height: 16px;
    color: var(--main-text-color);
    opacity: 0.6;
    transition: all 0.2s;
    user-select: none;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    text-decoration: none;
    width: fit-content;
    background-image: linear-gradient(to right, var(--main-text-color) 2px, transparent 2px);
    background-position: bottom;
    background-size: 4px 1px;
    background-repeat: repeat-x;
    padding-bottom: 1px;
}

.slide-enter-active,
.slide-leave-active {
    transition: all 0.2s ease;
    max-height: 500px;
    opacity: 1;
    overflow: hidden;
}

.slide-enter-from,
.slide-leave-to {
    max-height: 0;
    opacity: 0;
    overflow: hidden;
}

.separation-line {
    margin-top: 14px;
    margin-bottom: 2px;
    display: block;
    height: 1px;
    background: var(--iface-white6);
    transition: all 0.2s ease;
}

.extra-info {
    display: flex;
    flex-direction: column;
    gap: 12px;
    overflow: hidden;
}

.extra__item {
    display: flex;
    align-items: center;
    justify-content: space-between;
}


.extra__name {
    color: var(--main-text-color);
    font-size: 13px;
    font-weight: 400;
    line-height: 16px;
    opacity: 0.6;
}

.extra__value {
    color: var(--main-text-color);
    font-size: 13px;
    font-weight: 400;
    line-height: 16px;
}

svg path {
    fill: var(--main-text-color);
}

.extra__item:first-child {
    border-top-left-radius: 12px;
    border-top-right-radius: 12px;
}

.extra__item:last-of-type {
    border-bottom-left-radius: 12px;
    border-bottom-right-radius: 12px;
}

.restake__button {
    margin-top: 12px;
    border-radius: 12px;
    border: 1px solid var(--iface-white12);
    background: transparent;
    padding: 12px;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 8px;
    transition: 0.2s all;
}

.restake__button span {
    opacity: 0.8;
    font-weight: 500;
    font-size: 14px;
    color: var(--main-text-color);
}

.restake__img {
    position: relative;
    opacity: 0.8;
    width: 20px;
    height: 20px;
    background-size: contain;
    background-repeat: no-repeat;
    transition: 0.2s all;
}

.restake__img:before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-image: url("@/assets/stake/pig.svg");
    background-size: cover;
    transition: background-image 0.2s ease;
}


.restake__button:hover {
    border: 1px solid var(--iface-white16);
}

.restake__button:hover span {
    opacity: 1;
}

.restake__button:hover .restake__img {
    opacity: 1;
}

.details__btn {
    background: none;
    outline: none;
    border: none;
    color: var(--iface-accent-color);
    font-size: 13px;
    font-weight: 400;
    line-height: 16px;
    transition: 0.2s all;
}

.details__btn:hover {
    opacity: 0.9;
}

.details__btn .underline-text {
    text-decoration: underline dotted;
    color: var(--iface-accent-color);
    font-size: 13px;
    font-weight: 400;
    line-height: 16px;
    text-decoration-thickness: 1px;
    text-underline-offset: 3px;
    transition: 0.2s all;
}

@media screen and (max-width: 576px) {
    .item__title {
        max-width: 220px;
    }
}
</style>
