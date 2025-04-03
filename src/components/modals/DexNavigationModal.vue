<template>
    <modal-wrapper
        class="modal"
        :title="$t('tradeMode.title')"
        :freeHeight="true"
        @closeModal="$emit('closeNavigation')"
    >
        <div class="modal__content">
            <div
                v-for="(item, index) in navActions"
                :class="[{active: item.isActive}, 'modal__card']"
                :key="index"
                @click="item.action"
            >
                <div class="modal__group">
                    <p class="modal__title">{{ item?.text }}</p>
                    <p class="modal__text">{{ item?.desc }}</p>
                </div>
                <DoneIcon
                    v-if="item.isActive"
                />
            </div>
        </div>
    </modal-wrapper>
</template>

<script>
import ModalWrapper from "@/components/ui/ModalWrapper.vue";
import DoneIcon from "@/assets/dex/icons/Done.vue";

export default {
    name: "DexNavigationModal",
    components: {DoneIcon, ModalWrapper},
    props: {
        navActions: {
            type: Array,
            default() {
                return []
            }
        }
    },
    data() {
        return {}
    }
}
</script>

<style scoped>
.modal__content {
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.modal__card {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 14px;
    border-radius: 12px;
    background: var(--iface-white6);
    transition: .2s;
}

.modal__card:hover {
    background: var(--iface-white10);
}

.active {
    background: var(--iface-blue-bg) ;
}

.active:hover {
    background: var(--iface-accent-hover);
}

.theme-coffee .active{
  background: var(--iface-accent-color) !important;
}

.modal__title {
    margin-bottom: 2px;
    font-size: 15px;
    font-family: Harmony-Medium, sans-serif;
}

.theme-light .active .modal__title {
    color: var(--main-white);
}

.theme-light .active .modal__text {
  color: var(--main-white);
}

.theme-coffee .active .modal__title {
    color: var(--main-white);
}

.theme-coffee .active .modal__text {
    color: var(--main-white);
}


.modal__text {
    font-size: 13px;
    opacity: 0.6;
}

</style>
