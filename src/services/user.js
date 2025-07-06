import { Request } from "@/utils/request";
import { api } from "@/config/api";

export const getAvatar = async (params) => {
  const res = await Request(api.avatar, "GET", params);
  return res;
};

export default { getAvatar };
