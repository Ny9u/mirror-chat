<template>
  <div class="history-dialog">
    <n-icon class="close-icon" :component="X" @click="goBack" size="1.5rem" />
    <div class="history-header">
      <h2>历史对话</h2>
      <div class="history-count">共 {{ historyList.length }} 条对话</div>
    </div>

    <div class="history-content">
      <n-spin size="large" v-if="loading" class="loading-spin"></n-spin>

      <n-virtual-list
        v-show="!loading"
        :items="groupedHistory"
        :item-size="100"
        item-resizable
        class="history-list"
        v-if="groupedHistory.length > 0"
      >
        <template #default="{ item }">
          <div v-if="item.isGroup" class="time-group">
            <div class="group-title">{{ item.title }}</div>
          </div>
          <div v-else class="history-item" @click="openChat(item)">
            <div class="history-item-header">
              <n-icon class="chat-icon" :component="MessageCircle" size="16" />
              <div class="history-title">
                {{ item.title }}
              </div>
              <div>
                <n-popover
                  placement="bottom"
                  trigger="click"
                  raw
                  class="actions-popover"
                  :show-arrow="false"
                  v-model:show="popoverShowMap[item.id]"
                >
                  <template #trigger>
                    <n-button text size="small" @click.stop>
                      <template #icon>
                        <n-icon><Dots /></n-icon>
                      </template>
                    </n-button>
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
                      @click.stop="editChat(item)"
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
                        <Edit />
                      </n-icon>
                      <span>编辑</span>
                    </div>

                    <div
                      style="
                        padding: 8px 12px;
                        border-radius: 10px;
                        cursor: pointer;
                        display: flex;
                        align-items: center;
                        color: rgba(249, 57, 32, 1);
                        gap: 8px;
                        transition: background-color 0.2s ease;
                      "
                      @click.stop="deleteChat(item)"
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
                        <Trash />
                      </n-icon>
                      <span>删除</span>
                    </div>
                  </div>
                </n-popover>
              </div>
            </div>
            <div class="history-preview" v-html="item.preview"></div>
            <div class="history-time">{{ formatTime(item.timestamp) }}</div>
          </div>
        </template>
      </n-virtual-list>

      <div v-else-if="!loading" class="history-empty">
        <div class="empty-icon">
          <n-icon size="48"><MessageOff /></n-icon>
        </div>
        <div class="empty-text">暂无历史对话</div>
        <n-button type="primary" @click="createNewChat">开始新对话</n-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, h } from "vue";
import { useRouter } from "vue-router";
import { md } from "@/services/markdownService.js";
import { useConfigStore } from "@/stores/configStore";
import {
  X,
  Trash,
  MessageOff,
  MessageCircle,
  Dots,
  AlertTriangle,
  Edit,
} from "@vicons/tabler";
import {
  getConversations,
  deleteConversation,
  saveConversation,
} from "@/services/user.js";

const router = useRouter();
const message = useMessage();
const dialog = useDialog();
const configStore = useConfigStore();

const historyList = ref([]);
const loading = ref(false);
const popoverShowMap = ref({});
const editingId = ref(null);
const editingTitle = ref("");
const editInput = ref(null);

// 按时间分组的历史列表
const groupedHistory = computed(() => {
  if (historyList.value.length === 0) return [];

  const groups = [];
  const now = new Date();

  const today = [];
  const yesterday = [];
  const last7Days = [];
  const older = [];

  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);

  const todayEnd = new Date(now);
  todayEnd.setHours(23, 59, 59, 999);

  const yesterdayStart = new Date(now);
  yesterdayStart.setDate(now.getDate() - 1);
  yesterdayStart.setHours(0, 0, 0, 0);

  const yesterdayEnd = new Date(yesterdayStart);
  yesterdayEnd.setHours(23, 59, 59, 999);

  const last7DaysStart = new Date(now);
  last7DaysStart.setDate(now.getDate() - 7);
  last7DaysStart.setHours(0, 0, 0, 0);

  historyList.value.forEach((item) => {
    const itemDate = new Date(item.timestamp);

    if (itemDate >= todayStart && itemDate <= todayEnd) {
      today.push(item);
    } else if (itemDate >= yesterdayStart && itemDate <= yesterdayEnd) {
      yesterday.push(item);
    } else if (itemDate >= last7DaysStart) {
      last7Days.push(item);
    } else {
      older.push(item);
    }
  });

  if (today.length > 0) {
    groups.push({ isGroup: true, title: "今天" });
    groups.push(...today.map((item) => ({ ...item, isGroup: false })));
  }

  if (yesterday.length > 0) {
    groups.push({ isGroup: true, title: "昨天" });
    groups.push(...yesterday.map((item) => ({ ...item, isGroup: false })));
  }

  if (last7Days.length > 0) {
    groups.push({ isGroup: true, title: "近7天" });
    groups.push(...last7Days.map((item) => ({ ...item, isGroup: false })));
  }

  if (older.length > 0) {
    groups.push({ isGroup: true, title: "更久之前" });
    groups.push(...older.map((item) => ({ ...item, isGroup: false })));
  }

  return groups;
});

