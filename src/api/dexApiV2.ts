import axios from "axios";
import Api from "@/api/instance.ts";

export default class DexApiV2 extends Api {
    constructor() {
        const ax = axios.create({
            baseURL: 'https://backend.swap.coffee/'
        });

        super(ax);
    }

    getRoute(requestParams) {
        return this.request(`/v1/route`, JSON.stringify(requestParams), "POST");
    }

    getStakeTransaction(senderAddress, tokenAddress, amount, referralName) {
        let body = {
            sender_address: senderAddress,
            amount: amount,
            token_address: tokenAddress,
        };

        if (referralName) {
            body.referral_name = referralName;
        }

        return this.request('/v2/stake/ton/transaction', JSON.stringify(body), 'POST');
    }

    getUnstakeTransaction(senderAddress, tokenAddress, amount) {
        let body = {
            sender_address: senderAddress,
            amount: amount,
            token_address: tokenAddress
        }

        return this.request(`/v2/unstake/ton/transaction`, JSON.stringify(body), "POST");
    }

    getRouteTransactions(route, senderAddress, slippage, referralName, feeSettings) {
        let body = {
            sender_address: senderAddress,
            slippage: slippage,
            paths: route.paths,
        }
        if (referralName) {
            body.referral_name = referralName;

            if (feeSettings) {
                body.custom_fee = feeSettings;
            }
        }

        return this.request(`/v2/route/transactions`, JSON.stringify(body), "POST");
    }

    getTransactions(query_id) {
        return this.request(`/v1/route/result?query_id=${query_id}`)
    }

    getWalletVersion(address) {
        return this.request(`/v1/ton/wallet/${address}/version`)
    }

    getBalance(address) {
        return this.request(`/v1/ton/wallet/${address}/balance`)
    }

    readStorage(address ,verification) {
        const headers = {
            'x-verify': JSON.stringify(verification)
        }
        return this.requestWithHeaders(`/v1/profile/${address}/settings`, null, headers, "GET");
    }

    writeStorage(address ,verification, body) {
        const headers = {
            'x-verify': JSON.stringify(verification)
        }
        const data = {
            body: body
        }
        return this.requestWithHeaders(`/v1/profile/${address}/settings`, data, headers, "POST");
    }

}
