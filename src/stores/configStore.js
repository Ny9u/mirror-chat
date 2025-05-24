import { defineStore } from "pinia";

export const useConfigStore = defineStore("config", {
  state: () => ({
    theme: "dark",
    model: "qwq-plus-2025-03-05",
  }),
  actions: {
    setTheme(theme) {
      this.theme = theme;
    },
    setModel(model) {
      this.model = model;
    },
  },
});
