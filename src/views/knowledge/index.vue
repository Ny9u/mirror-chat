<template>
  <div class="knowledge-container">
    <n-icon class="close-icon" :component="X" @click="goBack" size="1.5rem" />
    <n-popover
      v-if="knowledgeList.length"
      placement="bottom"
      trigger="hover"
      :show-arrow="false"
      class="upload-popover"
    >
      <template #trigger>
        <n-icon
          class="upload-icon"
          :component="CloudUpload"
          @click="showUploadDialog"
          size="1.5rem"
        />
      </template>
      <span>继续上传</span>
    </n-popover>
    <div class="knowledge-header">
      <h2>知识库</h2>
      <div class="knowledge-stats">共 {{ totalPage }} 个文件</div>
    </div>

    <div class="knowledge-grid" v-if="knowledgeList.length">
      <div
        v-for="item in knowledgeList"
        :key="item.id"
        class="knowledge-item"
        @click="openKnowledge(item)"
      >
        <div class="item-header">
          <div class="item-icon">
            <img :src="getFileIcon(item.fileName)" alt="file icon" />
          </div>
          <div class="item-info">
            <div class="item-title">{{ item.fileName }}</div>
            <div class="item-date">{{ formatDate(item.createdAt) }}</div>
          </div>
        </div>
        <div class="item-description" v-html="getPreviewContent(item)"></div>
        <div class="item-meta">
          <div class="item-size">{{ formatFileSize(item.size) }}</div>
          <div class="item-type">{{ item.type }}</div>
        </div>
        <div class="item-actions">
          <n-button
            text
            size="small"
            @click.stop="downloadKnowledgeToLocal(item)"
          >
            <template #icon>
              <n-icon><Download /></n-icon>
            </template>
          </n-button>
          <n-button
            text
            size="small"
            type="error"
            @click.stop="openDeleteKnowledgeDialog(item)"
          >
            <template #icon>
              <n-icon><Trash /></n-icon>
            </template>
          </n-button>
        </div>
      </div>
    </div>

    <div class="pagination-container" v-if="knowledgeList.length">
      <n-pagination
        v-model:page="currentPage"
        :page-count="totalPages"
        :page-size="pageSize"
        @update:page="handlePageChange"
      />
    </div>

    <div class="empty-knowledge" v-if="!loading && !knowledgeList.length">
      <div class="empty-icon">
        <n-icon size="48">
          <Database />
        </n-icon>
      </div>
      <div class="empty-text">知识库为空</div>
      <div class="empty-description">
        点击下方按钮上传文件，开始构建您的知识库
      </div>
      <n-button type="primary" @click="showUploadDialog">
        <template #icon>
          <n-icon><Upload /></n-icon>
        </template>
        上传文件
      </n-button>
    </div>

    <div class="loading-container" v-if="loading">
      <n-spin size="large" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, h } from "vue";
import { useRouter } from "vue-router";
import {
  NButton,
  NIcon,
  useMessage,
  useDialog,
  NUpload,
  NUploadDragger,
  NText,
  NP,
  NSpin,
  NPagination,
  NPopover,
} from "naive-ui";
import {
  Trash,
  X,
  Upload,
  Database,
  CloudUpload,
  AlertTriangle,
  Download,
} from "@vicons/tabler";
import { useConfigStore } from "@/stores/configStore.js";
import { formatDate } from "@/utils/date.js";
import {
  uploadKnowledge,
  getKnowledgeList,
  deleteKnowledge,
  getKnowledgeDetail,
  downloadKnowledge,
} from "@/services/user.js";
import MarkdownIt from "markdown-it";

const md = new MarkdownIt();

const router = useRouter();
const message = useMessage();
const dialog = useDialog();
const configStore = useConfigStore();
const knowledgeList = ref([]);
const totalPage = ref(0);
const currentPage = ref(1);
const pageSize = ref(8);
const loading = ref(true);

const totalPages = computed(() => {
  return Math.ceil(totalPage.value / pageSize.value);
});
const getFileIcon = (fileName) => {
  if (!fileName) return new URL("@/assets/Markdown.svg", import.meta.url).href;
  const ext = fileName.split(".").pop()?.toLowerCase() || "";
  switch (ext) {
    case "pdf":
      return new URL("@/assets/PDF.svg", import.meta.url).href;
    case "doc":
    case "docx":
      return new URL("@/assets/DOCX.svg", import.meta.url).href;
    case "xls":
    case "xlsx":
      return new URL("@/assets/XLS.svg", import.meta.url).href;
    case "txt":
    case "md":
    default:
      return new URL("@/assets/Markdown.svg", import.meta.url).href;
  }
};

const getPreviewContent = (item) => {
  const content = item.preview || "暂无描述";
  const isMarkdown = item.type === "markdown";
  return isMarkdown ? md.render(content) : content;
};

const handlePageChange = async (page) => {
  currentPage.value = page;
  await loadKnowledgeList(page);
};

