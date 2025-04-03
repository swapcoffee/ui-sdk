import { defineStore } from 'pinia';
import { LimitSettingsState } from "@/utils/types";

export const useLimitSettingsStore = defineStore('limit-settings', {
    state: (): LimitSettingsState => ({
        expertMode: false,
        maxSuborders: 1,
        maxInvocations: 2,
        enableSuborders: false,
    }),
    actions: {
        LIMIT_EXPERT_MODE(value: boolean) {
            this.expertMode = value;
        },
        LIMIT_MAX_SUBORDERS(value: number) {
            this.maxSuborders = value;
        },
        LIMIT_MAX_INVOCATIONS(value: number) {
            this.maxInvocations = value;
        },
        CLEAR_LIMIT_EXPERT_SETTINGS() {
            this.expertMode = false;
            this.maxSuborders = 1;
            this.maxInvocations = 2;
            this.enableSuborders = false;
        },
        LIMIT_ENABLE_SUBORDERS(value: boolean) {
            this.enableSuborders = value;
        },
    },
    getters: {
        GET_LIMIT_EXPERT_MODE: (state) => state.expertMode,
        GET_LIMIT_SUBORDERS: (state) => state.maxSuborders,
        GET_LIMIT_INVOCATIONS: (state) => state.maxInvocations,
        GET_LIMIT_ENABLE_SUBORDERS: (state) => state.enableSuborders,
    },
});
