<template>
  <div class="snowflake-popup__background" @click.self="$emit('closeSnowflakePopup')">
    <div class="snowflake-popup__wrapper">
      <div class="snowflake-popup__top-box">
        <p class="snowflake-popup__top-title">
          {{ $t('snowflakePopup.topTitle') }}
        </p>
        <button class="snowflake-popup__close-btn" @click="$emit('closeSnowflakePopup')">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
          >
            <g opacity="0.8">
              <path
                d="M19.2807 18.2194C19.3504 18.289 19.4056 18.3718 19.4433 18.4628C19.4811 18.5539 19.5005 18.6514 19.5005 18.75C19.5005 18.8485 19.4811 18.9461 19.4433 19.0372C19.4056 19.1282 19.3504 19.2109 19.2807 19.2806C19.211 19.3503 19.1283 19.4056 19.0372 19.4433C18.9462 19.481 18.8486 19.5004 18.7501 19.5004C18.6515 19.5004 18.5539 19.481 18.4629 19.4433C18.3718 19.4056 18.2891 19.3503 18.2194 19.2806L12.0001 13.0603L5.78068 19.2806C5.63995 19.4213 5.44907 19.5004 5.25005 19.5004C5.05103 19.5004 4.86016 19.4213 4.71943 19.2806C4.5787 19.1399 4.49963 18.949 4.49963 18.75C4.49963 18.551 4.5787 18.3601 4.71943 18.2194L10.9397 12L4.71943 5.78061C4.5787 5.63988 4.49963 5.44901 4.49963 5.24999C4.49963 5.05097 4.5787 4.8601 4.71943 4.71936C4.86016 4.57863 5.05103 4.49957 5.25005 4.49957C5.44907 4.49957 5.63995 4.57863 5.78068 4.71936L12.0001 10.9397L18.2194 4.71936C18.3602 4.57863 18.551 4.49957 18.7501 4.49957C18.9491 4.49957 19.1399 4.57863 19.2807 4.71936C19.4214 4.8601 19.5005 5.05097 19.5005 5.24999C19.5005 5.44901 19.4214 5.63988 19.2807 5.78061L13.0604 12L19.2807 18.2194Z"
                fill="white"
              />
            </g>
          </svg>
        </button>
      </div>
      <div class="snowflake-popup__balance-wrapper">
        <p class="snowflake-popup__balance-description">
          {{ $t('snowflakePopup.balanceDescription') }}
        </p>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          x="0px"
          y="0px"
          width="18"
          height="18"
          viewBox="0 0 64 64"
        >
          <path
            d="M 31.5 1 L 30 5 L 28 4 L 27 5 L 30.792969 10.689453 L 30.492188 14.59375 L 28.9375 13.410156 L 26.513672 9.4628906 L 25.386719 9.5625 L 25.289062 11.699219 L 23.201172 12.166016 L 23.298828 13.292969 L 27.619141 15.001953 L 30.246094 17.789062 L 30.013672 20.816406 L 23.166016 24.619141 L 20.568359 23.375 L 19.466797 19.708984 L 20.150391 15.111328 L 19.222656 14.462891 L 17.775391 16.037109 L 15.875 15.052734 L 15.226562 15.980469 L 17.433594 20.056641 L 17.679688 21.992188 L 14.146484 20.298828 L 11.117188 14.169922 L 9.7519531 14.535156 L 9.6171875 16.767578 L 5.4023438 16.066406 L 4.9023438 16.933594 L 7.6171875 20.232422 L 5.7519531 21.464844 L 6.1171875 22.830078 L 12.941406 22.388672 L 16.171875 24.601562 L 14.373047 25.355469 L 9.7382812 25.482422 L 9.2617188 26.509766 L 11.064453 27.660156 L 10.423828 29.703125 L 11.449219 30.181641 L 15.085938 27.292969 L 18.814453 26.412109 L 21 27.908203 L 21 36.091797 L 18.814453 37.587891 L 15.085938 36.707031 L 11.449219 33.818359 L 10.423828 34.296875 L 11.064453 36.339844 L 9.2617188 37.490234 L 9.7382812 38.517578 L 14.373047 38.644531 L 16.171875 39.398438 L 12.941406 41.611328 L 6.1171875 41.169922 L 5.7519531 42.535156 L 7.6171875 43.767578 L 4.9023438 47.066406 L 5.4023438 47.933594 L 9.6171875 47.232422 L 9.7519531 49.464844 L 11.117188 49.830078 L 14.146484 43.701172 L 17.679688 42.007812 L 17.433594 43.943359 L 15.226562 48.019531 L 15.875 48.947266 L 17.775391 47.962891 L 19.222656 49.537109 L 20.150391 48.888672 L 19.466797 44.291016 L 20.568359 40.625 L 23.166016 39.380859 L 30.013672 43.183594 L 30.246094 46.210938 L 27.619141 48.998047 L 23.298828 50.707031 L 23.201172 51.833984 L 25.289062 52.300781 L 25.386719 54.4375 L 26.513672 54.537109 L 28.9375 50.589844 L 30.492188 49.40625 L 30.792969 53.310547 L 27 59 L 28 60 L 30 59 L 31.5 63 L 32.5 63 L 34 59 L 36 60 L 37 59 L 33.207031 53.310547 L 33.507812 49.40625 L 35.0625 50.589844 L 37.486328 54.537109 L 38.613281 54.4375 L 38.710938 52.300781 L 40.798828 51.833984 L 40.701172 50.707031 L 36.380859 48.998047 L 33.753906 46.210938 L 33.986328 43.183594 L 40.833984 39.380859 L 43.431641 40.625 L 44.533203 44.291016 L 43.849609 48.888672 L 44.777344 49.537109 L 46.224609 47.962891 L 48.125 48.947266 L 48.773438 48.019531 L 46.566406 43.943359 L 46.320312 42.007812 L 49.853516 43.701172 L 52.882812 49.830078 L 54.248047 49.464844 L 54.382812 47.232422 L 58.597656 47.933594 L 59.097656 47.066406 L 56.382812 43.767578 L 58.248047 42.535156 L 57.882812 41.169922 L 51.058594 41.611328 L 47.828125 39.398438 L 49.626953 38.644531 L 54.261719 38.517578 L 54.738281 37.490234 L 52.935547 36.339844 L 53.576172 34.296875 L 52.550781 33.818359 L 48.914062 36.707031 L 45.185547 37.587891 L 43 36.091797 L 43 27.908203 L 45.185547 26.412109 L 48.914062 27.292969 L 52.550781 30.181641 L 53.576172 29.703125 L 52.935547 27.660156 L 54.738281 26.509766 L 54.261719 25.482422 L 49.626953 25.355469 L 47.828125 24.601562 L 51.058594 22.388672 L 57.882812 22.830078 L 58.248047 21.464844 L 56.382812 20.232422 L 59.097656 16.933594 L 58.597656 16.066406 L 54.382812 16.767578 L 54.248047 14.535156 L 52.882812 14.169922 L 49.853516 20.298828 L 46.320312 21.992188 L 46.566406 20.056641 L 48.773438 15.980469 L 48.125 15.052734 L 46.224609 16.037109 L 44.777344 14.462891 L 43.849609 15.111328 L 44.533203 19.708984 L 43.431641 23.375 L 40.833984 24.619141 L 33.986328 20.816406 L 33.753906 17.789062 L 36.380859 15.001953 L 40.701172 13.292969 L 40.798828 12.166016 L 38.710938 11.699219 L 38.613281 9.5625 L 37.486328 9.4628906 L 35.0625 13.410156 L 33.507812 14.59375 L 33.207031 10.689453 L 37 5 L 36 4 L 34 5 L 32.5 1 L 31.5 1 z M 32 24.287109 L 39 28.177734 L 39 35.822266 L 32 39.712891 L 25 35.822266 L 25 28.177734 L 32 24.287109 z"
          ></path>
        </svg>
        <p class="snowflake-popup__balance-amount">
          {{ GET_SNOWFLAKE_POINTS || 0 }}
        </p>
      </div>
      <ul class="snowflake-popup__list">
        <li class="snowflake-popup__item-title">
          {{ $t('snowflakePopup.itemTitle') }}
        </li>
        <li class="snowflake-popup__item-description">
          {{ $t('snowflakePopup.itemDescriptionFirst') }}
        </li>
        <li class="snowflake-popup__item-description">
          {{ $t('snowflakePopup.itemDescriptionSecond') }}
        </li>
        <li class="snowflake-popup__item-description">
          {{ $t('snowflakePopup.itemDescriptionThird') }}
        </li>
        <li class="snowflake-popup__item-description">
          {{ $t('snowflakePopup.itemDescriptionFourth') }}
        </li>
        <li class="snowflake-popup__item-description">
          {{ $t('snowflakePopup.itemDescriptionFive') }}
          <a href="https://t.me/addlist/tShqOXNZ89tmYTg8" class="snowflake-popup__item-link" target="_blank">{{ $t('snowflakePopup.itemDescriptionLink') }}</a>.
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  computed: {
    ...mapGetters(['GET_SNOWFLAKE_POINTS']),
  },
}
</script>

