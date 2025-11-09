<template>
  <div class="message-container" :class="{ chat: chatHistory.slice(1).length }">
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
            <n-avatar
              round
              :src="getAvatar(item.role)"
              class="avatar"
              v-if="item.role === 'assistant'"
            />
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
                    maxWidth: item.role === 'assistant' ? '63vw' : '560px',
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
  </div>
</template>

<script setup>
import {
  computed,
  onMounted,
  ref,
  getCurrentInstance,
  toRefs,
  watch,
  onBeforeMount,
} from "vue";
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
import { getUserInfo } from "../services/user.js";

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
const chatHistory = ref(
  JSON.parse(sessionStorage.getItem("chatHistory")) || [
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
  apiKey: import.meta.env.VITE_ALIYUN_API_KEY, // 使用环境变量
  baseURL: proxy.$api.aliyun,
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
  sessionStorage.setItem("chatHistory", JSON.stringify(chatHistory.value));
};

const fetchAI = async (signal) => {
  if (netSearch.value) {
    if (!configStore.model.includes("qwq") || /\d/.test(configStore.model)) {
      message.error("当前模型不支持联网搜索");
      return;
    }
  }
  if (deepThinking.value) {
    if (!configStore.model.includes("qwq")) {
      message.error("当前模型不支持深度思考");
      return;
    }
    let reasoningContent = "";
    let answerContent = "";
    const stream = await openai.chat.completions.create({
      model: configStore.model,
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
    let shouldAbort = false;
    for await (const chunk of stream) {
      if (signal.aborted) {
        chatHistory.value[chatHistory.value.length - 1].isFinishThinking = true;
        shouldAbort = true;
        break;
      }
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
    if (!shouldAbort) {
      chatHistory.value[chatHistory.value.length - 1].content.push({
        type: "content",
        data: md.render(answerContent),
      });
    }
    scrollToBottom();
    sessionStorage.setItem("chatHistory", JSON.stringify(chatHistory.value));
    return answerContent;
  } else {
    const stream = await openai.chat.completions.create({
      model: configStore.model,
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
    let hasPushed = false;

    let lastScrollTime = 0;
    const scrollTime = 500;
    let shouldAbort = false;
    for await (const chunk of stream) {
      if (signal.aborted) {
        shouldAbort = true;
        break;
      }
      if (Array.isArray(chunk.choices) && chunk.choices.length > 0) {
        if (chunk.choices[0].delta.content) {
          fullContent = fullContent + chunk.choices[0].delta.content;
          if (!hasPushed) {
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
            hasPushed = true;
          }
          chatHistory.value[chatHistory.value.length - 1].content[0].data =
            md.render(fullContent);
        }
        const now = Date.now();
        if (now - lastScrollTime > scrollTime) {
          virtualListRef.value.scrollTo({
            position: "bottom",
          });
          lastScrollTime = now;
        }
      }
    }
    if (!shouldAbort) {
      sessionStorage.setItem("chatHistory", JSON.stringify(chatHistory.value));
    }
    return fullContent;
  }
};
const getAvatar = (role) => {
  if (configStore.theme === "light" && role === "assistant") {
    return assistantDarkUrl;
  }
  return role === "assistant" ? assistantUrl : configStore.avatar;
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
const getInfo = async (id) => {
  try {
    const res = await getUserInfo({ userId: id });
    configStore.setAvatar(res?.results[0].data[0].avatarUrl);
    configStore.setName(res?.results[1].data[0].userName);
  } catch (e) {
    return message.error("获取用户信息失败");
  }
};
const initTyped = () => {
  const time = judgeTime();
  new Typed("#typed", {
    strings: [
      `${
        configStore.name
          ? `${time}好, ${configStore.name}`
          : `${time}好 , Master`
      }🥰🥰`,
    ],
    typeSpeed: 50,
    backSpeed: 0,
    loop: false,
    showCursor: false,
  });
};

watch(() => configStore.name, initTyped);

onBeforeMount(async () => {
  getInfo(configStore.userId);
});

onMounted(() => {
  initTyped();
  if (virtualListRef.value && chatHistory.value.length > 2) {
    scrollToBottom();
  }
});
</script>

<style lang="less" scoped>
.message-container {
  width: 70vw;
  height: 35vh;
  background: var(--background-color) no-repeat center;
  transition: height 0.3s ease-in-out;

  &.chat {
    height: 70vh;
  }

  .message-list {
    width: 100%;
    height: 100%;
    .item {
      display: flex;
      align-items: flex-start;
      margin: 2.67rem 0;
      color: var(--text-color);
    }
    .avatar {
      width: 2.13rem;
      height: 2.13rem;
      margin: 0 0.67rem;
    }
    .message {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 20px;
      .text-container {
        max-width: 37.33rem;
        background: var(--message-color) no-repeat center;
        border-radius: 0.53rem;
        .text {
          padding: 0.67rem 1.33rem;
          font-size: 1.07rem;
          caret-color: transparent;
        }
      }
      .think-container {
        max-width: 60rem;
        .think {
          padding: 0.07rem 1.33rem;
          font-size: 0.87rem;
          color: var(--text-color);
          background: var(--think-color) no-repeat center;
          border-left: 0.2rem solid var(--text-color);
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
      font-size: 1.07rem;
      gap: 0.67rem;
    }
    ::v-deep(.n-spin-description) {
      margin-top: 0rem;
    }
  }
  .welcome {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: end;
    .welcome-text {
      font-size: 2rem;
      font-weight: bold;
      color: var(--text-color);
    }
  }
}
</style>
