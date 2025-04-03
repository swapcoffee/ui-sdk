<template>
    <modal-wrapper
        class="modal"
        :title="'Pool Settings'"
        @closeModal="$emit('closeModal')"
    >
        <div class="modal__flex">
            <div class="modal__source-wrapper">
                <SourceItem
                    v-for="(item, index) in sourceList"
                    :key="index"
                    :item="item"
                />
            </div>
            <button class="modal__button"
                    @click="saveSettings"
            >
                Save settings
            </button>
        </div>
    </modal-wrapper>
</template>

<script>

import SourceItem from "@/components/earn/all-pools/SourceItem.vue";

export default {
    name: "PoolSettingsModal",
    components: {SourceItem},
    data() {
        return {
            sourceList: [
                {
                    id: 1,
                    name: "DeDust.io",
                    image_url: "",
                    enabled: false
                },
                {
                    id: 2,
                    name: "STON.FI",
                    image_url: "",
                    enabled: false
                },
                {
                    id: 3,
                    name: "EVAA",
                    image_url: "",
                    enabled: false
                },
                {
                    id: 4,
                    name: "Storm Trade",
                    image_url: "",
                    enabled: false
                }
            ]
        }
    },
    methods: {
        saveSettings() {
            console.log('save')
        },
    }
}
</script>

<style scoped>
    .modal__source-wrapper {
        margin-bottom: 14px;
        border-radius: 12px;
        background: var(--iface-white6);
    }

    .modal__button {
        width: 100%;
        height: 50px;
        border-radius: 12px;
        border: none;
        outline: none;
        background: var(--earn-accent);
        backdrop-filter: blur(20px);
        font-size: 16px;
        font-weight: 500;
        transition: .2s;
    }

    .modal__button:hover {
        background: var(--earn-hover);
    }

    @media screen and (max-width: 768px) {
        .modal__flex {
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            height: calc(100% - 44px);
        }
    }
</style>
