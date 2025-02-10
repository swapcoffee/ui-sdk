<template>
	<div class="popup-background"
		@click.self="closePopup"
	>
		<div class="tokens-popup">
			<div class="tokens-popup__wrapper">
				<div class="tokens-popup__menu">
					<p class="tokens-popup__mode-name">{{ titleText }}</p>
					<button class="tokens-popup__close-btn"
							@click="closePopup"
					>
						<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
							<g opacity="0.8">
								<path d="M19.2806 18.2193C19.3502 18.289 19.4055 18.3717 19.4432 18.4628C19.4809 18.5538 19.5003 18.6514 19.5003 18.7499C19.5003 18.8485 19.4809 18.9461 19.4432 19.0371C19.4055 19.1281 19.3502 19.2109 19.2806 19.2806C19.2109 19.3502 19.1281 19.4055 19.0371 19.4432C18.9461 19.4809 18.8485 19.5003 18.7499 19.5003C18.6514 19.5003 18.5538 19.4809 18.4628 19.4432C18.3717 19.4055 18.289 19.3502 18.2193 19.2806L11.9999 13.0602L5.78055 19.2806C5.63982 19.4213 5.44895 19.5003 5.24993 19.5003C5.05091 19.5003 4.86003 19.4213 4.7193 19.2806C4.57857 19.1398 4.49951 18.949 4.49951 18.7499C4.49951 18.5509 4.57857 18.36 4.7193 18.2193L10.9396 11.9999L4.7193 5.78055C4.57857 5.63982 4.49951 5.44895 4.49951 5.24993C4.49951 5.05091 4.57857 4.86003 4.7193 4.7193C4.86003 4.57857 5.05091 4.49951 5.24993 4.49951C5.44895 4.49951 5.63982 4.57857 5.78055 4.7193L11.9999 10.9396L18.2193 4.7193C18.36 4.57857 18.5509 4.49951 18.7499 4.49951C18.949 4.49951 19.1398 4.57857 19.2806 4.7193C19.4213 4.86003 19.5003 5.05091 19.5003 5.24993C19.5003 5.44895 19.4213 5.63982 19.2806 5.78055L13.0602 11.9999L19.2806 18.2193Z" fill="white"/>
							</g>
						</svg>
					</button>
				</div>
				<div class="tokens-popup__block">
					<label for="" class="tokens-popup__label">