const loadKnowledgeList = async (page = 1) => {
  loading.value = true;
  knowledgeList.value = [];
  try {
    const res = await getKnowledgeList({
      userId: configStore.userId,
      page,
      pageSize: pageSize.value,
    });

    if (res.code === 200) {
      knowledgeList.value = res.data?.list || [];
      totalPage.value = res.data?.pagination?.total || 0;
    } else {
      message.error(res.message || "获取知识库数据失败");
    }
  } catch (error) {
    message.error("获取知识库数据失败:", error);
    knowledgeList.value = [];
  } finally {
    loading.value = false;
  }
};

const formatFileSize = (bytes) => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
};

const downloadKnowledgeToLocal = async (item) => {
  try {
    const res = await downloadKnowledge({
      userId: configStore.userId,
      id: item.id,
    });

    const blob = res instanceof Blob ? res : new Blob([res]);
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = item.fileName || "download";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    message.error("下载失败");
  }
};

const handleUpload = async ({ file, onFinish, onError }) => {
  try {
    const formData = new FormData();
    formData.append("userId", configStore.userId);
    formData.append("file", file.file);

    const res = await uploadKnowledge(formData);

    if (res.code === 200) {
      await loadKnowledgeList();
      message.success(`"${file.name}" 上传成功`);
      onFinish();
    } else {
      message.error(res.message || `"${file.name}" 上传失败}`);
      onError();
    }
  } catch (error) {
    message.error(`"${file.name}" 上传失败`);
    onError();
  }
};

const showUploadDialog = () => {
  const d = dialog.create({
    title: "上传文件",
    content: () =>
      h("div", { style: "padding: 12px 0 0 0;" }, [
        h(
          NUpload,
          {
            multiple: true,
            directoryDnd: true,
            max: 10,
            accept: ".pdf,.doc,.docx,.xls,.xlsx,.txt,.md",
            customRequest: handleUpload,
          },
          {
            default: () =>
              h(
                NUploadDragger,
                {},
                {
                  default: () => [
                    h("div", { style: "margin-bottom: 12px" }, [
                      h(
                        NIcon,
                        { size: 48, depth: 3 },
                        {
                          default: () => h(CloudUpload),
                        }
                      ),
                    ]),
                    h(
                      NText,
                      { style: "font-size: 16px" },
                      {
                        default: () => "点击或者拖动文件到该区域来上传",
                      }
                    ),
                    h(
                      NP,
                      { depth: 3, style: "margin: 8px 0 0 0" },
                      {
                        default: () =>
                          "支持上传pdf、docx、xlsx、txt、md等格式的文档",
                      }
                    ),
                  ],
                }
              ),
          }
        ),
      ]),
    style: "border-radius: 10px; overflow: hidden;",
    titleStyle: "font-weight: 600;",
    positiveText: "关闭",
    positiveButtonProps: {
      style: "height: 34px; border-radius: 8px; padding: 1.3rem 1.5rem;",
    },
    onPositiveClick: () => {
      d.destroy();
    },
  });
};

const openKnowledge = async (item) => {
  try {
    let content = item.content;

    if (!content) {
      const res = await getKnowledgeDetail({
        userId: configStore.userId,
        id: item.id,
      });

      if (res.code === 200) {
        content = res.data?.data?.content || "暂无内容";
        item.content = content;
      } else {
        message.error(res.message || "获取知识库详情失败");
        return;
      }
    }

    const isMarkdown = item.fileName?.toLowerCase().endsWith(".md");

    const d = dialog.create({
      title: item.fileName || "知识库详情",
      content: () =>
        h(
          "div",
          {
            style:
              "max-height: 60vh; overflow-y: auto; scrollbar-width: thin; scrollbar-color: rgba(0, 0, 0, 0.2) transparent;",
          },
          [
            isMarkdown
              ? h("div", {
                  style:
                    "margin: 0; padding: 1rem; background-color: var(--background-color); border-radius: 8px; font-size: 14px; line-height: 1.8; color: var(--text-color);",
                  innerHTML: md.render(content),
                })
              : h(
                  "pre",
                  {
                    style:
                      "margin: 0; padding: 1rem; background-color: var(--background-color); border-radius: 8px; font-size: 14px; line-height: 1.8; color: var(--text-color); white-space: pre-wrap; word-break: break-word; font-family: inherit;",
                  },
                  content
                ),
          ]
        ),
      showIcon: false,
      style: "width: 50vw; max-width: 800px;",
      titleStyle: "font-weight: 600;",
      positiveText: "关闭",
      positiveButtonProps: {
        style: "height: 34px; border-radius: 8px; padding: 1.3rem 1.5rem;",
      },
      onPositiveClick: () => {
        d.destroy();
      },
    });
  } catch (error) {
    message.error("获取知识库详情失败");
  }
};

