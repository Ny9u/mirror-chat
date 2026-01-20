import { Request } from "@/utils/request";
import { api } from "@/config/api";

export const login = async (userData) => {
  const res = await Request(api.login, "POST", userData);
  return res;
};

export const register = async (userData) => {
  const res = await Request(api.register, "POST", userData);
  return res;
};

export const validate = async (params) => {
  const res = await Request(api.validate, "POST", params);
  return res;
};

export const refresh = async () => {
  const res = await Request(api.refresh, "POST");
  return res;
};

export const logout = async () => {
  const res = await Request(api.logout, "POST");
  return res;
};

export const uploadAvatar = async (avatarData) => {
  const res = await Request(api.uploadAvatar, "POST", avatarData);
  return res;
};

export const updateInfo = async (userData) => {
  const res = await Request(api.updateInfo, "POST", userData);
  return res;
};

export const updatePassword = async (passwordData) => {
  const res = await Request(api.updatePassword, "POST", passwordData);
  return res;
};

export const deleteAccount = async (params) => {
  const res = await Request(api.deleteAccount, "POST", params);
  return res;
};

export const sendVerificationCode = async (params) => {
  const res = await Request(api.sendVerificationCode, "POST", params);
  return res;
};

export const verifyCode = async (params) => {
  const res = await Request(api.verifyCode, "POST", params);
  return res;
};

export const resetPassword = async (passwordData) => {
  const res = await Request(api.resetPassword, "POST", passwordData);
  return res;
};

export const addFavorites = async (params) => {
  const res = await Request(api.addFavorites, "POST", params);
  return res;
};

export const getUserFavorites = async (params) => {
  const res = await Request(api.getUserFavorites, "GET", params);
  return res;
};

export const removeFavorite = async (params) => {
  const res = await Request(api.removeFavorite, "POST", params);
  return res;
};

export const getFavoriteDetail = async (params) => {
  const res = await Request(api.getFavoriteDetail, "POST", params);
  return res;
};

export const saveConversation = async (params) => {
  const res = await Request(api.saveConversation, "POST", params);
  return res;
};

export const getConversations = async (params) => {
  const res = await Request(api.getConversations, "GET", params);
  return res;
};

export const deleteConversation = async (params) => {
  const res = await Request(api.deleteConversation, "POST", params);
  return res;
};

export const getConversationDetail = async (params) => {
  const res = await Request(api.getConversationDetail, "GET", params);
  return res;
};

export const uploadKnowledge = async (knowledgeData) => {
  const res = await Request(api.uploadKnowledge, "POST", knowledgeData);
  return res;
};

export const getKnowledgeList = async (params) => {
  const res = await Request(api.getKnowledgeList, "POST", params);
  return res;
};

export const deleteKnowledge = async (params) => {
  const res = await Request(api.deleteKnowledge, "POST", params);
  return res;
};

export const getKnowledgeDetail = async (params) => {
  const res = await Request(api.getKnowledgeDetail, "POST", params);
  return res;
};

export const downloadKnowledge = async (params) => {
  const res = await Request(api.downloadKnowledge, "POST", params, "blob");
  return res;
};

export const setModelConfig = async (params) => {
  const res = await Request(api.setModelConfig, "POST", params);
  return res;
};

export const getModelConfig = async (params) => {
  const res = await Request(api.getModelConfig, "POST", params);
  return res;
};

export const getSystemRoles = async (params) => {
  const res = await Request(api.getSystemRoles, "GET", params);
  return res;
};

export const getUserRoles = async (params) => {
  const res = await Request(api.getUserRoles, "GET", params);
  return res;
};

export const getSelectedRole = async (params) => {
  const res = await Request(api.getSelectedRole, "GET", params);
  return res;
};

export const getRole = async (params) => {
  const res = await Request(api.getRole, "GET", params);
  return res;
};

export const createRole = async (params) => {
  const res = await Request(api.createRole, "POST", params);
  return res;
};

export const updateRole = async (params) => {
  const res = await Request(api.updateRole, "POST", params);
  return res;
};

export const deleteRole = async (params) => {
  const res = await Request(api.deleteRole, "POST", params);
  return res;
};

export const selectRole = async (params) => {
  const res = await Request(api.selectRole, "POST", params);
  return res;
};

export const clearRole = async (params) => {
  const res = await Request(api.clearRole, "POST", params);
  return res;
};

export const generateImage = async (params) => {
  const res = await Request(api.generateImage, "POST", params, "json", 0);
  return res;
};
