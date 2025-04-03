<template>
  <div class="switch">
    <div class="switch-toggle" />
  </div>
</template>

<script>
export default {
  name: 'SwitchToggle',
  data() {
    return {};
  },
};
</script>

<style scoped>
.switch {
  transition: 0.15s;
  min-width: 42px;
  height: 26px;
  padding: 2px;
  border-radius: 100px;
  background: var(--iface-white10);
  cursor: pointer;
}

.switch-toggle {
  transition: 0.15s linear;
  width: 22px;
  height: 22px;
  border-radius: 100px;
  background: #fff;
}

.active_switch {
  background: var(--iface-accent-color);
}

.active_switch .switch-toggle {
  background: #fff;
  transform: translateX(16px);
  border: none;
}

.switch:not(.active_switch):hover {
  background: var(--iface-white14);
}

.active_switch:hover {
  background: var(--iface-accent-hover);
}
</style>