<!--						<div class="tokens-popup__search-icon"></div>-->
						<svg class="tokens-popup__search-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="21" viewBox="0 0 20 21" fill="none">
							<g opacity="0.8">
								<path d="M17.9422 17.5579L14.0305 13.6469C15.1642 12.2858 15.7296 10.5399 15.6089 8.77251C15.4883 7.00512 14.6909 5.35229 13.3826 4.15785C12.0744 2.96341 10.356 2.31932 8.58492 2.35957C6.81388 2.39982 5.12653 3.12131 3.87389 4.37395C2.62125 5.62659 1.89976 7.31394 1.85951 9.08498C1.81926 10.856 2.46334 12.5744 3.65779 13.8827C4.85223 15.1909 6.50506 15.9883 8.27244 16.109C10.0398 16.2297 11.7857 15.6643 13.1469 14.5305L17.0578 18.4422C17.1159 18.5003 17.1848 18.5464 17.2607 18.5778C17.3366 18.6092 17.4179 18.6254 17.5 18.6254C17.5821 18.6254 17.6634 18.6092 17.7393 18.5778C17.8152 18.5464 17.8841 18.5003 17.9422 18.4422C18.0003 18.3842 18.0463 18.3152 18.0777 18.2394C18.1092 18.1635 18.1253 18.0822 18.1253 18.0001C18.1253 17.9179 18.1092 17.8366 18.0777 17.7607C18.0463 17.6849 18.0003 17.6159 17.9422 17.5579ZM3.125 9.25006C3.125 8.13754 3.4549 7.05 4.07298 6.12497C4.69106 5.19995 5.56957 4.47898 6.5974 4.05323C7.62524 3.62749 8.75624 3.5161 9.84738 3.73314C10.9385 3.95018 11.9408 4.48591 12.7275 5.27258C13.5141 6.05925 14.0499 7.06153 14.2669 8.15267C14.484 9.24382 14.3726 10.3748 13.9468 11.4027C13.5211 12.4305 12.8001 13.309 11.8751 13.9271C10.9501 14.5452 9.86252 14.8751 8.75 14.8751C7.25866 14.8734 5.82888 14.2802 4.77435 13.2257C3.71981 12.1712 3.12665 10.7414 3.125 9.25006Z" fill="white"/>
							</g>
						</svg>
						<input type="search" class="tokens-popup__input" :placeholder="$t('dexTokens.searchPlaceholder')"
							   :class="{active_input: searchValue.length > 0}"
							   v-model="searchValue"
							   @input="changeInput"
							   @focus="inputFocused"
						>
						<button class="tokens-popup__remove-btn"
								v-show="searchValue.length > 0"
								@click="searchValue = ''"
						></button>
					</label>
				</div>
				<ul class="tokens-popup__pinned-list pinned-list">
					<li class="pinned-list__item"
						v-for="(item, index) in getPinnedList"
						:key="index"
						@click="chooseToken(item)"
						:class="{
							active_pinned: mode === 'SEND' && sendToken?.address === item.address ||
							mode === 'RECEIVE' && receiveToken?.address === item.address
						}"
					>
						<img :src="item?.image" alt="Pinned token logo" class="pinned-list__image">
						<p class="pinned-list__name">{{ item?.symbol }}</p>
					</li>
				</ul>
        <div class="tokens-popup__categories">
          <div class="tokens-popup__filters">
            <div class="filter"
                 :class="{'active_filter': activeFilter.name === 'all'}"
                 @click="changeFilter({name: 'all'})"
            >
              <p class="filter__name">{{ $t('dexTokens.filters[0]') }}</p>
            </div>
            <div class="filter"
                 :class="{'active_filter': activeFilter.name === filter.name}"
                 v-for="(filter, index) in dexStore.GET_TOKEN_LABELS"
                 @click="changeFilter(filter)"
            >
              <p class="filter__name">{{ $t(`dexTokens.filters.${index + 1}`) }}</p>
            </div>
          </div>
          <div class="dividing-dashed"></div>
          <div class="tokens-popup__icon-info">
            <p class="info-text">$ {{ $t("dexTokens.info[0]") }}</p>
            <div class="info-dividing"></div>
            <svg class="info-icon" xmlns="http://www.w3.org/2000/svg" width="14" height="14"
                 viewBox="0 0 14 14" fill="none">
              <path opacity="0.8" fill-rule="evenodd" clip-rule="evenodd"
                    d="M3.24981 3.61111C3.11222 3.61111 3.02649 3.76615 3.09582 3.8896L6.46518 9.88944V3.61111H3.24981ZM7.53483 3.61111V9.88944L10.9042 3.8896C10.9735 3.76615 10.8878 3.61111 10.7502 3.61111H7.53483ZM2.17188 4.44946C1.68657 3.58528 2.28666 2.5 3.24981 2.5H10.7502C11.7133 2.5 12.3134 3.58528 11.8281 4.44946L7.46197 12.2244C7.36613 12.3951 7.19023 12.5 7 12.5C6.80978 12.5 6.63388 12.3951 6.53803 12.2244L2.17188 4.44946Z"
                    fill="white"/>
            </svg>
            <p class="info-text">{{ $t("dexTokens.info[1]") }}</p>
            <div class="info-dividing"></div>
            <svg class="info-icon" xmlns="http://www.w3.org/2000/svg" width="14" height="14"
                 viewBox="0 0 14 14" fill="none">
              <g opacity="0.8">
                <path
                    d="M12.6286 11.5938C11.7957 10.1538 10.5121 9.12134 9.01426 8.63188C9.75518 8.19081 10.3308 7.51871 10.6528 6.7188C10.9748 5.9189 11.0253 5.03541 10.7966 4.20403C10.5678 3.37265 10.0725 2.63933 9.38667 2.1167C8.70083 1.59407 7.86239 1.31102 7.00012 1.31102C6.13784 1.31102 5.29941 1.59407 4.61357 2.1167C3.92773 2.63933 3.43241 3.37265 3.20368 4.20403C2.97495 5.03541 3.02545 5.9189 3.34742 6.7188C3.6694 7.51871 4.24505 8.19081 4.98598 8.63188C3.48809 9.12079 2.20457 10.1533 1.37168 11.5938C1.34114 11.6436 1.32088 11.699 1.3121 11.7567C1.30332 11.8145 1.3062 11.8734 1.32056 11.9301C1.33493 11.9867 1.36049 12.0399 1.39574 12.0865C1.43099 12.133 1.47521 12.1721 1.5258 12.2013C1.57639 12.2305 1.63232 12.2493 1.69029 12.2566C1.74826 12.2639 1.8071 12.2594 1.86333 12.2436C1.91956 12.2277 1.97205 12.2008 2.0177 12.1643C2.06334 12.1278 2.10122 12.0826 2.1291 12.0313C3.15941 10.2506 4.98051 9.18751 7.00012 9.18751C9.01973 9.18751 10.8408 10.2506 11.8711 12.0313C11.899 12.0826 11.9369 12.1278 11.9825 12.1643C12.0282 12.2008 12.0807 12.2277 12.1369 12.2436C12.1931 12.2594 12.252 12.2639 12.3099 12.2566C12.3679 12.2493 12.4238 12.2305 12.4744 12.2013C12.525 12.1721 12.5692 12.133 12.6045 12.0865C12.6397 12.0399 12.6653 11.9867 12.6797 11.9301C12.694 11.8734 12.6969 11.8145 12.6881 11.7567C12.6794 11.699 12.6591 11.6436 12.6286 11.5938ZM3.93762 5.25001C3.93762 4.6443 4.11723 4.0522 4.45374 3.54857C4.79025 3.04495 5.26855 2.65242 5.82815 2.42063C6.38775 2.18883 7.00351 2.12819 7.59758 2.24635C8.19165 2.36452 8.73733 2.65619 9.16563 3.08449C9.59393 3.51279 9.8856 4.05848 10.0038 4.65254C10.1219 5.24661 10.0613 5.86238 9.8295 6.42198C9.5977 6.98158 9.20518 7.45987 8.70155 7.79638C8.19793 8.1329 7.60582 8.31251 7.00012 8.31251C6.18816 8.31164 5.4097 7.98871 4.83556 7.41456C4.26142 6.84042 3.93849 6.06197 3.93762 5.25001Z"
                    fill="white"/>
              </g>
            </svg>
            <p class="info-text">{{ $t("dexTokens.info[2]") }}</p>
          </div>
        </div>
			</div>

			<div class="custom-scroll tokens-popup__scroll-block" data-scroll-lock-scrollable>
				<div class="empty-search"
					 v-if="searchValue.length > 0 && searchValue.length <= 10 && getSearchTokens.length === 0"
				>
					<p class="empty-search__text">
						{{ $t('dexTokens.emptySearch[0]') }}
						<br>
						{{ $t('dexTokens.emptySearch[1]') }}
					</p>
				</div>
				<div class="empty-search"
					 v-if="searchValue.length > 0 && searchValue.length > 10 && getSearchTokens.length === 0 && unlistedToken === null"
				>
					<p class="empty-search__text">{{ $t('dexTokens.validAddress') }}</p>
				</div>
				<div class="tokens-popup__import-flex"
					 v-if="searchValue.length > 10 && getSearchTokens.length === 0 && unlistedToken !== null"
				>
					<ul class="tokens-popup__group">
						<TokenItem
							:item="unlistedToken"
							:userPinnedTokens="userPinnedTokens"
							:userUnpinnedTokens="userUnpinnedTokens"
							:status="'unlisted'"
							:tonPrice="getTonPrice"
						/>
						<li class="tokens-popup__import-info"
							v-if="!checkTokenInList"
						>
							<img src="@/assets/dex/info-icon.svg" alt="information icon" class="tokens-popup__info-icon">
							<p class="tokens-popup__info-text">{{ $t('dexTokens.importNotice') }}</p>
						</li>
