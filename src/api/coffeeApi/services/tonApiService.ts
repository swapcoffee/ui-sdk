import { CoffeeSdkWrapper } from '@/api/coffeeApi/sdkWrapper';

class TonApiService extends CoffeeSdkWrapper{
  constructor() {
    super();
    this.baseUrl = 'https://tonapi.io/v2';
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
  }

  async getWalletVersion(address) {
    return await this.tonApi.getWalletVersion(address);
  }

  async getBalance(address) {
    return await this.tonApi.getWalletBalance(address);
  }

  async getTonWalletInfo(walletAddress) {
    const url = `${this.baseUrl}/accounts/${walletAddress}`;
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

  async getTonJettons(walletAddress) {
    const url = `${this.baseUrl}/accounts/${walletAddress}/jettons?currencies=ton,usd,rub`;
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

export default new TonApiService();
