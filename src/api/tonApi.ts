import axios from "axios";
import Api from "@/api/instance.ts";

export default class TonApi extends Api {
	constructor() {
		const ax = axios.create({
			baseURL: 'https://tonapi.io/v2',
			headers: {
				post: {
					"Content-Type": "application/json",
					'Access-Control-Allow-Origin': '*',
				}
			}
		});

		super(ax);
	}

	getTonWalletInfo(walletAddress) {
		return this.request('/accounts/' + walletAddress);
	}

	getTonJettons(walletAddress) {
		return this.request(`/accounts/${walletAddress}/jettons?currencies=ton,usd,rub`);
	}
}