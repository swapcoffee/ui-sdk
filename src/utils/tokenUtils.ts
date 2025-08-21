import { Address } from '@ton/core';
import { DEFAULT_ADDRESSES } from "@/utils/consts";

export function tonApiJettonToCoffee(jetton, balanceNormalized) {
    return {
        id: null,
        address: jetton.address,
        name: jetton.name,
        symbol: jetton.symbol,
        decimals: jetton.decimals,
        price_usd: 0,
        price_change_24h: 0,
        tvl: 0,
        holders_count: 0,
        listed: jetton?.verification === 'whitelist',
        image: jetton.image,
        external_id: null,
        trust_score: 0, // TODO: fetch from dyor?
        labels: [],
        blockchain_id: 1,
        balance: balanceNormalized,
    };
}

export function normalizeTokenAmount(nano, decimals) {
    const x = Number(nano);

    if (isNaN(x)) return 0;

    return x / Math.pow(10, Number(decimals));
}

export function addressToFriendly(address, isWallet) {
    return Address.parse(address).toString({ bounceable: !isWallet, urlSafe: true });
}

export function normalizeMultichainAddress(address, targetChain, isWallet = false) {
    if (address === "0x0000000000000000000000000000000000000000") {
        return address
    }
    if (targetChain.toLowerCase() === "ton") {
        return addressToFriendly(address, isWallet)
    }

    return address
}

export function toAbsoluteValue(number, decimals) {
    // Convert to string to handle decimal places precisely
    const numberStr = number.toString()

    // Split the number into integer and decimal parts
    const [integerPart, decimalPart = ""] = numberStr.split(".")

    // Calculate how many zeros to add
    const zerosToAdd = Number(decimals) - decimalPart.length

    if (zerosToAdd >= 0) {
        // If we need to add zeros (or exactly the right number of decimal places)
        return BigInt(integerPart + decimalPart + "0".repeat(zerosToAdd))
    } else {
        // If we have more decimal places than needed, we need to truncate
        return BigInt(integerPart + decimalPart.slice(0, Number(decimals)))
    }
}

export function safeToAbsoluteValue(number, decimals) {
    if (typeof number === 'number' && number.toString().includes('e')) {
        const fixed = number.toFixed(Math.max(Number(decimals), 20));
        const cleaned = fixed.replace(/\.?0+$/, '');
        return toAbsoluteValue(cleaned, decimals);
    }
    return toAbsoluteValue(number, decimals);
}

/**
 * Записывает и склеивает токены между собой и кладет в стор
 * @param entries - токены, которые нужно записать
 * @param dexStore - instance of dex store (use useDexStore() in components)
 */
export function writeTokenListEntries(entries, dexStore) {
    if (!dexStore) {
        console.warn('DexStore instance is required for writeTokenListEntries');
        return;
    }

    const currentTokens = [...dexStore.tonTokens];
    const currentUserTokens = [...dexStore.userTokens];
    let userTokensUpdated = false;

    for (const entry of entries) {
        if (DEFAULT_ADDRESSES.includes(entry.address)) {
            continue;
        }
        
        const existingTokenIndex = currentTokens.findIndex(
            (token) => token.address === entry.address,
        );
        
        if (existingTokenIndex !== -1) {
            const currentToken = currentTokens[existingTokenIndex];
            const updatedEntry = Object.assign({}, currentToken, entry);
            const userTokenIndex = currentUserTokens.findIndex(token => token.address === entry.address);

            if (userTokenIndex !== -1) {
                currentUserTokens[userTokenIndex] = updatedEntry;
                userTokensUpdated = true;
            }

            // Update related tokens in store
            if (dexStore.sendToken?.address === entry.address) {
                dexStore.DEX_SEND_TOKEN(updatedEntry);
            }
            if (dexStore.receiveToken?.address === entry.address) {
                dexStore.DEX_RECEIVE_TOKEN(updatedEntry);
            }

            let sendMap = dexStore.sendMultiTokens;
            let firstToken = sendMap ? sendMap.get('first') : null;

            if (firstToken && firstToken.address === entry.address) {
                sendMap.set('first', updatedEntry);
            }

            currentTokens[existingTokenIndex] = updatedEntry;
        } else {
            const newEntry = {
                ...entry,
                balance: entry?.balance > 0 ? entry?.balance : 0
            };

            currentTokens.push(newEntry);
        }
    }

    dexStore.DEX_TON_TOKENS(currentTokens);

    if (userTokensUpdated) {
        dexStore.DEX_USER_TOKENS(currentUserTokens);
    }
}
