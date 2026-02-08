<template>
  <div
    class="message-container"
    :class="{ 'has-messages': chatHistory.slice(1).length }"
  >
    <div class="message-list" v-if="chatHistory.slice(1).length">
      <n-virtual-list
        ref="virtualListRef"
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
                    <div v-if="i.generating" class="image-generating">
                      <WaveCanvas />
                      <div class="generating-text">图像生成中</div>
                    </div>
                    <template v-else>
                      <div
                        v-if="!imageLoadStatus.get(i.data.url)"
                        class="chat-image-placeholder"
                      >
                        <n-icon size="36" class="loading-icon">
                          <Loader />
                        </n-icon>
                        <span class="placeholder-text">图片加载中...</span>
                      </div>
                      <img
                        :src="i.data.url"
                        class="message-image"
                        :class="{
                          'image-hidden': !imageLoadStatus.get(i.data.url),
                        }"
                        @load="imageLoadStatus.set(i.data.url, true)"
                        @error="imageLoadStatus.set(i.data.url, true)"
                        @click="openFullscreenImage(i.data.url)"
                      />
                    </template>
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
                    :class="{
                      'text-container-assistant': item.role === 'assistant',
                      'text-container-user': item.role === 'user',
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
                    v-if="item.content.some((c) => c.type === 'content')"
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
                        class="action-button"
                        :class="`action-button-${item.key}`"
                        @click="favoriteMessage(item)"
                        @mouseover="
                          handleMouseOver($event, 'favorite', item.key)
                        "
                        @mouseout="handleMouseOut($event, 'favorite', item.key)"
                      >
                        <n-icon size="18">
                          <Bookmark />
                        </n-icon>
                        <span>收藏</span>
                      </div>
                      <div
                        class="action-button"
                        :class="`action-button-${item.key}`"
                        @click="deleteMessage(item)"
                        @mouseover="handleMouseOver($event, 'delete', item.key)"
                        @mouseout="handleMouseOut($event, 'delete', item.key)"
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
                        class="action-button"
                        :class="`action-button-${item.key}`"
                        @click="favoriteMessage(item)"
                        @mouseover="
                          handleMouseOver($event, 'favorite', item.key)
                        "
                        @mouseout="handleMouseOut($event, 'favorite', item.key)"
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
    <Teleport to="body">
      <Transition name="fullscreen-fade">
        <div
          v-if="isFullscreenImage"
          class="fullscreen-image-overlay"
          @click="closeFullscreenImage"
        >
          <div class="fullscreen-image-container" @click.stop>
            <img
              :src="fullscreenImage"
              class="fullscreen-image"
              :class="{ 'image-hidden': !imageLoadStatus.get(fullscreenImage) }"
              @load="imageLoadStatus.set(fullscreenImage, true)"
              @error="imageLoadStatus.set(fullscreenImage, true)"
            />
            <div class="fullscreen-toolbar">
              <n-button
                type="text"
                size="large"
                circle
                @click="downloadImage(fullscreenImage)"
              >
                <template #icon>
                  <n-icon :size="24" color="#fff"><Download /></n-icon>
                </template>
              </n-button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import {
  nextTick,
  onMounted,
  ref,
  reactive,
  toRefs,
  watch,
  onBeforeUnmount,
  h,
  resolveComponent,
} from "vue";
import WaveCanvas from "@/components/WaveCanvas.vue";
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
  Download,
} from "@vicons/tabler";
import assistantUrl from "@/assets/assistant.svg";
import assistantDarkUrl from "@/assets/assistant_dark.svg";
import Global from "@/utils/global.js";
import TypingEffects from "@/utils/typingEffects.js";
import PerformanceUtils from "@/utils/performance.js";
import hljs, { isLanguageRegistered, loadLanguage } from "@/utils/highlight.js";
import {
  md,
  preloadMarkdownLanguages,
  rehighlightAll,
} from "@/services/markdownService.js";
import { useConfigStore } from "@/stores/configStore.js";
import { getChineseGreeting } from "@/utils/date.js";
import Models from "@/config/models.js";
import TTSService from "@/services/ttsService.js";
import { addFavorites } from "@/services/user.js";
import { chat } from "@/services/chat.js";

const props = defineProps({
  userInput: String,
  netSearch: Boolean,
  deepThinking: Boolean,
  knowledgeBase: Boolean,
  imageGeneration: Boolean,
});
const { netSearch, deepThinking, knowledgeBase, imageGeneration } =
  toRefs(props);

const emit = defineEmits(["regenerateImage", "generateImage"]);

const configStore = useConfigStore();

