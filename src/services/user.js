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

export default {
  getAvatar,
  getName,
  getUserInfo,
  login,
  register,
  validate,
  refresh,
  uploadAvatar,
  updateInfo,
  updatePassword,
};
