<template>
  <div class="collection-container">
    <n-icon class="close-icon" :component="X" @click="goBack" size="1.5rem" />
    <div class="collection-header">
      <h2>我的收藏</h2>
      <div class="collection-stats">共 {{ totalPage }} 条收藏</div>
    </div>

    <div class="collection-grid" v-if="collections.length">
      <div
        v-for="(column, colIndex) in columnedCollections"
        :key="colIndex"
        class="collection-column"
      >
        <div
          v-for="item in column"
          :key="item.id"
          class="collection-item"
          :style="{
            height: getRandomHeight(item.originalIndex),
            animationDelay: `${item.originalIndex * 0.05}s`,
          }"
          @click="openCollection(item)"
        >
          <div class="item-header">
            <div class="item-title">{{ item.title }}</div>
            <div class="item-date">{{ formatDate(item.date) }}</div>
          </div>
          <div class="item-content" style="padding: 0px" v-if="item.isImage">
            <img :src="item.content" />
          </div>
          <div
            class="item-content"
            v-else
            v-html="truncateContent(item.content)"
          ></div>
          <div class="item-actions">
            <n-button text size="small" @click.stop="openCollection(item)">
              <template #icon>
                <n-icon><Eye /></n-icon>
              </template>
            </n-button>
            <n-button
              text
              size="small"
              type="error"
              @click.stop="removeFromCollection(item.id)"
            >
              <template #icon>
                <n-icon><Trash /></n-icon>
              </template>
            </n-button>
          </div>
        </div>
      </div>
    </div>

    <div class="pagination-container" v-if="collections.length">
      <n-pagination
        v-model:page="currentPage"
        :page-count="totalPages"
        :page-size="pageSize"
        @update:page="handlePageChange"
      />
    </div>

    <div class="empty-collection" v-if="!loading && !collections.length">
      <div class="empty-icon">
        <n-icon size="48">
          <BookmarkOff />
        </n-icon>
      </div>
      <div class="empty-text">暂无收藏内容</div>
      <div class="empty-description">
        在聊天中点击收藏按钮即可将内容添加到收藏夹
      </div>
    </div>

    <div class="loading-container" v-if="loading">
      <n-spin size="large" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { NButton, NIcon, useMessage, NPagination, NSpin } from "naive-ui";
import { Trash, X, BookmarkOff, Eye, Copy } from "@vicons/tabler";
import { getUserFavorites, removeFavorite } from "@/services/user.js";
import { useConfigStore } from "@/stores/configStore.js";
import MarkdownIt from "markdown-it";
import { formatDate } from "@/utils/date.js";

const router = useRouter();
const message = useMessage();
const configStore = useConfigStore();
const collections = ref([]);
const totalPage = ref(0);
const currentPage = ref(1);
const pageSize = ref(18);
const loading = ref(true);

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
});

const totalPages = computed(() => {
  return Math.ceil(totalPage.value / pageSize.value);
});

// 计算列数
const columnCount = ref(6);

const updateColumnCount = () => {
  const width = window.innerWidth;
  if (width < 600) {
    columnCount.value = 2;
  } else if (width < 900) {
    columnCount.value = 3;
  } else if (width < 1200) {
    columnCount.value = 4;
  } else if (width < 1500) {
    columnCount.value = 5;
  } else {
    columnCount.value = 6;
  }
};

const columnedCollections = computed(() => {
  const cols = columnCount.value;
  const columns = Array.from({ length: cols }, () => []);

  // 按时间排序（从新到旧），然后按行优先分配到各列
  const sortedCollections = [...collections.value].sort((a, b) => {
    return new Date(b.date) - new Date(a.date);
  });

  sortedCollections.forEach((item, index) => {
    const columnIndex = index % cols;
    columns[columnIndex].push({ ...item, originalIndex: index });
  });

  return columns;
});

const handlePageChange = async (page) => {
  currentPage.value = page;
  await loadCollections(page);
};

const loadCollections = async (page = 1) => {
  loading.value = true;
  collections.value = [];
  try {
    const res = await getUserFavorites({
      userId: configStore.userId,
      page: page,
      limit: pageSize.value,
    });
    if (res.code === 200 && res.data) {
      collections.value = res.data.favorites.map((item) => {
        const conversationContent = item.conversation[1]?.content[0];
        const isImage = conversationContent?.type === "image";
        return {
          id: item.id,
          title: item.title,
          content: isImage
            ? conversationContent?.data.url
            : md.render(item.conversation[1]?.content[0]?.data || ""),
          originalContent: item.conversation,
          date: item.createdAt,
          isImage: isImage,
        };
      });
      totalPage.value = res.data.total;
    } else {
      collections.value = [];
    }
  } catch (error) {
    message.error("获取收藏数据失败：" + error);
    collections.value = [];
  } finally {
    loading.value = false;
  }
};

const truncateContent = (content) => {
  // 如果内容已经是HTML，先获取纯文本再截断
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = content;
  const textContent = tempDiv.textContent || tempDiv.innerText || "";

  if (textContent.length > 150) {
    const tempDiv2 = document.createElement("div");
    tempDiv2.innerHTML = content;
    let truncatedText = textContent.substring(0, 150) + "...";
    return truncatedText;
  }
  return textContent;
};

