<template>
  <modal-wrapper
    id="popup"
    :title="$t('dexSettings.caption')"
  >
    <MevSettings />
  </modal-wrapper>
</template>

<script lang="ts">
import ModalWrapper from '@/components/ui/ModalWrapper.vue';
import MevSettings from './MevSettings.vue';

export default {
  name: 'MevSettingPopup',
  components: { ModalWrapper, MevSettings }
};
</script>

<style scoped>
</style>
