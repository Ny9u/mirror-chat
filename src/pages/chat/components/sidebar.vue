<template>
  <div class="sidebar-container">
    <div class="trigger-zone" @mouseenter="handleMouseEnter"></div>

    <transition name="slide">
      <div
        v-show="isVisible"
        class="sidebar"
        @mouseenter="handleSidebarMouseEnter"
        @mouseleave="handleSidebarMouseLeave"
      >
        <div class="sidebar-header">
          <div class="sidebar-title">功能</div>
        </div>

        <div class="divider"></div>

        <div class="sidebar-content">
          <div class="menu-section">
            <div class="menu-item" @click="createNewChat">
              <n-icon class="menu-icon" size="20">
                <MessageCircle />
              </n-icon>
              <div class="menu-text">新建对话</div>
            </div>
            <div class="menu-item" @click="navigateToCollection">
              <n-icon class="menu-icon" size="20">
                <Bookmark />
              </n-icon>
              <div class="menu-text">收藏夹</div>
            </div>
            <div class="menu-item">
              <n-icon class="menu-icon" size="20">
                <Book />
              </n-icon>
              <div class="menu-text">知识库</div>
            </div>
          </div>

          <div class="divider"></div>

          <div class="history-section">
            <div class="history-header">
              <div class="history-title">历史对话</div>
              <n-icon class="history-icon" size="16">
                <Clock />
              </n-icon>
            </div>
            <div class="history-list">
              <div
                v-for="item in historyList"
                :key="item.id"
                class="history-item"
                :class="{ active: item.id === activeHistoryId }"
                @click="selectHistory(item.id)"
              >
                <div class="history-item-content">
                  <div class="history-item-title">{{ item.title }}</div>
                  <div class="history-item-time">
                    {{ formatTime(item.updateTime) }}
                  </div>
                </div>
                <div class="history-item-actions">
                  <n-icon
                    class="history-action-icon edit-icon"
                    size="16"
                    @click.stop="handleEditTitle(item.id, item.title)"
                  >
                    <Edit />
                  </n-icon>
                  <n-icon
                    class="history-action-icon delete-icon"
                    size="16"
                    @click.stop="handleDeleteConversation(item.id)"
                  >
                    <Trash />
                  </n-icon>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, h, onBeforeUnmount } from "vue";
import { useRouter } from "vue-router";
import { NIcon, NInput, NButton, useDialog, useMessage } from "naive-ui";
import {
  MessageCircle,
  Bookmark,
  Book,
  Clock,
  Edit,
  Trash,
  AlertTriangle,
} from "@vicons/tabler";
import { useConfigStore } from "@/stores/configStore";
import { formatDistanceToNow } from "date-fns";
import { zhCN } from "date-fns/locale";
import {
  saveConversation,
  getConversations,
  getConversationDetail,
  deleteConversation,
} from "@/services/user.js";
import { generateTitle } from "@/services/titleService.js";

const router = useRouter();
const configStore = useConfigStore();
const dialog = useDialog();
const message = useMessage();
const isVisible = ref(false);
let hideTimeout = null;
const activeHistoryId = ref(null);
const historyList = ref([]);
const editingId = ref(null);
const editingTitle = ref("");
const editInput = ref(null);

const formatTime = (date) => {
  return formatDistanceToNow(date, { addSuffix: true, locale: zhCN });
};

const fetchHistoryList = async () => {
  try {
    const res = await getConversations({ userId: configStore.userId });
    if (res.code === 200 && res.data) {
      historyList.value = res.data.conversations.map((item) => ({
        id: item.id,
        title: item.title,
        updateTime: new Date(item.updatedAt),
      }));
    } else {
      historyList.value = [];
      throw new Error(res.message);
    }
  } catch (error) {
    historyList.value = [];
    throw error;
  }
};

