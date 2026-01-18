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
            @mouseenter="handleMouseEnter(item.key)"
            @mouseleave="handleMouseLeave(item.key)"
          >
            <n-avatar
              round
              :src="getAvatar(item.role)"
              class="avatar"
              v-if="item.role === 'assistant'"
            />
            <div
              class="message"
              :class="{ 'message-user': item.role !== 'assistant' }"
            >
              <div class="title" v-if="item.role === 'assistant'">
                Mirror
                <div class="time">{{ item.time || "" }}</div>
              </div>
              <div
                class="content"
                :style="{
                  width: editingMessageKey === item.key ? '800px' : '100%',
                }"
              >
                <div v-for="(i, index) in item.content" :key="index">
                  <div class="think-wrapper" v-if="i.type === 'thinking'">
                    <div
                      class="think-title-bar"
                      @click="toggleThinking(item.key)"
                    >
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
                      <span
                        v-if="item.isFinishThinking"
                        class="think-title-text"
                      >
                        思考过程
                      </span>
                      <n-icon
                        class="toggle-icon"
                        :class="{ collapsed: item.thinkingCollapsed }"
                      >
                        <ChevronDown />
                      </n-icon>
                    </div>
                    <div
                      class="think-content"
                      :class="{ collapsed: item.thinkingCollapsed }"
                    >
                      <div
                        class="think-content-inner"
                        v-html="processContent(i.data)"
                      ></div>
                    </div>
                  </div>
                  <!-- 图片内容渲染 -->
                  <div class="image-container" v-if="i.type === 'image'">
                    <img :src="i.data" class="message-image" />
                  </div>
                  <!-- 文件内容渲染 -->
                  <div class="file-message-container" v-if="i.type === 'file'">
                    <div class="file-message-item">
                      <img
                        :src="getFileIcon(i.data)"
                        class="file-message-icon"
                      />
                      <div class="file-message-info">
                        <div class="file-message-name">{{ i.data }}</div>
                        <div class="file-message-size">
                          {{ formatFileSize(i.size) }}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div
                    class="text-container"
                    :style="{
                      maxWidth: item.role === 'assistant' ? '63vw' : '560px',
                    }"
                    v-if="
                      i.type === 'content' &&
                      i.data &&
                      editingMessageKey !== item.key
                    "
                  >
                    <div class="text">
                      <div v-html="processContent(i.data)"></div>
                    </div>
                  </div>
                </div>
                <!-- 编辑时显示独立的编辑器 -->
                <div
                  v-if="editingMessageKey === item.key"
                  class="edit-container-full"
                >
                  <div class="edit-icon-btn" @click="cancelEdit">
                    <n-icon size="26">
                      <X />
                    </n-icon>
                  </div>
                  <n-input
                    ref="editInputRef"
                    v-model:value="editContent"
                    size="large"
                    type="textarea"
                    placeholder="请输入您的问题"
                    rows="1"
                    class="edit-input"
                  />
                  <div class="edit-icon-btn" @click="saveEdit(item)">
                    <n-icon size="26">
                      <Send />
                    </n-icon>
                  </div>
                </div>
                <div
                  class="tool"
                  v-if="item.role === 'assistant'"
                  :class="{ 'tool-hidden': !hoveredMessageKey[item.key] }"
                >
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
                    class="actions-popover"
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
                <div
                  v-else-if="editingMessageKey !== item.key"
                  class="tool tool-user"
                  :class="{ 'tool-hidden': !hoveredMessageKey[item.key] }"
                >
                  <n-popover
                    v-if="showEditIcon(item)"
                    placement="top"
                    trigger="hover"
                    raw
                    :show-arrow="false"
                  >
                    <template #trigger>
                      <n-button text size="large" @click="editMessage(item)">
                        <template #icon>
                          <n-icon><Edit /></n-icon>
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
                      编辑
                    </div>
                  </n-popover>
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
                    placement="bottom"
                    trigger="click"
                    raw
                    :show-arrow="false"
                    class="actions-popover"
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
  nextTick,
  onMounted,
  ref,
  toRefs,
  watch,
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
  NInput,
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
  Edit,
  X,
  Send,
  ChevronDown,
} from "@vicons/tabler";
import assistantUrl from "@/assets/assistant.svg";
import assistantDarkUrl from "@/assets/assistant_dark.svg";
import Global from "@/utils/global.js";
import MarkdownIt from "markdown-it";
import TypingEffects from "@/utils/typingEffects.js";
import { useConfigStore } from "@/stores/configStore.js";
import { getChineseGreeting } from "@/utils/date.js";
import Models from "@/config/models.js";
import TTSService from "@/services/ttsService.js";
import { addFavorites } from "@/services/user.js";
import { chat } from "@/services/chat.js";
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
  knowledgeBase: Boolean,
  imageGeneration: Boolean,
});
const { userInput, netSearch, deepThinking, knowledgeBase, imageGeneration } =
  toRefs(props);

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
const hoveredMessageKey = ref({});
const editingMessageKey = ref(null);
const editContent = ref("");
const editInputRef = ref(null);
const chatHistory = ref([
  {
    role: "system",
    content: "你是一个专业、精准、高效的智能问答助手,名字叫Mirror。",
    key: Global.getRandomKey(),
    time: "",
  },
]);

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

