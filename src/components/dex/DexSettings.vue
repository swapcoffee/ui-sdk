<template>
	<div class="settings-background"
		 @click.self="$emit('closeSettings')"
	>
		<div class="settings">
			<div class="settings__title">
				<h2 class="settings__heading">{{ $t('dexSettings.caption') }}</h2>
				<button class="settings__close-btn"
						@click="$emit('closeSettings')"
				>
					<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
						<g opacity="0.8">
							<path d="M19.2806 18.2194C19.3502 18.2891 19.4055 18.3718 19.4432 18.4628C19.4809 18.5539 19.5003 18.6515 19.5003 18.75C19.5003 18.8485 19.4809 18.9461 19.4432 19.0372C19.4055 19.1282 19.3502 19.2109 19.2806 19.2806C19.2109 19.3503 19.1281 19.4056 19.0371 19.4433C18.9461 19.481 18.8485 19.5004 18.7499 19.5004C18.6514 19.5004 18.5538 19.481 18.4628 19.4433C18.3717 19.4056 18.289 19.3503 18.2193 19.2806L11.9999 13.0603L5.78055 19.2806C5.63982 19.4214 5.44895 19.5004 5.24993 19.5004C5.05091 19.5004 4.86003 19.4214 4.7193 19.2806C4.57857 19.1399 4.49951 18.949 4.49951 18.75C4.49951 18.551 4.57857 18.3601 4.7193 18.2194L10.9396 12L4.7193 5.78062C4.57857 5.63989 4.49951 5.44902 4.49951 5.25C4.49951 5.05097 4.57857 4.8601 4.7193 4.71937C4.86003 4.57864 5.05091 4.49958 5.24993 4.49958C5.44895 4.49958 5.63982 4.57864 5.78055 4.71937L11.9999 10.9397L18.2193 4.71937C18.36 4.57864 18.5509 4.49958 18.7499 4.49958C18.949 4.49958 19.1398 4.57864 19.2806 4.71937C19.4213 4.8601 19.5003 5.05097 19.5003 5.25C19.5003 5.44902 19.4213 5.63989 19.2806 5.78062L13.0602 12L19.2806 18.2194Z" fill="white"/>
						</g>
					</svg>
				</button>
			</div>
			<div class="settings__content custom-scroll"
				 :class="{show_expert: getExpertMode }"
			>
				<div class="settings__expert-mode">
					<div class="settings__group">
						<div class="settings__info">
							<img src="@/assets/dex/expert-mode.svg" alt="gift icon" class="settings__icon">
							<p class="settings__name">{{ $t('dexSettings.expert.title') }}</p>
						</div>
						<p class="settings__text-info">
							{{ $t('dexSettings.expert.text') }}
						</p>
					</div>
					<switch-toggle
						@click="switchExpertMode"
						:class="{active_switch: getExpertMode }"
					>
					</switch-toggle>
				</div>
				<p class="settings__text">{{ $t('dexSettings.slippage.title') }}</p>
				<p class="settings__description">{{ $t('dexSettings.slippage.text') }}</p>
				<label for="" class="settings__label">
					<input type="number" class="settings__input" v-model="slippage" inputmode="decimal"
						   :class="{active_input: activeSlippageConditions}"
						   @blur="blurSlippageInput"
						   @input="changeSlippageInput"
					>
				</label>
				<div class="settings__button-block">
					<button class="settings__button"
							:class="{active: Number(slippage) === 1}"
							@click="changeSlippage(1)"
					>
						1%
					</button>
					<button class="settings__button"
							:class="{active: Number(slippage) === 5}"
							@click="changeSlippage(5)"
					>
						5%
					</button>
					<button class="settings__button"
							:class="{active: Number(slippage) === 10}"
							@click="changeSlippage(10)"
					>
						10%
					</button>
				</div>
				<div class="settings__show-more"
					 v-show="getExpertMode"
				>
					<p class="settings__text">{{ $t('dexSettings.priceImpact.title') }}</p>
					<p class="settings__description">{{ $t('dexSettings.priceImpact.text') }}</p>
					<label for="" class="settings__label">
						<input type="number" class="settings__input" v-model="priceImpact" inputmode="decimal"
							   autocomplete="off"
							   :class="{active_input: activePriceImpactConditions}"
							   @input="changePriceImpactInput"
							   @blur="blurPriceImpactInput"
						>
					</label>
					<div class="settings__button-block">
						<button class="settings__button"
								:class="{active: Number(priceImpact) === 5}"
								@click="changePriceImpact(5)"
						>
							5%
						</button>
						<button class="settings__button"
								:class="{active: Number(priceImpact) === 10}"
								@click="changePriceImpact(10)"
						>
							10%
						</button>
						<button class="settings__button"
								:class="{active: Number(priceImpact) === 30}"
								@click="changePriceImpact(30)"
						>
							30%
						</button>
					</div>
					<p class="settings__text">{{ $t('dexSettings.intermediate.title') }}</p>
					<p class="settings__description">{{ $t('dexSettings.intermediate.text') }}</p>
					<div class="settings__button-column intermediate-token">
						<div class="settings__button-group">
							<button class="settings__button"
									:class="{active: Number(maxIntermediateTokens) === 0}"
									@click="changeMaxIntermediateTokens(0)"
							>
								0
							</button>
							<button class="settings__button"
									:class="{active: Number(maxIntermediateTokens) === 1}"
									@click="changeMaxIntermediateTokens(1)"
							>
								1
							</button>
							<button class="settings__button"
									:class="{active: Number(maxIntermediateTokens) === 2}"
									@click="changeMaxIntermediateTokens(2)"
							>
								2
							</button>
							<button class="settings__button"
									:class="{active: Number(maxIntermediateTokens) === 3}"
									@click="changeMaxIntermediateTokens(3)"
							>
								3
							</button>
						</div>
					</div>
					<p class="settings__text">{{ $t('dexSettings.volatility.title') }}</p>
					<p class="settings__description">{{ $t('dexSettings.volatility.text') }}</p>
					<div class="settings__button-column intermediate-token">
						<div class="settings__button-group">
							<button class="settings__button"
									:class="{active: Number(maxPoolVolatility) === 5}"
									@click="changeMaxPoolVolatility(5)"
							>
								5%
							</button>
							<button class="settings__button"
									:class="{active: Number(maxPoolVolatility) === 15}"
									@click="changeMaxPoolVolatility(15)"
							>
								15%
							</button>
							<button class="settings__button yellow_status"
									:class="{active: Number(maxPoolVolatility) === 30}"
									@click="changeMaxPoolVolatility(30)"
							>
								30%
							</button>
							<button class="settings__button red_status"
									:class="{active: Number(maxPoolVolatility) === -1}"
									@click="changeMaxPoolVolatility(-1)"
							>
								Ignore
							</button>
						</div>
					</div>
					<p class="settings__text">{{ $t('dexSettings.parallel.title') }}</p>
					<p class="settings__description">
						{{ $t('dexSettings.parallel.text') }}
						<span v-if="!isV5">
							{{ $t('dexSettings.parallel.textW5') }}
            				<strong class="description-color">{{ $t('dexSettings.parallel.colorText') }}</strong>
						</span>
						<span class="info-wrapper"
							  @mouseenter="showTooltip = true"
							  @mouseleave="showTooltip = false"
						>
						<transition name="tooltip">
    						<tooltip-wrapper class="btn-tooltip"
								v-show="showTooltip"
								@hiddenTooltip="closeTooltip">
								<span class="word-wrap">
									{{ $t('dexSettings.parallel.tooltip') }}
								</span>
							</tooltip-wrapper>
						</transition>
							<svg class="tooltip-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
						  		<g opacity="0.5">
									<path d="M8 1.5C6.71442 1.5 5.45772 1.88122 4.3888 2.59545C3.31988 3.30968 2.48676 4.32484 1.99479 5.51256C1.50282 6.70028 1.37409 8.00721 1.6249 9.26809C1.8757 10.529 2.49477 11.6872 3.40381 12.5962C4.31285 13.5052 5.47104 14.1243 6.73192 14.3751C7.99279 14.6259 9.29973 14.4972 10.4874 14.0052C11.6752 13.5132 12.6903 12.6801 13.4046 11.6112C14.1188 10.5423 14.5 9.28558 14.5 8C14.4982 6.27665 13.8128 4.62441 12.5942 3.40582C11.3756 2.18722 9.72335 1.50182 8 1.5ZM7.75 4.5C7.89834 4.5 8.04334 4.54399 8.16668 4.6264C8.29002 4.70881 8.38615 4.82594 8.44291 4.96299C8.49968 5.10003 8.51453 5.25083 8.48559 5.39632C8.45665 5.5418 8.38522 5.67544 8.28033 5.78033C8.17544 5.88522 8.04181 5.95665 7.89632 5.98559C7.75083 6.01453 7.60003 5.99968 7.46299 5.94291C7.32595 5.88614 7.20881 5.79001 7.1264 5.66668C7.04399 5.54334 7 5.39834 7 5.25C7 5.05109 7.07902 4.86032 7.21967 4.71967C7.36032 4.57902 7.55109 4.5 7.75 4.5ZM8.5 11.5C8.23479 11.5 7.98043 11.3946 7.7929 11.2071C7.60536 11.0196 7.5 10.7652 7.5 10.5V8C7.36739 8 7.24022 7.94732 7.14645 7.85355C7.05268 7.75979 7 7.63261 7 7.5C7 7.36739 7.05268 7.24021 7.14645 7.14645C7.24022 7.05268 7.36739 7 7.5 7C7.76522 7 8.01957 7.10536 8.20711 7.29289C8.39465 7.48043 8.5 7.73478 8.5 8V10.5C8.63261 10.5 8.75979 10.5527 8.85356 10.6464C8.94732 10.7402 9 10.8674 9 11C9 11.1326 8.94732 11.2598 8.85356 11.3536C8.75979 11.4473 8.63261 11.5 8.5 11.5Z" fill="white"/>
						  		</g>
							</svg>
