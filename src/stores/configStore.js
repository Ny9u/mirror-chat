import { defineStore } from "pinia";
import Models from "@/config/models.js";

export const useConfigStore = defineStore("config", {
  state: () => ({
    // 主题模式：light（浅色）或 dark（深色）
    theme: "light",
    // 当前选中的AI模型key
    model: Models[0].key,
    // 当前登录用户的ID
    userId: null,
    // 用户头像URL
    avatar: "",
    // 用户昵称
    name: "",
    // 语音播报音色类型ID
    voiceType: 101001,
    // 语音播报音色名称
    voiceName: "智瑜",
    // 当前对话的ID
    chatId: "",
    // 侧边栏是否折叠状态
    sidebarCollapsed: true,
    // 当前选中的角色ID
    currentRoleId: null,
    // 当前选中的角色对象
    currentRole: null,
    // 是否处于图像生成模式
    imageGenerationMode: false,
    // 之前使用的模型
    previousModel: null,
  }),

  persist: {
    key: "mirror-chat-config",
    storage: localStorage,
    pick: ["theme", "model", "voiceType", "voiceName", "sidebarCollapsed"],
  },

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
    setImageGenerationMode(mode) {
      this.imageGenerationMode = mode;
    },
    setPreviousModel(model) {
      this.previousModel = model;
    },
  },
});
