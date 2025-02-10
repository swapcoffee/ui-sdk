<template>
  <li class="tokens-popup__item">
    <div class="item__group">
      <div class="item__image-block">
        <img :src="item?.image" alt="Token logo in TON blockchain" class="item__image"
             v-if="item?.image !== 'null'">
        <img src="@/assets/dex/default.svg" alt="token without logo" class="item__image" v-else>
        <!--				<div class="empty-image" v-else>-->
        <!--					<p class="empty__image-text">?</p>-->
        <!--				</div>-->
      </div>
      <div class="item__info">
        <div class="item__info-group">
          <p class="item__name">{{ item?.symbol }}</p>
          <!--					v-if="item?.imported === true"-->
          <a :href="`https://tonviewer.com/${item?.address}`" target="_blank" class="item__link"
             v-if="item?.address !== 'native'">
            <!--						<img src="@/assets/dex/token-link.svg" alt="link icon" class="item__link-icon">-->
            <svg class="item__link-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16"
                 viewBox="0 0 16 16" fill="none">
              <path
                  d="M13.3333 7.33333C13.1565 7.33333 12.987 7.40357 12.8619 7.5286C12.7369 7.65362 12.6667 7.82319 12.6667 8V12C12.6667 12.1768 12.5964 12.3464 12.4714 12.4714C12.3464 12.5964 12.1768 12.6667 12 12.6667H4C3.82319 12.6667 3.65362 12.5964 3.5286 12.4714C3.40357 12.3464 3.33333 12.1768 3.33333 12V4C3.33333 3.82319 3.40357 3.65362 3.5286 3.5286C3.65362 3.40357 3.82319 3.33333 4 3.33333H8C8.17681 3.33333 8.34638 3.2631 8.4714 3.13807C8.59643 3.01305 8.66667 2.84348 8.66667 2.66667C8.66667 2.48986 8.59643 2.32029 8.4714 2.19526C8.34638 2.07024 8.17681 2 8 2H4C3.46957 2 2.96086 2.21071 2.58579 2.58579C2.21071 2.96086 2 3.46957 2 4V12C2 12.5304 2.21071 13.0391 2.58579 13.4142C2.96086 13.7893 3.46957 14 4 14H12C12.5304 14 13.0391 13.7893 13.4142 13.4142C13.7893 13.0391 14 12.5304 14 12V8C14 7.82319 13.9298 7.65362 13.8047 7.5286C13.6797 7.40357 13.5101 7.33333 13.3333 7.33333Z"
                  fill="white"/>
              <path
                  d="M10.6668 3.33333H11.7201L7.52679 7.52C7.4643 7.58198 7.41471 7.65571 7.38086 7.73695C7.34702 7.81819 7.32959 7.90533 7.32959 7.99333C7.32959 8.08134 7.34702 8.16848 7.38086 8.24972C7.41471 8.33096 7.4643 8.40469 7.52679 8.46667C7.58876 8.52915 7.6625 8.57875 7.74374 8.61259C7.82498 8.64644 7.91211 8.66387 8.00012 8.66387C8.08813 8.66387 8.17527 8.64644 8.25651 8.61259C8.33775 8.57875 8.41148 8.52915 8.47346 8.46667L12.6668 4.28V5.33333C12.6668 5.51014 12.737 5.67971 12.8621 5.80474C12.9871 5.92976 13.1566 6 13.3335 6C13.5103 6 13.6798 5.92976 13.8049 5.80474C13.9299 5.67971 14.0001 5.51014 14.0001 5.33333V2.66667C14.0001 2.48986 13.9299 2.32029 13.8049 2.19526C13.6798 2.07024 13.5103 2 13.3335 2H10.6668C10.49 2 10.3204 2.07024 10.1954 2.19526C10.0704 2.32029 10.0001 2.48986 10.0001 2.66667C10.0001 2.84348 10.0704 3.01305 10.1954 3.13807C10.3204 3.2631 10.49 3.33333 10.6668 3.33333Z"
                  fill="white"/>
            </svg>
          </a>
          <InterfaceTag
              v-for="(tag, index) in getPriorityTag"
              :key="index"
              :tag="tag.name"
              :color="tag.color"
          />
        </div>
        <div class="item__group"
             v-if="status !== 'unlisted' && item?.imported !== true && hasData"
        >
          <svg class="item__price-arrow up-price" v-if="item?.price_change_24h > 0"
               xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path
                d="M11.779 8.91735C11.7459 8.9973 11.6898 9.06564 11.6179 9.11373C11.546 9.16182 11.4614 9.18749 11.3749 9.18751H2.62486C2.53828 9.18758 2.45362 9.16195 2.38161 9.11389C2.3096 9.06582 2.25348 8.99746 2.22033 8.91748C2.18719 8.83749 2.17853 8.74947 2.19544 8.66456C2.21235 8.57965 2.25407 8.50166 2.31532 8.44048L6.69032 4.06548C6.73096 4.0248 6.77921 3.99253 6.83232 3.97051C6.88543 3.9485 6.94236 3.93716 6.99986 3.93716C7.05735 3.93716 7.11428 3.9485 7.16739 3.97051C7.2205 3.99253 7.26876 4.0248 7.30939 4.06548L11.6844 8.44048C11.7456 8.5017 11.7872 8.57968 11.804 8.66456C11.8209 8.74945 11.8122 8.83742 11.779 8.91735Z"
                fill="#55FF85"/>
          </svg>
          <svg class="item__price-arrow down-price" v-else xmlns="http://www.w3.org/2000/svg" width="14"
               height="14" viewBox="0 0 14 14" fill="none">
            <path
                d="M11.779 5.08265C11.7459 5.0027 11.6898 4.93436 11.6179 4.88627C11.546 4.83818 11.4614 4.81251 11.3749 4.81249H2.62486C2.53828 4.81242 2.45362 4.83805 2.38161 4.88611C2.3096 4.93418 2.25348 5.00254 2.22033 5.08252C2.18719 5.16251 2.17853 5.25053 2.19544 5.33544C2.21235 5.42035 2.25407 5.49834 2.31532 5.55952L6.69032 9.93452C6.73096 9.9752 6.77921 10.0075 6.83232 10.0295C6.88543 10.0515 6.94236 10.0628 6.99986 10.0628C7.05735 10.0628 7.11428 10.0515 7.16739 10.0295C7.2205 10.0075 7.26876 9.9752 7.30939 9.93452L11.6844 5.55952C11.7456 5.4983 11.7872 5.42032 11.804 5.33544C11.8209 5.25055 11.8122 5.16258 11.779 5.08265Z"
                fill="#FF5449"/>
          </svg>
          <p class="item__price price-for-one"
             :class="item?.price_change_24h > 0 ? 'up-price' : 'down-price'"
          >
            {{ getTokenPrice }}
          </p>
          <div class="item__group"
               v-show="item?.type !== 'native'"
          >
            <div class="info-line"></div>
            <svg class="item__icon" xmlns="http://www.w3.org/2000/svg" width="14" height="14"
                 viewBox="0 0 14 14" fill="none">
              <path opacity="0.8" fill-rule="evenodd" clip-rule="evenodd"
                    d="M3.24981 3.61111C3.11222 3.61111 3.02649 3.76615 3.09582 3.8896L6.46518 9.88944V3.61111H3.24981ZM7.53483 3.61111V9.88944L10.9042 3.8896C10.9735 3.76615 10.8878 3.61111 10.7502 3.61111H7.53483ZM2.17188 4.44946C1.68657 3.58528 2.28666 2.5 3.24981 2.5H10.7502C11.7133 2.5 12.3134 3.58528 11.8281 4.44946L7.46197 12.2244C7.36613 12.3951 7.19023 12.5 7 12.5C6.80978 12.5 6.63388 12.3951 6.53803 12.2244L2.17188 4.44946Z"
                    fill="white"/>
            </svg>
            <p class="item__tvl-count">{{ getTokenTvl }}</p>
            <div class="info-line"></div>
            <svg class="item__icon" xmlns="http://www.w3.org/2000/svg" width="14" height="14"
                 viewBox="0 0 14 14" fill="none">
              <g opacity="0.8">
                <path
                    d="M12.6286 11.5937C11.7957 10.1538 10.5121 9.12132 9.01426 8.63187C9.75518 8.19079 10.3308 7.51869 10.6528 6.71879C10.9748 5.91888 11.0253 5.0354 10.7966 4.20402C10.5678 3.37263 10.0725 2.63932 9.38667 2.11669C8.70083 1.59405 7.86239 1.311 7.00012 1.311C6.13784 1.311 5.29941 1.59405 4.61357 2.11669C3.92773 2.63932 3.43241 3.37263 3.20368 4.20402C2.97495 5.0354 3.02545 5.91888 3.34742 6.71879C3.6694 7.51869 4.24505 8.19079 4.98598 8.63187C3.48809 9.12077 2.20457 10.1533 1.37168 11.5937C1.34114 11.6435 1.32088 11.699 1.3121 11.7567C1.30332 11.8145 1.3062 11.8734 1.32056 11.93C1.33493 11.9867 1.36049 12.0399 1.39574 12.0864C1.43099 12.133 1.47521 12.1721 1.5258 12.2013C1.57639 12.2305 1.63232 12.2493 1.69029 12.2566C1.74826 12.2638 1.8071 12.2594 1.86333 12.2436C1.91956 12.2277 1.97205 12.2008 2.0177 12.1643C2.06334 12.1278 2.10122 12.0826 2.1291 12.0312C3.15941 10.2506 4.98051 9.18749 7.00012 9.18749C9.01973 9.18749 10.8408 10.2506 11.8711 12.0312C11.899 12.0826 11.9369 12.1278 11.9825 12.1643C12.0282 12.2008 12.0807 12.2277 12.1369 12.2436C12.1931 12.2594 12.252 12.2638 12.3099 12.2566C12.3679 12.2493 12.4238 12.2305 12.4744 12.2013C12.525 12.1721 12.5692 12.133 12.6045 12.0864C12.6397 12.0399 12.6653 11.9867 12.6797 11.93C12.694 11.8734 12.6969 11.8145 12.6881 11.7567C12.6794 11.699 12.6591 11.6435 12.6286 11.5937ZM3.93762 5.24999C3.93762 4.64429 4.11723 4.05218 4.45374 3.54856C4.79025 3.04493 5.26855 2.6524 5.82815 2.42061C6.38775 2.18882 7.00351 2.12817 7.59758 2.24634C8.19165 2.3645 8.73733 2.65618 9.16563 3.08448C9.59393 3.51278 9.8856 4.05846 10.0038 4.65253C10.1219 5.2466 10.0613 5.86236 9.8295 6.42196C9.5977 6.98156 9.20518 7.45986 8.70155 7.79637C8.19793 8.13288 7.60582 8.31249 7.00012 8.31249C6.18816 8.31162 5.4097 7.98869 4.83556 7.41455C4.26142 6.84041 3.93849 6.06195 3.93762 5.24999Z"
                    fill="white"/>
              </g>
            </svg>
            <p class="item__holders-count">{{ getTokenHolders }}</p>
          </div>
        </div>
        <div class="item__holders-count" v-if="!hasData"> {{ $t("dexTokens.noData") }} </div>
        <p class="item__status" v-if="status === 'unlisted'">Not on the list</p>
        <div class="import__info" v-if="item?.imported === true">
          <p class="item__holders-count">Imported</p>
          <div class="info-line"></div>
          <p class="item__status remove__import" @click="removeImportedToken(item, $event)"> Remove </p>
        </div>
      </div>
    </div>
    <div class="item__group">
      <div class="item__info">
        <p class="item__balance">
          {{ getTokenBalance }}
        </p>
        <p class="item__price">{{ getTotalPrice }}</p>
      </div>
      <div class="item__pin-group"
           v-if="status !== 'unlisted'"
      >
        <button class="item__pin-btn"
                @click.stop="pinToken(item)"
                :disabled="userPinnedTokens.length === 3"
                v-show="!checkItemIsPinned(item)"
        >
          <svg class="item__pin-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16"
               viewBox="0 0 16 16" fill="none">
            <path
                d="M14.7077 5.0856L10.9146 1.2931C10.8217 1.20021 10.7115 1.12653 10.5902 1.07626C10.4688 1.026 10.3388 1.00012 10.2074 1.00012C10.0761 1.00012 9.94602 1.026 9.82468 1.07626C9.70334 1.12653 9.59309 1.20021 9.50023 1.2931L6.14836 4.6556C5.48211 4.44685 3.96086 4.19497 2.37336 5.47685C2.26393 5.56483 2.17427 5.67488 2.11019 5.79981C2.04612 5.92475 2.00907 6.06178 2.00147 6.20198C1.99386 6.34219 2.01587 6.48242 2.06605 6.61356C2.11623 6.74469 2.19347 6.86379 2.29273 6.9631L5.31273 9.98185L2.64648 12.6462C2.55266 12.74 2.49995 12.8673 2.49995 13C2.49995 13.1327 2.55266 13.2599 2.64648 13.3537C2.7403 13.4475 2.86755 13.5003 3.00023 13.5003C3.13291 13.5003 3.26016 13.4475 3.35398 13.3537L6.01836 10.6875L9.03648 13.7056C9.12927 13.7988 9.23951 13.8727 9.36092 13.9232C9.48232 13.9738 9.61249 13.9998 9.74398 14C9.76773 14 9.79086 14 9.81461 14C9.95716 13.9901 10.0959 13.9497 10.2214 13.8814C10.347 13.8131 10.4563 13.7186 10.5421 13.6043C11.7696 11.9731 11.6515 10.6468 11.3665 9.85435L14.7084 6.49997C14.8012 6.40707 14.8748 6.29679 14.925 6.17542C14.9753 6.05406 15.0011 5.924 15.001 5.79265C15.001 5.66131 14.975 5.53127 14.9247 5.40995C14.8744 5.28863 14.8007 5.17842 14.7077 5.0856ZM14.0002 5.7931L10.4209 9.38435C10.3469 9.45854 10.2982 9.55408 10.2815 9.65747C10.2648 9.76086 10.2809 9.86689 10.3277 9.9606C10.919 11.1437 10.2152 12.3725 9.74398 12.9993L3.00023 6.25497C3.75523 5.64622 4.47773 5.4856 5.03023 5.4856C5.38081 5.48081 5.7285 5.54958 6.05086 5.68747C6.1449 5.73454 6.25139 5.75075 6.35519 5.73381C6.45898 5.71687 6.55479 5.66763 6.62898 5.5931L10.2077 1.99997L14.0002 5.79247V5.7931Z"
                fill="white"/>
          </svg>
        </button>
        <button class="item__pin-btn"
                @click.stop="unpinToken(item)"
                :disabled="isStaticToken(item)"
                v-show="checkItemIsPinned(item)"
        >
          <svg class="item__pin-icon active-pin" xmlns="http://www.w3.org/2000/svg" width="16" height="16"
               viewBox="0 0 16 16" fill="none">
            <path
                d="M14.7083 6.49996L11.3664 9.85308C11.6514 10.645 11.7695 11.9712 10.542 13.6031C10.4562 13.7178 10.3466 13.8127 10.2207 13.8812C10.0948 13.9497 9.95564 13.9902 9.81267 14C9.78892 14 9.76579 14 9.74204 14C9.61064 14 9.48052 13.9741 9.35912 13.9238C9.23772 13.8735 9.12743 13.7998 9.03454 13.7068L6.01829 10.6875L3.35392 13.3537C3.2601 13.4475 3.13285 13.5002 3.00017 13.5002C2.86749 13.5002 2.74024 13.4475 2.64642 13.3537C2.5526 13.2599 2.49989 13.1326 2.49989 13C2.49989 12.8673 2.5526 12.74 2.64642 12.6462L5.31267 9.98183L2.29392 6.96308C2.19469 6.86373 2.1175 6.7446 2.06737 6.61344C2.01724 6.48228 1.99529 6.34203 2.00296 6.20183C2.01062 6.06163 2.04773 5.92461 2.11186 5.79969C2.17599 5.67478 2.2657 5.56477 2.37517 5.47683C3.96392 4.19496 5.48454 4.44683 6.15017 4.65558L9.50017 1.29371C9.59303 1.20082 9.70328 1.12714 9.82462 1.07687C9.94596 1.02661 10.076 1.00073 10.2074 1.00073C10.3387 1.00073 10.4688 1.02661 10.5901 1.07687C10.7114 1.12714 10.8217 1.20082 10.9145 1.29371L14.7077 5.08621C14.8951 5.27364 15.0005 5.52785 15.0006 5.79295C15.0008 6.05805 14.8956 6.31236 14.7083 6.49996Z"
                fill="white"/>
          </svg>
        </button>
      </div>
    </div>
  </li>