<!--					    <img src="@/assets/dex/details-info.svg" alt="info icon" class="tooltip-icon">-->
						</span>
					</p>
					<label for="" class="settings__label" v-if="isV5">
						<input type="number" class="settings__input" v-model="maxSplits" inputmode="decimal"
							   autocomplete="off"
							   :class="{active_input: activeMaxSplitsConditions}"
							   @input="changeMaxSplitsInput"
							   @blur="blurMaxSplitsInput"
						>
					</label>
					<div class="settings__button-column">
						<div class="settings__button-group"
							 v-if="!isV5">
							<button class="settings__button"
									:class="{active: Number(maxSplits) === 1}"
									@click="changeMaxSplits(1)"
							>
								1
							</button>
							<button class="settings__button"
									:class="{active: Number(maxSplits) === 2}"
									@click="changeMaxSplits(2)"
							>
								2
							</button>
							<button class="settings__button"
									:class="{active: Number(maxSplits) === 3}"
									@click="changeMaxSplits(3)"
							>
								3
							</button>
							<button class="settings__button"
									:class="{active: Number(maxSplits) === 4}"
									@click="changeMaxSplits(4)"
							>
								4
							</button>
						</div>
						<div class="settings__button-group"
							 v-if="isV5">
							<button class="settings__button"
									:class="{active: Number(maxSplits) === 1}"
									@click="changeMaxSplits(1)"
							>
								1
							</button>
							<button class="settings__button"
									:class="{active: Number(maxSplits) === 5}"
									@click="changeMaxSplits(5)"
							>
								5
							</button>
							<button class="settings__button yellow_status"
									:class="{active: Number(maxSplits) === 10}"
									@click="changeMaxSplits(10)"
							>
								10
							</button>
							<button class="settings__button yellow_status"
									:class="{active: Number(maxSplits) === 20}"
									@click="changeMaxSplits(20)"
							>
								20
							</button>
						</div>
					</div>
					<!--					<button class="settings__ignore-btn"-->
					<!--							:class="{active: Number(maxPoolVolatility) === -1}"-->
					<!--							@click="changeMaxPoolVolatility(-1)"-->
					<!--					>-->
					<!--						Unlimited-->
					<!--					</button>-->
				</div>
			</div>
		</div>
	</div>
