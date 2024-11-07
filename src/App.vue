<template>
  <SwapWidget
      :tonConnectUi="tonConnectUi"
  />
</template>

<script lang="ts">
import { toUserFriendlyAddress } from "@tonconnect/ui";
import { useDexStore } from "@/stores/dex";
import tonConnectMixin from "@/mixins/tonConnectMixin";
import computedMixins from "@/mixins/computedMixins";
import methodsMixins from "@/mixins/methodsMixins";
import {useSettingsStore} from "@/stores/settings";
import {pinnedTokens} from "@/helpers/dex/pinnedTokens";
import SwapWidget from "@/ui/SwapWidget.vue";
import {Address} from "@ton/core";

export default {
  name: "App",
  components: {SwapWidget},
  inject: ['tonConnectUi'],
  mixins: [tonConnectMixin, computedMixins, methodsMixins],
  data() {
    return {
      unsubscribeConnect: null,
      loadInfoCount: 0,
      tonInfo: null,
      timeout: null,
      tokensRequestInProgress: false,
      balanceRequestInProgress: false,
    }
  },
  computed: {
    GET_DEX_WALLET() {
      return this.dexStore.GET_DEX_WALLET
    },
    dexStore() {
      return useDexStore();
    },
    settingsStore() {
      return useSettingsStore();
    }
  },
  methods: {
    subscribeConnect() {
      if (this.unsubscribeConnect) {
        this.unsubscribeConnect();
      }
      this.unsubscribeConnect = this.tonConnectUi.onStatusChange((wallet) => {
        if (wallet === null) {
          this.dexStore.DEX_WALLET(null);
          this.dexStore.DEX_PROOF_VERIFICATION(null);
          localStorage.removeItem("tonProof_ver");
          this.tonproofSetConnect();
          return;
        }
        if (wallet && wallet.connectItems?.tonProof && "proof" in wallet.connectItems.tonProof) {
          wallet.account.userFriendlyAddress = toUserFriendlyAddress(wallet?.account.address);
          wallet.account.imgUrl = wallet?.imageUrl;

          this.dexStore.DEX_WALLET(wallet.account);
          this.getContractVersion(wallet.account.userFriendlyAddress);
          this.checkProof(wallet);
        }
      });
    },
    checkProof(wallet: any) {
      const tonProof = wallet.connectItems.tonProof.proof;

      const proof = {
        timestamp: tonProof.timestamp,
        domain_len: tonProof.domain.lengthBytes,
        domain_val: tonProof.domain.value,
        payload: tonProof.payload,
        signature: tonProof.signature,
      };

      const verification = {
        public_key: wallet.account.publicKey,
        wallet_state_init: wallet.account.walletStateInit,
        proof: proof,
      };

      localStorage.setItem("tonProof_ver", JSON.stringify(verification));
      this.dexStore.DEX_PROOF_VERIFICATION(verification);

      this.getUserSettings();
    },
    async getContractVersion(address: string) {
      try {
        let wallet = this.GET_DEX_WALLET;
        if (!wallet.version) {
          let res = await this.dexApiV2.getWalletVersion(address);
          if (res?.version > 0) {
            wallet.version = res.version;
            this.dexStore.DEX_WALLET(wallet);
            this.dexStore.DEX_WALLET_VERSION(res.version);
          }
        }
      } catch (err) {
        console.error(err);
      }
    },
    updateWalletInfo() {
      this.balanceRequestCount++;
      console.log("updateWalletInfo called", `Count: ${this.balanceRequestCount}`);
      this.getAccountInfo(this.GET_DEX_WALLET)
    },
    async getPinnedTokens() {
      try {
        let result = pinnedTokens()
        this.dexStore.DEX_PINNED_TOKENS(result)
      } catch (err) {
        console.error(err)
      }
    },
    async getTonTokens(retryCount = 0) {
      if (this.tokensRequestInProgress) {
        return;
      }
      try {
        this.tokensRequestInProgress = true;
        let res = await this.tokensApi.getTokenList()
        let tokens = []
        res.forEach((item) => {
          item.type = item.address === "0:0000000000000000000000000000000000000000000000000000000000000000" ? "native" : "jetton"
          if (item.address === "0:0000000000000000000000000000000000000000000000000000000000000000") {
            item.address = "native"
          }
          item.imported = false
          tokens.push(item)
        })

        let importedToken = JSON.parse(localStorage.getItem('importTokens'))
        if (importedToken) {
          importedToken.forEach((item) => {
            let findTokensItem = tokens.find((find) => find?.address === item?.address)
            if (findTokensItem) {
              return
            }
            tokens.push(item)
          })
        }

        this.dexStore.DEX_TON_TOKENS(tokens)
        this.checkQueryParams(tokens)

        if (this.GET_DEX_WALLET !== null) {
          await this.getAccountInfo(this.dexStore.GET_DEX_WALLET)
        }
      } catch (err) {
        console.error(err);
        if (retryCount < 20) {
          setTimeout(() => {
            this.getTonTokens(retryCount + 1);
          }, 5000);
        }
      } finally {
        this.tokensRequestInProgress = false;
      }
    },
    isAddress(value) {
      try {
        if (value === 'native') {
          return 'TON'
        }

        Address.parseFriendly(value);
        return true;
      } catch (error) {
        return false;
      }
    },
    toRawAddress(address) {
      try {
        if (address === 'native') {
          return 'TON'
        }

        const parsedAddress = Address.parseFriendly(address);
        return parsedAddress.address.toRawString();
      } catch (error) {
        return address;
      }
    },
    checkQueryParams(mergeTokens) {
      const urlParams = new URLSearchParams(window.location.search);

      if (urlParams.has('ref')) {
        sessionStorage.setItem('referral_name', JSON.stringify(urlParams.get('ref')));
      }
      if (urlParams.has('referral') || urlParams.has('r')) {
        sessionStorage.setItem('user_referral', JSON.stringify(urlParams.get('referral') || urlParams.get('r')));
      }

      if (urlParams.has('ft') && urlParams.has('st')) {
        let first, second;

        const ftRawAddress = this.isAddress(urlParams.get('ft')) ? this.toRawAddress(urlParams.get('ft')) : null;
        const stRawAddress = this.isAddress(urlParams.get('st')) ? this.toRawAddress(urlParams.get('st')) : null;

        first = mergeTokens.find((item) => item.address === ftRawAddress) ||
            mergeTokens.find((item) => item.symbol === urlParams.get('ft'));

        second = mergeTokens.find((item) => item.address === stRawAddress) ||
            mergeTokens.find((item) => item.symbol === urlParams.get('st'));

        if (first) {
          this.dexStore.DEX_SEND_TOKEN(first);
        }
        if (second) {
          this.dexStore.DEX_RECEIVE_TOKEN(second);
        }

        setTimeout(() => {
          if (urlParams.has('fa') && Number(urlParams.get('fa')) > 0) {
            this.dexStore.DEX_SEND_AMOUNT(Number(urlParams.get('fa')));
          } else if (urlParams.has('sa') && Number(urlParams.get('sa')) > 0) {
            this.dexStore.DEX_RECEIVE_AMOUNT(Number(urlParams.get('sa')));
          }
        }, 10);

      } else if (urlParams.has('ft')) {
        let first;

        const ftRawAddress = this.isAddress(urlParams.get('ft')) ? this.toRawAddress(urlParams.get('ft')) : null;
        first = mergeTokens.find((item) => item.address === ftRawAddress) ||
            mergeTokens.find((item) => item.symbol === urlParams.get('ft'));

        if (first) {
          this.dexStore.DEX_SEND_TOKEN(first);
        }

        setTimeout(() => {
          if (urlParams.has('fa') && Number(urlParams.get('fa')) > 0) {
            this.dexStore.DEX_SEND_AMOUNT(Number(urlParams.get('fa')));
          } else if (urlParams.has('sa') && Number(urlParams.get('sa')) > 0) {
            this.dexStore.DEX_RECEIVE_AMOUNT(Number(urlParams.get('sa')));
          }
        }, 10);

      } else {
        const findToken = mergeTokens.find((item) => item.type === 'native');
        if (findToken) {
          this.dexStore.DEX_SEND_TOKEN(findToken);
        }
      }
    },
    async getTokenLabels() {
      try {
        let res = await this.tokensApi.getLabels()
        this.dexStore.DEX_TOKEN_LABELS(res?.items)
      } catch(err) {
        console.error(err)
      }
    },
    async getAccountInfo(wallet) {
      if (this.balanceRequestInProgress) {
        return;
      }

      this.balanceRequestInProgress = true;

      try {
        let balance = await this.getBalanceWithRetry(wallet)
        let walletInfo = {
          address: wallet.address,
          balance: Number(balance),
        }

        let mergedTokens = await this.mergeTonTokens(walletInfo);
        this.dexStore.DEX_USER_TOKENS(mergedTokens);
      } catch (err) {
        console.log(err);
      } finally {
        this.balanceRequestInProgress = false;
      }
    },
    async getBalanceWithRetry(wallet) {
      try {
        return await this.getBalance(wallet);
      } catch (err) {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        return await this.getBalanceFromTonApi(wallet);
      }
    },
    async getBalance(wallet) {
      try {
        return await this.dexApiV2.getBalance(wallet.address);
      } catch (err) {
        throw err;
      }
    },
    async getBalanceFromTonApi(wallet) {
      try {
        let res = await this.tonApi.getTonWalletInfo(wallet.address);
        return res?.balance;
      } catch (err) {
        throw err;
      }
    },
    async mergeTonTokens(walletInfo) {
      let jettons = await this.getTonJettons(walletInfo)
      let toncoin = this.dexStore.GET_TON_TOKENS.find((item) => item.address === 'native')
      if (walletInfo?.balance) {
        toncoin.balance = walletInfo?.balance / Math.pow(10, toncoin?.decimals)
      }
      if (jettons.length === 0) {
        jettons.unshift(toncoin)
      } else if (jettons.length > 0 && !jettons.find((item) => item.name === toncoin.name)) {
        jettons.unshift(toncoin)
      }
      return jettons
    },
    async getTonJettons(wallet) {
      try {
        let array = []
        let tokensWithBalance = this.dexStore.GET_TON_TOKENS
        let jettons = await this.tonApi.getTonJettons(toUserFriendlyAddress(wallet.address))

        jettons?.balances.forEach((item) => {
          let findItem = this.dexStore.GET_TON_TOKENS.find((find) => item.jetton.address === find.address)
          if (findItem) {
            findItem.balance = item?.balance / Math.pow(10, findItem?.decimals)
            array.push(findItem)
          }
        })

        tokensWithBalance.forEach((token) => {
          let findItem = array.find((find) => find.name === token.name)
          if (findItem) {
            token = findItem
          } else {
            token.balance = 0
          }
        })

        this.dexStore.DEX_TON_TOKENS(tokensWithBalance)
        return array
      } catch (err) {
        // sleep 1 seconds and retry
        await new Promise((resolve) => setTimeout(resolve, 1000))
        return await this.getTonJettons(wallet)
      }
    },
    changeMetaTheme() {
      let meta = document.querySelector('meta[name="theme-color"]')
      if (meta) {
        if (this.GET_THEME === 'coffee') {
          meta.setAttribute('content', '#0A0706')
          return
        }
        if (this.GET_THEME === 'light') {
          meta.setAttribute('content', '#f8f8f8')
        }
        if (this.GET_THEME === 'dark') {
          meta.setAttribute('content', '#0A0A0A')
        }
      }
    },
    restoreUiConnection() {
      this.tonConnectUi.connectionRestored.then((restored) => {
        if (restored) {
          console.log('connection restored');
          const account = this.tonConnectUi.account;
          account.userFriendlyAddress = toUserFriendlyAddress(this.tonConnectUi.account.address);
          account.imgUrl = this.tonConnectUi.walletInfo.imageUrl;
          const proof = JSON.parse(localStorage.getItem('tonProof_ver') || '{}');
          if (proof) {
            this.DEX_WALLET(account);
            this.getContractVersion(account.userFriendlyAddress);
            this.DEX_PROOF_VERIFICATION(proof);
            this.getUserSettings();
          } else {
            console.log('disconnect');
            this.disconnectWallet();
          }
        } else {
          console.log('Connection was not restored.');
        }
      });
    },
    async disconnectWallet() {
      try {
        await this.tonConnectUi.disconnect();
        localStorage.removeItem('tonProof_ver');
      } catch (err) {
        console.error(err);
      }
    },
    tonproofSetConnect() {
      const storedVerification = JSON.parse(localStorage.getItem('tonProof_ver') || null);
      if (storedVerification) {
        return;
      }

      this.tonConnectUi.setConnectRequestParameters({
          state: 'ready',
          value: { tonProof: crypto.randomUUID() },
        });
    },
    // async getUserSettings() {
    //   try {
    //     const settings = await this.dexApiV2.readStorage(
    //         this.dexStore.GET_DEX_WALLET?.address,
    //         this.dexStore.GET_PROOF_VERIFICATION
    //     );
    //     if (settings.body?.dexSettings && settings.body?.globalSettings) {
    //       this.SAVE_USER_SETTINGS(settings.body);
    //     } else {
    //       await this.setDefaultSettings();
    //     }
    //   } catch (err) {
    //     console.error(err);
    //   }
    // },

    async setDefaultSettings() {
      try {
        console.log('set default settings');
        const global = {
          lang: 'en',
          theme: this.GET_THEME,
        };
        const dex = {
          cashback: this.GET_CASHBACK,
          slippage: this.GET_SLIPPAGE,
          expertMode: this.GET_EXPERT_MODE_VALUE,
          priceImpact: this.GET_PRICE_IMPACT,
          maxPoolVolatility: this.GET_MAX_POOL_VOLATILITY,
          maxIntermediateTokens: this.GET_MAX_INTERMEDIATE_TOKENS,
          maxSplits: this.GET_MAX_SPLITS,
        };

        await this.dexApiV2.writeStorage(
            this.dexStore.GET_DEX_WALLET?.address,
            this.dexStore.GET_PROOF_VERIFICATION,
            { globalSettings: global, dexSettings: dex }
        );
      } catch (err) {
        console.error(err);
      }
    },
  },
  mounted() {
    this.subscribeConnect()
    this.restoreUiConnection()
    this.tonproofSetConnect()
    this.getPinnedTokens()
    this.getTokenLabels()
    let tonConnectStorage = JSON.parse(localStorage.getItem('ton-connect-storage_bridge-connection'))
    let walletInfoStorage = JSON.parse(localStorage.getItem('ton-connect-ui_wallet-info'))
    let wallet = tonConnectStorage?.connectEvent?.payload?.items[0]
    let proof = JSON.parse(localStorage.getItem('tonProof_ver'))
    if (wallet) {
      wallet.userFriendlyAddress = toUserFriendlyAddress(wallet?.address)
      wallet.imgUrl = walletInfoStorage?.imageUrl
      if (tonConnectStorage) {
        this.DEX_WALLET(wallet)
      }
      this.getTonTokens();
    }
    if (proof) {
      this.DEX_PROOF_VERIFICATION(proof)
    }

    setTimeout(() => {
      if (this.GET_DEX_WALLET === null) {
        this.getTonTokens()
      }
    }, 1000)

  },
  unmounted() {
    if (this.unsubscribeConnect !== null) {
      this.unsubscribeConnect()
    }
    this.dexStore.CLEAR_DEX_STORE()
  },
  watch: {
    GET_DEX_WALLET: {
      handler() {
        let tonConnectStorage = JSON.parse(localStorage.getItem('ton-connect-storage_bridge-connection'))
        if (this.dexStore.GET_DEX_WALLET !== null) {
          if (this.loadInfoCount === 0) {
            this.getTonTokens()
          }
          if (tonConnectStorage) {
            this.loadInfoCount++
          }
        } else {
          this.loadInfoCount = 0
        }
      }
    },
  }
}
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700;1,900&display=swap');
@import "./main.css";