const openCollection = (item) => {
  router.push(`/collection/${item.id}`);
};

const removeFromCollection = async (id) => {
  try {
    const res = await removeFavorite({
      userId: configStore.userId,
      contentId: id,
    });

    if (res.code === 200) {
      collections.value = collections.value.filter((item) => item.id !== id);
      message.success("删除成功！");
    } else {
      message.error(res.message || "删除收藏失败，请稍后再试 🗑️");
    }
  } catch (error) {
    message.error("删除收藏失败：" + error);
  }
};

const heightCache = new Map();
const getRandomHeight = (index) => {
  if (heightCache.has(index)) {
    return heightCache.get(index);
  }

  const minHeight = 200;
  const maxHeight = 350;
  const randomHeight =
    Math.floor(Math.random() * (maxHeight - minHeight + 1)) + minHeight;
  const height = randomHeight + "px";
  heightCache.set(index, height);
  return height;
};

const goBack = () => {
  router.push("/");
};

onMounted(async () => {
  updateColumnCount();
  window.addEventListener("resize", updateColumnCount);
  await loadCollections();
});

onUnmounted(() => {
  window.removeEventListener("resize", updateColumnCount);
});
</script>

<style scoped lang="less">
.collection-container {
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

  .collection-header {
    margin-bottom: 1.2rem;

    h2 {
      margin: 0 0 0.75rem 0;
      font-size: 24px;
      font-weight: 600;
      color: var(--text-color);
    }

    .collection-stats {
      font-size: 14px;
      color: var(--text-color-3);
      margin-bottom: 16px;
    }
  }

  .collection-grid {
    display: flex;
    gap: 1.25rem;
    flex: 1;

    .collection-column {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .collection-item {
      background: linear-gradient(
        145deg,
        var(--message-color) 0%,
        var(--message-color) 100%
      );
      border-radius: 20px;
      padding: 1.25rem;
      cursor: pointer;
      transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
      border: 1px solid rgba(128, 128, 128, 0.1);
      display: flex;
      flex-direction: column;
      position: relative;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
      overflow: hidden;

      &:hover {
        transform: translateY(-6px) scale(1.05);
        border-color: var(--primary-color);
        box-shadow:
          0 12px 28px rgba(0, 0, 0, 0.12),
          0 4px 12px rgba(var(--primary-color-rgb, 99, 102, 241), 0.15);

        .item-header .item-title {
          color: var(--primary-color);
        }

        .item-actions {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }

      &:active {
        transform: translateY(-2px) scale(1.01);
        transition: all 0.1s ease;
      }

      .item-header {
        margin-bottom: 0.875rem;
        position: relative;
        z-index: 1;

        .item-title {
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 0.5rem;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          color: var(--text-color);
          transition: color 0.3s ease;
          letter-spacing: 0.02em;
        }

        .item-date {
          font-size: 12px;
          color: var(--text-color-3);
          display: flex;
          align-items: center;
          gap: 0.35rem;

          &::before {
            content: "";
            display: inline-block;
            width: 6px;
            height: 6px;
            border-radius: 50%;
            background: linear-gradient(
              135deg,
              var(--primary-color) 0%,
              #55f7a9 100%
            );
            opacity: 0.5;
          }
        }
      }

      .item-content {
        flex: 1;
        font-size: 13px;
        line-height: 1.65;
        overflow: hidden;
        color: var(--text-color);
        opacity: 0.85;
        background-color: var(--background-color);
        border-radius: 12px;
        padding: 0.875rem;
        transition: all 0.3s ease;
        position: relative;
        z-index: 1;
        border: 1px solid rgba(128, 128, 128, 0.08);

        img {
          width: 100%;
          height: auto;
          max-height: 180px;
          object-fit: cover;
          border-radius: 8px;
          display: block;
        }

        span {
          display: block;
          text-align: center;
          color: var(--text-color-3);
          font-size: 12px;
          padding: 1rem;
        }
      }

      .item-actions {
        position: absolute;
        top: 0.75rem;
        right: 0.75rem;
        display: flex;
        gap: 0.35rem;
        opacity: 0;
        transform: translateY(-8px) scale(0.95);
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        background: var(--action-bg);
        backdrop-filter: blur(10px);
        border-radius: 10px;
        padding: 0.35rem 0.5rem;
        box-shadow:
          0 4px 12px rgba(0, 0, 0, 0.1),
          0 1px 3px rgba(0, 0, 0, 0.08);
        z-index: 10;

        :deep(.n-button) {
          transition: all 0.2s ease;
          border-radius: 6px;

          &:hover {
            transform: scale(1.15);
            background-color: var(--action-hover-bg, rgba(0, 0, 0, 0.05));
          }
        }
      }

      // 入场动画
      animation: fadeInUp 0.5s ease forwards;
      opacity: 0;

      @keyframes fadeInUp {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
    }
  }

  .pagination-container {
    display: flex;
    justify-content: flex-end;
    padding: 0 1.5rem;
    padding-top: 1rem;
  }

  .empty-collection {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 80vh;
    text-align: center;

    .empty-icon {
      margin-bottom: 1rem;
      opacity: 0.5;
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
  }

  .loading-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 80vh;
  }
}
</style>
