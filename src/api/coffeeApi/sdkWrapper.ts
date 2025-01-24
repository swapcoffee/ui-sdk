import { RoutingApi, TonApi, ProfileApi } from '@swap-coffee/sdk';

class CoffeeSdkWrapper {
  private readonly routingApi: RoutingApi;
  private readonly tonApi: TonApi;
  private readonly profileApi: ProfileApi;

  constructor() {
    this.routingApi = new RoutingApi();
    this.tonApi = new TonApi();
    this.profileApi = new ProfileApi();
  }
}

export { CoffeeSdkWrapper };