const virtualListRef = ref(null);
const popoverShowMap = ref({});
const hoveredMessageKey = ref({});
const editingMessageKey = ref(null);
const editContent = ref("");
const editInputRef = ref(null);
const fullscreenImage = ref(null);
const isFullscreenImage = ref(false);
const imageLoadStatus = reactive(new Map());
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
  if (!content) return "";

  // 检查是否是 HTML 格式（更严格的判断，避免误判）
  const isHTML = /<(p|div|pre|code|h[1-6]|ul|ol|li|blockquote)[\s>]/.test(
    content
  );

  if (isHTML) {
    // 创建一个临时DOM元素来解析HTML
    const tempDiv = document.createElement("div");
    // 先移除/替换外部图片，避免不必要的请求
    const sanitizedContent = content.replace(
      /<img[^>]+src=["'](https?:\/\/[^"']+)["'][^>]*>/gi,
      (match, src) => {
        // 只允许同源或特定白域名的图片立即加载
        const allowedDomains = ["localhost"];
        const isAllowed = allowedDomains.some((domain) => src.includes(domain));
        if (isAllowed) {
          return match;
        }
        // 其他图片替换为占位符，避免请求
        return `<img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='150' height='150'%3E%3Crect width='150' height='150' fill='%23f0f0f0'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%23999'%3EImage%3C/text%3E%3C/svg%3E" data-original-src="${src}" />`;
      }
    );
    tempDiv.innerHTML = sanitizedContent;

    // 查找所有的pre和code标签
    const codeBlocks = tempDiv.querySelectorAll("pre code");

    codeBlocks.forEach((block) => {
      const codeText = block.textContent;
      // 尝试检测语言
      const classes = block.className.split(" ");
      const langClass = classes.find((c) => c.startsWith("language-"));
      const lang = langClass ? langClass.replace("language-", "") : "";
      const langLower = lang ? lang.toLowerCase() : "";

      // 清除已有的高亮标记，重新处理
      block.classList.remove("hljs");
      block.removeAttribute("data-highlighted");

      // 使用highlight.js高亮代码
      if (langLower && isLanguageRegistered(langLower)) {
        // 语言已注册，直接高亮
        try {
          const highlighted = hljs.highlight(codeText, {
            language: langLower,
            ignoreIllegals: true,
          }).value;
          block.innerHTML = highlighted;
          block.classList.add("hljs");
          if (!block.classList.contains(`language-${langLower}`)) {
            block.classList.add(`language-${langLower}`);
          }
        } catch (error) {
          // 如果高亮失败，保持原始文本并添加hljs类以应用基本样式
          console.warn(`[processContent] 代码高亮失败: ${langLower}`, error);
          block.textContent = codeText;
          block.classList.add("hljs");
        }
      } else if (langLower) {
        // 语言未注册，保持原始文本并添加基本样式
        block.textContent = codeText;
        block.classList.add("hljs");
      } else {
        // 尝试自动检测语言
        try {
          const result = hljs.highlightAuto(codeText);
          block.innerHTML = result.value;
          block.classList.add("hljs");
          if (result.language) {
            block.classList.add(`language-${result.language}`);
          }
        } catch (error) {
          block.textContent = codeText;
          block.classList.add("hljs");
        }
      }
    });

    // 处理单独的code标签（不在pre内的）
    const inlineCodes = tempDiv.querySelectorAll("code:not(pre code)");
    inlineCodes.forEach((code) => {
      if (!code.classList.contains("hljs")) {
        code.classList.add("hljs");
      }
    });

    return tempDiv.innerHTML;
  }

  // 如果不是HTML格式，使用MarkdownIt渲染
  const html = md.render(content);

  // 异步加载语言并在加载完成后重新高亮
  preloadMarkdownLanguages(content).then((hasNewLanguages) => {
    if (hasNewLanguages) {
      rehighlightAll();
    }
  });

  return html;
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
    images.forEach((imageData) => {
      // 支持新旧格式：如果 imageData 是字符串则是旧格式，否则是新格式对象
      const originalUrl =
        typeof imageData === "string" ? imageData : imageData.original;

      messageContent.push({
        type: "image",
        data: {
          url: originalUrl,
        },
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
        () => {
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
        () => {
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
  PerformanceUtils.debounceScroll(() => {
    virtualListRef.value.scrollTo({
      index: chatHistory.value.length - 2,
    });
  }, 100)();
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

  const isImageMessage = item.content.some((c) => c.type === "image");

  if (isImageMessage) {
    const imageContent = item.content.find((c) => c.type === "image");
    const ratio = imageContent?.ratio || "";

    let lastImagePrompt = "";
    for (let i = index - 1; i >= 0; i--) {
      if (chatHistory.value[i].role === "user") {
        const textContent = chatHistory.value[i].content.find(
          (c) => c.type === "content"
        );
        lastImagePrompt = textContent ? textContent.data : "";
        break;
      }
    }

    chatHistory.value = chatHistory.value.slice(0, Math.max(1, index));
    if (lastImagePrompt) {
      emit("regenerateImage", { prompt: lastImagePrompt, ratio });
    }
    return;
  }

  let lastMessage = null;
  let lastMessageIndex = null;
  let lastImages = [];
  let lastFiles = [];
  for (let i = index - 1; i >= 0; i--) {
    if (chatHistory.value[i].role === "user") {
      lastMessage = chatHistory.value[i];
      lastMessageIndex = i;

      lastImages = lastMessage.content
        .filter((c) => c.type === "image")
        .map((c) => c.data?.url);

      lastFiles = lastMessage.content
        .filter((c) => c.type === "file" && c.fileObject)
        .map((c) => c.fileObject);

      break;
    }
  }

  chatHistory.value = chatHistory.value.slice(
    0,
    Math.max(1, lastMessageIndex !== null ? lastMessageIndex : 1)
  );

  if (lastMessage && lastMessageIndex !== null) {
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

// const regenerateImageMessage = (ratio) => {
//   let lastImagePrompt = "";

//   for (let i = chatHistory.value.length - 1; i >= 0; i--) {
//     if (chatHistory.value[i].role === "user") {
//       const textContent = chatHistory.value[i].content.find(
//         (c) => c.type === "content"
//       );
//       lastImagePrompt = textContent ? textContent.data : "";
//       break;
//     }
//   }

//   if (lastImagePrompt) {
//     emit("regenerateImage", { prompt: lastImagePrompt, ratio });
//   }
// };

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

const getLastImageRatio = () => {
  for (let i = chatHistory.value.length - 1; i >= 0; i--) {
    const msg = chatHistory.value[i];
    if (msg.role === "assistant") {
      const imageContent = msg.content.find((c) => c.type === "image");
      if (imageContent && imageContent.ratio) {
        return imageContent.ratio;
      }
    }
  }
  return "";
};

const saveEdit = (item) => {
  if (!editContent.value.trim()) {
    message.warning("请先输入内容 📝");
    return;
  }

  const index = chatHistory.value.findIndex((msg) => msg.key === item.key);
  if (index === -1) return;
  const lastRatio = getLastImageRatio();
  chatHistory.value = chatHistory.value.slice(0, index);

  const existingImages = item.content
    .filter((c) => c.type === "image")
    .map((c) => c.data?.url);

  const existingFiles = item.content
    .filter((c) => c.type === "file" && c.fileObject)
    .map((c) => c.fileObject);

  const editedText = editContent.value;

  if (imageGeneration.value) {
    sendMessage(editedText);
    emit("generateImage", { prompt: editedText, ratio: lastRatio });
  } else {
    sendMessage(editedText, existingImages, existingFiles);
    fetchAI(
      new AbortController().signal,
      existingImages,
      existingFiles,
      editedText,
      true
    );
  }

  editingMessageKey.value = null;
  editContent.value = "";
};

const handleMouseEnter = (key) => {
  hoveredMessageKey.value[key] = true;
};

const handleMouseLeave = (key) => {
  hoveredMessageKey.value[key] = false;
};

const onChatImageLoad = (imageUrl) => {
  imageLoadStatus.set(imageUrl, true);
};

const openFullscreenImage = (imageUrl) => {
  fullscreenImage.value = imageUrl;
  isFullscreenImage.value = true;

  // 如果该图片还未加载过，初始化加载状态为 false
  if (!imageLoadStatus.has(imageUrl)) {
    imageLoadStatus.set(imageUrl, false);
  }

  // 预加载原图
  if (imageUrl) {
    const img = new Image();
    img.onload = () => {
      imageLoadStatus.set(imageUrl, true);
    };
    img.onerror = () => {
      imageLoadStatus.set(imageUrl, true);
    };
    img.src = imageUrl;
  }
};

const closeFullscreenImage = () => {
  isFullscreenImage.value = false;
  fullscreenImage.value = null;
};

const downloadImage = async (imageUrl) => {
  try {
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    const timestamp = new Date().getTime();
    link.download = `image_${timestamp}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    message.success("图片保存成功");
  } catch (error) {
    message.error("图片保存失败：" + (error.message || "未知错误"));
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
  const NIconComponent = resolveComponent("NIcon");
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
        [h(NIconComponent, { size: 28, component: AlertTriangle }, null)]
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

// 添加图片消息
const addImageMessage = (ratio = "") => {
  const generatingKey = Global.getRandomKey();
  chatHistory.value.push({
    role: "assistant",
    content: [
      {
        type: "image",
        data: null,
        generating: true,
        ratio: ratio,
      },
    ],
    key: generatingKey,
    time: new Date().toLocaleTimeString(),
  });
  return generatingKey;
};

// 更新图片消息
const updateImageMessage = (generatingKey, imageUrl, ratio = "") => {
  const index = chatHistory.value.findIndex((msg) => msg.key === generatingKey);
  if (index !== -1) {
    chatHistory.value[index].content = [
      {
        type: "image",
        data: { url: imageUrl },
        generating: false,
        ratio: ratio,
      },
    ];
  }
};

defineExpose({
  sendMessage,
  fetchAI,
  addImageMessage,
  updateImageMessage,
  chatHistory,
});

// 存储当前的打字效果实例
let typingInstance = null;
// 标记打字效果是否已经初始化，防止初始加载时重复触发
let hasTypingInitialized = false;
// 标记是否正在等待用户信息加载
let isWaitingForUserInfo = false;
// 标记是否正在进行打字动画，防止 MutationObserver 误触发
let isTypingInProgress = false;
// 保存超时 ID，用于取消超时
let userInfoTimeout = null;
// MutationObserver 用于监听欢迎语元素变化
let welcomeObserver = null;

// 优化鼠标事件处理，使用 CSS 类代替直接操作 style
const handleMouseOver = (event, action, key) => {
  const target = event.currentTarget;
  target.classList.add(`action-${action}-hover-${key}`);
};

const handleMouseOut = (event, action, key) => {
  const target = event.currentTarget;
  target.classList.remove(`action-${action}-hover-${key}`);
};

const initTyped = () => {
  // 如果正在等待用户信息，取消等待
  isWaitingForUserInfo = false;

  // 清除超时，避免重复初始化
  if (userInfoTimeout) {
    clearTimeout(userInfoTimeout);
    userInfoTimeout = null;
  }

  // 只有在没有聊天消息时才初始化欢迎语
  if (chatHistory.value.length > 1) {
    return;
  }

  // 如果正在打字动画中，先销毁旧实例
  if (typingInstance) {
    typingInstance.destroy();
    typingInstance = null;
  }

  // 标记正在打字动画中
  isTypingInProgress = true;

  // 销毁旧观察者
  if (welcomeObserver) {
    welcomeObserver.disconnect();
    welcomeObserver = null;
  }

  const element = document.getElementById("typed");
  if (!element) {
    isTypingInProgress = false;
    return;
  }

  const time = getChineseGreeting(new Date());

  // 分离用户名文本和 emoji，以便应用不同样式
  let username, emoji;
  if (configStore.name) {
    username = configStore.name;
    emoji = "🥰🥰";
  } else {
    username = "Master";
    emoji = "👋👋";
  }

  // 先渲染不含 emoji 的文本，避免 emoji 参与打字动画造成延迟
  const textWithoutEmoji = `${time}好, <span class="username-highlight"><span class="username-text">${username}</span><span class="username-emoji" style="opacity:0">${emoji}</span></span>`;

  let emojiShown = false;
  typingInstance = TypingEffects.random(element, textWithoutEmoji, {
    duration: 2000,
    onProgress: (progress) => {
      if (!emojiShown && progress >= 0.3) {
        emojiShown = true;
        const emojiEl = element.querySelector(".username-emoji");
        if (emojiEl) {
          emojiEl.style.opacity = "1";
          emojiEl.classList.add("emoji-visible");
        }
      }
    },
    onComplete: () => {
      // 确保 emoji 显示
      if (!emojiShown) {
        const emojiEl = element.querySelector(".username-emoji");
        if (emojiEl) {
          emojiEl.style.opacity = "1";
          emojiEl.classList.add("emoji-visible");
        }
      }

      // 验证并修复用户名高亮结构
      ensureUsernameHighlight(element, username, emoji);

      // 延迟标记动画完成，等待 HTML 完全恢复和 MutationObserver 触发完成
      setTimeout(() => {
        isTypingInProgress = false;
      }, 150);
    },
  });

  hasTypingInitialized = true;

  // 使用 MutationObserver 监听欢迎语元素变化
  setupWelcomeObserver(element, username, emoji);
};

/**
 * 确保用户名高亮结构完整
 * 如果结构被破坏，重新构建正确的HTML结构
 */
const ensureUsernameHighlight = (element, username, emoji) => {
  if (!element || chatHistory.value.length > 1) return;

  const time = getChineseGreeting(new Date());
  const expectedPrefix = `${time}好, `;

  // 检查当前HTML结构是否正确
  const highlightEl = element.querySelector(".username-highlight");
  const textEl = element.querySelector(".username-text");
  const emojiEl = element.querySelector(".username-emoji");

  // 如果所有元素都存在且内容正确，不需要修复
  if (
    highlightEl &&
    textEl &&
    emojiEl &&
    textEl.textContent === username &&
    emojiEl.textContent === emoji
  ) {
    return;
  }

  // 如果结构被破坏，重新构建
  if (!highlightEl || !textEl || textEl.textContent !== username) {
    // 重新设置正确的HTML结构
    element.innerHTML = `${expectedPrefix}<span class="username-highlight"><span class="username-text">${username}</span><span class="username-emoji emoji-visible">${emoji}</span></span>`;
  }
};

const setupWelcomeObserver = (element, expectedUsername, expectedEmoji) => {
  if (welcomeObserver) {
    welcomeObserver.disconnect();
  }

  // 监听子节点的变化
  welcomeObserver = new MutationObserver(() => {
    if (chatHistory.value.length > 1) {
      if (welcomeObserver) {
        welcomeObserver.disconnect();
        welcomeObserver = null;
      }
      return;
    }

    // 如果正在打字动画中，跳过检查，避免误触发
    if (isTypingInProgress) {
      return;
    }

    // 检查是否需要修复结构
    const highlightEl = element.querySelector(".username-highlight");
    const textEl = element.querySelector(".username-text");

    // 检查用户名是否正确或结构是否完整
    const needsRepair =
      !highlightEl || !textEl || textEl.textContent !== expectedUsername;

    if (needsRepair) {
      // 结构被破坏，修复它
      ensureUsernameHighlight(element, expectedUsername, expectedEmoji);
    }
  });

  // 开始观察
  welcomeObserver.observe(element, {
    childList: true,
    subtree: true,
    characterData: true,
  });
};

// 监听 name 变化 - 处理首次登录和昵称修改
watch(
  () => configStore.name,
  (newName, oldName) => {
    if (chatHistory.value.length > 1) {
      return;
    }

    // 名称变化时重新初始化欢迎语
    if (newName !== oldName) {
      hasTypingInitialized = false;
      nextTick(() => {
        initTyped();
      });
    }
  }
);

// 监听 chatHistory 变化 - 确保欢迎语始终显示正确的用户名称
watch(
  () => chatHistory.value.length,
  (newLength, oldLength) => {
    // 如果从有消息变为无消息（清空聊天），重新初始化欢迎语
    if (oldLength > 1 && newLength <= 1) {
      hasTypingInitialized = false;
      nextTick(() => {
        initTyped();
      });
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

const handleLoadChatHistory = async (event) => {
  const conversationData = event.detail.data;
  if (conversationData) {
    if (welcomeObserver) {
      welcomeObserver.disconnect();
      welcomeObserver = null;
    }

    // 预加载所有历史消息中的代码语言
    const allLanguages = new Set();
    conversationData.forEach((msg) => {
      if (msg.content && Array.isArray(msg.content)) {
        msg.content.forEach((item) => {
          if (item.type === "content" || item.type === "thinking") {
            const content = item.data || "";
            // 从 Markdown 中提取语言标记
            const codeBlockRegex = /```(\w+)/g;
            let match;
            while ((match = codeBlockRegex.exec(content)) !== null) {
              allLanguages.add(match[1].toLowerCase());
            }
            // 从 HTML 中提取语言标记
            const htmlLangRegex = /language-(\w+)/g;
            while ((match = htmlLangRegex.exec(content)) !== null) {
              allLanguages.add(match[1].toLowerCase());
            }
          }
        });
      }
    });

    // 过滤掉已注册的语言并加载
    const languagesToLoad = Array.from(allLanguages).filter(
      (lang) => !isLanguageRegistered(lang)
    );

    if (languagesToLoad.length > 0) {
      console.log("[messageList] 预加载历史对话语言:", languagesToLoad);
      await Promise.all(languagesToLoad.map((lang) => loadLanguage(lang)));
    }

    // 预处理历史消息内容，确保都是正确渲染的 HTML 格式
    conversationData.forEach((msg) => {
      if (msg.content && Array.isArray(msg.content)) {
        msg.content.forEach((item) => {
          if (item.type === "content" || item.type === "thinking") {
            const content = item.data || "";
            // 检查是否是 HTML 格式（更严格的判断）
            const isHTML =
              /<(p|div|pre|code|h[1-6]|ul|ol|li|blockquote)[\s>]/.test(content);

            if (!isHTML && content.trim()) {
              // 如果不是 HTML 格式，先转换为 HTML
              console.log("[messageList] 转换 Markdown 为 HTML");
              item.data = md.render(content);
            }
          }
        });
      }
    });

    // 设置数据
    chatHistory.value = conversationData;

    // 等待 DOM 更新后重新高亮所有代码块
    await nextTick();
    setTimeout(() => {
      // 重新高亮所有代码块
      const codeBlocks = document.querySelectorAll("pre code");
      codeBlocks.forEach((block) => {
        const classes = block.className.split(" ");
        const langClass = classes.find((c) => c.startsWith("language-"));
        const lang = langClass ? langClass.replace("language-", "") : "";
        const langLower = lang ? lang.toLowerCase() : "";

        // 清除旧的高亮
        block.classList.remove("hljs");
        block.removeAttribute("data-highlighted");

        if (langLower && isLanguageRegistered(langLower)) {
          try {
            const codeText = block.textContent;
            const highlighted = hljs.highlight(codeText, {
              language: langLower,
              ignoreIllegals: true,
            }).value;
            block.innerHTML = highlighted;
            block.classList.add("hljs");
            console.log(`[messageList] 高亮代码块: ${langLower}`);
          } catch (error) {
            console.error(`[messageList] 高亮失败: ${langLower}`, error);
            block.classList.add("hljs");
          }
        } else if (langLower) {
          block.classList.add("hljs");
        } else {
          try {
            const codeText = block.textContent;
            const result = hljs.highlightAuto(codeText);
            block.innerHTML = result.value;
            block.classList.add("hljs");
            if (result.language) {
              block.classList.add(`language-${result.language}`);
            }
          } catch (error) {
            block.classList.add("hljs");
          }
        }
      });

      // 滚动到底部
      if (virtualListRef.value) {
        virtualListRef.value.scrollTo({
          position: "bottom",
        });
      }
    }, 150);
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
  // 重置初始化状态，确保从其他页面返回时能重新初始化
  hasTypingInitialized = false;

  // 等待 DOM 更新后再初始化欢迎语
  nextTick(() => {
    // 检查用户信息是否已加载
    if (configStore.name || configStore.userId) {
      // 用户已登录且信息已加载，直接初始化
      initTyped();
    } else {
      // 用户信息未加载，可能是：
      // 1. 路由守卫正在执行（已登录但信息还在加载中）
      // 2. 用户未登录
      isWaitingForUserInfo = true;
      userInfoTimeout = setTimeout(() => {
        if (isWaitingForUserInfo && !hasTypingInitialized) {
          // 超时后仍未加载用户信息，执行初始化（显示默认 Master）
          initTyped();
        }
        userInfoTimeout = null;
      }, 500);
    }
  });

  if (virtualListRef.value && chatHistory.value.length > 2) {
    scrollToBottom();
  }

  window.addEventListener("clearChatHistory", handleClearChatHistory);
  window.addEventListener("loadChatHistory", handleLoadChatHistory);
});

onBeforeUnmount(() => {
  // 停止音频播放，防止阻止 bfcache
  TTSService.stopCurrentAudio();

  // 清理打字效果实例
  if (typingInstance) {
    typingInstance.destroy();
    typingInstance = null;
  }

  // 清理欢迎语观察者
  if (welcomeObserver) {
    welcomeObserver.disconnect();
    welcomeObserver = null;
  }

  // 清理超时
  if (userInfoTimeout) {
    clearTimeout(userInfoTimeout);
    userInfoTimeout = null;
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

/* 入场动画 - 淡入效果 */
@keyframes contentFadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 图片生成文字动画 - 适配WaveCanvas */
@keyframes textGradient {
  0% {
    background-position: 200% center;
  }
  100% {
    background-position: -200% center;
  }
}

/* 性能优化：减少自动重排 */
.action-button {
  padding: 8px 12px;
  border-radius: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: background-color 0.2s ease;
  will-change: background-color;
}

/* 使用 CSS 类代替直接操作 style */
.action-button:hover,
.action-favorite-hover-[key],
.action-regenerate-hover-[key],
.action-voice-hover-[key] {
  background-color: rgba(0, 0, 0, 0.1);
}

.message-container {
  width: 70vw;
  height: 35vh;
  background: var(--background-color) no-repeat center;
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  flex-shrink: 0;
  will-change: opacity, transform;

  &.has-messages {
    flex: 1;
    height: 100%;
    min-height: 0;
  }

  .message-list {
    width: 100%;
    height: 100%;
    flex: 1;
    overflow: hidden;
    display: flex;
    flex-direction: column;

    :deep(.n-virtual-list) {
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
    }

    :deep(.n-scrollbar) {
      width: 100%;
      height: 100%;
    }

    :deep(.n-scrollbar-container) {
      width: 100%;
      height: 100%;
    }

    :deep(.n-scrollbar-content) {
      width: 100%;
    }

    .item {
      display: flex;
      align-items: flex-start;
      margin: 1.8rem 0;
      padding: 0.5rem 0;
      color: var(--text-color);
      animation: messageSlideIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
      transition: all 0.3s ease;

      @media (min-width: 1920px) {
        padding: 0.5rem 6rem;
      }

      @media (min-width: 1440px) and (max-width: 1919px) {
        padding: 0.5rem 4rem;
      }

      @media (max-width: 1024px) {
        padding: 0.5rem 1rem;
      }

      @media (max-width: 768px) {
        padding: 0.5rem 0.5rem;
        margin: 1.2rem 0;
      }
    }
    .avatar {
      width: 2rem;
      height: 2rem;
      margin: 0 0.67rem;
      transition: transform 0.2s ease;

      &:hover {
        transform: scale(1.05);
      }
    }
    .message {
      flex-direction: column;
      max-width: calc(100% - 4rem);
      flex: 1;
      min-width: 0;

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
        display: flex;
        background: var(--message-color) no-repeat center;
        border-radius: 12px;
        position: relative;
        overflow: hidden;
        transition: all 0.2s ease;

        // 助手消息 - 透明背景，清晰阅读
        &.text-container-assistant {
          background-color: transparent;
          border: none;
          box-shadow: none;
          max-width: min(75vw, 1200px);

          .text {
            padding: 0.5rem 0;
            font-size: 1rem;
            line-height: 1.75;
            color: var(--text-color);
          }

          // 超宽屏优化
          @media (min-width: 1920px) {
            max-width: min(70vw, 1400px);
          }

          // 中等屏幕
          @media (max-width: 1440px) {
            max-width: min(75vw, 1000px);
          }

          // 小屏幕
          @media (max-width: 1024px) {
            max-width: 85vw;
          }

          // 移动端
          @media (max-width: 768px) {
            max-width: 90vw;
          }
        }

        // 用户消息 - 保持相对较窄
        &.text-container-user {
          max-width: min(560px, 90vw);

          @media (max-width: 768px) {
            max-width: 85vw;
          }
        }

        .text {
          width: 100%;
          padding: 0.75rem 1.25rem;
          font-size: 1rem;
          line-height: 1.7;
          caret-color: transparent;

          // 字体渲染优化
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          text-rendering: optimizeLegibility;

          // 优化段落间距
          :deep(p) {
            margin: 0.6em 0;

            &:first-child {
              margin-top: 0;
            }

            &:last-child {
              margin-bottom: 0;
            }
          }

          // 优化列表显示
          :deep(ul),
          :deep(ol) {
            padding-left: 1.5em;
            margin: 0.6em 0;
          }

          // 确保代码块清晰
          :deep(code) {
            font-family: "JetBrains Mono", "Fira Code", "Consolas", monospace;
          }
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
          transition: opacity 0.3s ease;

          &.image-hidden {
            opacity: 0;
            position: absolute;
          }
        }

        .chat-image-placeholder {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 8px;
          width: 260px;
          height: 200px;
          background: linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%);
          border-radius: 10px;
          border: 1px solid #d0d0d0;

          .loading-icon {
            animation: spin 3s linear infinite;
            color: #999;
          }

          .placeholder-text {
            color: #999;
            font-size: 14px;
            user-select: none;
          }
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        .image-generating {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 0 1.5rem;
          border-radius: 12px;
          min-width: 140px;
          min-height: 100px;

          .generating-text {
            font-size: 0.8rem;
            font-weight: 400;
            color: rgba(76, 175, 80, 0.8);
            text-transform: uppercase;
            animation: textGradient 2s linear infinite;
            text-shadow: 0 0 10px rgba(var(--primary-color-rgb), 0.8),
              0 0 20px rgba(var(--primary-color-rgb), 0.4),
              0 0 30px rgba(var(--primary-color-rgb), 0.2);
          }
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
        max-width: min(75vw, 1200px);
        display: flex;
        flex-direction: column;

        // 超宽屏优化
        @media (min-width: 1920px) {
          max-width: min(70vw, 1400px);
        }

        // 中等屏幕
        @media (max-width: 1440px) {
          max-width: min(75vw, 1000px);
        }

        // 小屏幕
        @media (max-width: 1024px) {
          max-width: 85vw;
        }

        // 移动端
        @media (max-width: 768px) {
          max-width: 90vw;
        }

        .think-title-bar {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
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
            font-weight: 500;
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
            padding: 0.5rem 1rem;
            font-size: 0.9rem;
            line-height: 1.7;
            border-left: 2px solid var(--primary-color);
            transform: translateY(0);
            transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);

            // 字体渲染优化
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
            text-rendering: optimizeLegibility;

            // 亮色模式：灰色文字
            .light-mode & {
              color: #666;

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
                color: #666;
                line-height: 1.7;
              }

              :deep(a) {
                color: #444;
                text-decoration: underline;
              }
            }

            // 暗色模式：灰色文字
            :root:not(.light-mode) & {
              color: #999;

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
                color: #999;
                line-height: 1.7;
              }

              :deep(a) {
                color: #bbb;
                text-decoration: underline;
              }
            }

            // 优化段落间距
            :deep(p) {
              margin: 0.5em 0;
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

/* 欢迎页面动画 - Apple 风格 */
@keyframes welcomeFadeIn {
  from {
    opacity: 0;
    transform: translateY(30px) scale(0.96);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.welcome {
  width: 100%;
  height: 100%;
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: flex-end;
  animation: welcomeFadeIn 1s cubic-bezier(0.16, 1, 0.3, 1) forwards;

  .welcome-text {
    font-size: 2.5rem;
    font-weight: 700;
    color: var(--text-color);
    cursor: default;
    letter-spacing: -0.03em;
    line-height: 1.1;
    outline: none;
    user-select: none;
    text-align: center;
    padding: 0 2rem;
    max-width: 90%;
    position: relative;
    will-change: opacity, transform;

    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    font-feature-settings: "kern" 1;
    text-rendering: optimizeLegibility;

    // 微妙的文字阴影
    text-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);

    // 用户名高亮样式
    :deep(.username-highlight) {
      font-weight: 700;
      position: relative;
      display: inline-block;
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);

      // 添加微妙的发光效果
      text-shadow: 0 0 20px rgba(167, 243, 208, 0.15);

      // 文本部分 - 确保所有子元素都继承渐变样式
      .username-text {
        background: linear-gradient(
          90deg,
          #88f8b1 0%,
          #79ebb5 50%,
          #ade9c2 80%,
          #86efac 100%
        );
        background-size: 300% 100%;
        -webkit-background-clip: text;
        background-clip: text;
        -webkit-text-fill-color: transparent;
        animation: slowFloat 8s ease-in-out infinite;
        display: inline-block;

        // 确保 span 子元素也应用相同样式
        span {
          background: inherit;
          background-size: inherit;
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
        }
      }

      // emoji 部分
      .username-emoji {
        display: inline-block;
        margin-left: 4px;
        font-size: 1.05em;
        cursor: pointer;
        transition: opacity 0.3s ease,
          transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        will-change: transform, opacity;

        // 打字动画完成后的显示动画
        &.emoji-visible {
          animation: emojiPopIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }

        // 鼠标悬浮动画效果
        &:hover {
          animation: emojiHover 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) infinite;
        }
      }

      // emoji 弹出动画
      @keyframes emojiPopIn {
        0% {
          opacity: 0;
          transform: scale(0.5) translateY(10px);
        }
        70% {
          transform: scale(1.1) translateY(-2px);
        }
        100% {
          opacity: 1;
          transform: scale(1) translateY(0);
        }
      }

      // emoji 悬浮动画 - 摇摆效果
      @keyframes emojiHover {
        0%,
        100% {
          transform: rotate(0deg);
        }
        25% {
          transform: rotate(-3deg);
        }
        75% {
          transform: rotate(3deg);
        }
      }

      // 动画定义
      @keyframes slowFloat {
        0%,
        100% {
          background-position: 0% 50%;
          transform: translateY(0px);
          filter: brightness(1);
        }
        25% {
          background-position: 100% 50%;
          transform: translateY(-0.3px);
          filter: brightness(1.02);
        }
        50% {
          background-position: 200% 50%;
          transform: translateY(0.3px);
          filter: brightness(0.98);
        }
        75% {
          background-position: 100% 50%;
          transform: translateY(-0.2px);
          filter: brightness(1.01);
        }
      }
    }
  }
}

.fullscreen-image-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  cursor: pointer;
}

.fullscreen-image-container {
  max-width: 90vw;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  cursor: default;

  .fullscreen-image {
    max-width: 100%;
    max-height: 75vh;
    object-fit: contain;
    border-radius: 8px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  }

  .fullscreen-toolbar {
    display: flex;
    gap: 1rem;
    padding: 0.75rem 1.5rem;
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    border-radius: 30px;
    border: 1px solid rgba(255, 255, 255, 0.15);
  }
}
</style>

<style lang="less">
@import "../styles/messagePopover.less";
@import "@/styles/hljs.less";
</style>
