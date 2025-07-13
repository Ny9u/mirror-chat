import { defineStore } from "pinia";

export const useConfigStore = defineStore("config", {
  state: () => ({
    theme: "dark",
    model: "qwq-plus-2025-03-05",
    userId: 1,
    avatar: "",
    name: "",
  }),
  actions: {
    setTheme(theme) {
      this.theme = theme;
    },
    setModel(model) {
      this.model = model;
    },
    setAvatar(avatar) {
      this.avatar = avatar;
    },
    setName(name) {
      this.name = name;
    },
  },
});
