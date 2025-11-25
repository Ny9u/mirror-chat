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
              <div class="title" v-if="item.role === 'assistant'">
                Mirror
                <div class="time">{{ item.time || "" }}</div>
              </div>
              <div class="content">
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
                <div class="tool" v-if="item.role === 'assistant'">
                  <n-popover
                    placement="bottom"
                    trigger="hover"
                    raw
                    :show-arrow="false"
                  >
                    <template #trigger>
                      <n-button text size="large" @click="copyMessage(item)">
                        <template #icon>
                          <n-icon><Copy /></n-icon>
                        </template>
                      </n-button>
                    </template>
                    <div
                      :style="{
                        backgroundColor: '#000000',
                        color: '#f1f2f8',
                        borderRadius: '8px',
                        padding: '6px 12px',
                        fontSize: '14px',
                      }"
                    >
                      复制
                    </div>
                  </n-popover>
                  <n-popover
                    placement="bottom"
                    trigger="hover"
                    raw
                    :show-arrow="false"
                  >
                    <template #trigger>
                      <n-button
                        text
                        size="large"
                        @click="regenerateResponse(item)"
                      >
                        <template #icon>
                          <n-icon><Refresh /></n-icon>
                        </template>
                      </n-button>
                    </template>
                    <div
                      :style="{
                        backgroundColor: '#000000',
                        color: '#f1f2f8',
                        borderRadius: '8px',
                        padding: '6px 12px',
                        fontSize: '14px',
                      }"
                    >
                      重新生成
                    </div>
                  </n-popover>
                  <n-popover
                    placement="bottom"
                    trigger="hover"
                    raw
                    :show-arrow="false"
                  >
                    <template #trigger>
                      <n-button text size="large" @click="playVoice(item)">
                        <template #icon>
                          <n-icon><Volume /></n-icon>
                        </template>
                      </n-button>
                    </template>
                    <div
                      :style="{
                        backgroundColor: '#000000',
                        color: '#f1f2f8',
                        borderRadius: '8px',
                        padding: '6px 12px',
                        fontSize: '14px',
                      }"
                    >
                      语音朗读
                    </div>
                  </n-popover>
                  <n-popover
                    placement="bottom"
                    trigger="hover"
                    raw
                    :show-arrow="false"
                  >
                    <template #trigger>
                      <n-button text size="large" @click="deleteMessage(item)">
                        <template #icon>
                          <n-icon><Trash /></n-icon>
                        </template>
                      </n-button>
                    </template>
                    <div
                      :style="{
                        backgroundColor: '#000000',
                        color: '#f1f2f8',
                        borderRadius: '8px',
                        padding: '6px 12px',
                        fontSize: '14px',
                      }"
                    >
                      删除
                    </div>
                  </n-popover>
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
import { computed, onMounted, ref, toRefs, watch, onBeforeMount, h } from "vue";
import {
  NVirtualList,
  NAvatar,
  useMessage,
  NSpin,
  NIcon,
  NButton,
  NPopover,
  useDialog,
} from "naive-ui";
import {
  Loader,
  Copy,
  Refresh,
  Trash,
  AlertTriangle,
  Volume,
} from "@vicons/tabler";
import assistantUrl from "@/assets/assistant.svg";
import assistantDarkUrl from "@/assets/assistant_dark.svg";
import userUrl from "@/assets/avatar.svg";
import OpenAI from "openai";
import Global from "@/utils/global.js";
import MarkdownIt from "markdown-it";
import Typed from "typed.js";
import { useConfigStore } from "@/stores/configStore.js";
import { api } from "@/config/api.js";
import { formatChineseTime, getChineseGreeting } from "@/utils/date.js";
import TTSService from "@/services/ttsService.js";

const props = defineProps({
  userInput: String,
  netSearch: Boolean,
  deepThinking: Boolean,
});
const { userInput, netSearch, deepThinking } = toRefs(props);

const configStore = useConfigStore();
const message = useMessage();
const dialog = useDialog();
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
      content: "你是一个专业、精准、高效的智能问答助手,名字叫Mirror。",
      key: Global.getRandomKey(),
    },
  ]
);

const role = ["assistant", "user"];

// 初始化openai
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_ALIYUN_API_KEY, // 使用环境变量
  baseURL: api.aliyun,
  dangerouslyAllowBrowser: true,
});

// 发送消息
const sendMessage = (userInput) => {
  if (netSearch.value) {
    if (!configStore.model.includes("qwq") || /\d/.test(configStore.model)) {
      message.error("当前模型不支持联网搜索");
      return false;
    }
  }
  if (deepThinking.value && !configStore.model.includes("qwq")) {
    message.error("当前模型不支持深度思考");
    return false;
  }
  chatHistory.value.push({
    role: "user",
    content: [
      {
        type: "content",
        data: userInput,
      },
    ],
    key: Global.getRandomKey(),
    time: formatChineseTime(new Date()),
  });
  if (chatHistory.value.length > 2) {
    virtualListRef.value.scrollTo({
      position: "bottom",
    });
  }
  sessionStorage.setItem("chatHistory", JSON.stringify(chatHistory.value));
  return true;
};