const selectHistory = async (id) => {
  if (id === activeHistoryId.value) {
    return;
  }
  activeHistoryId.value = id;

  const currentChatHistory =
    JSON.parse(sessionStorage.getItem("chatHistory")) || [];

  const currentConversationId =
    currentChatHistory.length > 0 ? currentChatHistory[0].conversationId : null;

  // 当前聊天记录为空时，直接加载历史对话
  if (currentChatHistory.length <= 1) {
    loadConversation(id);
    return;
  }

  loadConversation(id);

  (async () => {
    try {
      // 当前聊天记录不为空，且没有conversationId时，保存当前聊天
      if (!currentConversationId) {
        const title = await generateTitle(
          currentChatHistory.slice(
            currentChatHistory.length - 1,
            currentChatHistory.length
          )
        );
        await saveConversation({
          userId: configStore.userId,
          title: title,
          content: JSON.stringify(currentChatHistory),
        });
      }
      // 当前聊天记录不为空，且有conversationId时，保存当前聊天时带上conversationId
      else {
        const currentHistoryItem = historyList.value.find(
          (item) => item.id === currentConversationId
        );
        const title = currentHistoryItem
          ? currentHistoryItem.title
          : await generateTitle(
              currentChatHistory.slice(
                currentChatHistory.length - 1,
                currentChatHistory.length
              )
            );

        await saveConversation({
          userId: configStore.userId,
          conversationId: currentConversationId,
          title: title,
          content: JSON.stringify(currentChatHistory),
        });
      }
      // 保存完成后刷新历史列表
      fetchHistoryList();
    } catch (error) {
      throw new Error("保存对话失败:", error.message);
    }
  })();
};

// 加载历史对话的独立函数
const loadConversation = async (id) => {
  try {
    const res = await getConversationDetail({
      conversationId: id,
      userId: configStore.userId,
    });
    if (res.code === 200 && res.data) {
      let conversationData = JSON.parse(res.data.content);

      sessionStorage.setItem("chatHistory", JSON.stringify(conversationData));
      window.dispatchEvent(
        new CustomEvent("loadChatHistory", {
          detail: { data: conversationData },
        })
      );
    }
  } catch (error) {
    throw new Error("加载对话详情失败:" + error.message);
  }
};

const navigateToCollection = () => {
  if (!configStore.userId) {
    message.warning("请先登录后再使用收藏夹");
    return;
  }
  router.push("/collection");
};

const createNewChat = () => {
  const chatHistory = JSON.parse(sessionStorage.getItem("chatHistory")) || [];

  if (configStore.userId && chatHistory.length > 1) {
    (async () => {
      try {
        const currentConversationId =
          chatHistory.length > 0 ? chatHistory[0].conversationId : null;

        const saveParams = {
          userId: configStore.userId,
          content: JSON.stringify(chatHistory),
        };

        if (currentConversationId) {
          const currentHistoryItem = historyList.value.find(
            (item) => item.id === currentConversationId
          );
          saveParams.conversationId = currentConversationId;
          saveParams.title = currentHistoryItem
            ? currentHistoryItem.title
            : await generateTitle(
                chatHistory.slice(chatHistory.length - 1, chatHistory.length)
              );
        } else {
          saveParams.title = await generateTitle(
            chatHistory.slice(chatHistory.length - 1, chatHistory.length)
          );
        }

        await saveConversation(saveParams);
        fetchHistoryList();
      } catch (error) {
        throw new Error("创建新对话失败:" + error.message);
      }
    })();
  }

  activeHistoryId.value = null;
  window.dispatchEvent(new CustomEvent("clearChatHistory"));
};

const handleMouseEnter = () => {
  if (hideTimeout) {
    clearTimeout(hideTimeout);
    hideTimeout = null;
  }
  isVisible.value = true;
};

const handleSidebarMouseEnter = () => {
  if (hideTimeout) {
    clearTimeout(hideTimeout);
    hideTimeout = null;
  }
};

const handleSidebarMouseLeave = () => {
  hideTimeout = setTimeout(() => {
    isVisible.value = false;
  }, 300);
};

const handleEditTitle = (id, title) => {
  editingId.value = id;
  editingTitle.value = title;

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
    message.error("编辑失败:", error.message);
    return false;
  }
};

const handleDeleteConversation = (id) => {
  const item = historyList.value.find((item) => item.id === id);
  const title = item ? item.title : "该对话";

  dialog.warning({
    title: "确定删除对话？",
    content: `确定要删除"${title}"吗？删除后，聊天记录将不可恢复。`,
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
        deleteConversation({
          conversationId: id,
          userId: configStore.userId,
        });

        historyList.value = historyList.value.filter((item) => item.id !== id);

        if (activeHistoryId.value === id) {
          activeHistoryId.value = null;
          sessionStorage.removeItem("chatHistory");
          window.dispatchEvent(new CustomEvent("clearChatHistory"));
        }
      } catch (error) {
        message.error("删除对话失败:", error.message);
      }
    },
  });
};

