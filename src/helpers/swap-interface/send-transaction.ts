import { Address } from "@ton/core";
import { dexService } from "@/api/coffeeApi/services";
import {compareTokens, TSTON_ADDRESS} from "@/helpers/swap-interface/compare";
import { setTransactionMessage } from "@/helpers/dex/calculate";
import { useDexStore } from "@/stores/dex";
import { useTransactionStore } from "@/stores/transaction";
import {getActivePinia} from "pinia";
import { dispatchSdkEvent } from "@/helpers/events";
import { ReadonlySdkEvent } from "@/utils/consts.ts";

// Types for function parameters
type UpdateProcessingFunction = (value: boolean, mode: string) => void;
type Wallet = { address: string; version?: number };
type Tokens = { first?: any; second?: any };
type Amounts = { first: string | number; second: string | number };
type TonConnectUi = { sendTransaction: (params: any) => Promise<void>; closeModal: (reason: string) => void };
type DealConditions = any;
type CompareAsset = any;
type TrackingData = any;
type CustomFeeSettings = any;

let requestInterval: NodeJS.Timeout | null = null

function getStore<T>(storeHook: () => T): T | null {
	const pinia = getActivePinia();
	if (!pinia) {
		console.error('Pinia is not initialized.');
		return null;
	}
	return storeHook();
}

let dexStore: ReturnType<typeof useDexStore> | null = null,
	transactionStore: ReturnType<typeof useTransactionStore> | null = null

let intervalId = setInterval(() => {
	dexStore = getStore(useDexStore);
	transactionStore = getStore(useTransactionStore);
	if(dexStore !== null && transactionStore !== null) {
		clearInterval(intervalId);
	}
}, 500);

export function clearRequestInterval() {
	clearInterval(requestInterval as NodeJS.Timeout)
}

function setRequestInterval(trInfo: any) {
	requestInterval = setInterval( () => {
		checkTransactionStatus(trInfo)
	}, 5_000)
}

function setTransactionParams(dealCondition: DealConditions, trInfo: any) {
	let cashback = false
	let messages = setTransactionMessage(dealCondition, cashback, trInfo.transactions)

	return {
		validUntil: Math.floor(Date.now() / 1000) + 60, // 60 sec
		messages: messages,
	}
}

