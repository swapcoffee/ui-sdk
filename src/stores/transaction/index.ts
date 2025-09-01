import { defineStore } from 'pinia';

export interface TransactionState {
	trInfo: any | null;
	status: any | null;
	limitInfo: any | null;
}

export const useTransactionStore = defineStore('transaction', {
	state: (): TransactionState => ({
		trInfo: null,
		status: null,
		limitInfo: null,
	}),
	actions: {
		SAVE_SWAP_TRANSACTION_INFO(item: any): void {
			this.trInfo = item;
		},
		SAVE_SWAP_TRANSACTION_STATUS(item: any): void {
			this.status = item;
		},
		SAVE_LIMIT_TRANSACTION_INFO(item: any): void {
			this.limitInfo = item;
		},
	},
	getters: {
		GET_SWAP_TRANSACTION_INFO: (state): any | null => state.trInfo,
		GET_SWAP_TRANSACTION_STATUS: (state): any | null => state.status,
		GET_LIMIT_TRANSACTION_INFO: (state): any | null => state.limitInfo,
	},
});
