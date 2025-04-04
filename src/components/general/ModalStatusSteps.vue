<template>
    <div class="modal__status transaction">
        <div class="transaction__lottie-wrapper">
            <div class="transaction__lottie"
                 v-if="status === 'pending'"
                 id="pending"
            ></div>
            <div class="transaction__lottie"
                 v-if="status === 'success'"
                 id="success"
            ></div>
            <div class="transaction__lottie"
                 v-if="status === 'failed'"
                 id="failed"
            ></div>
        </div>
        <h2 class="transaction__title">{{ getTitle }}</h2>
        <SwapDealInfo
            v-if="modalState.mode === 'swap' && status !== 'success'"
        />
        <p class="transaction__text"
            v-if="!(modalState.mode === 'swap' && status === 'pending')"
        >
            {{ getDescription }}
        </p>
        <div class="transaction__group"
             v-if="status !== 'failed' && modalState.mode !== 'deploy-smart' && modalState.mode !== 'cancel'"
        >
            <ModalDetails
                :size="'small'"
                :poolDetails="details"
                :detailsTitle="getDetailsTitle"
                :withoutHeading="true"
                :status="status"
            />
            <button
                class="transaction__btn share-btn"
                v-if="modalState.mode === 'swap'"
                @click="getShareLink"
            >
                <TransactionShareIcon />
                Share
            </button>
        </div>
        <div class="transaction__group"
            v-else
        >
            <div class="transaction__intermediate"
                v-if="modalState.mode === 'swap' && checkIntermediateTokens.length > 0"
            >
                <div class="intermediate__group">
                    <p class="intermediate__name">
                        {{ $t('dexSettings.intermediate.title') }}
                    </p>
                </div>
                <p class="intermediate__result">
                    {{ getDisplayIntermediate }}
                </p>
            </div>
            <button class="transaction__btn back-btn"
                    @click="goBack"
            >
                Close
            </button>
        </div>
        <app-notification
            v-show="showNotification"
            @close-copy-notification="closeNotification"
        >
            Copy to clipboard!
        </app-notification>
    </div>
</template>

<script>
import ModalDetails from "@/components/general/ModalDetails.vue";
import PoolDetailsItem from "@/components/earn/pool-page/PoolDetailsItem.vue";
import loadingAnimationData from '@/assets/lottie/loading.json';
import failedAnimationData from '@/assets/lottie/failed.json';
import successAnimationData from '@/assets/lottie/success.json';
import lottie from "lottie-web";
import SwapDealInfo from "@/components/general/SwapDealInfo.vue";
import TransactionShareIcon from "@/assets/general/TransactionShareIcon.vue";
import AppNotification from "@/components/AppNotification.vue";

import {useTransactionStore} from "@/stores/transaction";
import {useDexStore} from "@/stores/dex";

