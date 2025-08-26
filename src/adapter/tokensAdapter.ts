import { normalizeTokenAmount } from "@/utils/tokenUtils.ts";

export function labelV3ToV2(label) {
  return {
    id: label.id,
    name: label.label,
    color: "",
  }
}

const STAKING_POOL_MAPPINGS = {
  "0:bdf3fa8098d129b54b4f73b5bac5d1e1fd91eb054169c3916dfc8ccd536d1000": 2,
  "0:cd872fa7c5816052acdf5332260443faec9aacc8c21cca4d92e7f47034d11892": 1,
  "0:cf76af318c0872b58a9f1925fc29c156211782b9fb01f56760d292e56123bf87": 3,
  "0:92c4664f1ea6b74ed9ce0e031a9fc0843348dfe87a58faea27fcd31e1608caaa": 4
}

export function labelRelationV3ToV2(labelRelation) {
  return {
    label_id: labelRelation.label_id,
  }
}

export function tokenFromV3ToV2(token) {
  const stakingPoolId = STAKING_POOL_MAPPINGS[token.address] || null
  return {
    address: token.address,
    name: token.name,
    symbol: token.symbol,
    decimals: token.decimals,
    price_usd: token.market_stats.price_usd,
    price_change_24h: token.market_stats.price_change_24h,
    tvl: token.market_stats.tvl_usd,
    holders_count: token.market_stats.holders_count,
    listed: true,
    imported: false,
    image: token.image_url,
    external_id: null,
    trust_score: token.market_stats.trust_score,
    stacking_pool_id: stakingPoolId,
    labels: (token.labels || []).map(labelRelationV3ToV2), // TODO: labels
    blockchain_id: 1,
    verification: token.verification,
  }
}

export function tokenBalanceV3ToV2(items) {
    const importedTokens = JSON.parse(localStorage.getItem('importTokens')) || [];

    return items.filter(item => item.jetton).map(item => {
        const token = tokenFromV3ToV2(item.jetton);

        token.balance = normalizeTokenAmount(item.balance, item.jetton.decimals);

        if (importedTokens.some(importedToken => importedToken.address === token.address)) {
            token.imported = true;
        }

        return token;
      });
}
