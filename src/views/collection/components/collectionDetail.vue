<template>
  <div class="collection-detail-container">
    <n-popover placement="bottom" trigger="hover" raw :show-arrow="false">
      <template #trigger>
        <n-button
          text
          size="large"
          class="share-icon"
          v-show="!isEdit && !error"
          @click="startEdit"
        >
          <template #icon>
            <n-icon :component="ArrowUpRight" size="1.5rem" />
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
        分享
      </div>
    </n-popover>
    <n-icon
      class="close-icon"
      :component="X"
      v-show="!isEdit && !error"
      @click="goBack"
      size="1.5rem"
    />
    <div
      class="collection-detail-header"
      :style="{
        marginTop: isEdit ? '100px' : '',
      }"
      v-if="!loading && !error && !isEdit"
    >
      <h2>{{ collectionDetail.title || "收藏详情" }}</h2>
      <div class="collection-detail-date">
        {{ formatDate(collectionDetail.createdAt) || "" }} • 内容由 AI
        生成，不能完全保障真实
      </div>
    </div>

    <div class="edit-header" v-if="!loading && !error && isEdit">
      <div class="edit-header-content">
        <div class="edit-header-title">
          <h2>分享对话</h2>
          <div class="edit-header-description">
            内容由 AI生成，不能完全保障真实
          </div>
        </div>
        <div class="edit-header-cancel" @click="cancelEdit">取消</div>
      </div>
    </div>

    <div
      class="collection-detail-content"
      :style="{
        marginTop: isEdit ? '40px' : '',
      }"
      v-if="!loading && !error"
    >
      <n-virtual-list :items="chatHistory" :item-size="30" item-resizable>
        <template #default="{ item }">
          <div
            :key="item.key"
            class="item"
            :style="{
              flexDirection: item.role === 'assistant' ? 'row' : 'row-reverse',
            }"
          >
            <div class="message">
              <div class="content">
                <div v-for="(i, index) in item.content" :key="index">
                  <div class="image-container" v-if="i.type === 'image'">
                    <img :src="i.data.url" />
                  </div>
                  <div class="file-message-container" v-if="i.type === 'file'">
                    <div class="file-message-item">
                      <img
                        :src="getFileIcon(i.data.fileName)"
                        class="file-message-icon"
                      />
                      <div class="file-message-info">
                        <div class="file-message-name">
                          {{ i.data.fileName }}
                        </div>
                        <div class="file-message-size">
                          {{ formatFileSize(i.data.size) }}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="text-container" v-if="i.type === 'content'">
                    <div
                      class="text"
                      :style="{
                        maxWidth: item.role === 'assistant' ? '700px' : '560px',
                      }"
                    >
                      <div v-html="processContent(i.data)"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template>
      </n-virtual-list>
    </div>

    <div class="edit-footer" v-if="!loading && !error && isEdit">
      <div class="edit-footer-content">
        <n-button
          type="primary"
          style="border-radius: 8px; padding: 1.3rem 1.3rem"
          size="large"
          @click="sharePicture"
          >分享图片</n-button
        >
        <n-button
          size="large"
          style="border-radius: 8px; padding: 1.3rem 1.3rem"
          @click="copyUrl"
          >复制链接</n-button
        >
      </div>
    </div>

    <div class="loading-container" v-if="loading">
      <n-spin size="large" />
    </div>

    <div class="error-container" v-if="error">
      <div class="error-icon">
        <n-icon size="48">
          <AlertCircle />
        </n-icon>
      </div>
      <div class="error-text">加载失败</div>
      <div class="error-description">{{ error }}</div>
    </div>

    <n-modal
      v-model:show="showImageModal"
      preset="card"
      style="
        width: 45vw;
        height: 80vh;
        border-radius: 12px;
        display: flex;
        flex-direction: column;
      "
      :mask-closable="true"
    >
      <template #header>
        <div class="modal-header">分享图片预览</div>
      </template>
      <div class="image-preview-container" v-if="capturedImage">
        <img :src="capturedImage" alt="预览图片" class="preview-image" />
      </div>
      <div
        class="loading-container"
        style="
          height: 65vh;
          display: flex;
          justify-content: center;
          align-items: center;
        "
        v-else
      >
        <n-spin size="large" />
      </div>
      <template #footer>
        <div class="modal-footer">
          <n-button
            @click="copyImage"
            type="primary"
            size="large"
            style="border-radius: 8px; padding: 1.3rem 1.3rem"
            :disabled="!capturedImage"
          >
            <template #icon>
              <n-icon :component="Copy" />
            </template>
            复制图片
          </n-button>
          <n-button
            @click="downloadImage"
            size="large"
            style="border-radius: 8px; padding: 1.3rem 1.3rem"
            :disabled="!capturedImage"
          >
            <template #icon>
              <n-icon :component="Download" />
            </template>
            下载图片
          </n-button>
        </div>
      </template>
    </n-modal>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { X, AlertCircle, ArrowUpRight, Copy, Download } from "@vicons/tabler";
