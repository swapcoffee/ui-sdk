<template>
  <div class="popup-background" @click.self="$emit('closeSuccess')">
    <div class="success">
      <div class="success__menu">
        <button class="success__close-btn" @click="$emit('closeSuccess')">
          <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
          >
            <g opacity="0.8">
              <path
                  d="M19.2806 18.2194C19.3502 18.2891 19.4055 18.3718 19.4432 18.4628C19.4809 18.5539 19.5003 18.6515 19.5003 18.75C19.5003 18.8485 19.4809 18.9461 19.4432 19.0372C19.4055 19.1282 19.3502 19.2109 19.2806 19.2806C19.2109 19.3503 19.1281 19.4056 19.0371 19.4433C18.9461 19.481 18.8485 19.5004 18.7499 19.5004C18.6514 19.5004 18.5538 19.481 18.4628 19.4433C18.3717 19.4056 18.289 19.3503 18.2193 19.2806L11.9999 13.0603L5.78055 19.2806C5.63982 19.4214 5.44895 19.5004 5.24993 19.5004C5.05091 19.5004 4.86003 19.4214 4.7193 19.2806C4.57857 19.1399 4.49951 18.949 4.49951 18.75C4.49951 18.551 4.57857 18.3601 4.7193 18.2194L10.9396 12L4.7193 5.78062C4.57857 5.63989 4.49951 5.44902 4.49951 5.25C4.49951 5.05097 4.57857 4.8601 4.7193 4.71937C4.86003 4.57864 5.05091 4.49958 5.24993 4.49958C5.44895 4.49958 5.63982 4.57864 5.78055 4.71937L11.9999 10.9397L18.2193 4.71937C18.36 4.57864 18.5509 4.49958 18.7499 4.49958C18.949 4.49958 19.1398 4.57864 19.2806 4.71937C19.4213 4.8601 19.5003 5.05097 19.5003 5.25C19.5003 5.44902 19.4213 5.63989 19.2806 5.78062L13.0602 12L19.2806 18.2194Z"
                  fill="white"
              />
            </g>
          </svg>
        </button>
      </div>
      <div class="success__wrapper">
        <div
            v-show="
            getTransactionStatus === 'pending' || getTransactionStatus === 'partially_complete'
          "
            id="loading"
            class="success__lottie"
        />
        <div v-show="getTransactionStatus === 'succeeded'" id="success" class="success__lottie" />
        <div
            v-show="getTransactionStatus === 'failed' || getTransactionStatus === 'timed_out'"
            id="failed"
            class="success__lottie"
        />
      </div>
      <h2 class="success__title">
        {{ getStatusDisplay }}
      </h2>
      <div class="success__total">
        <img :src="getSendImage" alt="Token logo in TON blockchain" class="success__token-image" />
        <p class="success__token-name">
          {{ getSendTotal }}
        </p>
        <svg
            class="success__arrow-icon"
            xmlns="http://www.w3.org/2000/svg"
            width="17"
            height="16"
            viewBox="0 0 17 16"
            fill="none"
        >
          <g opacity="0.8">
            <path
                d="M14.3538 8.35378L9.85375 12.8538C9.75993 12.9476 9.63268 13.0003 9.5 13.0003C9.36732 13.0003 9.24007 12.9476 9.14625 12.8538C9.05243 12.76 8.99972 12.6327 8.99972 12.5C8.99972 12.3674 9.05243 12.2401 9.14625 12.1463L12.7931 8.50003H3C2.86739 8.50003 2.74021 8.44736 2.64645 8.35359C2.55268 8.25982 2.5 8.13264 2.5 8.00003C2.5 7.86743 2.55268 7.74025 2.64645 7.64648C2.74021 7.55271 2.86739 7.50003 3 7.50003H12.7931L9.14625 3.85378C9.05243 3.75996 8.99972 3.63272 8.99972 3.50003C8.99972 3.36735 9.05243 3.2401 9.14625 3.14628C9.24007 3.05246 9.36732 2.99976 9.5 2.99976C9.63268 2.99976 9.75993 3.05246 9.85375 3.14628L14.3538 7.64628C14.4002 7.69272 14.4371 7.74786 14.4623 7.80856C14.4874 7.86926 14.5004 7.93433 14.5004 8.00003C14.5004 8.06574 14.4874 8.13081 14.4623 8.1915C14.4371 8.2522 14.4002 8.30735 14.3538 8.35378Z"
                fill="#FFFFFF"
            />
          </g>
        </svg>
        <img
            :src="getReceiveImage"
            alt="Token logo in TON blockchain"
            class="success__token-image"
        />
        <p class="success__token-name">
          {{ getReceiveTotal }}
        </p>
      </div>
      <div class="success__scroll-block custom-scroll">
        <div
            v-if="getTransactionStatus === 'pending' || getTransactionStatus === 'partially_complete'"
            class="success__tokens-list"
        >
          <div
              v-for="(route, index) in getRoutes.slice(0, routeCount)"
              :key="index"
              class="success__flex"
          >
            <div class="success__group">
              <div class="success__distribution">
                <img :src="route.dex.imageUrl" alt="DEX logo" class="success__route-image" />
                <p class="success__percentage">{{ route.inputPercentage }}%</p>
              </div>
              <p class="success__route-path">
                {{ route.path }}
              </p>
            </div>
            <svg
                v-if="transaction[index]?.status === 'succeeded'"
                class="success__status-icon succeeded"
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
            >
              <path
                  d="M8.58075 12.1463L6.25775 9.823C6.11925 9.68467 5.94517 9.61383 5.7355 9.6105C5.526 9.60733 5.34875 9.67817 5.20375 9.823C5.05892 9.968 4.9865 10.1437 4.9865 10.35C4.9865 10.5563 5.05892 10.732 5.20375 10.877L7.948 13.6212C8.12883 13.8019 8.33975 13.8923 8.58075 13.8923C8.82175 13.8923 9.03267 13.8019 9.2135 13.6212L14.777 8.05775C14.9153 7.91925 14.9862 7.74517 14.9895 7.5355C14.9927 7.326 14.9218 7.14875 14.777 7.00375C14.632 6.85892 14.4563 6.7865 14.25 6.7865C14.0437 6.7865 13.868 6.85892 13.723 7.00375L8.58075 12.1463ZM10.0017 19.5C8.68775 19.5 7.45267 19.2507 6.2965 18.752C5.14033 18.2533 4.13467 17.5766 3.2795 16.7218C2.42433 15.8669 1.74725 14.8617 1.24825 13.706C0.749417 12.5503 0.5 11.3156 0.5 10.0017C0.5 8.68775 0.749333 7.45267 1.248 6.2965C1.74667 5.14033 2.42342 4.13467 3.27825 3.2795C4.13308 2.42433 5.13833 1.74725 6.294 1.24825C7.44967 0.749417 8.68442 0.5 9.99825 0.5C11.3123 0.5 12.5473 0.749333 13.7035 1.248C14.8597 1.74667 15.8653 2.42342 16.7205 3.27825C17.5757 4.13308 18.2528 5.13833 18.7518 6.294C19.2506 7.44967 19.5 8.68442 19.5 9.99825C19.5 11.3123 19.2507 12.5473 18.752 13.7035C18.2533 14.8597 17.5766 15.8653 16.7218 16.7205C15.8669 17.5757 14.8617 18.2528 13.706 18.7518C12.5503 19.2506 11.3156 19.5 10.0017 19.5Z"
                  fill="#55FF85"
              />
            </svg>
            <svg
                v-if="
                transaction[index]?.status === 'pending' ||
                transaction[index]?.status === 'partially_complete'
              "
                class="success__status-icon pending"
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
            >
              <path
                  d="M10 18C9.44772 18 9 17.5523 9 17C9 16.4477 9.44772 16 10 16C13.3137 16 16 13.3137 16 10C16 6.68629 13.3137 4 10 4C6.68629 4 4 6.68629 4 10C4 10.6472 4.10214 11.2793 4.3002 11.8802C4.4731 12.4047 4.18807 12.9701 3.66355 13.143C3.13902 13.3159 2.57365 13.0308 2.40074 12.5063C2.13628 11.7041 2 10.8606 2 10C2 5.58172 5.58172 2 10 2C14.4183 2 18 5.58172 18 10C18 14.4183 14.4183 18 10 18Z"
                  fill="white"
              />
            </svg>
            <svg
                v-if="
                transaction[index]?.status === 'failed' ||
                transaction[index]?.status === 'timed_out'
              "
                class="success__status-icon failed"
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
            >
              <path
                  d="M12 16.7308C12.2288 16.7308 12.4207 16.6533 12.5755 16.4985C12.7303 16.3437 12.8077 16.1518 12.8077 15.923C12.8077 15.6942 12.7303 15.5023 12.5755 15.3475C12.4207 15.1928 12.2288 15.1155 12 15.1155C11.7712 15.1155 11.5793 15.1928 11.4245 15.3475C11.2697 15.5023 11.1923 15.6942 11.1923 15.923C11.1923 16.1518 11.2697 16.3437 11.4245 16.4985C11.5793 16.6533 11.7712 16.7308 12 16.7308ZM12.0003 13.077C12.2129 13.077 12.391 13.0051 12.5345 12.8613C12.6782 12.7176 12.75 12.5395 12.75 12.327V7.827C12.75 7.6145 12.6781 7.43633 12.5343 7.2925C12.3904 7.14883 12.2122 7.077 11.9998 7.077C11.7871 7.077 11.609 7.14883 11.4655 7.2925C11.3218 7.43633 11.25 7.6145 11.25 7.827V12.327C11.25 12.5395 11.3219 12.7176 11.4658 12.8613C11.6096 13.0051 11.7878 13.077 12.0003 13.077ZM12.0017 21.5C10.6877 21.5 9.45267 21.2507 8.2965 20.752C7.14033 20.2533 6.13467 19.5766 5.2795 18.7218C4.42433 17.8669 3.74725 16.8617 3.24825 15.706C2.74942 14.5503 2.5 13.3156 2.5 12.0017C2.5 10.6877 2.74933 9.45267 3.248 8.2965C3.74667 7.14033 4.42342 6.13467 5.27825 5.2795C6.13308 4.42433 7.13833 3.74725 8.294 3.24825C9.44967 2.74942 10.6844 2.5 11.9983 2.5C13.3123 2.5 14.5473 2.74933 15.7035 3.248C16.8597 3.74667 17.8653 4.42342 18.7205 5.27825C19.5757 6.13308 20.2528 7.13833 20.7518 8.294C21.2506 9.44967 21.5 10.6844 21.5 11.9983C21.5 13.3123 21.2507 14.5473 20.752 15.7035C20.2533 16.8597 19.5766 17.8653 18.7218 18.7205C17.8669 19.5757 16.8617 20.2528 15.706 20.7518C14.5503 21.2506 13.3156 21.5 12.0017 21.5Z"
                  fill="#FF5449"
              />
            </svg>
          </div>
          <button v-if="getRoutes.length > 4" class="success__toggle-btn" @click="showMore">
            {{ getBtnText }}
          </button>
        </div>
        <div v-if="getTransactionStatus === 'succeeded'" class="success__tokens-list">
          <div class="success__flex padding-large">
            <div class="success__group">
              <p class="success__name">
                {{ $t('dexDetails.priceImpact.name') }}
              </p>
            </div>
            <p class="success__impact value_green" :class="getClassImpact">
              {{ getPriceImpactDisplay }}%
            </p>
          </div>
          <div class="success__flex padding-large">
            <p class="success__name">
              {{ $t('dexDetails.economy') }}
            </p>
            <p class="success__value value_green">{{ getProfitDisplay }}%</p>
          </div>
          <!--					<div class="success__flex padding-large"-->
          <!--						 v-show="GET_CASHBACK === true"-->
          <!--					>-->
          <!--						<p class="success__name">{{ $t("dexSuccess.cashback.name") }}</p>-->
          <!--						<p class="success__value value_green">{{ $t("dexSuccess.cashback.text") }}</p>-->
          <!--					</div>-->
          <div v-if="checkIntermediateTokens.length > 0" class="success__flex padding-large">
            <div class="success__group">
              <p class="success__name">
                {{ $t('dexSettings.intermediate.title') }}
              </p>
            </div>
            <p class="success__value">
              {{ getDisplayIntermediate }}
            </p>
          </div>
          <!--					<button class="success__toggle-btn text_colored"-->
          <!--							v-if="checkIntermediateTokens.length > 0"-->
          <!--							@click="swapIntermediateTokens"-->
          <!--					>-->
          <!--						{{ $t("dexSuccess.btnText") }}-->
          <!--					</button>-->
        </div>
        <div
            v-if="getTransactionStatus === 'failed' || getTransactionStatus === 'timed_out'"
            class="success__info"
        >
          <p class="success__info-text">
            {{ $t('dexSuccess.info[0]') }} <br />
            {{ $t('dexSuccess.info[1]') }}
          </p>
          <div class="success__tokens-list">
            <div class="success__flex padding-large">
              <div class="success__group">
                <p class="success__name">
                  {{ $t('dexSettings.intermediate.title') }}
                </p>
              </div>
              <p class="success__impact">
                {{ getDisplayIntermediate }}
              </p>
            </div>
          </div>
          <!--					<button class="success__btn text_colored"-->
          <!--							v-if="checkIntermediateTokens.length > 0"-->
          <!--							@click="swapIntermediateTokens"-->
          <!--					>-->
          <!--						{{ $t("dexSuccess.btnText") }}-->
          <!--					</button>-->
        </div>
      </div>