// 发送消息
const sendMessage = (content, images = [], files = []) => {
  const currentModel = Models.find((m) => m.key === configStore.model);

  if (netSearch.value) {
    if (!currentModel || !currentModel.netSearch) {
      message.error("当前模型暂不支持联网搜索 🔍");
      return false;
    }
  }
  if (deepThinking.value) {
    if (!currentModel || !currentModel.thinkingMode) {
      message.error("当前模型暂不支持深度思考 🧠");
      return false;
    }
  }

  // 构建消息内容
  const messageContent = [];

  if (images && images.length > 0) {
    images.forEach((imageUrl) => {
      messageContent.push({
        type: "image",
        data: imageUrl,
      });
    });
  }

  if (files && files.length > 0) {
    files.forEach((file) => {
      messageContent.push({
        type: "file",
        data: file.name,
        size: file.size,
        fileObject: file,
      });
    });
  }

  // 添加文字内容
  messageContent.push({
    type: "content",
    data: content,
  });

  chatHistory.value.push({
    role: "user",
    content: messageContent,
    key: Global.getRandomKey(),
    time: "",
  });
  if (chatHistory.value.length > 2) {
    virtualListRef.value.scrollTo({
      position: "bottom",
    });
  }
  return true;
};

const fetchAI = async (
  signal,
  images = [],
  files = [],
  content = null,
  isRegenerate = false
) => {
  const chatId = configStore.chatId || undefined;

  // 如果没有传入 content则使用最后一条用户消息
  let userTextContent = content;
  let extractedFiles = files;

  if (!userTextContent || !extractedFiles || extractedFiles.length === 0) {
    for (let i = chatHistory.value.length - 1; i >= 0; i--) {
      if (chatHistory.value[i].role === "user") {
        const textContent = chatHistory.value[i].content.find(
          (c) => c.type === "content"
        );
        userTextContent = textContent ? textContent.data : "";

        // 如果没有传入 files，从 chatHistory 中提取原始 File 对象
        if (!extractedFiles || extractedFiles.length === 0) {
          extractedFiles = chatHistory.value[i].content
            .filter((c) => c.type === "file" && c.fileObject)
            .map((c) => c.fileObject);
        }

        break;
      }
    }
  }

  if (deepThinking.value) {
    let reasoningContent = "";
    let answerContent = "";
    let hasStartedAnswer = false;
    let messageKey = "";
    let messageTime = "";

    chatHistory.value.push({
      role: "assistant",
      content: [
        {
          type: "thinking",
          data: reasoningContent,
        },
      ],
      key: Global.getRandomKey(),
      time: "",
    });

    let lastScrollTime = 0;
    const scrollTime = 500;

    try {
      await chat(
        {
          content: userTextContent,
          images: images,
          files: extractedFiles,
          chatId,
          model: configStore.model,
          enableThinking: true,
          enableSearch: netSearch.value,
          enableKnowledge: knowledgeBase.value,
          enableImageGeneration: imageGeneration.value,
          isRegenerate: isRegenerate,
        },
        (chunk) => {
          // 处理思考过程
          if (chunk.key) {
            messageKey = chunk.key;
            chatHistory.value[chatHistory.value.length - 1].key = messageKey;
          }
          if (chunk.time) {
            messageTime = chunk.time;
            chatHistory.value[chatHistory.value.length - 1].time = messageTime;
          }
          if (chunk.reasoningContent) {
            reasoningContent += chunk.reasoningContent;
            chatHistory.value[chatHistory.value.length - 1].content[0].data =
              md.render(reasoningContent);

            const now = Date.now();
            if (now - lastScrollTime > scrollTime) {
              virtualListRef.value.scrollTo({
                position: "bottom",
              });
              lastScrollTime = now;
            }
          } else if (chunk.content) {
            chatHistory.value[
              chatHistory.value.length - 1
            ].isFinishThinking = true;
            answerContent += chunk.content;

            if (!hasStartedAnswer) {
              chatHistory.value[chatHistory.value.length - 1].content.push({
                type: "content",
                data: "",
              });
              hasStartedAnswer = true;
            }

            chatHistory.value[chatHistory.value.length - 1].content[1].data =
              md.render(answerContent);

            chatHistory.value[
              chatHistory.value.length - 1
            ].thinkingCollapsed = true;

            const now = Date.now();
            if (now - lastScrollTime > scrollTime) {
              virtualListRef.value.scrollTo({
                position: "bottom",
              });
              lastScrollTime = now;
            }
          }

          if (chunk.chatId) {
            configStore.setChatId(chunk.chatId);
          }
        },
        (result) => {
          scrollToBottom();
        },
        (error) => {
          if (signal.aborted) {
            chatHistory.value[
              chatHistory.value.length - 1
            ].isFinishThinking = true;
          } else {
            message.error(error.message || "请求服务失败，请检查网络连接 🌐");
            chatHistory.value[
              chatHistory.value.length - 1
            ].isFinishThinking = true;
          }
        },
        signal
      );

      return answerContent;
    } catch (error) {
      if (signal.aborted) {
        chatHistory.value[chatHistory.value.length - 1].isFinishThinking = true;
      } else {
        message.error(error.message || "请求服务失败，请检查网络连接 🌐");
        chatHistory.value[chatHistory.value.length - 1].isFinishThinking = true;
      }
    }
  } else {
    let fullContent = "";
    let messageKey = "";
    let messageTime = "";
    let assistantMessageAdded = false;

    let lastScrollTime = 0;
    const scrollTime = 500;
    let shouldAbort = false;

    try {
      await chat(
        {
          content: userTextContent,
          images: images,
          files: extractedFiles,
          chatId,
          model: configStore.model,
          enableThinking: false,
          enableSearch: netSearch.value,
          enableKnowledge: knowledgeBase.value,
          enableImageGeneration: imageGeneration.value,
          isRegenerate: isRegenerate,
        },
        (chunk) => {
          if (!assistantMessageAdded) {
            chatHistory.value.push({
              role: "assistant",
              content: [
                {
                  type: "content",
                  data: "",
                },
              ],
              key: Global.getRandomKey(),
              time: "",
            });
            assistantMessageAdded = true;
          }
          if (signal.aborted) {
            shouldAbort = true;
          }

          if (chunk.key) {
            messageKey = chunk.key;
            chatHistory.value[chatHistory.value.length - 1].key = messageKey;
          }
          if (chunk.time) {
            messageTime = chunk.time;
            chatHistory.value[chatHistory.value.length - 1].time = messageTime;
          }
          if (chunk.content) {
            fullContent += chunk.content;

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

          if (chunk.chatId) {
            configStore.setChatId(chunk.chatId);
          }
        },
        (result) => {
          if (!shouldAbort) {
            scrollToBottom();
          }
        },
        (error) => {
          if (signal.aborted) {
            shouldAbort = true;
          } else {
            message.error(error.message || "请求服务失败，请检查网络连接 🌐");
          }
        },
        signal
      );

      return fullContent;
    } catch (error) {
      if (signal.aborted) {
        chatHistory.value.pop();
      } else {
        message.error(error.message || "请求服务失败，请检查网络连接 🌐");
        chatHistory.value.pop();
      }
    }
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
            message.success("已复制到剪贴板！✨");
          })
          .catch(() => {
            message.error("复制失败，请重试 📋");
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
  let lastImages = [];
  let lastFiles = [];
  for (let i = chatHistory.value.length - 1; i >= 0; i--) {
    if (chatHistory.value[i].role === "user") {
      lastMessage = chatHistory.value[i];
      lastMessageIndex = i;

      // 提取用户消息中的图片
      lastImages = lastMessage.content
        .filter((c) => c.type === "image")
        .map((c) => c.data);

      // 从 chatHistory 中提取原始 File 对象
      lastFiles = lastMessage.content
        .filter((c) => c.type === "file" && c.fileObject)
        .map((c) => c.fileObject);

      break;
    }
  }

  if (lastMessage && lastMessageIndex !== null) {
    chatHistory.value = chatHistory.value.slice(0, lastMessageIndex);
    // 正确提取文本内容（找到 type === 'content' 的元素）
    const textContent = lastMessage.content.find((c) => c.type === "content");
    const userText = textContent ? textContent.data : "";
    sendMessage(userText, lastImages, lastFiles);
    fetchAI(
      new AbortController().signal,
      lastImages,
      lastFiles,
      userText,
      true
    );
  }
};

const showEditIcon = (item) => {
  for (let i = chatHistory.value.length - 1; i >= 0; i--) {
    if (chatHistory.value[i].role === "user") {
      return chatHistory.value[i].key === item.key;
    }
  }
  return false;
};

const editMessage = (item) => {
  editingMessageKey.value = item.key;
  const textContent = item.content.find((c) => c.type === "content");
  editContent.value = textContent ? textContent.data : "";

  nextTick(() => {
    if (editInputRef.value) {
      editInputRef.value.focus();
    }
  });
};

const cancelEdit = () => {
  editingMessageKey.value = null;
  editContent.value = "";
};

const toggleThinking = (key) => {
  const message = chatHistory.value.find((msg) => msg.key === key);
  if (message) {
    message.thinkingCollapsed = !message.thinkingCollapsed;
  }
};

const saveEdit = (item) => {
  if (!editContent.value.trim()) {
    message.warning("请先输入内容 📝");
    return;
  }

  const index = chatHistory.value.findIndex((msg) => msg.key === item.key);
  if (index === -1) return;
  chatHistory.value = chatHistory.value.slice(0, index);

  // 提取原消息中的图片
  const existingImages = item.content
    .filter((c) => c.type === "image")
    .map((c) => c.data);

  // 从 chatHistory 中提取原始 File 对象
  const existingFiles = item.content
    .filter((c) => c.type === "file" && c.fileObject)
    .map((c) => c.fileObject);

  const editedText = editContent.value;
  sendMessage(editedText, existingImages, existingFiles);
  fetchAI(
    new AbortController().signal,
    existingImages,
    existingFiles,
    editedText,
    true
  );

  editingMessageKey.value = null;
  editContent.value = "";
};

const handleMouseEnter = (key) => {
  hoveredMessageKey.value[key] = true;
};

const handleMouseLeave = (key) => {
  hoveredMessageKey.value[key] = false;
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
      message.warning("该消息暂不支持语音播放 🔊");
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
      message.error("语音播放失败：" + (error.message || "未知错误"));
    }
  } catch (error) {
    message.error("语音播放失败：" + (error.message || "未知错误"));
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
      const index = chatHistory.value.findIndex(
        (msg) => msg.key === message.key
      );
      if (index !== -1) {
        chatHistory.value.splice(index, 1);
      }
    },
  });
};

