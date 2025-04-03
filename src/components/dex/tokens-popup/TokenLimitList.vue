<template>
  <ul class="tokens-popup__list" v-if="tokensList.length > 0">
    <li class="tokens-popup__list-title">
      {{ title }}
    </li>
    <TokenItem
      v-for="(item, index) in tokensList"
      :key="index"
      :item="item"
      :userPinnedTokens="userPinnedTokens"
      :userUnpinnedTokens="userUnpinnedTokens"
      :tonPrice="tonPrice"
      :class="{ active_item: isActiveItem(item) }"
      @click="$emit('chooseToken', item)"
    />
  </ul>
</template>

<script>
import TokenItem from "@/components/dex/tokens-popup/TokenItem.vue";

export default {
    name: "TokenLimitList",
    components: {
        TokenItem,
    },
    props: {
        mode: {
            type: String,
            default() {
                return ''
            }
        },
        title: {
            type: String,
            default() {
                return ''
            }
        },
        tokensList: {
            type: Array,
            required: true,
        },
        userPinnedTokens: {
            type: Array,
            default() {
                return []
            }
        },
        userUnpinnedTokens: {
            type: Array,
            default() {
                return []
            }
        },
        tonPrice: {
            type: Number,
            default() {
                return 0
            }
        }
    },
    data() {
        return {}
    },
    computed: {
        ...mapGetters([
            'GET_LIMIT_FIRST_TOKEN',
            'GET_LIMIT_SECOND_TOKEN'
        ])
    },
    methods: {
        isActiveItem(item) {
            return this.mode === 'SEND' && this.GET_LIMIT_FIRST_TOKEN?.symbol === item.symbol ||
                this.mode === 'RECEIVE' && this.GET_LIMIT_SECOND_TOKEN?.symbol === item.symbol;
        }
    }
}
</script>

<style scoped>
    .tokens-popup__list {
        margin-top: 20px;
    }

    .tokens-popup__list-title {
        margin-bottom: 10px;
        padding: 0 20px;
        font-size: 14px;
        opacity: 0.8;
    }
</style>
