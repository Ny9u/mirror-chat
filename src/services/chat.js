import { api } from "@/config/api";

/**
 * 将base64图片URL转换为File对象
 * @param {string} imageUrl - base64图片URL
 * @param {string} filename - 文件名
 * @returns {Promise<File>}
 */
const base64ToFile = async (imageUrl, filename) => {
  try {
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    const ext = filename.split(".").pop() || "png";
    return new File([blob], filename, { type: blob.type || `image/${ext}` });
  } catch (error) {
    throw new Error("图片URL转File失败: " + error.message);
  }
};

/**
 * 统一的聊天接口,支持文本、图片和文件
 * @param {Object} messageData - 消息数据
 * @param {string} messageData.content - 用户输入的文本内容
 * @param {string[]} messageData.images - 图片URL数组(可选)
 * @param {string} messageData.chatId - 会话ID(可选)
 * @param {string} messageData.model - 模型ID(可选)
 * @param {boolean} messageData.enableThinking - 是否启用深度思考(可选)
 * @param {boolean} messageData.enableSearch - 是否启用搜索(可选)
 * @param {boolean} messageData.enableKnowledge - 是否启用知识库(可选)
 * @param {boolean} messageData.enableImageGeneration - 是否启用图像生成(可选)
 * @param {boolean} messageData.isRegenerate - 是否重新生成(可选)
 * @param {File[]} messageData.files - 文件数组(可选)
 * @param {Function} onChunk - 流式数据回调函数
 * @param {Function} onComplete - 完成回调函数
 * @param {Function} onError - 错误回调函数
 * @param {AbortSignal} signal - 中止信号(可选)
 */
export const chat = async (
  messageData,
  onChunk,
  onComplete,
  onError,
  signal
) => {
  const hasFiles = messageData.files && messageData.files.length > 0;

  let response;
  if (hasFiles) {
    // 使用 FormData 格式
    const formData = new FormData();

    // 基本参数
    formData.append("content", messageData.content || "");
    if (messageData.chatId) formData.append("chatId", messageData.chatId);
    if (messageData.model) formData.append("model", messageData.model);
    if (messageData.enableThinking) formData.append("enableThinking", "true");
    if (messageData.enableSearch) formData.append("enableSearch", "true");
    if (messageData.enableKnowledge) formData.append("enableKnowledge", "true");
    if (messageData.enableImageGeneration) formData.append("enableImageGeneration", "true");
    if (messageData.isRegenerate) formData.append("isRegenerate", "true");

    // 图片处理
    if (messageData.images && messageData.images.length > 0) {
      for (let i = 0; i < messageData.images.length; i++) {
        const imageUrl = messageData.images[i];
        if (imageUrl.startsWith("data:image/")) {
          const filename = `image_${i}.png`;
          const file = await base64ToFile(imageUrl, filename);
          if (file) {
            formData.append("images", file);
          }
        }
      }
    }

    // 文件上传
    if (hasFiles) {
      messageData.files.forEach((file) => {
        // 确保 file 对象有效且是 File 实例
        if (file && file instanceof File) {
          formData.append("files", file);
        }
      });
    }

    // 发送请求
    response = await fetch(`${import.meta.env.VITE_API_BASE_URL}${api.chat}`, {
      method: "POST",
      body: formData,
      credentials: "include",
      signal: signal,
    });
  } else {
    // 使用 JSON 格式
    response = await fetch(`${import.meta.env.VITE_API_BASE_URL}${api.chat}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(messageData),
      credentials: "include",
      signal: signal,
    });
  }

  if (!response.ok) {
    throw new Error(`请求失败: ${response.status}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let result = {
    reasoningContent: "",
    content: "",
    chatId: "",
  };

  return new Promise((resolve, reject) => {
    const read = () => {
      reader
        .read()
        .then(({ done, value }) => {
          if (done) {
            if (onComplete) onComplete(result);
            resolve();
            return;
          }

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");

          for (let i = 0; i < lines.length - 1; i++) {
            const line = lines[i].trim();
            if (line.startsWith("data: ")) {
              try {
                const data = JSON.parse(line.substring(6));
                if (data.reasoningContent) {
                  result.reasoningContent += data.reasoningContent;
                }
                if (data.content) {
                  result.content += data.content;
                }
                if (data.chatId) {
                  result.chatId = data.chatId;
                }
                if (onChunk) onChunk(data);
              } catch (e) {
                throw new Error("解析数据失败: " + e.message);
              }
            }
          }

          buffer = lines[lines.length - 1];
          read();
        })
        .catch((error) => {
          if (onError) onError(error);
          reject(error);
        });
    };

    read();
  });
};
