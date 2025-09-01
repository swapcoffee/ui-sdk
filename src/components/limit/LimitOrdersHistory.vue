<template>
    <div class="history">
        <div class="history__menu menu">
            <skeleton-item
                v-if="!historyLoaded"
                class="skeleton-tab"
            ></skeleton-item>
            <div class="menu__tabs"
                v-else
            >
                <tab-item
                    v-for="(tab, index) in tabs"
                    :key="index"
                    :disabled="tabsIsDisable"
                    :class="[{active_tab: tab.value === this.currentTab}, 'tab']"
                    @click="tab.action(tab.value)"
                >
                    {{ tab.text }}
                </tab-item>
            </div>
            <div class="menu__actions">
                <button class="menu__btn refresh-btn"
                        :disabled="actionsIsDisable"
                        @click="checkOrderHistory"
                >
                    <RefreshIcon
                        :refreshInfo="refreshInfo"
                    />
                </button>
<!--                <button class="menu__btn cancel-btn"-->
<!--                        :disabled="actionsIsDisable"-->
<!--                        @click="updateHistoryList"-->
<!--                >-->
<!--                    <CancelIcon />-->
<!--                    Cancel all-->
<!--                </button>-->
            </div>
        </div>
        <skeleton-item
            v-if="!historyLoaded"
            class="skeleton-card"
        >

        </skeleton-item>
        <ul class="history__list"
            v-else-if="getOpenOrdersList.length > 0 && currentTab === 'open'"
        >
            <LimitHistoryItem
                v-for="(item, index) in getOpenOrdersList"
                :key="index"
                :item="item"
            />
        </ul>
        <ul class="history__list"
            v-else-if="getHistoryOrdersList.length > 0 && currentTab === 'history'"
        >
            <LimitHistoryItem
                v-for="(item, index) in getHistoryOrdersList"
                :key="index"
                :item="item"
            />
        </ul>
        <p class="history__empty-list"
           v-else
        >
            {{ getEmptyText }}
        </p>
    </div>
</template>

<script lang="ts">
import {strategiesService} from "@/api/coffeeApi/services";

import computedMixins from "@/mixins/computedMixins.ts"

import {useDexStore} from "@/stores/dex";
import {useLimitStore} from "@/stores/limit";

import RefreshIcon from "@/assets/earn/swap-interface/RefreshIcon.vue";
import CancelIcon from "@/assets/limit/CancelIcon.vue";
import LimitHistoryItem from "@/components/limit/LimitHistoryItem.vue";
import SkeletonItem from "@/components/ui/SkeletonItem.vue";
import TransactionStatusModal from "@/components/modals/TransactionStatusModal.vue";
import TabItem from "@/components/ui/TabItem.vue";
import {SwapActiveTab} from "@/utils/types.ts";

