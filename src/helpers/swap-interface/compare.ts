import { dexService, tokenService } from '@/api/coffeeApi/services';
import { stakingConditionByToken, routeConditionByAmounts } from '@/helpers/swap-interface/swap';
import { Address } from '@ton/core';
import { isInsideWalletBrowser } from '@/helpers/dex/embedded-wallets';
import { getActivePinia } from 'pinia';
import { useDexStore } from '@/stores/dex';
import { useDexSettingsStore } from '@/stores/dex/settings';

// Types for function parameters
type StoreHook<T> = () => T;
type Wallet = { address: string; version?: number };
type MaxSplits = number | string;
type MaxVolatility = number | string;
type LiquiditySources = string[];
type CompareData = {
  wallet?: Wallet;
  tokens?: { first?: any; second?: any };
  tokenAmounts?: any;
  maxIntermediate?: number;
  maxVolatility?: MaxVolatility;
  maxSplits?: MaxSplits;
  swapMode?: string;
  liquiditySources?: LiquiditySources;
  mevProtection?: boolean;
  customFeeSettings?: any;
  widgetReferral?: any;
  changePoolNotFound?: (value: boolean) => void;
  changeRefreshInfo?: (value: boolean) => void;
  createAbortController?: () => void;
};

let routeInfoResponse: any = null;
let routeRequestCounter = 0;

export const TSTON_ADDRESS = Address.parse("EQC98_qAmNEptUtPc7W6xdHh_ZHrBUFpw5Ft_IzNU20QAJav").toString()

function getStore<T>(storeHook: StoreHook<T>): T | null {
  const pinia = getActivePinia();
  if (!pinia) {
    console.error('Pinia is not initialized.');
    return null;
  }
  return storeHook();
}

let dexStore: ReturnType<typeof useDexStore> | null = null,
    settingsStore: ReturnType<typeof useDexSettingsStore> | null = null

let intervalId = setInterval(() => {
  dexStore = getStore(useDexStore);
  settingsStore = getStore(useDexSettingsStore);
  if(dexStore !== null && settingsStore !== null) {
    clearInterval(intervalId);
  }
}, 500);

function saveNewMaxSplits(wallet: Wallet | undefined, maxSplits: MaxSplits) {
  if (wallet?.version && settingsStore) {
    let defaultSplits = wallet.version >= 5 ? 20 : 4;
    settingsStore.DEX_MAX_SPLITS(parseInt(String(maxSplits)) || defaultSplits);
  }
}

function getPoolSelector(maxVolatility: MaxVolatility, liquiditySources: LiquiditySources) {
  const result: { dexes: LiquiditySources; max_volatility?: number } = {
    dexes: liquiditySources,
  };

  if (Number(maxVolatility) !== -1) {
    result.max_volatility = Number(maxVolatility) / 100;
  }

  return result;
}

function setAssetForCompare(data: CompareData) {
  let { wallet, tokens, tokenAmounts, maxIntermediate = 0, maxVolatility = 0, maxSplits = 1, swapMode = 'default', liquiditySources = [], mevProtection = false, customFeeSettings, widgetReferral } = data;
  let fromTokenAddress = tokens?.first?.type !== 'native' ? Address.parse(tokens?.first?.address).toString() : 'native';
  let toTokenAddress = tokens?.second?.type !== 'native' ? Address.parse(tokens?.second?.address).toString() : 'native';

  if (widgetReferral && customFeeSettings) {
    maxSplits = 3;
  }

  let asset: any = {
    input_token: { blockchain: 'ton', address: fromTokenAddress },
    output_token: { blockchain: 'ton', address: toTokenAddress },
    max_length: maxIntermediate + 2,
    pool_selector: getPoolSelector(maxVolatility, liquiditySources),
    max_splits: maxSplits,
    additional_data: null,
    mev_protection: mevProtection
  };

  if (wallet) {
    asset.additional_data = {
      sender_address: Address.parseRaw(wallet.address).toString(),
      referral_name: widgetReferral,
    };
  }

  asset[swapMode === 'default' ? 'input_amount' : 'output_amount'] = Number(
      tokenAmounts?.[swapMode === 'default' ? 'first' : 'second'] || 0
  );

  saveNewMaxSplits(wallet, maxSplits);
  return asset;
}

export async function compareTokens(data: CompareData) {
  let { tokens, tokenAmounts, changePoolNotFound, changeRefreshInfo, createAbortController } = data;
  try {
    if (changePoolNotFound) changePoolNotFound(false);
    if (changeRefreshInfo) changeRefreshInfo(true);
    if (createAbortController) createAbortController();

    const requestData = setAssetForCompare(data);
    if (tokens?.first && stakingConditionByToken(tokens.first)) {
      const response = await tokenService.getStakingPool(tokens.first.stacking_pool_id);
      dexStore?.DEX_STAKING_POOL(response);
    }
    if (tokens?.second && stakingConditionByToken(tokens.second)) {
      const response = await tokenService.getStakingPool(tokens.second.stacking_pool_id);
      dexStore?.DEX_STAKING_POOL(response);
    }

    let requestKey = ++routeRequestCounter;
    if (tokenAmounts && routeConditionByAmounts(tokenAmounts)) {
      routeInfoResponse = await dexService.getRoute(requestData);
      if (routeRequestCounter === requestKey) {
        if (Array.isArray(routeInfoResponse.paths) && routeInfoResponse.paths.length > 0) {
          dexStore?.DEX_DEAL_CONDITIONS(routeInfoResponse);
        } else {
          if (changePoolNotFound) changePoolNotFound(true);
        }
      } else {
        console.warn('Ignoring route result response: counter mismatch');
      }
    }
  } catch (err) {
    console.error(err);
  } finally {
    if (changeRefreshInfo) {
      setTimeout(() => changeRefreshInfo(false), 800);
    }
  }
}
