<template>
    <template v-if="!actualRewards.length || isLoading">
        <div v-for="i in 2" :key="`skeleton-${i}`" class="stake-boost__wrapper">
            <div class="stake-boost__token">
                <skeleton-item class="skeleton__token-wrapper" />
            </div>
            <div class="stake-boost__progress-wrapper">
                <div class="stake-boost__progress-line" style="width: 0%"></div>
            </div>
            <div class="separation-line"></div>
            <div class="stake-boost__info-wrapper">
                <div class="stake-boost__info-day">
                    <skeleton-item class="skeleton__info-day" />
                </div>
                <div class="stake-boost__info-time">
                    <skeleton-item class="skeleton__info-time" />
                </div>
            </div>
        </div>
    </template>

    <template v-else>
        <div v-for="(reward, index) in actualRewards" :key="index" class="stake-boost__wrapper">
            <div class="stake-boost__token">
                <img class="stake-boost__token-img" :src="getTokenImage(reward)" :alt="getTokenSymbol(reward)">
                <p class="stake-boost__token-collected">
                    {{ formatAmount(getTotalEarnedRewards(reward)) }} {{ getTokenSymbol(reward) }}
                </p>
                <span class="splitter">/</span>
                <p class="stake-boost__token-needed">
                    {{ formatAmount(getTotalPotentialRewards(reward)) }} {{ getTokenSymbol(reward) }}
                </p>
            </div>
            <div class="stake-boost__progress-wrapper">
                <div class="stake-boost__progress-line"
                     :style="{width: `${getProgressPercent(reward)}%`}"
                ></div>
            </div>
            <div class="separation-line"></div>
            <div class="stake-boost__info-wrapper">
                <div class="stake-boost__info-day">
                    <p class="stake-boost__info-day-amount">
                        {{ formatAmount(getDailyRewards(reward)) }} {{ getTokenSymbol(reward) }}
                    </p>
                    <span class="splitter">/</span>
                    <p class="stake-boost__info-day-daytime">
                        day
                    </p>
                </div>
                <div class="stake-boost__info-time">
                    <p class="stake-boost__info-time-period">
                        {{ getTimeRemaining(reward) }}
                    </p>
                </div>
            </div>
        </div>
    </template>
</template>

<script>
import { mapGetters } from 'vuex';
import { tokenService } from "@/api/coffeeApi/services/index.js";

