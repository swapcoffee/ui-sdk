<template>
    <div class="history">
        <div v-if="GET_CLAIM_HISTORY?.total_count === 0 && !showLoader" class="history__empty">
            <p class="history__empty-text">
                {{ $t('claimHistory.empty') }}
            </p>
        </div>
        <div v-else class="history__content">
            <div class="history__table-wrapper">
                <div class="history__table table">
                    <ul v-if="!showLoader" class="table__title-list">
                        <li class="table__title-item">
                            <p class="table__title-text">
                                {{ $t('referralHistory.tableTitles[0]') }}
                            </p>
                        </li>
                        <li class="table__title-item cursor-pointer" @click="toggleCategory('time')">
                            <p class="table__title-text">
                                {{ $t('referralHistory.tableTitles[1]') }}
                            </p>
                            <FilterActive
                                :isUp="isDown('time')"
                                :isDown="isUp('time')"
                            />
                        </li>
                        <li class="table__title-item">
                            <p class="table__title-text">
                                {{ $t('referralHistory.tableTitles[2]') }}
                            </p>
                        </li>
                    </ul>
                    <div v-if="showLoader" class="skeleton-wrapper">
                        <div v-for="item in 10" :key="item" class="skeleton-large table-skeleton"/>
                    </div>
                    <ul v-else class="table__list" :class="['table__list', { loading: loadingPage }]">
                        <li v-for="(claim, index) in getFilteredHistory" :key="index" class="table__item">
                            <div class="table__group">
                                <p class="table__amount">
                                    {{ getClaimToken(claim) }}
                                </p>
                                <a
                                    :href="`https://tonviewer.com/transaction/${claim.transaction_hash}`"
                                    target="_blank"
                                    class="table__link"
                                >
                                    <svg
                                        class="table__icon"
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="16"
                                        height="16"
                                        viewBox="0 0 16 16"
                                        fill="none"
                                    >
                                        -->
                                        <path
                                            d="M13.3333 7.33333C13.1565 7.33333 12.987 7.40357 12.8619 7.5286C12.7369 7.65362 12.6667 7.82319 12.6667 8V12C12.6667 12.1768 12.5964 12.3464 12.4714 12.4714C12.3464 12.5964 12.1768 12.6667 12 12.6667H4C3.82319 12.6667 3.65362 12.5964 3.5286 12.4714C3.40357 12.3464 3.33333 12.1768 3.33333 12V4C3.33333 3.82319 3.40357 3.65362 3.5286 3.5286C3.65362 3.40357 3.82319 3.33333 4 3.33333H8C8.17681 3.33333 8.34638 3.2631 8.4714 3.13807C8.59643 3.01305 8.66667 2.84348 8.66667 2.66667C8.66667 2.48986 8.59643 2.32029 8.4714 2.19526C8.34638 2.07024 8.17681 2 8 2H4C3.46957 2 2.96086 2.21071 2.58579 2.58579C2.21071 2.96086 2 3.46957 2 4V12C2 12.5304 2.21071 13.0391 2.58579 13.4142C2.96086 13.7893 3.46957 14 4 14H12C12.5304 14 13.0391 13.7893 13.4142 13.4142C13.7893 13.0391 14 12.5304 14 12V8C14 7.82319 13.9298 7.65362 13.8047 7.5286C13.6797 7.40357 13.5101 7.33333 13.3333 7.33333Z"
                                            fill="white"
                                        />
                                        <path
                                            d="M10.6668 3.33333H11.7201L7.52679 7.52C7.4643 7.58198 7.41471 7.65571 7.38086 7.73695C7.34702 7.81819 7.32959 7.90533 7.32959 7.99333C7.32959 8.08134 7.34702 8.16848 7.38086 8.24972C7.41471 8.33096 7.4643 8.40469 7.52679 8.46667C7.58876 8.52915 7.6625 8.57875 7.74374 8.61259C7.82498 8.64644 7.91211 8.66387 8.00012 8.66387C8.08813 8.66387 8.17527 8.64644 8.25651 8.61259C8.33775 8.57875 8.41148 8.52915 8.47346 8.46667L12.6668 4.28V5.33333C12.6668 5.51014 12.737 5.67971 12.8621 5.80474C12.9871 5.92976 13.1566 6 13.3335 6C13.5103 6 13.6798 5.92976 13.8049 5.80474C13.9299 5.67971 14.0001 5.51014 14.0001 5.33333V2.66667C14.0001 2.48986 13.9299 2.32029 13.8049 2.19526C13.6798 2.07024 13.5103 2 13.3335 2H10.6668C10.49 2 10.3204 2.07024 10.1954 2.19526C10.0704 2.32029 10.0001 2.48986 10.0001 2.66667C10.0001 2.84348 10.0704 3.01305 10.1954 3.13807C10.3204 3.2631 10.49 3.33333 10.6668 3.33333Z"
                                            fill="white"
                                        />
                                    </svg>
                                </a>
                            </div>
                            <p class="table__value">
                                {{ getClaimDate(claim) }}
                            </p>
                            <div class="table__status-block">
                                <p class="table__status" :class="getClaimStatus(claim)">
                                    {{ getClaimStatus(claim) }}
                                </p>
                            </div>
                        </li>
                    </ul>
                </div>
            </div>
            <Pagination
                v-if="!showLoader"
                :display-count="displayCount"
                :items-total="GET_CLAIM_HISTORY?.total_count"
                :current-length="getDisplayHistory.length"
                :current-page="currentPage"
                @pagination-action="paginationAction"
            />
            <!--			<AppPagination-->
            <!--				:displayCount="displayCount"-->
            <!--				:itemsTotal="GET_CLAIM_HISTORY?.total_count"-->
            <!--				:currentLength="getDisplayHistory.length"-->
            <!--				:currentPage="currentPage"-->
            <!--				@paginationAction="paginationAction"-->
            <!--			/>-->
        </div>
    </div>
