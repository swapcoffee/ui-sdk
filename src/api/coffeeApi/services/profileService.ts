import { CoffeeSdkWrapper } from '@/api/coffeeApi/sdkWrapper.ts';

class ProfileService extends CoffeeSdkWrapper {
  constructor() {
    super();
  }

  async readStorage(address, verification) {
    const xVerify = JSON.stringify(verification);
    return await this.profileApi.getAccountSettings(address, xVerify);
  }

  async writeStorage(address, verification, body) {
    const xVerify = JSON.stringify(verification);
    return await this.profileApi.updateAccountSettings(address, xVerify, body);
  }

}

export default new ProfileService();