const favoriteMessage = async (msg) => {
  popoverShowMap.value[msg.key] = false;

  try {
    const res = await addFavorites({
      userId: configStore.userId,
      conversationId: configStore.chatId,
      key: msg.key,
    });
    if (res.code === 201) {
      message.success("收藏成功！⭐");
    }
  } catch (error) {
    message.warning("收藏失败：" + (error.message || "未知错误"));
  }
};

defineExpose({ sendMessage, fetchAI });

// 存储当前的打字效果实例
let typingInstance = null;
// 标记打字效果是否已经初始化，防止初始加载时重复触发
let hasTypingInitialized = false;
// 标记是否正在等待用户信息加载
let isWaitingForUserInfo = false;

const initTyped = () => {
  // 如果正在等待用户信息，取消等待
  isWaitingForUserInfo = false;

  // 销毁旧实例
  if (typingInstance) {
    typingInstance.destroy();
    typingInstance = null;
  }

  const element = document.getElementById("typed");
  if (!element) return;

  const time = getChineseGreeting(new Date());
  const text = configStore.name
    ? `${time}好, ${configStore.name} 🥰🥰`
    : `${time}好, Master 👋👋`;

  // 随机使用不同的打字效果
  typingInstance = TypingEffects.random(element, text, {
    duration: 2000,
    onComplete: () => {},
  });

  hasTypingInitialized = true;
};

