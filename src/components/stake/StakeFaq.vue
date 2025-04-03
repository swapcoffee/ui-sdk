<template>
  <div class="faq__wrapper">
    <div
        :class="['faq__item', { 'faq__item--expanded': stake.expanded }]"
        v-for="(stake, index) in computedStakes"
        :key="index"
        @click="toggleExpand(index)"
    >
      <div class="item__header">
        <p class="item__title">{{ stake.title }}</p>
        <div :class="['item__expand', { 'expanded': stake.expanded }]">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
            <g opacity="0.8">
              <path d="M13.3535 6.35372L8.35354 11.3537C8.3071 11.4002 8.25196 11.4371 8.19126 11.4623C8.13056 11.4874 8.0655 11.5004 7.99979 11.5004C7.93408 11.5004 7.86902 11.4874 7.80832 11.4623C7.74762 11.4371 7.69248 11.4002 7.64604 11.3537L2.64604 6.35372C2.55222 6.2599 2.49951 6.13265 2.49951 5.99997C2.49951 5.86729 2.55222 5.74004 2.64604 5.64622C2.73986 5.5524 2.86711 5.49969 2.99979 5.49969C3.13247 5.49969 3.25972 5.5524 3.35354 5.64622L7.99979 10.2931L12.646 5.64622C12.6925 5.59977 12.7476 5.56292 12.8083 5.53778C12.869 5.51263 12.9341 5.49969 12.9998 5.49969C13.0655 5.49969 13.1305 5.51263 13.1912 5.53778C13.2519 5.56292 13.3071 5.59977 13.3535 5.64622C13.4 5.69268 13.4368 5.74783 13.462 5.80852C13.4871 5.86922 13.5001 5.93428 13.5001 5.99997C13.5001 6.06567 13.4871 6.13072 13.462 6.19142C13.4368 6.25212 13.4 6.30727 13.3535 6.35372Z" fill="white"/>
            </g>
          </svg>
        </div>
      </div>
      <p v-if="stake.expanded" class="item__description" >
        {{ stake.description }}
      </p>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  name: "StakeFaq",
  data() {
    return {
      stakes: [
        {
          title: this.$t('stakeFaq.questions[0]'),
          description: this.$t('stakeFaq.answers[0]'),
          expanded: false
        },
        {
          title: this.$t('stakeFaq.questions[1]'),
          description: this.$t('stakeFaq.answers[1]'),
          expanded: false
        },
        {
          title: this.$t('stakeFaq.questions[2]'),
          description: this.$t('stakeFaq.answers[2]', {token: this.getSymbol}),
          expanded: false
        },
        {
          title: this.$t('stakeFaq.questions[3]'),
          description: this.$t('stakeFaq.answers[3]'),
          expanded: false
        },
        {
          title: this.$t('stakeFaq.questions[4]'),
          description: this.$t('stakeFaq.answers[4]', {token: this.getSymbol}),
          expanded: false
        },
        {
          title: this.$t('stakeFaq.questions[5]'),
          description: this.$t('stakeFaq.answers[5]'),
          expanded: false
        },
        {
          title: this.$t('stakeFaq.questions[6]'),
          description: this.$t('stakeFaq.answers[6]'),
          expanded: false
        }
      ]
    };
  },
  computed: {
    ...mapGetters(['GET_STAKE_NATIVE']),
    computedStakes() {
      return this.stakes.map((stake, index) => {
        if ([2, 4].includes(index)) {
          return {
            ...stake,
            description: this.$t(`stakeFaq.answers[${index}]`, { token: this.getSymbol }),
          };
        }
        return stake;
      });
    },
    getSymbol() {
      if (this.GET_STAKE_NATIVE) {
        return this.GET_STAKE_NATIVE?.symbol
      }
    },
  },
  methods: {
    toggleExpand(index) {
      this.stakes[index].expanded = !this.stakes[index].expanded;
    },
  },
}
</script>


<style scoped>
.faq__wrapper {
  gap: 4px;
  width: 100%;
  display: flex;
  justify-content: center;
  flex-direction: column;
  align-items: center;
}

.faq__item {
  gap: 12px;
  width: 100%;
  border-radius: 12px;
  padding: 12px;
  background: var(--iface-white6);
  display: flex;
  flex-direction: column;
  cursor: pointer;
  transition: 0.2s all;
}

.faq__item:hover {
  background: var(--iface-white8)
}

.item__header {
  width: 100%;
  display: flex;
  gap: 12px;
  justify-content: space-between;
  align-items: center;
}

.item__expand {
  display: flex;
  justify-content: center;
  align-items: center;
  transition: transform 0.3s ease;
}

.item__expand.expanded {
  transform: rotateX(180deg);
}

.item__title {
    font-size: 14px;
    font-weight: 400;
    line-height: 17px;
    color: var(--main-text-color);
}

.faq__item--expanded {
  background: var(--iface-white10);
}

.faq__item--expanded:hover {
  background: var(--iface-white10) ;
}

.item__description {
  font-size: 13px;
  line-height: 14px;
  opacity: 0.8;
  white-space: pre-wrap;
}

svg path {
  fill: var(--main-text-color);
}
</style>