body {
  --main-btn-disabled: #323232;
  --main-blue: #4B76FF;
  --main-green: #32D74B;
  --main-red: #FF5449;
  --main-yellow: #FFCF55;
  --main-white: #fff;
  --main-white50: rgba(255, 255, 255, 0.5);
  --main-text-color: #fff;
  --iface-blur: 5px;
  --iface-r14: 14px;
  --iface-r20: 20px;
  --iface-r100: 100px;
  --adv-color: #FF9839;

  --tag-green-bg: rgba(50, 215, 75, 0.10);
  --tag-purple-bg: rgba(193, 114, 255, 0.10);

  --iface-white2: rgba(255, 255, 255, 0.02);
  --iface-white4: rgba(255, 255, 255, 0.04);
  --iface-white6: rgba(255, 255, 255, 0.06);
  --iface-white8: rgba(255, 255, 255, 0.08);
  --iface-white10: rgba(255, 255, 255, 0.1);
  --iface-white12: rgba(255, 255, 255, 0.12);
  --iface-white14: rgba(255, 255, 255, 0.14);
  --iface-white16: rgba(255, 255, 255, 0.16);
  --iface-white20: rgba(255, 255, 255, 0.20);
  --iface-white24: rgba(255, 255, 255, 0.24);
  --iface-white40: rgba(255, 255, 255, 0.40);

  --iface-warn-text: #FFCF55;
  --iface-warn-border: 255, 207, 85, 0.40;
  --iface-warn-bg: 255, 207, 85, 0.06;
  --iface-error-text: #FF5449;
  --iface-shadow: 0px 4px 20px 0px rgba(0, 0, 0, 0.20);
}

