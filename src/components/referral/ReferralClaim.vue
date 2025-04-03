<template>
  <div class="claim">
    <div class="claim__buttons">
      <button
        class="claim__btn"
        :class="{ active: selectedButton === 'referrals' }"
        @click="selectButton('referrals')"
      >
        <span class="btn__text">{{ $t('referralNav.referrals') }}</span>
      </button>
      <button
        class="claim__btn"
        :class="{ active: selectedButton === 'history' }"
        @click="selectButton('history')"
      >
        <span class="btn__text">{{ $t('referralNav.history') }}</span>
      </button>
      <button
        class="claim__btn"
        :class="{ active: selectedButton === 'faq' }"
        @click="selectButton('faq')"
      >
        <span class="btn__text">F.A.Q</span>
      </button>
    </div>
    <MyReferrals v-if="selectedButton === 'referrals'" />
    <MyClaimHistory v-if="selectedButton === 'history'" />
    <ReferralFaq v-if="selectedButton === 'faq'" />
  </div>
</template>

<script>
import MyReferrals from '@/components/referral/MyReferrals.vue';
import MyClaimHistory from '@/components/referral/MyClaimHistory.vue';
import ReferralFaq from '@/components/referral/ReferralFaq.vue';

export default {
  name: 'ReferralClaim',
  components: { ReferralFaq, MyClaimHistory, MyReferrals },
  data() {
    return {
      selectedButton: 'referrals',
    };
  },
  methods: {
    selectButton(buttonName) {
      this.selectedButton = buttonName;
    },
  },
};
</script>

<style scoped>
.claim {
  padding: 14px 0;
  border-radius: 14px;
  background: var(--iface-white4);
}

.claim__buttons {
  padding: 0 14px 14px 14px;
  display: flex;
  gap: 8px;
}

.claim__btn {
  opacity: 0.6;
  background: var(--iface-white6);
  border-radius: 12px;
  white-space: nowrap;
  padding: 0 10px;
  height: 36px;
  transition: 0.2s all;
  border: none;
  outline: none;
  position: relative;
}

.claim__btn:hover {
  background: var(--iface-white8);
}

.claim__btn::after {
  content: '';
  position: absolute;
  left: 50%;
  bottom: 0;
  transform: translateX(-50%);
  width: 65%;
  height: 3px;
  background-color: transparent;
  border-radius: 2px 2px 0 0;
  transition: 0.2s;
}

.claim__btn.active::after {
  background-color: var(--earn-accent);
}

.claim__btn.active:hover {
  background-color: var(--iface-white8);
}

.btn__text {
  transition: 0.2s;
  font-size: 13px;
  font-weight: 500;
}

.active {
  opacity: 1;
  background: var(--iface-white6);
}

.active .btn__text {
  opacity: 1;
}

@media screen and (max-width: 576px) {
  .claim__buttons {
    overflow-x: scroll;
  }
  
  .claim {
    background: transparent;
    margin-bottom: 80px;
    padding: 0 0 14px 0;
  }

  .claim__btn {
    background: var(--iface-white6);
  }
}

</style>