<!--							<div class="tokens-popup__import-info"-->
<!--								v-else-->
<!--							>-->
<!--								<img src="@/assets/dex/success.svg" alt="" class="tokens-popup__info-icon">-->
<!--								<p class="tokens-popup__info-text">This token is in the list.</p>-->
<!--							</div>-->
					</ul>
					<div class="tokens-popup__button-wrapper">
						<button class="tokens-popup__import-btn"
								:disabled="checkTokenInList"
								@click="importToken"
						>
							{{ $t('dexTokens.importBtn') }}
						</button>
					</div>
				</div>

				<ul class="tokens-popup__list"
					v-if="searchValue.length > 0 && getSearchTokens.length > 0 && unlistedToken === null"
				>
					<li class="tokens-popup__list-title">{{ $t("dexTokens.titles[2]") }}</li>
					<TokenItem
						v-for="(item, index) in getSearchTokens"
						:key="index"
						:item="item"
						:userPinnedTokens="userPinnedTokens"
						:userUnpinnedTokens="userUnpinnedTokens"
						:tonPrice="getTonPrice"
						:class="{
							active_item: mode === 'SEND' && sendToken?.address === item.address ||
							mode === 'RECEIVE' && receiveToken?.address === item.address
						}"
						@click="chooseToken(item)"
						@pinToken="pinToken"
						@unpinToken="unpinToken"
					/>
				</ul>

        <ul class="tokens-popup__list"
            v-if="filteredYourTokens.length > 0 && searchValue.length === 0">
          <li class="tokens-popup__list-title">{{ $t("dexTokens.titles[0]") }}</li>
          <TokenItem
              v-for="(item, index) in filteredYourTokens"
              :key="item.id"
              :item="item"
              :userPinnedTokens="userPinnedTokens"
              :userUnpinnedTokens="userUnpinnedTokens"
              :tonPrice="getTonPrice"
              :activeFilter="activeFilter"
              :class="{
							active_item: mode === 'SEND' && dexStore.GET_SEND_TOKEN?.address === item.address ||
							mode === 'RECEIVE' && dexStore.GET_RECEIVE_TOKEN?.address === item.address
						}"
              @click="chooseToken(item)"
              @pinToken="pinToken"
              @unpinToken="unpinToken"
          />
        </ul>
        <ul class="tokens-popup__list"
            v-if="filteredAllTokens.length > 0 && searchValue.length === 0"
        >
          <li class="tokens-popup__list-title">{{ $t("dexTokens.titles[1]") }}</li>
          <TokenItem
              v-for="(item, index) in filteredAllTokens.slice(0, this.tokensCount)"
              :key="item.id"
              :item="item"
              :userPinnedTokens="userPinnedTokens"
              :userUnpinnedTokens="userUnpinnedTokens"
              :tonPrice="getTonPrice"
              :activeFilter="activeFilter"
              :class="[
							'token_' + (index + 1),
							{
								active_item: mode === 'SEND' && dexStore.GET_SEND_TOKEN?.address === item.address ||
								mode === 'RECEIVE' && dexStore.GET_RECEIVE_TOKEN?.address === item.address
							}
						]"
              @click="chooseToken(item)"
              @pinToken="pinToken"
              @unpinToken="unpinToken"
          />
        </ul>
			</div>
		</div>
	</div>
