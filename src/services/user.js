import { Request } from "@/utils/request";
import { api } from "@/config/api";

export const getAvatar = async (params) => {
  const res = await Request(api.avatar, "GET", params);
  return res;
};

export const getName = async (params) => {
  const res = await Request(api.name, "GET", params);
  return res;
};

export const getUserInfo = async (params) => {
  const res = await Request(api.getUserInfo, "GET", params);
  return res;
};

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

export default {
  getAvatar,
  getName,
  getUserInfo,
  login,
  register,
  validate,
  refresh,
};
