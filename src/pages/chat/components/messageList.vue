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
                      <div v-html="processContent(i.data)"></div>
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
                      <div v-html="processContent(i.data)"></div>
                    </div>
                  </div>
                </div>
                <div class="tool" v-if="item.role === 'assistant'">
                  <n-popover
                    placement="top"
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
                    placement="top"
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
                    placement="top"
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
                    trigger="click"
                    raw
                    :show-arrow="false"
                    class="message-actions-popover"
                    v-model:show="popoverShowMap[item.key]"
                  >
                    <template #trigger>
                      <n-popover
                        placement="top"
                        trigger="hover"
                        raw
                        :show-arrow="false"
                      >
                        <template #trigger>
                          <n-button text size="large">
                            <template #icon>
                              <n-icon><Dots /></n-icon>
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
                          更多
                        </div>
                      </n-popover>
                    </template>
                    <div
                      :style="{
                        padding: '8px 8px',
                      }"
                    >
                      <div
                        style="
                          padding: 8px 12px;
                          border-radius: 10px;
                          cursor: pointer;
                          display: flex;
                          align-items: center;
                          gap: 8px;
                          transition: background-color 0.2s ease;
                        "
                        @click="favoriteMessage(item)"
                        @mouseover="
                          $event.currentTarget.style.backgroundColor =
                            'rgba(0, 0, 0, 0.1)'
                        "
                        @mouseout="
                          $event.currentTarget.style.backgroundColor =
                            'transparent'
                        "
                      >
                        <n-icon size="18">
                          <Bookmark />
                        </n-icon>
                        <span>收藏</span>
                      </div>
                      <div
                        style="
                          padding: 8px 12px;
                          border-radius: 10px;
                          cursor: pointer;
                          display: flex;
                          align-items: center;
                          gap: 8px;
                          transition: background-color 0.2s ease;
                        "
                        @click="deleteMessage(item)"
                        @mouseover="
                          $event.currentTarget.style.backgroundColor =
                            'rgba(0, 0, 0, 0.1)'
                        "
                        @mouseout="
                          $event.currentTarget.style.backgroundColor =
                            'transparent'
                        "
                      >
                        <n-icon size="18" color="rgba(249,57,32,1)">
                          <Trash />
                        </n-icon>
                        <span style="color: rgba(249, 57, 32, 1)">删除</span>
                      </div>
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
import {
  computed,
  onMounted,
  ref,
  toRefs,
  watch,
  onBeforeMount,
  onBeforeUnmount,
  h,
} from "vue";
import {
  NVirtualList,
  NAvatar,
  useMessage,
  NSpin,
  NIcon,
  NButton,
  NPopover,
  useDialog,
  NList,
  NListItem,
} from "naive-ui";
import {
  Loader,
  Copy,
  Refresh,
  Trash,
  AlertTriangle,
  Volume,
  Dots,
  Bookmark,
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
import { addFavorites } from "@/services/user.js";
import { generateTitle } from "@/services/titleService.js";
import hljs from "highlight.js/lib/core";
// 按需导入常用语言包
import javascript from "highlight.js/lib/languages/javascript";
import python from "highlight.js/lib/languages/python";
import java from "highlight.js/lib/languages/java";
import json from "highlight.js/lib/languages/json";
import bash from "highlight.js/lib/languages/bash";
import cpp from "highlight.js/lib/languages/cpp";
import "highlight.js/styles/github.css";

hljs.registerLanguage("javascript", javascript);
hljs.registerLanguage("js", javascript);
hljs.registerLanguage("python", python);
hljs.registerLanguage("py", python);
hljs.registerLanguage("java", java);
hljs.registerLanguage("json", json);
hljs.registerLanguage("bash", bash);
hljs.registerLanguage("shell", bash);
hljs.registerLanguage("sh", bash);
hljs.registerLanguage("cpp", cpp);
hljs.registerLanguage("c++", cpp);
hljs.registerLanguage("c", cpp);

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
  breaks: true,
  highlight: function (str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return (
          '<pre class="hljs"><code>' +
          hljs.highlight(str, { language: lang, ignoreIllegals: true }).value +
          "</code></pre>"
        );
      } catch (__) {}
    }
    return (
      '<pre class="hljs"><code>' + md.utils.escapeHtml(str) + "</code></pre>"
    );
  },
});
const virtualListRef = ref(null);
const popoverShowMap = ref({});
const chatHistory = ref(
  JSON.parse(sessionStorage.getItem("chatHistory")) || [
    {
      role: "system",
      content: "你是一个专业、精准、高效的智能问答助手,名字叫Mirror。",
      key: Global.getRandomKey(),
    },
  ]
);