</template>

<script lang="ts">
import {Address} from "@ton/core";
import methodsMixins from "@/mixins/methodsMixins";
import TokenItem from "@/components/dex/TokenItem.vue";
import {useDexStore} from "@/stores/dex";
import {profileService, tokenService} from "@/api/coffeeApi/services";
import {ReadonlySdkEvent} from "@/utils/consts";

export default {
  name: "TokensPopup",
  components: { TokenItem },
  mixins: [methodsMixins],
  props: {
    mode: {
      type: String,
      default: "",
    },
  },
  data() {
    return {
      tokensCount: 30,
      userPinnedTokens: [] as any[],
      userUnpinnedTokens: [] as any[],
      unlistedToken: null as any | null,
      debounce: null as ReturnType<typeof setTimeout> | null,
      searchValue: "",
      step: 1,
      activeFilter: {
        name: 'all'
      },
    };
  },
  computed: {
    dexStore() {
      return useDexStore();
    },
    sendToken() {
      return this.dexStore.GET_SEND_TOKEN
    },
    receiveToken() {
      return this.dexStore.GET_RECEIVE_TOKEN
    },
    tonTokens() {
      return this.dexStore.GET_USER_TOKENS
    },
    observer(): IntersectionObserver {
      return new IntersectionObserver((entries) => this.showMoreTokens(entries));
    },
    getTarget(): Element | null {
      return document.querySelector(`.token_${this.tokensCount}`);
    },
    getTonPrice(): number {
      return (
          this.dexStore.GET_TON_TOKENS.find((item) => item.address === "native")
              ?.price_usd || 0
      );
    },
    getPinnedList(): any[] {
      const array = [] as any[];

      this.dexStore.GET_PINNED_TOKENS.forEach((item) => {
        if (item?.address === "native") {
          const findNative = this.dexStore.GET_TON_TOKENS.find(
              (find) => find.type === "native"
          );
          if (findNative) {
            array.push(findNative);
          }
        } else {
          const findInUnpin = this.userUnpinnedTokens.find(
              (find) => item.address === find.address
          );
          if (!findInUnpin) {
            const findToken = this.dexStore.GET_TON_TOKENS.find(
                (find) => item.address === find.address
            );
            if (findToken) {
              array.push(findToken);
            }
          }
        }
      });

      return array.concat(this.userPinnedTokens);
    },
    titleText(): string {
      return this.$t("dexInterface.selectToken") as string;
    },
    checkTokenInList() {
      const friendlyAddress = this.unlistedToken?.address;
      const rawAddress = this.toRawAddress(friendlyAddress);

      let find = this.dexStore.GET_TON_TOKENS.find((token) => token.address === rawAddress);

      if (!find) {
        find = this.dexStore.GET_TON_TOKENS.find((token) => token.address === friendlyAddress);
      }

      return !!find;
    },
    getYourTokens(): any[] {
      return this.dexStore.GET_USER_TOKENS.filter((item) => item.balance > 0)
          .sort(
              (a, b) => b?.balance * b?.price_usd - a?.balance * a?.price_usd
          )
          .sort((a, b) => b.imported - a.imported)
          .sort((a, b) => this.checkItemIsPinned(b) - this.checkItemIsPinned(a));
    },
    getAllTokens(): any[] {
      const array = [] as any[];

      this.dexStore.GET_TON_TOKENS.forEach((item) => {
        const findItem = this.dexStore.GET_USER_TOKENS.find(
            (find) => find.symbol === item.symbol
        );
        if (!(findItem?.balance > 0)) {
          array.push(item);
        }
      });

      const sortedArray = array
          .sort((a, b) => b.tvl - a.tvl)
          .sort((a, b) => this.checkItemIsPinned(b) - this.checkItemIsPinned(a))
          .sort((a, b) => b.imported - a.imported);

      const pinnedArray = [] as any[];

      this.getPinnedList.forEach((item) => {
        const findItem = this.dexStore.GET_USER_TOKENS.find(
            (find) => find.symbol === item.symbol
        );
        if (!(findItem?.balance > 0)) {
          pinnedArray.push(item);
        }
      });

      return pinnedArray.concat(sortedArray).filter(
          (item, index, self) =>
              index ===
              self.findIndex((t) => t.address === item.address && t.name === item.name)
      );
    },
    filteredYourTokens() {
      if (this.activeFilter.name === 'all') {
        return this.getYourTokens
      } else {
        return this.getYourTokens.filter((token) =>
            token.labels?.some((label) => label.label_id === this.activeFilter.id)
        );
      }
    },
    filteredAllTokens() {
      if (this.activeFilter.name === 'all') {
        return this.getAllTokens
      } else {
        return this.getAllTokens.filter((token) =>
            token.labels?.some((label) => label.label_id === this.activeFilter.id)
        );
      }
    },
    getSearchTokens() {
      let tokensToSearch = this.dexStore.GET_TON_TOKENS;

      if (this.activeFilter.name !== 'all') {
        tokensToSearch = tokensToSearch.filter((token) =>
            token.labels?.some((label) => label.label_id === this.activeFilter.id)
        );
      }

      if (this.searchValue.length === 0) {
        return tokensToSearch;
      } else if (this.searchValue.length <= 10) {
        return tokensToSearch.filter((item) =>
            item.name.toLowerCase().includes(this.searchValue.toLowerCase()) ||
            item.symbol.toLowerCase().includes(this.searchValue.toLowerCase())
        )
            .sort((a, b) => a.name.localeCompare(b.name))
            .sort((a, b) => this.checkItemIsPinned(b) - this.checkItemIsPinned(a));
      } else {
        let searchAddress = null;
        if (this.searchValue.includes(':') && this.searchValue.length === 66) {
          searchAddress = this.searchValue;
        } else if (this.searchValue.substring(0, 2) === 'EQ' || this.searchValue.substring(0, 2) === 'UQ') {
          searchAddress = Address.parseFriendly(this.searchValue).address.toRawString();
        } else {
          return [];
        }

        return tokensToSearch.filter((item) => item?.address === searchAddress);
      }
    }
  },
  methods: {
    filterLabels() {
      const filteredLabels = this.dexStore.GET_TOKEN_LABELS.filter((label) => {
        return this.dexStore.GET_TON_TOKENS.some((token) =>
            token.labels?.some((tokenLabel) => tokenLabel.label_id === label.id)
        );
      });

      const sortedLabels = filteredLabels.sort((a, b) => a.id - b.id);

      this.dexStore.DEX_TOKEN_LABELS(sortedLabels);
    },
    changeFilter(filter) {
      this.activeFilter = filter
      this.searchValue = '';
    },
    showMoreTokens(entries: IntersectionObserverEntry[]) {
      if (entries[0].isIntersecting) {
        if (this.getAllTokens.length >= this.tokensCount + 50) {
          this.observer.disconnect();
          this.tokensCount += 50;
          setTimeout(() => {
            if (this.getTarget) {
              this.observer.observe(this.getTarget);
            }
          }, 500);
        } else {
          this.tokensCount = this.getAllTokens.length;
          this.observer.disconnect();
        }
      }
    },
    getTokenPrice(value: number): string {
      if (value) {
        if (Number.isInteger(value)) {
          return `${value}$`;
        } else if (value > 0.01) {
          return `${value.toFixed(2)}$`;
        } else {
          return `${value.toFixed(4)}$`;
        }
      } else {
        return `0$`;
      }
    },
    closePopup() {
      this.$emit("closePopup");
      this.searchValue = "";
    },
    changeInput() {
      if (this.unlistedToken !== null) {
        this.unlistedToken = null;
      }

      if (this.searchValue.length > 10 && this.getSearchTokens.length === 0) {
        if (this.isAddress(this.searchValue)) {
          this.getUnlistedToken();
        } else {
          clearTimeout(this.debounce);
          this.debounce = setTimeout(() => {
            this.getUnlistedToken();
          }, 1000);
        }
      } else {
        clearTimeout(this.debounce);
      }
    },
    isAddress(value) {
      try {
        Address.parseFriendly(value);
        return true;
      } catch (error) {
        return false;
      }
    },
    toRawAddress(address) {
      try {
        if (address === 'native') {
          return 'TON'
        }

        const parsedAddress = Address.parseFriendly(address);
        return parsedAddress.address.toRawString();
      } catch (error) {
        return address;
      }
    },
    toSafeAddress(rawAddress) {
      try {
        if (rawAddress === 'native') {
          return 'TON'
        }
        const address = Address.parseRaw(rawAddress);
        return address.toString({ bounceable: true, urlSafe: true });
      } catch (error) {
        console.log(error);
        return null;
      }
    },
    inputFocused() {
      if (window.innerWidth <= 640) {
        setTimeout(() => {
          document.documentElement.style.overflow = "hidden";
        }, 1000);
      }
    },
    async getUnlistedToken() {
      try {
        let res = await tokenService.getSingleToken(this.searchValue);
        this.unlistedToken = res?.metadata
        this.unlistedToken.type = 'jetton'
        this.unlistedToken.balance = 0
        this.unlistedToken.stacking_pool_id = null
        this.unlistedToken.labels = []

      } catch (err) {
        console.error(err)
      }
    },
    importToken() {
      this.unlistedToken.imported = true
      let array = []
      let allTokens = this.dexStore.GET_TON_TOKENS
      let storage = JSON.parse(localStorage.getItem('importTokens'))

      if (storage) {
        array = storage;
      }
      if (array.length > 0) {
        array.forEach((item) => {
          if (
              item?.symbol === this.unlistedToken?.symbol &&
              item?.address === this.unlistedToken?.address
          ) {
            return;
          }
          array.push(this.unlistedToken);
          allTokens.unshift(this.unlistedToken);
        });
      } else {
        array.push(this.unlistedToken);
        allTokens.unshift(this.unlistedToken);
      }

      localStorage.removeItem('importTokens')
      localStorage.setItem('importTokens', JSON.stringify(array))

      this.dexStore.DEX_TON_TOKENS(allTokens)

      setTimeout(() => {
        this.searchValue = ''
        this.chooseToken(this.unlistedToken)

        this.dispatchSdkEvent(ReadonlySdkEvent.TOKEN_IMPORTED, this.unlistedToken)
      }, 200)
    },
    chooseToken(item: any) {
      const previousToken = this.mode === "SEND" ? this.dexStore.GET_SEND_TOKEN : this.dexStore.GET_RECEIVE_TOKEN;

      this.dispatchSdkEvent(ReadonlySdkEvent.TOKEN_CHANGED, { prev: previousToken, curr: item });

      if (this.mode === "SEND") {
        if (this.dexStore.GET_RECEIVE_TOKEN?.address === item?.address) {
          this.dexStore.DEX_RECEIVE_TOKEN(null);
        }
        if (this.dexStore.GET_SEND_TOKEN?.address !== item?.address) {
          this.addedSendQuery(item);
          this.dexStore.DEX_SEND_TOKEN(item);
          this.closePopup();
        }
      } else if (this.mode === "RECEIVE") {
        if (this.dexStore.GET_SEND_TOKEN?.address === item?.address) {
          if (this.dexStore.GET_RECEIVE_TOKEN === null) {
            if (this.dexStore.GET_SEND_TOKEN?.address === "native") {
              const findUsdt = this.dexStore.GET_TON_TOKENS.find(
                  (token) =>
                      token?.address ===
                      "0:b113a994b5024a16719f69139328eb759596c38a25f59028b146fecdc3621dfe"
              );
              if (findUsdt) {
                this.dexStore.DEX_SEND_TOKEN(findUsdt);
                this.addedSendQuery(findUsdt);
              }
            } else {
              const findTon = this.dexStore.GET_TON_TOKENS.find(
                  (token) => token?.address === "native"
              );
              if (findTon) {
                this.dexStore.DEX_SEND_TOKEN(findTon);
                this.addedSendQuery(findTon);
              }
            }
          } else {
            this.dexStore.DEX_SEND_TOKEN(this.dexStore.GET_RECEIVE_TOKEN);
            this.addedSendQuery(this.dexStore.GET_RECEIVE_TOKEN);
          }
        }
        if (this.dexStore.GET_RECEIVE_TOKEN?.address !== item?.address) {
          this.dexStore.DEX_RECEIVE_TOKEN(item);
          this.addedReceiveQuery(item);
          this.closePopup();
        }
      }
    },
    addedSendQuery(value) {
      const queryParams = new URLSearchParams(window.location.search);

      queryParams.set('ft', this.toSafeAddress(value.address));

      if (this.dexStore.GET_RECEIVE_TOKEN !== null) {
        queryParams.set('st', this.toSafeAddress(this.dexStore.GET_RECEIVE_TOKEN?.address));
      }

      if (this.dexStore.GET_SWAP_MODE === 'default') {
        if (this.dexStore.GET_SEND_AMOUNT > 0) {
          queryParams.set('fa', this.dexStore.GET_SEND_AMOUNT.toString());
        }
      } else if (this.dexStore.GET_SWAP_MODE === 'reverse') {
        if (this.dexStore.GET_RECEIVE_AMOUNT > 0) {
          queryParams.set('sa', this.dexStore.GET_RECEIVE_AMOUNT.toString());
        }
      }

        window.history.replaceState(null, '', `?${queryParams.toString()}`);
    },
    addedReceiveQuery(value) {
      const queryParams = new URLSearchParams(window.location.search);

      queryParams.set('ft', this.toSafeAddress(this.dexStore.GET_SEND_TOKEN?.address));

      if (value !== null) {
        queryParams.set('st', this.toSafeAddress(value.address));
      }

      if (this.dexStore.GET_SWAP_MODE === 'default') {
        if (this.dexStore.GET_SEND_AMOUNT > 0) {
          queryParams.set('fa', this.dexStore.GET_SEND_AMOUNT.toString());
        }
      } else if (this.dexStore.GET_SWAP_MODE === 'reverse') {
        if (this.dexStore.GET_RECEIVE_AMOUNT > 0) {
          queryParams.set('sa', this.dexStore.GET_RECEIVE_AMOUNT.toString());
        }
      }

      window.history.replaceState(null, '', `?${queryParams.toString()}`);
    },
    pinToken(item: any) {
      const pinTokens = this.dexStore.GET_PINNED_TOKENS.slice();
      const findNative = pinTokens.findIndex(
          (token) => token?.address === "native"
      );
      pinTokens.splice(findNative, 1);

      const findInStock = pinTokens.findIndex(
          (token) => token?.address === item?.address
      );
      const findIndex = this.userPinnedTokens.findIndex(
          (token) => item?.address === token?.address
      );

      if (findIndex === -1 && findInStock === -1) {
        if (this.userPinnedTokens.length < 3) {
          this.userPinnedTokens.push(item);

          const addressList = this.userPinnedTokens.map(
              (token) => token?.address
          );

          this.saveToStorage(addressList, "userPin");
        }
      } else {
        const findUnpinIndex = this.userUnpinnedTokens.findIndex(
            (token) => item?.address === token?.address
        );
        if (findUnpinIndex !== -1) {
          this.userUnpinnedTokens.splice(findUnpinIndex, 1);
        }

        const addressList = this.userUnpinnedTokens.map(
            (token) => token?.address
        );

        this.saveToStorage(addressList, "userUnpin");
      }
    },
    unpinToken(item: any) {
      const findIndex = this.userPinnedTokens.findIndex(
          (token) => item?.address === token?.address
      );

      if (findIndex !== -1) {
        if (this.userPinnedTokens.length <= 3) {
          this.userPinnedTokens.splice(findIndex, 1);

          const addressList = this.userPinnedTokens.map(
              (token) => token?.address
          );

          this.saveToStorage(addressList, "userPin");
        }
      } else {
        const findInList = this.userUnpinnedTokens.find(
            (token) => item?.address === token?.address
        );
        if (!findInList) {
          this.userUnpinnedTokens.push(item);
        }

        const addressList = this.userUnpinnedTokens.map(
            (token) => token?.address
        );

        this.saveToStorage(addressList, "userUnpin");
      }
    },
    checkItemIsPinned(item: any): boolean {
      const pinTokens = this.dexStore.GET_PINNED_TOKENS.filter(
          (token) =>
              !this.userUnpinnedTokens.some(
                  (unpinnedToken) => unpinnedToken?.address === token?.address
              )
      );

      const findNative = pinTokens.findIndex(
          (token) => token?.address === "native"
      );
      pinTokens.splice(findNative, 1);

      const findItem = this.userPinnedTokens.some(
          (token) => token?.address === item?.address
      );
      const findInStock = pinTokens.some(
          (token) => token?.address === item?.address
      );

      return findInStock || findItem || item.type === "native";
    },
    async saveToStorage(value: any, key: string) {
      try {
        let settings = this.dexStore.GET_USER_SETTINGS;
        const local = JSON.parse(localStorage.getItem(key) || "{}");
        if (!settings) {
          settings = local || {};
        }
        settings[key] = value;
        localStorage.setItem(key, JSON.stringify(value));
        if (this.dexStore.GET_PROOF_VERIFICATION) {
          await profileService.writeStorage(
              this.dexStore.GET_DEX_WALLET?.address,
              this.dexStore.GET_PROOF_VERIFICATION,
              settings
          );
        }
      } catch (err) {
        console.error(err);
      }
    },
  },
  mounted() {
    this.filterLabels()
    setTimeout(() => {
      if (this.getTarget) {
        this.observer.observe(this.getTarget);
      }
    }, 500);

    const userPinned = this.dexStore.GET_USER_SETTINGS?.userPin || [];
    const userUnpinned = this.dexStore.GET_USER_SETTINGS?.userUnpin || [];

    userPinned.forEach((address: string) => {
      const findPinned = this.dexStore.GET_TON_TOKENS.find(
          (token) => address === token.address
      );
      if (findPinned) {
        this.userPinnedTokens.push(findPinned);
      }
    });

    userUnpinned.forEach((address: string) => {
      const findUnpinned = this.dexStore.GET_TON_TOKENS.find(
          (token) => address === token.address
      );
      if (findUnpinned) {
        this.userUnpinnedTokens.push(findUnpinned);
      }
    });
  },
};
</script>

