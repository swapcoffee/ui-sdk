<template>
  <svg :class="combinedClasses" class="up-price" xmlns="http://www.w3.org/2000/svg" width="14"
       height="14" viewBox="0 0 14 14" fill="none">
    <path
      d="M11.779 8.91735C11.7459 8.9973 11.6898 9.06564 11.6179 9.11373C11.546 9.16182 11.4614 9.18749 11.3749 9.18751H2.62486C2.53828 9.18758 2.45362 9.16195 2.38161 9.11389C2.3096 9.06582 2.25348 8.99746 2.22033 8.91748C2.18719 8.83749 2.17853 8.74947 2.19544 8.66456C2.21235 8.57965 2.25407 8.50166 2.31532 8.44048L6.69032 4.06548C6.73096 4.0248 6.77921 3.99253 6.83232 3.97051C6.88543 3.9485 6.94236 3.93716 6.99986 3.93716C7.05735 3.93716 7.11428 3.9485 7.16739 3.97051C7.2205 3.99253 7.26876 4.0248 7.30939 4.06548L11.6844 8.44048C11.7456 8.5017 11.7872 8.57968 11.804 8.66456C11.8209 8.74945 11.8122 8.83742 11.779 8.91735Z"
      fill="#55FF85"/>
  </svg>
</template>

<script>
export default {
  name: 'UpPriceArrowIcon',
  props: {
    customClass: {
      type: String,
      default: ''
    }
  },
  computed: {
    combinedClasses() {
      return `icon ${this.customClass}`.trim();
    }
  }
};
</script>

<style scoped>

.theme-light .up-price path {
  fill: #10A37F;
}
</style>