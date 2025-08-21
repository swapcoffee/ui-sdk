import { CoffeeSdkWrapper } from '@/api/coffeeApi/sdkWrapper';
import type {
  ApiRouteRequest,
  ApiRoute,
  ApiMultiAssetRouteRequest,
  ApiMultiAssetRoute,
  ApiTonStakingTransactionRequest,
  ApiTransactionBoc,
  ApiTransactionsRequest,
  ApiTransactionsResponse,
  ApiRouteResult,
} from "@swap-coffee/sdk";
import { DEXES_IDS } from "@/utils/dexes.ts";

interface FeeSettings {
  fixed_fee?: string;
  percentage_fee?: number;
  min_percentage_fee_fixed?: string;
  max_percentage_fee_fixed?: string;
}

class DexService extends CoffeeSdkWrapper {
  protected baseUrl: string;

  constructor() {
    super();
    this.baseUrl = `https://backend.swap.coffee/v1`;
  }

  async getRoute(body: ApiRouteRequest, signal?: AbortSignal): Promise<ApiRoute> {
    const url = `${this.baseUrl}/route`;
    const bodyData: ApiRouteRequest = {
      ...body,
      pool_selector: body?.pool_selector ?? {
        ...body?.pool_selector,
        dexes: body?.pool_selector?.dexes ?? DEXES_IDS,
      },
    };

    const params: RequestInit = {
      method: "POST",
      body: JSON.stringify(bodyData),
    };
    if (signal) params.signal = signal;

    try {
      const response = await fetch(url, params);
      return await response.json() as ApiRoute;
    } catch (err) {
      throw err;
    }
  }

  async getMultiRoute(body: ApiMultiAssetRouteRequest, signal?: AbortSignal): Promise<ApiMultiAssetRoute> {
    const url = `${this.baseUrl}/route/multi`;
    try {
      const params: RequestInit = {
        method: "POST",
        body: JSON.stringify(body),
      };
      if (signal) params.signal = signal;

      const response = await fetch(url, params);
      return await response.json() as ApiMultiAssetRoute;
    } catch (err) {
      throw err;
    }
  }

  async getSmartRoute(body: ApiRouteRequest, signal?: AbortSignal): Promise<ApiRoute> {
    const url = `${this.baseUrl}/route/smart`;
    try {
      const params: RequestInit = {
        method: "POST",
        body: JSON.stringify(body),
      };
      if (signal) params.signal = signal;

      const response = await fetch(url, params);
      return await response.json() as ApiRoute;
    } catch (err) {
      throw err;
    }
  }

  async getStakeTransaction(
      senderAddress: string,
      tokenAddress: string,
      amount: number,
      referralName?: string
  ): Promise<ApiTransactionBoc> {
    const apiTonStakingTransactionRequest: ApiTonStakingTransactionRequest = {
      sender_address: senderAddress,
      token_address: tokenAddress,
      amount,
      ...(referralName && { referral_name: referralName }),
    };

    const response = await this.routingApi.buildTonStakeTransaction(apiTonStakingTransactionRequest);
    return response.data;
  }

  async getUnstakeTransaction(
      senderAddress: string,
      tokenAddress: string,
      amount: number
  ): Promise<ApiTransactionBoc> {
    const apiTonUnstakingTransactionRequest: ApiTonStakingTransactionRequest = {
      sender_address: senderAddress,
      token_address: tokenAddress,
      amount: amount,
    };

    const response = await this.routingApi.buildTonUnstakeTransaction(apiTonUnstakingTransactionRequest);
    return response.data;
  }

  async getRouteTransactions(
      paths: any[],
      senderAddress: string,
      slippage: number | boolean,
      referralName?: string,
      mevProtection = false,
      feeSettings?: FeeSettings
  ): Promise<ApiTransactionsResponse> {
    const requestBody: ApiTransactionsRequest = {
      sender_address: senderAddress,
      paths,
      mev_protection: mevProtection,
    };

    if (typeof slippage === "boolean") {
      requestBody.dynamic_slippage = true;
    } else {
      requestBody.slippage = slippage;
    }

    if (referralName) requestBody.referral_name = referralName;
    if (feeSettings) requestBody.custom_fee = feeSettings;

    const response = await this.routingApi.buildTransactionsV2(requestBody);
    return response.data;
  }

  async getTransactions(query_id: number): Promise<ApiRouteResult> {
    const response = await this.routingApi.getRouteResult(query_id);
    return response.data;
  }
}

export default new DexService();