export default {
    name: "LimitOrdersHistory",
    components: {
        TransactionStatusModal,
        SkeletonItem,
        LimitHistoryItem,
        CancelIcon,
        RefreshIcon,
        TabItem
    },
    mixins: [computedMixins],
    props: {
        tonConnectUi: {
            type: Object,
            default() {
                return {};
            },
        },
    },
    data() {
        return {
            historyLoaded: false,
            firstLoading: false,
            refreshInfo: false,
            currentTab: 'open',
        }
    },
    computed: {
        dexStore() {
          return useDexStore()
        },
         limitStore() {
          return useLimitStore()
         },
        tabsIsDisable() {
            return !this.dexStore.GET_DEX_WALLET
        },
        tabs() {
          return [
            {
              value: "open",
              text: this.$t('limitOrdersHistory.tabs[0]'),
              action: this.updateCurrentTab
            },
            {
              value: "history",
              text: this.$t('limitOrdersHistory.tabs[1]', {
                historyType: this.dexStore.GET_SWAP_ACTIVE_TAB === SwapActiveTab.DCA
                    ? this.$t('limitOrdersHistory.tabDca')
                    : this.$t('limitOrdersHistory.tabLimit')
              }),
              action: this.updateCurrentTab
            }
          ]
        },
        actionsIsDisable() {
            return !this.dexStore.GET_DEX_WALLET || this.refreshInfo
        },
        getEmptyText() {
            if (this.dexStore.GET_DEX_WALLET) {
                return this.$t('limitOrdersHistory.emptyList')
            } else {
                return this.$t('limitOrdersHistory.connectWallet')
            }
        },
        getOpenOrdersList() {
            return this.limitStore.GET_LIMIT_HISTORY
                .filter((item) => item?.status === 'active')
        },
        getHistoryOrdersList() {
            return this.limitStore.GET_LIMIT_HISTORY
                .filter((item) => item?.status !== 'active')
        }
    },
    methods: {
        updateCurrentTab(value) {
            this.currentTab = value
        },
        async checkOrderHistory() {
            try {
                this.firstLoading = true
                this.refreshInfo = true
                let res = await strategiesService.getOrders(
                    this.dexStore.GET_DEX_WALLET?.address,
                    this.dexStore.GET_PROOF_VERIFICATION,
                    this.dexStore.GET_SWAP_ACTIVE_TAB.toLowerCase(),
                    true
                )

                this.limitStore.LIMIT_HISTORY(res?.data)
                this.historyLoaded = true
            } catch(err) {
                console.error(err)
            } finally {

                setTimeout(() => {
                    this.refreshInfo = false
                }, 10_000)
                setTimeout(() => {
                    this.firstLoading = false
                }, 1_000)
            }
        },
        // async cancelOrder(id) {
        //     try {
        //         let res = await strategiesService.cancelOrderById(this.dexStore.GET_DEX_WALLET?.address, this.dexStore.GET_PROOF_VERIFICATION, id)
        //         await this.tonConnectUi.sendTransaction({
        //             validUntil: Math.floor(Date.now() / 1000) + 300,
        //             messages: [
        //                 {
        //                     address: res?.data?.address,
        //                     amount: res?.data?.value,
        //                     payload: res?.data?.payload_cell,
        //                 }
        //             ]
        //         })
        //         setTimeout(() => {
        //             this.checkOrderHistory()
        //         }, 10_000)
        //     } catch(err) {
        //         console.error(err)
        //     }
        // },
    },
    mounted() {
        if (this.dexStore.GET_DEX_WALLET && this.limitStore.GET_STRATEGIES_WALLET && this.limitStore.GET_LIMIT_HISTORY.length === 0 && !this.firstLoading) {
            this.checkOrderHistory()
        } else {
            this.historyLoaded = true
        }
    },
    unmounted() {
        this.limitStore.LIMIT_HISTORY([])
    },
    watch: {
        'dexStore.GET_DEX_WALLET': {
            handler() {
                if (this.dexStore.GET_DEX_WALLET && this.limitStore.GET_STRATEGIES_WALLET) {
                    this.historyLoaded = false
                    if (this.limitStore.GET_LIMIT_HISTORY.length === 0) {
                        console.log('checkOrderHistory')
                        this.checkOrderHistory()
                    }
                }
            }
        },
    }}
</script>

<style scoped>
    .history {
        width: 100%;
    }

    .menu {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 14px;
    }

    .menu__tabs {
        display: flex;
        max-width: fit-content;
        padding: 3px;
        border-radius: 12px;
        background: var(--iface-white4);
        text-align: center;
    }

    .tab {
        width: auto;
        height: 30px;
        padding: 8px 16px;
        text-align: center;
    }

    .menu__actions {
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .menu__btn {
        height: 36px;
        display:  flex;
        align-items: center;
        justify-content: center;
        border-radius: 12px;
        background: transparent;
        font-size: 13px;
        line-height: normal;
        font-weight: 400;
    }

    .refresh-btn {
        width: 36px;
        border: 1px solid var(--iface-white10);
    }

    .refresh-btn:hover {
        border: 1px solid var(--iface-white20);
    }

    .cancel-btn {
        display: flex;
        align-items: center;
        gap: 6px;
        width: auto;
        padding: 8px 10px 8px 8px;
        border: 1px solid rgba(234, 57, 67, 0.24);
        color: #EA3943;
        opacity: 0.8;
        transition: .2s;
    }

    .cancel-btn:hover {
        opacity: 1;
        border: 1px solid rgba(234, 57, 67, 0.2);
    }

    .menu__btn:disabled {
        opacity: 0.6;
    }

    .history__empty-list {
        width: 100%;
        height: 96px;
        display: flex;
        align-items: center;
        justify-content: center;
        text-align: center;
        border-radius: 12px;
        border: 1px solid var(--iface-white6);
        font-size: 13px;
    }

    .history__list {
        display: flex;
        flex-direction: column;
        gap: 8px;
    }

    .skeleton-card {
        width: 100%;
        height: 96px;
    }

    .skeleton-tab {
        height: 30px;
        width: 200px;
        border-radius: 8px;
    }

</style>