onMounted(() => {
  fetchHistoryList();
  window.addEventListener("createNewChat", () => {
    createNewChat();
  });
  window.addEventListener("clearHistoryList", () => {
    historyList.value = [];
    activeHistoryId.value = null;
  });
});

onBeforeUnmount(() => {
  window.removeEventListener("createNewChat", () => {
    createNewChat();
  });
  window.removeEventListener("clearHistoryList", () => {
    historyList.value = [];
    activeHistoryId.value = null;
  });
});
</script>

<style scoped lang="less">
.sidebar-container {
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  z-index: 1000;
  pointer-events: none;

  .trigger-zone {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    left: 0;
    width: 9.375rem;
    height: 90vh;
    pointer-events: auto;
  }

  .sidebar {
    position: absolute;
    top: 3.5rem;
    left: 1.25rem;
    width: 16.75rem;
    height: 90vh;
    background-color: var(--sidebar-color);
    border-radius: 12px;
    box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
    pointer-events: auto;
    display: flex;
    flex-direction: column;

    .sidebar-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.1rem 1.4rem;
      user-select: none;

      .sidebar-title {
        font-size: 1.25rem;
        font-weight: 600;
        color: var(--text-color);
      }
    }

    .divider {
      height: 1px;
      margin: 0 1rem;
      background-color: rgba(128, 128, 128, 0.2);
    }

    .sidebar-content {
      flex: 1;
      overflow-y: auto;
      scrollbar-width: none;
      -ms-overflow-style: none;
      &::-webkit-scrollbar {
        display: none;
      }

      .menu-section {
        padding: 1rem 0;

        .menu-item {
          display: flex;
          align-items: center;
          padding: 0.625rem 0.5rem;
          margin: 0 0.8rem;
          cursor: pointer;
          transition: all 0.2s ease;
          border-radius: 8px;
          color: var(--text-color);
          user-select: none;

          &:hover {
            background-color: rgba(0, 0, 0, 0.05);
          }

          &:first-child {
            background-color: rgba(0, 255, 119, 0.1);
          }

          &:first-child:hover {
            background-color: rgba(0, 255, 119, 0.15);
          }

          .menu-icon {
            margin-right: 0.75rem;
            color: var(--text-color);
          }

          &:first-child .menu-icon {
            color: var(--primary-color);
          }

          .menu-text {
            font-size: 14px;
            color: var(--text-color);
          }

          &:first-child .menu-text {
            color: var(--primary-color);
          }
        }
      }

      .history-section {
        padding: 0 0.625rem;

        .history-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 0.8rem;
          user-select: none;
          position: sticky;
          top: 0;
          background-color: var(--sidebar-color);
          z-index: 10;

          .history-title {
            font-size: 14px;
            font-weight: 600;
            color: var(--text-color);
            opacity: 0.3;
          }

          .history-icon {
            width: 1.6rem;
            height: 1.6rem;
            border-radius: 50%;
            cursor: pointer;
            color: var(--text-color);
            opacity: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: opacity 0.2s ease;
          }
        }

        .history-header:hover .history-icon {
          opacity: 0.3;
        }

        .history-header:hover .history-icon:hover {
          background-color: rgba(0, 0, 0, 0.5);
        }

        .history-list {
          .history-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0.625rem;
            border-radius: 8px;
            cursor: pointer;
            transition: background-color 0.2s;

            &:hover {
              background-color: rgba(0, 0, 0, 0.05);

              .history-item-actions {
                display: flex;
              }
            }

            &.active {
              background-color: rgba(0, 0, 0, 0.08);
            }

            .history-item-content {
              flex: 1;
              overflow: hidden;

              .history-item-title {
                font-size: 14px;
                color: var(--text-color);
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                margin-bottom: 0.25rem;
              }

              .history-item-time {
                font-size: 12px;
                color: rgba(128, 128, 128, 0.8);
              }
            }

            .history-item-actions {
              display: none;
              gap: 0.5rem;

              .history-action-icon {
                cursor: pointer;
                color: var(--text-color);
                display: flex;
                align-items: center;
                justify-content: center;
                transition: color 0.2s ease;

                &.edit-icon:hover {
                  color: var(--primary-color);
                }

                &.delete-icon:hover {
                  color: #d03050;
                }
              }
            }
          }
        }
      }
    }
  }
}
.slide-enter-active {
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.slide-leave-active {
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.slide-enter-from {
  transform: translateX(-100%);
  opacity: 0;
}

.slide-leave-to {
  transform: translateX(-100%);
  opacity: 0;
}
</style>
