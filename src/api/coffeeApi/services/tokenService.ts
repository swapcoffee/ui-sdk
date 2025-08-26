import { CoffeeSdkWrapper } from '@/api/coffeeApi/sdkWrapper.ts';
import { labelV3ToV2, tokenFromV3ToV2 } from '@/adapter/tokensAdapter.ts';

class TokenService extends CoffeeSdkWrapper {
  constructor() {
    super();
    this.baseUrl = 'https://tokens.swap.coffee';
    this.tonApiBaseUrl = 'https://tonapi.io/v2';
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
  }

  async getTokenListV2(params, addCommunity = false, onlyCommunity = false) {
    const query = new URLSearchParams(params);

    if (onlyCommunity) {
      query.append('verification', 'COMMUNITY');
    } else {
      query.append('verification', 'WHITELISTED');
      if (addCommunity) {
        query.append('verification', 'COMMUNITY');
      }
    }

    const url = `${this.baseUrl}/api/v3/jettons?${query.toString()}`;
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: this.defaultHeaders
      });

      const data = await response.json();

      const items = data.map(tokenFromV3ToV2)
      const page = params.page || 1;
      const size = params.size || 40;
      return {
        items: items,
        total: items.length,
        page: page,
        size: size,
      }
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async getAccountBalance(address) {
    const url = `${this.baseUrl}/api/v3/accounts/${address}/jettons`;

    const response = await fetch(url, {
      method: 'GET',
      headers: this.defaultHeaders,
    });

    if (!response.ok) {
      throw new Error(`HTTP error. status: ${response.status}`);
    }

    return await response.json();
  }

  async getTokensByAddress(tokensList) {
    const url = `${this.baseUrl}/api/v3/jettons/by-addresses`;
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: this.defaultHeaders,
        body: JSON.stringify(tokensList),
      });

      const data = await response.json();
      return data.map(tokenFromV3ToV2);
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
        headers: this.defaultHeaders,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      data['metadata']['image'] = data['preview'];

      return data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async getTokensByLabel(labelId, addCommunity = false, onlyCommunity = false, page = 1, size = 100, search = null) {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
      label_id: labelId.toString()
    });

    if (search && search.trim()) {
      params.append('search', search.trim());
    }

    if (onlyCommunity) {
      params.append('verification', 'COMMUNITY');
    } else {
      params.append('verification', 'WHITELISTED');
      if (addCommunity) {
        params.append('verification', 'COMMUNITY');
      }
    }

    const url = `${this.baseUrl}/api/v3/jettons?${params}`;
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: this.defaultHeaders
      });
      const data = await response.json();
      const items = data.map(tokenFromV3ToV2)
      return {
        items: items,
        total: items.length,
        page: page,
        size: size,
      }
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async getTokenByAddress(address) {
    const url = `${this.baseUrl}/api/v3/jettons/${address}`;
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: this.defaultHeaders,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return tokenFromV3ToV2(await response.json());
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async getLabels() {
    const url = `${this.baseUrl}/api/v3/labels`;
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: this.defaultHeaders,
      });

      const data = await response.json();
      const items = data.map(labelV3ToV2);
      return {
        items,
        total: items.length,
        page: 1,
        size: items.length,
      };
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
        headers: this.defaultHeaders,
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
        body: JSON.stringify(symbols),
      });

      return await response.json();
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}

export default new TokenService();
