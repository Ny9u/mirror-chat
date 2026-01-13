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
    currentRole: {
      id: 'professional',
      name: '专业助手',
      desc: '专业、精准、高效',
      icon: '🎯',
      systemPrompt: '你是一个专业、精准、高效的智能问答助手,名字叫Mirror。',
      color: '#00ff77'
    },
    customRoles: [],
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
    setCurrentRole(role) {
      this.currentRole = role;
    },
    addCustomRole(role) {
      this.customRoles.push(role);
    },
    updateCustomRole(id, role) {
      const index = this.customRoles.findIndex(r => r.id === id);
      if (index !== -1) {
        this.customRoles[index] = role;
      }
    },
    deleteCustomRole(id) {
      this.customRoles = this.customRoles.filter(r => r.id !== id);
    },
  },
});
