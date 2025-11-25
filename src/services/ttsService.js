import { Request } from "@/utils/request";
import { api } from "@/config/api";
import audioCacheService from "../utils/audioCacheService.js";

class TTSService {
  // 静态属性，用于跟踪当前正在播放的音频
  static currentAudio = null;

  static async synthesizeSpeech(text) {
    try {
      const cachedAudioData = audioCacheService.getAudioData(text);
      if (cachedAudioData) {
        return cachedAudioData;
      }

      // 使用returnRawResponse参数获取原始响应和响应头
      const response = await Request(
        api.textToSpeech,
        "POST",
        {
          text,
        },
        true
      );

      // 后端直接返回Buffer数据，包装成对象格式
      if (
        response.data instanceof ArrayBuffer ||
        response.data instanceof Uint8Array
      ) {
        const audioData = {
          audio: response.data,
          contentType: response.contentType || "audio/mpeg",
        };

        audioCacheService.saveAudioData(text, audioData);
        return audioData;
      }

      return response;
    } catch (error) {
      // 返回原文本，让playAudio使用Web Speech API作为降级方案
      return { text, useFallback: true };
    }
  }

  static async playAudio(audioData) {
    try {
      // 停止当前正在播放的音频
      this.stopCurrentAudio();

      // 检查是否需要使用Web Speech API作为降级方案
      if (audioData.useFallback || audioData.text) {
        return await this.playWithWebSpeechAPI(audioData.text || audioData);
      }

      let audioSource;
      // 检查audioData的类型和结构
      if (
        typeof audioData === "object" &&
        audioData !== null &&
        audioData.audio
      ) {
        // 后端返回的格式，优先处理ArrayBuffer和Uint8Array类型
        if (audioData.audio instanceof ArrayBuffer) {
          // 将ArrayBuffer转换为Blob，并指定正确的MIME类型
          const mimeType = audioData.contentType || "audio/mpeg";
          const blob = new Blob([audioData.audio], { type: mimeType });
          audioSource = URL.createObjectURL(blob);
        } else if (audioData.audio instanceof Uint8Array) {
          // 将Uint8Array转换为Blob，并指定正确的MIME类型
          const mimeType = audioData.contentType || "audio/mpeg";
          const blob = new Blob([audioData.audio], { type: mimeType });
          audioSource = URL.createObjectURL(blob);
        } else if (audioData.audio instanceof Blob) {
          audioSource = URL.createObjectURL(audioData.audio);
        } else if (typeof audioData.audio === "string") {
          // 处理base64字符串
          if (audioData.audio.startsWith("data:")) {
            audioSource = audioData.audio;
          } else {
            // 如果是纯base64字符串，转换为data URL
            const mimeType = audioData.contentType || "audio/mpeg";
            audioSource = `data:${mimeType};base64,${audioData.audio}`;
          }
        } else {
          throw new Error("不支持的音频数据类型");
        }
      } else {
        audioSource = audioData;
      }

      // 创建Audio对象并播放
      const audio = new Audio(audioSource);

      // 保存当前音频引用
      this.currentAudio = audio;

      // 定义事件处理函数，以便后续可以移除监听器
      const handleAudioEnded = () => {
        // 如果是Blob URL，释放URL对象
        if (
          typeof audioSource === "string" &&
          audioSource.startsWith("blob:")
        ) {
          URL.revokeObjectURL(audioSource);
        }
        // 播放完成后清除当前音频引用
        if (this.currentAudio === audio) {
          this.currentAudio = null;
        }
        audio.removeEventListener("ended", handleAudioEnded);
      };

      audio.addEventListener("ended", handleAudioEnded);

      // 添加错误处理，确保在出错时也能清理资源
      const handleAudioError = () => {
        // 如果是Blob URL，释放URL对象
        if (
          typeof audioSource === "string" &&
          audioSource.startsWith("blob:")
        ) {
          URL.revokeObjectURL(audioSource);
        }
        // 清除当前音频引用
        if (this.currentAudio === audio) {
          this.currentAudio = null;
        }
        audio.removeEventListener("ended", handleAudioEnded);
        audio.removeEventListener("error", handleAudioError);
      };

      audio.addEventListener("error", handleAudioError);

      return await audio.play();
    } catch (error) {
      // 清除可能设置的音频引用
      this.currentAudio = null;

      // 最终降级到Web Speech API
      if (audioData.text || typeof audioData === "string") {
        return await this.playWithWebSpeechAPI(audioData.text || audioData);
      }
      throw error;
    }
  }

  /**
   * 停止当前正在播放的音频
   */
  static stopCurrentAudio() {
    // 停止当前正在播放的Audio对象
    if (this.currentAudio) {
      try {
        this.currentAudio.pause();
        this.currentAudio.currentTime = 0;
      } catch (error) {
        throw error;
      } finally {
        this.currentAudio = null;
      }
    }

    // 停止Web Speech API的语音播放
    if ("speechSynthesis" in window) {
      try {
        window.speechSynthesis.cancel();
      } catch (error) {
        throw error;
      }
    }
  }

  /**
   * 使用Web Speech API播放语音（降级方案）
   * @param {string} text - 要朗读的文本
   * @returns {Promise<void>}
   */
  static async playWithWebSpeechAPI(text) {
    if (!("speechSynthesis" in window)) {
      throw new Error("浏览器不支持Web Speech API");
    }

    return new Promise((resolve, reject) => {
      try {
        this.stopCurrentAudio();

        const utterance = new SpeechSynthesisUtterance(text);

        utterance.lang = "zh-CN";
        utterance.rate = 0.9;
        utterance.onend = () => resolve();

        const voices = window.speechSynthesis.getVoices();
        const chineseVoice = voices.find(
          (voice) =>
            voice.lang === "zh-CN" ||
            voice.name.includes("Chinese") ||
            voice.name.includes("中文")
        );

        if (chineseVoice) {
          utterance.voice = chineseVoice;
        }

        window.speechSynthesis.speak(utterance);
      } catch (error) {
        reject(error);
      }
    });
  }
}

export default TTSService;