<!--      <button-->
<!--          v-if="getTransactionStatus === 'succeeded'"-->
<!--          class="success__share-btn"-->
<!--          @click="getShareLink"-->
<!--      >-->
<!--        <svg-->
<!--            class="share-icon"-->
<!--            xmlns="http://www.w3.org/2000/svg"-->
<!--            width="20"-->
<!--            height="20"-->
<!--            viewBox="0 0 18 18"-->
<!--            fill="none"-->
<!--        >-->
<!--          <path-->
<!--              d="M12.1604 4.06107C12.0118 3.91253 11.8225 3.81138 11.6164 3.7704C11.4104 3.72943 11.1968 3.75047 11.0027 3.83086C10.8086 3.91126 10.6426 4.0474 10.5259 4.22207C10.4092 4.39675 10.3468 4.60211 10.3468 4.81221V5.65473H7.78098C6.51342 5.65613 5.29817 6.16029 4.40187 7.05659C3.50557 7.95289 3.00141 9.16814 3 10.4357L3 14.1542C3 14.2951 3.05597 14.4302 3.15559 14.5299C3.25521 14.6295 3.39033 14.6855 3.53122 14.6855C3.67211 14.6855 3.80723 14.6295 3.90685 14.5299C4.00647 14.4302 4.06244 14.2951 4.06244 14.1542C4.06328 13.3092 4.39936 12.4989 4.99692 11.9014C5.59447 11.3038 6.40469 10.9678 7.24976 10.9669H10.3468V11.8094C10.3468 12.0195 10.4092 12.2249 10.5259 12.3996C10.6426 12.5742 10.8086 12.7104 11.0027 12.7908C11.1968 12.8712 11.4104 12.8922 11.6164 12.8512C11.8225 12.8103 12.0118 12.7091 12.1604 12.5606L15.2834 9.43754C15.5822 9.13868 15.75 8.7334 15.75 8.31082C15.75 7.88824 15.5822 7.48296 15.2834 7.1841L12.1604 4.06107Z"-->
<!--              fill="white"-->
<!--          />-->
<!--        </svg>-->
<!--        Share result-->
<!--      </button>-->
    </div>
    <!--		<app-notification class="error"-->
    <!--			v-show="showError"-->
    <!--			@closeCopyNotification="closeNotification"-->
    <!--		>-->
    <!--			Your browser or device does not support the share feature.-->
    <!--		</app-notification>-->
