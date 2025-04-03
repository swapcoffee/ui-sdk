import { RoutingApi, TonApi, ProfileApi, StrategiesApi } from '@swap-coffee/sdk';

class CoffeeSdkWrapper {
  private readonly routingApi: RoutingApi;
  private readonly tonApi: TonApi;
  private readonly profileApi: ProfileApi;
  private readonly strategiesApi: StrategiesApi;

  constructor() {
    this.routingApi = new RoutingApi();
    this.tonApi = new TonApi();
    this.profileApi = new ProfileApi();
    this.strategiesApi = new StrategiesApi();
  }
}

export { CoffeeSdkWrapper };
