<template>
  <div class="message-list" v-if="chatHistory.slice(1).length">
    <n-virtual-list
      ref="virtualListRef"
      style="max-height: 70vh"
      :item-size="30"
      :items="chatHistory.slice(1)"
      item-resizable
    >
      <template #default="{ item }">
        <div
          :key="item.key"
          class="item"
          :style="{
            flexDirection: item.role === 'assistant' ? 'row' : 'row-reverse',
          }"
        >
          <n-avatar round :src="getAvatar(item.role)" class="avatar" />
          <div class="message">
            <div v-for="(i, index) in item.content" :key="index">
              <div class="think-container" v-if="i.type === 'thinking'">
                <div class="think">
                  <n-spin
                    size="small"
                    description="思考中"
                    v-if="!item.isFinishThinking"
                  >
                    <template #icon>
                      <n-icon>
                        <Loader />
                      </n-icon>
                    </template>
                  </n-spin>
                  <div v-html="i.data"></div>
                </div>
              </div>
              <div
                class="text-container"
                :style="{
                  maxWidth: item.role === 'assistant' ? '50vw' : '560px',
                }"
                v-if="i.type === 'content'"
              >
                <div class="text">
                  <div v-html="i.data"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </n-virtual-list>
  </div>
  <div class="welcome" v-show="!chatHistory.slice(1).length">
    <div id="typed" class="welcome-text"></div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, getCurrentInstance, toRefs } from "vue";
import { NVirtualList, NAvatar, useMessage, NSpin, NIcon } from "naive-ui";
import assistantUrl from "../assets/assistant.svg";
import assistantDarkUrl from "../assets/assistant_dark.svg";
import userUrl from "../assets/avatar.jpg";
import OpenAI from "openai";
import Global from "../utils/global.js";
import MarkdownIt from "markdown-it";
import Typed from "typed.js";
import { useConfigStore } from "@/stores/configStore.js";
import { Loader } from "@vicons/tabler";

const props = defineProps({
  userInput: String,
  netSearch: Boolean,
  deepThinking: Boolean,
});
const { userInput, netSearch, deepThinking } = toRefs(props);

const configStore = useConfigStore();
const { proxy } = getCurrentInstance();
const message = useMessage();
const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
});
const virtualListRef = ref(null);
let model = "ernie-x1-turbo-32k";
const chatHistory = ref(
  JSON.parse(localStorage.getItem("chatHistory")) || [
    {
      role: "system",
      content: "You are a helpful assistant.",
      key: Global.getRandomKey(),
    },
  ]
);

const role = ["assistant", "user"];

// 初始化openai
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_BAIDU_API_KEY,
  baseURL: proxy.$api.baidu,
  dangerouslyAllowBrowser: true,
});

// 发送消息
const sendMessage = (userInput) => {
  chatHistory.value.push({
    role: "user",
    content: [
      {
        type: "content",
        data: userInput,
      },
    ],
    key: Global.getRandomKey(),
  });
  if (chatHistory.value.length > 2) {
    virtualListRef.value.scrollTo({
      position: "bottom",
    });
  }
  localStorage.setItem("chatHistory", JSON.stringify(chatHistory.value));
};