<!--    <app-notification v-show="showNotification" @close-copy-notification="closeNotification">-->
<!--      Copy to clipboard!-->
<!--    </app-notification>-->
  </div>
</template>

<script lang="ts">
import lottie from 'lottie-web';
import transactionRoutesMixin from '@/mixins/transactionRoutesMixin';
import computedMixins from '@/mixins/computedMixins';
import { Address } from '@ton/core';
import { useDexStore } from "@/stores/dex";
import TooltipWrapper from '@/components/ui/TooltipWrapper.vue';
import loadingAnimationData from '@/assets/lottie/loading.json';
import failedAnimationData from '@/assets/lottie/failed.json';
import successAnimationData from '@/assets/lottie/success.json';
import axios from "axios";
import AppNotification from '@/components/AppNotification.vue';

export default {
  name: 'DexSuccess',
  components: { AppNotification, TooltipWrapper },
  mixins: [transactionRoutesMixin, computedMixins],
  props: {
    transaction: {
      type: Object,
      default() {
        return {};
      },
      required: true,
    },
    trInfo: {
      type: Object,
      default() {
        return {};
      },
      required: true,
    },
  },
  data() {
    return {
      transactionResult: null,
      requestInterval: null,
      routeCount: 4,
      tooltipList: [],
      showNotification: false,
      noticeTimeout: null,
      // load: true,
    };
  },
  computed: {
    dexStore() {
      return useDexStore();
    },
    getBtnText() {
      if (this.routeCount === 4) {
        return 'Show all';
      } else {
        return 'Hide all';
      }
    },
    getSendTotal() {
      if (this.getTransactionStatus === 'succeeded') {
        let inputAmount = 0;
        let address = null;
        this.getTransactionResult.forEach((item) => {
          inputAmount += item?.input?.amount;
          if (address === null) {
            address = item?.input?.token_address;
          }
        });
        return `${inputAmount.toFixed(2)}` + ' ' + `${this.getTokenByAddress(address)?.symbol}`;
      } else {
        if (this.dexStore.GET_DEAL_CONDITIONS !== null) {
          return (
              `${this.dexStore.GET_DEAL_CONDITIONS?.input_amount.toFixed(2)}` +
              ' ' +
              `${this.dexStore.GET_SEND_TOKEN?.symbol}`
          );
        } else {
          return 'token';
        }
      }
    },
    getSendImage() {
      if (this.getTransactionStatus === 'succeeded') {
        let address = null;
        this.getTransactionResult.forEach((item) => {
          if (address === null) {
            address = item?.input?.token_address;
          }
        });
        return this.getTokenByAddress(address)?.image;
      } else {
        return this.dexStore.GET_SEND_TOKEN?.image;
      }
    },
    getReceiveTotal() {
      if (this.getTransactionStatus === 'succeeded') {
        let outputAmount = 0;
        let address = null;
        this.getTransactionResult.forEach((item) => {
          outputAmount += item?.output?.amount;
          if (address === null) {
            address = item?.output?.token_address;
          }
        });
        return `${outputAmount.toFixed(2)}` + ' ' + `${this.getTokenByAddress(address)?.symbol}`;
      } else {
        if (this.dexStore.GET_DEAL_CONDITIONS !== null) {
          return (
              `${this.dexStore.GET_DEAL_CONDITIONS?.output_amount.toFixed(2)}` +
              ' ' +
              `${this.dexStore.GET_RECEIVE_TOKEN?.symbol}`
          );
        } else {
          return 'token';
        }
      }
    },
    getReceiveImage() {
      if (this.getTransactionStatus === 'succeeded') {
        let address = null;
        this.getTransactionResult.forEach((item) => {
          if (address === null) {
            address = item?.output?.token_address;
          }
        });
        return this.getTokenByAddress(address)?.image;
      } else {
        return this.dexStore.GET_RECEIVE_TOKEN?.image;
      }
    },
    getTransactionResult() {
      if (this.getTransactionStatus === 'succeeded') {
        let succeededList = [];

        this.transactionResult.forEach((item) => {
          if (item?.status === 'succeeded') {
            let filteredObject = {
              status: item.status,
              input: item.input,
              output: item.output,
            };
            succeededList.push(filteredObject);
          }
        });

        return succeededList;
      }
    },
    getTransactionStatus() {
      // return 'failed'
      if (this.transactionResult !== null) {
        let findFailed = this.transactionResult.find((item) => item?.status === 'failed');
        let findTimedOut = this.transactionResult.find((item) => item?.status === 'timed_out');
        let findPending = this.transactionResult.find((item) => item?.status === 'pending');
        let findPartiallyComplete = this.transactionResult.find(
            (item) => item?.status === 'partially_complete',
        );
        let findSucceeded = this.transactionResult.find((item) => item?.status === 'succeeded');

        if (findSucceeded && !findPending && !findPartiallyComplete) {
          return 'succeeded';
        } else if (findPending) {
          return 'pending';
        } else if (findPartiallyComplete) {
          return 'partially_complete';
        } else if (findFailed) {
          return 'failed';
        } else if (findTimedOut) {
          return 'timed_out';
        }
      } else {
        return 'pending';
      }
    },
    getStatusDisplay() {
      if (this.getTransactionStatus === 'failed') {
        return this.$t('dexSuccess.status.error');
      } else if (this.getTransactionStatus === 'timed_out') {
        return this.$t('dexSuccess.status.timed_out');
      } else if (
          this.getTransactionStatus === 'pending' ||
          this.getTransactionStatus === 'partially_complete'
      ) {
        return this.$t('dexSuccess.status.pending');
      } else {
        return this.$t('dexSuccess.status.success');
      }
    },
    getProfitDisplay() {
      let profit = (this.GET_DEAL_CONDITIONS?.savings * 100).toFixed(2);
      return Number(profit) > 100 ? '>100' : profit;
    },
    getPriceImpactDisplay() {
      let pi = this.getPriceImpact;
      if (pi) {
        return pi > 0 ? `+${pi}` : pi;
      } else {
        return 0;
      }
    },
    getClassImpact() {
      if (this.getPriceImpact <= -5) {
        return 'red-impact';
      } else if (this.getPriceImpact <= -1) {
        return 'yellow-impact';
      } else {
        return 'green-impact';
      }
    },
    getPriceImpact() {
      if (this.dexStore.GET_DEAL_CONDITIONS !== null) {
        let priceImpact = this.dexStore.GET_DEAL_CONDITIONS?.price_impact * 100;
        return priceImpact.toFixed(2);
      } else {
        return 0;
      }
    },
    checkIntermediateTokens() {
      let failedArray = [];

      this.transactionResult.forEach((item) => {
        if (item?.status === 'failed' || item?.status === 'timed_out') {
          failedArray.push(item);
        }
      });

      return failedArray;
      // let findFailed = null
      // let findTimedOut = null
      // if (this.transactionResult !== null) {
      // 	findFailed = this.transactionResult.find((item) => item?.status === 'failed')
      // 	findTimedOut = this.transactionResult.find((item) => item?.status === 'timed_out')
      // }
      // let intermediateToken = null
      //
      // if (findFailed) {
      // 	intermediateToken = this.findIntermediate(findFailed)
      // } else if (findTimedOut) {
      // 	intermediateToken = this.findIntermediate(findTimedOut)
      // }
      // return intermediateToken
    },
    getDisplayIntermediate() {
      // let intermediateAmount = 0
      let message = '';
      if (this.checkIntermediateTokens.length > 0) {
        this.checkIntermediateTokens.forEach((item, index) => {
          let findToken = this.findIntermediate(item);
          let intermediate = this.getTokenByAddress(findToken?.token_address);

          message += findToken?.amount.toFixed(2) + ' ' + intermediate?.symbol;
          if (index + 1 < this.checkIntermediateTokens.length) {
            message += ', ';
          }
        });
      }

      return message;
    },
    getText() {
      return this.$t('dexSuccess.resultText', { token: this.dexStore.GET_RECEIVE_TOKEN?.symbol });
    },
    getOurPrice() {
      let regexp = /[^0-9,.]/g;
      let profit = Number(this.getProfitDisplay.replace(regexp, ''));
      let market = 0;
      if (profit > 0) {
        market = this.getMarketPrice * (1 - profit / 100);
      } else {
        market = this.getMarketPrice;
      }
      return market.toFixed(4);
    },
    getMarketPrice() {
      let receive = this.dexStore.GET_RECEIVE_TOKEN?.price_usd;
      return Number(receive.toFixed(4));
    },
    isWindows() {
      return /Windows/i.test(navigator.userAgent);
    },
  },
  methods: {
    showShareError() {
      this.showNotification = true;
      if (this.noticeTimeout) {
        clearTimeout(this.noticeTimeout);
      }
      this.noticeTimeout = setTimeout(() => {
        this.showNotification = false;
        this.noticeTimeout = null;
      }, 3000);
    },
    closeNotification() {
      this.showNotification = false;

      if (this.noticeTimeout) {
        clearTimeout(this.noticeTimeout);
        this.noticeTimeout = null;
      }
    },
    showTooltip(value) {
      this.tooltipList.push(value);
    },
    hideTooltip(value) {
      let findIndex = this.tooltipList.findIndex((item) => item === value);
      this.tooltipList.splice(findIndex, 1);
    },
    hiddenTooltip() {
      this.tooltipList = [];
    },
    async copyToClipboard(blob) {
      try {
        let item = new ClipboardItem({ 'image/png': blob.data });
        await navigator.clipboard.write([item]);
        this.showShareError();
      } catch (err) {
        console.error(err);
      }
    },
    async shareResult(blob) {
      try {
        let file = new File([blob.data], 'result.png', { type: 'image/png' });
        let data = {
          // text: this.getText,
          files: [file],
        };
        if (navigator.share && navigator.canShare(data)) {
          await navigator.share(data);
        } else {
          await this.copyToClipboard(blob);
        }
      } catch (err) {
        console.error(err);
      }
    },
    async getImageAsBlob(url) {
      try {
        return await axios.get(url, { responseType: 'blob' });
      } catch (err) {
        console.error(err);
      }
    },
    createUrl(params) {
      if (params !== null) {
        let query = `?in_token=${params?.in}&out_token=${params?.out}&profit_percent=${params?.profit}&market_price=${params?.market_price}&our_price=${params?.our_price}&time=${params?.time}&utc_offset=${params?.utc}&ref=${params?.ref}`;
        return 'https://img.swap.coffee/v1/image/profits' + query;
      } else {
        return '';
      }
    },
    getTokenByAddress(tokenAddress) {
      let searchAddress = '';

      if (tokenAddress !== 'native') {
        searchAddress = Address.parseFriendly(tokenAddress).address.toRawString();
      } else {
        searchAddress = 'native';
      }

      return this.dexStore.GET_TON_TOKENS.find((find) => find.address === searchAddress);
    },
    findIntermediate(split) {
      let result = null;
      let index = 0;
      split?.steps.forEach((token) => {
        ++index;
        if (token.status === 'failed' || token.status === 'timed_out') {
          result = split.steps[index - 1].output;
        }
      });
      return result;
    },
    async checkTransactionStatus(trInfo) {
      try {
        this.transactionResult = await this.dexApiV2.getTransactions(trInfo?.route_id);
        if (
            this.getTransactionStatus === 'failed' ||
            this.getTransactionStatus === 'timed_out' ||
            this.getTransactionStatus === 'succeeded'
        ) {
          clearInterval(this.requestInterval);
        }
      } catch (err) {
        throw err;
      }
    },
    showMore() {
      if (this.routeCount === 4) {
        this.routeCount = 20;
      } else {
        this.routeCount = 4;
      }
    },
    swapIntermediateTokens() {
      let rawIntermediateAddress = '';
      let findToken = this.findIntermediate(this.checkIntermediateTokens[0]);
      let intermediate = this.getTokenByAddress(findToken?.token_address);
      // let intermediate = this.getIntermediateFromTokenList
      // if (this.checkIntermediateTokens?.token_address !== 'native') {
      // 	rawIntermediateAddress = Address.parseFriendly(this.checkIntermediateTokens?.token_address).address.toRawString()
      // } else {
      // 	rawIntermediateAddress = 'native'
      // }
      // let intermediate = this.GET_TON_TOKENS.find((find) => find.address === rawIntermediateAddress)
      let necessaryToken = null;

      if (this.dexStore.GET_SWAP_MODE === 'default') {
        necessaryToken = this.dexStore.GET_RECEIVE_TOKEN;
      } else {
        necessaryToken = this.dexStore.GET_SEND_TOKEN;
      }

      this.dexStore.DEX_SEND_TOKEN(intermediate);
      this.dexStore.DEX_RECEIVE_TOKEN(necessaryToken);
      setTimeout(() => {
        this.$router.replace({
          name: 'Dex',
          query: {
            ft: intermediate?.symbol,
            st: necessaryToken?.symbol,
          },
        });
      }, 100);
      this.$emit('closeSuccess');
    },
  },
  mounted() {
    this.transactionResult = this.transaction;
    this.requestInterval = setInterval(() => {
      this.checkTransactionStatus(this.trInfo);
    }, 5000);

    lottie.loadAnimation({
      container: document.getElementById('loading'), // the dom element that will contain the animation
      renderer: 'svg',
      loop: true,
      autoplay: true,
      name: 'loading',
      animationData: loadingAnimationData,
    });

    lottie.loadAnimation({
      container: document.getElementById('failed'), // the dom element that will contain the animation
      renderer: 'svg',
      loop: true,
      autoplay: true,
      name: 'failed',
      animationData: failedAnimationData,
    });

    lottie.loadAnimation({
      container: document.getElementById('success'), // the dom element that will contain the animation
      renderer: 'svg',
      loop: true,
      autoplay: true,
      name: 'success',
      animationData: successAnimationData,
    });
  },
  unmounted() {
    clearInterval(this.requestInterval);
  },
};
</script>

