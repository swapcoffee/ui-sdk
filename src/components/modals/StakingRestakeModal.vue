<template>
    <modal-wrapper
        class="modal"
        :title="`${$t('stakeItem.restakeWindow')} ${getSymbol}`"
        :freeHeight="true"
        @closeModal="$emit('closeRestake')"
    >
        <div class="wallet-settings__wrapper">
            <div class="duration-text__wrapper">
                <p class="duration__title">{{ $t("stakeItem.newDuration") }}</p>
                <p class="duration__desc">
                    {{ $t("stakeItem.restakeInfo") }}
                    {{ formatDuration(maxDurationText) }}
                    {{ getTimeUnitDeclensionAfterDo(formatDuration(maxDurationText), getTimeUnitType(maxDurationText)) }}
                </p>

                <div class="form__buttons">
                    <button v-for="period in filteredPeriods"
                            :key="period.period_id"
                            class="btn select__btn"
                            :class="{ active: periodId === period.period_id }"
                            @click="selectDuration(period)">
                        <span class="btn__text">{{ formatDuration(period.lock_duration) }} {{getDurationUnit(period.lock_duration)}}</span>
                        <span v-if="period.percentage > 0" class="bonus-label" :class="bonusClass(period.percentage)">
              x{{ ((100 + period.percentage) / 100).toFixed(2) }}
            </span>
                    </button>
                </div>
            </div>

            <div class="spacer"></div>

            <div class="wallet-settings__main">
                <div class="extra-info">
                    <div class="extra__item">
                        <div class="extra__name">{{ $t("stakeItem.yourStake") }}</div>
                        <div class="extra__value">{{ (stake.locked_asset_amount_raw / Math.pow(10, 9)).toFixed(2) }} {{getSymbol}}</div>
                    </div>
                    <div class="extra__item">
                        <div class="extra__name">{{ $t("stakeFormDetails.duration") }}</div>
                        <div class="extra__value">
                            {{ formatDuration(selectedDuration) }} {{ getDurationUnit(selectedDuration) }}
                            <span v-if="selectedDuration !== initialDuration">
                (+{{ calculateTimeDifference(initialDuration, selectedDuration) }})
              </span>
                        </div>
                    </div>
                    <div class="extra__item">
                        <div class="extra__name" v-if="pointsDifference !== 0">{{ $t("stakeItem.newPoints") }}</div>
                        <div class="extra__name" v-else>{{ $t("stakeItem.points") }}</div>
                        <div class="extra__value">
                            {{ calculatePoints.formattedResult }}
                            <span v-if="pointsDifference !== 0">
        {{ formatPointsDifference() }}
    </span>
                        </div>
                    </div>
                    <div class="extra__item">
                        <div class="extra__name">{{ $t("stakeItem.fee") }}</div>
                        <div class="extra__value">{{ $t("stakeItem.feeInfo") }}</div>
                    </div>
                    <button class="dex__button desktop-btn"
                            @click="restakeAction"
                            :disabled="!periodId">
                        <span class="btn-text" v-if="periodId">{{ $t("stakeItem.restake") }}</span>
                        <span class="btn-text" v-else>{{ $t("stakeItem.selectFrame") }}</span>
                    </button>
                </div>
            </div>
        </div>
    </modal-wrapper>
</template>

<script>
import {mapActions, mapGetters} from "vuex";
import computedMixins from "@/mixins/computedMixins.js";
import { stakingService } from '@/api/coffeeApi/services';
import ModalWrapper from "@/components/ui/ModalWrapper.vue";