</template>

<script>
import {mapActions, mapGetters} from 'vuex';
import AppPagination from '@/components/AppPagination.vue';
import Pagination from '@/components/AppPagination.vue';
import computedMixins from '@/mixins/computedMixins';
import {Address} from '@ton/core';
import {claimService, tokenService} from '@/api/coffeeApi/services';

import FilterActive from '@/assets/claim/icons/FilterActive.vue';
import Filter from '@/assets/claim/icons/Filter.vue';

export default {
    name: 'MyClaimHistory',
    components: {
        AppPagination,
        Pagination,
        FilterActive,
        Filter
    },
    mixins: [computedMixins],
    data() {
        return {
            showLoader: true,
            displayCount: 10,
            currentPage: 1,
            httpLimit: 10,
            activeCategory: null,
            loadingPage: false,
        };
    },
    computed: {
        ...mapGetters([
            'GET_DEX_WALLET',
            'GET_CLAIM_HISTORY_TOKEN_DETAILS',
            'GET_TON_TOKENS',
            'GET_CLAIM_HISTORY',
            'GET_PROOF_VERIFICATION',
        ]),
        getDisplayHistory() {
            return this.GET_CLAIM_HISTORY?.items?.sort((a, b) => b.unix_time - a.unix_time);
        },
        getFilteredHistory() {
            if (!this.activeCategory) {
                return [...this.GET_CLAIM_HISTORY?.items];
            }

            return [...this.GET_CLAIM_HISTORY?.items].sort((a, b) => {
                if (this.activeCategory.category === 'time') {
                    return this.activeCategory.direction === 'asc' ? a.unix_time - b.unix_time : b.unix_time - a.unix_time;
                }
                return 0;
            });
        },
        isUp() {
            return (category) => this.activeCategory?.category === category && this.activeCategory.direction === 'asc';
        },
        isDown() {
            return (category) => this.activeCategory?.category === category && this.activeCategory.direction === 'desc';
        }
    },
    methods: {
        ...mapActions(['CLAIM_HISTORY', 'CLAIM_HISTORY_TOKEN_DETAILS']),
        getPricePrecision(value) {
            if (value === 0) return 10;

            if (value >= 0.99 && value <= 1.01) return 2;

            const absValue = Math.abs(value);

            if (absValue >= 1) return 2;
            if (absValue >= 0.1) return 3;
            if (absValue >= 0.01) return 4;
            if (absValue >= 0.0001) return 6;
            if (absValue >= 0.000001) return 10;

            return 15;
        },

        getClaimToken(value) {
            let find;
            if (value.token_address === 'native') {
                find = this.GET_CLAIM_HISTORY_TOKEN_DETAILS.find(
                    (item) => item?.address === "0:0000000000000000000000000000000000000000000000000000000000000000"
                );
            } else {
                const address = Address.parseFriendly(value.token_address).address.toRawString();
                find = this.GET_CLAIM_HISTORY_TOKEN_DETAILS.find(
                    (item) => item?.address === address
                );
            }
            if (find) {
                return `${this.getAmount(value, find)} ${find?.symbol}`;
            }
            return null;
        },
        getAmount(value, find) {
            return (value?.amount / Math.pow(10, find?.decimals));
        },
        getClaimDate(value) {
            let date = new Date(value.unix_time * 1000);
            return `${date.toLocaleTimeString()}, ${date.toLocaleDateString()}`;
        },
        getClaimStatus(value) {
            if (value.withdrawal.status === 'unhandled') {
                return 'pending';
            } else if (value.withdrawal.status === 'processing') {
                return 'pending';
            } else if (value.withdrawal.status === 'processed') {
                return 'success';
            }
        },
        async paginationAction(page) {
            if (page === this.currentPage) return;

            this.loadingPage = true;

            this.currentPage = page;
            await this.getClaimHistory();

            setTimeout(() => {
                this.loadingPage = false;
            }, 200);
        },
        async getClaimHistory() {
            if (this.GET_DEX_WALLET?.address && this.GET_PROOF_VERIFICATION) {
                try {
                    let opts = {
                        page: this.currentPage,
                        size: this.displayCount,
                    };
                    let res = await claimService.getClaimHistory(
                        this.GET_DEX_WALLET.address,
                        'all',
                        this.GET_PROOF_VERIFICATION,
                        opts,
                    );
                    await this.CLAIM_HISTORY(res?.data);

                    const tokenAddresses = [...new Set(res?.data?.items?.map(item =>
                        item.token_address === "native"
                            ? "0:0000000000000000000000000000000000000000000000000000000000000000"
                            : item.token_address
                    ))].filter(Boolean);

                    if (tokenAddresses.length > 0) {
                        const tokenDetails = await tokenService.getTokensByAddress(tokenAddresses);
                        await this.CLAIM_HISTORY_TOKEN_DETAILS(tokenDetails);
                    }

                    setTimeout(() => {
                        this.showLoader = false;
                    }, 200);
                } catch (err) {
                    console.error(err);
                    this.showLoader = false;
                }
            }
        },
        toggleCategory(category) {
            if (!this.activeCategory || this.activeCategory.category !== category) {
            this.activeCategory = { category, direction: 'desc' };
            } else {
            this.activeCategory.direction = this.activeCategory.direction === 'asc' ? 'desc' : 'asc';
            }
        },
    },
    watch: {
        GET_CLAIM_HISTORY: {
            handler(value) {
                if (value) {
                    this.showLoader = false;
                }
            },
            immediate: true,
            deep: true
        }
    }
};
</script>