.theme-coffee {
  --main-bg-color: #0A0706;

  --iface-bg: #0A0706;
  --iface-accent-color: #EA7A3B;
  --iface-accent-hover: #EE9562;
  --iface-send: rgba(255, 255, 255, 0.06);
  --iface-main-bg: #181413;
  --iface-main-border: transparent;
  --iface-tooltip-bg: #181413;
  --iface-without-bg: transparent;

  --iface-border-color: rgba(255, 255, 255, 0.1);
  --iface-border-hover: rgba(255, 255, 255, 0.20);
  --iface-border-active: rgba(255, 255, 255, 0.24);
}

.theme-dark {
  --main-bg-color: #0A0A0A;

  --iface-bg: #0A0A0A;
  --iface-accent-color: #0A84FF;
  --iface-accent-hover: #44A6FF;
  --iface-send: #232324;
  --iface-main-bg: #19191A;
  --iface-main-border: rgba(255, 255, 255, 0.1);
  --iface-tooltip-bg: #0A0A0A;
  --iface-without-bg: transparent;

  --iface-border-color: rgba(255, 255, 255, 0.06);
  --iface-border-hover: rgba(255, 255, 255, 0.20);
  --iface-border-active: rgba(255, 255, 255, 0.24);
}

.theme-light {
  --main-btn-disabled: #dfdfdf;
  --main-bg-color: #f8f8f8;
  --main-text-color: #141414;
  --main-green: #28CD41;
  --main-red: #E64646;
  --main-yellow: #FFA000;
  --adv-color: #F07844;

  --iface-bg: #fff;
  --iface-accent-color: #0A84FF;
  --iface-accent-hover: #44A6FF;
  --iface-send: rgba(20, 20, 20, 0.04);
  --iface-main-bg: #fff;
  --iface-main-border: rgba(20, 20, 20, 0.08);
  --iface-tooltip-bg: #0A0A0A;
  --iface-without-bg: transparent;

  --iface-border-color: rgba(20, 20, 20, 0.08);
  --iface-border-hover: rgba(20, 20, 20, 0.20);
  --iface-border-active: rgba(20, 20, 20, 0.24);

  --iface-white2: rgba(20, 20, 20, 0.02);
  --iface-white4: rgba(20, 20, 20, 0.04);
  --iface-white6: rgba(20, 20, 20, 0.06);
  --iface-white8: rgba(20, 20, 20, 0.08);
  --iface-white10: rgba(20, 20, 20, 0.10);
  --iface-white12: rgba(20, 20, 20, 0.12);
  --iface-white14: rgba(20, 20, 20, 0.14);
  --iface-white16: rgba(20, 20, 20, 0.16);
  --iface-white20: rgba(20, 20, 20, 0.20);
  --iface-white24: rgba(20, 20, 20, 0.24);
  --iface-white40: rgba(20, 20, 20, 0.40);
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  background: var(--main-bg-color);
}

ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

