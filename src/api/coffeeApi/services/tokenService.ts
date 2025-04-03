import { CoffeeSdkWrapper } from '@/api/coffeeApi/sdkWrapper';

class TokenService extends CoffeeSdkWrapper {
  constructor() {
    super();
    this.baseUrl = 'https://tokens.swap.coffee';
    this.tonApiBaseUrl = 'https://tonapi.io/v2';
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
  }

  async getTokenList() {
    const url = `${this.baseUrl}/api/v1/tokens/1/tokens`;
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: this.defaultHeaders
      });

      return await response.json();
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async getSingleToken(searchValue) {
    const url = `${this.tonApiBaseUrl}/jettons/${searchValue}`;
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: this.defaultHeaders
      });

      return await response.json();
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async getStakingPool(pool_id) {
    const url = `${this.baseUrl}/api/v1/tokens/stacking/pool/${pool_id}`;
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: this.defaultHeaders
      });

      return await response.json();
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async getLabels() {
    const opts = {
      page: 1,
      size: 100,
    };
    const url = `${this.baseUrl}/api/v2/labels?page=${opts.page}&size=${opts.size}`;
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: this.defaultHeaders
      });

      return await response.json();
    } catch (error) {
      console.error(error);
      throw error;
    }
  }


}

export default new TokenService();