<style scoped>
.popup-background {
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

.success {
  width: 460px;
  z-index: 999;
  padding: 18px;
  background: var(--iface-main-bg);
  border-radius: 20px;
}

.success__menu {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  margin-bottom: 30px;
}

.success__close-btn {
  width: 24px;
  height: 24px;
  background: transparent;
  border: none;
  outline: none;
}

.success__wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 30px;
}

.success__symbol {
  color: #ffffff;
  font-size: 24px;
  font-family: Roboto, sans-serif;
  font-weight: 500;
}

.success__lottie {
  width: 200px;
  height: 200px;
}

.success__icon {
  width: 86px;
  height: 86px;
}

.success__wrapper__description {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 15px;
  justify-content: center;
}

.success__title {
  margin-bottom: 10px;
  font-size: 24px;
  font-family: Roboto, sans-serif;
  font-weight: 500;
  text-align: center;
}

.success__scroll-block {
  max-height: 223px;
  height: auto;
  overflow-y: auto;
}

.success__tokens-list {
  display: flex;
  flex-direction: column;
  margin-top: 20px;
  border-radius: 14px;
  overflow: hidden;
  gap: 1px 0;
}

.success__total {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0 6px;
}

.success__distribution {
  font-size: 16px;
  text-align: center;
}

.success__flex {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 3px;
  background: var(--iface-white8);
  padding: 8px 12px 8px 8px;
}