<style scoped>
.popup-background {
	position: fixed;
	z-index: 999;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	display: flex;
	align-items: center;
	justify-content: center;
	background: rgba(10, 7, 6, 0.8);
}

.tokens-popup {
	width: 450px;
	z-index: 999;
	background: var(--iface-main-bg);
	backdrop-filter: blur(10px);
	border-radius: 20px;
	padding: 18px 0 0 0;
}

.tokens-popup__menu {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 20px;
	padding: 0 18px;
}

.tokens-popup__close-btn {
	width: 24px;
	height: 24px;
	background: transparent;
	border: none;
	outline: none;
}

.tokens-popup__mode-name {
	font-family: Roboto, sans-serif;
	font-weight: 500;
	font-size: 24px;
	line-height: 28px;
}

.tokens-popup__block {
	padding: 0 18px;
}

.tokens-popup__label {
	position: relative;
	display: flex;
	align-items: center;
}

.tokens-popup__search-icon {
	position: absolute;
	z-index: 100;
	left: 15px;
	top: 15px;
	margin-right: 15px;
	width: 20px;
	height: 20px;
}

.tokens-popup__filters {
  display: flex;
  align-items: center;
  gap: 18px;
  border-bottom: 1px dashed var(--iface-white10);
  margin-bottom: 12px;
  padding: 0 16px;
}

