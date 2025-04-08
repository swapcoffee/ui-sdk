export function stakingConditionByToken(token) {
    return token &&
        typeof token === 'object' &&
        token.hasOwnProperty('stacking_pool_id') &&
        token.stacking_pool_id !== null
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