const openDeleteKnowledgeDialog = async (item) => {
  dialog.warning({
    title: "确定删除文件？",
    content: `确定要删除"${item.fileName}"吗？删除后，文件将不可恢复。`,
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
    onPositiveClick: async () => {
      try {
        const res = await deleteKnowledge({
          userId: configStore.userId,
          id: item.id,
          fileName: item.fileName,
        });

        if (res.code === 200) {
          message.success("删除成功");
          await loadKnowledgeList(currentPage.value);
        } else {
          message.error(res.message || "删除失败");
        }
      } catch (error) {
        message.error("删除失败");
      }
    },
  });
};

const goBack = () => {
  router.push("/");
};

onMounted(async () => {
  await loadKnowledgeList(1);
});
</script>

<style scoped lang="less">
.knowledge-container {
  padding: 1.5rem;
  padding-bottom: 1rem;
  height: 100%;
  overflow-y: auto;
  background-color: var(--background-color);
  color: var(--text-color);
  position: relative;
  display: flex;
  flex-direction: column;

  scrollbar-width: none;
  -ms-overflow-style: none;
  &::-webkit-scrollbar {
    display: none;
  }

  .upload-icon {
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
    color: var(--primary-color);

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

  .knowledge-header {
    margin-bottom: 1.2rem;

    h2 {
      margin: 0 0 0.75rem 0;
      font-size: 24px;
      font-weight: 600;
      color: var(--text-color);
    }

    .knowledge-stats {
      font-size: 14px;
      color: var(--text-color-3);
      margin-bottom: 16px;
    }
  }

  .knowledge-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 1rem;
    flex: 1;

    .knowledge-item {
      background-color: var(--message-color);
      border-radius: 12px;
      padding: 1.1rem;
      cursor: pointer;
      transition: all 0.2s ease;
      border: 1px solid var(--select-color);
      display: flex;
      flex-direction: column;
      min-height: 11rem;
      max-height: 23rem;

      &:hover {
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        transform: translateY(-2px);
      }

      .item-header {
        display: flex;
        align-items: flex-start;
        gap: 0.75rem;
        margin-bottom: 0.75rem;

        .item-icon {
          color: var(--primary-color);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;

          img {
            width: 32px;
            height: 32px;
          }
        }

        .item-info {
          flex: 1;
          overflow: hidden;

          .item-title {
            font-size: 16px;
            font-weight: 600;
            margin-bottom: 0.25rem;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }

          .item-date {
            font-size: 12px;
            opacity: 0.6;
          }
        }
      }

      .item-description {
        flex: 1;
        background-color: #ffffff85;
        border-radius: 10px;
        padding: 0.75rem;
        font-size: 14px;
        overflow: auto;
        opacity: 0.8;
        user-select: none;
        scrollbar-width: none;
        -ms-overflow-style: none;
        &::-webkit-scrollbar {
          display: none;
        }

        h1,
        h2,
        h3,
        h4,
        h5,
        h6 {
          margin: 0.5rem 0 0.25rem 0;
          font-weight: 600;
          font-size: 1.1em;
        }

        p {
          margin: 0.25rem 0;
        }

        ul,
        ol {
          margin: 0.25rem 0;
          padding-left: 1.5rem;
        }

        li {
          margin: 0.1rem 0;
        }

        code {
          background-color: rgba(0, 0, 0, 0.05);
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 0.9em;
        }

        pre {
          background-color: rgba(0, 0, 0, 0.05);
          padding: 0.5rem;
          border-radius: 6px;
          overflow-x: auto;
          margin: 0.5rem 0;
        }

        pre code {
          background-color: transparent;
          padding: 0;
        }

        blockquote {
          border-left: 3px solid var(--primary-color);
          padding-left: 0.75rem;
          margin: 0.5rem 0;
          opacity: 0.8;
        }

        strong {
          font-weight: 600;
        }

        em {
          font-style: italic;
        }
      }

      .item-meta {
        display: flex;
        margin: 0.75rem 0px;
        font-size: 12px;
        opacity: 0.6;
        flex-wrap: nowrap;
        justify-content: space-between;
        align-items: center;

        .item-size {
          flex-shrink: 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          display: flex;
          align-items: center;
        }

        .item-type {
          display: flex;
          align-items: center;
        }
      }

      .item-actions {
        display: flex;
        justify-content: flex-end;
        gap: 0.5rem;
      }
    }
  }

  .pagination-container {
    display: flex;
    justify-content: flex-end;
    padding: 0 1.5rem;
    padding-top: 1rem;
  }

  .empty-knowledge {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 80vh;
    text-align: center;

    .empty-icon {
      margin-bottom: 1rem;
      opacity: 0.5;
      color: var(--primary-color);
    }

    .empty-text {
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 0.5rem;
    }

    .empty-description {
      font-size: 14px;
      opacity: 0.6;
      max-width: 25rem;
      margin-bottom: 1.25rem;
    }
    :deep(.n-button) {
      height: 2.7rem;
      border-radius: 10px;
      letter-spacing: 0.5px;
      text-transform: uppercase;
    }
  }

  .loading-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 80vh;
  }
}
</style>

<style lang="less">
@import "./styles/uploadPopover.less";
</style>
