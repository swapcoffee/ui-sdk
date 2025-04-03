export function isWindowContainsWallet(window, injectedWalletKey) {
  return (
    !!window &&
    injectedWalletKey in window &&
    typeof window[injectedWalletKey] === 'object' &&
    'tonconnect' in window[injectedWalletKey]
  );
}

export function isInsideWalletBrowser(injectedWalletKey) {
  if (isWindowContainsWallet(window, injectedWalletKey)) {
    return window[injectedWalletKey].tonconnect.isWalletBrowser;
  }

  return false;
}