export default {
    name: "StakingRestakeModal",
    components: {ModalWrapper},
    mixins: [computedMixins],
    props: {
        stake: {
            type: Object,
            required: true,
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
            showDropdown: false,
            initialDuration: null,
            selectedDuration: null,
            periodId: null,
            calculateInitialPoints: 0,
            pointsDifference: 0
        };
    },
    computed: {
        ...mapGetters([
            'GET_STAKE_GLOBAL_INFO',
            'GET_STAKE_WALLET_INFO',
            'GET_DEX_WALLET', 'GET_PROOF_VERIFICATION',
            'GET_STAKE_MERGED_TOKENS',
            'GET_STAKE_TOKEN',
            'GET_STAKE_MASTER'
        ]),
        maxDurationText() {
            return Math.max(...this.stake.available_periods.map(period => period.lock_duration))
        },
        calculatePoints() {
            if (!this.stake) return { result: 0, formattedResult: '0' };

            const amountInNanotons = this.stake.locked_asset_amount_raw;
            const normalizer = this.normalizer;
            const selectedPeriod = this.GET_STAKE_GLOBAL_INFO?.periods?.find(period => period.period_id === this.periodId);
            const periodPercentage = selectedPeriod ? selectedPeriod.percentage : 0;

            const result = (amountInNanotons * normalizer + amountInNanotons * normalizer * periodPercentage / 100);

            const formattedResult = this.prettyNumber(result / Math.pow(10, this.decimals), 2);

            return { result, formattedResult };
        },
        decimals() {
            if (!this.stake?.locked_asset_address) return 9;

            const token = this.findTokenInMergedTokens(this.stake.locked_asset_address);
            return token?.token?.metadata?.decimals ?? 9;
        },
        normalizer() {
            const token = this.findTokenInMergedTokens(this.stake.locked_asset_address);

            if (token && token.normalizer !== undefined) {
                return token.normalizer;
            }
        },
        getSymbol() {
            const token = this.findTokenInMergedTokens(this.stake.locked_asset_address);

            if (token && token.token && token.token.metadata) {
                return token.token.metadata.symbol;
            }
        },
        filteredPeriods() {
            return this.stake.available_periods.filter(period => period.period_id > this.stake.period_id);
        },
    },
    methods: {
        ...mapActions(['STAKE_TRANSACTION_ID']),
        prettyNumber(value, decimals = 2) {
            if (!value) return '0';
            const num = Number(value);
            return isNaN(num) ? '0' : num.toFixed(decimals);
        },
        formatPointsDifference() {
            if (this.pointsDifference === 0 || isNaN(this.pointsDifference)) return '';
            return `(+${this.prettyNumber(this.pointsDifference / Math.pow(10, this.decimals), 2)})`;
        },
        getTimeUnitDeclensionAfterDo(number, type) {
            if (this.$i18n.locale !== 'ru') {
                return this.$t(`stakeTimeframes[${type}]`);
            }

            const forms = {
                minutes: 'минут',
                hours: 'часов',
                days: 'дней',
                months: 'месяцев',
                years: 'лет'
            };

            switch(type) {
                case 0: return forms.minutes;
                case 1: return forms.hours;
                case 2: return forms.days;
                case 3: return forms.months;
                case 4:
                case 5: return forms.years;
                default: return '';
            }
        },
        getTimeUnitDeclension(number, type) {
            if (this.$i18n.locale !== 'ru') {
                return this.$t(`stakeTimeframes[${type}]`);
            }

            const lastDigit = number % 10;
            const lastTwoDigits = number % 100;

            const forms = {
                minutes: ['минута', 'минуты', 'минут'],
                hours: ['час', 'часа', 'часов'],
                days: ['день', 'дня', 'дней'],
                months: ['месяц', 'месяца', 'месяцев'],
                years: ['год', 'года', 'лет']
            };

            let wordForms;
            switch(type) {
                case 0: wordForms = forms.minutes; break;
                case 1: wordForms = forms.hours; break;
                case 2: wordForms = forms.days; break;
                case 3: wordForms = forms.months; break;
                case 4: wordForms = forms.years; break;
                case 5: wordForms = forms.years; break;
                default: return '';
            }

            if (lastTwoDigits >= 11 && lastTwoDigits <= 19) {
                return wordForms[2];
            }

            switch (lastDigit) {
                case 1: return wordForms[0];
                case 2:
                case 3:
                case 4: return wordForms[1];
                default: return wordForms[2];
            }
        },
        async restakeAction() {
            if (!this.periodId) return;
            try {
                const id = this.stake.id;
                const timeframe = this.periodId;
                const verify = this.GET_PROOF_VERIFICATION;
                const address = this.GET_DEX_WALLET.address

                const response = await stakingService.extendStakingPosition(address, id, timeframe, verify, this.GET_STAKE_MASTER);

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
                    try {
                        const transaction = await this.tonConnectUi.sendTransaction(this.getTransactionParams(this.transactionsList));

                        this.STAKE_TRANSACTION_ID(response?.data?.query_id);
                    } catch (e) {
                        console.log(e)
                        this.tonConnectUi.closeModal('action-cancelled');
                    }

                }

            } catch (error) {
                console.error(error);
            }
        },
        findTokenInMergedTokens(tokenAddress) {
            if (!this.GET_STAKE_MERGED_TOKENS || !tokenAddress) return null;
            return this.GET_STAKE_MERGED_TOKENS.find(token => token.token.address.address === tokenAddress);
        },
        toggleDropdown() {
            this.showDropdown = !this.showDropdown;
        },
        calculateTimeDifference(initialDuration, selectedDuration) {
            const differenceInSeconds = selectedDuration - initialDuration;
            if (differenceInSeconds <= 0) return null;

            const years = Math.floor(differenceInSeconds / (3600 * 24 * 365));
            const months = Math.floor((differenceInSeconds % (3600 * 24 * 365)) / (3600 * 24 * 30));
            const days = Math.floor((differenceInSeconds % (3600 * 24 * 30)) / (3600 * 24));

            let result = '';

            if (years > 0) {
                result += `${years} ${this.getTimeUnitDeclension(years, 4)} `;
            }
            if (months > 0) {
                result += `${months} ${this.getTimeUnitDeclension(months, 3)} `;
            }
            if (days > 0) {
                result += `${days} ${this.getTimeUnitDeclension(days, 2)}`;
            }

            return result.trim();
        },
        selectDuration(period) {
            this.periodId = period.period_id
            this.selectedDuration = period.lock_duration;

            this.pointsDifference = this.calculatePoints.result - this.calculateInitialPoints;
        },
        formatDuration(seconds) {
            if (!seconds) return '0';
            const minutes = seconds / 60;
            const hours = seconds / 3600;
            const days = seconds / (3600 * 24);
            const months = days / 30;
            const years = months / 12;

            if (minutes < 60) {
                return `${minutes.toFixed(0)}`;
            } else if (hours < 24) {
                return `${hours.toFixed(0)}`;
            } else if (days < 30) {
                return `${days.toFixed(0)}`;
            } else if (months < 12) {
                return `${months.toFixed(0)}`;
            } else {
                return `${years.toFixed(0)}`;
            }
        },
        getDurationUnit(seconds) {
            if (this.$i18n.locale !== 'ru') {
                return this.$t(`stakeTimeframes[${this.getTimeUnitType(seconds)}]`);
            }

            const lastDigit = Math.floor(this.formatDuration(seconds)) % 10;
            const lastTwoDigits = Math.floor(this.formatDuration(seconds)) % 100;
            const type = this.getTimeUnitType(seconds);

            const forms = {
                minutes: ['минута', 'минуты', 'минут'],
                hours: ['час', 'часа', 'часов'],
                days: ['день', 'дня', 'дней'],
                months: ['месяц', 'месяца', 'месяцев'],
                years: ['год', 'года', 'лет']
            };

            let wordForms;
            switch(type) {
                case 0: wordForms = forms.minutes; break;
                case 1: wordForms = forms.hours; break;
                case 2: wordForms = forms.days; break;
                case 3: wordForms = forms.months; break;
                case 4:
                case 5: wordForms = forms.years; break;
                default: return '';
            }

            if (lastTwoDigits >= 11 && lastTwoDigits <= 19) {
                return wordForms[2];
            }

            switch (lastDigit) {
                case 1: return wordForms[0];
                case 2:
                case 3:
                case 4: return wordForms[1];
                default: return wordForms[2];
            }
        },
        getTimeUnitType(seconds) {
            const hours = seconds / 3600;
            const days = seconds / (3600 * 24);
            const months = days / 30;
            const years = months / 12;

            if (seconds < 3600) {
                return 0;
            } else if (hours < 24) {
                return 1;
            } else if (days < 30) {
                return 2;
            } else if (months < 12) {
                return 3;
            } else {
                return 4;
            }
        },
        bonusClass(percentage) {
            return percentage >= 20 ? "bonus-orange" : "bonus-blue";
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
    },
    mounted() {
        this.initialDuration = this.GET_STAKE_GLOBAL_INFO?.periods.find(item => item.period_id === this.stake.period_id)
        this.initialDuration = this.initialDuration.lock_duration
        this.selectedDuration = this.stake.available_periods.find(item => item.period_id === this.stake.period_id).lock_duration;
        this.calculateInitialPoints = this.calculatePoints.result;
    },
};
</script>