.padding-large {
  padding: 12px;
}

.success__token-image {
  width: 18px;
  height: 18px;
  border-radius: 100px;
}

.success__token-name {
  font-size: 16px;
}

.success__arrow-icon {
  margin: 0 4px;
  width: 16px;
  height: 16px;
}

.success__route-image {
  margin-right: 6px;
  width: 18px;
  height: 18px;
  border-radius: 100px;
}

.success__route-arrow {
  width: 14px;
  height: 14px;
}

.success__distribution {
  display: flex;
  align-items: center;
  padding: 6px;
  margin-right: 6px;
  border-radius: 10px;
  background: var(--iface-white6);
}

.success__route-path {
  font-size: 13px;
  line-height: 16px;
}

.success__percentage {
  font-size: 14px;
  line-height: 16px;
  color: var(--main-green);
}

.success__status-icon {
  width: 24px;
  height: 24px;
  border-radius: 100px;
}

.succeeded path {
  fill: var(--main-green);
}

.pending {
  background-size: cover;
  animation: 1s forwards linear infinite Loader;
}

.pending path {
  fill: var(--main-text-color);
}

.failed path {
  fill: var(--main-red);
}

/* .success__info {
	padding: 12px;
	border-radius: 14px;
	border: 1px solid rgba(255, 207, 85, 0.4);
	background: rgba(255, 207, 85, 0.06);
} */