</template>

<script lang="ts">
import { useDexStore } from "@/stores/dex";
import { useSettingsStore } from "@/stores/settings";
import SwitchToggle from "@/components/ui/SwitchToggle.vue";
import TooltipWrapper from "@/components/ui/TooltipWrapper.vue";
import computedMixins from "@/mixins/computedMixins";

export default {
  name: "DexSettings",
  mixins: [computedMixins],
  components: {
    SwitchToggle,
    TooltipWrapper,
  },
  data() {
    return {
      cashback: false,
      slippage: '0',
      priceImpact: '0',
      maxPoolVolatility: '0',
      maxIntermediateTokens: '0',
      maxSplits: '0',
      isV5: false,
      showTooltip: false,
    };
  },
  computed: {
    dexStore() {
      return useDexStore();
    },
    settingsStore() {
      return useSettingsStore();
    },
    activeSlippageConditions(): boolean {
      const value = Number(this.slippage);
      return value > 0 && value !== 1 && value !== 5 && value !== 10;
    },
    activePriceImpactConditions(): boolean {
      const value = Number(this.priceImpact);
      return value > 0 && value !== 5 && value !== 10 && value !== 30;
    },
    getExpertMode(): boolean {
      return this.dexStore.GET_EXPERT_MODE_VALUE;
    },
    activeMaxSplitsConditions(): boolean {
      const value = Number(this.maxSplits);
      return value === 0;
    },
  },
  methods: {
    switchExpertMode(): void {
      const updatedExpertMode = !this.getExpertMode;
      this.dexStore.DEX_EXPERT_MODE(updatedExpertMode);
      this.saveToStorage("expertMode", updatedExpertMode);
      this.toggleExpertsSettingsValues(updatedExpertMode);
    },
    switchCashback(value: boolean, notSave?: boolean): void {
      this.cashback = typeof value === "boolean" ? value : !this.cashback;
      this.dexStore.DEX_CASHBACK(this.cashback);
      if (!notSave) {
        this.saveToStorage("cashback", this.cashback);
      }
    },
    changeSlippage(value: number | string, notSave?: boolean): void {
      this.slippage = value.toString();
      this.dexStore.DEX_SLIPPAGE(Number(value));
      if (!notSave) {
        this.saveToStorage("slippage", this.slippage);
      }
    },
    changeSlippageInput(): void {
      let value = Number(this.slippage);
      if (value > 100) {
        this.slippage = '100';
      } else if (value < 0) {
        this.slippage = '1';
      }
      this.dexStore.DEX_SLIPPAGE(Number(this.slippage));
      this.saveToStorage("slippage", this.slippage);
    },
    blurSlippageInput(): void {
      if (this.slippage.trim().length === 0 || Number(this.slippage) === 0) {
        this.slippage = '1';
      }
      this.dexStore.DEX_SLIPPAGE(Number(this.slippage));
      this.saveToStorage("slippage", this.slippage);
    },
    changePriceImpactInput(): void {
      let value = Number(this.priceImpact);
      if (value < 0) {
        this.priceImpact = '0';
      } else if (value > 100) {
        this.priceImpact = '100';
      }
      this.dexStore.DEX_PRICE_IMPACT(Number(this.priceImpact));
      this.saveToStorage("priceImpact", this.priceImpact);
    },
    blurPriceImpactInput(): void {
      if (this.priceImpact.trim().length === 0 || Number(this.priceImpact) === 0) {
        this.priceImpact = '10';
      }
      this.dexStore.DEX_PRICE_IMPACT(Number(this.priceImpact));
      this.saveToStorage("priceImpact", this.priceImpact);
    },
    changePriceImpact(value: number | string, notSave?: boolean): void {
      this.priceImpact = value.toString();
      this.dexStore.DEX_PRICE_IMPACT(Number(value));
      if (!notSave) {
        this.saveToStorage("priceImpact", this.priceImpact);
      }
    },
    changeMaxPoolVolatility(value: number | string, notSave?: boolean): void {
      this.maxPoolVolatility = value.toString();
      this.dexStore.DEX_MAX_POOL_VOLATILITY(Number(value));
      if (!notSave) {
        this.saveToStorage("maxPoolVolatility", this.maxPoolVolatility);
      }
    },
    changeMaxIntermediateTokens(value: number | string, notSave?: boolean): void {
      this.maxIntermediateTokens = value.toString();
      this.dexStore.DEX_MAX_INTERMEDIATE_TOKENS(Number(value));
      if (!notSave) {
        this.saveToStorage("maxIntermediateTokens", this.maxIntermediateTokens);
      }
    },
    changeMaxSplits(value: number | string, notSave?: boolean): void {
      this.maxSplits = value.toString();
      this.dexStore.DEX_MAX_SPLITS(Number(value));
      if (!notSave) {
        this.saveToStorage("maxSplits", this.maxSplits);
      }
    },
    changeMaxSplitsInput(): void {
      let value = this.maxSplits.trim();

      if (!/^\d+$/.test(value)) {
        this.maxSplits = '0';
        return;
      }

      let intValue = parseInt(value);
      if (this.isV5) {
        if (intValue > 20) {
          this.maxSplits = '20';
        } else if (intValue < 1) {
          this.maxSplits = '1';
        }
      } else {
        if (intValue > 4) {
          this.maxSplits = '4';
        } else if (intValue < 1) {
          this.maxSplits = '1';
        }
      }
      this.dexStore.DEX_MAX_SPLITS(Number(this.maxSplits));
      this.saveToStorage("maxSplits", this.maxSplits);
    },
    async saveToStorage(key: string, value: any): Promise<void> {
      try {
        let settings = this.settingsStore.GET_USER_SETTINGS;
        if (!settings) {
          const storage = JSON.parse(localStorage.getItem("dexSettings") || "{}");
          settings = storage || {};
        }

        if (!settings.dexSettings) {
          settings.dexSettings = {};
        }
        settings.dexSettings[key] = value;

        localStorage.setItem("dexSettings", JSON.stringify(settings));
        if (this.dexStore.GET_PROOF_VERIFICATION && this.dexStore.GET_DEX_WALLET) {
          await this.dexApiV2.writeStorage(
              this.dexStore.GET_DEX_WALLET.address,
              this.dexStore.GET_PROOF_VERIFICATION,
              settings
          );
        }
      } catch (err) {
        console.error(err);
      }
    },
    async checkStorageSettings(): Promise<void> {
      try {
        let settings = this.settingsStore.GET_USER_SETTINGS?.dexSettings;
        if (!settings) {
          const storage = JSON.parse(localStorage.getItem("dexSettings") || "{}")?.dexSettings;
          settings = storage || {};
        }
        if (settings) {
          if (settings.expertMode !== undefined && settings) {
            this.dexStore.DEX_EXPERT_MODE(settings.expertMode);
          }
          settings.slippage !== undefined ? this.changeSlippage(settings.slippage, true) : (this.slippage = this.dexStore.GET_SLIPPAGE.toString());
          settings.cashback !== undefined ? this.switchCashback(settings.cashback, true) : (this.cashback = this.dexStore.GET_CASHBACK);

          if (this.getExpertMode && settings) {
            settings.priceImpact !== undefined ? this.changePriceImpact(settings.priceImpact, true) : (this.priceImpact = this.dexStore.GET_PRICE_IMPACT.toString());
            settings.maxPoolVolatility !== undefined ? this.changeMaxPoolVolatility(settings.maxPoolVolatility, true) : (this.maxPoolVolatility = this.dexStore.GET_MAX_POOL_VOLATILITY.toString());
            settings.maxIntermediateTokens !== undefined ? this.changeMaxIntermediateTokens(settings.maxIntermediateTokens, true) : (this.maxIntermediateTokens = this.dexStore.GET_MAX_INTERMEDIATE_TOKENS.toString());
            settings.maxSplits !== undefined ? this.changeMaxSplits(settings.maxSplits, true) : (this.maxSplits = this.dexStore.GET_MAX_SPLITS.toString());
          }
        }
      } catch (err) {
        console.error(err);
      }
    },
    toggleExpertsSettingsValues(expertModeValue: boolean): void {
      let settings = this.settingsStore.GET_USER_SETTINGS?.dexSettings;

      if (!settings) {
        const storage = JSON.parse(localStorage.getItem("dexSettings") || "{}")?.dexSettings;
        settings = storage || {};
      }

      if (expertModeValue && settings) {
        this.changePriceImpact(settings.priceImpact !== undefined ? settings.priceImpact : this.dexStore.GET_PRICE_IMPACT.toString(), true);
        this.changeMaxPoolVolatility(settings.maxPoolVolatility !== undefined ? settings.maxPoolVolatility : this.dexStore.GET_MAX_POOL_VOLATILITY.toString(), true);
        this.changeMaxIntermediateTokens(settings.maxIntermediateTokens !== undefined ? settings.maxIntermediateTokens : this.dexStore.GET_MAX_INTERMEDIATE_TOKENS.toString(), true);
        this.changeMaxSplits(settings.maxSplits !== undefined ? settings.maxSplits : this.dexStore.GET_MAX_SPLITS.toString(), true);
      } else {
        this.dexStore.CLEAR_DEX_EXPERTS_SETTINGS();
        this.priceImpact = this.dexStore.GET_PRICE_IMPACT.toString();
        this.maxPoolVolatility = this.dexStore.GET_MAX_POOL_VOLATILITY.toString();
        this.maxIntermediateTokens = this.dexStore.GET_MAX_INTERMEDIATE_TOKENS.toString();
        this.maxSplits = this.dexStore.GET_MAX_SPLITS.toString();
      }
    },
    blurMaxSplitsInput(): void {
      if (this.maxSplits.trim().length === 0 || Number(this.maxSplits) === 0) {
        this.maxSplits = this.isV5 ? '20' : '4';
      }
      this.dexStore.DEX_MAX_SPLITS(Number(this.maxSplits));
      this.saveToStorage("maxSplits", this.maxSplits);
    },
    isV5WalletChecker(): boolean {
      this.isV5 = this.dexStore.GET_DEX_WALLET_VERSION >= 5;
      return this.isV5;
    },
    closeTooltip(): void {
      this.showTooltip = false;
    },
  },
  mounted() {
    this.checkStorageSettings();
  },
  watch: {
    "dexStore.GET_DEX_WALLET_VERSION": {
      handler() {
        this.isV5WalletChecker();
        let settings = this.settingsStore.GET_USER_SETTINGS;
        if (!settings) {
          settings = JSON.parse(localStorage.getItem("dexSettings") || "{}");
        }

        if (settings?.dexSettings && settings.dexSettings.maxSplits !== undefined && settings.dexSettings.maxSplits >= 0) {
          return;
        }
        this.changeMaxSplits(this.isV5 ? '20' : '4');
        this.dexStore.DEX_MAX_SPLITS(Number(this.maxSplits));
      },
    },
    "settingsStore.GET_USER_SETTINGS": {
      handler() {
        this.checkStorageSettings();
      },
    },
  },
};
</script>


