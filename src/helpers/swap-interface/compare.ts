import { dexService, tokenService } from '@/api/coffeeApi/services';
import { stakingConditionByToken, routeConditionByAmounts } from '@/helpers/swap-interface/swap';
import { Address } from '@ton/core';
import { isInsideWalletBrowser } from '@/helpers/dex/embedded-wallets';
import { getActivePinia } from 'pinia';
import { useDexStore } from '@/stores/dex';
import { useDexSettingsStore } from '@/stores/dex/settings';

let routeInfoResponse = null;
let routeRequestCounter = 0;

function getStore(storeHook) {
  const pinia = getActivePinia();
  if (!pinia) {
    console.error('Pinia is not initialized.');
    return null;
  }
  return storeHook();
}

let dexStore,
    settingsStore

setTimeout(() => {
   dexStore = getStore(useDexStore);
   settingsStore = getStore(useDexSettingsStore);
}, 100)

function saveNewMaxSplits(wallet, maxSplits) {
  if (wallet?.version && settingsStore) {
    let defaultSplits = wallet.version >= 5 ? 20 : 4;
    settingsStore.DEX_MAX_SPLITS(parseInt(maxSplits) || defaultSplits);
  }
}

function getPoolSelector(maxVolatility, liquiditySources) {
  const result = { dexes: liquiditySources };
  if (Number(maxVolatility) !== -1) {
    result.max_volatility = maxVolatility / 100;
  }
  return result;
}

function setAssetForCompare(data) {
  let { wallet, tokens, tokenAmounts, maxIntermediate, maxVolatility, maxSplits, swapMode, liquiditySources } = data;

  let fromTokenAddress = tokens?.first?.type !== 'native' ? Address.parse(tokens?.first?.address).toString() : 'native';
  let toTokenAddress = tokens?.second?.type !== 'native' ? Address.parse(tokens?.second?.address).toString() : 'native';

  const referralName = JSON.parse(sessionStorage.getItem('referral_name'));
  if (wallet?.version < 5 && referralName === 'tonkeeper') {
    maxSplits = 3;
  }

  let asset = {
    input_token: { blockchain: 'ton', address: fromTokenAddress },
    output_token: { blockchain: 'ton', address: toTokenAddress },
    max_length: maxIntermediate + 2,
    pool_selector: getPoolSelector(maxVolatility, liquiditySources),
    max_splits: maxSplits,
    additional_data: null,
  };

  if (wallet) {
    asset.additional_data = {
      sender_address: Address.parseRaw(wallet.address).toString(),
      referral_name: isInsideWalletBrowser('tonkeeper') ? 'tonkeeper' : referralName,
    };
  }

  asset[swapMode === 'default' ? 'input_amount' : 'output_amount'] = Number(
      tokenAmounts[swapMode === 'default' ? 'first' : 'second']
  );

  saveNewMaxSplits(wallet, maxSplits);
  return asset;
}

export async function compareTokens(data) {
  let { tokens, tokenAmounts, changePoolNotFound, changeRefreshInfo, createAbortController } = data;
  try {
    changePoolNotFound(false);
    changeRefreshInfo(true);
    createAbortController();

    const requestData = setAssetForCompare(data);
    if (stakingConditionByToken(tokens.first)) {
      const response = await tokenService.getStakingPool(tokens.first.stacking_pool_id);
      dexStore?.DEX_STAKING_POOL(response?.data);
    }
    if (stakingConditionByToken(tokens.second)) {
      const response = await tokenService.getStakingPool(tokens.second.stacking_pool_id);
      dexStore?.DEX_STAKING_POOL(response?.data);
    }

    let requestKey = ++routeRequestCounter;
    if (routeConditionByAmounts(tokenAmounts)) {
      routeInfoResponse = await dexService.getRoute(requestData);
      if (routeRequestCounter === requestKey) {
        if (Array.isArray(routeInfoResponse.data?.paths) && routeInfoResponse.data.paths.length > 0) {
          dexStore?.DEX_DEAL_CONDITIONS(routeInfoResponse.data);
        } else {
          changePoolNotFound(true);
        }
      } else {
        console.warn('Ignoring route result response: counter mismatch');
      }
    }
  } catch (err) {
    console.error(err);
  } finally {
    setTimeout(() => changeRefreshInfo(false), 800);
  }
}