watch(
  () => configStore.userId,
  (newUserId, oldUserId) => {
    // 当 userId 从 null 变为有值时
    if (
      !hasTypingInitialized &&
      isWaitingForUserInfo &&
      newUserId &&
      !oldUserId
    ) {
      initTyped();
    }
  }
);

// 监听 name 变化，用于用户主动修改昵称
watch(
  () => configStore.name,
  (newName, oldName) => {
    // 只在已初始化后，且用户主动修改昵称时重新初始化
    if (hasTypingInitialized && newName && oldName && newName !== oldName) {
      initTyped();
    }
  }
);

const handleClearChatHistory = () => {
  chatHistory.value = [
    {
      role: "system",
      content: "你是一个专业、精准、高效的智能问答助手,名字叫Mirror。",
      key: Global.getRandomKey(),
    },
  ];
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

// 格式化文件大小
const formatFileSize = (bytes) => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
};

// 获取文件图标
const getFileIcon = (fileName) => {
  const ext = fileName.split(".").pop()?.toLowerCase() || "";
  switch (ext) {
    case "pdf":
      return new URL("@/assets/PDF.svg", import.meta.url).href;
    case "doc":
    case "docx":
      return new URL("@/assets/DOCX.svg", import.meta.url).href;
    case "txt":
    case "md":
    default:
      return new URL("@/assets/Markdown.svg", import.meta.url).href;
  }
};