const formatTime = (timestamp) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffTime = now - date;

  // 小于1小时
  if (diffTime < 3600000) {
    const minutes = Math.floor(diffTime / 60000);
    return minutes <= 1 ? "刚刚" : `${minutes}分钟前`;
  }

  // 小于24小时
  if (diffTime < 86400000) {
    const hours = Math.floor(diffTime / 3600000);
    return `${hours}小时前`;
  }

  // 小于7天
  if (diffTime < 604800000) {
    const days = Math.floor(diffTime / 86400000);
    return `${days}天前`;
  }

  // 超过7天显示具体日期
  return `${date.getMonth() + 1}月${date.getDate()}日`;
};

const goBack = () => {
  router.back();
};

const createNewChat = () => {
  window.dispatchEvent(new CustomEvent("createNewChat"));
  router.push("/chat");
};

const openChat = (chat) => {
  router.push(`/chat/${chat.id}`);
};

const saveTitleEdit = async () => {
  if (!editingId.value || !editingTitle.value.trim()) {
    return false;
  }

  try {
    const originalItem = historyList.value.find(
      (item) => item.id === editingId.value
    );
    const originalTitle = originalItem ? originalItem.title : "";
    const newTitle = editingTitle.value.trim();

    if (originalTitle === newTitle) {
      editingId.value = null;
      editingTitle.value = "";
      return true;
    }

    await saveConversation({
      userId: configStore.userId,
      conversationId: editingId.value,
      title: newTitle,
    });

    if (originalItem) {
      originalItem.title = newTitle;
    }

    editingId.value = null;
    editingTitle.value = "";

    return true;
  } catch (error) {
    message.error("编辑失败：" + error.message);
    return false;
  }
};

const editChat = (chat) => {
  editingId.value = chat.id;
  editingTitle.value = chat.title;
  const dialogRef = dialog.create({
    title: "编辑对话标题",
    content: () => {
      return h("div", { style: "margin: 20px 0 10px;" }, [
        h(NInput, {
          value: editingTitle.value,
          placeholder: "请输入对话标题",
          ref: editInput,
          onInput: (value) => {
            editingTitle.value = value;
          },
          onKeyup: (e) => {
            if (e.code === "Enter") {
              if (saveTitleEdit()) {
                dialogRef.destroy();
              }
            }
          },
        }),
      ]);
    },
    positiveText: "保存",
    negativeText: "取消",
    onPositiveClick: () => saveTitleEdit(),
    showIcon: false,
    style: "height: 180px; border-radius: 10px; overflow: hidden;",
    titleStyle: "font-weight: 600;",
    contentStyle: "font-size: 1rem; margin-bottom: 0px;",
    positiveButtonProps: {
      type: "success",
      style:
        "height: 34px; border-radius: 8px; margin-top: 10px;padding: 1.3rem 1.5rem;",
    },
    negativeButtonProps: {
      style:
        "height: 34px; border-radius: 8px; margin-top: 10px;padding: 1.3rem 1.5rem;",
    },
  });
};

// 删除对话
const deleteChat = async (chat) => {
  dialog.warning({
    title: "确定删除对话？",
    content: "删除后，聊天记录将不可恢复。",
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
    style: "height: 160px; border-radius: 10px; overflow: hidden;",
    titleStyle: "font-weight: 600;",
    contentStyle: "font-size: 1rem; margin-bottom: 0px;",
    positiveButtonProps: {
      type: "error",
      style:
        "height: 34px; border-radius: 8px; margin-top: 20px;padding: 1.3rem 1.5rem;",
    },
    negativeButtonProps: {
      style:
        "height: 34px; border-radius: 8px; margin-top: 20px;padding: 1.3rem 1.5rem;",
    },
    onPositiveClick: async () => {
      try {
        await deleteConversation({
          conversationId: chat.id,
          userId: configStore.userId,
        });

        historyList.value = historyList.value.filter(
          (item) => item.id !== chat.id
        );
        popoverShowMap.value[chat.id] = false;
      } catch (error) {
        message.error("删除失败: " + (error.message || "未知错误"));
      }
    },
  });
};

