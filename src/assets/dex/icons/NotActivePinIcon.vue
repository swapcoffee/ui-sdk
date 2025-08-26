<template>
  <svg :class="combinedClasses" width="16" height="17" viewBox="0 0 16 17" fill="none"
       xmlns="http://www.w3.org/2000/svg">
      <g opacity="0.6">
          <path fill-rule="evenodd" clip-rule="evenodd"
                d="M8.09258 3.45982L7.69791 3.85447C7.41311 4.13931 7.32711 4.56785 7.47958 4.94116L7.48898 4.96375C7.64211 5.33644 7.55611 5.76497 7.27131 6.05045L6.38034 6.94139C6.26615 7.05495 6.12624 7.14028 5.97189 7.18859L3.86438 7.84865C3.71066 7.89692 3.57074 7.98165 3.45655 8.09585C3.06567 8.48672 3.06567 9.11979 3.45655 9.51005L6.99018 13.0437C7.38044 13.434 8.01351 13.434 8.40438 13.0437C8.51798 12.9295 8.60331 12.7896 8.65164 12.6359L9.31164 10.5277C9.35998 10.374 9.44471 10.2335 9.55884 10.1199L10.4498 9.22899C10.7346 8.94352 11.1632 8.85752 11.5365 9.01065L11.5591 9.02005C11.9324 9.17312 12.3609 9.08719 12.6458 8.80232L13.0404 8.40765C13.4307 8.01679 13.4307 7.38372 13.0404 6.99346L9.50678 3.45982C9.11651 3.06893 8.48284 3.06893 8.09258 3.45982Z"
                :stroke="fillColorForTheme" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" />
          <path d="M5.22281 11.2761L2.66669 13.8321" :stroke="fillColorForTheme" stroke-width="1.4"
                stroke-linecap="round"
                stroke-linejoin="round" />
      </g>
  </svg>
</template>

<script lang="ts">
import IconColorMixin from "@/mixins/IconColorMixin.ts"

export default {
  name: "NotActivePinIcon",
  mixins: [IconColorMixin],
  props: {
      customClass: {
          type: String,
          default: "",
      },
  },
  computed: {
      combinedClasses() {
          return `icon ${this.customClass}`.trim()
      },
  },
}
</script>

<style scoped>
</style>
