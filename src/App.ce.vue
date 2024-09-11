<template>
	<SwapWidget
		:tonConnectUi="tonConnectUi"
	/>
<!--	<router-view :tonConnectUi="tonConnectUi"/>-->
</template>

<script lang="ts">
import {TonConnectUI, toUserFriendlyAddress} from "@tonconnect/ui";
import {useDexStore} from "@/stores/dex";
import tonConnectMixin from "@/mixins/tonConnectMixin";
import computedMixins from "@/mixins/computedMixins";
import methodsMixins from "@/mixins/methodsMixins";
import {useSettingsStore} from "@/stores/settings";
import {pinnedTokens} from "@/helpers/dex/pinnedTokens";
import SwapWidget from "@/ui/SwapWidget.vue";

export default {
	name: "App",
	components: {SwapWidget},
	mixins: [tonConnectMixin, computedMixins, methodsMixins],
	data() {
		return {
			unsubscribeConnect: null,
			loadInfoCount: 0,
			tonInfo: null,
			timeout: null,
		}
	},
	computed: {
		tonConnectUi() {
			return new TonConnectUI(this.tonConnectSettings)
		},
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
		async setUserLanguage() {
			const settings = localStorage.getItem('globalSettings');
			if (!settings) {
				try {
					const userCountryCode = await this.geoApi.getUserCountryCode();
					if (userCountryCode) {
						this.$i18n.locale = this.getLocaleForCountry(userCountryCode);
						const newSettings = {
							theme: this.GET_THEME || "dark",
							lang: userCountryCode.toLowerCase(),
						}
						localStorage.setItem('globalSettings', JSON.stringify(newSettings))
					}
				} catch (err) {
					console.error(err);
				}
			}
		},
		updateWalletInfo() {
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
			try {
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
				// this.checkQueryParams(tokens)
				// this.checkTwaParams(tokens)

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
			}
		},
		checkTwaParams(mergeTokens) {
			if (window.Telegram.WebApp.platform !== 'unknown') {
				let startParam = window.Telegram.WebApp?.initDataUnsafe?.start_param

				if (startParam) {
					// ft_{symbol}_st_{symbol}_fa_{amount}
					let params = startParam.split('_')
					if (params.length === 6) {
						let ft = params[1].toUpperCase()
						let st = params[3].toUpperCase()
						let fa = params[5]

						// console.log("params", ft, st, fa)

						let first = mergeTokens.find((item) => item.symbol === ft)
						let second = mergeTokens.find((item) => item.symbol === st)
						if (first) {
							this.dexStore.DEX_SEND_TOKEN(first)
						}
						if (second) {
							this.dexStore.DEX_RECEIVE_TOKEN(second)
						}
						if (fa) {
							this.dexStore.DEX_SEND_AMOUNT(fa)
						}
					}
				}
			}
		},
		// checkQueryParams(mergeTokens) {
		// 	let route = this.$route
		// 	if (route.query?.ref) {
		// 		sessionStorage.setItem('referral_name', JSON.stringify(route.query?.ref))
		// 	}
		// 	if (route.query?.referral) {
		// 		sessionStorage.setItem('user_referral', JSON.stringify(route.query?.referral))
		// 	}
		// 	if (route.query?.ft && route.query?.st) {
		// 		let first = mergeTokens.find((item) => item.symbol === route.query?.ft)
		// 		let second = mergeTokens.find((item) => item.symbol === route.query?.st)
		// 		if (first) {
		// 			this.dexStore.DEX_SEND_TOKEN(first)
		// 		}
		// 		if (second) {
		// 			this.dexStore.DEX_RECEIVE_TOKEN(second)
		// 		}
		// 		setTimeout(() => {
		// 			if (route.query?.fa > 0) {
		// 				this.dexStore.DEX_SEND_AMOUNT(Number(route.query?.fa))
		// 			} else if (route.query?.sa > 0) {
		// 				this.dexStore.DEX_RECEIVE_AMOUNT(Number(route.query?.sa))
		// 			}
		// 		}, 10)
		// 	} else if (route.query?.ft) {
		// 		let first = mergeTokens.find((item) => item.symbol === route.query?.ft)
		// 		if (first) {
		// 			this.dexStore.DEX_SEND_TOKEN(first)
		// 		}
		// 		setTimeout(() => {
		// 			if (route.query?.fa > 0) {
		// 				this.dexStore.DEX_SEND_AMOUNT(Number(route.query?.fa))
		// 			} else if (route.query?.sa > 0) {
		// 				this.dexStore.DEX_RECEIVE_AMOUNT(Number(route.query?.sa))
		// 			}
		// 		}, 10)
		// 	} else { // Если нет параметров установить TON как SEND token
		// 		let findToken = mergeTokens.find((item) => item.type === 'native')
		// 		if (findToken) {
		// 			this.dexStore.DEX_SEND_TOKEN(findToken)
		// 		}
		// 	}
		// },
		async getAccountInfo(wallet) {
			try {
				let balance = await this.getBalanceWithRetry(wallet)
				let walletInfo = {
					address: wallet.address,
					balance: Number(balance),
				}

				let mergedTokens = await this.mergeTonTokens(walletInfo)
				this.dexStore.DEX_USER_TOKENS(mergedTokens)
			} catch (err) {
				console.log(err)
			}
		},
		async getBalanceWithRetry(wallet) {
			try {
				return await this.getBalance(wallet);
			} catch (err) {
				await new Promise(resolve => setTimeout(resolve, 2000));
				return await this.getBalanceFromTonApi(wallet);
			}
		},
		async getBalance(wallet) {
			try {
				return await this.dexApiV2.getBalance(wallet.address)
			} catch (err) {
				throw err
			}
		},
		async getBalanceFromTonApi(wallet) {
			try {
				let res = await this.tonApi.getTonWalletInfo(wallet.address);
				return res?.balance
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

			this.tonConnectUi.setConnectRequestParameters({state: 'loading'});

			this.tokensApi.generateTonProofPayload().then((data) => {
				const payload = data.data;

				this.tonConnectUi.setConnectRequestParameters({
					state: 'ready',
					value: {tonProof: payload},
				});
			});
		},
		async getUserSettings() {
			try {
				const settings = await this.dexApiV2.readStorage(
					this.dexStore.GET_DEX_WALLET?.address,
					this.GET_PROOF_VERIFICATION
				);
				if (settings.body?.dexSettings && settings.body?.globalSettings) {
					this.SAVE_USER_SETTINGS(settings.body);
				} else {
					await this.setDefaultSettings();
				}
			} catch (err) {
				console.error(err);
			}
		},

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
					this.GET_PROOF_VERIFICATION,
					{globalSettings: global, dexSettings: dex}
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
		this.setUserLanguage()
		this.getPinnedTokens()
		let tonConnectStorage = JSON.parse(localStorage.getItem('ton-connect-storage_bridge-connection'))
		let walletInfoStorage = JSON.parse(localStorage.getItem('ton-connect-ui_wallet-info'))
		let wallet = tonConnectStorage?.connectEvent?.payload?.items[0]
		let proof = JSON.parse(localStorage.getItem('tonProof_ver'))
		if (wallet) {
			wallet.userFriendlyAddress = toUserFriendlyAddress(wallet?.address)
			wallet.imgUrl = walletInfoStorage?.imageUrl
			if (tonConnectStorage) {
				this.DEX_WALLET(wallet)
				console.log(wallet)
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
		GET_THEME: {
			handler() {
				this.changeMetaTheme()
			}
		},
		getRouteName: {
			handler() {

			}
		}
	}
}
</script>

<style>
@import "@/components/ui/variables.css";
@import url('https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700;1,900&display=swap');

* {
	margin: 0;
	padding: 0;
	box-sizing: border-box;
}

html {
	scroll-behavior: smooth;
	overflow-y: scroll;
}

body {
	overflow-x: hidden;
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