.filter {
  padding-bottom: 12px;
  opacity: 0.4;
  cursor: pointer;
  transform: translateY(1px);
}

.filter__name {
  font-size: 14px;
  line-height: 17px;
}

.active_filter {
  opacity: 1;
  border-bottom: 1px solid var(--main-text-color);
}

.tokens-popup__remove-btn {
	position: absolute;
	z-index: 100;
	top: 15px;
	right: 15px;
	width: 20px;
	height: 20px;
	border: none;
	outline: none;
	background: url("@/assets/dex/erase-icon.svg") no-repeat;
}

.tokens-popup__input {
	transition: .2s;
	width: 100%;
	height: 50px;
	padding: 14px 50px 11px 50px;
	margin-bottom: 20px;
	border: 2px solid transparent;
	outline: none;
	border-radius: 15px;
	background: var(--iface-white6);
	color: var(--main-text-color);
	font-size: 14px;
	line-height: 16px;
}

.tokens-popup__input div div div {
	line-height: 16px;
}

.tokens-popup__input::placeholder {
	font-size: 14px;
	line-height: 16px;
	color: var(--main-text-color);
	opacity: 0.8;
}

input[type='search']::-webkit-search-decoration,
input[type='search']::-webkit-search-cancel-button,
input[type='search']::-webkit-search-results-button,
input[type='search']::-webkit-search-results-decoration {
	display: none;
}

