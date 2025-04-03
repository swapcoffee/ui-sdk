<template>
  <div class="header__mobile-menu" :class="{ padding_small: getRouteName !== 'Main' }">
    <nav class="nav" :class="{ disabled: getStatus }">
      <EarnSidebar />
    </nav>
  </div>
</template>

<script>
import computedMixins from '@/mixins/computedMixins';
import { mapGetters } from 'vuex';
import { defineAsyncComponent } from 'vue';
import EarnSidebar from "@/components/earn/EarnSidebar.vue";

export default {
  name: 'MobileNav',
  components: {
      EarnSidebar,
    Sidebar: defineAsyncComponent(() => {
      return import('@/components/Sidebar.vue');
    }),
  },
  mixins: [computedMixins],
  data() {
    return {
      showAdditionalMenu: false,
    };
  },
  computed: {
    ...mapGetters(['GET_TECHNICAL_WORKS_STATUS']),

    getStatus() {
      return this.GET_TECHNICAL_WORKS_STATUS;
    },
  },
  methods: {
    linkTo(value) {
      if (this.showMenu === true) {
        this.showMenu = false;
      }
      if (this.getRouteName !== 'Main') {
        this.$router.push({ name: 'Main' });
      }

      setTimeout(() => {
        this.$router.push(value);
      }, 100);
    },
    dexLink(value) {
      if (value === 'Swap') {
        this.createTrade();
      } else {
        this.$router.push({ name: value });
      }
    },
    sendByLink(value) {
      let loc = this.$route.path;
      if (value === 'MAIN') {
        if (loc !== '/') {
          this.$router.push('/');
        } else {
          location.reload();
        }
      } else {
        if (loc !== '/') {
          this.$router.push('/');
        }
      }
    },
    toggleAdditionalMenu() {
      this.showAdditionalMenu = !this.showAdditionalMenu;
    },
  },
};
</script>

<style scoped>
.nav__list {
  display: flex;
}

.nav__item:not(:last-child) {
  margin-right: 30px;
}

.header__mobile-menu {
  display: none;
}

@media screen and (max-width: 1180px) {
  .header__mobile-menu {
    margin-top: 10px;
    border-top: 1px solid var(--iface-white6);
    padding: 72px 0;
    height: 100vh;
    left: 0;
    right: 0;
    display: flex;
    justify-content: center;
    width: 100%;
  }

  .padding_small {
    padding: 10px 0;
  }

  .nav {
    width: 100%;
  }

  .nav__list {
    flex-direction: column;
    align-items: center;
  }

  .nav__item {
    padding-bottom: 35px;
  }

  .nav__item:not(:last-child) {
    margin-right: 0;
  }

  .nav__button-link {
    background-color: transparent;
    border: none;
    outline: none;
    color: #fff;
    text-transform: uppercase;
    font-family: Harmony-regular, sans-serif;
    font-size: 14px;
    white-space: nowrap;
    text-align: center;
  }

  .link_inactive {
    opacity: 0.2;
  }

  .disabled {
    opacity: 0.5;
    pointer-events: none;
    cursor: not-allowed;
  }

  .disabled:hover {
    background-color: inherit;
  }
}
</style>
