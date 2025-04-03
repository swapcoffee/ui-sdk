import { CoffeeSdkWrapper } from '@/api/coffeeApi/sdkWrapper';

class StrategiesService extends CoffeeSdkWrapper {
    private readonly baseUrl: string;
    constructor() {
        super();
        this.baseUrl = `https://backend.swap.coffee/v1/strategies`
    }

    async checkUserIsEligible(address, verification) {
        const xVerify = JSON.stringify(verification);
        const url = `${this.baseUrl}/eligibility/user/${address}`
        try {
            const response = await fetch(url, {
                method: "GET",
                headers: {
                    'x-verify': xVerify
                }
            })
            return await response.json()
        } catch(err) {
            throw err
        }
    }

    async checkWalletAddress(address, verification) {
        const xVerify = JSON.stringify(verification);
        return await this.strategiesApi.doesStrategyWalletExist(address, xVerify)
    }

    async createStrategiesWallet(address, verification) {
        const xVerify = JSON.stringify(verification);
        return await this.strategiesApi.getStrategyWalletCreationTransaction(address, xVerify)
    }

    async getSupportedFromTokens(type) {
        const url = `${this.baseUrl}/eligibility/from-tokens?`
        try {
            const response = await fetch(url + new URLSearchParams({
                type: type,
            }),
        {
                method: "GET"
            })

            return await response.json()
        } catch(err) {
            throw err
        }
    }

    async getSupportedToTokens(address, type){
        const url = `${this.baseUrl}/eligibility/to-tokens/${address}?`
        try {
            const response = await fetch(url + new URLSearchParams({
                type: type,
            }),
        {
                method: "GET"
            })
            return await response.json()
        } catch(err) {
            throw err
        }
    }


    async getOrders(address, verification, type, finished){
        const xVerify = JSON.stringify(verification);
        return await this.strategiesApi.getStrategyOrders(address, xVerify, type, finished)
    }

    async createOrder(address, verification, body) {
        const xVerify = JSON.stringify(verification);
        return await this.strategiesApi.getStrategyOrderCreationTransaction(address, xVerify, body)
    }


    async cancelOrderById(address, verification, id) {
        const xVerify = JSON.stringify(verification);
        return await this.strategiesApi.getStrategyOrderCancellationTransaction(address, xVerify, id)
    }

}

export default new StrategiesService();
