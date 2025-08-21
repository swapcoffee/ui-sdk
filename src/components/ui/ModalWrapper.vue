<template>
    <div
        :class="[{free_height: freeHeight}, 'modal']"
        @mousedown.self="handleClickOutside"
    >
        <div :class="[{padding_zero: paddingZero}, 'modal__content', modalClass]">
            <div v-if="showGroup" class="modal__group">
                <h2 class="modal__title">{{ title }}</h2>
                <button
                    class="modal__close-btn"
                    @click="handleClose"
                    :disabled="disabled"
                >
                    <CloseIcon />
                </button>
            </div>
            <slot></slot>
        </div>
    </div>
</template>

<script lang="ts">
import CloseIcon from "@/assets/dex/icons/CloseIcon.vue";
import {useDexStore} from "@/stores/dex";

export default {
    name: "ModalWrapper",
    components: {CloseIcon},
    props: {
        title: {
            type: String,
            default() {
                return ''
            }
        },
        paddingZero: {
            type: Boolean,
            default() {
                return false
            }
        },
        freeHeight: {
            type: Boolean,
            default() {
                return false
            }
        },
        disabled: {
            type: Boolean,
            default: false
        },
        showGroup: {
            type: Boolean,
            default: true
        },
        modalClass: {
            type: [String, Object, Array],
            default: null
        }
    },
    computed: {
      dexStore() {
        return useDexStore()
      }
    },
    methods: {
        handleClickOutside() {
            this.handleClose()
        },
        handleClose() {
            if (!this.disabled) {
                this.$emit('closeModal');
            }
        },
        keyEvent(e) {
            if (e.key === 'Escape') {
                this.handleClose()
            }
        }
    },
    mounted() {

        document.addEventListener('keydown', this.keyEvent)
        document.documentElement.style.overflow = 'hidden'
        
        this.dexStore.DEX_OPEN_MODAL(true)
    },
    unmounted() {
        document.removeEventListener('keydown', this.keyEvent)
        document.documentElement.style.overflow = 'auto'
        
        this.dexStore.DEX_OPEN_MODAL(false)
        
    }
}
</script>

<style scoped>
.modal {
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

.modal__content {
    width: 450px;
    z-index: 999;
    background: var(--modal-bg);
    border-radius: 12px;
    padding: 16px;
}

.padding_zero {
    padding: 0;
}


.modal__group {
    margin-bottom: 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.padding_zero .modal__group {
    padding: 18px 18px 0 18px;
}

.modal__title {
    font-size: 24px;
    line-height: normal;
    font-weight: 500;
    font-family: Harmony-Medium, sans-serif;
}

.modal__close-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 30px;
    width: 30px;
    height: 30px;
    border: none;
    border-radius: 8px;
    outline: none;
    background: var(--iface-white10);
}

@media screen and (max-height: 600px) {
  .modal__content {
    height: 100dvh;
  }
}

@media screen and (max-width: 768px) {
    .modal__content {
        z-index: 1200;
        position: fixed;
        width: 100%;
        height: 100%;
        left: 0;
        right: 0;
        bottom: 0;
        border-radius: 0;
    }

    .free_height {
        padding: 6px;
        display: flex;
        flex-direction: column;
        justify-content: flex-end;
    }

    .free_height .modal__content {
        position: static;
        height: auto;
        border-radius: 14px;
    }
}
</style>