<style scoped>
.snowflake-popup__background {
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
}

.snowflake-popup__wrapper {
  height: auto;
  width: 440px;
  padding: 18px;
  border-radius: 20px;
  background: var(--iface-main-bg);
  display: flex;
  flex-direction: column;
}

.snowflake-popup__top-box {
  display: flex;
  justify-content: space-between;
}

.snowflake-popup__top-title {
  font-weight: 500;
  font-size: 24px;
  line-height: 28px;
  margin-bottom: 18px;
}

.snowflake-popup__close-btn {
  width: 24px;
  height: 24px;
  border: none;
  outline: none;
  background: transparent;
}

.snowflake-popup__balance-wrapper {
  gap: 5px;
  display: flex;
  align-items: center;
  margin-bottom: 18px;
}

.snowflake-popup__balance-description {
  font-size: 16px;
  line-height: normal;
}

.snowflake-popup__balance-wrapper svg {
  fill: var(--snowflake-color);
}

.snowflake-popup__balance-amount {
  white-space: nowrap;
  color: var(--main-text-color);
  font-size: 16px;
  font-weight: 400;
  line-height: normal;
}

.snowflake-popup__item-title {
  font-size: 16px;
  margin-bottom: 16px;
  opacity: 0.7;
  line-height: normal;
}

.snowflake-popup__item-description {
  display: flex;
  font-size: 14px;
  min-height: 34px;
  max-width: 400px;
  align-items: center;
  opacity: 0.9;
  line-height: normal;
}

.snowflake-popup__item-description:not(:last-child) {
  margin-bottom: 14px;
}

.snowflake-popup__item-description::before {
  content: '✽';
  margin-right: 10px;
  flex-shrink: 0;
}

.snowflake-popup__item-link {
  display: contents;
  color: var(--main-blue);
}
</style>