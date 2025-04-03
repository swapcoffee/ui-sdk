<template>
    <div class="route-info">
        <div
            v-for="(route, index) in getRoutes.slice(0, routeCount)"
            :key="index"
            class="route-info__flex"
        >
            <div class="route-info__group">
                <div class="route-info__distribution">
                    <div v-if="route.dex.length > 1" class="route-info__icons">
                        <img
                            v-for="(dex, dexIndex) in route.dex"
                            :key="dex.name"
                            :src="dex.imageUrl"
                            :alt="dex.name"
                            class="route-info__image stacked"
                            :style="{ marginLeft: dexIndex === 0 ? '0px' : '-14px' }"
                        />
                    </div>
                    <img
                        v-else
                        :src="route.dex[0].imageUrl"
                        :alt="route.dex[0].name"
                        class="route-info__image"
                    />
                    <p class="route-info__percentage">{{ route?.inputPercentage }}%</p>
                </div>
                <p class="route-info__path">
                    <span v-for="(token, tokenIndex) in route.path.split(' > ')" :key="tokenIndex">
                        {{ token }}
                        <span
                            v-if="isCrossDex(route) && tokenIndex < route.path.split(' > ').length - 1 && isSameToken(route.path.split(' > ')[tokenIndex], route.path.split(' > ')[tokenIndex + 1])"
                        >
                            <CrossArrowIcon class="custom-arrow"/>
                        </span>
                        <span v-else-if="tokenIndex < route.path.split(' > ').length - 1"> &gt; </span>
                    </span>
                </p>
            </div>
            <SuccessRouteIcon
                class="succeeded"
                v-if="getTransactions[index]?.status === 'succeeded'"
            />
            <PendingRouteIcon
                class=pending
                v-if="getTransactions[index]?.status === 'pending' || getTransactions[index]?.status === 'partially_complete'"
            />
            <FailedRouteIcon
                class="failed"
                v-if="getTransactions[index]?.status === 'failed' || getTransactions[index]?.status === 'timed_out'"
            />
        </div>
    </div>
</template>

<script>
import transactionRoutesMixin from "@/mixins/transactionRoutesMixin.js";
import { mapGetters } from 'vuex';
import FailedRouteIcon from "@/assets/interface/FailedRouteIcon.vue";
import SuccessRouteIcon from "@/assets/interface/SuccessRouteIcon.vue";
import PendingRouteIcon from "@/assets/interface/PendingRouteIcon.vue";
import CrossArrowIcon from "@/assets/dex/icons/CrossArrowIcon.vue";

export default {
    name: "ModalStatusRouteInfo",
    components: {CrossArrowIcon, PendingRouteIcon, SuccessRouteIcon, FailedRouteIcon},
    mixins: [transactionRoutesMixin],
    data() {
        return {
            routeCount: 4,
        }
    },
    computed: {
        ...mapGetters([
            "GET_SWAP_TRANSACTION_STATUS",
            "GET_DEAL_CONDITIONS"
        ]),
        getTransactions() {
            return this.GET_SWAP_TRANSACTION_STATUS?.splits
        }
    },
    methods: {
        isSameToken(currentToken, nextToken) {
            return currentToken === nextToken;
        },
        isCrossDex(route) {
            return route.dex.length > 1;
        },
    },
}
</script>

<style scoped>

.route-info {
    margin-top: 14px;
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.route-info__flex {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 3px;
}


.route-info__group {
    display: flex;
    flex-direction: row;
    align-items: center;
}


.route-info__distribution {
    display: flex;
    align-items: center;
    padding: 4px 8px 4px 4px;
    margin-right: 8px;
    border-radius: 10px;
    background: var(--iface-white6);
}

.route-info__icons {
    display: flex;
    align-items: center;
    position: relative;
}

.custom-arrow {
    height: 14px;
    width: 14px;
    position: relative;
    top: 3px;
    margin-left: 4px;
    margin-right: 6px;
}

.route-info__image {
    margin-right: 6px;
    width: 20px;
    height: 20px;
    border-radius: 100px;
}

.route-info__path {
    font-size: 14px;
    line-height: 18px;
}

.custom-arrow {
    height: 14px;
    width: 14px;
    position: relative;
    top: 3px;
    margin-left: 4px;
    margin-right: 6px;
}

.route-info__percentage {
    font-size: 13px;
    color: var(--main-green);
}

.pending {
    background-size: cover;
    animation: 1s forwards linear infinite Loader;
}

.succeeded path {
    fill: var(--main-green);
}

.pending path {
    fill: var(--main-text-color);
}

.failed path {
    fill: var(--main-red);
}

</style>
