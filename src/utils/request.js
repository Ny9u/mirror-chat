import axios from "axios";
import { api } from "../config/api";

const service = axios.create({
  // baseURL: import.meta.env.VITE_API_BASE_URL
  timeout: 10000, // 请求超时时间
});

// 请求拦截器
service.interceptors.request.use(
  (config) => {
    config.headers = {
      ...config.headers,
      "Content-Type": "application/json",
    };
    const authApi = [api.getModels, api.netSearch];
    if (authApi.includes(config.url)) {
      switch (config.url) {
        case api.getModels:
          config.headers.Authorization =
            "Bearer " + import.meta.env.VITE_ALIYUN_API_KEY;
          break;
        case api.netSearch:
          config.headers.Authorization =
            "Bearer " + import.meta.env.VITE_BOCHAAI_API_KEY;
          break;
        default:
          break;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * 封装请求方法
 * @param {string} url - 接口地址
 * @param {string} method - 请求方法，默认为get
 * @param {Object} params - 请求参数
 * @returns {Promise} 返回Promise对象
 */
export const Request = (url, method = "GET", params = {}) => {
  return new Promise((resolve, reject) => {
    service({
      url: url,
      method: method,
      params: params,
    })
      .then((response) => {
        resolve(response.data);
      })
      .catch((error) => {
        reject(error);
      });
  });
};
