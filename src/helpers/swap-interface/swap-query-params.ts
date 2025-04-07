import { Address } from "@ton/core";
import { useDexStore } from "@/stores/dex";
import { useLimitStore } from "@/stores/limit";
import { getActivePinia } from "pinia";

function getStore(storeHook) {
  const pinia = getActivePinia();
  if (!pinia) {
    console.error("Pinia is not initialized.");
    return null;
  }
  return storeHook();
}

function getSearchParams() {
  return new URLSearchParams(window.location.search);
}

export function setSwapTokensByQuery(url, tokens) {
  let usdtAddress = "0:b113a994b5024a16719f69139328eb759596c38a25f59028b146fecdc3621dfe";
  let first, second;

  const ftRawAddress = isAddress(url.searchParams.get("ft")) ? toRawAddress(url.searchParams.get("ft")) : null;
  const stRawAddress = isAddress(url.searchParams.get("st")) ? toRawAddress(url.searchParams.get("st")) : null;

  first =
      tokens?.find((item) => item.address === ftRawAddress) ||
      tokens?.find((item) => item.symbol === url.searchParams.get("ft")) ||
      tokens?.find((item) => item.address === "native");

  second =
      tokens?.find((item) => item.address === stRawAddress) ||
      tokens?.find((item) => item.symbol === url.searchParams.get("st")) ||
      tokens?.find((item) => item.address === usdtAddress);

  if (first) saveFirstToken(url, first);
  if (second) saveSecondToken(url, second);

  setTimeout(() => {
    if (url.searchParams.get("fa") > 0) {
      saveFirstAmount(url);
    } else if (url.searchParams.get("sa") > 0) {
      saveSecondAmount(url);
    }
  }, 10);
}

export async function setLimitTokensByQuery(url, getFirstList, getSecondList) {
  try {
    const usdtAddress = "0:b113a994b5024a16719f69139328eb759596c38a25f59028b146fecdc3621dfe";
    let first, second;

    let ftRawAddress = isAddress(url.searchParams.get("ft")) ? toRawAddress(url.searchParams.get("ft")) : null;
    const stRawAddress = isAddress(url.searchParams.get("st")) ? toRawAddress(url.searchParams.get("st")) : null;

    if (!ftRawAddress && url.searchParams.get("ft") === "TON") {
      ftRawAddress = "native";
    }

    const firstList = await getFirstList();
    const secondList = await getSecondList(ftRawAddress);

    first =
        firstList.find((item) => item?.address === ftRawAddress) ||
        firstList.find((item) => item?.symbol === url.searchParams.get("ft")) ||
        firstList.find((item) => item?.address === "native");

    second =
        secondList.find((item) => item?.address === stRawAddress) ||
        secondList.find((item) => item?.symbol === url.searchParams.get("st")) ||
        secondList.find((item) => item?.address === usdtAddress);

    if (first) saveFirstToken(url, first);
    if (second) saveSecondToken(url, second);

    setTimeout(() => {
      if (url.searchParams.get("fa") > 0) {
        saveFirstAmount(url);
      } else if (url.searchParams.get("sa") > 0) {
        saveSecondAmount(url);
      }
    }, 10);
  } catch (err) {
    throw err;
  }
}

export function writeSendQuery(url, value) {
  let queryParams = new URLSearchParams(url?.search);
  queryParams.set("ft", toSafeAddress(value?.address));
}

export function writeReceiveQuery(url, value) {
  let queryParams = new URLSearchParams(url?.search);
  queryParams.set("st", toSafeAddress(value?.address));
}

export function writeQuery(url, queryParams) {
  const newUrl = new URL(url);
  newUrl.search = queryParams.toString();
  window.history.pushState({}, "", newUrl.toString());
}

function toSafeAddress(rawAddress) {
  try {
    if (rawAddress === "native") {
      return "TON";
    }
    const address = Address.parseRaw(rawAddress);
    return address.toString({ bounceable: true, urlSafe: true });
  } catch (error) {
    return null;
  }
}

function isAddress(value) {
  try {
    if (value === "native") {
      return "TON";
    }
    Address.parseFriendly(value);
    return true;
  } catch (error) {
    return false;
  }
}

function toRawAddress(address) {
  try {
    if (address === "native") {
      return "TON";
    }
    const parsedAddress = Address.parseFriendly(address);
    return parsedAddress.address.toRawString();
  } catch (error) {
    return address;
  }
}

function saveFirstToken(route, value) {
  const dexStore = getStore(useDexStore);
  const limitStore = getStore(useLimitStore);
  if (!dexStore || !limitStore) return;

  const actions = {
    Dex: dexStore.DEX_SEND_TOKEN,
    Limit: limitStore.LIMIT_FIRST_TOKEN,
    Dca: limitStore.LIMIT_FIRST_TOKEN,
    other: dexStore.DEX_SEND_TOKEN,
  };

  const searchParams = getSearchParams();
  searchParams.set("ft", toSafeAddress(value.address));

  if (actions[route.name]) {
    actions[route.name](value);
  } else {
    actions.other(value);
  }

  window.history.replaceState({}, "", `${window.location.pathname}?${searchParams.toString()}`);
}

function saveSecondToken(route, value) {
  const dexStore = getStore(useDexStore);
  const limitStore = getStore(useLimitStore);
  if (!dexStore || !limitStore) return;

  const actions = {
    Dex: dexStore.DEX_RECEIVE_TOKEN,
    Limit: limitStore.LIMIT_SECOND_TOKEN,
    Dca: limitStore.LIMIT_SECOND_TOKEN,
    other: dexStore.DEX_RECEIVE_TOKEN,
  };

  const searchParams = getSearchParams();
  searchParams.set("st", toSafeAddress(value.address));

  if (actions[route.name]) {
    actions[route.name](value);
  } else {
    actions.other(value);
  }

  window.history.replaceState({}, "", `${window.location.pathname}?${searchParams.toString()}`);
}

function saveFirstAmount(route) {
  const dexStore = getStore(useDexStore);
  const limitStore = getStore(useLimitStore);
  if (!dexStore || !limitStore) return;

  const actions = {
    Dex: dexStore.DEX_SEND_AMOUNT,
    Limit: limitStore.LIMIT_FIRST_AMOUNT,
    Dca: limitStore.LIMIT_FIRST_AMOUNT,
    other: dexStore.DEX_SEND_AMOUNT,
  };

  const searchParams = getSearchParams();
  const fa = searchParams.get("fa");

  if (actions[route.name]) {
    actions[route.name](fa);
  } else {
    actions.other(Number(fa));
  }

  if (fa) {
    searchParams.set("fa", fa);
    window.history.replaceState({}, "", `${window.location.pathname}?${searchParams.toString()}`);
  }
}

function saveSecondAmount(route) {
  const dexStore = getStore(useDexStore);
  const limitStore = getStore(useLimitStore);
  if (!dexStore || !limitStore) return;

  const actions = {
    Dex: dexStore.DEX_RECEIVE_AMOUNT,
    Limit: limitStore.LIMIT_SECOND_AMOUNT,
    Dca: limitStore.LIMIT_SECOND_AMOUNT,
    other: dexStore.DEX_RECEIVE_AMOUNT,
  };

  const searchParams = getSearchParams();
  const sa = searchParams.get("sa");

  if (actions[route.name]) {
    actions[route.name](sa);
  } else {
    actions.other(Number(sa));
  }

  if (sa) {
    searchParams.set("sa", sa);
    window.history.replaceState({}, "", `${window.location.pathname}?${searchParams.toString()}`);
  }
}