// 加载历史对话列表
const loadHistoryList = async () => {
  loading.value = true;
  historyList.value = [];

  try {
    const res = await getConversations({
      userId: configStore.userId,
      includeDetails: true,
    });

    if (res.code === 200 && res.data) {
      const conversations = res.data.conversations || [];

      historyList.value = conversations.map((item) => ({
        id: item.id,
        title: item.title,
        preview:
          item.content && item.content.length
            ? extractPreview(item.content[0])
            : "打开对话",
        timestamp: new Date(item.updatedAt).getTime(),
      }));
    } else {
      historyList.value = [];
    }
  } catch (error) {
    historyList.value = [];
  } finally {
    loading.value = false;
  }
};

// 从对话内容中提取预览文本
const extractPreview = (content) => {
  try {
    const messages = JSON.parse(content);
    for (const msg of messages) {
      if (
        msg.role === "assistant" &&
        msg.content &&
        msg.content[0] &&
        msg.content[0].data
      ) {
        let text = msg.content[0].data;
        if (text.length > 200) {
          text = text.substring(0, 200) + "...";
        }
        const html = md.render(text);
        const temp = document.createElement("div");
        temp.innerHTML = html;
        return temp.textContent || temp.innerText || text;
      }
    }
    return "打开对话";
  } catch (error) {
    return "打开对话";
  }
};

onMounted(() => {
  loadHistoryList();
});
</script>

<style scoped lang="less">
.history-dialog {
  padding: 1.5rem;
  padding-bottom: 1rem;
  height: 100%;
  overflow-y: auto;
  background-color: var(--background-color);
  color: var(--text-color);
  position: relative;
  display: flex;
  flex-direction: column;

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

  .history-header {
    h2 {
      margin: 0 0 0.75rem 0;
      font-size: 24px;
      font-weight: 600;
      color: var(--text-color);
    }

    .history-count {
      font-size: 14px;
      color: var(--text-color);
      margin-bottom: 16px;
    }
  }

  .history-content {
    width: 70rem;
    border-radius: 12px;
    padding: 1.5rem;
    min-height: 400px;
    margin: 0 auto;
    flex: 1;
    overflow: hidden;

    .history-list {
      height: 100%;
      ::v-deep(.n-scrollbar-rail) {
        display: none;
      }
    }

    .time-group {
      padding: 42px 0 4px 8px;

      .group-title {
        font-size: 1rem;
        color: var(--text-color);
        font-weight: 600;
      }
    }

    .history-item {
      padding: 16px 20px;
      border-bottom: 1px solid rgba(128, 128, 128, 0.1);
      cursor: pointer;
      transition: background-color 0.2s;

      .history-item-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8px;

        .chat-icon {
          opacity: 0.7;
          flex-shrink: 0;
          margin-right: 8px;
        }

        .history-title {
          font-size: 1.2rem;
          font-weight: 800;
          color: var(--text-color);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          flex: 1;
          display: flex;
          align-items: center;

          &:hover {
            color: var(--primary-color);
          }
        }
      }

      .history-preview {
        font-size: 1rem;
        color: var(--text-color);
        line-height: 1.4;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
        margin-bottom: 8px;
        opacity: 0.6;
      }

      .history-time {
        font-size: 0.75rem;
        color: var(--text-color);
        opacity: 0.6;
      }
    }

    .history-empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      .empty-icon {
        margin-bottom: 1rem;
        opacity: 0.5;
      }

      .empty-text {
        font-size: 14px;
        opacity: 0.6;
        max-width: 25rem;
        margin-bottom: 1rem;
      }
      :deep(.n-button) {
        border-radius: 10px;
        padding: 1.3rem 1.5rem;
      }
    }

    .loading-spin {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 80vh;
    }
  }
}
</style>

<style lang="less">
@import "../styles/messagePopover.less";
</style>
