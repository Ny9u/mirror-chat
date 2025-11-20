import JSEncrypt from "jsencrypt";
import { Request } from "@/utils/request";
import { api } from "@/config/api";

// 公钥缓存
let cachedPublicKey = null;
let publicKeyPromise = null;

/**
 * 从服务器获取RSA公钥
 * @returns {Promise<string>} - 公钥
 */
export const getPublicKey = async () => {
  // 如果已经有缓存的公钥，直接返回
  if (cachedPublicKey) {
    return cachedPublicKey;
  }

  // 如果正在获取公钥，返回同一个Promise
  if (publicKeyPromise) {
    return publicKeyPromise;
  }

  // 获取公钥的Promise
  publicKeyPromise = Request(api.getPublicKey, "GET")
    .then((res) => {
      if (res.code === 200 && res.data && res.data.publicKey) {
        cachedPublicKey = res.data.publicKey;
        return cachedPublicKey;
      } else {
        throw new Error("获取公钥失败");
      }
    })
    .catch((error) => {
      throw error;
    })
    .finally(() => {
      publicKeyPromise = null;
    });

  return publicKeyPromise;
};

/**
 * 使用RSA公钥加密数据
 * @param {string|object} data - 明文数据
 * @returns {Promise<string>} - 加密后的数据，带有特定前缀标识
 */
export const encrypt = async (data) => {
  try {
    const dataToEncrypt =
      typeof data === "object" ? JSON.stringify(data) : data;

    // 获取公钥
    const publicKey = await getPublicKey();

    // 使用公钥加密数据
    const encryptor = new JSEncrypt();
    encryptor.setPublicKey(publicKey);
    const encrypted = encryptor.encrypt(dataToEncrypt);

    if (!encrypted) {
      throw new Error("数据加密失败");
    }

    // 添加前缀以便请求拦截器识别
    return `-----BEGIN RSA ENCRYPTED-----\n${encrypted}\n-----END RSA ENCRYPTED-----`;
  } catch (error) {
    throw error;
  }
};

export default {
  encrypt,
  getPublicKey,
};
