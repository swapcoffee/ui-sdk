import { dexService, tokenService } from '@/api/coffeeApi/services';
import { stakingConditionByToken, routeConditionByAmounts } from '@/helpers/swap-interface/swap';
import { Address } from '@ton/core';
import { useDexStore } from "@/stores/dex";
import { isInsideWalletBrowser } from "@/helpers/dex/embedded-wallets";
import { useDexSettingsStore } from "@/stores/dex/settings";

let routeInfoResponse = null;
let routeRequestCounter = 0;

const dexStore = useDexStore();
const settingsStore = useDexSettingsStore();

function saveNewMaxSplits(wallet, maxSplits) {
  if (wallet?.version) {
    let defaultSplits = wallet?.version >= 5 ? 20 : 4;
    settingsStore.DEX_MAX_SPLITS(parseInt(maxSplits) || defaultSplits)
  }
}

function getPoolSelector(maxVolatility, liquiditySources) {
  const result = {
    dexes: liquiditySources,
  };

  if (Number(maxVolatility) !== -1) {
    result.max_volatility = maxVolatility / 100;
  }

  return result;
}

function setAssetForCompare(data) {
  let {
    wallet,
    tokens,
    tokenAmounts,
    maxIntermediate,
    maxVolatility,
    maxSplits,
    swapMode,
    liquiditySources,
  } = data;

  let fromTokenAddress = 'native';
  let toTokenAddress = 'native';

  if (tokens.first.type !== 'native') {
    fromTokenAddress = Address.parse(tokens.first?.address).toString();
  }

  if (tokens.second?.type !== 'native') {
    toTokenAddress = Address.parse(tokens.second?.address).toString();
  }

  const referralName = JSON.parse(sessionStorage.getItem('referral_name'));

  if (wallet?.version && wallet?.version < 5 && referralName === 'tonkeeper') {
    maxSplits = 3;
  }

  let asset = {
    input_token: {
      blockchain: 'ton',
      address: fromTokenAddress,
    },
    output_token: {
      blockchain: 'ton',
      address: toTokenAddress,
    },
    max_length: maxIntermediate + 2,
    pool_selector: getPoolSelector(maxVolatility, liquiditySources),
    max_splits: maxSplits,
    additional_data: null,
  };

  if (wallet !== null) {
    const referralName = JSON.parse(sessionStorage.getItem('referral_name'));
    const userAddress = Address.parseRaw(wallet?.address).toString();

    asset.additional_data = {
      sender_address: userAddress,
      referral_name: isInsideWalletBrowser('tonkeeper') ? 'tonkeeper' : referralName,
    };
  }

  if (swapMode === 'default') {
    asset.input_amount = Number(tokenAmounts.first);
  } else if (swapMode === 'reverse') {
    asset.output_amount = Number(tokenAmounts.second);
  }

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
      const response = await tokenService.getStakingPool(tokens.first?.stacking_pool_id);
      dexStore.DEX_STAKING_POOL(response?.data);
    }
    if (stakingConditionByToken(tokens.second)) {
      const response = await tokenService.getStakingPool(tokens.second?.stacking_pool_id);
      dexStore.DEX_STAKING_POOL(response?.data);
    }

    let requestKey = ++routeRequestCounter;

    if (routeConditionByAmounts(tokenAmounts)) {
      routeInfoResponse = await dexService.getRoute(requestData);

      if (routeRequestCounter === requestKey) {
        if (
          Array.isArray(routeInfoResponse.data?.paths) &&
          routeInfoResponse.data.paths.length > 0
        ) {
          dexStore.DEX_DEAL_CONDITIONS(routeInfoResponse.data);
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
    setTimeout(() => {
      changeRefreshInfo(false);
    }, 800);
  }
}
