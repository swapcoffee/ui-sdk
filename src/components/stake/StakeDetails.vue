<template>
    <div class="stake__details">
        <h2 class="details__title">{{ $t('stakeDetails.title', { token: getTokenSymbol }) }}</h2>
        <div class="stake-details__first-group">
            <StakeInfoBlock
                iconSrc="1"
                :title="$t('stakeDetails.price', { token: getTokenSymbol })"
                :value="`$${String(cesPrice)}`"
                :isLoading="isLoading"
            />
            <StakeInfoBlock
                iconSrc="2"
                :title="$t('stakeDetails.circulated')"
                :value="tokenSupplyData[getTokenSymbol]?.circulated"
                v-if="tokenSupplyData[getTokenSymbol]?.circulated"
                :isLoading="isLoading"
            />
            <StakeInfoBlock
                iconSrc="3"
                :title="$t('stakeDetails.totalSupply')"
                :value="tokenSupplyData[getTokenSymbol]?.totalSupply"
                v-if="tokenSupplyData[getTokenSymbol]?.totalSupply"
                :isLoading="isLoading"
            />
        </div>
        <h2 class="details__title">{{ $t('stakeDetails.stakingTitle', { token: getTokenSymbol }) }}</h2>
        <div class="stake-details__second-group">
            <StakeInfoBlock
                v-if="isWalletConnected"
                iconSrc="4"
                class="your-points"
                :title="$t('stakeDetails.yourPoints')"
                :value="formatNumbers(getUserPoints)"
                :isLoading="isLoading"
            />
            <StakeInfoBlock
                iconSrc="5"
                :title="$t('stakeDetails.totalPoints')"
                :value="formatNumbers(getTotalPoints)"
                :isLoading="isLoading"
            />
            <StakeInfoBlock
                iconSrc="6"
                :title="$t('stakeDetails.apr')"
                :value="`≈ ${String(getApr)}%`"
                :isLoading="isLoading"
            />
            <StakeInfoBlock
                iconSrc="7"
                :title="$t('stakeDetails.totalStaked', { token: getTokenSymbol })"
                :value="formatNumbers(getTotalStakedCes)"
                :isLoading="isLoading"
            />
        </div>
       <!-- <h2 class="details__title">
           {{ $t("stakeFormDetails.boost") }}
       </h2>
       <StakeBoost
           v-for="reward in boostRewards"
           :key="reward.token_address"
           :reward-token-data="reward"
           v-show="reward.token_address !== 'native'"
       /> -->
        <h2 class="details__title">
            F.A.Q.
        </h2>
        <StakeFaq />
    </div>
</template>

<script>
import {mapActions, mapGetters} from "vuex";
import StakeInfoBlock from "@/components/stake/StakeInfoBlock.vue";
import StakeFaq from "@/components/stake/StakeFaq.vue";
import computedMixins from "@/mixins/computedMixins.js";
import {Address} from "@ton/core";
import StakeBoost from "@/components/stake/StakeBoost.vue";

