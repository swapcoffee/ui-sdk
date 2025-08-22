import { entityService } from "@/api/coffeeApi/services";
import { useDexStore } from "@/stores/dex";
import { getActivePinia } from "pinia";

function getStore(storeHook: any) {
	const pinia = getActivePinia();
	if (!pinia) {
		console.error('Pinia is not initialized.');
		return null;
	}
	return storeHook();
}

export async function stakingConditionByToken(firstAddress: any, secondAddress: any) {
	const dexStore = getStore(useDexStore);
	const liquidStakingPools = dexStore?.GET_LIQUID_STAKING_POOLS || [];
	let pool: any = null

	liquidStakingPools.forEach((item: any) => {
		const baseAddress = item?.base_token?.address?.address;
		const liquidAddress = item?.liquid_token?.address?.address;

		if (baseAddress === firstAddress && liquidAddress === secondAddress) {
			pool = {...item, mode: 'stake'};
		}

		if (baseAddress === secondAddress && liquidAddress === firstAddress) {
			pool = {...item, mode: 'unstake'};
		}
	});

	if (pool?.address && pool?.mode === 'unstake') {
		try {
			let res = await entityService.getLiquidStakingPoolByAddress(pool?.address);
			pool = {...pool, ...res?.stats};
		} catch(err) {
			throw err;
		}
	}

	return pool;
}

export function routeConditionByAmounts(tokenAmounts: any) {
	return (
		tokenAmounts.first || tokenAmounts.second &&
		(Number(tokenAmounts.first) > 0 || Number(tokenAmounts.second) > 0)
	);
}

export function readyCompareCondition(tokens: any, amounts: any) {
	return tokens.first !== null &&
		tokens.second !== null &&
		(amounts.first > 0 || amounts.second > 0);
}

export function readyMultiCompareCondition(tokens: any, amounts: any) {
	let result = true;
	if (tokens === null || amounts === null) {
		return false;
	}

	tokens.forEach((value: any, key: any) => {
		if (!amounts.hasOwnProperty(key) || amounts[key] <= 0 || value === null) {
			result = false;
		}
	});

	return result;
}