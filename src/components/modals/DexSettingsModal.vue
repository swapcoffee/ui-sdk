<template>
    <modal-wrapper
        class="modal"
        :title="$t('dexSettings.caption')"
        :padding-zero="true"
        @closeModal="$emit('closeSettings')"
    >
        <div class="settings__content custom-scroll" :class="{ show_expert: getExpertMode }">
          <div>
            <p class="settings__text">
              {{ $t('dexSettings.slippage.title') }}
            </p>
            <p class="settings__description">
              {{ $t('dexSettings.slippage.text') }}
            </p>
            <label for="" class="settings__label">
              <input
                  v-model="slippage"
                  type="text"
                  class="settings__input"
                  inputmode="decimal"
                  step="any"
                  lang="en"
                  :class="{ active_input: activeSlippageConditions }"
                  @blur="blurSlippageInput"
                  @input="changeSlippageInput"
              />
            </label>
            <div class="block-slippage">
              <button
                  class="settings__button"
                  :class="{ active: Number(slippage) === 1 }"
                  @click="changeSlippage(1)"
              >
                1%
              </button>
              <button
                  class="settings__button"
                  :class="{ active: Number(slippage) === 5 }"
                  @click="changeSlippage(5)"
              >
                5%
              </button>
              <button
                  class="settings__button"
                  :class="{ active: Number(slippage) === 10 }"
                  @click="changeSlippage(10)"
              >
                10%
              </button>
            </div>
          </div>

          <MevSettings :is-hidden="true" class="block-settings" />

            <div class="settings__item-mode">
              <div class="settings__group">
                <div class="settings__info">
                  <img src="../../assets/dex/expert-mode.svg" alt="gift icon" class="settings__icon"/>
                  <p class="settings__name">
                    {{ $t('dexSettings.expert.title') }}
                  </p>
                </div>
                <p class="settings__text-info">
                  {{ $t('dexSettings.expert.text') }}
                </p>
              </div>
              <switch-toggle :class="{ active_switch: getExpertMode }" @click="switchExpertMode"/>
            </div>

            <div v-show="getExpertMode" class="settings__show-more">
                <p class="settings__text">
                    {{ $t('dexSettings.priceImpact.title') }}
                </p>
                <p class="settings__description">
                    {{ $t('dexSettings.priceImpact.text') }}
                </p>
                <label for="" class="settings__label">
                    <input
                        v-model="priceImpact"
                        type="text"
                        class="settings__input"
                        inputmode="decimal"
                        step="any"
                        lang="en"
                        autocomplete="off"
                        :class="{ active_input: activePriceImpactConditions }"
                        @input="changePriceImpactInput"
                        @blur="blurPriceImpactInput"
                    />
                </label>
                <div class="settings__button-block">
                    <button
                        class="settings__button"
                        :class="{ active: Number(priceImpact) === 5 }"
                        @click="changePriceImpact(5)"
                    >
                        5%
                    </button>
                    <button
                        class="settings__button"
                        :class="{ active: Number(priceImpact) === 10 }"
                        @click="changePriceImpact(10)"
                    >
                        10%
                    </button>
                    <button
                        class="settings__button"
                        :class="{ active: Number(priceImpact) === 30 }"
                        @click="changePriceImpact(30)"
                    >
                        30%
                    </button>
                </div>
                <p class="settings__text">
                    {{ $t('dexSettings.intermediate.title') }}
                </p>
                <p class="settings__description">
                    {{ $t('dexSettings.intermediate.text') }}
                </p>
                <div class="settings__button-column intermediate-token">
                    <div class="settings__button-group">
                        <button
                            class="settings__button"
                            :class="{ active: Number(maxIntermediateTokens) === 0 }"
                            @click="changeMaxIntermediateTokens(0)"
                        >
                            0
                        </button>
                        <button
                            class="settings__button"
                            :class="{ active: Number(maxIntermediateTokens) === 1 }"
                            @click="changeMaxIntermediateTokens(1)"
                        >
                            1
                        </button>
                        <button
                            class="settings__button"
                            :class="{ active: Number(maxIntermediateTokens) === 2 }"
                            @click="changeMaxIntermediateTokens(2)"
                        >
                            2
                        </button>
                        <button
                            class="settings__button"
                            :class="{ active: Number(maxIntermediateTokens) === 3 }"
                            @click="changeMaxIntermediateTokens(3)"
                        >
                            3
                        </button>
                    </div>
                </div>
                <p class="settings__text">
                    {{ $t('dexSettings.volatility.title') }}
                </p>
                <p class="settings__description">
                    {{ $t('dexSettings.volatility.text') }}
                </p>
                <div class="settings__button-column intermediate-token">
                    <div class="settings__button-group">
                        <button
                            class="settings__button"
                            :class="{ active: Number(maxPoolVolatility) === 5 }"
                            @click="changeMaxPoolVolatility(5)"
                        >
                            5%
                        </button>
                        <button
                            class="settings__button"
                            :class="{ active: Number(maxPoolVolatility) === 15 }"
                            @click="changeMaxPoolVolatility(15)"
                        >
                            15%
                        </button>
                        <button
                            class="settings__button yellow_status"
                            :class="{ active: Number(maxPoolVolatility) === 30 }"
                            @click="changeMaxPoolVolatility(30)"
                        >
                            30%
                        </button>
                        <button
                            class="settings__button red_status"
                            :class="{ active: Number(maxPoolVolatility) === -1 }"
                            @click="changeMaxPoolVolatility(-1)"
                        >
                            Ignore
                        </button>
                    </div>
                </div>
                <p class="settings__text">
                    {{ $t('dexSettings.parallel.title') }}
                </p>
                <p class="settings__description">
                    {{ $t('dexSettings.parallel.text') }}
                    <span v-if="!isV5">
              {{ $t('dexSettings.parallel.textW5') }}
              <strong class="description-color">{{ $t('dexSettings.parallel.colorText') }}</strong>
            </span>
                    <span
                        class="info-wrapper"
                        @mouseenter="showTooltip = true"
                        @mouseleave="showTooltip = false"
                    >
              <transition name="tooltip">
                <tooltip-wrapper
                    v-show="showTooltip"
                    class="btn-tooltip"
                    @hidden-tooltip="closeTooltip"
                >
                  <span class="word-wrap">
                    {{ $t('dexSettings.parallel.tooltip') }}
                  </span>
                </tooltip-wrapper>
              </transition>
              <svg
                  class="tooltip-icon"
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
              >
                <g opacity="0.5">
                  <path
                      d="M8 1.5C6.71442 1.5 5.45772 1.88122 4.3888 2.59545C3.31988 3.30968 2.48676 4.32484 1.99479 5.51256C1.50282 6.70028 1.37409 8.00721 1.6249 9.26809C1.8757 10.529 2.49477 11.6872 3.40381 12.5962C4.31285 13.5052 5.47104 14.1243 6.73192 14.3751C7.99279 14.6259 9.29973 14.4972 10.4874 14.0052C11.6752 13.5132 12.6903 12.6801 13.4046 11.6112C14.1188 10.5423 14.5 9.28558 14.5 8C14.4982 6.27665 13.8128 4.62441 12.5942 3.40582C11.3756 2.18722 9.72335 1.50182 8 1.5ZM7.75 4.5C7.89834 4.5 8.04334 4.54399 8.16668 4.6264C8.29002 4.70881 8.38615 4.82594 8.44291 4.96299C8.49968 5.10003 8.51453 5.25083 8.48559 5.39632C8.45665 5.5418 8.38522 5.67544 8.28033 5.78033C8.17544 5.88522 8.04181 5.95665 7.89632 5.98559C7.75083 6.01453 7.60003 5.99968 7.46299 5.94291C7.32595 5.88614 7.20881 5.79001 7.1264 5.66668C7.04399 5.54334 7 5.39834 7 5.25C7 5.05109 7.07902 4.86032 7.21967 4.71967C7.36032 4.57902 7.55109 4.5 7.75 4.5ZM8.5 11.5C8.23479 11.5 7.98043 11.3946 7.7929 11.2071C7.60536 11.0196 7.5 10.7652 7.5 10.5V8C7.36739 8 7.24022 7.94732 7.14645 7.85355C7.05268 7.75979 7 7.63261 7 7.5C7 7.36739 7.05268 7.24021 7.14645 7.14645C7.24022 7.05268 7.36739 7 7.5 7C7.76522 7 8.01957 7.10536 8.20711 7.29289C8.39465 7.48043 8.5 7.73478 8.5 8V10.5C8.63261 10.5 8.75979 10.5527 8.85356 10.6464C8.94732 10.7402 9 10.8674 9 11C9 11.1326 8.94732 11.2598 8.85356 11.3536C8.75979 11.4473 8.63261 11.5 8.5 11.5Z"
                      fill="white"
                  />
                </g>
              </svg>
                        <!--					    <img src="@/assets/dex/details-info.svg" alt="info icon" class="tooltip-icon">-->
            </span>
                </p>
                <label v-if="isV5" for="" class="settings__label">
                    <input
                        v-model="maxSplits"
                        type="number"
                        class="settings__input"
                        inputmode="decimal"
                        autocomplete="off"
                        :class="{ active_input: activeMaxSplitsConditions }"
                        @input="changeMaxSplitsInput"
                        @blur="blurMaxSplitsInput"
                    />
                </label>
                <div class="settings__button-column intermediate-token">
                    <div v-if="!isV5" class="settings__button-group">
                        <button
                            class="settings__button"
                            :class="{ active: Number(maxSplits) === 1 }"
                            @click="changeMaxSplits(1)"
                        >
                            1
                        </button>
                        <button
                            class="settings__button"
                            :class="{ active: Number(maxSplits) === 2 }"
                            @click="changeMaxSplits(2)"
                        >
                            2
                        </button>
                        <button
                            class="settings__button"
                            :class="{ active: Number(maxSplits) === 3 }"
                            @click="changeMaxSplits(3)"
                        >
                            3
                        </button>
                        <button
                            class="settings__button"
                            :class="{ active: Number(maxSplits) === 4 }"
                            @click="changeMaxSplits(4)"
                        >
                            4
                        </button>
                    </div>
                    <div v-if="isV5" class="settings__button-group">
                        <button
                            class="settings__button"
                            :class="{ active: Number(maxSplits) === 1 }"
                            @click="changeMaxSplits(1)"
                        >
                            1
                        </button>
                        <button
                            class="settings__button"
                            :class="{ active: Number(maxSplits) === 5 }"
                            @click="changeMaxSplits(5)"
                        >
                            5
                        </button>
                        <button
                            class="settings__button yellow_status"
                            :class="{ active: Number(maxSplits) === 10 }"
                            @click="changeMaxSplits(10)"
                        >
                            10
                        </button>
                        <button
                            class="settings__button yellow_status"
                            :class="{ active: Number(maxSplits) === 20 }"
                            @click="changeMaxSplits(20)"
                        >
                            20
                        </button>
                    </div>
                </div>

                <p class="settings__text" v-if="!liquiditySourcesList?.length > 0">
                    {{ $t('dexSettings.sources.title') }}
                </p>
                <p class="settings__description" v-if="!liquiditySourcesList?.length > 0">
                    {{ $t('dexSettings.sources.text') }}
                </p>

                <div class="settings__block" v-if="!liquiditySourcesList?.length > 0">
                    <ul class="settings__block-list">
                        <li v-for="source in liquiditySources" :key="source" class="settings__block-item block-item">
                            <div class="block-item__left">
                                <img :src="getDexSourceDataByName(source?.name)?.imageUrl" :alt="source?.name" class="block-item__img">
                                <p class="block-item__title">{{ getDexSourceDataByName(source?.name)?.name }}</p>
                            </div>
                            <switch-toggle :class="{ active_switch: isActiveSource(source?.name)}" @click="changeLiquiditySources(source?.name)"/>
                        </li>
                    </ul>
                </div>
                <!--					<button class="settings__ignore-btn"-->
                <!--							:class="{active: Number(maxPoolVolatility) === -1}"-->
                <!--							@click="changeMaxPoolVolatility(-1)"-->
                <!--					>-->
                <!--						Unlimited-->
                <!--					</button>-->
            </div>
        </div>
    </modal-wrapper>
