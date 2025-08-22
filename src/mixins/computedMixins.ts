import { useDexStore } from "@/stores/dex";

export default {
    computed: {
        dexStore() {
            return useDexStore();
        },
        getRouteName(): string {
            const activeTab = this.dexStore.GET_SWAP_ACTIVE_TAB;

            switch (activeTab) {
                case 'Dex':
                    return 'Dex';
                case 'Limit':
                    return 'Limit';
                case 'Dca':
                    return 'Dca';
                case 'MultiSwap':
                    return 'MultiSwap';
                default:
                    return 'Dex'; 
            }
        },
        getTrimAddress(): string {
            const address: string | undefined = this.dexStore.GET_DEX_WALLET?.userFriendlyAddress;
            if (!address) return "";

            const stringLength = 4;
            return `${address.substring(0, stringLength)}...${address.substring(address.length - stringLength)}`;
        },
    },
};
