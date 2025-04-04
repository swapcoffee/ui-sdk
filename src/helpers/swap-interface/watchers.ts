import { compareTokens } from "@/helpers/swap-interface/compare";
import { readyCompareCondition, toSafeAddress } from '@/helpers/swap-interface/swap';
import { useDexStore } from "@/stores/dex";
import {getActivePinia} from "pinia";

let interval = null;
let debounce = null;

function getStore(storeHook) {
  const pinia = getActivePinia();
  console.log('pinia', pinia);
  if (!pinia) {
    console.error('Pinia is not initialized.');
    return null;
  }
  return storeHook();
}

const dexStore = getStore(useDexStore)

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

export function amountLimitWatcher({ tokens, amounts, routeName, type }) {
  const isSend = type === 'send';
  const amountKey = isSend ? 'fa' : 'sa';
  const amount = isSend ? amounts.first : amounts.second;

  if (amount > 0) {
    const url = new URL(window.location.href);
    url.searchParams.set('ft', toSafeAddress(tokens.first?.address));
    url.searchParams.set('st', toSafeAddress(tokens.second?.address));
    url.searchParams.set(amountKey, amount);
    window.history.pushState({}, '', url.toString());
  }
}

export function sendAmountWatcher({
                                    tokens,
                                    amounts,
                                    abortController,
                                    route,
                                    refreshData,
                                  }) {
  if (tokens.first !== null && tokens.second !== null && amounts.first > 0) {
    refreshAll(refreshData);
    const url = new URL(window.location.href);
    url.searchParams.set('ft', toSafeAddress(tokens.first?.address));
    url.searchParams.set('st', toSafeAddress(tokens.second?.address));
    url.searchParams.set('fa', amounts.first);
    window.history.pushState({}, '', url.toString());
  } else if (tokens.first !== null && amounts.first > 0) {
    const url = new URL(window.location.href);
    url.searchParams.set('ft', toSafeAddress(tokens.first?.address));
    url.searchParams.set('fa', amounts.first);
    window.history.pushState({}, '', url.toString());
  } else {
    abortRequest(abortController);

    if (amounts.first === 0) {
      const url = new URL(window.location.href);
      url.searchParams.delete('fa');

      if (tokens.first !== null && tokens.first?.address) {
        url.searchParams.set('ft', toSafeAddress(tokens.first?.address));
      }

      window.history.pushState({}, '', url.toString());
    }

    if (tokens.second === null) {
      const url = new URL(window.location.href);
      url.searchParams.delete('st');
      window.history.pushState({}, '', url.toString());
    }

    clearInterval(interval);
  }
}

export function receiveAmountWatcher({
                                       tokens,
                                       amounts,
                                       abortController,
                                       route,
                                       refreshData,
                                     }) {
  if (tokens.first !== null && tokens.second !== null && amounts.second > 0) {
    refreshAll(refreshData);
    const url = new URL(window.location.href);
    url.searchParams.set('ft', toSafeAddress(tokens.first?.address));
    url.searchParams.set('st', toSafeAddress(tokens.second?.address));
    url.searchParams.set('sa', amounts.second);
    window.history.pushState({}, '', url.toString());
  } else {
    abortRequest(abortController);

    if (amounts.second === 0) {
      const url = new URL(window.location.href);
      url.searchParams.delete('sa');

      if (tokens.second !== null && tokens.second?.address) {
        url.searchParams.set('sa', toSafeAddress(tokens.second?.address));
      }

      window.history.pushState({}, '', url.toString());
    }

    if (tokens.second === null) {
      const url = new URL(window.location.href);
      url.searchParams.delete('st');
      window.history.pushState({}, '', url.toString());
    }

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
      dexStore.DEX_STAKING_POOL(null);
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
      dexStore.DEX_STAKING_POOL(null);
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
    receiveAmountWatcher();
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
