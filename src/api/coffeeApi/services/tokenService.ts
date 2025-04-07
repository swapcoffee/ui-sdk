import { CoffeeSdkWrapper } from '@/api/coffeeApi/sdkWrapper.js';

class TokenService extends CoffeeSdkWrapper {
  constructor() {
    super();
    this.baseUrl = 'https://tokens.swap.coffee';
    this.tonApiBaseUrl = 'https://tonapi.io/v2';
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
  }

  async getTokenListV2(params) {
    const query = new URLSearchParams(params).toString();
    const url = query ? `${this.baseUrl}/api/v2/tokens?${query}` : `${this.baseUrl}/api/v2/tokens`;
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

  async getTokensByAddress(tokensList) {
    const url = `${this.baseUrl}/api/v2/tokens/by-addresses`;
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: this.defaultHeaders,
        body: JSON.stringify(tokensList)
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

      const data = await response.json();
      data["metadata"]["image"] = data["preview"];

      return data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async getTokensByLabel(labelId, page = 1, size = 50) {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
      label_id: labelId.toString()
    }).toString();
    const url = `${this.baseUrl}/api/v2/tokens?${params}`;
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

  async getTokenByAddress(address) {
    const url = `${this.baseUrl}/api/v2/tokens/address/${address}`;
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

  async getTokensBySymbols(symbols) {
    const url = `${this.baseUrl}/api/v2/tokens/by-symbols`;
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: this.defaultHeaders,
        body: JSON.stringify(symbols)
      });

      return await response.json();
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}

export default new TokenService();
