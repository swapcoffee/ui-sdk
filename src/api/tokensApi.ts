import axios from "axios";
import Api from "@/api/instance.ts";

export default class TokensApi extends Api {
    constructor() {
        const ax = axios.create({
            baseURL: 'https://tokens.swap.coffee/api/v1'
        });

        super(ax);
    }

    getTokenList() {
        return this.request(`/tokens/1/tokens`, null, "GET");
    }

    getStakingPool(pool_id) {
        return this.request(`/tokens/stacking/pool/${pool_id}`, null, "GET");
    }

    generateTonProofPayload() {
        const url = `/user/proof/generate`
        return this.request(url, null, "GET");
    }
}