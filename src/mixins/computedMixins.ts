import { useDexStore } from "@/stores/dex";

export default {
    computed: {
        dexStore() {
            return useDexStore();
        },
        getRouteName(): string {
            const path: string = window.location.pathname;

            if (path.startsWith("/dex")) return "Dex";
            if (path.startsWith("/limit")) return "Limit";
            if (path.startsWith("/dca")) return "Dca";

            return "e";
        },
        getTrimAddress(): string {
            const address: string | undefined = this.dexStore.GET_DEX_WALLET?.userFriendlyAddress;
            if (!address) return "";

            const stringLength = 4;
            return `${address.substring(0, stringLength)}...${address.substring(address.length - stringLength)}`;
        },
    },
};