.success__toggle-btn {
  padding: 10px 12px;
  border: none;
  background: var(--iface-white4);
  font-family: Roboto, sans-serif;
  font-weight: 400;
  font-size: 13px;
  color: var(--main-text-color);
}

.text_colored {
  color: var(--iface-accent-color);
}

.success__btn {
  transition: 0.2s;
  width: 100%;
  margin-top: 20px;
  padding: 16px;
  border: none;
  outline: none;
  border-radius: 14px;
  background: var(--iface-accent-color);
  box-shadow: 0px 2px 10px 0px rgba(0, 0, 0, 0.25);
  font-size: 16px;
  line-height: 20px;
  color: #fff;
}

.success__btn:hover {
  background: var(--iface-accent-hover);
}

.success__info-text {
  margin: 20px 0;
  font-size: 14px;
  line-height: 18px;
  letter-spacing: 0.4px;
  text-align: center;
  /* color: rgba(255, 207, 85, 1); */
}

.success__more-info {
  display: flex;
  flex-direction: column;
  gap: 10px 0;
}

.success__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.success__group {
  display: flex;
  flex-direction: row;
  align-items: center;
}

.success__name {
  margin-right: 15px;
  font-size: 14px;
  line-height: 18px;
  opacity: 0.5;
  white-space: nowrap;
}

