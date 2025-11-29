import { FormDataRequest } from "@/utils/request";
import { api } from "@/config/api";

export const asrRecognize = async (formData) => {
  const res = await FormDataRequest(api.asrRecognize, formData);
  return res;
};
