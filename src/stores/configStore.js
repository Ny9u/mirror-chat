import { defineStore } from "pinia";
import Models from "@/config/models.js";

export const useConfigStore = defineStore("config", {
  state: () => ({
    theme: "light",
    model: Models[0].key,
    userId: null,
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
    setUserId(userId) {
      this.userId = userId;
    },
    setAvatar(avatar) {
      this.avatar = avatar;
    },
    setName(name) {
      this.name = name;
    },
  },
});
