import axios from "axios";

const service = axios.create({
  // baseURL: import.meta.env.VITE_API_BASE_URL
  timeout: 10000, // 请求超时时间
});

/**
 * 封装请求方法
 * @param {Object} config - 请求配置对象
 * @param {Object} config.headers - 自定义请求头
 * @param {string} config.url - 接口地址
 * @param {string} config.method - 请求方法，默认为get
 * @param {Object} config.data - 请求参数
 * @returns {Promise} 返回Promise对象
 */
export const Request = (config) => {
  return new Promise((resolve, reject) => {
    service({
      headers: config.headers || {
        "Content-Type": "application/json",
      },
      url: config.url,
      method: config.method || "get",
      data: config.data || {},
    })
      .then((response) => {
        resolve(response.data);
      })
      .catch((error) => {
        reject(error);
      });
  });
};
