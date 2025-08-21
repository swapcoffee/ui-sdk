import { dexService } from "@/api/coffeeApi/services";
import {stakingConditionByToken, routeConditionByAmounts} from '@/helpers/swap-routing';
import {Address} from '@ton/core';
import {isInsideWalletBrowser} from '@/helpers/dex/embedded-wallets.js';
import {useDexSettingsStore} from "@/stores/dex/settings.ts";
import { useDexStore } from "@/stores/dex";

let routeRequestCounter = 0;
let abortController = null

export const TSTON_ADDRESS = Address.parse("EQC98_qAmNEptUtPc7W6xdHh_ZHrBUFpw5Ft_IzNU20QAJav").toString()

function saveNewMaxSplits(wallet, maxSplits) {
    const store = useDexSettingsStore()

    if (wallet?.version) {
        let defaultSplits = wallet?.version >= 5 ? 20 : 4;
        store.DEX_MAX_SPLITS(parseInt(maxSplits) || defaultSplits);
    }
}

function getPoolSelector(maxVolatility, liquiditySources) {
    const result = {
        dexes: liquiditySources,
    };

    if (Number(maxVolatility) !== -1) {
        result.max_volatility = maxVolatility / 100;
    }

    return result;
}

function setAssetForCompare(data) {
    let {
        wallet,
        tokens,
        amounts,
        maxIntermediate,
        maxVolatility,
        maxSplits,
        swapMode,
        liquiditySources,
        mevProtection,
    } = data;

    const referralName = getReferralName()

    if (wallet?.version && wallet?.version < 5 && referralName === 'tonkeeper') {
        maxSplits = 3;
        console.log('Configured max_splits due to v4 wallet and tonkeeper.');
    }

    const asset = {
        input_token: createTokenAsset(tokens?.first?.address),
        output_token: createTokenAsset(tokens?.second?.address),
        max_length: maxIntermediate + 2,
        pool_selector: getPoolSelector(maxVolatility, liquiditySources),
        max_splits: maxSplits,
        additional_data: null,
        mev_protection: mevProtection
    };

    swapMode === 'default'
        ? asset.input_amount = Number(amounts.first)
        : asset.output_amount = Number(amounts.second);

    if (wallet !== null) {
        const userAddress = Address.parseRaw(wallet?.address).toString();

        asset.additional_data = {
            sender_address: userAddress,
            referral_name: isInsideWalletBrowser('tonkeeper') ? 'tonkeeper' : referralName,
        };
    }

    return asset;
}

function setAssetForSmartCompare(data) {
    let {wallet, maxSplits, tokens, swapMode, amounts} = data;
    const referralName = getReferralName()

    if (wallet?.version && wallet?.version < 5 && referralName === 'tonkeeper') {
        maxSplits = 3;

        console.log('Configured max_splits due to v4 wallet and tonkeeper.');
    }

    const asset = {
        input_token: createTokenAsset(tokens?.first?.address),
        output_token: createTokenAsset(tokens?.second?.address),
        max_splits: maxSplits,
    }

    swapMode === 'default'
        ? asset.input_amount = Number(amounts.first)
        : asset.output_amount = Number(amounts.second);


    if (wallet !== null) {
        const userAddress = Address.parseRaw(wallet?.address).toString();

        asset.additional_data = {
            sender_address: userAddress,
            referral_name: isInsideWalletBrowser('tonkeeper') ? 'tonkeeper' : referralName,
        };
    }

    return asset
}

function setAssetForMultiCompare(data) {
    let {wallet, maxSplits, maxVolatility, maxIntermediate, liquiditySources, inputAssets, outputAsset, mevProtection} = data

    const referralName = getReferralName()

    if (wallet?.version && wallet?.version < 5 && referralName === 'tonkeeper') {
        maxSplits = 3;

        console.log('Configured max_splits due to v4 wallet and tonkeeper.');
    }

    const body = {
        input_assets: inputAssets,
        output_asset: outputAsset,
        max_splits: maxSplits,
        max_length: maxIntermediate + 2,
        pool_selector: getPoolSelector(maxVolatility, liquiditySources),
        mev_protection: mevProtection,
        additional_data: null
    }

    if (wallet !== null) {
        const userAddress = Address.parseRaw(wallet?.address).toString();

        body.additional_data = {
            sender_address: userAddress,
            referral_name: isInsideWalletBrowser('tonkeeper') ? 'tonkeeper' : referralName,
        };
    }

    return body
}

function getReferralName() {
    return JSON.parse(sessionStorage.getItem('referral_name'));
}

function createTokenAsset(address) {
    const tokenAddress = address !== 'native'
        ? Address.parse(address).toString()
        : 'native'

    return {
        blockchain: 'ton',
        address: tokenAddress
    }
}

// Для Smart Mode вешается таймаут в refreshHandlers вместо интервала внутри функции (setRefreshInterval).
// Так же (setRefreshInterval) привязан к методу vue (startRoutingUpdater) прокидывается в compareTokens ниже как (smartRoutingUpdater) и перевызывается в блоке finally.
// Тот же самый метод используется в компоненте при возвращении на вкладку браузера. Слушатель tabVisability.

// Разница между смарт модом и дефолт роутом, в пропсах из vue компонента.

export async function compareTokens(data) {
    let { amounts, changePoolNotFound, changeRefreshInfo, smartRoutingUpdater = null, isSmartMode = false } = data;
    const store = useDexStore()
    try {
        changePoolNotFound(false);
        changeRefreshInfo(true);

        if (abortController) abortController.abort('Reuse http request')
        abortController = new AbortController()

        const requestData = isSmartMode
            ? setAssetForSmartCompare(data)
            : setAssetForCompare(data);

        const isLiquidStakingPool = await stakingConditionByToken(requestData?.input_token?.address, requestData?.output_token?.address);

        if (isLiquidStakingPool) {
            store.DEX_STAKING_POOL(isLiquidStakingPool);
        }

        const requestKey = ++routeRequestCounter;

        if (routeConditionByAmounts(amounts)) {
            const routeInfoResponse = isSmartMode
                ? await dexService.getSmartRoute(requestData, abortController?.signal)
                : await dexService.getRoute(requestData, abortController?.signal);

            // const routeData = isSmartMode
            //     ? routeInfoResponse
            //     : routeInfoResponse.data;

            if (routeRequestCounter === requestKey) {
                if (Array.isArray(routeInfoResponse?.paths) && routeInfoResponse?.paths.length > 0) {
                    store.DEX_DEAL_CONDITIONS(routeInfoResponse);
                } else {
                    changePoolNotFound(true);
                }
            } else {
                console.warn('Ignoring route result response: counter mismatch');
            }
        }
    } catch (err) {
        console.error(err);
    } finally {
        setTimeout(() => {
            changeRefreshInfo(false);
        }, 800);
        if (isSmartMode && smartRoutingUpdater) {
            smartRoutingUpdater()
        }
    }
}

export async function multiCompare(data) {
    let {changePoolNotFound, changeRefreshInfo} = data

    const store = useDexStore()
    try {
        changePoolNotFound(false);
        changeRefreshInfo(true);

        if (abortController) abortController.abort('Reuse http request')
        abortController = new AbortController()

        const body = setAssetForMultiCompare(data);
        const res = await dexService.getMultiRoute(body, abortController?.signal);

        if (Array.isArray(res?.routes) && res.routes.length > 0) {
            store.DEX_DEAL_CONDITIONS(res);
        } else {
            changePoolNotFound(true);
        }

    } catch (err) {
        console.error(err)
    } finally {
        setTimeout(() => {
            changeRefreshInfo(false);
        }, 800);
    }
}