.tokens-popup__input:hover {
	background: var(--iface-white10);
}

.tokens-popup__input:focus {
	background: var(--iface-main-bg);
	border: 2px solid var(--iface-accent-color);
}

.active_input {
	background: var(--iface-main-bg);
	border: 2px solid var(--iface-accent-color);
}

.empty-search {
	padding-top: 30px;
}

.empty-search__text {
	text-align: center;
	font-size: 14px;
	line-height: 16px;
}

.tokens-popup__import-flex {
	height: 100%;
	display: flex;
	flex-direction: column;
	justify-content: space-between;
	padding-top: 20px;
}

.tokens-popup__import-info {
	display: flex;
	align-items: center;
	margin: 8px 18px;
	padding: 14px;
	border-radius: 20px;
	background: var(--iface-white6);
}

.tokens-popup__info-icon {
	margin-right: 14px;
	width: 32px;
	height: 32px;
	border-radius: 100px;
}

.tokens-popup__info-text {
	font-size: 13px;
	line-height: 16px;
}

.tokens-popup__import-btn {
	transition: .2s;
	width: calc(100% - 40px);
	margin: 0 18px 20px 18px;
	padding: 19px 18px 18px 18px;
	outline: none;
	border: none;
	border-radius: 14px;
	background: var(--iface-accent-color);
	font-size: 16px;
	line-height: 19px;
	color: #fff;
}

