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

export default { getAvatar, getName, getUserInfo };