.success__info-icon {
  margin-left: 5px;
  width: 16px;
  height: 16px;
  cursor: help;
}

.success__value {
  font-size: 14px;
  line-height: 18px;
}

.success__impact {
  margin-left: 4px;
  font-size: 14px;
  line-height: 18px;
  opacity: 1;
}

.icon-wrapper {
  position: relative;
}

.success__tooltip {
  bottom: 25px;
  left: 50%;
  transform: translateX(-30.5%);
}

.value_green {
  color: var(--main-green);
}

.theme-light svg path {
  fill: #141414;
}

.custom-scroll::-webkit-scrollbar {
  display: none;
}

.success__share-btn {
  transition: 0.2s;
  width: 100%;
  height: 50px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 10px;
  padding: 13px;
  border-radius: 12px;
  border: none;
  background: var(--iface-accent-color);
  font-size: 14px;
  line-height: 24px;
  font-weight: 400;
}

.success__share-btn:hover {
  background: var(--iface-accent-hover);
}

.share-icon {
  margin-right: 5px;
}

.share-icon path {
  fill: var(--main-text-color);
}

@media screen and (max-width: 640px) {
  .success {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    width: 100%;
    border-radius: 20px 20px 0 0;
    display: flex;
    flex-direction: column;
  }

  .success__scroll-block {
    max-height: none;
    height: auto;
    overflow-y: auto;
  }

  .success__tooltip {
    width: calc(100% - 10px);
    left: 5px;
    right: 5px;
    top: 85px;
    bottom: auto;
    transform: translateX(0);
    z-index: 999;
  }

  .icon-wrapper {
    position: static;
  }
}

@media screen and (max-height: 680px) {
  .success {
    max-height: 100dvh;
  }
}
</style>
