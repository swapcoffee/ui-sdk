import { entityService } from "@/api/coffeeApi/services";
export async function stakingConditionByToken(firstAddress, secondAddress) {
	const liquidStakingPools = store.getters.GET_LIQUID_STAKING_POOLS
	let pool = null

	liquidStakingPools.forEach((item) => {
		const baseAddress = item?.base_token?.address?.address
		const liquidAddress = item?.liquid_token?.address?.address

		if (baseAddress === firstAddress && liquidAddress === secondAddress) {
			pool = {...item, mode: 'stake'}
		}

		if (baseAddress === secondAddress && liquidAddress === firstAddress) {
			pool = {...item, mode: 'unstake'}
		}
	})

	if (pool?.address && pool?.mode === 'unstake') {
		try {
			let res = await entityService.getLiquidStakingPoolByAddress(pool?.address)
			pool = {...pool, ...res?.stats}
		} catch(err) {
			throw err
		}
	}

	return pool
}

export function routeConditionByAmounts(tokenAmounts) {
	return (
		tokenAmounts.first || tokenAmounts.second &&
		(Number(tokenAmounts.first) > 0 || Number(tokenAmounts.second) > 0)
	)
}

export function readyCompareCondition(tokens, amounts) {
	return tokens.first !== null &&
		tokens.second !== null &&
		(amounts.first > 0 || amounts.second > 0)
}

export function readyMultiCompareCondition(tokens, amounts) {
	let result = true;
	if (tokens === null || amounts === null) {
		return false
	}

	tokens.forEach((value, key) => {
		if (!amounts.hasOwnProperty(key) || amounts[key] <= 0 || value === null) {
			result = false;
		}
	})

	return result;
}