a {
  text-decoration: none;
  color: #fff;
  font-family: Roboto, sans-serif;
  font-weight: 500;
}

h1, h2, h3, h4 {
  margin: 0;
  font-family: Roboto, sans-serif;
  font-weight: 700;
  color: var(--main-text-color);
}

p {
  margin: 0;
  font-size: 16px;
  line-height: 19px;
  font-family: Roboto, sans-serif;
  font-weight: 400;
  color: var(--main-text-color);
}

li {
  font-family: Roboto, sans-serif;
  font-weight: 400;
  color: var(--main-text-color);
}

button {
  cursor: pointer;
  font-family: Roboto, sans-serif;
  font-weight: 500;
  color: var(--main-text-color);
  padding: 0;
  margin: 0;
  outline: none;
}

button:focus, button:active {
	outline: none;
}

input {
  font-family: Roboto, sans-serif;
  font-weight: 400;
  color: var(--main-text-color);
}

textarea {
  font-family: Roboto, sans-serif;
  font-weight: 400;
}

input[type="number"]::-webkit-outer-spin-button,
input[type="number"]::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.container {
  position: relative;
  padding: 0 20px;
  max-width: 1280px;
  width: 1280px;
  margin: 0 auto;
}

/* CUSTOM SCROLLBAR */

