<template>
  <div class="tag" :style="{backgroundColor: getBackgroundColor}" :class="color.length === 0 ? getClass : ''">
    <component
        v-if="getIconComponent && showIcon"
        :is="getIconComponent"
        class="tag__icon"
    />
    <p v-else class="tag__name" :style="{color: color}">{{ getLabelName }}</p>
  </div>
</template>

<script lang="ts">
import HotIcon from "@/assets/dex/icons/HotIcon.vue"
import StarIcon from "@/assets/dex/icons/StarIcon.vue"
import NewIcon from "@/assets/dex/icons/NewIcon.vue"
import CommunityIcon from "@/assets/dex/icons/CommunityIcon.vue"
import ContestIcon from "@/assets/dex/icons/ContestIcon.vue"
import CashbackIcon from "@/assets/dex/icons/CashbackIcon.vue"
import WhiteListIcon from "@/assets/dex/icons/WhiteListIcon.vue";

export default {
  name: "InterfaceTag",
  components: {
    HotIcon,
    StarIcon,
    NewIcon,
    CommunityIcon,
    ContestIcon,
    CashbackIcon,
    WhiteListIcon
  },
  props: {
    tag: {
      type: String,
      default() {
        return 'soon'
      },
      required: true
    },
    color: {
      type: String,
      default() {
        return ''
      }
    },
    showIcon: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {}
  },
  computed: {
    getIconComponent() {
      const iconMap = {
        hot: "HotIcon",
        star: "StarIcon",
        new: "NewIcon",
        community: "CommunityIcon",
        contest: "ContestIcon",
        cashback: "CashbackIcon",
        whitelisted: "WhiteListIcon"
      }

      return iconMap[this.tag] || null
    },
    getBackgroundColor() {
      return this.color + '1A'
    },
    getClass() {
      if (this.tag === 'new') {
        return 'new_color'
      } else if (this.tag === 'cashback') {
        return 'cashback_color'
      } else if (this.tag === 'contest') {
        return 'contest_color'
      } else if (this.tag === 'community') {
        return 'community_color'
      } else if (this.tag === 'hot') {
        return 'hot_color'
      } else if (this.tag === 'star') {
        return 'blue_color'
      } else if (this.tag === 'whitelisted') {
        return 'whitelisted_color'
      } else {
        return 'gray_color'
      }
    },
    getLabelName() {
      if (this.tag === 'new') {
        return this.$t('interfaceTag.new')
      } else if (this.tag === 'cashback') {
        return this.$t('interfaceTag.cashback')
      } else if (this.tag === 'contest') {
        return this.$t('interfaceTag.contest')
      } else if (this.tag === 'community') {
        return this.$t('interfaceTag.community')
      } else if (this.tag === 'whitelisted') {
        return 'Listed'
      } else if (this.tag === 'hot') {
        return this.$t('interfaceTag.hot')
      } else if (this.tag === 'star') {
        return this.$t('interfaceTag.star')
      } else {
        return this.$t('interfaceTag.soon')
      }
    }
  }
}
</script>

<style scoped>
.tag {
  padding: 4px 6px;
  border-radius: 8px;
  background: var(--iface-white6);
  display: flex;
  align-items: center;
  justify-content: center;
  height: 22px;
}

.tag__name {
  font-size: 12px;
  line-height: 14px;
  font-weight: 500;
}

.tag__icon {
  width: 18px;
  height: 18px;
}

.new_color .tag__icon {
  color: var(--main-green);
}

.hot_color .tag__icon {
  color: rgba(255, 207, 85, 1);
}

.blue_color .tag__icon {
  color: rgba(0, 122, 255, 1);
}

.cashback_color .tag__icon {
  color: rgba(239, 144, 76, 1);
}

.community_color .tag__icon {
  color: rgba(235, 94, 188, 1);
}

.whitelisted_color .tag__icon {
  color: rgba(110, 110, 110, 1);
}

.contest_color .tag__icon {
  color: rgba(193, 114, 255, 1)
}

.contest_color {
  background: rgba(193, 114, 255, 0.20);
}

.whitelisted_color {
  background: rgba(110, 110, 110, 0.20);
}

.hot_color {
  background: rgba(255, 207, 85, 0.20);
}

.new_color {
  background: var(--tag-green-bg);
}

.community_color {
  background: rgba(235, 94, 188, 0.20);
}

.contest_color {
  background: rgba(255, 156, 114, 0.1);
}

.cashback_color {
  background: rgba(239, 144, 76, 0.20);
}

.blue_color {
  background: rgba(0, 122, 255, 0.2);
}

.gray_color {
  background: var(--iface-white10);
}

.contest_color .tag__name {
  color: rgba(255, 156, 114, 1);
}

.new_color .tag__name {
  color: var(--main-green);
}

.contest_color .tag__name {
  color: rgba(255, 156, 114, 1);
}

.blue_color .tag__name {
  color: #007aff;
}

.gray_color .tag__name {
  color: var(--main-text-color);
}
</style>