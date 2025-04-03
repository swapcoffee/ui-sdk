<template>
  <div class="stake__details-form" ref="details" :class="{ opened: showMore }">
    <div class="stake__switch" @click="showMore = !showMore">
      <div class="stake__group">
        <p class="stake__title">{{ showMore ? 'Hide details' : 'Stake details' }}</p>
      </div>
      <img src="@/assets/dex/arrow-down.svg" alt="arrow icon" class="arrow-icon">
    </div>
    <div class="stake__more-info">
      <div class="stake__row">
        <div class="stake__group">
          <p class="stake__name">{{ $t("stakeForm.stake") }}</p>
        </div>
        <p class="stake__impact">{{ GET_STAKE_VALUE }} {{ GET_STAKE_TOKEN?.symbol }}</p>
      </div>
      <div class="stake__row">
        <p class="stake__name">{{ $t("stakeFormDetails.historical") }}</p>
        <p class="stake__value">{{ apr }}</p>
      </div>
      <div class="stake__row">
        <p class="stake__name">{{ $t("stakeFormDetails.duration") }}</p>
        <p class="stake__value"> {{ getDuration }} </p>
      </div>
      <div class="stake__row">
        <p class="stake__name">{{ $t("stakeFormDetails.estimated") }}</p>
        <p class="stake__value">{{ points }}</p>
      </div>
    </div>
  </div>
</template>

<script>
import {mapGetters} from "vuex";
import methodsMixins from '@/mixins/methodsMixins.ts';

export default {
  name: "StakeFormInfo",
  mixins: [methodsMixins],
  data() {
    return {
      showMore: false,
    };
  },
  props: {
    points: {
      required: true
    },
    apr: {
      required: true
    }
  },
  computed: {
    ...mapGetters([
        'GET_STAKE_GLOBAL_INFO',
        'GET_STAKE_VALUE',
        'GET_STAKE_PERIOD_ID',
        'GET_STAKE_TOKEN'
    ]),
      getDuration() {
          const actualPeriod = this.GET_STAKE_GLOBAL_INFO?.periods?.find(item => item.period_id === this.GET_STAKE_PERIOD_ID);
          if (!actualPeriod?.lock_duration) {
              return 'Unknown duration';
          }
          return this.formatDuration(actualPeriod.lock_duration);
      }
  },
  methods: {
      formatDuration(seconds) {
          if (!seconds || seconds <= 0) {
              return 'Invalid duration';
          }

          const SECONDS_IN_DAY = 3600 * 24;
          const DAYS_IN_MONTH = 30;
          const MONTHS_IN_YEAR = 12;

          const years = Math.floor(seconds / (SECONDS_IN_DAY * DAYS_IN_MONTH * MONTHS_IN_YEAR));
          const months = Math.floor((seconds % (SECONDS_IN_DAY * DAYS_IN_MONTH * MONTHS_IN_YEAR)) / (SECONDS_IN_DAY * DAYS_IN_MONTH));
          const days = Math.floor((seconds % (SECONDS_IN_DAY * DAYS_IN_MONTH)) / SECONDS_IN_DAY);
          const hours = Math.floor((seconds % SECONDS_IN_DAY) / 3600);
          const minutes = Math.floor((seconds % 3600) / 60);

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
  }
};
</script>

<style scoped>
.stake__details-form {
  width: 100%;
  transition: height .3s ease-out, overflow 2s;
  height: 34px;
  overflow: hidden;
}

.opened {
  height: 150px;
}

.stake__impact {
    font-size: 14px;
    font-family: Harmony-Regular, sans-serif;
    line-height: 18px;
    color: var(--main-text-color);
}

.visible {
  overflow: visible;
}

.stake__switch {
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  padding: 0 6px;
  margin-bottom: 14px;
}

.arrow-icon {
  width: 18px;
  height: 18px;
}

.opened .arrow-icon {
  transform: rotateX(180deg);
}

.stake__title {
  font-size: 14px;
  font-family: Harmony-Regular, sans-serif;
    line-height: 18px;
    color: var(--main-text-color);
}

.stake__more-info {
  display: flex;
  flex-direction: column;
  gap: 10px 0;
  padding: 0 6px;
}

.stake__row {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.stake__group {
  display: flex;
  flex-direction: row;
  align-items: center;
}

.stake__name {
    font-size: 14px;
    font-family: Harmony-Regular, sans-serif;
    line-height: 18px;
    color: var(--main-text-color);
    opacity: 0.5;
}

.stake__info-icon {
  margin-left: 5px;
  width: 16px;
  height: 16px;
  cursor: help;
}

.green-impact {
  color: var(--main-green);
}

.stake__value {
    font-size: 14px;
    font-family: Harmony-Regular, sans-serif;
    line-height: 18px;
    color: var(--main-text-color);
}

.theme-light .arrow-icon {
  mix-blend-mode: difference;
}

.value_green {
  color: var(--main-green);
}
</style>
