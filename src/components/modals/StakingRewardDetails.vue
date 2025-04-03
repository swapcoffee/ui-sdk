<template>
    <modal-wrapper
        class="modal"
        :title="getTitle"
        :freeHeight="true"
        @closeModal="$emit('closeRewards')"
    >
        <div class="wallet-settings__wrapper">
            <div class="duration-text__wrapper">
                <div class="duration__selector">
                    <div class="selector__value">
                        {{ $t("stakeRewards.profit") }}
                    </div>
                    <div class="selector__timeframe">${{ getEarnedRewards(stake) }}</div>
                </div>
                <div class="tokens-popup__icon-info">
                    <p class="info-text">$ {{ $t("dexTokens.info[0]") }}</p>
                    <div class="info-dividing"></div>
                    <svg class="info-icon" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path opacity="0.8" fill-rule="evenodd" clip-rule="evenodd" d="M3.24981 3.61111C3.11222 3.61111 3.02649 3.76615 3.09582 3.8896L6.46518 9.88944V3.61111H3.24981ZM7.53483 3.61111V9.88944L10.9042 3.8896C10.9735 3.76615 10.8878 3.61111 10.7502 3.61111H7.53483ZM2.17188 4.44946C1.68657 3.58528 2.28666 2.5 3.24981 2.5H10.7502C11.7133 2.5 12.3134 3.58528 11.8281 4.44946L7.46197 12.2244C7.36613 12.3951 7.19023 12.5 7 12.5C6.80978 12.5 6.63388 12.3951 6.53803 12.2244L2.17188 4.44946Z" fill="white"/>
                    </svg>
                    <p class="info-text">{{ $t("dexTokens.info[1]") }}</p>
                    <div class="info-dividing"></div>
                    <svg class="info-icon" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <g opacity="0.8">
                            <path d="M12.6286 11.5938C11.7957 10.1538 10.5121 9.12134 9.01426 8.63188C9.75518 8.19081 10.3308 7.51871 10.6528 6.7188C10.9748 5.9189 11.0253 5.03541 10.7966 4.20403C10.5678 3.37265 10.0725 2.63933 9.38667 2.1167C8.70083 1.59407 7.86239 1.31102 7.00012 1.31102C6.13784 1.31102 5.29941 1.59407 4.61357 2.1167C3.92773 2.63933 3.43241 3.37265 3.20368 4.20403C2.97495 5.03541 3.02545 5.9189 3.34742 6.7188C3.6694 7.51871 4.24505 8.19081 4.98598 8.63188C3.48809 9.12079 2.20457 10.1533 1.37168 11.5938C1.34114 11.6436 1.32088 11.699 1.3121 11.7567C1.30332 11.8145 1.3062 11.8734 1.32056 11.9301C1.33493 11.9867 1.36049 12.0399 1.39574 12.0865C1.43099 12.133 1.47521 12.1721 1.5258 12.2013C1.57639 12.2305 1.63232 12.2493 1.69029 12.2566C1.74826 12.2639 1.8071 12.2594 1.86333 12.2436C1.91956 12.2277 1.97205 12.2008 2.0177 12.1643C2.06334 12.1278 2.10122 12.0826 2.1291 12.0313C3.15941 10.2506 4.98051 9.18751 7.00012 9.18751C9.01973 9.18751 10.8408 10.2506 11.8711 12.0313C11.899 12.0826 11.9369 12.1278 11.9825 12.1643C12.0282 12.2008 12.0807 12.2277 12.1369 12.2436C12.1931 12.2594 12.252 12.2639 12.3099 12.2566C12.3679 12.2493 12.4238 12.2305 12.4744 12.2013C12.525 12.1721 12.5692 12.133 12.6045 12.0865C12.6397 12.0399 12.6653 11.9867 12.6797 11.9301C12.694 11.8734 12.6969 11.8145 12.6881 11.7567C12.6794 11.699 12.6591 11.6436 12.6286 11.5938ZM3.93762 5.25001C3.93762 4.6443 4.11723 4.0522 4.45374 3.54857C4.79025 3.04495 5.26855 2.65242 5.82815 2.42063C6.38775 2.18883 7.00351 2.12819 7.59758 2.24635C8.19165 2.36452 8.73733 2.65619 9.16563 3.08449C9.59393 3.51279 9.8856 4.05848 10.0038 4.65254C10.1219 5.24661 10.0613 5.86238 9.8295 6.42198C9.5977 6.98158 9.20518 7.45987 8.70155 7.79638C8.19793 8.1329 7.60582 8.31251 7.00012 8.31251C6.18816 8.31164 5.4097 7.98871 4.83556 7.41456C4.26142 6.84042 3.93849 6.06197 3.93762 5.25001Z" fill="white"/>
                        </g>
                    </svg>
                    <p class="info-text">{{ $t("dexTokens.info[2]") }}</p>
                </div>
            </div>
            <div class="wallet-settings__main">
                <TokenItem
                    v-for="reward in mappedItems"
                    :key="reward.token_address"
                    :item="reward"
                    :isStakingRewards="true"
                    :tonPrice="getTonPrice"
                />
            </div>
        </div>
    </modal-wrapper>
