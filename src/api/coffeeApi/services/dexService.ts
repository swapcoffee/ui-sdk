import { CoffeeSdkWrapper } from "@/api/coffeeApi/sdkWrapper";
import {
  ApiRouteRequest,
  ApiRouteResult,
  ApiTonStakingTransactionRequest,
  ApiTonUnstakeTransactionRequest,
  ApiTransactionsRequest,
  ApiTransactionsResponse,
} from "@swap-coffee/sdk";

interface FeeSettings {
  fixed_fee?: string;
  percentage_fee?: number;
  min_percentage_fee_fixed?: string;
  max_percentage_fee_fixed?: string;
}

class DexService extends CoffeeSdkWrapper {
  constructor() {
    super();
  }

  async getRoute(
      requestParams: ApiRouteRequest)
      : Promise<ApiRouteResult> {
    const {
      input_token,
      output_token,
      input_amount,
      output_amount,
      max_length,
      max_splits,
      additional_data,
      mev_protection,
      pool_selector
    } = requestParams;

    return await this.routingApi.buildRoute({
      input_token,
      output_token,
      input_amount,
      output_amount,
      max_length,
      max_splits,
      additional_data,
      mev_protection,
      pool_selector: pool_selector ?? {
        ...pool_selector,
        dexes: dexes ?? ['dedust', 'stonfi', 'stonfi_v2', 'coffee', 'tonco', 'tonstakers', 'colossus', 'torch_finance']
      },
    });
  }

  async getStakeTransaction(
      senderAddress: string,
      tokenAddress: string,
      amount: string,
      referralName?: string
  ): Promise<any> {
    const apiTonStakingTransactionRequest: ApiTonStakingTransactionRequest = {
      sender_address: senderAddress,
      token_address: tokenAddress,
      amount: amount,
      ...(referralName && { referral_name: referralName }),
    };

    return await this.routingApi.buildTonStakeTransaction(apiTonStakingTransactionRequest);
  }

  async getUnstakeTransaction(
      senderAddress: string,
      tokenAddress: string,
      amount: string
  ): Promise<any> {
    const apiTonUnstakingTransactionRequest: ApiTonUnstakeTransactionRequest = {
      sender_address: senderAddress,
      token_address: tokenAddress,
      amount: amount,
    };

    return await this.routingApi.buildTonUnstakeTransaction(apiTonUnstakingTransactionRequest);
  }

  async getRouteTransactions(
      route: any,
      senderAddress: string,
      slippage: number,
      mevProtection = false,
      referralName?: string,
      feeSettings?: FeeSettings
  ): Promise<ApiTransactionsResponse> {
    const requestBody: ApiTransactionsRequest = {
      sender_address: senderAddress,
      slippage: slippage,
      paths: route.data?.paths || route.paths,
      mev_protection: mevProtection
    };

    if (referralName) {
      requestBody.referral_name = referralName;

      if (feeSettings) {
        requestBody.custom_fee = feeSettings;
      }
    }

    return await this.routingApi.buildTransactionsV2(requestBody);
  }

  async getTransactions(query_id) {
    return await this.routingApi.getRouteResult(query_id, {});
  }
}

export default new DexService();