export default {
    name: "ModalStatusStep",
    components: {
        AppNotification,
        TransactionShareIcon,
        SwapDealInfo,
        PoolDetailsItem,
        ModalDetails
    },
    inject: ["modalState", "updateShowModal"],
    props: {
        details: {
            type: Array,
            default() {
                return []
            }
        },
        status: {
            type: String,
            default() {
                return ''
            },
            required: true
        }
    },
    data() {
        return {
            showNotification: false,
            noticeTimeout: null,
        }
    },
    computed: {
        transactionStore() {
          return useTransactionStore()
        },
        dexStore() {
          return useDexStore()
        },
        getDetailsTitle() {
            switch (this.modalState.mode) {
                case "deposit":
                    return "Deposit liquidity"
                case "withdraw":
                    return "Liquidity withdraw"
                case "claim":
                    return "Remove farm and claim rewards"
                case "create":
                    return "Create and deposit liquidity"
                case "swap":
                    return "Swap"
                case "limit":
                    return "Limit"
                default:
                    return "Deposit liquidity"
            }
        },
        getTitle() {
            switch (this.status) {
                case "pending":
                    return "Transaction processing..."
                case "failed":
                    return "Transaction failed"
                case "success":
                    return "Successfully!"
                default:
                    return "Transaction processing..."
            }
        },
        getDescription() {
            switch (this.status) {
                case "pending":
                    return this.getPendingDescription
                case "failed":
                    return this.getFailedDescription
                case "success": {
                    return this.getSuccessDescription
                }
                default:
                    return "Did you know that coffee is the second most traded commodity in the world? Only oil surpasses it."
            }
        },
        getSuccessDescription() {
            if (this.modalState.mode === 'deposit') {
                return "The liquidity is already in the pool"
            } else if (this.modalState.mode === 'create') {
                return "The pool has been created"
            } else if (this.modalState.mode === 'deploy-smart') {
                return "The smart contract has been deployed"
            } else if (this.modalState.mode === 'limit') {
                return "The order was successfully created"
            } else if (this.modalState.moe === 'cancel') {
                return "The order was successfully cancelled"
            } else {
                return "The tokens are already in your wallet."
            }
        },
        getPendingDescription() {
            if (this.modalState.mode === 'deploy-smart') {
               return "Deploying smart contract"
            } else if (this.modalState.mode === 'limit') {
                return "Limit order in processing..."
            } else if (this.modalState.mode === 'cancel') {
                return "Order cancellation in progress..."
            } else {
                return "Did you know that coffee is the second most traded commodity in the world? Only oil surpasses it."
            }
        },
        getFailedDescription() {
            if (this.modalState.mode === 'swap') {
                return 'Try using higher than normal slippage to ensure your transaction is completed.'
            } else {
                return "An unexpected error has occurred, please try again."
            }
        },
        getLottieById() {
            if (this.status === 'pending') {
                return loadingAnimationData
            } else if (this.status === 'success') {
                return successAnimationData
            } else {
                return failedAnimationData
            }
        },
        getProfitDisplay() {
            let profit = (this.dexStore.GET_DEAL_CONDITIONS?.savings * 100).toFixed(2);
            return profit > 100 ? '>100' : profit;
        },
        getMarketPrice() {
            let receive = this.dexStore.GET_RECEIVE_TOKEN?.price_usd;
            return Number(receive.toFixed(4));
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
        checkIntermediateTokens() {
            let failedArray = [];

            const succeededSteps = this.transactionStore.GET_SWAP_TRANSACTION_STATUS;

            succeededSteps.splits.forEach((split) => {
                split.steps.forEach((step) => {
                    if (step?.status === 'failed' || step?.status === 'timed_out') {
                        failedArray.push(step);
                    }
                });
            });

            return failedArray;
        },
        getDisplayIntermediate() {
            let tokens = []

            this.checkIntermediateTokens.forEach((item, index) => {
                let metadata = item?.input.token.metadata;
                const convertedAmount = item?.input.amount / Math.pow(10, metadata.decimals);
                tokens.push(convertedAmount.toFixed(2) + ' ' + metadata.symbol);
            });

            return tokens.join(', ');
        },
    },
    methods: {
        goBack() {
            this.updateShowModal(null)
        },
        loadLottie() {
            lottie.loadAnimation({
                container: document.getElementById(this.status), // the dom element that will contain the animation
                renderer: 'svg',
                loop: true,
                autoplay: true,
                name: this.status,
                animationData: this.getLottieById,
            });
        },
        async getShareLink() {
            let newDate = new Date();
            let params = {
                in: this.dexStore.GET_SEND_TOKEN?.symbol.replace('₮', 'T'),
                out: this.dexStore.GET_RECEIVE_TOKEN?.symbol.replace('₮', 'T'),
                profit: this.getProfitDisplay,
                market_price: this.getMarketPrice,
                our_price: this.getOurPrice,
                time: Math.floor(newDate / 1000),
                utc: (newDate.getTimezoneOffset() / 60) * -1,
                // ref: this.GET_REFERRAL_INFO?.link,
            };

            tracking.trackEvent(Events.SHARE_BUTTON_CLICK, {
                params: params,
                walletAddress: this.dexStore.GET_DEX_WALLET?.address,
            });

            let url = this.createUrl(params);
            let blob = await this.getImageAsBlob(url);

            if (this.isWindows) {
                await this.copyToClipboard(blob);
            } else {
                await this.shareResult(blob);
            }
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
                const response = await fetch(url);
                return await response.blob();
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
    },
    mounted() {
        setTimeout(() => {
            this.loadLottie()
        }, 10)
    },
    watch: {
        status: {
            handler() {
                setTimeout(() => {
                    this.loadLottie()
                }, 10)
            }
        }
    }
}
</script>

<style scoped>
    .transaction__lottie-wrapper {
        margin-bottom: 14px;
    }

    .transaction__lottie {
        margin: 0 auto;
        width: 174px;
        height: 174px;
    }


    .transaction__title {
        margin-bottom: 6px;
        font-size: 24px;
        line-height: normal;
        font-family: Harmony-Medium, sans-serif;
        font-weight: 500;
        text-align: center;
    }

    .transaction__text {
        font-size: 14px;
        text-align: center;
        opacity: 0.6;
        margin-bottom: 20px;
    }

    .transaction__btn {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        width: 100%;
        height: 44px;
        margin-top: 14px;
        border-radius: 12px;
        border: none;
        outline: none;
        font-size: 16px;
        transition: .2s;
        color: #fff;
    }

    .back-btn {
        background: var(--iface-white8);
        backdrop-filter: blur(20px);
    }

    .back-btn:hover {
        background: var(--iface-white12);
    }

    .share-btn {
        background: var(--iface-accent-color);
    }

    .share-btn:hover {
        background: var(--iface-accent-hover);
    }

    .transaction__intermediate {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 14px;
        border-radius: 12px;
        border: 1px solid var(--iface-white6);
    }

    .intermediate__name {
        font-size: 13px;
        opacity: 0.4;
    }

    .intermediate__result {
        font-size: 13px;
    }

</style>