</template>

<script>
import { mapGetters } from "vuex";
import TokenItem from "@/components/dex/tokens-popup/TokenItem.vue";
import {Address} from "@ton/core";
import ModalWrapper from "@/components/ui/ModalWrapper.vue";

export default {
    name: "StakingRewardDetails",
    components: {ModalWrapper, TokenItem},
    props: {
        stake: {
            type: Object,
            required: true,
        }
    },
    data() {
        return {
            mappedItems: []
        };
    },
    computed: {
        ...mapGetters(['GET_TON_TOKENS']),
        getTonPrice() {
            return (this.GET_TON_TOKENS.find((item) => item.address === 'native')).price_usd
        },
        getTitle() {
            return this.$t("stakeRewards.title")
        }
    },
    methods: {
        getEarnedRewards() {
            if (Array.isArray(this.stake?.earned_rewards)) {
                return this.stake.earned_rewards.reduce((total, reward) => {
                    return total + (reward.asset_usd || 0);
                }, 0).toFixed(6);
            }

            return '0.000000';
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
        mapEarnedRewards() {
            this.mappedItems = this.stake.earned_rewards.map(reward => {
                const tokenInfo = this.getTokenAddress(reward.token_address);
                return {
                    ...reward,
                    ...tokenInfo
                };
            });
        }
    },
    mounted() {
        this.mapEarnedRewards();
    }
};
</script>


<style scoped>
.wallet-settings__main {
    margin-top: 6px;
    display: flex;
    flex-direction: column;
    gap: 6px;
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

.theme-light svg path {
    fill: #141414;
}

.duration-text__wrapper {
    color: var(--main-text-color);
}

.duration__selector {
    display: flex;
    height: 46px;
    padding: 6px 12px;
    justify-content: space-between;
    align-items: center;
    align-self: stretch;
    border-radius: 12px;
    background: var(--iface-white4);
}

.selector__value {
    font-family: Harmony-Regular, sans-serif;
    color: var(--main-text-color);
    font-size: 13px;
    font-style: normal;
    font-weight: 400;
    line-height: normal;
    opacity: 0.5;
}

.selector__timeframe {
    font-family: Harmony-Regular, sans-serif;
    color: var(--main-text-color);
    font-size: 13px;
    font-style: normal;
    font-weight: 400;
    line-height: normal;
}

.tokens-popup__icon-info {
    margin-top: 18px;
    display: flex;
    align-items: center;
    gap: 0 4px;
}

.info-text {
    font-size: 13px;
    line-height: 16px;
    opacity: 0.4;
}

.tokens-popup__icon-info svg {
    opacity: 0.5;
}

.info-dividing {
    height: 10px;
    width: 1px;
    background: var(--main-text-color);
    opacity: 0.15;
    margin: 0 2px;
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
