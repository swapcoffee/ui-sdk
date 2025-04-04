<template>
  <div class="main-color">
    <slot />
  </div>
</template>

<script lang="ts">
export default {
  name: 'MainColor',
  data() {
    return {};
  },
};
</script>

<style scoped>
.main-color {
  background: var(--iface-main-bg);
}
</style>