<style scoped>

.settings-background {
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

.settings {
	width: 450px;
	z-index: 999;
	background: var(--iface-main-bg);
	border-radius: 20px;
	padding-top: 18px;
}

.settings__title {
	margin-bottom: 20px;
	padding: 0 20px;
	display: flex;
	align-items: center;
	justify-content: space-between;
}

.settings__content {
	max-height: 582px;
	height: auto;
	overflow-y: auto;
	overflow-x: hidden;
	padding: 0 18px 18px 18px;
}

.cashback {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding-bottom: 20px;
	border-bottom: 1px solid var(--iface-white6);
	margin-bottom: 20px;
	gap: 0 20px;
}

.settings__expert-mode {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding-bottom: 20px;
	border-bottom: 1px solid var(--iface-white6);
	margin-bottom: 20px;
}

.settings__info {
	margin-bottom: 5px;
	display: flex;
	align-items: center;
}

.settings__icon {
	margin-right: 5px;
	width: 20px;
	height: 20px;
}

.settings__name {
	font-size: 14px;
	font-weight: 500;
	font-family: Roboto, sans-serif;
}

.settings__text-info {
	font-size: 14px;
	line-height: 16px;
	color: #8C8C8D;
}

.settings__heading {
	font-size: 24px;
	line-height: 28px;
	font-family: Roboto, sans-serif;
	font-weight: 500;
}

.settings__close-btn {
	width: 20px;
	height: 20px;
	border: none;
	outline: none;
	background: transparent;
}

.settings__text {
	margin-bottom: 5px;
	font-size: 14px;
	line-height: 16px;
	font-family: Roboto, sans-serif;
	font-weight: 500;
}

.settings__description {
	margin-bottom: 15px;
	font-size: 14px;
	line-height: 16px;
	font-weight: 400;
	color: #8C8C8D;
}

.settings__input {
	transition: .15s;
	margin-bottom: 10px;
	padding: 15px 20px 15px 20px;
	width: 100%;
	max-height: 46px;
	border-radius: 14px;
	outline: none;
	border: 1px solid var(--iface-white14);
	background: transparent;
	text-align: center;
	font-size: 14px;
	font-family: Roboto, sans-serif;
	font-weight: 500;
	line-height: 16px;
}

.settings__input:hover {
	border: 1px solid var(--iface-white24);
	background: var(--iface-white4);
}

.settings__input:active {
	border: 2px solid var(--iface-accent-color);
	background: var(--main-bg-color)
}

.settings__input:focus {
	border: 2px solid var(--iface-accent-color);
	background: var(--main-bg-color)
}

.active_input {
	border: 1px solid var(--iface-accent-color);
	color: var(--iface-accent-color);
}

.active_input:hover {
	border: 1px solid var(--iface-accent-color);
	color: #FFFFFF;
	background: var(--iface-white4);
}

.settings__button-block {
	display: flex;
	gap: 0 10px;
}

.show_expert .settings__button-block {
	padding-bottom: 20px;
	border-bottom: 1px solid var(--iface-white6);
	margin-bottom: 20px;
}

.settings__button {
	transition: .15s;
	width: 100%;
	height: 40px;
	border-radius: 14px;
	border: 1px solid var(--iface-white14);
	background: transparent;
	font-size: 14px;
	font-weight: 500;
	line-height: 20px;
}

.settings__button:hover {
	border: 1px solid var(--iface-white24);
}

.active,
.active:hover {
	border: 1px solid var(--iface-accent-color);
	color: var(--iface-accent-color);
}

.yellow_status.active {
	border: 1px solid var(--main-yellow);
	background: transparent;
	color: var(--main-yellow);
}

.red_status.active {
	border: 1px solid var(--main-red);
	background: transparent;
	color: var(--main-red);
}

.settings__button-column {
	display: flex;
	flex-direction: column;
}

.intermediate-token {
	padding-bottom: 20px;
	border-bottom: 1px solid var(--iface-white6);
	margin-bottom: 20px;
}

.settings__button-group {
	display: flex;
	align-items: center;
	gap: 0 10px;
}

/*.settings__ignore-btn {
	transition: .15s;
	width: 100%;
	height: 46px;
	border-radius: 15px;
	border: 1px solid rgba(255, 255, 255, 0.15);
	background: transparent;
	font-size: 14px;
}

.settings__ignore-btn:hover {
	border: 1px solid rgba(255, 255, 255, 0.25);
	background: #161616;
}

.volatility__icon {
	margin-right: 4px;
	margin-bottom: -4px;
	width: 20px;
	height: 20px;
}*/

.description-color {
	margin-right: 4px;
	font-weight: 400;
	color: #4A7CFD;
}

.custom-scroll::-webkit-scrollbar-track {
	margin: 5px 0 15px 0;
}

.info-wrapper {
	position: relative;
}

.word-wrap {
	display: inline-block;
	max-width: 100%;
	word-wrap: break-word;
	word-break: break-word;
	white-space: normal;
	overflow-wrap: break-word;
}

.tooltip-icon {
	position: absolute;
	top: 1px;
}

.btn-tooltip {
	max-width: 98%;
	z-index: 100;
	position: absolute;
	bottom: 20px;
	left: 50%;
	transform: translateX(-49.5%);
}

.theme-light svg path {
	fill: #141414;
}

@media screen and (max-width: 640px) {
	.settings {
		overflow-y: auto;
		position: fixed;
		z-index: 999;
		top: 0;
		bottom: 0;
		right: 0;
		left: 0;
		width: 100%;
		border-radius: 0;
		max-height: 100%;
		display: flex;
		flex-direction: column;
		padding-top: 30px;
	}

	.settings__title {
		margin-bottom: 30px;
	}

	.settings__content {
		max-height: 100%;
		height: auto;
		overflow-y: auto;
	}

	.btn-tooltip {
		position: fixed;
		z-index: 100;
		bottom: 40px;
		left: 50%;
		transform: translateX(-49.5%);
	}
}

@media screen and (max-height: 650px) {
	.settings__content {
		max-height: calc(100dvh - 70px);
		height: auto;
		overflow-y: auto;
	}
}

</style>