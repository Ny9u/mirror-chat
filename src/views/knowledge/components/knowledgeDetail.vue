<template>
  <div class="knowledge-detail-container">
    <n-icon class="close-icon" :component="ArrowLeft" @click="goBack" size="1.5rem" />
    <div class="detail-header">
      <div class="header-icon">
        <n-icon size="40">
          <FileText />
        </n-icon>
      </div>
      <div class="header-content">
        <h2 class="file-name">{{ knowledgeDetail?.name || '文件详情' }}</h2>
        <div class="file-meta">
          <span class="meta-item">{{ knowledgeDetail?.type }}</span>
          <span class="meta-item">{{ formatFileSize(knowledgeDetail?.size) }}</span>
          <span class="meta-item">{{ formatDate(knowledgeDetail?.createdAt) }}</span>
        </div>
      </div>
    </div>

    <div class="detail-divider"></div>

    <div class="detail-content">
      <div class="content-section">
        <h3 class="section-title">文件描述</h3>
        <p class="section-text">{{ knowledgeDetail?.description || '暂无描述' }}</p>
      </div>

      <div class="content-section" v-if="knowledgeDetail?.content">
        <h3 class="section-title">文件内容</h3>
        <div class="section-content">
          <pre class="content-preview">{{ getFileContent(knowledgeDetail.content) }}</pre>
        </div>
      </div>
    </div>

    <div class="detail-actions">
      <n-button type="primary" @click="handleDownload">
        <template #icon>
          <n-icon><Download /></n-icon>
        </template>
        下载文件
      </n-button>
      <n-button type="error" @click="handleDelete">
        <template #icon>
          <n-icon><Trash /></n-icon>
        </template>
        删除文件
      </n-button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { NIcon, NButton, useMessage, useDialog } from "naive-ui";
import {
  ArrowLeft,
  FileText,
  Download,
  Trash,
  AlertTriangle,
} from "@vicons/tabler";
import { h } from "vue";

const router = useRouter();
const route = useRoute();
const message = useMessage();
const dialog = useDialog();
const knowledgeDetail = ref(null);

const loadKnowledgeDetail = async (id) => {
  try {
    // 模拟获取数据，实际应该从API获取
    // 这里暂时使用模拟数据
    const mockData = {
      id: parseInt(id),
      name: '示例文档.txt',
      size: 2048,
      type: 'text/plain',
      description: '这是一个示例文档，用于展示知识库文件的详细信息。',
      createdAt: new Date(),
      content: null
    };

    knowledgeDetail.value = mockData;
  } catch (error) {
    message.error("获取文件详情失败:", error);
  }
};

const formatFileSize = (bytes) => {
  if (!bytes) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
};

const getFileContent = (content) => {
  if (!content) return '文件内容预览不可用';
  // 如果是File对象，返回提示信息
  if (content instanceof File) {
    return `文件: ${content.name}\n类型: ${content.type}\n大小: ${formatFileSize(content.size)}`;
  }
  // 如果是文本内容，直接返回
  if (typeof content === 'string') {
    return content;
  }
  return '文件内容预览不可用';
};

const handleDownload = () => {
  message.success("开始下载文件");
  // 实际应该实现下载逻辑
};

const handleDelete = () => {
  dialog.warning({
    title: "确定删除文件？",
    content: `确定要删除"${knowledgeDetail.value?.name}"吗？删除后，文件将不可恢复。`,
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
      message.success("文件已删除");
      router.push("/knowledge");
    },
  });
};

const goBack = () => {
  router.push("/knowledge");
};

onMounted(() => {
  const id = route.params.id;
  if (id) {
    loadKnowledgeDetail(id);
  }
});
</script>

<style scoped lang="less">
.knowledge-detail-container {
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

  .close-icon {
    position: absolute;
    top: 1rem;
    left: 1rem;
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

  .detail-header {
    display: flex;
    align-items: flex-start;
    gap: 1.25rem;
    padding: 0.5rem 0 1.5rem 0;
    margin-bottom: 1.5rem;

    .header-icon {
      width: 4rem;
      height: 4rem;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: var(--primary-color);
      border-radius: 12px;
      color: white;
      flex-shrink: 0;
    }

    .header-content {
      flex: 1;
      overflow: hidden;

      .file-name {
        margin: 0 0 0.75rem 0;
        font-size: 24px;
        font-weight: 600;
        color: var(--text-color);
        word-break: break-all;
      }

      .file-meta {
        display: flex;
        gap: 1.25rem;
        flex-wrap: wrap;

        .meta-item {
          display: flex;
          align-items: center;
          font-size: 14px;
          opacity: 0.7;
        }
      }
    }
  }

  .detail-divider {
    height: 1px;
    background-color: rgba(128, 128, 128, 0.2);
    margin-bottom: 1.5rem;
  }

  .detail-content {
    flex: 1;

    .content-section {
      margin-bottom: 2rem;

      .section-title {
        font-size: 18px;
        font-weight: 600;
        color: var(--text-color);
        margin-bottom: 0.75rem;
      }

      .section-text {
        font-size: 14px;
        opacity: 0.8;
        line-height: 1.6;
      }

      .section-content {
        background-color: var(--message-color);
        border-radius: 12px;
        padding: 1rem;
        border: 1px solid var(--select-color);

        .content-preview {
          font-size: 14px;
          margin: 0;
          white-space: pre-wrap;
          word-wrap: break-word;
          font-family: monospace;
        }
      }
    }
  }

  .detail-actions {
    display: flex;
    gap: 1rem;
    padding-top: 1rem;
    border-top: 1px solid rgba(128, 128, 128, 0.2);
  }
}
</style>
