export default {
  inject: ["widgetTheme"],
  computed: {
    GET_THEME(): string {
      return this.widgetTheme;
    },
    fillColorForTheme(): string {
      return this.GET_THEME === "dark" || this.GET_THEME === "coffee" ? "white" : "#0D0D0D";
    },
  },
};
