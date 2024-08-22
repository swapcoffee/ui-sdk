import TonApi from '@/api/tonApi';
import DexApiV2 from "@/api/dexApiV2";
import TokensApi from "@/api/tokensApi";
import GeoApi from "@/api/geoApi";

export default {
    computed: {
        getRouteName() {
            return this.$route?.name;
        },
        tonApi() {
            return new TonApi();
        },
        geoApi() {
            return new GeoApi();
        },
        dexApiV2() {
            return new DexApiV2();
        },
        tokensApi() {
            return new TokensApi();
        },
        getTrimAddress() {
            const address = this.GET_DEX_WALLET?.userFriendlyAddress;
            if (address) {
                const stringLength = 4;
                const firstHalf = address.substring(0, stringLength);
                const secondHalf = address.substring(address.length - stringLength);
                return `${firstHalf}...${secondHalf}`;
            } else {
                return '';
            }
        },
    }
};
