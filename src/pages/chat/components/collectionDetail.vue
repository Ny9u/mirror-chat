<template>
  <div class="collection-detail-container">
    <n-icon class="close-icon" :component="X" @click="goBack" size="1.5rem" />
    <div class="collection-detail-header" v-if="!loading && !error">
      <h2>{{ collectionDetail.title || "收藏详情" }}</h2>
      <div class="collection-detail-date">
        {{ formatDate(collectionDetail.createdAt) || "" }} • 内容由 AI
        生成，不能完全保障真实
      </div>
    </div>

    <div class="collection-detail-content" v-if="!loading">
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
                  <div class="text-container" v-if="i.type === 'content'">
                    <div
                      class="text"
                      :style="{
                        maxWidth: item.role === 'assistant' ? '63vw' : '560px',
                      }"
                    >
                      <div v-html="i.data"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template>
      </n-virtual-list>
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
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { NIcon, NSpin, NButton, useMessage, NVirtualList } from "naive-ui";
import { X, AlertCircle } from "@vicons/tabler";
import { getFavoriteDetail } from "@/services/user.js";
import { useConfigStore } from "@/stores/configStore.js";
import MarkdownIt from "markdown-it";
import { formatDate } from "@/utils/date.js";

const router = useRouter();
const route = useRoute();
const message = useMessage();
const configStore = useConfigStore();
const collectionDetail = ref({});
const chatHistory = ref([]);
const loading = ref(true);
const error = ref("");

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
});

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
        const conversationData = JSON.parse(res.data.favorite.conversation);
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

const goBack = () => {
  router.push("/collection");
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
        align-items: flex-start;
        .text-container {
          background: var(--message-color) no-repeat center;
          border-radius: 10px;
          .text {
            padding: 0.6rem 1.33rem;
            font-size: 1.07rem;
            color: var(--text-color);
          }
        }
      }
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
