<template>
  <div class="filter" :class="{ 'active_filter': isActive }" @click="selectFilter">
    <p class="filter__name">
      {{ name }}
    </p>
  </div>
</template>

<script>

export default {
  props: {
    name: {
      type: String,
      required: true
    },
    value: {
      type: String,
      required: true
    },
    isActive: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    ...mapGetters([
      'GET_TOKEN_LABELS'
    ])
  },
  methods: {
    selectFilter() {
      let newFilter;

      if (this.value === 'all') {
        newFilter = { name: 'all', id: null };
      } else {
        const filter = this.GET_TOKEN_LABELS.find(label => label.name === this.value);
        newFilter = { name: filter.name, id: filter.id };
      }

      this.$emit('filter-selected', newFilter);
    }
  }
}
</script>

<style scoped>
.filter {
  padding-bottom: 12px;
  opacity: 0.4;
  cursor: pointer;
  transform: translateY(1px);
}

.filter__name {
  font-size: 14px;
  line-height: 17px;
}

.active_filter {
  opacity: 1;
  border-bottom: 1px solid var(--main-text-color);
}
</style>
