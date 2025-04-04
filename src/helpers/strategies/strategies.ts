import { strategiesService } from "@/api/coffeeApi/services";
import { useLimitStore } from "@/stores/limit";
import { getActivePinia } from "pinia";

let interval = null;
let wallet = null;
let proof = null;
let tonConnectUi = null;

function getStore() {
	const pinia = getActivePinia();
	if (!pinia) {
		console.error("Pinia is not initialized. Ensure app.use(pinia) is called.");
		return null;
	}
	return useLimitStore();
}

function setWalletChecker() {
	interval = setInterval(() => {
		checkStrategiesWallet();
	}, 5_000);
}

function setOrderChecker(type) {
	console.log("setOrderChecker");
	interval = setInterval(() => {
		checkOrderHistory(type);
	}, 5_000);
}

export function removeLimitCheckerInterval() {
	clearInterval(interval);
}

export async function checkStrategiesEligible(tonConnect, userWallet, userProof) {
	tonConnectUi = tonConnect;
	wallet = userWallet;
	proof = userProof;

	const store = getStore();
	if (!store) return;

	try {
		let res = await strategiesService.checkUserIsEligible(wallet?.address, proof);
		store.STRATEGIES_ELIGIBLE(res);
		localStorage.setItem("hasEligible", JSON.stringify(res));
	} catch (err) {
		console.error(err);
	}
}

export async function checkStrategiesWallet() {
	const store = getStore();
	if (!store) return;

	try {
		let res = await strategiesService.checkWalletAddress(wallet?.address, proof);
		store.STRATEGIES_WALLET(res?.data);
		localStorage.setItem("hasStrategiesWallet", JSON.stringify(res?.data));

		if (interval) clearInterval(interval);
	} catch (err) {
		console.error(err);
	}
}

export async function createStrategiesWallet(updateProcessing) {
	const store = getStore();
	if (!store) return;

	try {
		updateProcessing(true, "create-wallet");
		let res = await strategiesService.createStrategiesWallet(wallet?.address, proof);

		await tonConnectUi.sendTransaction({
			validUntil: Math.floor(Date.now() / 1000) + 60,
			messages: [
				{
					address: res?.data.address,
					amount: res?.data.value,
					payload: res?.data.payload_cell,
					stateInit: res?.data.state_init,
				},
			],
		});

		setWalletChecker();
	} catch (err) {
		throw err;
	} finally {
		updateProcessing(false, "create-wallet");
	}
}

export async function createOrder(updateProcessing, orderBody) {
	const store = getStore();
	if (!store) return;

	updateProcessing(true, "order");
	try {
		let res = await strategiesService.createOrder(wallet?.address, proof, orderBody);

		await tonConnectUi.sendTransaction({
			validUntil: Math.floor(Date.now() / 1000) + 60,
			messages: [
				{
					address: res?.data?.address,
					amount: res?.data?.value,
					payload: res?.data?.payload_cell,
				},
			],
		});

		setOrderChecker(orderBody?.type);
	} catch (err) {
		throw err;
	} finally {
		updateProcessing(false, "order");
	}
}

export async function cancelOrder(updateProcessing, orderBody) {
	const store = getStore();
	if (!store) return;

	try {
		updateProcessing(true, "cancel");
		let res = await strategiesService.cancelOrderById(wallet?.address, proof, orderBody?.id);

		await tonConnectUi.sendTransaction({
			validUntil: Math.floor(Date.now() / 1000) + 60,
			messages: [
				{
					address: res?.data?.address,
					amount: res?.data?.value,
					payload: res?.data?.payload_cell,
				},
			],
		});

		setOrderChecker(orderBody?.type);
	} catch (err) {
		throw err;
	} finally {
		updateProcessing(false, "cancel");
	}
}

async function checkOrderHistory(type) {
	const store = getStore();
	if (!store) return;

	try {
		let res = await strategiesService.getOrders(wallet?.address, proof, type, true);
		store.LIMIT_HISTORY(res?.data);
	} catch (err) {
		console.error(err);
	}
}
