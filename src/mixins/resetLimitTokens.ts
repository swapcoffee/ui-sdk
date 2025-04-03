import { useDexStore } from "@/stores/dex";
import { useLimitStore } from "@/stores/limit";

export default {
  computed: {
      dexStore() {
          return useDexStore();
      },
      limitStore() {
          return useLimitStore();
      }
  },
  methods: {
    resetLimitTokens() {
        this.limitStore.LIMIT_FIRST_AMOUNT(0);
        this.limitStore.LIMIT_SECOND_AMOUNT(0);
        const usdtAddress = '0:b113a994b5024a16719f69139328eb759596c38a25f59028b146fecdc3621dfe';
        let native = this.dexStore.GET_TON_TOKENS.find(item => item.address === "native");
        let usdt = this.dexStore.GET_TON_TOKENS.find(item => item.address === usdtAddress);
        this.dexStore.DEX_SEND_TOKEN(native);
        this.dexStore.DEX_RECEIVE_TOKEN(usdt);
    }
  }
}
