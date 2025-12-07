import OpenAI from "openai";
import { api } from "@/config/api.js";
import { useConfigStore } from "@/stores/configStore.js";
import Global from "@/utils/global.js";

// 初始化openai
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_ALIYUN_API_KEY, // 使用环境变量
  baseURL: api.aliyun,
  dangerouslyAllowBrowser: true,
});

/**
 * 生成聊天标题
 * @param {Array} chatHistory - 聊天历史记录
 * @returns {Promise<string>} - 生成的标题
 */
export const generateTitle = async (chatHistory) => {
  try {
    const configStore = useConfigStore();
    const titlePrompt = {
      role: "system",
      content:
        "你是一个专业的标题生成助手。请根据以下对话内容生成一个简洁、准确的标题，标题不超过15个字，不要使用引号或其他标点符号。",
    };

    // 添加用户消息，限制内容长度以避免token过多
    const userMessages = chatHistory.map((msg) => ({
      role: msg.role,
      content:
        msg.content[0].data.length > 200
          ? msg.content[0].data.substring(0, 200) + "..."
          : msg.content[0].data,
    }));

    const response = await openai.chat.completions.create({
      model: configStore.model,
      messages: [titlePrompt, ...userMessages],
      temperature: 0.7,
      max_tokens: 20,
    });

    let title = response.choices[0].message.content.trim();

    title = title.replace(/^["'"'"]+|["'"'"]+$/g, "");

    // 确保标题不为空
    if (!title) {
      return "新对话";
    }

    return title;
  } catch (error) {
    console.error("生成标题失败:", error);
    return "新对话";
  }
};

export default {
  generateTitle,
};
