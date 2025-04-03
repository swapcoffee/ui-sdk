<template>
    <div class="dex">
        <h1 class="dex__heading">DEX Aggregator</h1>
<!--        :class="{ 'dex__group-centered': !showChartOption }"-->
        <div class="dex__group"
             :class="{ 'dex__group-centered': !showChartOption }"
        >
            <div class="dex__column-flex"
                :class="{ hidden: !showChartConditions && $route.path !== '/limit' && $route.path !== '/dca' }"
            >
                <div class="dex__chart-wrapper"
                     v-if="showChartConditions"
                >
                    <teleport to="#swap_chart" :disabled="screenSize > 576" defer>
                        <ChartWrapper
                            class="dex__chart"
                            v-if="showChartConditions"
                            :user-returned="chartUpdateInMount"
                        />
                    </teleport>
                </div>
                <div id="limit_history" class="dex__history"></div>
            </div>
            <router-view
                v-slot="{Component}"
                :tonConnectUi="tonConnectUi"
                :screenSize="screenSize"
            >
                <component :is="Component">

                </component>
            </router-view>
        </div>
    </div>
</template>

<script lang="ts">
import SwapInterface from "@/components/swap-interface/SwapInterface.vue";
import {mapGetters} from "vuex";
import {disablePageScroll, enablePageScroll} from "scroll-lock";
import computedMixins from "@/mixins/computedMixins.ts"
import ChartWrapper from "@/components/dex/ChartWrapper.vue";
import {throttle} from "@/helpers/perfomance/perfomance.ts";
import { createTabVisibilityWatcher } from '@/helpers/swap-interface/watchers.ts';

export default {
    name: "DexContainer",
    components: {
        SwapInterface,
        ChartWrapper
    },
    mixins: [computedMixins],
    props: {
        tonConnectUi: {
            type: Object,
            default() {
                return {}
            }
        }
    },
    data() {
        return {
            screenSize: 1920,
            isTabActive: true,
            chartUpdateInMount: false,
            timeout: null,
            tabVisibilityWatcher: null
        };
    },
    computed: {
        ...mapGetters([
            'GET_CHART_VISIBLE',
            'GET_CHART_VISIBLE_SETTING'
        ]),
        showChartConditions() {

            if (!this.showChartOption) {
                return false;
            }

            this.screenSize = window.innerWidth;
            if (!this.isTabActive) {
                return false;
            }
            if (this.screenSize > 1220) {
                return true;
            } else {
                return this.GET_CHART_VISIBLE;
            }
        },
        showChartOption() {
            return this.GET_CHART_VISIBLE_SETTING;
        }
    },
    methods: {
        checkWindowSize() {
            this.screenSize = window.innerWidth;
        },
        updateWalletInfo() {
            this.$emit('updateWalletInfo');
        },
    },
    mounted() {
        this.screenSize = window.innerWidth
        window.addEventListener('resize', throttle(this.checkWindowSize, 100))

        this.tabVisibilityWatcher = createTabVisibilityWatcher((isVisible) => {
            this.isTabActive = isVisible;
            if (isVisible) {
                this.chartUpdateInMount = true;
            }
        }, 120_000);

        this.tabVisibilityWatcher.start();

        if (this.screenSize <= 880) {
            this.chartUpdateInMount = true;
        }
    },
    unmounted() {
        this.tabVisibilityWatcher.stop();
        window.removeEventListener('resize', this.checkWindowSize)
    },
    watch: {
        showChartConditions: {
            handler: function () {
                // if (window.innerWidth <= 640) {
                if (this.showTokens) {
                    document.documentElement.style.overflow = 'hidden';
                    disablePageScroll();
                    return;
                }
                enablePageScroll();
                document.documentElement.style.overflow = 'auto';
                // }
            },
        },
    },
}
</script>

<style scoped>
.dex {
    display: flex;
}

.dex__group {
    display: flex;
    gap: 14px;
    margin: 0 auto;
}


.dex__chart-helper {
    width: 100%;
}

.dex__column-flex {
    display: flex;
    flex-direction: column;
    gap: 14px;
}

.dex__chart-wrapper {
    width: 100%;
    height: 520px;
}

.dex__heading {
    position: absolute !important;
    height: 1px;
    width: 1px;
    overflow: hidden;
    clip: rect(1px 1px 1px 1px); /* IE6, IE7 */
    clip: rect(1px, 1px, 1px, 1px);
}

.dex__chart {
    width: 100%;
    height: 100%;
}

.dex__history {
    width: 686px;
}

.hidden {
    width: 0;
}

@media screen and (max-width: 1410px) {
    .dex__chart-wrapper {
        min-width: auto;
        width: calc(100vw - 730px);
    }

    .dex__history {
        width: calc(100vw - 730px);
    }

    .dex__group {
        max-width: 100%;
        width: 100%;
        justify-content: center;
    }
}

@media screen and (max-width: 1220px) {
    .dex {
        flex-direction: column;
        margin-top: 0;
        margin-left: auto;
        padding: 0;
        width: 100%;
        max-width: 100%;
    }

    .dex__group {
        width: 100%;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        margin-top: 0;
        padding: 0;
        gap: 0;
    }

    .dex__column-flex {
        width: 60%;
        gap: 0;
    }

    .dex__chart-wrapper {
        width: auto;
        margin-bottom: 24px;
    }

    .dex__chart {
        margin-bottom: 24px;
    }

    .dex__interface {
        margin: 0 auto;
    }

}

@media screen and (max-width: 880px) {
    .dex__chart-wrapper {
        height: 100%;
    }

    .dex__column-flex {
        width: 100%;
    }

    .dex__group-centered {
        margin: 0;
    }

    .dex__interface {
        max-width: 100%;
    }
}

@media screen and (max-width: 576px) {
    .dex__chart-wrapper {
        min-width: 100%;
    }

    .dex__chart {
        margin-top: 8px;
        margin-bottom: 0;
    }
}

</style>