<style scoped>
.history {
    overflow: hidden;
}

.history__empty-text {
    margin-bottom: 10px;
    text-align: center;
    font-size: 14px;
    font-weight: 500;
    line-height: 16px;
}

.history__table-wrapper {
    margin-bottom: 16px;
}

.table__title-list {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0 14px;
    padding: 0 14px 10px 14px;
    position: relative;
}

.table__title-list::after {
    content: '';
    position: absolute;
    left: 0;
    width: 100%;
    bottom: 0;
    height: 1px;
    background: var(--iface-white6);
}

.table__title-item {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    width: 100%;
    min-width: 120px;
}

.table__title-text {
    font-size: 13px;
    opacity: 0.4;
}

.cursor-pointer {
    cursor: pointer;
    transition: all 0.3s ease 0s;
}

.cursor-pointer:hover {
    opacity: 0.7;
}

.table__title-item:first-child {
    justify-content: start;
}

.table__title-item:last-child {
    min-width: max-content;
    justify-content: flex-end;
    text-align: end;
}

.table__title-item:not(:first-child):not(:last-child) {
    text-align: center;
}

.cursor-pointer {
    cursor: pointer;
}

.table__list {
    border-radius: 12px;
}

.table__item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0 14px;
    position: relative;
    padding: 16px 14px;
}

.table__item:not(:last-child):after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 1px;
    background: var(--iface-white6);
}

.table__group {
    width: 100%;
    min-width: 120px;
    display: flex;
    align-items: center;
}

.table__status-block {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: flex-end;
}

.table__token-img {
    width: 17px;
    height: 17px;
}

.table__address {
    font-size: 14px;
    line-height: 16px;
    opacity: 0.6;
}

.table__amount {
    font-size: 14px;
    font-weight: 400;
    color: var(--main-text-color);
}

.table__link {
    transition: 0.2s;
    display: block;
    margin-left: 4px;
    opacity: 0.6;
    width: 16px;
    height: 16px;
}

.table__link:hover {
    opacity: 1;
}

.table__value {
    opacity: 0.6;
    font-size: 14px;
    line-height: 16px;
}

.table__group,
.table__status-block,
.table__value {
    width: 100%;
    min-width: max-content;
}

.table__value:not(:last-child) {
    text-align: center;
}

.table__value:last-child {
    text-align: end;
}

.pending,
.success,
.failed {
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    text-transform: capitalize;
    font-size: 14px;
    font-weight: 400;
}

.pending {
    color: var(--main-text-color);
}

.success {
    color: var(--main-green);
}

.failed {
    color: var(--main-red);
}

.table__list.loading {
    opacity: 0.5;
    pointer-events: none;
    transition: opacity 0.3s ease-in-out;
}

.skeleton-wrapper {
    gap: 1px;
    display: flex;
    flex-direction: column;
    margin-bottom: 3px;
}

.table-skeleton {
    width: 100%;
    height: 45px;
    position: relative;
}

.table-skeleton:not(:last-child) {
    border-bottom: 1px solid var(--iface-white6);
}

@media screen and (max-width: 880px) {
    .history__table-wrapper {
        overflow-x: auto;
    }
}

@media screen and (max-width: 576px) {
    .history__table {
        width: 150%;
    }
}
</style>