</template>

<script lang="ts">
import SwitchToggle from '@/components/ui/SwitchToggle.vue';
import TooltipWrapper from '@/components/ui/TooltipWrapper.vue';
import ModalWrapper from "@/components/ui/ModalWrapper.vue";
import MevSettings from "@/components/dex/MevSettings.vue";

import computedMixins from '@/mixins/computedMixins.ts';
import {profileService} from '@/api/coffeeApi/services/index.ts';
import {useDexSettingsStore} from "@/stores/dex/settings.ts";
import {useSettingsStore} from "@/stores/settings";
import {useDexStore} from "@/stores/dex";

import transactionRoutesMixin from '@/mixins/transactionRoutesMixin';

export default {
    name: 'DexSettings',
    components: {
        SwitchToggle,
        TooltipWrapper,
        ModalWrapper,
        MevSettings
    },
    mixins: [computedMixins, transactionRoutesMixin],
    inject: ['updateSettingsModalVisible', 'liquiditySourcesList'],
    data() {
        return {
            cashback: false,
            slippage: 0,
            priceImpact: 0,
            maxPoolVolatility: 0,
            maxIntermediateTokens: 0,
            maxSplits: 0,
            isV5: false,
            showTooltip: false,
          liquiditySources: [
            {
              name: 'dedust',
              enabled: true,
            },
            {
              name: 'stonfi',
              enabled: true,
            },
            {
              name: 'stonfi_v2',
              enabled: true,
            },
            {
              name: 'tonco',
              enabled: true,
            },
            {
              name: 'tonstakers',
              enabled: true,
            }
          ],
        };
    },
    computed: {
        dexSettingsStore() {
          return useDexSettingsStore()
        },
        settingsStore() {
          return useSettingsStore()
        },
        dexStore() {
          return useDexStore()
        },
        activeSlippageConditions() {
            let value = Number(this.slippage);
            if (value > 0 && value !== 1 && value !== 5 && value !== 10) {
                return true;
            } else {
                return false;
            }
        },
        activePriceImpactConditions() {
            let value = Number(this.priceImpact);
            if (value > 0 && value !== 5 && value !== 10 && value !== 30) {
                return true;
            } else {
                return false;
            }
        },
        getExpertMode() {
            return this.dexSettingsStore.GET_EXPERT_MODE_VALUE;
        },
        activeMaxSplitsConditions() {
            let value = Number(this.priceImpact);
            if (value === 0) {
                return true;
            } else {
                return false;
            }
        },
    },
    methods: {
        switchExpertMode() {
            const updatedExpertMode = !this.getExpertMode;
            this.dexSettingsStore.DEX_EXPERT_MODE(updatedExpertMode);
            this.saveToStorage('expertMode', updatedExpertMode);
            this.toggleExpertsSettingsValues(updatedExpertMode);
        },
        // switchCashback(value, notSave) {
        // 	// console.log(value, 'CASHBACK VALUE')
        // 	typeof value === 'boolean' ? this.cashback = value : this.cashback = !this.cashback
        // 	this.DEX_CASHBACK(this.cashback)
        // 	if (!notSave) {
        // 		this.saveToStorage('cashback', this.cashback)
        // 	}
        // },
        changeSlippage(value, notSave) {
            this.slippage = value;
            this.dexSettingsStore.DEX_SLIPPAGE(Number(value));
            if (!notSave) {
                this.saveToStorage('slippage', this.slippage);
            }
        },
        changeSlippageInput(event) {
            let inputValue = event.target.value;

            inputValue = inputValue.replace(',', '.');

            this.slippage = inputValue.replace(/[^0-9.]/g, '');

            let value = Number(this.slippage);
            if (value > 100) {
                this.slippage = 100;
            } else if (value < 0) {
                this.slippage = 1;
            }
            this.dexSettingsStore.DEX_SLIPPAGE(this.slippage);
            this.saveToStorage('slippage', this.slippage);
        },
        blurSlippageInput() {
            this.slippage = String(this.slippage).replace(',', '.');

            this.slippage = Number(this.slippage);

            if (isNaN(this.slippage) || this.slippage === 0) {
                this.slippage = 1;
            }

            this.dexSettingsStore.DEX_SLIPPAGE(this.slippage);
            this.saveToStorage('slippage', this.slippage);
        },
        changePriceImpactInput(event) {
            let inputValue = event.target.value;

            inputValue = inputValue.replace(',', '.');

            this.priceImpact = inputValue.replace(/[^0-9.]/g, '');

            let value = Number(this.priceImpact);

            if (value < 0) {
                this.priceImpact = '';
            } else if (value > 100) {
                this.priceImpact = 100;
            }

            this.dexSettingsStore.DEX_PRICE_IMPACT(this.priceImpact);
            this.saveToStorage('priceImpact', this.priceImpact);
        },
        blurPriceImpactInput() {
            this.priceImpact = String(this.priceImpact).replace(',', '.');

            this.priceImpact = Number(this.priceImpact)

            if (this.priceImpact.length === 0 || isNaN(Number(this.priceImpact))) {
                this.priceImpact = 10;
            } else if (Number(this.priceImpact) === 0) {
                this.priceImpact = 10;
            }

            this.dexSettingsStore.DEX_PRICE_IMPACT(this.priceImpact);
            this.saveToStorage('priceImpact', this.priceImpact);
        },
        changePriceImpact(value, notSave) {
            this.priceImpact = value;
            this.dexSettingsStore.DEX_PRICE_IMPACT(value);
            if (!notSave) {
                this.saveToStorage('priceImpact', value);
            }
        },
        changeMaxPoolVolatility(value, notSave) {
            this.maxPoolVolatility = value;
            this.dexSettingsStore.DEX_MAX_POOL_VOLATILITY(value);
            if (!notSave) {
                this.saveToStorage('maxPoolVolatility', value);
            }
        },
        changeMaxIntermediateTokens(value, notSave) {
            this.maxIntermediateTokens = value;
            this.dexSettingsStore.DEX_MAX_INTERMEDIATE_TOKENS(value);
            if (!notSave) {
                this.saveToStorage('maxIntermediateTokens', value);
            }
        },
        changeMaxSplits(value, notSave) {
            this.maxSplits = value;
            this.dexSettingsStore.DEX_MAX_SPLITS(value);
            if (!notSave) {
                this.saveToStorage('maxSplits', value);
            }
        },
        changeLiquiditySources(value, notSave) {
            if (this.liquiditySourcesList?.length > 0) return;

            this.liquiditySources = this.liquiditySources.map(el =>
                el.name === value ? { ...el, enabled: !el.enabled } : el
            );

            const enabledSources = this.liquiditySources
                .filter(e => e.enabled)
                .map(e => e.name);

            this.dexSettingsStore.DEX_LIQUIDITY_SOURCES(enabledSources);

            if (!notSave) {
                this.saveToStorage('liquiditySources', enabledSources);
            }
        },
        changeMaxSplitsInput() {
            let value = this.maxSplits.toString();

            if (!/^\d+$/.test(value)) {
                this.maxSplits = '';
                return;
            }

            let intValue = parseInt(value);
            if (this.isV5) {
                if (intValue > 20) {
                    this.maxSplits = 20;
                } else if (intValue < 1) {
                    this.maxSplits = 1;
                }
            } else {
                if (intValue > 4) {
                    this.maxSplits = 4;
                } else if (intValue < 1) {
                    this.maxSplits = 1;
                }
            }
            this.dexSettingsStore.DEX_MAX_SPLITS(this.maxSplits);
            this.saveToStorage('maxSplits', this.maxSplits);
        },
        async saveToStorage(key, value) {
            try {
                let settings = this.settingsStore.GET_USER_SETTINGS;
                if (!settings) {
                    let storage = JSON.parse(localStorage.getItem('dexSettings'));
                    if (storage) {
                        settings = storage;
                    } else {
                        settings = {};
                    }
                }

                if (!settings.hasOwnProperty('dexSettings')) {
                    settings.dexSettings = {};
                }
                settings.dexSettings[key] = value;

                localStorage.removeItem('dexSettings');
                localStorage.setItem('dexSettings', JSON.stringify(settings));
                if (this.dexStore.GET_PROOF_VERIFICATION && this.dexStore.GET_DEX_WALLET) {
                    await profileService.writeStorage(
                        this.dexStore.GET_DEX_WALLET?.address,
                        this.dexStore.GET_PROOF_VERIFICATION,
                        settings,
                    );
                }
            } catch (err) {
                console.error(err);
            }
        },
        async checkStorageSettings() {
            try {
                let settings = this.settingsStore.GET_USER_SETTINGS?.dexSettings;
                if (!settings) {
                    let storage = JSON.parse(localStorage.getItem('dexSettings'))?.dexSettings;
                    if (storage) {
                        settings = storage;
                    } else {
                        settings = {};
                    }
                }

                if (settings.hasOwnProperty('expertMode')) {
                    this.dexSettingsStore.DEX_EXPERT_MODE(settings.expertMode);
                }
                settings.hasOwnProperty('slippage')
                    ? this.changeSlippage(settings.slippage, true)
                    : (this.slippage = this.dexSettingsStore.GET_SLIPPAGE);
                // settings.hasOwnProperty("cashback") ? this.switchCashback(settings.cashback, true) : this.cashback = this.GET_CASHBACK
                if (settings.hasOwnProperty('cashback')) {
                    delete settings.cashback;
                }

                if (this.getExpertMode) {
                    settings.hasOwnProperty('priceImpact')
                        ? this.changePriceImpact(settings.priceImpact, true)
                        : (this.priceImpact = this.dexSettingsStore.GET_PRICE_IMPACT);
                    settings.hasOwnProperty('maxPoolVolatility')
                        ? this.changeMaxPoolVolatility(settings.maxPoolVolatility, true)
                        : (this.maxPoolVolatility = this.dexSettingsStore.GET_MAX_POOL_VOLATILITY);
                    settings.hasOwnProperty('maxIntermediateTokens')
                        ? this.changeMaxIntermediateTokens(settings.maxIntermediateTokens, true)
                        : (this.maxIntermediateTokens = this.dexSettingsStore.GET_MAX_INTERMEDIATE_TOKENS);
                    settings.hasOwnProperty('maxSplits')
                        ? this.changeMaxSplits(settings.maxSplits, true)
                        : (this.maxSplits = this.dexSettingsStore.GET_MAX_SPLITS);
                    settings.hasOwnProperty('liquiditySources')
                        ? this.liquiditySources = this.liquiditySources.map(n => ({
                            name: n?.name,
                            enabled: settings.liquiditySources.some(source => source === n?.name),
                        }))
                        : (this.liquiditySources = this.dexSettingsStore.GET_LIQUIDITY_SOURCES.map(name => ({
                            name: name,
                            enabled: this.liquiditySources.some(source => source.name === name),
                        })));
                }
            } catch (err) {
                console.error(err);
            }
        },
        toggleExpertsSettingsValues(expertModeValue) {
            let settings = this.settingsStore.GET_USER_SETTINGS?.dexSettings;
            if (!settings) {
                let storage = JSON.parse(localStorage.getItem('dexSettings'))?.dexSettings;
                if (storage) {
                    settings = storage;
                } else {
                    settings = {};
                }
            }

            if (expertModeValue) {
                settings.hasOwnProperty('priceImpact')
                    ? this.changePriceImpact(settings.priceImpact, true)
                    : this.changePriceImpact(this.dexSettingsStore.GET_PRICE_IMPACT);
                settings.hasOwnProperty('maxPoolVolatility')
                    ? this.changeMaxPoolVolatility(settings.maxPoolVolatility, true)
                    : this.changeMaxPoolVolatility(this.dexSettingsStore.GET_MAX_POOL_VOLATILITY);
                settings.hasOwnProperty('maxIntermediateTokens')
                    ? this.changeMaxIntermediateTokens(settings.maxIntermediateTokens, true)
                    : this.changeMaxIntermediateTokens(this.dexSettingsStore.GET_MAX_INTERMEDIATE_TOKENS);
                settings.hasOwnProperty('maxSplits')
                    ? this.changeMaxSplits(settings.maxSplits, true)
                    : (this.maxSplits = this.dexSettingsStore.GET_MAX_SPLITS);
                settings.hasOwnProperty('liquiditySources')
                    ? this.changeLiquiditySources(settings.liquiditySources, true)
                    : (this.liquiditySources =  this.dexSettingsStore.GET_LIQUIDITY_SOURCES.map(name => ({
                            name: name,
                            enabled: this.liquiditySources.some(source => source.name === name),
                        })));
            } else {
                this.dexSettingsStore.CLEAR_DEX_EXPERTS_SETTINGS();
                this.priceImpact = this.dexSettingsStore.GET_PRICE_IMPACT;
                this.maxPoolVolatility = this.dexSettingsStore.GET_MAX_POOL_VOLATILITY;
                this.maxIntermediateTokens = this.dexSettingsStore.GET_MAX_INTERMEDIATE_TOKENS;
                this.maxSplits = this.dexSettingsStore.GET_MAX_SPLITS;
            }
        },
        blurMaxSplitsInput() {
            if (this.maxSplits.length === 0) {
                if (this.isV5) {
                    this.maxSplits = 20;
                } else {
                    this.maxSplits = 4;
                }
            } else if (Number(this.maxSplits) === 0) {
                if (this.isV5) {
                    this.maxSplits = 20;
                } else {
                    this.maxSplits = 4;
                }
            }
            this.dexSettingsStore.DEX_MAX_SPLITS(this.maxSplits);
            this.saveToStorage('maxSplits', this.maxSplits);
        },
        isV5WalletChecker() {
            this.isV5 = this.dexStore.GET_DEX_WALLET_VERSION >= 5;
            return this.isV5;
        },
        closeTooltip() {
            this.showTooltip = false;
        },
        isActiveSource(source) {
            return this.liquiditySources.some(s => s.name === source && s.enabled);
        },
    },
    watch: {
        'dexStore.GET_DEX_WALLET_VERSION': {
            handler() {
                this.isV5WalletChecker();
                let settings = this.settingsStore.GET_USER_SETTINGS;
                if (!settings) {
                    settings = JSON.parse(localStorage.getItem('dexSettings'));
                }
                if (settings?.dexSettings?.maxSplits >= 0) {
                    return;
                }
                if (this.isV5 === true) {
                    this.changeMaxSplits(20);
                } else if (this.isV5 === false) {
                    this.changeMaxSplits(4);
                }
                this.dexSettingsStore.DEX_MAX_SPLITS(this.maxSplits);
            },
        },
        'settingsStore.GET_USER_SETTINGS': {
            handler() {
                this.checkStorageSettings();
            },
        },
    },
    mounted() {
        this.checkStorageSettings();
        // this.slippage = this.dexSettingsStore.GET_SLIPPAGE
        // this.priceImpact = this.dexSettingsStore.GET_PRICE_IMPACT
        // this.cashback = this.GET_CASHBACK
    },
};
</script>