async function sendTransaction(tonConnectUi: TonConnectUi, transaction: any) {
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
}: {
	updateProcessing: UpdateProcessingFunction;
	wallet: Wallet;
	tokens: Tokens;
	amounts: Amounts;
	tonConnectUi: TonConnectUi;
}) {
	try {
		updateProcessing(true, 'stake')
		let sender = Address.parseRaw(wallet?.address).toString()
		let referralName = JSON.parse(sessionStorage.getItem('referral_name') || 'null')
		let transaction = await dexService.getStakeTransaction(sender, tokens.second?.address, Number(amounts.first), referralName)

        try {
            await sendTransaction(tonConnectUi, transaction)
        } catch (e) {
            tonConnectUi.closeModal('action-cancelled');
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
}: {
	updateProcessing: UpdateProcessingFunction;
	wallet: Wallet;
	tokens: Tokens;
	amounts: Amounts;
	tonConnectUi: TonConnectUi;
}) {
	try {
		updateProcessing(true, 'unstake')
		let sender = Address.parseRaw(wallet?.address).toString()
		let transaction = await dexService.getUnstakeTransaction(sender, tokens.first?.address, Number(amounts.first))

        try {
            await sendTransaction(tonConnectUi, transaction)
        } catch (e) {
            tonConnectUi.closeModal('action-cancelled');
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
                                     }: {
	updateProcessing: UpdateProcessingFunction;
	compareAsset: CompareAsset;
	wallet: Wallet;
	dealConditions: DealConditions;
	slippage: number;
	widgetReferral: any;
	customFeeSettings: CustomFeeSettings;
	tonConnectUi: TonConnectUi;
	mevProtection?: boolean;
}) {
    try {
        updateProcessing(true, 'dex');

        await compareTokens(compareAsset);

        const sender = Address.parseRaw(wallet?.address).toString();

        const trInfo = (await dexService.getRouteTransactions(
            Array.from(dealConditions?.paths),
            sender,
            typeof slippage === 'boolean' ? false : slippage / 100,
            widgetReferral,
            mevProtection,
            customFeeSettings,
        ));


        transactionStore?.SAVE_SWAP_TRANSACTION_INFO(trInfo);

		dispatchSdkEvent(ReadonlySdkEvent.TRANSACTIONS_BUILT, trInfo)

        try {
       //      await tonConnectUi.sendTransaction(setTransactionParams(dealConditions, trInfo));
        } catch (e) {
            tonConnectUi.closeModal('action-cancelled');
        }

        const transactionStatus = (await dexService.getTransactions(trInfo?.route_id));

		transactionStore?.SAVE_SWAP_TRANSACTION_STATUS(transactionStatus);

        setRequestInterval(trInfo);

    } catch (err) {
        throw err;
    } finally {
        updateProcessing(false, 'dex');
    }
}

export async function multiTransaction({
										   updateProcessing,
										   compareAsset,
										   wallet,
										   dealConditions,
										   slippage,
										   tonConnectUi,
										   trackingData,
										   mevProtection = false
									   }: {
	updateProcessing: UpdateProcessingFunction;
	compareAsset: CompareAsset;
	wallet: Wallet;
	dealConditions: DealConditions;
	slippage: number;
	tonConnectUi: TonConnectUi;
	trackingData: TrackingData;
	mevProtection?: boolean;
}) {
	try {
		updateProcessing(true, 'multi');
		// await multiCompare(compareAsset);

		let paths: any[] = []
		dealConditions.routes.forEach((item: any) => {
			paths.push(...item.paths)
		})

		const trInfo = await prebuildTransaction(paths, wallet?.address, slippage, mevProtection)

		const transactionDataToSave = {
			...dealConditions,
			route_id: trInfo?.route_id,
			send_tokens: Array.from(trackingData?.tokens.values()),
			send_amounts: trackingData?.amounts,
			receive_token_symbol: dealConditions?.output_token?.metadata?.symbol,
			receive_token_image: dealConditions?.output_token?.metadata?.image_url,
			receive_amount: dealConditions?.total_output_amount
		}

		transactionStore?.SAVE_SWAP_TRANSACTION_INFO(trInfo);
		localStorage.setItem('transactionInfo', JSON.stringify(transactionDataToSave));

		try {
			await tonConnectUi.sendTransaction(setTransactionParams(paths, trInfo));
		} catch (e) {
			tonConnectUi.closeModal('action-cancelled');
		}

		const transactionStatus = (await dexService.getTransactions(trInfo?.route_id));
		transactionStore?.SAVE_SWAP_TRANSACTION_STATUS(transactionStatus);

		// trackingTransaction(transactionStatus, trackingData);
	} catch (err) {
		throw err;
	} finally {
		updateProcessing(false, 'multi');
	}
}

async function prebuildTransaction(paths: any[], walletAddress: string, slippage: number, mevProtection: boolean) {
	try {
		const sender = Address.parseRaw(walletAddress).toString();
		const referralName = JSON.parse(sessionStorage.getItem('referral_name') || 'null');

		const totalSlippage = typeof slippage === 'boolean'
			? slippage
			: slippage / 100

		let res =  await dexService.getRouteTransactions(
			paths,
			sender,
			totalSlippage,
			referralName,
			mevProtection
		)
		return res
	} catch(err) {
		throw err
	}
}

async function checkTransactionStatus(trInfo: any) {
	try {
		const transactionStatus = (await dexService.getTransactions(trInfo?.route_id));
		transactionStore?.SAVE_SWAP_TRANSACTION_STATUS(transactionStatus)
	} catch (err) {
		console.error(err);
	}
}