.tokens-popup__import-btn:hover {
	background: var(--iface-accent-hover);
}

.tokens-popup__import-btn:disabled {
	background: #FFFFFF1A;
	color: rgba(255, 255, 255, .5);
}

.tokens-popup__pinned-list {
	margin-bottom: 10px;
	padding: 0 18px;
	display: flex;
	flex-wrap: wrap;
	gap: 8px;
}

.pinned-list__item {
	transition: .2s;
	display: flex;
	align-items: center;
	padding: 5px 12px 5px 6px;
	border-radius: 20px;
	border: 1px solid var(--iface-white20);
	cursor: pointer;
}

.pinned-list__item:hover {
	background: var(--iface-white20);
	border: 1px solid var(--iface-white24);
}

.active_pinned {
	background: var(--iface-white20);
	border: 1px solid var(--iface-white24);
}

.theme-light .pinned-list__item {
	border: 1px solid var(--iface-white10);
}

.theme-light .pinned-list__item:hover {
	background: var(--iface-white10);
	border: 1px solid var(--iface-white14);
}

.theme-light .active_pinned {
	background: var(--iface-white10);
	border: 1px solid var(--iface-white14);
}

.pinned-list__image {
	margin-right: 8px;
	border-radius: 100px;
	width: 24px;
	height: 24px;
}

.pinned-list__name {
	font-size: 16px;
	font-family: Roboto, sans-serif;
	font-weight: 500;
}

.dividing-line {
	width: 100%;
	height: 1px;
	background: var(--iface-white6);
}

.tokens-popup__scroll-block {
	max-height: 400px;
	height: 400px;
	overflow-y: auto;
}

.tokens-popup__list {
	margin-top: 20px;
}

.tokens-popup__list-title {
	margin-bottom: 10px;
	padding: 0 20px;
	font-size: 14px;
	opacity: 0.8;
}

.tokens-popup__icon-info {
	display: flex;
	align-items: center;
	padding: 0 20px;
	gap: 0 4px;
	margin-bottom: 10px;
}

.info-text {
	font-size: 13px;
	line-height: 16px;
	opacity: 0.4;
}

.tokens-popup__icon-info svg {
	opacity: 0.5;
}

.info-dividing {
	height: 10px;
	width: 1px;
	background: var(--main-text-color);
	opacity: 0.15;
	margin: 0 2px;
}

.custom-scroll::-webkit-scrollbar-track {
	margin: 5px 0 15px 0;
}

.theme-light svg path {
	fill: #141414;
}

@media screen and (max-width: 960px) {
	.popup-background {
		z-index: 999;
	}

	.tokens-popup {
		width: 100%;
		position: fixed;
		z-index: 999;
		top: 0;
		bottom: 0;
		left: 0;
		right: 0;
		border-radius: 0;
		padding: 20px 0 0 0;
		display: flex;
		flex-direction: column;
	}

	.tokens-popup__scroll-block {
		max-height: none;
		height: auto;
		overflow-y: auto;
	}

	.custom-scroll::-webkit-scrollbar-track {
		margin: 0;
	}

	.tokens-popup__button-wrapper {
		position: fixed;
		z-index: 100;
		bottom: 0;
		left: 0;
		right: 0;
	}
}

@media screen and (max-height: 680px) {
	.tokens-popup {
		max-height: calc(100dvh);
	}
}
</style>
