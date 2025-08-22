import computedMixins from "@/mixins/computedMixins";
import { Address } from "@ton/core";
import { DEXES_BY_ID } from '@/utils/dexes.js';
import { useDexStore } from "@/stores/dex";

export default {
    mixins: [computedMixins],
    computed: {
        dexStore() {
            return useDexStore()
        },
        getRoutes() {
            let paths: any[] = []

            if ((this as any).getRouteName === 'Dex') {
                paths = (this as any).dexStore.dealConditions?.paths || [];
            } else if ((this as any).getRouteName === 'MultiSwap') {
                const routes = (this as any).dexStore.dealConditions?.routes || [];
                routes.forEach((item: any) => {
                    if (item?.paths) {
                        paths.push(...item.paths)
                    }
                })
            }

            const routes: any[] = [];
            let totalInputAmount = 0

            paths.forEach((current: any) => {
                let findToken = (this as any).findTonTokenByAddress(current?.input_token?.address?.address)
                totalInputAmount += (current?.swap?.input_amount * findToken?.price_usd) || 0
            });

            for (const routeStart of paths) {
                const dexSources: any[] = [];
                const tokens: string[] = [];
                const dex = routeStart?.dex;
                if (routeStart?.input_token?.metadata?.symbol) {
                    tokens.push(routeStart.input_token.metadata.symbol);
                }

                const traverse = (current: any) => {
                    if (current?.output_token?.metadata?.symbol) {
                        tokens.push(current.output_token.metadata.symbol);
                    }

                    const dexData = (this as any).getDexSourceDataByName(current?.dex);
                    if (dexData) {
                        dexSources.push(dexData);
                    }

                    if (current?.next?.length > 0) {
                        for (const next of current.next) {
                            if (current?.dex !== next?.dex) {
                                if (next?.input_token?.metadata?.symbol) {
                                    tokens.push(next.input_token.metadata.symbol);
                                }
                            }
                            traverse(next);
                        }
                    }
                };

                traverse(routeStart);

                const uniqueDexSources = dexSources.filter(
                    (dex: any, index: number, arr: any[]) => index === 0 || dex.name !== arr[index - 1].name,
                );

                let findToken = (this as any).findTonTokenByAddress(routeStart?.input_token?.address?.address)
                let calculatePercent = totalInputAmount > 0 
                    ? ((routeStart?.swap?.input_amount * findToken?.price_usd / totalInputAmount) * 100).toFixed(2)
                    : '0.00'

                routes.push({
                    dex: uniqueDexSources,
                    path: tokens.join(' > '),
                    inputPercentage: calculatePercent,
                });
            }
            return routes;
        },
    },
    methods: {
        findTonTokenByAddress(address: string) {
            let find = null

            if (address !== 'native') {
                find = (this as any).dexStore.tonTokens.find((item: any) => item.address === Address.parse(address).toRawString())
            } else {
                find = (this as any).dexStore.tonTokens.find((item: any) => item.address === 'native')
            }

            if (find) {
                return find
            } else {
                return { price_usd: 1 }
            }
        },
        getDexSourceDataByName(name: string) {
            const dex = DEXES_BY_ID.get(name)
            if (dex) {
                return {
                    name: dex.name,
                    imageUrl: dex.icon
                }
            }
            throw new Error('Unknown DEX source name: ' + name);
        },
    },
};
