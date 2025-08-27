import { Address } from '@ton/core';
import { useDexStore } from "@/stores/dex";
import { useLimitStore } from "@/stores/limit";
import { TON_COIN_ADDRESS } from "@/utils/consts.ts";

interface Token {
    id: string | null;
    address: string;
    name: string;
    symbol: string;
    decimals: number;
    price_usd: number;
    price_change_24h: number;
    tvl: number;
    holders_count: number;
    listed: boolean;
    image: string;
    external_id: string | null;
    trust_score: number;
    labels: any[];
    blockchain_id: number;
    balance?: number;
}

interface Jetton {
    address: string;
    name: string;
    symbol: string;
    decimals: number;
    image: string;
    verification?: string;
}

export function tonApiJettonToCoffee(jetton: Jetton, balanceNormalized: number): Token {
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

export function normalizeTokenAmount(nano: string | number | bigint, decimals: number): number {
    const x = Number(nano);

    if (isNaN(x)) return 0;

    return x / Math.pow(10, Number(decimals));
}

export function addressToFriendly(address: string, isWallet: boolean): string {
    return Address.parse(address).toString({ bounceable: !isWallet, urlSafe: true });
}

export function normalizeMultichainAddress(address: string, targetChain: string, isWallet: boolean = false): string {
    if (address === "0x0000000000000000000000000000000000000000") {
        return address
    }
    if (targetChain.toLowerCase() === "ton") {
        return addressToFriendly(address, isWallet)
    }

    return address
}

export function toAbsoluteValue(number: string | number, decimals: number): bigint {
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

export function safeToAbsoluteValue(number: string | number, decimals: number): bigint {
    if (typeof number === 'number' && number.toString().includes('e')) {
        const fixed = number.toFixed(Math.max(Number(decimals), 20));
        const cleaned = fixed.replace(/\.?0+$/, '');
        return toAbsoluteValue(cleaned, decimals);
    }
    return toAbsoluteValue(number, decimals);
}

function rewriteStoreEntry(entry: Token, getter: string, action: string, dexStore: ReturnType<typeof useDexStore>, limitStore?: ReturnType<typeof useLimitStore>) {
    let value: Token | null = null;

    if (getter.startsWith('GET_')) {
        if (getter.includes('SEND_TOKEN') || getter.includes('RECEIVE_TOKEN') || getter.includes('COMMUNITY_TOKENS') ||
            getter.includes('USER_TOKENS') || getter.includes('TON_TOKENS') || getter.includes('POOL_TOKEN') ||
            getter.includes('BOOST_TOKEN') || getter.includes('CREATE_POOL_TOKEN') || getter.includes('MULTI_TOKEN')) {
            value = dexStore[getter as keyof typeof dexStore] as Token | null;
        } else if (getter.includes('LIMIT') && limitStore) {
            value = limitStore[getter as keyof typeof limitStore] as Token | null;
        }
    }

    if (value?.address === entry.address) {
        if (action.startsWith('DEX_') || action.startsWith('SAVE_')) {
            dexStore[action as keyof typeof dexStore](entry);
        } else if (action.startsWith('LIMIT_') && limitStore) {
            limitStore[action as keyof typeof limitStore](entry);
        }
    }
}

/**
 * Записывает и склеивает токены между собой и кладет в стор
 * @param entries - токены, которые нужно записать
 */

const rewritePairs = [
    ['GET_SEND_TOKEN', 'DEX_SEND_TOKEN'],
    ['GET_RECEIVE_TOKEN', 'DEX_RECEIVE_TOKEN'],
    ['GET_LIMIT_FIRST_TOKEN', 'LIMIT_FIRST_TOKEN'],
    ['GET_LIMIT_SECOND_TOKEN', 'LIMIT_SECOND_TOKEN'],
    ['GET_RECEIVE_MULTI_TOKEN', 'SAVE_RECEIVE_MULTI_TOKEN'],
    ['GET_FIRST_POOL_TOKEN', 'SAVE_FIRST_POOL_TOKEN'],
    ['GET_SECOND_POOL_TOKEN', 'SAVE_SECOND_POOL_TOKEN'],
    ['GET_BOOST_TOKEN', 'SAVE_BOOST_TOKEN'],
    ['GET_FIRST_CREATE_POOL_TOKEN', 'SAVE_FIRST_CREATE_POOL_TOKEN'],
    ['GET_SECOND_CREATE_POOL_TOKEN', 'SAVE_SECOND_CREATE_POOL_TOKEN'],
];

const applyRewrite = (token: Token, dexStore: ReturnType<typeof useDexStore>, limitStore?: ReturnType<typeof useLimitStore>) => {
    for (const [getter, mutation] of rewritePairs) {
        rewriteStoreEntry(token, getter, mutation, dexStore, limitStore);
    }
};

export function writeTokenListEntries(
    entries: Token[],
    isCommunity: boolean = false,
    dexStore: ReturnType<typeof useDexStore>,
    limitStore: ReturnType<typeof useLimitStore>
) {
    const currentTokens = isCommunity
        ? dexStore.GET_COMMUNITY_TOKENS
        : dexStore.GET_TON_TOKENS;
    const currentUserTokens = dexStore.GET_USER_TOKENS;
    let userTokensUpdated = false;

    for (const entry of entries) {
        if (entry.address === TON_COIN_ADDRESS) {
            continue
        }

        const existingTokenIndex = currentTokens.findIndex(
            (token: Token) => token.address === entry.address,
        );

        if (existingTokenIndex !== -1) {
            const currentToken = currentTokens[existingTokenIndex];
            const updatedEntry = Object.assign({}, currentToken, entry);
            const userTokenIndex = currentUserTokens.findIndex((token: Token) => token.address === entry.address);

            if (userTokenIndex !== -1) {
                currentUserTokens[userTokenIndex] = updatedEntry;
                userTokensUpdated = true;
            }

            applyRewrite(updatedEntry, dexStore, limitStore);

            let sendMap = dexStore.GET_SEND_MULTI_TOKENS;
            let firstToken = sendMap ? sendMap.get('first') : null;

            if (firstToken && firstToken.address === entry.address) {
                sendMap.set('first', updatedEntry);
            }

            currentTokens[existingTokenIndex] = updatedEntry;
        } else {
            const newEntry: Token = {
                ...entry,
                balance: entry?.balance && entry.balance > 0 ? entry.balance : 0
            };

            applyRewrite(newEntry, dexStore, limitStore);
            currentTokens.push(newEntry);
        }
    }

    if (isCommunity) {
        dexStore.DEX_COMMUNITY_TOKENS(currentTokens);
    } else {
        dexStore.DEX_TON_TOKENS(currentTokens);
    }

    if (userTokensUpdated) {
        dexStore.DEX_USER_TOKENS(currentUserTokens);
    }
}
