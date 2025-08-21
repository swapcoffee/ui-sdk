import {RoutingApi, TonApi, ProfileApi, StrategiesApi, EntityApi} from '@swap-coffee/sdk';

class CoffeeSdkWrapper {
  protected readonly routingApi: RoutingApi;
  protected readonly tonApi: TonApi;
  protected readonly profileApi: ProfileApi;
  protected readonly strategiesApi: StrategiesApi;
  protected readonly entityApi: EntityApi;
  protected baseUrl: string = 'https://backend.swap.coffee/v1';
  protected defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  constructor() {
    this.routingApi = new RoutingApi();
    this.tonApi = new TonApi();
    this.profileApi = new ProfileApi();
    this.strategiesApi = new StrategiesApi();
    this.entityApi = new EntityApi();
  }
}

export { CoffeeSdkWrapper };