const fetchAI = async (signal) => {
  if (deepThinking.value) {
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
      time: formatChineseTime(new Date()),
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
              time: formatChineseTime(new Date()),
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

const copyMessage = (item) => {
  if (!item.content || item.content.length === 0) return;

  let copyText = "";
  item.content.forEach((content) => {
    if (content.type === "content" && content.data) {
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = content.data;
      copyText += tempDiv.textContent || tempDiv.innerText || "";
      if (copyText) {
        navigator.clipboard
          .writeText(copyText)
          .then(() => {
            message.success("成功复制到剪贴板！");
          })
          .catch(() => {
            message.error("复制失败");
          });
      }
    }
  });
};

const regenerateResponse = (item) => {
  const index = chatHistory.value.findIndex((msg) => msg.key === item.key);
  if (index === -1) return;

  chatHistory.value = chatHistory.value.slice(0, index);

  let lastMessage = null;
  let lastMessageIndex = null;
  for (let i = chatHistory.value.length - 1; i >= 0; i--) {
    if (chatHistory.value[i].role === "user") {
      lastMessage = chatHistory.value[i];
      lastMessageIndex = i;
      break;
    }
  }

  if (lastMessage && lastMessageIndex !== null) {
    chatHistory.value = chatHistory.value.slice(0, lastMessageIndex);
    const userInput = lastMessage.content[0].data;
    sendMessage(userInput);
    fetchAI(new AbortController().signal);
  }
};

const playVoice = async (item) => {
  try {
    // 提取消息文本内容
    let textToSpeak = "";
    if (item.content && item.content.length > 0) {
      item.content.forEach((content) => {
        if (content.type === "content" && content.data) {
          const tempDiv = document.createElement("div");
          tempDiv.innerHTML = content.data;
          textToSpeak += tempDiv.textContent || tempDiv.innerText || "";
        }
      });
    }

    if (!textToSpeak) {
      message.warning("暂不支持播放");
      return;
    }

    // 超出文本限制长度时采用降级方案
    if (textToSpeak.length > 150) {
      TTSService.playWithWebSpeechAPI(textToSpeak);
      return;
    }

    try {
      const audioData = await TTSService.synthesizeSpeech(textToSpeak);
      await TTSService.playAudio(audioData);
    } catch (error) {
      message.error("语音播放失败: " + (error.message || "未知错误"));
    }
  } catch (error) {
    message.error("语音播放失败: " + (error.message || "未知错误"));
  }
};

const deleteMessage = (item) => {
  dialog.warning({
    title: "是否删除该条消息？",
    content: "删除后，聊天记录不可恢复，对话内的文件也将被彻底删除。",
    positiveText: "删除",
    negativeText: "取消",
    icon: () =>
      h(
        "div",
        {
          style: `
            width: 28px;
            height: 28px;
            color: #f53d3d;
            display: flex;
            justify-content: center;
            align-items: center;
          `,
        },
        [h(NIcon, { size: 28, component: AlertTriangle }, null)]
      ),
    style: "height: 170px; border-radius: 10px; overflow: hidden;",
    titleStyle: "font-weight: 600;",
    contentStyle: "font-size: 1rem; margin-bottom: 0px;",
    positiveButtonProps: {
      type: "error",
      style: "height: 34px; border-radius: 8px; margin-top: 20px;",
    },
    negativeButtonProps: {
      style: "height: 34px; border-radius: 8px; margin-top: 20px;",
    },
    onPositiveClick: () => {
      const index = chatHistory.value.findIndex((msg) => msg.key === item.key);
      if (index !== -1) {
        chatHistory.value.splice(index, 1);
        sessionStorage.setItem(
          "chatHistory",
          JSON.stringify(chatHistory.value)
        );
      }
    },
  });
};

defineExpose({ sendMessage, fetchAI });
const initTyped = () => {
  const time = getChineseGreeting(new Date());
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
      flex-direction: column;
      &:hover .time {
        opacity: 0.7 !important ;
      }
      .title {
        font-size: 1.2rem;
        font-weight: bold;
        color: var(--text-color);
        display: flex;
        align-items: baseline;
        gap: 0.5rem;
        .time {
          font-size: 0.8rem;
          font-weight: normal;
          color: var(--text-color);
          opacity: 0;
          transition: opacity 0.2s ease-in-out;
        }
      }
      .content {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: 0.25rem;
        .text-container {
          max-width: 37.33rem;
          background: var(--message-color) no-repeat center;
          border-radius: 0.53rem;
          .text {
            padding: 0.6rem 1.33rem;
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
        .tool {
          display: flex;
          padding: 0.5rem 0;
        }
      }
    }

    ::v-deep(.n-button--text-type) {
      background-color: transparent !important;
      color: var(--text-color) !important;
      opacity: 0.7;
      transition: opacity 0.2s ease-in-out;
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
      cursor: default;
    }
  }
}
</style>
