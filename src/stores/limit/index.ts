import { defineStore } from 'pinia';
import { LimitState } from "@/utils/types";

export const useLimitStore = defineStore('limit', {
    state: (): LimitState => ({
        strategiesEligible: false,
        strategiesWallet: null,
        supportedSend: [],
        supportedReceive: [],
        limitFirst: null,
        limitSecond: null,
        firstAmount: 0,
        secondAmount: 0,
        tokenRate: 0,
        limitHistory: [],
    }),
    actions: {
        STRATEGIES_ELIGIBLE(value: boolean) {
            this.strategiesEligible = value;
        },
        STRATEGIES_WALLET(value: any) {
            this.strategiesWallet = value;
        },
        LIMIT_SEND_SUPPORTED_TOKENS(value: any[]) {
            this.supportedSend = value;
        },
        LIMIT_RECEIVE_SUPPORTED_TOKENS(value: any[]) {
            this.supportedReceive = value;
        },
        LIMIT_FIRST_TOKEN(value: any) {
            this.limitFirst = value;
        },
        LIMIT_SECOND_TOKEN(value: any) {
            this.limitSecond = value;
        },
        LIMIT_FIRST_AMOUNT(value: number) {
            this.firstAmount = value;
        },
        LIMIT_SECOND_AMOUNT(value: number) {
            this.secondAmount = value;
        },
        LIMIT_TOKEN_RATE(value: number) {
            this.tokenRate = value;
        },
        LIMIT_HISTORY(value: any[]) {
            this.limitHistory = value;
        },
    },
    getters: {
        GET_STRATEGIES_ELIGIBLE: (state) => state.strategiesEligible,
        GET_STRATEGIES_WALLET: (state) => state.strategiesWallet,
        GET_LIMIT_SEND_LIST: (state) => state.supportedSend,
        GET_LIMIT_RECEIVE_LIST: (state) => state.supportedReceive,
        GET_LIMIT_FIRST_TOKEN: (state) => state.limitFirst,
        GET_LIMIT_SECOND_TOKEN: (state) => state.limitSecond,
        GET_LIMIT_FIRST_AMOUNT: (state) => state.firstAmount,
        GET_LIMIT_SECOND_AMOUNT: (state) => state.secondAmount,
        GET_LIMIT_TOKEN_RATE: (state) => state.tokenRate,
        GET_LIMIT_HISTORY: (state) => state.limitHistory,
    }
});
