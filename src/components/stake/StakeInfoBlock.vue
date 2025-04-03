<template>
    <div class="stake__info-block">
        <div class="icon__substrate">
            <img :alt="`${title}-icon`" class="stake__icon" :src="iconMap[iconSrc]">
        </div>
        <div class="block__name">{{ title }}</div>
        <div class="block__value">
            <skeleton-item
                v-if="isLoading"
                class="skeleton__value"
            />
            <span v-else>{{ value }}</span>
        </div>
    </div>
</template>

<script>
import tagIcon from '@/assets/stake/tag.svg';
import dbFilledIcon from '@/assets/stake/db-filled.svg';
import dbIcon from '@/assets/stake/db.svg';
import commitIcon from '@/assets/stake/commit.svg'
import circlesIcon from '@/assets/stake/circles.svg'
import pulseIcon from '@/assets/stake/pulse.svg'
import pigIcon from '@/assets/stake/pig.svg'

export default {
  name: "StakeInfoBlock",
  props: {
    iconSrc: {
      type: String,
      required: true
    },
    title: {
      type: String,
      required: true
    },
    value: {
      type: String,
      required: true
    },
    isLoading: {
      type: Boolean,
      required: true
    }
  },
  data() {
    return {
      iconMap: {
        '1': tagIcon,
        '2': dbFilledIcon,
        '3': dbIcon,
        '4': commitIcon,
        '5': circlesIcon,
        '6': pulseIcon,
        '7': pigIcon
      }
    };
  }
}
</script>

<style scoped>
.stake__info-block {
    border-radius: 12px;
    height: 121px;
    padding: 14px;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    background-color: var(--iface-white4);
}

.icon__substrate {
  margin-bottom: 14px;
  border-radius: 12px;
  background-color: var(--iface-white4);
  height: 36px;
  width: 36px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.block__name {
    opacity: 0.6;
    margin-bottom: 6px;
    font-size: 12px;
    font-weight: 400;
    line-height: 15px;
    color: var(--main-text-color);
}

.block__value {
    font-size: 18px;
    line-height: 22px;
    font-weight: 400;
    color: var(--main-text-color);
}

.theme-light svg path {
  fill: #141414;
}

.theme-light .stake__icon {
  mix-blend-mode: difference;
}

.skeleton__value {
    height: 22px;
    width: 100%;
}

@media screen and (max-width: 576px) {
    .skeleton__value {
        width: 100%;
    }
}
</style>