onMounted(() => {
  if (configStore.userId) {
    // 用户已登录且信息已加载，直接初始化
    initTyped();
  } else {
    // 用户信息未加载，可能是：
    // 1. 路由守卫正在执行（已登录但信息还在加载中）
    // 2. 用户未登录
    isWaitingForUserInfo = true;
    setTimeout(() => {
      if (isWaitingForUserInfo && !hasTypingInitialized) {
        // 超时后仍未加载用户信息，执行初始化
        initTyped();
      }
    }, 500);
  }

  if (virtualListRef.value && chatHistory.value.length > 2) {
    scrollToBottom();
  }

  window.addEventListener("clearChatHistory", handleClearChatHistory);
  window.addEventListener("loadChatHistory", handleLoadChatHistory);
});

onBeforeUnmount(() => {
  // 清理打字效果实例
  if (typingInstance) {
    typingInstance.destroy();
    typingInstance = null;
  }

  window.removeEventListener("clearChatHistory", handleClearChatHistory);
  window.removeEventListener("loadChatHistory", handleLoadChatHistory);
});
</script>

<style lang="less" scoped>
/* 消息项入场动画 */
@keyframes messageSlideIn {
  0% {
    opacity: 0;
    transform: translateY(20px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes messageSlideInRight {
  0% {
    opacity: 0;
    transform: translateX(20px);
  }
  100% {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes contentFadeIn {
  0% {
    opacity: 0;
    transform: translateY(10px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

.message-container {
  width: 70vw;
  height: 35vh;
  background: var(--background-color) no-repeat center;
  transition: height 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);

  &.chat {
    height: 70vh;
  }

  .message-list {
    width: 100%;
    height: 100%;
    .item {
      display: flex;
      align-items: flex-start;
      margin: 2rem 0;
      padding: 0.5rem 0;
      color: var(--text-color);
      animation: messageSlideIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
      transition: all 0.3s ease;
    }
    .avatar {
      width: 2rem;
      height: 2rem;
      margin: 0 0.67rem;
    }
    .message {
      flex-direction: column;
      max-width: calc(100% - 4rem);

      &:hover .time {
        opacity: 0.7 !important;
      }
      .title {
        font-size: 1.1rem;
        font-weight: 600;
        color: var(--text-color);
        display: flex;
        align-items: baseline;
        gap: 0.6rem;
        margin-bottom: 0.4rem;
        animation: contentFadeIn 0.4s ease 0.1s forwards;
        opacity: 0;

        .time {
          font-size: 0.75rem;
          font-weight: normal;
          color: var(--text-color);
          opacity: 0;
          transition: opacity 0.3s ease;
        }
      }
      .content {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: 0.5rem;
        animation: contentFadeIn 0.4s ease 0.15s forwards;
        opacity: 0;
      }
      &.message-user {
        .content {
          align-items: flex-end;
        }
        animation: messageSlideInRight 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)
          forwards;
      }
      .text-container {
        max-width: 37.33rem;
        display: flex;
        background: var(--message-color) no-repeat center;
        border-radius: 1rem;
        position: relative;
        overflow: hidden;
        transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);

        .text {
          width: 100%;
          padding: 0.8rem 1.2rem;
          font-size: 1rem;
          line-height: 1.7;
          caret-color: transparent;
        }
      }
      .image-container {
        display: flex;
        justify-content: flex-end;
        margin-top: 0.5rem;
        animation: contentFadeIn 0.4s ease 0.2s forwards;
        opacity: 0;

        .message-image {
          max-width: 100%;
          max-height: 200px;
          border-radius: 10px;
          object-fit: contain;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
      }
      &.message-user .image-container {
        justify-content: flex-end;
      }

      .file-message-container {
        display: flex;
        justify-content: flex-end;
        margin-top: 0.5rem;
        animation: contentFadeIn 0.4s ease 0.2s forwards;
        opacity: 0;

        .file-message-item {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          padding: 0.5rem 0.8rem;
          background: var(--message-color);
          backdrop-filter: blur(20px) saturate(180%);
          -webkit-backdrop-filter: blur(20px) saturate(180%);
          border-radius: 10px;
          border: 0.5px solid rgba(255, 255, 255, 0.1);
          min-width: 200px;
          height: 52px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

          .file-message-icon {
            width: 24px;
            height: 24px;
            color: var(--primary-color);
            flex-shrink: 0;
          }

          .file-message-info {
            flex: 1;
            min-width: 0;

            .file-message-name {
              font-size: 13px;
              font-weight: 500;
              color: var(--text-color);
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
              margin-bottom: 0.15rem;
              line-height: 1.3;
            }

            .file-message-size {
              font-size: 11px;
              color: var(--text-color);
              opacity: 0.5;
              line-height: 1.2;
            }
          }
        }
      }
      &.message-user .file-message-container {
        justify-content: flex-end;
      }
      .edit-container-full {
        width: 100%;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.6rem 1.33rem;

        .edit-icon-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
          color: var(--primary-color);
          opacity: 0.8;

          &:hover {
            opacity: 1;
            transform: scale(1.05);
          }
        }

        .edit-input {
          flex: 1;
        }

        ::v-deep(.n-input__textarea-el) {
          background-color: transparent;
          color: var(--text-color);
          border: none;
          resize: none;
          font-size: 1.07rem;
          line-height: 1.6;
        }

        ::v-deep(.n-input) {
          background-color: transparent;
          border: 2px solid var(--primary-color);
          border-radius: 10px;
        }

        ::v-deep(.n-input__border) {
          display: none;
        }

        ::v-deep(.n-input__state-border) {
          display: none;
        }
      }
      .think-wrapper {
        width: 100%;
        max-width: 60rem;
        display: flex;
        flex-direction: column;

        .think-title-bar {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1.33rem;
          cursor: pointer;
          user-select: none;
          border-radius: 10px;
          transition: background-color 0.2s ease;
          width: fit-content;

          &:hover {
            background-color: rgba(140, 141, 155, 0.1);
          }

          :deep(.n-spin-description) {
            margin: 0;
            font-size: 1rem;
            font-weight: 600;
            color: #8c8d9b;
          }

          .think-title-text {
            font-size: 1rem;
            font-weight: 600;
            color: #8c8d9b;
          }

          .toggle-icon {
            color: #8c8d9b;
            transition: transform 0.3s ease;

            &.collapsed {
              transform: rotate(-90deg);
            }
          }
        }

        .think-content {
          overflow: hidden;
          opacity: 1;
          transition: max-height 0.5s cubic-bezier(0.4, 0, 0.2, 1),
            opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1);

          &.collapsed {
            max-height: 0;
            opacity: 0;
          }

          .think-content-inner {
            padding: 0.5rem 1.33rem 0.07rem 1.33rem;
            font-size: 0.87rem;
            color: #8c8d9b;
            border-left: 0.2rem solid var(--primary-color);
            transform: translateY(0);
            transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);

            :deep(p),
            :deep(h1),
            :deep(h2),
            :deep(h3),
            :deep(h4),
            :deep(h5),
            :deep(h6),
            :deep(span),
            :deep(div),
            :deep(ul),
            :deep(ol),
            :deep(li) {
              color: #8c8d9b;
            }

            :deep(a) {
              color: #8c8d9b;
              opacity: 0.8;

              &:hover {
                opacity: 1;
              }
            }
          }

          &.collapsed .think-content-inner {
            transform: translateY(-10px);
          }
        }
      }
      .tool {
        width: 100%;
        display: flex;
        padding-top: 0.6rem;
        gap: 0.25rem;
        transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);

        &.tool-hidden {
          visibility: hidden;
          opacity: 0;
          transform: translateY(-5px);
        }

        &.tool-user {
          justify-content: flex-end;
        }

        :deep(.n-button) {
          border-radius: 8px;
          padding: 0.4rem;
          transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);

          &:hover {
            background-color: rgba(24, 160, 88, 0.1);
            transform: scale(1.1);
          }

          &:active {
            transform: scale(0.95);
          }
        }
      }
    }
  }

  ::v-deep(.n-button--text-type) {
    background-color: transparent !important;
    color: var(--text-color) !important;
    opacity: 0.6;
    transition: all 0.25s ease;

    &:hover {
      opacity: 1;
    }
  }

  ::v-deep(.n-scrollbar-rail) {
    display: none;
  }
  ::v-deep(.n-avatar) {
    background-color: transparent;
    border: 2px solid transparent;
    transition: border-color 0.3s ease;
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

/* 欢迎页面动画 */
@keyframes welcomeFadeIn {
  0% {
    opacity: 0;
    transform: translateY(30px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

.welcome {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: end;
  padding-bottom: 3rem;
  animation: welcomeFadeIn 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;

  .welcome-text {
    font-size: 2.5rem;
    font-weight: 600;
    color: var(--text-color);
    cursor: default;
    letter-spacing: -0.015em; // Apple 风格的紧密字间距
    line-height: 1.2;
    outline: none;
    user-select: none;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);

    // Apple 风格的字体渲染优化
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    font-feature-settings: "kern" 1;

    // 确保文本居中对齐
    text-align: center;
    padding: 0 1rem;
    max-width: 90%;

    // 为不同效果预留空间
    position: relative;
    will-change: opacity, transform;
  }
}

// 优化欢迎动画
@keyframes welcomeFadeIn {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
</style>

<style lang="less">
@import "../styles/messagePopover.less";
@import "@/styles/hljs.less";
</style>