.custom-scroll::-webkit-scrollbar {
  transition: .2s;
  background-color: transparent;
  width: 5px;
}

.custom-scroll::-webkit-scrollbar-track-piece {
  width: 6px;
}

.custom-scroll::-webkit-scrollbar-thumb {
  transition: .2s;
  height: 10%;
  background-color: var(--iface-white20);
  width: 6px;
  border-radius: 5px;
  cursor: grab;
  max-height: 100px;
}

.custom-scroll::-webkit-scrollbar-thumb:hover {
  background-color: var(--iface-white24);
}

.custom-scroll::-webkit-scrollbar-thumb:active {
  cursor: grabbing;
}

.custom-scroll::-webkit-scrollbar-track {
  margin: 5px 0 5px 0;
}

.slider .swiper-wrapper {
  transition-timing-function: linear;
}

.skeleton::after {
  content: '';
  display: block;
  width: 100%;
  height: 100%;
  background-image: linear-gradient(to top right, var(--iface-white6) 0%, var(--iface-white10) 15%, var(--iface-white6), var(--iface-white10) 45%, var(--iface-white6), var(--iface-white10) 75%, var(--iface-white6) 100%);
  background-repeat: no-repeat;
  background-size: 1100px 398px;
  animation: Shimmer 5s linear infinite;
  border-radius: 16px;
}

