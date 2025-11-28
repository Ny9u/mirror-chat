/**
 * 音频缓存服务
 * 用于缓存转换后的音频数据，避免重复处理相同的文本
 */
class AudioCacheService {
  constructor() {
    this.cacheKey = "audioCache";
    this.maxCacheSize = 50; // 最大缓存条目数
    this.maxCacheSizeMB = 5; // 最大缓存大小（MB）
    this.initCache();
  }

  initCache() {
    try {
      const cachedData = sessionStorage.getItem(this.cacheKey);
      if (cachedData) {
        this.cache = JSON.parse(cachedData);
        this.checkCacheSize();
      } else {
        this.cache = {};
      }
    } catch (error) {
      this.cache = {};
      throw error;
    }
  }

  /**
   * 生成缓存键
   * @param {string} text - 文本内容
   * @param {number} voiceType - 音色类型
   * @returns {string} 缓存键
   */
  generateCacheKey(text, voiceType) {
    // 组合文本和音色类型生成唯一的缓存键
    const combinedInput = `${text}-${voiceType}`;

    // 使用简单的哈希函数生成缓存键
    let hash = 0;
    if (combinedInput.length === 0) return hash.toString();

    for (let i = 0; i < combinedInput.length; i++) {
      const char = combinedInput.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // 转换为32位整数
    }

    return Math.abs(hash).toString();
  }

  /**
   * 检查缓存大小，如果超过限制则清理
   */
  checkCacheSize() {
    const cacheKeys = Object.keys(this.cache);

    // 检查缓存条目数量
    if (cacheKeys.length > this.maxCacheSize) {
      // 按时间戳排序，删除最旧的条目
      const sortedKeys = cacheKeys.sort((a, b) => {
        return this.cache[a].timestamp - this.cache[b].timestamp;
      });

      const keysToDelete = sortedKeys.slice(
        0,
        cacheKeys.length - this.maxCacheSize
      );
      keysToDelete.forEach((key) => {
        delete this.cache[key];
      });
    }

    // 检查缓存大小（MB）
    let totalSize = 0;
    Object.values(this.cache).forEach((item) => {
      totalSize += this.estimateSize(item.audioData);
    });

    const sizeMB = totalSize / (1024 * 1024);
    if (sizeMB > this.maxCacheSizeMB) {
      // 按时间戳排序，删除最旧的条目直到大小合适
      const sortedKeys = cacheKeys.sort((a, b) => {
        return this.cache[a].timestamp - this.cache[b].timestamp;
      });

      let currentSize = sizeMB;
      for (const key of sortedKeys) {
        if (currentSize <= this.maxCacheSizeMB * 0.8) break; // 保留20%的空间

        currentSize -=
          this.estimateSize(this.cache[key].audioData) / (1024 * 1024);
        delete this.cache[key];
      }
    }
  }

  /**
   * 估算音频数据大小（字节）
   * @param {string} audioData - base64编码的音频数据
   * @returns {number} 估算的大小（字节）
   */
  estimateSize(audioData) {
    if (!audioData) return 0;
    // base64编码的数据大小约为原始数据的4/3
    return Math.floor(audioData.length * 0.75);
  }

  /**
   * 保存音频数据到缓存
   * @param {string} text - 文本内容
   * @param {number} voiceType - 音色类型
   * @param {Object} audioData - 音频数据对象
   * @param {string} audioData.audio - 音频数据（ArrayBuffer或Uint8Array）
   * @param {string} audioData.contentType - 内容类型
   */
  saveAudioData(text, voiceType, audioData) {
    if (!text || !audioData || !audioData.audio) return;

    const cacheKey = this.generateCacheKey(text, voiceType);
    const timestamp = Date.now();

    // 将ArrayBuffer或Uint8Array转换为base64字符串以便存储
    let audioBase64;
    if (audioData.audio instanceof ArrayBuffer) {
      const uint8Array = new Uint8Array(audioData.audio);
      audioBase64 = this.arrayBufferToBase64(uint8Array);
    } else if (audioData.audio instanceof Uint8Array) {
      audioBase64 = this.arrayBufferToBase64(audioData.audio);
    } else {
      throw new Error("不支持的音频数据类型:", typeof audioData.audio);
    }

    // 保存到缓存
    this.cache[cacheKey] = {
      audioData: audioBase64,
      contentType: audioData.contentType || "audio/mpeg",
      timestamp: timestamp,
      voiceType: voiceType,
    };

    // 检查缓存大小
    this.checkCacheSize();

    // 保存到sessionStorage
    try {
      sessionStorage.setItem(this.cacheKey, JSON.stringify(this.cache));
    } catch (error) {
      this.clearCache();
      try {
        sessionStorage.setItem(this.cacheKey, JSON.stringify(this.cache));
      } catch (retryError) {
        throw retryError;
      }
    }
  }

  /**
   * 从缓存获取音频数据
   * @param {string} text - 文本内容
   * @param {number} voiceType - 音色类型
   * @returns {Object|null} 音频数据对象或null
   */
  getAudioData(text, voiceType) {
    if (!text) return null;

    const cacheKey = this.generateCacheKey(text, voiceType);
    const cachedItem = this.cache[cacheKey];

    if (!cachedItem) return null;

    // 将base64字符串转换回Uint8Array
    const audioArray = this.base64ToArrayBuffer(cachedItem.audioData);

    return {
      audio: audioArray,
      contentType: cachedItem.contentType,
      duration: cachedItem.duration,
      voiceType: cachedItem.voiceType,
      fromCache: true, // 标记这是来自缓存的数据
    };
  }

  /**
   * 将ArrayBuffer或Uint8Array转换为base64字符串
   * @param {Uint8Array} array - 字节数组
   * @returns {string} base64字符串
   */
  arrayBufferToBase64(array) {
    let binary = "";
    const bytes = new Uint8Array(array);
    const len = bytes.byteLength;

    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }

    return btoa(binary);
  }

  /**
   * 将base64字符串转换为ArrayBuffer
   * @param {string} base64 - base64字符串
   * @returns {ArrayBuffer} ArrayBuffer对象
   */
  base64ToArrayBuffer(base64) {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);

    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    return bytes.buffer;
  }

  /**
   * 清空缓存
   */
  clearCache() {
    this.cache = {};
    sessionStorage.removeItem(this.cacheKey);
  }
}

const audioCacheService = new AudioCacheService();

export default audioCacheService;