<style scoped>

.duration-text__wrapper {
    color: var(--main-text-color);
}

.selector__value {
    font-family: Harmony-Regular, sans-serif;
    color: var(--main-text-color);
    font-size: 18px;
    font-style: normal;
    font-weight: 400;
    line-height: normal;
}

.dropdown-options {
    margin-left: 8px;
    margin-top: 18px;
    display: flex;
    gap: 18px;
}

.dropdown-option {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 4px;
    cursor: pointer;
    font-size: 14px;
    color: var(--main-text-color);
    transition: 0.2s all;
    opacity: 0.9;
    border-bottom: 1px dashed var(--iface-accent-color);
}

.dropdown-options .selector__timeframe {
    color: var(--iface-accent-color);
    opacity: 1;
    font-size: 14px;
}

.dropdown-options .selector__value {
    font-size: 14px;
    opacity: 1;
    color: var(--iface-accent-color);
}


.dropdown-option:hover {
    opacity: 1;
}

.selector__timeframe {
    color: var(--main-text-color);
    font-size: 14px;
    font-style: normal;
    font-weight: 400;
    line-height: normal;
    opacity: 0.5;
}

.dex__button {
    margin-top: 18px;
    transition: .2s;
    width: 100%;
    border: none;
    outline: none;
    border-radius: 12px;
    background: var(--iface-accent-color);
    padding: 13px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
}

