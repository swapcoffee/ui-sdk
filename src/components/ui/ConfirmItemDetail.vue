<template>
  <div class="confirm__item-detail">
    <p class="confirm__item-title"> {{detail.name}} </p>
    <p class="confirm__item-value"> {{detail.value}} </p>
  </div>
</template>

<script lang="ts">

export default {
  name: "ConfirmItemDetail",
  props: {
    detail: {
      type: Object,
      required: true
    }
  }
}
</script>

<style scoped>
.confirm__item-detail {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  color: var(--main-text-color);
}

.confirm__item-title {
  opacity: 0.4;
  font-size: 13px;
}

.confirm__item-value {
  font-weight: 400;
  font-size: 13px;
}
</style>