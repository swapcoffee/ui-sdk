<template>
  <div class="faq__wrapper">
    <div
      v-for="(referral, index) in referrals"
      :key="index"
      class="faq__item"
      @click="toggleExpand(index)"
    >
      <div class="item__header">
        <p class="item__title">
          {{ referral.title }}
        </p>
        <div :class="['item__expand', { expanded: referral.expanded }]">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M15.0228 7.14798L9.39779 12.773C9.34555 12.8253 9.28351 12.8668 9.21523 12.8951C9.14694 12.9234 9.07375 12.9379 8.99982 12.9379C8.9259 12.9379 8.85271 12.9234 8.78442 12.8951C8.71613 12.8668 8.6541 12.8253 8.60186 12.773L2.97686 7.14798C2.87131 7.04243 2.81201 6.89927 2.81201 6.75001C2.81201 6.60074 2.87131 6.45759 2.97686 6.35204C3.0824 6.24649 3.22556 6.18719 3.37482 6.18719C3.52409 6.18719 3.66725 6.24649 3.77279 6.35204L8.99982 11.5798L14.2269 6.35204C14.2791 6.29978 14.3412 6.25832 14.4094 6.23004C14.4777 6.20175 14.5509 6.18719 14.6248 6.18719C14.6987 6.18719 14.7719 6.20175 14.8402 6.23004C14.9085 6.25832 14.9705 6.29978 15.0228 6.35204C15.0751 6.4043 15.1165 6.46634 15.1448 6.53463C15.1731 6.60291 15.1876 6.6761 15.1876 6.75001C15.1876 6.82392 15.1731 6.8971 15.1448 6.96539C15.1165 7.03367 15.0751 7.09571 15.0228 7.14798Z" fill="white"/>
          </svg>
        </div>
      </div>
      <p v-if="referral.expanded" class="item__description">
        {{ referral.description }}
      </p>
      <p v-if="referral.expanded && index === 1" class="item__description">
        {{ referral.description2 }}
      </p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ReferralFaq',
  data() {
    return {
      referrals: [
        {
          title: this.$t('referralFaq.questions[0]'),
          description: this.$t('referralFaq.answers[0]'),
          expanded: false,
        },
        {
          title: this.$t('referralFaq.questions[1]'),
          description: this.$t('referralFaq.answers[1]'),
          description2: this.$t('referralFaq.levels'),
          expanded: false,
        },
        {
          title: this.$t('referralFaq.questions[2]'),
          description: this.$t('referralFaq.answers[2]'),
          expanded: false,
        },
        {
          title: this.$t('referralFaq.questions[3]'),
          description: this.$t('referralFaq.answers[3]'),
          expanded: false,
        },
        {
          title: this.$t('referralFaq.questions[4]'),
          description: this.$t('referralFaq.answers[4]'),
          expanded: false,
        },
      ],
    };
  },
  methods: {
    toggleExpand(index) {
      this.referrals[index].expanded = !this.referrals[index].expanded;
    },
  },
};
</script>

<style scoped>
.faq__wrapper {
  gap: 4px;
  width: 100%;
  display: flex;
  justify-content: center;
  flex-direction: column;
  align-items: center;
  padding: 0 12px;
}

.faq__item {
  gap: 12px;
  width: 100%;
  border-radius: 12px;
  padding: 14px;
  background: var(--iface-white6);
  display: flex;
  flex-direction: column;
  cursor: pointer;
  transition: 0.2s all;
}

.faq__item:hover {
  background: var(--iface-white10);
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
  font-size: 15px;
  font-weight: 500;
  font-family: Harmony-Medium;
  color: var(--main-text-color);
}

.item__description {
  font-size: 14px;
  opacity: 0.8;
  white-space: pre-wrap;
}

svg path {
  fill: var(--main-text-color);
}
</style>
