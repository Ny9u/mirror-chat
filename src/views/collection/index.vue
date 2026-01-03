<template>
  <div class="collection-container">
    <n-icon class="close-icon" :component="X" @click="goBack" size="1.5rem" />
    <div class="collection-header">
      <h2>我的收藏</h2>
      <div class="collection-stats">共 {{ totalPage }} 条收藏</div>
    </div>

    <div class="collection-grid" v-if="collections.length">
      <div
        v-for="item in collections"
        :key="item.id"
        class="collection-item"
        @click="openCollection(item)"
      >
        <div class="item-header">
          <div class="item-title">{{ item.title }}</div>
          <div class="item-date">{{ formatDate(item.date) }}</div>
        </div>
        <div class="item-content" v-html="truncateContent(item.content)"></div>
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
import { ref, onMounted, computed } from "vue";
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
const pageSize = ref(24);
const loading = ref(true);

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
});

const totalPages = computed(() => {
  return Math.ceil(totalPage.value / pageSize.value);
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
      collections.value = res.data.favorites.map((item) => ({
        id: item.id,
        title: item.title,
        content: md.render(item.conversation[1]?.content[0]?.data || ""),
        originalContent: item.conversation,
        date: item.createdAt,
      }));
      totalPage.value = res.data.total;
    } else {
      collections.value = [];
    }
  } catch (error) {
    message.error("获取收藏数据失败:", error);
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

  if (textContent.length > 55) {
    const tempDiv2 = document.createElement("div");
    tempDiv2.innerHTML = content;
    let truncatedText = textContent.substring(0, 55) + "...";
    return truncatedText;
  }
  return content;
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
      message.success("删除成功");
    } else {
      message.error(res.message || "删除收藏失败");
    }
  } catch (error) {
    message.error("删除收藏失败:", error);
  }
};
const goBack = () => {
  router.push("/");
};

onMounted(async () => {
  await loadCollections();
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
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1rem;
    flex: 1;

    .collection-item {
      background-color: var(--message-color);
      border-radius: 12px;
      padding: 1.1rem;
      cursor: pointer;
      transition: all 0.2s ease;
      border: 1px solid var(--select-color);
      display: flex;
      flex-direction: column;
      height: 10.5rem;

      &:hover {
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      }

      .item-header {
        .item-title {
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 4px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .item-date {
          font-size: 12px;
          opacity: 0.6;
        }
      }

      .item-content {
        flex: 1;
        font-size: 14px;
        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-line-clamp: 4;
        -webkit-box-orient: vertical;
        margin-bottom: 0.75rem;
        word-wrap: break-word;
        word-break: break-word;
        max-height: calc(1.5em * 4);
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
