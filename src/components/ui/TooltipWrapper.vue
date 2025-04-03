<template>
  <div class="tooltip">
    <button class="close-btn" @click.stop="$emit('hiddenTooltip')" />
    <p class="tooltip__text">
      <slot />
    </p>
    <img src="@/assets/dex/tooltip-arrow.svg" alt="tooltip arrow" :class="arrowClass" />
  </div>
</template>


<script lang="ts">
export default {
  name: 'TooltipWrapper',
  props: {
    arrowPosition: {
      type: String,
      default: 'bottom',
    },
  },
  computed: {
    arrowClass() {
      return this.arrowPosition === 'top' ? 'tooltip__arrow--top' : 'tooltip__arrow--bottom';
    },
  },
};

</script>

<style scoped>
.tooltip {
  z-index: 999;
  position: absolute;
  min-width: 280px;
  padding: 10px;
  border-radius: 10px;
  background: var(--iface-tooltip-bg);
  border: 1px solid rgba(255, 255, 255, 0.14);
  box-shadow: 0px 4px 25px 0px rgba(0, 0, 0, 0.15);
}

.close-btn {
  display: none;
  position: absolute;
  top: 10px;
  right: 10px;
  width: 16px;
  height: 16px;
  border: none;
  background: transparent;
  background: url('@/assets/dex/close-icon.svg') no-repeat;
}

.tooltip__text {
  font-size: 13px;
  line-height: 16px;
  letter-spacing: 0.4px;
  color: #fff;
  font-weight: 400;
}

.theme-light .tooltip__text {
    color: var(--main-text-color);
}

.tooltip__arrow--bottom {
  position: absolute;
  width: 10px;
  height: 6px;
  bottom: -6px;
  left: 50%;
  transform: translateX(-50%);
}

.theme-light .tooltip__arrow--bottom {
  filter: invert(1);
}

.tooltip__arrow--top {
  position: absolute;
  width: 10px;
  height: 6px;
  top: -6px;
  left: 90%;
  transform: translateX(-50%) rotate(180deg);
}

@media screen and (max-width: 640px) {
  .tooltip {
    width: 100%;
  }

  .close-btn {
    display: block;
  }

  .tooltip__arrow {
    display: none;
  }
}
</style>
