import { Address } from "@ton/core";
import { dexService } from "@/api/coffeeApi/services";
import {compareTokens, TSTON_ADDRESS} from "@/helpers/swap-interface/compare";
import { setTransactionMessage } from "@/helpers/dex/calculate";
import { useDexStore } from "@/stores/dex";
import { useTransactionStore } from "@/stores/transaction";
import {getActivePinia} from "pinia";
import { dispatchSdkEvent } from "@/helpers/events";
import { ReadonlySdkEvent } from "@/utils/consts.ts";

let requestInterval = null

function getStore(storeHook) {
	const pinia = getActivePinia();
	if (!pinia) {
		console.error('Pinia is not initialized.');
		return null;
	}
	return storeHook();
}

let dexStore,
	transactionStore

setTimeout(() => {
	dexStore = getStore(useDexStore);
	transactionStore = getStore(useTransactionStore);
}, 100)

export function clearRequestInterval() {
	clearInterval(requestInterval)
}

function setRequestInterval(trInfo) {
	requestInterval = setInterval( () => {
		checkTransactionStatus(trInfo)
	}, 5_000)
}

function setTransactionParams(dealCondition, trInfo) {
	let cashback = false
	let messages = setTransactionMessage(dealCondition, cashback, trInfo.transactions)

	return {
		validUntil: Math.floor(Date.now() / 1000) + 60, // 60 sec
		messages: messages,
	}
}

async function sendTransaction(tonConnectUi, transaction) {
	try {
		await tonConnectUi.sendTransaction({
            validUntil: Math.floor(Date.now() / 1000) + 60, // 60 sec
			messages: [
				{
					address: transaction.address,
					amount: transaction.value,
					payload: transaction.payload_cell
				}
			]
		})
	} catch(err) {
		throw err
	}
}

export async function stakeTransaction({
	updateProcessing,
	wallet,
	tokens,
	amounts,
	tonConnectUi,
}) {
	try {
		updateProcessing(true, 'stake')
		let sender = Address.parseRaw(wallet?.address).toString()
		let referralName = JSON.parse(sessionStorage.getItem('referral_name'))
		let transaction = await dexService.getStakeTransaction(sender, tokens.second?.address, Number(amounts.first), referralName)

        try {
            await sendTransaction(tonConnectUi, transaction?.data)
        } catch (e) {
            this.tonConnectUi.closeModal('action-cancelled');
        }

		dexStore?.DEX_SEND_AMOUNT(0)
    } catch (err) {
        console.error(err)
	} finally {
		updateProcessing(false, 'stake')
	}
}

export async function unstakeTransaction({
	updateProcessing,
	wallet,
	tokens,
	amounts,
	tonConnectUi
}) {
	try {
		updateProcessing(true, 'unstake')
		let sender = Address.parseRaw(wallet?.address).toString()
		let transaction = await dexService.getUnstakeTransaction(sender, tokens.first?.address, Number(amounts.first))

        try {
            await sendTransaction(tonConnectUi, transaction?.data)
        } catch (e) {
            this.tonConnectUi.closeModal('action-cancelled');
        }

	} catch (err) {
		console.error(err)
	} finally {
		updateProcessing(false, 'unstake')
	}
}

export async function dexTransaction({
                                         updateProcessing,
                                         compareAsset,
                                         wallet,
                                         dealConditions,
                                         slippage,
										 widgetReferral,
										 customFeeSettings,
                                         tonConnectUi,
	                                     mevProtection = false
                                     }) {
    try {
        updateProcessing(true, 'dex');

        await compareTokens(compareAsset);

        const sender = Address.parseRaw(wallet?.address).toString();

        const trInfo = (await dexService.getRouteTransactions(
            dealConditions,
            sender,
            slippage / 100,
						mevProtection,
			widgetReferral,
			customFeeSettings,
        ))?.data;

        transactionStore?.SAVE_SWAP_TRANSACTION_INFO(trInfo);

		dispatchSdkEvent(ReadonlySdkEvent.TRANSACTIONS_BUILT, trInfo)

        try {
            await tonConnectUi.sendTransaction(setTransactionParams(dealConditions, trInfo));
        } catch (e) {
            this.tonConnectUi.closeModal('action-cancelled');
        }

        const transactionStatus = (await dexService.getTransactions(trInfo?.route_id))?.data;

		transactionStore?.SAVE_SWAP_TRANSACTION_STATUS(transactionStatus);

        setRequestInterval(trInfo);

    } catch (err) {
        throw err;
    } finally {
        updateProcessing(false, 'dex');
    }
}

async function checkTransactionStatus(trInfo) {
	try {
		const transactionStatus = (await dexService.getTransactions(trInfo?.route_id))?.data;
		transactionStore?.SAVE_SWAP_TRANSACTION_STATUS(transactionStatus)
	} catch (err) {
		console.error(err);
	}
}