<style scoped>

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

.settings__item-mode {
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
  gap: 6px;
  align-items: center;
}

.settings__icon {
  margin-right: 5px;
  width: 20px;
  height: 20px;
}

.settings__name {
  font-size: 14px;
  font-family: Harmony-Medium, sans-serif;
}

.settings__text-info {
  font-size: 14px;
  line-height: 16px;
  color: #8c8c8d;
}

.settings__text {
  margin-bottom: 5px;
  font-size: 14px;
  font-family: Harmony-Medium, sans-serif;
}

.settings__description {
  margin-bottom: 15px;
  font-size: 14px;
  line-height: 16px;
  font-weight: 400;
  color: #8c8c8d;
}

.settings__input {
  background: var(--iface-white6);
  margin-bottom: 10px;
  width: 100%;
  font-size: 14px;
  font-weight: 500;
  padding: 10px 12px;
  text-align: center;
  border-radius: 12px;
  transition: 0.15s;
  outline: none;
  border: 0px solid var(--iface-white6);
}

.settings__input:hover {
  background: var(--iface-white4);
}

.settings__input:active {
  background: var(--iface-white6);
}

.settings__input:focus {
  background: var(--iface-white6);
}

.settings__input:disabled {
  cursor: not-allowed;
}

.active_input {
  border: 1px solid var(--iface-accent-color);
  color: var(--iface-accent-color);
}

