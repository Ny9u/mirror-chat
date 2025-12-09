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

export const refresh = async (params) => {
  const res = await Request(api.refresh, "POST", params);
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

export default {
  login,
  register,
  validate,
  refresh,
  uploadAvatar,
  updateInfo,
  updatePassword,
  deleteAccount,
  sendVerificationCode,
  verifyCode,
  resetPassword,
  addFavorites,
  getUserFavorites,
  removeFavorite,
  getFavoriteDetail,
  saveConversation,
  getConversations,
  deleteConversation,
  getConversationDetail,
};
