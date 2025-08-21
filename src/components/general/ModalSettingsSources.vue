<template>
    <div class="settings sources">
        <p class="sources__text">
            {{ title }}
        </p>
        <p class="sources__description">
            {{ text }}
        </p>
        <div class="sources__block">
            <div class="sources__block-list">
                <div class="source__actions">
                    <p class="source__actions-count">
                        {{ $t("poolsActions.selected") }}: {{ selectedCount }}
                    </p>
                    <div class="source__actions-btn-box">
                        <button
                            v-if="!allSelected"
                            class="source__actions-btn"
                            @click="selectAll"
                        >
                            {{ $t("claimTokens.category[0]") }}
                        </button>
                        <button
                            v-if="selectedCount > 1"
                            class="source__actions-btn"
                            @click="clearAll"
                        >
                            {{ $t("poolsActions.clearAll") }}
                        </button>
                    </div>
                </div>
                <SourceItem
                    v-for="source in getCurrentValue"
                    :key="source"
                    :item="source"
                    @toggle="toggleSource"
                />
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import SwitchToggle from "@/components/ui/SwitchToggle.vue"
import SourceItem from "@/components/general/SourceItem.vue";

export default {
    name: "ModalSettingsSources",
    components: {SourceItem, SwitchToggle },
    data() {
        return {}
    },
    inject: ["settingsValue", "settingsUpdaters"],
    props: {
        type: {
            type: String,
            required: true
        },
        title: {
            type: String,
            required: true
        },
        text: {
            type: String,
            required: true
        },
    },
    computed: {
        getCurrentValue() {
            return this.settingsValue[this.type]
        },
        selectedCount() {
            return this.getCurrentValue.filter(source => source.enabled).length
        },
        allSelected() {
            return this.selectedCount === this.getCurrentValue.length
        }
    },
    methods: {
        toggleSource(value) {
            const dex = this.getCurrentValue.find(item => item.id === value);
            if (dex && dex.enabled && this.selectedCount <= 1) {
                return;
            }

            this.settingsUpdaters[this.type](value)
        },
        selectAll() {
            this.getCurrentValue.forEach(source => {
                if (!source.enabled) {
                    this.settingsUpdaters[this.type](source.id)
                }
            })
        },
        clearAll() {
            const coffeeSource = this.getCurrentValue.find(item => item.id === 'coffee');

            if (coffeeSource) {
                if (!coffeeSource.enabled) {
                    this.settingsUpdaters[this.type](coffeeSource.id);
                }

                this.getCurrentValue.forEach(source => {
                    if (source.id !== 'coffee' && source.enabled) {
                        this.settingsUpdaters[this.type](source.id);
                    }
                });
            } else {
                let firstEnabledSource = null;

                for (const source of this.getCurrentValue) {
                    if (source.enabled) {
                        if (!firstEnabledSource) {
                            firstEnabledSource = source;
                        } else {
                            this.settingsUpdaters[this.type](source.id);
                        }
                    }
                }
            }
        }
    }
}
</script>

<style scoped>
.sources__text {
    margin-bottom: 4px;
    font-size: 15px;
    line-height: 18px;
    font-weight: 500;
    font-family: Harmony-Medium, sans-serif;
}

.sources__description {
    margin-bottom: 15px;
    font-size: 14px;
    line-height: 16px;
    font-weight: 400;
    color: #8c8c8d;
}

.sources__block {
    border-radius: 12px;
    background: var(--iface-white4);
    padding: 0 14px
}

.source__actions {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding: 14px 0;
    border-bottom: 1px solid var(--iface-white6);
}

.source__actions-count {
    display: flex;
    align-items: center;
    font-family: Harmony-Regular, sans-serif;
    font-weight: 400;
    font-size: 14px;
    opacity: 0.6;
}

.source__actions-btn-box {
    display: flex;
    align-items: center;
    gap: 10px;
}

.source__actions-btn {
    font-family: Harmony-Regular, sans-serif;
    font-weight: 400;
    font-size: 14px;
    border: none;
    outline: none;
    transition: 0.2s;
    background: transparent;
    color: var(--iface-accent-color);
}

.source__actions-btn:hover {
    color: var(--iface-accent-hover);
}
</style>