import { getFavoriteDetail } from "@/services/user.js";
import { useConfigStore } from "@/stores/configStore.js";
import { md } from "@/services/markdownService.js";
import { formatDate } from "@/utils/date.js";
import { domToPng } from "modern-screenshot";
import hljs from "highlight.js/lib/core";
import "highlight.js/styles/github.css";

const router = useRouter();
const route = useRoute();
const message = useMessage();
const configStore = useConfigStore();
const collectionDetail = ref({});
const chatHistory = ref([]);
const loading = ref(true);
const error = ref("");
const isEdit = ref(false);
const showImageModal = ref(false);
const capturedImage = ref("");
const isCapturing = ref(false);

// 处理内容，将Markdown转换为HTML并确保代码块高亮
const processContent = (content) => {
  // 如果内容看起来像是纯文本，先渲染为Markdown
  // 检查是否包含常见的Markdown语法
  const hasMarkdownSyntax =
    /^(#{1,6}\s|[-*+]\s|\d+\.\s|>|\|.*\||```)/m.test(content) ||
    /\*\*.*?\*\*/.test(content) ||
    /__.*?__/.test(content) ||
    /\*.*?\*/.test(content) ||
    /_.*?_/.test(content) ||
    /\[.*?\]\(.*?\)/.test(content);

  if (hasMarkdownSyntax) {
    // 渲染Markdown
    const html = md.render(content);

    // 如果渲染后的HTML包含代码块，需要进行高亮处理
    if (html.includes("<pre") || html.includes("<code")) {
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = html;

      // 查找所有的pre和code标签
      const codeBlocks = tempDiv.querySelectorAll("pre code");
      codeBlocks.forEach((block) => {
        const codeText = block.textContent;
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
            block.classList.add("hljs");
          }
        } else {
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

      const inlineCodes = tempDiv.querySelectorAll("code:not(pre code)");
      inlineCodes.forEach((code) => {
        code.classList.add("hljs");
      });

      return tempDiv.innerHTML;
    }

    return html;
  }

  // 如果内容已经包含HTML标签，直接处理高亮
  if (/<[^>]+>/.test(content)) {
    // 创建一个临时DOM元素来解析HTML
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = content;

    // 查找所有的pre和code标签
    const codeBlocks = tempDiv.querySelectorAll("pre code");
    codeBlocks.forEach((block) => {
      const codeText = block.textContent;
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
          block.classList.add("hljs");
        }
      } else {
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

    const inlineCodes = tempDiv.querySelectorAll("code:not(pre code)");
    inlineCodes.forEach((code) => {
      code.classList.add("hljs");
    });

    return tempDiv.innerHTML;
  }

  // 默认情况下，渲染为Markdown
  return md.render(content);
};

const loadCollectionDetail = async () => {
  loading.value = true;
  error.value = "";

  try {
    const res = await getFavoriteDetail({
      userId: configStore.userId,
      contentId: route.params.id,
    });

    if (res.code === 200 && res.data) {
      collectionDetail.value = res.data.favorite;
      try {
        const conversationData = res.data.favorite.conversation;
        chatHistory.value = Array.isArray(conversationData)
          ? conversationData
          : [];
      } catch (parseError) {
        chatHistory.value = [];
        error.value = "对话数据格式错误";
      }
    } else {
      error.value = res.message || "获取收藏数据失败";
    }
  } catch (err) {
    error.value = err.message || "获取收藏数据失败";
  } finally {
    loading.value = false;
  }
};

const startEdit = () => {
  isEdit.value = true;
};

const cancelEdit = () => {
  isEdit.value = false;
};

const sharePicture = async () => {
  if (isCapturing.value) return;

  isCapturing.value = true;
  capturedImage.value = "";
  showImageModal.value = true;

  try {
    // 隐藏头部和底部
    const editHeader = document.querySelector(".edit-header");
    const editFooter = document.querySelector(".edit-footer");
    const shareIcon = document.querySelector(".share-icon");
    const closeIcon = document.querySelector(".close-icon");

    if (editHeader) editHeader.style.display = "none";
    if (editFooter) editFooter.style.display = "none";
    if (shareIcon) shareIcon.style.display = "none";
    if (closeIcon) closeIcon.style.display = "none";

    // 获取要截图的元素
    const element = document.querySelector(".collection-detail-content");

    // 获取背景颜色
    const backgroundColor = getComputedStyle(
      document.documentElement
    ).getPropertyValue("--background-color");

    // 使用 modern-screenshot 截图
    const dataUrl = await domToPng(element, {
      backgroundColor,
      scale: 3,
      width: element.scrollWidth,
      height: element.scrollHeight,
      style: {
        margin: "0",
        padding: "0",
      },
    });

    capturedImage.value = dataUrl;

    if (editHeader) editHeader.style.display = "";
    if (editFooter) editFooter.style.display = "";
    if (shareIcon) shareIcon.style.display = "";
    if (closeIcon) closeIcon.style.display = "";
  } catch (error) {
    message.error("截图失败，请稍后再试 📸");
    showImageModal.value = false;
  } finally {
    isCapturing.value = false;
  }
};

const copyImage = async () => {
  if (!capturedImage.value) return;

  try {
    // 将base64图片转换为Blob
    const response = await fetch(capturedImage.value);
    const blob = await response.blob();

    // 使用Clipboard API复制图片
    await navigator.clipboard.write([
      new ClipboardItem({
        [blob.type]: blob,
      }),
    ]);
    message.success("图片已复制！📋");
  } catch (error) {
    message.error("系统错误，请稍后再试 ⚠️");
  }
};

const downloadImage = () => {
  if (!capturedImage.value) return;

  try {
    // 创建下载链接
    const link = document.createElement("a");
    link.href = capturedImage.value;
    link.download = `${
      collectionDetail.value.title || new Date().getTime()
    }.png`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    message.success("图片下载成功！📥");
  } catch (error) {
    message.error("系统错误，请稍后再试 ⚠️");
  }
};
const copyUrl = () => {
  const url = window.location.href;
  copyToClipboard(url);
};

const copyToClipboard = (text) => {
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();

  try {
    document.execCommand("copy");
    message.success("链接已复制！🔗");
  } catch (err) {
    message.error("复制失败：" + err);
  } finally {
    document.body.removeChild(textarea);
  }
};

const goBack = () => {
  router.push("/collection");
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
      return new URL("@/assets/Markdown.svg", import.meta.url).href;
    default:
      return new URL("@/assets/Markdown.svg", import.meta.url).href;
  }
};

onMounted(async () => {
  await loadCollectionDetail();
});
</script>

<style scoped lang="less">
.collection-detail-container {
  padding: 1.5rem;
  height: 100%;
  overflow-y: auto;
  background-color: var(--background-color);
  color: var(--text-color);
  position: relative;

  scrollbar-width: none;
  -ms-overflow-style: none;
  &::-webkit-scrollbar {
    display: none;
  }

  .share-icon {
    position: absolute;
    top: 1rem;
    right: 4rem;
    cursor: pointer;
    transition: all 0.3s ease;
    z-index: 10;
    width: 2.5rem;
    height: 2.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 0.625rem;
    color: var(--text-color);

    &:hover {
      background-color: rgba(0, 0, 0, 0.1);
    }
  }

  .close-icon {
    position: absolute;
    top: 1rem;
    right: 1rem;
    cursor: pointer;
    transition: all 0.3s ease;
    z-index: 10;
    width: 2.5rem;
    height: 2.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 0.625rem;
    color: var(--text-color);

    &:hover {
      background-color: rgba(0, 0, 0, 0.1);
    }
  }

  .collection-detail-header {
    width: 50rem;
    margin: 0 auto;
    text-align: left;

    h2 {
      margin: 0 0 0.75rem 0;
      font-size: 22px;
      font-weight: 600;
      color: var(--text-color);
    }

    .collection-detail-date {
      font-size: 14px;
      color: var(--text-color);
      opacity: 0.6;
    }
  }

  .edit-header {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100px;
    background-color: var(--message-color);
    z-index: 100;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    .edit-header-content {
      width: 60rem;
      height: 100px;
      display: flex;
      justify-content: center;
      align-items: center;
      margin: 0 auto;

      .edit-header-title {
        width: 95%;
        display: flex;
        flex-direction: column;
        user-select: none;
        h2 {
          margin: 0;
          font-size: 18px;
          color: var(--text-color);
        }

        .edit-header-description {
          font-size: 14px;
          color: var(--text-color);
          opacity: 0.3;
        }
      }

      .edit-header-cancel {
        cursor: pointer;
        font-size: 14px;
        color: var(--text-color);
        opacity: 0.3;
        user-select: none;
      }
    }
  }

  .collection-detail-content {
    width: 50rem;
    border-radius: 12px;
    padding: 24px;
    min-height: 400px;
    margin: 0 auto;

    .item {
      display: flex;
      align-items: flex-start;
      margin: 2.67rem 0;
    }

    .message {
      flex-direction: column;
      .content {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        .text-container {
          background: var(--message-color) no-repeat center;
          border-radius: 10px;
          .text {
            padding: 0.6rem 1.33rem;
            font-size: 1.07rem;
            color: var(--text-color);
            line-height: 1.6;

            /* 确保Markdown元素正确渲染 */
            p {
              margin: 0.5em 0;
            }

            h1,
            h2,
            h3,
            h4,
            h5,
            h6 {
              margin: 1em 0 0.5em 0;
            }

            ul,
            ol {
              margin: 0.5em 0;
              padding-left: 2em;
            }

            li {
              margin: 0.25em 0;
            }

            table {
              margin: 1em 0;
            }
          }
        }

        .image-container {
          border-radius: 10px;
          padding: 0.6rem 1.33rem;
          max-width: 700px;
          user-select: none;

          img {
            max-width: 100%;
            max-height: 400px;
            height: auto;
            border-radius: 8px;
            object-fit: contain;
          }

          span {
            display: block;
            text-align: center;
            color: var(--text-color-3);
            font-size: 14px;
            padding: 1rem;
          }
        }

        .file-message-container {
          padding: 0.6rem 0;
          max-width: 400px;

          .file-message-item {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 12px 16px;
            background: var(--message-color);
            border: 1px solid rgba(0, 0, 0, 0.08);
            border-radius: 10px;

            .file-message-icon {
              width: 40px;
              height: 40px;
              flex-shrink: 0;
              object-fit: contain;
            }

            .file-message-info {
              display: flex;
              flex-direction: column;
              gap: 4px;
              min-width: 0;
              flex: 1;

              .file-message-name {
                font-size: 14px;
                font-weight: 500;
                color: var(--text-color);
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
              }

              .file-message-size {
                font-size: 12px;
                color: var(--text-color);
                opacity: 0.6;
              }
            }
          }
        }
      }
    }
  }

  .edit-footer {
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 80px;
    background-color: var(--message-color);
    z-index: 100;
    box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.1);
    .edit-footer-content {
      width: 45rem;
      height: 80px;
      display: flex;
      justify-content: flex-end;
      align-items: center;
      margin: 0 auto;
      gap: 1rem;
    }
  }

  .loading-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
  }

  .error-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100vh;
    text-align: center;

    .error-icon {
      margin-bottom: 0.5rem;
      opacity: 0.5;
      color: var(--error-color);
    }

    .error-text {
      font-size: 20px;
      font-weight: 600;
      margin-bottom: 0.5rem;
    }

    .error-description {
      font-size: 14px;
      opacity: 0.6;
      max-width: 400px;
    }
  }
}
</style>

<style lang="less">
@import "../styles/imageModal.less";
@import "@/styles/hljs.less";
@import "@/styles/markdown.less";

.collection-detail-content .n-scrollbar-rail {
  display: none !important;
}
</style>
