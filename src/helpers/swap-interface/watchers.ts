import { compareTokens } from "@/helpers/swap-interface/compare";
import { readyCompareCondition } from '@/helpers/swap-interface/swap';
import { useDexStore } from "@/stores/dex";
import {getActivePinia} from "pinia";

let interval = null;
let debounce = null;

function getStore(storeHook) {
  const pinia = getActivePinia();
  if (!pinia) {
    console.error('Pinia is not initialized.');
    return null;
  }
  return storeHook();
}

let dexStore

setTimeout(() => {
  dexStore = getStore(useDexStore)
}, 100)

function abortRequest(controller) {
  if (controller !== null) {
    controller.abort();
  }
}

function clearConditions(conditions) {
  if (conditions !== null) {
    dexStore.DEX_DEAL_CONDITIONS(null);
  }
}

export function removeTimeout() {
  clearTimeout(debounce);
}

export function removeInterval() {
  clearInterval(interval);
}

export function refreshAll({
  compareAsset,
  showSuccess,
  amounts,
  swapMode,
  abortController,
  tabVisibility,
}) {
  setDebounceForRequest(compareAsset, abortController, amounts, swapMode, showSuccess);
  clearInterval(interval);
  refreshDex(compareAsset, showSuccess, tabVisibility);
}

export function refreshDex(compareAsset, showSuccess, tabVisibility) {
  interval = setInterval(() => {
    if (!showSuccess && tabVisibility) {
      compareTokens(compareAsset);
    }
  }, 10000);
}

export function setDebounceForRequest(
  compareAsset,
  abortController,
  amounts,
  swapMode,
  showSuccess,
) {
  clearTimeout(debounce);
  debounce = setTimeout(() => {
    abortRequest(abortController);
    if (
      (amounts.first > 0 && swapMode === 'default') ||
      (amounts.second > 0 && swapMode === 'reverse' && !showSuccess)
    ) {
      compareTokens(compareAsset);
    }
  }, 200);
}

export function sendAmountWatcher({
                                    tokens,
                                    amounts,
                                    abortController,
                                    refreshData,
                                  }) {
  const hasInputToken = tokens.first !== null;
  const hasAmount = amounts.first > 0;

  if (hasInputToken && hasAmount) {
    refreshAll(refreshData);
  } else {
    abortRequest(abortController);
    clearInterval(interval);
  }
}


export function receiveAmountWatcher({
                                       tokens,
                                       amounts,
                                       abortController,
                                       refreshData,
                                     }) {
  if (tokens.first !== null && tokens.second !== null && amounts.second > 0) {
    refreshAll(refreshData);
  } else {
    abortRequest(abortController);
    clearInterval(interval);
  }
}


export function sendTokenWatcher({ tokens, amounts, dealConditions, stakingPool, refreshData }) {
  if (readyCompareCondition(tokens, amounts)) {
    refreshAll(refreshData);
    clearConditions(dealConditions);

    if (
      tokens.second?.stacking_pool_id == null ||
      tokens.first?.stacking_pool_id == null ||
      stakingPool?.id !== tokens.first?.stacking_pool_id
    ) {
      dexStore?.DEX_STAKING_POOL(null);
    }
  }
}

export function receiveTokenWatcher({ tokens, amounts, dealConditions, stakingPool, refreshData }) {
  if (readyCompareCondition(tokens, amounts)) {
    refreshAll(refreshData);
    clearConditions(dealConditions);

    if (
      tokens.second?.stacking_pool_id == null ||
      tokens.first?.stacking_pool_id == null ||
      stakingPool?.id !== tokens.second?.stacking_pool_id
    ) {
      dexStore?.DEX_STAKING_POOL(null);
    }
  }
}

export function changeSettingsWatcher({ tokens, amounts, dealConditions, refreshData }) {
  if (readyCompareCondition(tokens, amounts)) {
    refreshAll(refreshData);
    clearConditions(dealConditions);
  }
}

export function expertModeWatcher({ tokens, amounts, _, refreshData }) {
  if (readyCompareCondition(tokens, amounts)) {
    refreshAll(refreshData);
  }
}

export function createTabVisibilityWatcher(callback, timeoutDuration) {
  let timeout;

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
