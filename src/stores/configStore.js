import { defineStore } from "pinia";
import Models from "@/config/models.js";

export const useConfigStore = defineStore("config", {
  state: () => ({
    theme: "light",
    model: Models[0].key,
    userId: null,
    avatar: "",
    name: "",
    voiceType: 101001,
    voiceName: "智瑜",
    chatId: "",
    sidebarCollapsed: true,
    currentRoleId: null,
    currentRole: null,
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
    setVoiceType(voiceType) {
      this.voiceType = voiceType;
    },
    setVoiceName(voiceName) {
      this.voiceName = voiceName;
    },
    setChatId(chatId) {
      this.chatId = chatId;
    },
    toggleSidebar() {
      this.sidebarCollapsed = !this.sidebarCollapsed;
    },
    setCurrentRoleId(roleId) {
      this.currentRoleId = roleId;
    },
    setCurrentRole(role) {
      this.currentRole = role;
      this.currentRoleId = role?.id || null;
    },
  },
});
