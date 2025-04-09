<template>
  <svg class="protect" :class="combinedClasses" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
    <path fill-rule="evenodd" clip-rule="evenodd" d="M12.9799 8.60833L9.87821 11.7083C9.76154 11.825 9.60237 11.8908 9.43654 11.8908C9.26987 11.8908 9.11071 11.825 8.99404 11.7075L7.48986 10.1992C7.24569 9.955 7.24652 9.56 7.49069 9.31583C7.73569 9.0725 8.13152 9.0725 8.37487 9.3175L9.43737 10.3817L12.0957 7.72417C12.3399 7.48 12.7357 7.48 12.9799 7.72417C13.224 7.96833 13.224 8.36417 12.9799 8.60833ZM16.1307 4.28083C15.5449 3.6925 10.8549 2.08333 9.99987 2.08333C9.14487 2.08333 4.45569 3.6925 3.86902 4.28083C3.40236 4.74917 3.40902 5.11083 3.44569 7.11167C3.46069 7.92333 3.48069 9.02833 3.48069 10.5583C3.48069 15.8975 9.81487 17.8792 9.87904 17.8983C9.91821 17.9108 9.95904 17.9167 9.99987 17.9167C10.0407 17.9167 10.0807 17.9108 10.1207 17.8983C10.1849 17.8792 16.5199 15.8975 16.5199 10.5583C16.5199 9.0325 16.5399 7.92916 16.5549 7.11833C16.5907 5.1125 16.5965 4.75 16.1307 4.28083Z" fill="#5DFF54"/>
  </svg>
</template>

<script lang="ts">
import IconColorMixin from '@/mixins/IconColorMixin';

export default {
  name: 'ProtectIcon',
  mixins: [IconColorMixin],
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
.theme-light .protect path {
  fill: #10A37F;
}
</style>
