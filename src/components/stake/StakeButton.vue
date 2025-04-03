<template>
    <div class="dex__button-mobile">
        <button class="dex__button desktop-btn"
                :disabled="isButtonDisabled || shouldShowLoader"
                @click="handleButtonClick"
        >
            <span v-if="shouldShowLoader" class="btn-loader" />
            <p v-else class="btn-text">{{ buttonText }}</p>
        </button>
    </div>
</template>

<script>

import {mapActions, mapGetters} from "vuex";
import computedMixins from "@/mixins/computedMixins.js";
import { Events } from '@/tracking/events.js';
import { tracking } from '@/tracking';
import { Address } from '@ton/core';
import { stakingService } from '@/api/coffeeApi/services';

export default {
    name: "StakeButton",
    mixins: [computedMixins],
    props: {
        tonConnectUi: {
            type: Object,
            default() {
                return {}
            }
        },
    },
    data() {
        return {
            loadingState: true,
            isDataLoading: true,
        };
    },
    computed: {
        ...mapGetters([
            'GET_DEX_WALLET',
            'GET_STAKE_VALUE',
            'GET_STAKE_MAX',
            'GET_PROOF_VERIFICATION',
            'GET_STAKE_TOKEN',
            'GET_STAKE_PERIOD_ID',
            'GET_STAKE_MASTER',
            'GET_STAKE_NATIVE'
        ]),
        shouldShowLoader() {
            return this.isDataLoading &&
                (this.GET_STAKE_MAX === undefined ||
                    !this.GET_STAKE_TOKEN ||
                    !this.GET_STAKE_NATIVE);
        },
        isWalletConnected() {
            return this.GET_DEX_WALLET !== null;
        },
        hasEnteredAmount() {
            return this.GET_STAKE_VALUE > 0;
        },

        hasMaxStake() {
            return Number(this.GET_STAKE_MAX) > 0;
        },
        isAmountExceedingMax() {
            return this.GET_STAKE_VALUE > this.GET_STAKE_MAX;
        },
        getTokenSymbol() {
            if (this.GET_STAKE_NATIVE) {
                return this.GET_STAKE_NATIVE?.symbol
            }
        },
        buttonText() {
            if (!this.isWalletConnected) {
                return this.$t('stakeBtn.connectWallet');
            } else if (!this.hasMaxStake) {
                return this.$t('stakeBtn.buyCes', { token: this.getTokenSymbol });
            } else if (!this.hasEnteredAmount) {
                return this.$t('stakeBtn.enterAmount');
            } else if (this.isAmountExceedingMax) {
                return this.$t('stakeBtn.noBalance', { token: this.getTokenSymbol });
            } else {
                return this.$t('stakeBtn.stakeAction');
            }
        },

        isButtonDisabled() {
            if (this.buttonText === this.$t('stakeBtn.buyCes', { token: this.getTokenSymbol })) {
                return false;
            }

            if (this.isWalletConnected) {
                return !this.hasEnteredAmount || this.isAmountExceedingMax;
            } else {
                return false;
            }
        }
    },
    methods: {
        ...mapActions([
            'DEX_WALLET',
            'STAKE_TRANSACTION_ID'
        ]),
        checkLoadingComplete() {
            const hasAllData = this.GET_STAKE_MAX !== undefined &&
                this.GET_STAKE_TOKEN &&
                this.GET_STAKE_NATIVE;

            if (hasAllData) {
                setTimeout(() => {
                    this.isDataLoading = false;
                }, 300);
            }
        },
        connectWallet() {
            this.tonConnectUi.openModal();
        },
        handleButtonClick() {
            if (!this.isWalletConnected) {
                this.connectWallet();
            } else if (!this.hasMaxStake) {
                if (this.GET_STAKE_NATIVE.name === 'JetTon') {
                    this.$router.push({
                        name: 'Dex',
                        query: { ft: 'TON', st: this.toSafeAddress(this.GET_STAKE_NATIVE?.address) }
                    });
                } else {
                    this.$router.push({
                        name: 'Dex',
                        query: { ft: 'TON', st: this.GET_STAKE_NATIVE?.symbol }
                    });
                }
            } else if (this.hasEnteredAmount && this.hasMaxStake && !this.isAmountExceedingMax) {
                this.stakeTokens();
            }
        },
        toSafeAddress(rawAddress) {
            try {
                if (rawAddress === 'native') {
                    return 'TON'
                }
                const address = Address.parseRaw(rawAddress);
                return address.toString({ bounceable: true, urlSafe: true });
            } catch (error) {
                console.log(error);
                return null;
            }
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
        async stakeTokens() {
            try {
                const requestBody = {
                    address: this.GET_DEX_WALLET.address,
                    assetAddress: this.GET_STAKE_TOKEN.address,
                    amountToStakeRaw: this.GET_STAKE_VALUE * Math.pow(10, this.GET_STAKE_TOKEN.decimals),
                    periodId: this.GET_STAKE_PERIOD_ID,
                    verification: this.GET_PROOF_VERIFICATION,
                };

                const response = await stakingService.createStakingPosition(requestBody, this.GET_STAKE_MASTER);

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

                if (transaction) {
                    const stakeInfo = {
                        walletAddress: this.GET_DEX_WALLET.address,
                        assetAddress: this.GET_STAKE_TOKEN.address,
                        amount: this.GET_STAKE_VALUE,
                        periodId: this.GET_STAKE_PERIOD_ID,
                        transactionId: response?.data?.query_id,
                    };

                    tracking.trackEvent(Events.STAKE_ACTION_INFO, stakeInfo);

                    this.STAKE_TRANSACTION_ID(response?.data?.query_id);
                }

            } catch (transactionError) {
                console.error("transaction failed");
                this.tonConnectUi.closeModal('action-cancelled');
            }
        }

            } catch (error) {
                console.error(error);
            }
        },
    },
    mounted() {
    },
    watch: {
        GET_STAKE_MAX() {
            this.checkLoadingComplete();
        },
        GET_STAKE_TOKEN() {
            this.checkLoadingComplete();
        },
        GET_STAKE_NATIVE() {
            this.checkLoadingComplete();
        },
        GET_DEX_WALLET() {
            if (!this.GET_DEX_WALLET) {
                this.isDataLoading = false;
            } else {
                this.isDataLoading = true;
                this.checkLoadingComplete();
            }
        }
    }
};
</script>

