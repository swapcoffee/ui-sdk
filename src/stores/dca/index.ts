import { defineStore } from 'pinia';
import { DcaState } from "@/utils/types";

export const useDcaStore = defineStore('dca', {
    state: (): DcaState => ({
        everyTime: 600,
        minRange: null as number | null,
        maxRange: null as number | null,
        enableRange: false,
    }),
    actions: {
        DCA_EVERY_TIME(value: number) {
            this.everyTime = value;
        },
        DCA_MIN_RANGE(value: number | null) {
            this.minRange = value;
        },
        DCA_MAX_RANGE(value: number | null) {
            this.maxRange = value;
        },
        DCA_ENABLE_RANGE(value: boolean) {
            this.enableRange = value;
        },
    },
    getters: {
        GET_DCA_EVERY_TIME: (state) => state.everyTime,
        GET_MIN_RANGE: (state) => state.minRange,
        GET_MAX_RANGE: (state) => state.maxRange,
        GET_DCA_ENABLE_RANGE: (state) => state.enableRange,
    },
});