.skeleton-large::after {
  content: '';
  display: block;
  width: 100%;
  height: 100%;
  background-image: linear-gradient(to top right, var(--iface-white6) 0%, var(--iface-white10) 15%, var(--iface-white6), var(--iface-white10) 45%, var(--iface-white6), var(--iface-white10) 75%, var(--iface-white6) 100%);
  background-repeat: no-repeat;
  background-size: 2400px 400px;
  animation: Shimmer 5s linear infinite;
  border-radius: 16px;
}

@keyframes Shimmer {
  0% {
    background-position: -150px 0px;
  }
  25% {
    background-position: 0 0;
  }
  50% {
    background-position: -150px 0px;
  }
  75% {
    background-position: 0 0;
  }
  100% {
    background-position: -150px 0px;
  }
}

@keyframes Loader {
  0% {
    transform: rotateZ(0deg);
  }
  100% {
    transform: rotateZ(-360deg);
  }
}

@keyframes LoaderReverse {
  0% {
    transform: rotateZ(0deg);
  }
  100% {
    transform: rotateZ(360deg);
  }
}

@media screen and (max-width: 1260px) {
  .container {
    padding: 0 60px;
    max-width: 100%;
    width: 100%;
  }
}

@media screen and (max-width: 1024px) {
  .container {
    padding: 0 20px;
  }

  body {
    overflow-x: auto;
  }
}

@media screen and (max-width: 480px) {
  .container {
    padding: 0 10px;
  }
}
</style>
