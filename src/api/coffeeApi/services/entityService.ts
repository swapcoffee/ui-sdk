import { CoffeeSdkWrapper } from "@/api/coffeeApi/sdkWrapper.ts";

class EntityService extends CoffeeSdkWrapper {
    constructor() {
        super();
        this.baseUrl = 'https://backend.swap.coffee/v1';
    }

    async getPoolByAddress(pool_address) {
        return await this.entityApi.getPool("ton", pool_address)
    }


    async getLiquidStakingPools() {
        const url = `${this.baseUrl}/liquid_staking_pools`;
        try {
            const response = await fetch(url, {
                method: 'GET',
            })

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return response.json()
        } catch (error) {
            console.error('Error withdraw stonfi:', error);
            throw error;
        }
    }

    async getLiquidStakingPoolByAddress(address) {
        const url = `${this.baseUrl}/liquid_staking_pools/${address}`;
        try {
            const response = await fetch(url, {
                method: 'GET',
            })

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return response.json()
        } catch (error) {
            console.error('Error withdraw stonfi:', error);
            throw error;
        }
    }
}

export default new EntityService();