export default {
    name: "StakeDetails",
    components: {StakeBoost, StakeFaq, StakeInfoBlock},
    mixins: [computedMixins],
    data() {
        return {
            isLoading: true,
            loadedData: {
                globalInfo: false,
                tokenInfo: false,
                userInfo: false
            },
            tokenSupplyData: {
                CES: {
                    circulated: "916k",
                    totalSupply: "10,000,000",
                },
                XROCK: {
                    circulated: "70M",
                    totalSupply: "498.93M",
                },
                JETTON: {
                    circulated: "7.66M",
                    totalSupply: "91.9M",
                },
            },
        };
    },
    computed: {
        ...mapGetters([
            'GET_STAKE_GLOBAL_INFO',
            'GET_TON_TOKENS',
            'GET_STAKE_WALLET_INFO',
            'GET_DEX_WALLET',
            'GET_PROOF_VERIFICATION',
            'GET_STAKE_NATIVE'
        ]),
        boostRewards() {
            return this.GET_STAKE_WALLET_INFO?.paid_rewards || [{ token_address: 'placeholder' }];
        },
        isAllDataLoaded() {
            return this.loadedData.globalInfo &&
                this.loadedData.tokenInfo &&
                (!this.isWalletConnected || this.loadedData.userInfo);
        },
        getTotalStakedCes() {
            if (!this.GET_STAKE_GLOBAL_INFO?.total_locked_native || !this.decimals) {
                return '0';
            }
            const totalLockedCes = this.GET_STAKE_GLOBAL_INFO.total_locked_native;
            return (totalLockedCes / Math.pow(10, this.decimals)).toFixed(0);
        },
        decimals() {
            if (!this.GET_STAKE_GLOBAL_INFO?.locked_tokens?.[0]?.token?.address?.address) {
                return null;
            }
            const token = this.getTokenAddress(this.GET_STAKE_GLOBAL_INFO.locked_tokens[0].token.address.address);
            if (token) {
                this.STAKE_NATIVE_TOKEN(token);
                return token.decimals;
            }
            return null;
        },
        getTokenSymbol() {
            return this.GET_STAKE_NATIVE?.symbol || this.getSymbolFromRoute();
        },
        isWalletConnected() {
            return this.GET_DEX_WALLET && this.GET_PROOF_VERIFICATION;
        },
        getTotalPoints() {
            const totalPoints = this.GET_STAKE_GLOBAL_INFO?.total_points ?? 0;
            if (!this.decimals) {
                return '0.00';
            }
            return (totalPoints / Math.pow(10, this.decimals)).toFixed(2);
        },
        getUserPoints() {
            const userPoints = this.GET_STAKE_WALLET_INFO?.total_points ?? 0;
            if (!this.decimals) {
                return '0.00';
            }
            return (userPoints / Math.pow(10, this.decimals)).toFixed(2);
        },
        getApr() {
            const apr = this.GET_STAKE_GLOBAL_INFO?.apr;
            return apr ? apr.toFixed(2) : '0.00';
        },
        cesPrice() {
            if (!this.GET_STAKE_GLOBAL_INFO?.locked_tokens?.length) {
                return '0.00';
            }
            const token = this.getTokenAddress(this.GET_STAKE_GLOBAL_INFO.locked_tokens[0].token.address.address);
            return (token?.price_usd || 0).toFixed(2);
        }
    },
    methods: {
        ...mapActions(['STAKE_NATIVE_TOKEN']),
        getSymbolFromRoute() {
            const routeName = this.$route.params.name;
            if (!routeName) return null;
            return routeName.split('-').join(' ');
        },
        async checkIfDataLoaded() {
            if (this.isAllDataLoaded) {
                this.isLoading = false;
            }
        },
        handleUserDataChange() {
            if (this.isWalletConnected && this.GET_STAKE_WALLET_INFO) {
                this.loadedData.userInfo = true;
                this.checkIfDataLoaded();
            }
        },
        getTokenAddress(tokenAddress) {
            let searchAddress;

            if (tokenAddress !== 'native') {
                searchAddress = Address.parseFriendly(tokenAddress).address.toRawString();
            } else {
                searchAddress = 'native';
            }

            if (this.GET_TON_TOKENS) {
                return this.GET_TON_TOKENS.find((find) => find.address === searchAddress);
            }
        },
        formatNumbers(value) {
            if (value >= 1000000) {
                return (value / 1000000).toFixed(1) + 'kk';
            } else if (value >= 1000) {
                return (value / 1000).toFixed(1) + 'k';
            }
            return value.toString();
        },
    },
    watch: {
        GET_STAKE_GLOBAL_INFO: {
            immediate: true,
            handler(newValue) {
                if (newValue) {
                    this.loadedData.globalInfo = true;
                    this.checkIfDataLoaded();
                }
            }
        },
        GET_TON_TOKENS: {
            immediate: true,
            handler(newValue) {
                if (newValue?.length > 0) {
                    this.loadedData.tokenInfo = true;
                    this.checkIfDataLoaded();
                }
            }
        },
        GET_STAKE_WALLET_INFO: {
            immediate: true,
            handler() {
                this.handleUserDataChange();
            }
        },
        isWalletConnected: {
            immediate: true,
            handler(newValue) {
                if (!newValue) {
                    this.loadedData.userInfo = true;
                    this.checkIfDataLoaded();
                } else {
                    this.loadedData.userInfo = false;
                    this.isLoading = true;
                }
            }
        }
    },
    mounted() {
        if (this.isAllDataLoaded) {
            this.isLoading = false;
        }
    }
};
</script>

<style scoped>
.stake__details {
    max-width: 720px;
    width: 100%;
    padding: 14px;
    border-radius: 14px;
    border: 1px solid var(--iface-white8) !important;
    font-family: Harmony-Regular, sans-serif;
}

.stake-details__first-group {
    display: flex;
    gap: 10px;
    margin-bottom: 20px;
}

.stake-details__second-group {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-bottom: 20px;
}

.stake-details__first-group .stake__info-block {
    width: calc((100% - 20px) / 3);
}

.stake-details__second-group .stake__info-block {
    width: calc((100% - 10px) / 2);
}

.stake-details__second-group:not(:has(.your-points)) .stake__info-block {
    width: calc((100% - 20px) / 3);
}

.details__title {
    font-family: Harmony-Medium, sans-serif;
    margin-bottom: 10px;
    font-size: 16px;
    font-weight: 500;
    line-height: 20px;
    color: var(--main-text-color);
}

@media screen and (max-width: 1219px) {
    .stake__details {
        min-width: 502px;
    }
}

@media screen and (max-width: 576px) {
    .details__title {
        padding: 8px 0 0 8px;
    }

    .stake-details__first-group,
    .stake-details__second-group {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
    }

    .stake-details__first-group .stake__info-block:first-child {
        width: 100%;
        text-align: center;
    }

    .stake-details__first-group .stake__info-block:first-child :deep(.icon__substrate) {
        margin: 0 auto;
        margin-bottom: 14px;
    }

    .stake-details__first-group .stake__info-block:first-child :deep(.block__name) {
        text-align: center;
    }

    .stake-details__first-group .stake__info-block:first-child :deep(.block__value) {
        justify-content: center;
    }

    .stake-details__first-group .stake__info-block:nth-child(n+2) {
        width: calc(50% - 3px);
    }

    .stake-details__second-group:not(:has(.your-points)) .stake__info-block {
        width: calc(50% - 3px);
    }

    .stake-details__second-group:not(:has(.your-points)) .stake__info-block:first-child {
        width: 100%;
        text-align: center;
    }

    .stake-details__second-group:not(:has(.your-points)) .stake__info-block:first-child :deep(.icon__substrate) {
        margin: 0 auto;
        margin-bottom: 14px;
    }

    .stake-details__second-group:not(:has(.your-points)) .stake__info-block:first-child :deep(.block__name) {
        text-align: center;
    }

    .stake-details__second-group:not(:has(.your-points)) .stake__info-block:first-child :deep(.block__value) {
        justify-content: center;
    }

    .stake-details__second-group:has(.your-points) .stake__info-block {
        width: calc(50% - 3px);
    }

    .stake__details {
        padding: 6px;
        max-width: 100%;
        min-width: 100%;
    }
}

@media screen and (max-width: 443px) {
    .stake__details {
        min-width: 100%;
    }
}
</style>