<style scoped>
.tooltip-enter-active, .tooltip-leave-active {
    transition: .1s ease-out;
}

.tooltip-enter-from, .tooltip-leave-to {
    opacity: 0;
}

.dex__button {
    height: 50px;
    transition: .2s;
    width: 100%;
    border: none;
    outline: none;
    border-radius: 12px;
    background: var(--iface-accent-color);
    padding: 15px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.dex__button:hover {
    background: var(--iface-accent-hover);
}

.dex__button:disabled {
    background: var(--main-btn-disabled);
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

.btn-loader {
    display: block;
    width: 24px;
    height: 24px;
    background: url('@/assets/general/spinner-light.png') no-repeat;
    background-size: cover;
    animation: 1s forwards linear infinite Loader;
}

.theme-light .btn-loader {
    display: block;
    width: 24px;
    height: 24px;
    background: url('@/assets/general/spinner-light.png') no-repeat;
    background-size: cover;
    animation: 1s forwards linear infinite Loader;
    filter: invert(1);
}

@keyframes Loader {
    from {
        transform: rotate(0deg);
    }
    to {
        transform: rotate(360deg);
    }
}

.btn-icon {
    padding-left: 5px;
    min-width: 20px;
    width: 20px;
    height: 20px;
    cursor: help;
}

.wallet-icon {
    margin-right: 5px;
    width: 20px;
    height: 20px;
    background: url("@/assets/dex/wallet-icon.svg") no-repeat;
    transition: background 0.2s ease;
}

.dex__button:hover .wallet-icon {
    background: url("@/assets/dex/wallet-filled.svg") no-repeat;
}

.info-wrapper {
    position: relative;
}

.btn-tooltip {
    z-index: 100;
    position: absolute;
    bottom: 30px;
    left: 50%;
    transform: translateX(-49.5%);
}

@media screen and (max-width: 640px) {
    .dex__button {
        position: relative;
    }

    .info-wrapper {
        position: static;
    }

    .btn-tooltip {
        z-index: 100;
        left: 0;
        bottom: 56px;
        transform: translateX(0);
    }

    .dex__button {
        box-shadow: 0px 2px 10px 0px rgba(0, 0, 0, 0.25);
    }
}

@media screen and (max-width: 576px) {
    .dex__button-mobile {
        padding: 14px 14px 14px 14px;
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        background: linear-gradient(180deg, rgba(16, 16, 16, 0) 0%, rgba(16, 16, 16, 0.3) 10%, #101010 100%);
        z-index: 500;
    }

    .dex__button {
        position: relative;
        background: var(--iface-accent-color);
        opacity: 1;
        z-index: 500;
    }

    .dex__button:disabled {
        background: var(--main-btn-disabled);
        opacity: 1;
        z-index: 500;
    }
}
</style>