.form__buttons {
    margin-top: 6px;
    display: flex;
    gap: 12px;
}

.dex__button:hover {
    background: var(--iface-accent-hover);
}

.dex__button:disabled {
    background: var(--main-btn-disabled);
}
.select__btn {
    background: var(--iface-white8);
    position: relative;
    border-radius: 12px;
    white-space: nowrap;
    padding: 0 14px;
    height: 35px;
    font-weight: 400;
    transition: 0.2s all;
    border: none;
    outline: none;
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

.select__btn.active {
    background-color: var(--iface-white14);
}

.select__btn.active::after {
    background-color: var(--iface-accent-color);
}

.select__btn.active:hover {
    background-color: var(--iface-white14);
}

.btn__text {
    transition: .2s;
    opacity: 0.4;
    font-size: 14px;
}

.active .btn__text {
    opacity: 1;
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
    top: -5px;
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


.btn-text {
    font-size: 16px;
    line-height: 24px;
    font-family: Harmony-Medium, sans-serif;
    color: #fff;
}

.theme-light .dex__button:disabled .btn-text {
    color: #141414;
}

.dex__button:disabled .btn-text {
    opacity: 0.4;
}

.duration__selector {
    margin-top: 10px;
    display: flex;
    height: 46px;
    padding: 6px 12px;
    justify-content: space-between;
    align-items: center;
    align-self: stretch;
    border-radius: 12px;
    background: var(--iface-white4);
}

.duration__desc {
    margin-bottom: 12px;
    font-size: 14px;
    font-style: normal;
    font-weight: 400;
    line-height: normal;
    opacity: 0.5;
}

.duration__title {
    margin-bottom: 4px;
    font-size: 14px;
    font-style: normal;
    font-weight: 400;
    line-height: normal;
}

.spacer {
    margin: 18px 0;
    border-bottom: 1px dashed var(--iface-white8);
}

.wallet-settings__background {
    position: fixed;
    z-index: 999;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(10, 7, 6, 0.8);
    font-family: Harmony-Regular, sans-serif;
}

.wallet-settings__wrapper {
    border-radius: 20px;
    background: var(--iface-main-bg);
    display: flex;
    flex-direction: column;
}

.wallet-settings__top-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.wallet-settings__close-btn {
    width: 24px;
    height: 24px;
    border: none;
    outline: none;
    background: transparent;
}

.wallet-settings__top-title {
    font-weight: 500;
    font-size: 24px;
    line-height: 28px;
}

.staking-close-btn {
    height: 36px;
    width: 36px;
    display: flex;
    padding: 6px;
    align-items: center;
    gap: 10px;
    border-radius: 12px;
    background: var(--iface-white4);
    transition: 0.3s ease-in;
}

.staking-close-btn:hover {
    background: var(--iface-white6);
}

.theme-light svg path {
    fill: #141414;
}

.extra-info {
    border-radius: 12px;
    display: flex;
    flex-direction: column;
    gap: 1px;
}

.extra__item {
    padding: 12px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: var(--iface-white4);
}

.extra__name {
    font-family: Harmony-Regular, sans-serif;
    color: var(--main-text-color);
    font-size: 13px;
    font-weight: 400;
    opacity: 0.6;
}

.extra__value {
    font-family: Harmony-Regular, sans-serif;
    color: var(--main-text-color);
    font-size: 13px;
    font-weight: 400;
}

.extra__value span {
    opacity: 0.6;
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

@media screen and (max-width: 879px) {
    @keyframes slide-up {
        from {
            bottom: -100%;
        }
        to {
            bottom: 2%;
        }
    }

    .wallet-settings__background {
        align-items: flex-end;
    }
}

</style>
