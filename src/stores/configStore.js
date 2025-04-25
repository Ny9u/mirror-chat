import { defineStore } from "pinia";

export const useConfigStore = defineStore("config", {
  state: () => ({
    theme: "dark",
  }),
  actions: {
    setTheme(theme) {
      this.theme = theme;
    },
  },
});
