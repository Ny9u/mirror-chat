import { defineStore } from "pinia";
import Models from "@/config/models.js";

export const useConfigStore = defineStore("config", {
  state: () => ({
    theme: "light",
    model: Models[0].key,
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
