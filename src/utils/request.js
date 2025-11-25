import axios from "axios";
import { api, authRequiredApis } from "../config/api";
import { refresh } from "../services/user.js";

// 存储正在刷新token的Promise，防止多次刷新
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

const service = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000, // 请求超时时间
});

// 请求拦截器
service.interceptors.request.use(
  (config) => {
    // 检查是否需要修改Content-Type
    const isEncryptedData =
      config.data &&
      typeof config.data === "string" &&
      config.data.startsWith("-----BEGIN RSA ENCRYPTED-----");

    // 如果是加密数据，提取加密内容并设置Content-Type
    if (isEncryptedData) {
      const encryptedData = config.data
        .replace("-----BEGIN RSA ENCRYPTED-----\n", "")
        .replace("\n-----END RSA ENCRYPTED-----", "");

      config.headers = {
        ...config.headers,
        "Content-Type": "text/plain",
      };

      config.data = encryptedData;
    } else {
      config.headers = {
        ...config.headers,
        "Content-Type": "application/json",
      };
    }

    if (authRequiredApis.includes(config.url)) {
      const token = localStorage.getItem("jwtToken");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    // 处理其他API的认证
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

service.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // 如果是401错误且不是刷新token的请求
    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry
    ) {
      // 如果是刷新token的请求失败，直接登出
      if (originalRequest.url === api.refresh) {
        localStorage.removeItem("jwtToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("isLoggedIn");
        window.location.href = "/auth";
        return Promise.reject(error);
      }

      if (isRefreshing) {
        // 如果正在刷新token，将请求加入队列
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers["Authorization"] = "Bearer " + token;
            return service(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem("refreshToken");

      if (refreshToken) {
        try {
          const res = await refresh({ refreshToken });
          if (res.code === 200 && res.data) {
            localStorage.setItem("jwtToken", res.data.token);
            localStorage.setItem("refreshToken", res.data.refreshToken);

            // 更新队列中请求的token
            processQueue(null, res.data.token);

            originalRequest.headers["Authorization"] =
              "Bearer " + res.data.token;
            return service(originalRequest);
          } else {
            // 刷新失败，清空token并跳转到登录页
            window.location.href = "/auth";
            throw new Error("Token refresh failed");
          }
        } catch (err) {
          processQueue(err, null);
          localStorage.removeItem("jwtToken");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("isLoggedIn");
          window.location.href = "/auth";
          return Promise.reject(err);
        } finally {
          isRefreshing = false;
        }
      } else {
        localStorage.removeItem("jwtToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("isLoggedIn");
        window.location.href = "/auth";
      }
    }

    return Promise.reject(error);
  }
);

/**
 * 封装请求方法
 * @param {string} url - 接口地址
 * @param {string} method - 请求方法，默认为get
 * @param {Object} params - 请求参数
 * @param {boolean} returnRawResponse - 是否返回原始响应，用于处理二进制数据
 * @returns {Promise} 返回Promise对象
 */
export const Request = (url, method = "GET", params = {}, returnRawResponse = false) => {
  return new Promise((resolve, reject) => {
    const config = {
      url: url,
      method: method,
      responseType: returnRawResponse ? "arraybuffer" : "json",
    };

    if (method.toUpperCase() === "POST" || method.toUpperCase() === "PUT") {
      config.data = params;
    } else {
      config.params = params;
    }

    service(config)
      .then((response) => {
        if (returnRawResponse) {
          // 返回原始响应，包含数据和响应头
          resolve({
            data: response.data,
            headers: response.headers,
            contentType: response.headers["content-type"],
            contentLength: response.headers["content-length"],
            duration: response.headers["x-audio-duration"],
          });
        } else {
          resolve(response.data);
        }
      })
      .catch((error) => {
        if (error.response && error.response.data) {
          const backendError = error.response.data;
          const customError = new Error(backendError.message || "请求失败");
          customError.code = backendError.code;
          customError.response = error.response;
          reject(customError);
        } else {
          reject(error);
        }
      });
  });
};
