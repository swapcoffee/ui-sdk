import { toSafeAddress } from "@/utils/addressUtils.ts";
import { useDexStore } from "@/stores/dex";
import { getActivePinia } from "pinia";
import { refreshAll as refreshAllHandler, removeRefreshInterval as removeRefreshIntervalHandler } from "@/helpers/swap-routing/refresh-handlers.ts";
import { readyCompareCondition, readyMultiCompareCondition } from "@/helpers/swap-routing/conditions.ts";
import { compareTokens } from "@/helpers/swap-routing/routing.ts";

let interval: any = null;
let debounce: any = null;

function getStore(storeHook: any) {
  const pinia = getActivePinia();
  if (!pinia) {
    console.error('Pinia is not initialized.');
    return null;
  }
  return storeHook();
}

let dexStore: any;

let intervalId = setInterval(() => {
  dexStore = getStore(useDexStore);
  if(dexStore !== null) {
    clearInterval(intervalId);
  }
}, 500);

function abortRequest(controller: any) {
  if (controller && typeof controller.abort === 'function') {
    controller.abort();
  }
}

function clearConditions(conditions: any) {
  if (conditions !== null) {
    dexStore.DEX_DEAL_CONDITIONS(null);
  }
}

export function removeRefreshTimeout() {
  clearTimeout(debounce);
}

export function removeRefreshInterval() {
  clearInterval(interval);
}

export function refreshAll(refreshData: any) {
  refreshAllHandler(refreshData);
}

export function refreshDex(compareAsset: any, showSuccess: any, tabVisibility: any) {
  interval = setInterval(() => {
    if (!showSuccess && tabVisibility) {
      compareTokens(compareAsset);
    }
  }, 10000);
}

export function setDebounceForRequest(
  compareAsset: any,
  abortController: any,
  amounts: any,
  swapMode: any,
  showSuccess: any,
) {
  clearTimeout(debounce);
  debounce = setTimeout(() => {
    abortRequest(abortController);
    if (
      amounts && ((amounts.first > 0 && swapMode === 'default') ||
      (amounts.second > 0 && swapMode === 'reverse' && !showSuccess))
    ) {
      compareTokens(compareAsset);
    }
  }, 200);
}

export function amountLimitWatcher({ tokens, amounts, routeName, type, min, max, et, ls }: {
  tokens: any;
  amounts: any;
  routeName: any;
  type: any;
  min: any;
  max: any;
  et: any;
  ls: any;
}) {
  const isSend = type === "send";
  const amount = isSend ? amounts?.first : amounts?.second;

  if (!amounts || amount <= 0) return;

  // Note: Query logic removed as requested
  // Originally would update router query here
}

export function sendAmountWatcher({
  tokens,
  amounts,
  refreshData,
}: {
  tokens: any;
  amounts: any;
  refreshData: any;
}) {
  if (!amounts) {
    removeRefreshIntervalHandler();
    return;
  }

  if (tokens?.first !== null && tokens?.second !== null && amounts.first > 0) {
    refreshAllHandler(refreshData);
    // Note: Router query logic removed as requested
  } else if (tokens?.first !== null && amounts.first > 0) {
    // Note: Router query logic removed as requested
  } else {
    if (amounts.first === 0) {
      // Note: Router query logic removed as requested
    }

    if (tokens?.second === null) {
      // Note: Router query logic removed as requested
    }

    removeRefreshIntervalHandler();
  }
}


export function receiveAmountWatcher({
  tokens,
  amounts,
  refreshData,
}: {
  tokens: any;
  amounts: any;
  refreshData: any;
}) {
  if (!amounts) {
    removeRefreshIntervalHandler();
    return;
  }

  if (tokens?.first !== null && tokens?.second !== null && amounts.second > 0) {
    refreshAllHandler(refreshData);
    // Note: Router query logic removed as requested
  } else {
    if (amounts.second === 0) {
      // Note: Router query logic removed as requested
    }
    if (tokens?.second === null) {
      // Note: Router query logic removed as requested
    }
    removeRefreshIntervalHandler();
  }
}

export function sendTokenWatcher({ tokens, amounts, dealConditions, stakingPool, refreshData }: {
  tokens: any;
  amounts: any;
  dealConditions: any;
  stakingPool: any;
  refreshData: any;
}) {
  if (readyCompareCondition(tokens, amounts)) {
    refreshAllHandler(refreshData);
    clearConditions(dealConditions);

    if (
      tokens?.second?.stacking_pool_id == null ||
      tokens?.first?.stacking_pool_id == null ||
      stakingPool?.id !== tokens?.first?.stacking_pool_id
    ) {
      dexStore?.DEX_STAKING_POOL(null);
    }
  }
}

export function receiveTokenWatcher({ tokens, amounts, dealConditions, stakingPool, refreshData }: {
  tokens: any;
  amounts: any;
  dealConditions: any;
  stakingPool: any;
  refreshData: any;
}) {
  if (readyCompareCondition(tokens, amounts)) {
    refreshAllHandler(refreshData);
    clearConditions(dealConditions);

    if (
      tokens?.second?.stacking_pool_id == null ||
      tokens?.first?.stacking_pool_id == null ||
      stakingPool?.id !== tokens?.second?.stacking_pool_id
    ) {
      dexStore?.DEX_STAKING_POOL(null);
    }
  }
}

export function changeSettingsWatcher({ tokens, amounts, dealConditions, refreshData }: {
  tokens: any;
  amounts: any;
  dealConditions: any;
  refreshData: any;
}) {
  if (readyCompareCondition(tokens, amounts)) {
    refreshAllHandler(refreshData);
    clearConditions(dealConditions);
  }
}

export function expertModeWatcher({ tokens, amounts, _, refreshData }: {
  tokens: any;
  amounts: any;
  _: any;
  refreshData: any;
}) {
  if (readyCompareCondition(tokens, amounts)) {
    refreshAllHandler(refreshData);
  }
}

export function createTabVisibilityWatcher(callback: any, timeoutDuration: any) {
  let timeout: any;

  const visibilityChangeHandler = () => {
    clearTimeout(timeout);
    if (document.hidden) {
      timeout = setTimeout(() => callback(false), timeoutDuration);
    } else {
      callback(true);
    }
  };

  return {
    start() {
      document.addEventListener('visibilitychange', visibilityChangeHandler);
    },
    stop() {
      document.removeEventListener('visibilitychange', visibilityChangeHandler);
      clearTimeout(timeout);
    },
  };
}

export function multiTokensWatcher({ tokens, amounts, refreshData, dealConditions }: {
  tokens: any;
  amounts: any;
  refreshData: any;
  dealConditions: any;
}) {
  if (readyMultiCompareCondition(tokens, amounts)) {
    refreshAllHandler(refreshData);
    clearConditions(dealConditions);
  } else {
    removeRefreshIntervalHandler();
  }
}

export function multiAmountsWatcher({
  tokens,
  amounts,
  refreshData,
  dealConditions,
}: {
  tokens: any;
  amounts: any;
  refreshData: any;
  dealConditions: any;
}) {
  if (readyMultiCompareCondition(tokens, amounts)) {
    refreshAllHandler(refreshData);
    clearConditions(dealConditions);
  } else {
    removeRefreshIntervalHandler();
  }
}