// 处理内容，将Markdown转换为HTML并确保代码块高亮
const processContent = (content) => {
  // 如果内容已经是HTML格式，我们需要处理其中的代码块
  if (/<[^>]+>/.test(content)) {
    // 创建一个临时DOM元素来解析HTML
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = content;

    // 查找所有的pre和code标签
    const codeBlocks = tempDiv.querySelectorAll("pre code");
    codeBlocks.forEach((block) => {
      const codeText = block.textContent;
      // 尝试检测语言（如果有class属性）
      const classes = block.className.split(" ");
      const langClass = classes.find((c) => c.startsWith("language-"));
      const lang = langClass ? langClass.replace("language-", "") : "";

      // 使用highlight.js高亮代码
      if (lang && hljs.getLanguage(lang)) {
        try {
          const highlighted = hljs.highlight(codeText, {
            language: lang,
            ignoreIllegals: true,
          }).value;
          block.innerHTML = highlighted;
          block.classList.add("hljs");
        } catch (__) {
          // 如果高亮失败，至少添加hljs类以应用基本样式
          block.classList.add("hljs");
        }
      } else {
        // 尝试自动检测语言
        try {
          const result = hljs.highlightAuto(codeText);
          block.innerHTML = result.value;
          block.classList.add("hljs");
          if (result.language) {
            block.classList.add(`language-${result.language}`);
          }
        } catch (__) {
          block.classList.add("hljs");
        }
      }
    });

    // 处理单独的code标签（不在pre内的）
    const inlineCodes = tempDiv.querySelectorAll("code:not(pre code)");
    inlineCodes.forEach((code) => {
      code.classList.add("hljs");
    });

    return tempDiv.innerHTML;
  }

  // 如果不是HTML格式，使用MarkdownIt渲染
  return md.render(content);
};

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
      const audioData = await TTSService.synthesizeSpeech(
        textToSpeak,
        configStore.voiceType
      );
      await TTSService.playAudio(audioData);
    } catch (error) {
      message.error("语音播放失败: " + (error.message || "未知错误"));
    }
  } catch (error) {
    message.error("语音播放失败: " + (error.message || "未知错误"));
  }
};

const deleteMessage = (message) => {
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
      style:
        "height: 34px; border-radius: 8px; margin-top: 10px;padding: 1.3rem 1.5rem;",
    },
    negativeButtonProps: {
      style:
        "height: 34px; border-radius: 8px; margin-top: 10px;padding: 1.3rem 1.5rem;",
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

const favoriteMessage = async (msg) => {
  const index = chatHistory.value.findIndex((item) => item.key === msg.key);
  popoverShowMap.value[msg.key] = false;
  if (index !== -1) {
    let content = chatHistory.value.slice(index - 1, index + 1);
    try {
      const res = await addFavorites({
        userId: configStore.userId,
        title: await generateTitle(content),
        conversation: JSON.stringify(content),
      });
      if (res.code === 201) {
        message.success("收藏成功");
      }
    } catch (error) {
      message.warning("收藏失败: " + (error.message || "未知错误"));
    }
  }
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

const handleClearChatHistory = () => {
  chatHistory.value = [
    {
      role: "system",
      content: "你是一个专业、精准、高效的智能问答助手,名字叫Mirror。",
      key: Global.getRandomKey(),
    },
  ];
  sessionStorage.setItem("chatHistory", JSON.stringify(chatHistory.value));
};

const handleLoadChatHistory = (event) => {
  const conversationData = event.detail.data;
  if (conversationData) {
    chatHistory.value = conversationData;
    setTimeout(() => {
      if (virtualListRef.value) {
        virtualListRef.value.scrollTo({
          position: "bottom",
        });
      }
    }, 100);
  }
};

onMounted(() => {
  initTyped();
  if (virtualListRef.value && chatHistory.value.length > 2) {
    scrollToBottom();
  }

  window.addEventListener("clearChatHistory", handleClearChatHistory);
  window.addEventListener("loadChatHistory", handleLoadChatHistory);
});

onBeforeUnmount(() => {
  window.removeEventListener("clearChatHistory", handleClearChatHistory);
  window.removeEventListener("loadChatHistory", handleLoadChatHistory);
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
      font-size: 2.5rem;
      color: var(--text-color);
      cursor: default;
    }
  }
}
</style>

<style lang="less">
@import "../styles/messagePopover.less";
@import "@/styles/hljs.less";
</style>