export default {
    name: "StakeBoost",
    data() {
        return {
            tokensInfo: {},
            isLoading: true,
            addressMapping: {
                'native': '0:0000000000000000000000000000000000000000000000000000000000000000',
                'EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs': '0:b113a994b5024a16719f69139328eb759596c38a25f59028b146fecdc3621dfe',
                'EQAVfEY2iKSpEkUhgFLFWAgHeSz2NH2XV-MvDuiKF5plSbsU': '0:157c463688a4a91245218052c5580807792cf6347d9757e32f0ee88a179a6549',
                'EQAQXlWJvGbbFfE8F3oS8s87lIgdovS455IsWFaRdmJetTon': '0:105e5589bc66db15f13c177a12f2cf3b94881da2f4b8e7922c58569176625eb5'
            }
        };
    },

    computed: {
        ...mapGetters(['GET_STAKE_GLOBAL_INFO']),
        actualRewards() {
            console.log(this.GET_STAKE_GLOBAL_INFO)
            return this.GET_STAKE_GLOBAL_INFO?.actual_rewards || [];
        },
    },
    methods: {
        async loadTokensInfo() {
            if (!this.actualRewards.length) return;

            this.isLoading = true;
            try {
                const tokenAddresses = this.actualRewards.map(reward =>
                    this.addressMapping[reward.token_address] || reward.token_address
                );

                const tokens = await tokenService.getTokensByAddress(tokenAddresses);

                const reverseMapping = Object.entries(this.addressMapping).reduce((acc, [original, converted]) => {
                    acc[converted] = original;
                    return acc;
                }, {});

                this.tokensInfo = tokens.reduce((acc, token) => {
                    const originalAddress = reverseMapping[token.address] || token.address;
                    acc[originalAddress] = {
                        symbol: token.symbol,
                        image: token.image,
                        decimals: token.decimals
                    };
                    return acc;
                }, {});

            } catch (error) {
                console.error(error);
                this.actualRewards.forEach(reward => {
                    this.tokensInfo[reward.token_address] = {
                        symbol: reward.token_address === 'native' ? 'TON' : '',
                        image: '',
                        decimals: 9
                    };
                });
            } finally {
                this.isLoading = false;
            }
        },
        getTokenSymbol(reward) {
            return this.tokensInfo[reward.token_address]?.symbol ||
                (reward.token_address === 'native' ? 'TON' : '');
        },
        getTokenImage(reward) {
            return this.tokensInfo[reward.token_address]?.image || '';
        },
        getTotalEarnedRewards(reward) {
            const distributed = this.GET_STAKE_GLOBAL_INFO?.distributed_rewards?.find(
                r => r.token_address === reward.token_address
            );
            if (!distributed) return 0;

            const decimals = this.tokensInfo[reward.token_address]?.decimals || 9;
            return distributed.asset_raw / Math.pow(10, decimals);
        },
        getTotalPotentialRewards(reward) {
            const distributed = this.GET_STAKE_GLOBAL_INFO?.distributed_rewards?.find(
                r => r.token_address === reward.token_address
            )?.asset_raw || 0;

            const now = Math.floor(Date.now() / 1000);
            const remainingSeconds = Math.max(0, reward.end_distribution_unix - now);

            const remaining = BigInt(Math.floor(reward.reward_rate * remainingSeconds));

            const decimals = this.tokensInfo[reward.token_address]?.decimals || 9;

            const totalRaw = BigInt(distributed) + remaining;

            return Number(totalRaw) / Math.pow(10, decimals);
        },
        getProgressPercent(reward) {
            const earned = this.getTotalEarnedRewards(reward);
            const total = this.getTotalPotentialRewards(reward);

            if (total <= 0) return 0;

            const progress = Number(((earned / total) * 100).toFixed(2));

            return Math.min(100, Math.max(0, progress));
        },
        getDailyRewards(reward) {
            const decimals = this.tokensInfo[reward.token_address]?.decimals || 9;
            return (reward.reward_rate * 86400) / Math.pow(10, decimals);
        },
        getTimeRemaining(reward) {
            const now = Math.floor(Date.now() / 1000);
            const timeLeft = reward.end_distribution_unix - now;

            if (timeLeft <= 0) return 'Ended';

            const days = Math.floor(timeLeft / 86400);
            const hours = Math.floor((timeLeft % 86400) / 3600);

            return `Ends in ${days} days ${hours} hours`;
        },
        formatAmount(value) {
            if (!value || value === 0) return '0.00';

            return new Intl.NumberFormat('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }).format(value);
        },
    },
    watch: {
        GET_STAKE_GLOBAL_INFO: {
            immediate: true,
            async handler(newVal) {
                if (newVal?.actual_rewards?.length) {
                    await this.loadTokensInfo();
                }
            }
        }
    }
};
</script>

<style scoped>
.stake-boost__wrapper {
    width: 100%;
    height: 111px;
    border-radius: 12px;
    background-color: var(--iface-white4);
    padding: 14px;
    margin-bottom: 20px;
}

.stake-boost__token {
    display: flex;
    align-items: center;
    margin-bottom: 8px;
}

.stake-boost__token-img {
    width: 18px;
    height: 18px;
    border-radius: 100px;
    margin-right: 8px;
}

.stake-boost__token-collected {
    font-weight: 400;
    font-size: 14px;
    line-height: 18px;
    color: var(--main-text-color);
    margin-right: 3px;
}

.splitter {
    font-weight: 400;
    font-size: 14px;
    line-height: 18px;
    color: var(--main-text-color);
    margin: 0 4px;
    opacity: 0.4;
}

.stake-boost__token-needed {
    font-weight: 400;
    font-size: 14px;
    line-height: 18px;
    color: var(--main-text-color);
    opacity: 0.4;
    margin-right: 3px;
}

.stake-boost__progress-wrapper {
    width: 100%;
    height: 10px;
    padding: 2px;
    border-radius: 100px;
    background: var(--iface-white6);
    overflow: hidden;
}

.stake-boost__progress-line {
    height: 100%;
    width: 0;
    border-radius: 100px;
    background: var(--iface-accent-color);
}

.separation-line {
    margin: 14px 0;
    display: block;
    height: 1px;
    background: var(--iface-white6);
}

.stake-boost__info-wrapper {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.stake-boost__info-day {
    display: flex;
    align-items: center;
}

.stake-boost__info-day-amount {
    font-weight: 400;
    font-size: 14px;
    line-height: 17px;
    color: var(--iface-accent-color);
}

.stake-boost__info-day-daytime {
    font-weight: 400;
    font-size: 14px;
    line-height: 17px;
    color: var(--main-text-color);
    opacity: 0.4;
}

.stake-boost__info-time-period {
    font-family: Harmony-Regular, sans-serif;
    font-weight: 400;
    font-size: 14px;
    line-height: 17px;
    color: var(--main-text-color);
    opacity: 0.4;
}

.skeleton__token-wrapper {
    height: 19px;
    width: 230px;
}

.skeleton__info-day {
    height: 17px;
    width: 140px;
}

.skeleton__info-time {
    height: 17px;
    width: 120px;
}
</style>