</template>

<script lang="ts">
import { useDexStore } from "@/stores/dex";
import methodsMixins from "@/mixins/methodsMixins";
import InterfaceTag from "@/components/ui/InterfaceTag.vue";

export default {
  name: "TokenItem",
  components: {InterfaceTag},
  mixins: [methodsMixins],
  data() {
      return {
        activeTags: [],
      }
  },
  props: {
    item: {
      type: Object,
      default() {
        return {}
      },
      required: true
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
    status: {
      type: String,
      default() {
        return ''
      }
    },
    tonPrice: {
      type: Number,
      default() {
        return 0
      }
    },
    activeFilter: {
      type: Object,
      default() {
        return {}
      }
    },
  },
  computed: {
    dexStore() {
      return useDexStore();
    },
    getPriorityTag() {
      if (this.activeTags.length <= 1) {
        return this.activeTags
      } else if (this.activeTags.length > 1) {
        let priorityTags = this.activeTags.sort((a, b) => b.id - a.id)
        if (this.activeFilter.name === 'all') {
          return [priorityTags[0]]
        } else {
          return [this.activeFilter]
        }
      }
    },
    hasData() {
      if (this.status === 'unlisted' || this.item?.imported === true) {
        return false;
      }

      return (
          this.getTokenPrice !== '$0' ||
          Number(this.getTokenTvl) > 0 ||
          Number(this.getTokenHolders) > 0 ||
          Number(this.getTotalPrice) > 0
      );
    },
    getTokenPrice() {
      let value = this.item?.price_usd
      if (value) {
        if (value >= 1000) {
          let filteredNum = this.prettyNumber(value, 2)
          return `$${filteredNum}`
        } else if (Number.isInteger(value)) {
          return `$${value}`
        } else if (Number(value.toFixed(2)) > 0.01) {
          return `$${value.toFixed(2)}`
        } else if (Number(value.toFixed(4)) > 0.0001) {
          return `$${value.toFixed(4)}`
        } else {
          return `$${value.toFixed(4)}`
        }
      } else {
        return `$0`
      }
    },
    getTotalPrice(): string {
      const total = this.item?.price_usd * this.item?.balance || 0;
      if (total > 1000) {
        return `$${this.filterNumber(total.toFixed(2))}`;
      } else {
        return `$${total.toFixed(2)}`;
      }
    },
    getTokenTvl() {
      if (this.item?.tvl) {
        let tvlInTon = this.item?.tvl / this.tonPrice
        let reduceNum = this.filterBalance(tvlInTon)
        if (typeof reduceNum === 'number') {
          if (Number.isInteger(reduceNum)) {
            return reduceNum
          } else {
            return reduceNum.toFixed(1)
          }
        } else if (typeof reduceNum === 'object') {
          return reduceNum.result + reduceNum.unit
        } else {
          return 0
        }
      } else {
        return 0
      }
    },
    getTokenHolders() {
      if (this.item?.holders_count) {
        let reduceNum = this.filterBalance(this.item?.holders_count)
        if (typeof reduceNum === 'number') {
          if (Number.isInteger(reduceNum)) {
            return reduceNum
          } else {
            return reduceNum.toFixed(1)
          }
        } else if (typeof reduceNum === 'object') {
          return reduceNum.result + reduceNum.unit
        } else {
          return 0
        }
      } else {
        return 0
      }
    },
    getTokenBalance() {
      if (this.item?.balance > 0) {
        let balance = this.item?.balance;

        if (balance > 0 && balance < 0.01) {
          return this.prettyNumber(balance, 6);
        }

        return this.prettyNumber(balance, 2);
      } else {
        return 0;
      }
    },
    GET_PINNED_TOKENS() {
      return this.dexStore.GET_PINNED_TOKENS;
    },
    GET_TON_TOKENS() {
      return this.dexStore.GET_TON_TOKENS;
    },
  },
  methods: {
    pinToken(item: any): void {
      this.$emit("pinToken", item);
    },
    unpinToken(item: any): void {
      this.$emit("unpinToken", item);
    },
    removeImportedToken(importedToken, event) {
      event.stopPropagation();
      event.preventDefault();

      const tokens = JSON.parse(localStorage.getItem('importTokens'))
          .filter(token => token.address !== importedToken.address);
      localStorage.setItem('importTokens', JSON.stringify(tokens));

      this.dexStore.DEX_TON_TOKENS(
          this.dexStore.GET_TON_TOKENS.filter(token => token.address !== importedToken.address)
      );

      if (this.dexStore.GET_SEND_TOKEN?.address === importedToken?.address) {
        this.dexStore.DEX_SEND_TOKEN(
            this.dexStore.GET_TON_TOKENS.find(token => token.address === 'native')
        );

        const url = new URL(window.location.href);
        if (url.searchParams.get('ft') !== 'TON') {
          url.searchParams.set('ft', 'TON');
          window.history.replaceState({}, '', url);
        }
      }
    },
    findLabels() {
      if (this.item.hasOwnProperty("labels")) {
        this.item?.labels.forEach((label) => {
          let find = this.dexStore.GET_TOKEN_LABELS.find((findItem) => label.label_id === findItem.id)
          if (find) {
            this.activeTags.push(find)
          }
        })
      }
    },
    checkItemIsPinned(item: any): boolean {
      const pinTokens = this.GET_PINNED_TOKENS.slice().filter(
          (findItem: any) =>
              !this.userUnpinnedTokens.some(
                  (unpin: any) => unpin.address === findItem.address
              )
      );
      const findItem = this.userPinnedTokens.some(
          (find: any) => find.address === item.address
      );
      const findInStock = pinTokens.some(
          (findToken: any) => findToken.address === item.address
      );

      return findItem || findInStock || item.type === "native";
    },
    isStaticToken(item: any): boolean {
      const staticTokens = [
        "native",
        "0:a5d12e31be87867851a28d3ce271203c8fa1a28ae826256e73c506d94d49edad",
        "0:b113a994b5024a16719f69139328eb759596c38a25f59028b146fecdc3621dfe",
      ];
      return staticTokens.includes(item.address);
    },
  },
  mounted() {
    this.findLabels()
  }
};
</script>
<style scoped>
.tokens-popup__item {
  transition: .2s;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 18px;
  cursor: pointer;
}

.item {
  padding: 10px;
  border-radius: 12px;
  background: var(--iface-white4);
}

.tokens-popup__item:hover {
  background: var(--iface-white6);
}

.active_item {
  opacity: 0.5;
}

.item__info-group {
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.item__group {
  display: flex;
  align-items: center;
}

.item__info {
  display: flex;
  flex-direction: column;
}

.item__image-block {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 34px;
  height: 34px;
  margin-right: 12px;
  border-radius: 100px;
}

.item__image {
  width: 34px;
  height: 34px;
  border-radius: 100px;
}

.empty-image {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 100px;
}

.item__name {
  font-family: Roboto, sans-serif;
  font-weight: 500;
  font-size: 14px;
  line-height: 16px;
  /*max-width: 120px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;*/
}

.item__link {
  display: flex;
  transition: .2s;
  opacity: 0.6;
}

.item__link-icon {
  width: 16px;
  height: 16px;
}

.item__link:hover {
  opacity: 1;
}

.item__balance {
  margin-bottom: 5px;
  font-size: 14px;
  line-height: 16px;
  font-family: Roboto, sans-serif;
  font-weight: 500;
  text-align: end;
}

.item__price {
  font-size: 13px;
  line-height: 16px;
  opacity: 0.8;
  text-align: end;
}

.item__price-arrow {
  margin-right: 4px;
  width: 14px;
  height: 14px;
}

.up-price {
  color: var(--main-green);
}

.down-price {
  color: var(--main-red);
}

.item__stake-tag {
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 8px;
  padding: 4px 6px;
  background: rgba(255, 86, 177, 0.10);
  color: #FF56B1;
  font-size: 12px;
  font-weight: 500;
  max-width: 81px;
  max-height: 23px;
}

.price-for-one {
  margin-right: 6px;
}

.info-line {
  margin-right: 6px;
  width: 1px;
  height: 10px;
  background: var(--iface-white14);
}

.item__tvl-count {
  margin-right: 6px;
  font-size: 13px;
  line-height: 16px;
  opacity: 0.8;
}

.item__holders-count {
  font-size: 13px;
  line-height: 16px;
  opacity: 0.8;
}

.item__icon {
  margin-right: 4px;
  width: 14px;
  height: 14px;
}

.item__status {
  margin-right: 10px;
  font-size: 13px;
  line-height: 16px;
  letter-spacing: 0.4px;
  color: var(--iface-accent-color);
}

.item__pin-btn {
  position: relative;
  z-index: 10;
  all: unset;
  margin-left: 15px;
  padding: 9px 0;
  width: 18px;
  height: 18px;
}

.item__pin-btn:disabled {
  opacity: 0.3;
}

.theme-light svg path {
  fill: #141414;
}

.theme-light .active-pin path {
  fill: var(--iface-accent-color);
}

.theme-light .up-price path {
  fill: var(--main-green);
}

.theme-light .down-price path {
  fill: var(--main-red);
}

.import__info {
  display: flex;
  align-items: center;
  margin: 0;
  gap: 5px;
}

.import__info .item__status {
  margin: 0;
}

.import__info .info-line {
  margin: 0;
}

.remove__import {
  color: var(--main-red);
  transition: 0.2s all;
}

.remove__import:hover {
  text-decoration: underline;
}
</style>
