<template>
    <modal-wrapper
        :title="getCaption"
        :freeHeight="true"
        @closeModal="$emit('closeDistribution')"
    >
        <div class="distribution__scroll-block custom-scroll">
            <div class="distribution__tokens-list">
                <div
                    v-for="(route, index) in getRoutes.slice(0, routeCount)"
                    :key="index"
                    class="distribution__flex"
                >
                    <div class="distribution__group">
                        <div class="distribution__dex-info">
                            <div v-if="route.dex.length > 1" class="distribution__dex-icons">
                                <img
                                    v-for="(dex, dexIndex) in route.dex"
                                    :key="dex.name"
                                    :src="dex.imageUrl"
                                    :alt="dex.name"
                                    class="distribution__route-image stacked"
                                    :style="{ marginLeft: dexIndex === 0 ? '0px' : '-14px' }"
                                />
                            </div>
                            <img
                                v-else
                                :src="route.dex[0].imageUrl"
                                :alt="route.dex[0].name"
                                class="distribution__route-image"
                            />
                            <p class="distribution__percentage">{{ route.inputPercentage }}%</p>
                        </div>
                    </div>
                    <p class="distribution__route-path">
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
                <button v-if="getRoutes.length > 4" class="distribution__toggle-btn" @click="showMore">
                    {{ getBtnText }}
                </button>
            </div>
        </div>
    </modal-wrapper>
</template>

<script lang="ts">
import transactionRoutesMixin from '@/mixins/transactionRoutesMixin.ts';
import computedMixins from '@/mixins/computedMixins.ts';
import CrossArrowIcon from "@/assets/dex/icons/CrossArrowIcon.vue";
import ModalWrapper from "@/components/ui/ModalWrapper.vue";

export default {
    name: 'DistributionModal',
    components: {ModalWrapper, CrossArrowIcon},
    mixins: [transactionRoutesMixin, computedMixins],
    data() {
        return {
            routeCount: 4,
        };
    },
    computed: {
        getCaption() {
            if (window.innerWidth > 640) {
                return this.$t('dexRouteInfo.caption[0]');
            } else {
                return this.$t('dexRouteInfo.caption[1]');
            }
        },
        getBtnText() {
            if (this.routeCount === 4) {
                return 'Show all';
            } else {
                return 'Hide all';
            }
        },
    },
    mounted() {

    },
    methods: {
        showMore() {
            if (this.routeCount === 4) {
                this.routeCount = 20;
            } else {
                this.routeCount = 4;
            }
        },
        isSameToken(currentToken, nextToken) {
            return currentToken === nextToken;
        },
        isCrossDex(route) {
            return route.dex.length > 1;
        },
    },
};
</script>

<style scoped>
.distribution__scroll-block {
    max-height: 223px;
    height: auto;
    overflow-y: auto;
}

.distribution__tokens-list {
    display: flex;
    flex-direction: column;
    border-radius: 14px;
    overflow: hidden;
    gap: 1px 0;
}

.distribution__dex-info {
    font-size: 16px;
    text-align: center;
}

.distribution__flex {
    display: flex;
    align-items: center;
    background: var(--iface-white8);
    padding: 8px 12px 8px 8px;
}

.distribution__dex-icons {
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

.swap-coffee__sdk-widget .theme-light .custom-arrow {
  filter: invert(1) !important;
}


.stacked {
    position: relative;
}


.distribution__route-image {
    margin-right: 6px;
    width: 18px;
    height: 18px;
    border-radius: 100px;
}

.distribution__dex-info {
    display: flex;
    align-items: center;
    padding: 6px;
    margin-right: 6px;
    border-radius: 10px;
    background: var(--iface-white6);
    min-width: 82px;
}

.distribution__route-path {
    font-size: 13px;
    line-height: 16px;
}

.distribution__percentage {
    font-size: 14px;
    line-height: 16px;
    color: var(--main-green);
}

.distribution__toggle-btn {
    padding: 10px 12px;
    border: none;
    background: var(--iface-white4);
    font-family: Harmony-Regular, sans-serif;
    font-size: 13px;
    color: var(--main-text-color);
}

.distribution__group {
    display: flex;
    flex-direction: row;
    align-items: center;
}

.theme-light svg path {
    fill: #141414;
}

.custom-scroll::-webkit-scrollbar {
    display: none;
}

@media screen and (max-width: 640px) {
    .distribution {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        width: 100%;
        border-radius: 20px 20px 0 0;
        display: flex;
        flex-direction: column;
    }

    .distribution__scroll-block {
        max-height: none;
        height: auto;
        overflow-y: auto;
    }
}

@media screen and (max-height: 680px) {
    .distribution {
        max-height: 100dvh;
    }
}
</style>