.active_input:hover {
  border: 1px solid var(--iface-accent-color);
  color: var(--iface-accent-color);
  background: var(--iface-white4);
}

.block-slippage {
  display: flex;
  align-items: center;
  gap: 0 10px;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--iface-white6);
  margin-bottom: 20px;
}

.settings__button-block {
  display: flex;
  gap: 0 10px;
  margin-bottom: 8px;
}

.show_expert .settings__button-block {
  padding-bottom: 20px;
  border-bottom: 1px solid var(--iface-white6);
  margin-bottom: 20px;
}

.block-settings {
  padding-bottom: 20px;
  border-bottom: 1px solid var(--iface-white6);
  margin-bottom: 20px;
}

.settings__button {
  transition: 0.15s;
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
  color: #4a7cfd;
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

.settings__block {
  padding: 14px;
  border-radius: 12px;
  background: var(--iface-white4);
}

.block-item {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 14px 0;
}

.block-item:first-child {
  padding: 0 0 14px 0;
}

.block-item:last-child {
  padding: 14px 0 0 0;
}

.block-item:not(:last-child):after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 1px;
  background: var(--iface-white6);
}

.block-item__left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.block-item__img {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  object-fit: cover;
}

.block-item__title {
  font-weight: 500;
}

@media screen and (max-width: 768px) {
  .settings__content {
    max-height: calc(100dvh - 66px);
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
    max-height: calc(100dvh - 66px);
    height: auto;
    overflow-y: auto;
  }
}
</style>

