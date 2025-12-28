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
      <div class="knowledge-stats">共 {{ totalPage }} 个知识库</div>
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
            <n-icon size="32">
              <FileText />
            </n-icon>
          </div>
          <div class="item-info">
            <div class="item-title">{{ item.name }}</div>
            <div class="item-date">{{ formatDate(item.createdAt) }}</div>
          </div>
        </div>
        <div class="item-description">{{ item.description || "暂无描述" }}</div>
        <div class="item-meta">
          <div class="item-size">{{ formatFileSize(item.size) }}</div>
          <div class="item-type">{{ item.type }}</div>
        </div>
        <div class="item-actions">
          <n-button text size="small" @click.stop="openKnowledge(item)">
            <template #icon>
              <n-icon><Eye /></n-icon>
            </template>
          </n-button>
          <n-button
            text
            size="small"
            type="error"
            @click.stop="deleteKnowledge(item.id)"
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
  Eye,
  Upload,
  FileText,
  Database,
  CloudUpload,
} from "@vicons/tabler";
import { useConfigStore } from "@/stores/configStore.js";
import { formatDate } from "@/utils/date.js";
import { uploadKnowledge } from "@/services/user.js";

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

const handlePageChange = async (page) => {
  currentPage.value = page;
  await loadKnowledgeList(page);
};

const loadKnowledgeList = async (page = 1) => {
  loading.value = true;
  knowledgeList.value = [];
  try {
    // const allKnowledge = await KnowledgeService.getAllKnowledge();
    // // 模拟分页逻辑
    // totalPage.value = allKnowledge.length;
    // const startIndex = (page - 1) * pageSize.value;
    // const endIndex = startIndex + pageSize.value;
    // knowledgeList.value = allKnowledge.slice(startIndex, endIndex);
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

const handleUpload = async ({ file, onFinish, onError }) => {
  try {
    const formData = new FormData();
    formData.append("userId", configStore.userId);
    formData.append("file", file.file);

    const res = await uploadKnowledge(formData);

    if (res.code === 200) {
      const newKnowledge = {
        id: res.data?.id || Date.now(),
        name: file.name,
        size: file.file?.size || 1024,
        type: file.file?.type || "未知类型",
        description: res.data?.description || "新上传的文件",
        createdAt: new Date(res.data?.createdAt) || new Date(),
        content: file.file,
      };

      knowledgeList.value.push(newKnowledge);
      message.success(`文件 "${file.name}" 上传成功`);
      onFinish();
    } else {
      message.error(res.message || `文件 "${file.name}" 上传失败`);
      onError();
    }
  } catch (error) {
    message.error(`文件 "${file.name}" 上传失败`);
    onError();
  }
};

const handleFileListChange = (fileList) => {
  console.log("文件列表变化:", fileList);
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
            "directory-dnd": true,
            max: 10,
            "custom-request": handleUpload,
            "onUpdate:file-list": handleFileListChange,
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
                        default: () => "支持上传多种格式的文档",
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

const openKnowledge = (item) => {
  router.push(`/knowledge/${item.id}`);
};

const deleteKnowledge = (id) => {
  knowledgeList.value = knowledgeList.value.filter((item) => item.id !== id);
  message.success("删除成功");
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
        font-size: 14px;
        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        margin-bottom: 0.75rem;
        opacity: 0.8;
      }

      .item-meta {
        display: flex;
        gap: 3rem;
        margin-bottom: 0.75rem;
        font-size: 12px;
        opacity: 0.6;
        flex-wrap: nowrap;
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
