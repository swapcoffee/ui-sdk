<template>
  <nav class="header__nav nav">
    <ul class="nav__list">
      <li class="nav__item">
        <a target="_blank" href="https://docs.swap.coffee/swap.coffee/" class="nav__link">
          Documentation
        </a>
      </li>
      <li class="nav__item">
        <a target="_blank" href="../white-paper.pdf" class="nav__link"> White paper </a>
      </li>
      <li class="nav__item">
        <a href="#stacking" class="nav__link" @click.passive="sendByLink"> Staking </a>
      </li>
      <li class="nav__item">
        <a href="#developers" class="nav__link" @click.passive="sendByLink"> Developers </a>
      </li>
      <li class="nav__item">
        <a href="#investors" class="nav__link" @click.passive="sendByLink"> Investors </a>
      </li>
      <li class="nav__item">
        <a href="#ecosystem" class="nav__link" @click.passive="sendByLink"> Ecosystem </a>
      </li>
    </ul>
  </nav>
</template>

<script>
export default {
  name: 'LandingNav',
  data() {
    return {};
  },
  methods: {
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
  },
};
</script>

<style scoped>
.header__nav {
  display: block;
}

.nav__list {
  display: flex;
}

.nav__link {
  transition: 0.2s;
  color: #fff;
  font-family: Harmony-Regular, sans-serif;
  font-size: 14px;
  white-space: nowrap;
}

.nav__link:hover {
  opacity: 0.8;
}

.nav__item:not(:last-child) {
  margin-right: 30px;
}

@media screen and (max-width: 1200px) {
  .header__nav {
    display: none;
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

  .nav__link {
    width: 100%;
    text-align: center;
  }
}
</style>