const fetchAI = async () => {
  if (netSearch.value) {
    if (!model.includes("x1") || /\d/.test(model)) {
      message.error("当前模型不支持联网搜索");
      return;
    }
  }
  if (deepThinking.value) {
    if (!model.includes("x1")) {
      message.error("当前模型不支持深度思考");
      return;
    }
    let reasoningContent = "";
    let answerContent = "";
    const stream = await openai.chat.completions.create({
      model: model,
      messages: Global.sortThinkingMessages(chatHistory.value),
      stream: true,
      enable_search: netSearch.value,
      stream_options: {
        include_usage: true,
        forced_search: netSearch.value,
      },
    });
    chatHistory.value.push({
      role: "assistant",
      content: [
        {
          type: "thinking",
          data: reasoningContent,
        },
      ],
      key: Global.getRandomKey(),
      isFinishThinking: false,
    });
    let lastScrollTime = 0;
    const scrollTime = 500;
    for await (const chunk of stream) {
      if (!chunk.choices?.length) {
        continue;
      }

      const delta = chunk.choices[0].delta;

      // 处理思考过程
      if (delta.reasoning_content) {
        reasoningContent += delta.reasoning_content;
        chatHistory.value[chatHistory.value.length - 1].content[0].data =
          md.render(reasoningContent);
        const now = Date.now();
        if (now - lastScrollTime > scrollTime) {
          virtualListRef.value.scrollTo({
            position: "bottom",
          });
          lastScrollTime = now;
        }
      } else if (delta.content) {
        chatHistory.value[chatHistory.value.length - 1].isFinishThinking = true;
        answerContent += delta.content;
      }
    }
    chatHistory.value[chatHistory.value.length - 1].content.push({
      type: "content",
      data: md.render(answerContent),
    });
    scrollToBottom();
    localStorage.setItem("chatHistory", JSON.stringify(chatHistory.value));
    return answerContent;
  } else {
    const stream = await openai.chat.completions.create({
      model: model,
      messages: Global.sortThinkingMessages(chatHistory.value),
      stream: true,
      enable_search: netSearch.value,
      stream_options: {
        include_usage: true,
        forced_search: netSearch.value,
      },
    });
    if (!stream) {
      throw new Error("请求服务失败");
    }
    let fullContent = "";
    chatHistory.value.push({
      role: "assistant",
      content: [
        {
          type: "content",
          data: fullContent,
        },
      ],
      key: Global.getRandomKey(),
    });
    let lastScrollTime = 0;
    const scrollTime = 500;
    for await (const chunk of stream) {
      if (Array.isArray(chunk.choices) && chunk.choices.length > 0) {
        if (chunk.choices[0].delta.content)
          fullContent = fullContent + chunk.choices[0].delta.content;
        chatHistory.value[chatHistory.value.length - 1].content[0].data =
          md.render(fullContent);
        const now = Date.now();
        if (now - lastScrollTime > scrollTime) {
          virtualListRef.value.scrollTo({
            position: "bottom",
          });
          lastScrollTime = now;
        }
      }
    }
    localStorage.setItem("chatHistory", JSON.stringify(chatHistory.value));
    return fullContent;
  }
};
const getAvatar = (role) => {
  if (configStore.theme === "light" && role === "assistant") {
    return assistantDarkUrl;
  }
  return role === "assistant" ? assistantUrl : userUrl;
};

const scrollToBottom = () => {
  virtualListRef.value.scrollTo({
    index: chatHistory.value.length - 2,
  });
};

const judgeTime = () => {
  const date = new Date();
  const hours = date.getHours();
  if (hours >= 0 && hours < 6) {
    return "凌晨";
  } else if (hours >= 6 && hours < 11) {
    return "早上";
  } else if (hours >= 11 && hours < 14) {
    return "中午";
  } else if (hours >= 14 && hours < 18) {
    return "下午";
  } else {
    return "晚上";
  }
};

defineExpose({ sendMessage, fetchAI });
onMounted(() => {
  let time = judgeTime();
  new Typed("#typed", {
    strings: [`${time}好, Master🥰`],
    typeSpeed: 50,
    backSpeed: 0,
    loop: false,
    showCursor: false,
  });
  if (virtualListRef.value && chatHistory.value.length > 2) {
    scrollToBottom();
  }
});
</script>

<style lang="less" scoped>
.message-list {
  width: 70vw;
  height: 70vh;
  background: var(--background-color) no-repeat center;
  .item {
    display: flex;
    align-items: flex-start;
    margin: 40px 0;
    color: var(--text-color);
  }
  .avatar {
    width: 32px;
    height: 32px;
    margin: 0 10px;
  }
  .message {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 20px;
    .text-container {
      max-width: 560px;
      background: var(--message-color) no-repeat center;
      border-radius: 8px;
      .text {
        padding: 10px 20px;
        font-size: 16px;
      }
    }
    .think-container {
      max-width: 900px;
      .think {
        padding: 1px 20px;
        font-size: 13px;
        color: var(--text-color);
        background: var(--think-color) no-repeat center;
        border-left: 3px solid var(--text-color);
      }
    }
  }

  ::v-deep(.n-scrollbar-rail) {
    display: none;
  }
  ::v-deep(.n-avatar) {
    background-color: transparent;
  }
  ::v-deep(.n-spin-body) {
    flex-direction: row;
    font-size: 16px;
    gap: 10px;
  }
  ::v-deep(.n-spin-description) {
    margin-top: 0px;
  }
}
.welcome {
  width: 70vw;
  height: 70vh;
  background: var(--background-color) no-repeat center;
  display: flex;
  justify-content: center;
  align-items: center;
  .welcome-text {
    font-size: 30px;
    font-weight: bold;
    color: var(--text-color);
  }
}
</style>
