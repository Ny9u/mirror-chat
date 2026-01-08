<template>
  <div
    class="sidebar-container"
    :class="{ collapsed: configStore.sidebarCollapsed }"
  >
    <div class="sidebar">
      <div class="sidebar-header">
        <div
          class="toggle-btn"
          :class="{ expanded: !configStore.sidebarCollapsed }"
          @click="toggleSidebar"
        >
          <n-icon
            v-if="configStore.sidebarCollapsed"
            class="toggle-icon"
            size="20"
          >
            <LayoutSidebarLeftExpand />
          </n-icon>
          <div
            v-else
            :class="{
              logo: configStore.theme === 'dark',
              'logo-light': configStore.theme === 'light',
            }"
          ></div>
        </div>
        <div
          class="sidebar-title"
          :class="{ 'sidebar-title-hidden': configStore.sidebarCollapsed }"
        >
          Mirror Chat
        </div>
      </div>

      <div class="divider"></div>

      <div class="sidebar-content">
        <div class="menu-section">
          <div class="menu-item" @click="createNewChat">
            <n-icon class="menu-icon" size="20">
              <MessageCircle />
            </n-icon>
            <div
              class="menu-text"
              :class="{ 'menu-text-hidden': configStore.sidebarCollapsed }"
            >
              新建对话
            </div>
          </div>
          <div class="menu-item" @click="navigateToCollection">
            <n-icon class="menu-icon" size="20">
              <Bookmark />
            </n-icon>
            <div
              class="menu-text"
              :class="{ 'menu-text-hidden': configStore.sidebarCollapsed }"
            >
              收藏夹
            </div>
          </div>
          <div class="menu-item" @click="navigateToKnowledge">
            <n-icon class="menu-icon" size="20">
              <Book />
            </n-icon>
            <div
              class="menu-text"
              :class="{ 'menu-text-hidden': configStore.sidebarCollapsed }"
            >
              知识库
            </div>
          </div>
        </div>

        <div class="divider"></div>

        <div
          class="history-section"
          :class="{ 'history-section-hidden': configStore.sidebarCollapsed }"
        >
          <div class="history-header">
            <div class="history-title">历史对话</div>
            <n-icon class="history-icon" size="16" @click="navigateToHistory">
              <Clock />
            </n-icon>
          </div>
          <div class="history-list">
            <div
              v-for="item in historyList"
              :key="item.id"
              class="history-item"
              :class="{ active: item.id === configStore.chatId }"
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

        <div
          class="collapsed-history-icon"
          :class="{
            'collapsed-history-icon-hidden': !configStore.sidebarCollapsed,
          }"
          @click="navigateToHistory"
          title="历史对话"
        >
          <n-icon class="menu-icon" size="20">
            <Clock />
          </n-icon>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, h, onBeforeUnmount, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import { NIcon, NInput, useDialog, useMessage } from "naive-ui";
import {
  MessageCircle,
  Bookmark,
  Book,
  Clock,
  Edit,
  Trash,
  AlertTriangle,
  LayoutSidebarLeftExpand,
} from "@vicons/tabler";
import { useConfigStore } from "@/stores/configStore";
import { useHistoryStore } from "@/stores/historyStore";
import { formatDistanceToNow } from "date-fns";
import { zhCN } from "date-fns/locale";
import {
  saveConversation,
  getConversations,
  getConversationDetail,
  deleteConversation,
} from "@/services/user.js";

const router = useRouter();
const route = useRoute();
const configStore = useConfigStore();
const historyStore = useHistoryStore();
const dialog = useDialog();
const message = useMessage();
const editingId = ref(null);
const editingTitle = ref("");
const editInput = ref(null);

const historyList = computed(() => historyStore.historyList);

const formatTime = (date) => {
  return formatDistanceToNow(date, { addSuffix: true, locale: zhCN });
};

const toggleSidebar = () => {
  configStore.toggleSidebar();
};

const fetchHistoryList = async (forceRefresh = false) => {
  try {
    if (historyStore.isHistoryListLoaded && !forceRefresh) {
      return;
    }

    const res = await getConversations({ userId: configStore.userId });
    if (res.code === 200 && res.data) {
      historyStore.setHistoryList(
        res.data.conversations.map((item) => ({
          id: item.id,
          title: item.title,
          updateTime: new Date(item.updatedAt),
        }))
      );
      historyStore.setHistoryListLoaded(true);
    } else {
      historyStore.setHistoryList([]);
      throw new Error(res.message);
    }
  } catch (error) {
    historyStore.setHistoryList([]);
    throw error;
  }
};

const selectHistory = async (id) => {
  if (id === configStore.chatId) {
    return;
  }
  configStore.chatId = id;
  loadConversation(id);
};

const loadConversation = async (id) => {
  try {
    const res = await getConversationDetail({
      conversationId: id,
      userId: configStore.userId,
    });
    if (res.code === 200 && res.data) {
      let conversationData;
      if (Array.isArray(res.data.content)) {
        conversationData = [
          {
            role: "system",
            content: "你是一个专业、精准、高效的智能问答助手,名字叫Mirror。",
          },
          ...res.data.content[0],
        ];
      } else {
        conversationData = [
          {
            role: "system",
            content: "你是一个专业、精准、高效的智能问答助手,名字叫Mirror。",
          },
          ...JSON.parse(res.data.content[0]),
        ];
      }

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

const navigateToKnowledge = () => {
  if (!configStore.userId) {
    message.warning("请先登录后再使用知识库");
    return;
  }
  router.push("/knowledge");
};

const navigateToHistory = () => {
  router.push("/chat/history");
};

const createNewChat = () => {
  configStore.chatId = null;
  fetchHistoryList(true);
  window.dispatchEvent(new CustomEvent("clearChatHistory"));
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
      historyStore.updateHistoryListItem(editingId.value, { title: newTitle });
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

        historyStore.removeFromHistoryList(id);

        if (configStore.chatId === id) {
          configStore.chatId = null;
          window.dispatchEvent(new CustomEvent("clearChatHistory"));
        }

        fetchHistoryList(true);
      } catch (error) {
        message.error("删除对话失败:", error.message);
      }
    },
  });
};

const handleClearHistoryList = () => {
  historyStore.setHistoryList([]);
  configStore.chatId = null;
  historyStore.setHistoryListLoaded(false);
};

onMounted(() => {
  const conversationId = route.params.id;
  if (conversationId) {
    configStore.chatId = conversationId;
    loadConversation(conversationId);
  }

  if (configStore.userId) {
    fetchHistoryList();
  }

  watch(
    () => configStore.userId,
    (newUserId, oldUserId) => {
      if (newUserId && !oldUserId) {
        fetchHistoryList();
      } else if (!newUserId && oldUserId) {
        historyStore.setHistoryList([]);
        historyStore.setHistoryListLoaded(false);
        configStore.chatId = null;
      }
    }
  );

  window.addEventListener("createNewChat", createNewChat);
  window.addEventListener("clearHistoryList", handleClearHistoryList);
});

onBeforeUnmount(() => {
  window.removeEventListener("createNewChat", createNewChat);
  window.removeEventListener("clearHistoryList", handleClearHistoryList);
});
</script>

<style scoped lang="less">
// 动画曲线定义
@ease-smooth: cubic-bezier(0.4, 0, 0.2, 1);
@ease-bounce: cubic-bezier(0.34, 1.56, 0.64, 1);
@ease-out-expo: cubic-bezier(0.19, 1, 0.22, 1);
@transition-duration: 0.35s;

.sidebar-container {
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  z-index: 1000;
  transition: width @transition-duration @ease-out-expo;

  .sidebar {
    position: absolute;
    top: 0;
    left: 0;
    width: 16.75rem;
    height: 100vh;
    background-color: var(--sidebar-color);
    box-shadow: 1px 0 3px rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column;
    transition: width @transition-duration @ease-out-expo;
    will-change: width;

    .sidebar-header {
      display: flex;
      align-items: center;
      padding: 0.8rem 0;
      padding-left: 1.2rem;
      user-select: none;
      height: 3.6rem;
      box-sizing: border-box;
      transition: padding @transition-duration @ease-smooth;

      .toggle-btn {
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        height: 2.5rem;
        box-sizing: border-box;
        border-radius: 8px;
        transition: all 0.4s @ease-smooth;
        flex-shrink: 0;

        &:hover {
          background-color: rgba(0, 0, 0, 0.05);
          transform: scale(1.05);
        }

        &:active {
          transform: scale(0.95);
        }

        &.expanded {
          cursor: default;

          &:hover {
            background-color: transparent;
            transform: none;
          }

          &:active {
            transform: none;
          }
        }

        .toggle-icon {
          color: var(--text-color);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.4s @ease-bounce;
        }

        &:hover .toggle-icon {
          transform: translateX(2px);
        }

        .logo,
        .logo-light {
          width: 2rem;
          height: 2rem;
          background-size: contain;
          background-repeat: no-repeat;
          background-position: center;
          transition: transform 0.4s @ease-smooth;
        }

        .logo {
          background-image: url("@/assets/logo.svg");
        }

        .logo-light {
          background-image: url("@/assets/logo_dark.svg");
        }
      }

      .sidebar-title {
        font-size: 1.25rem;
        font-weight: 600;
        color: var(--text-color);
        margin-left: 0.8rem;
        white-space: nowrap;
        overflow: hidden;
        max-width: 10rem;
        transition: opacity @transition-duration @ease-smooth,
          max-width @transition-duration @ease-smooth,
          margin @transition-duration @ease-smooth;

        &.sidebar-title-hidden {
          opacity: 0;
          max-width: 0;
          margin-left: 0;
        }
      }
    }

    .divider {
      height: 1px;
      margin: 0 1rem;
      background-color: rgba(128, 128, 128, 0.2);
      transition: margin @transition-duration @ease-smooth;
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
          height: 2.5rem;
          padding: 0 0.75rem;
          margin: 0 0.8rem;
          cursor: pointer;
          transition: all 0.4s @ease-smooth;
          border-radius: 8px;
          color: var(--text-color);
          user-select: none;
          box-sizing: border-box;
          position: relative;
          overflow: hidden;

          // 波纹效果背景
          &::before {
            content: "";
            position: absolute;
            top: 50%;
            left: 50%;
            width: 0;
            height: 0;
            border-radius: 50%;
            background-color: rgba(0, 0, 0, 0.08);
            transform: translate(-50%, -50%);
            transition: width 0.4s @ease-smooth, height 0.4s @ease-smooth;
          }

          &:hover {
            background-color: rgba(0, 0, 0, 0.05);
            transform: translateX(4px);

            .menu-icon {
              transform: scale(1.1);
            }
          }

          &:active {
            transform: translateX(4px) scale(0.98);

            &::before {
              width: 200%;
              height: 200%;
            }
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
            flex-shrink: 0;
            width: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: transform 0.4s @ease-bounce, margin 0.4s @ease-smooth;
          }

          &:first-child .menu-icon {
            color: var(--primary-color);
          }

          .menu-text {
            font-size: 14px;
            color: var(--text-color);
            white-space: nowrap;
            overflow: hidden;
            max-width: 10rem;
            transition: opacity @transition-duration @ease-smooth,
              max-width @transition-duration @ease-smooth;

            &.menu-text-hidden {
              opacity: 0;
              max-width: 0;
            }
          }

          &:first-child .menu-text {
            color: var(--primary-color);
          }
        }
      }

      .history-section {
        padding: 0 0.625rem;
        overflow: hidden;
        transition: opacity @transition-duration @ease-smooth,
          max-height @transition-duration @ease-smooth,
          padding @transition-duration @ease-smooth;
        max-height: 100vh;

        &.history-section-hidden {
          opacity: 0;
          max-height: 0;
          padding: 0;
          pointer-events: none;
        }

        .history-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0rem 0.8rem;
          padding-top: 0.8rem;
          padding-bottom: 0.4rem;
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
            transition: opacity 0.4s @ease-smooth;
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
            transition: all 0.4s @ease-smooth;

            &:hover {
              background-color: rgba(0, 0, 0, 0.1);
              transform: scale(1.1);
            }
          }
        }

        .history-header:hover .history-icon {
          opacity: 0.3;
        }

        .history-header:hover .history-icon:hover {
          opacity: 0.6;
        }

        .history-list {
          .history-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin: 0.5rem 0;
            padding: 0.5rem 0.8rem;
            border-radius: 12px;
            cursor: pointer;
            transition: all 0.4s @ease-smooth;
            position: relative;

            &:hover {
              background-color: rgba(0, 0, 0, 0.05);
              transform: translateX(4px);

              .history-item-actions {
                display: flex;
                opacity: 1;
              }
            }

            &:active {
              transform: translateX(4px) scale(0.98);
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
                transition: color 0.4s @ease-smooth;
              }

              .history-item-time {
                font-size: 12px;
                color: rgba(128, 128, 128, 0.8);
                transition: color 0.4s @ease-smooth;
              }
            }

            .history-item-actions {
              margin-left: 0.5rem;
              display: flex;
              gap: 0.25rem;
              opacity: 0;
              transition: opacity 0.4s @ease-smooth;

              .history-action-icon {
                cursor: pointer;
                color: var(--text-color);
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.4s @ease-bounce;
                padding: 0.25rem;
                border-radius: 4px;

                &:hover {
                  transform: scale(1.2);
                }

                &.edit-icon:hover {
                  color: var(--primary-color);
                  background-color: rgba(0, 255, 119, 0.1);
                }

                &.delete-icon:hover {
                  color: #d03050;
                  background-color: rgba(208, 48, 80, 0.1);
                }
              }
            }
          }
        }
      }

      .collapsed-history-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 2.5rem;
        padding: 0 0.75rem;
        margin: 0 0.8rem;
        cursor: pointer;
        transition: background-color 0.4s @ease-smooth,
          transform 0.4s @ease-smooth;
        border-radius: 8px;
        color: var(--text-color);
        box-sizing: border-box;
        opacity: 1;

        &.collapsed-history-icon-hidden {
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.1s @ease-smooth;
        }

        &:hover {
          background-color: rgba(0, 0, 0, 0.05);
          transform: scale(1.05);

          .menu-icon {
            transform: scale(1.1);
          }
        }

        &:active {
          transform: scale(0.95);
        }

        .menu-icon {
          margin-right: 0;
          color: var(--text-color);
          transition: transform 0.4s @ease-bounce;
        }
      }
    }
  }

  &.collapsed .sidebar {
    width: 4.5rem;

    .sidebar-header {
      display: flex;
      justify-content: center;
      padding: 0.8rem 0;

      .toggle-btn {
        padding: 0 0.8rem;
      }
    }

    .divider {
      margin: 0 0.8rem;
    }

    .menu-section {
      .menu-item {
        justify-content: center;
        margin: 0 0.8rem;
        padding: 0;
        height: 2.5rem;

        &:hover {
          transform: scale(1.05);
        }

        &:active {
          transform: scale(0.95);
        }

        .menu-icon {
          margin-right: 0;
        }
      }
    }

    .collapsed-history-icon {
      justify-content: center;
      margin: 1rem 0.8rem;
      padding: 0rem;
      height: 2.5rem;

      .menu-icon {
        margin-right: 0;
      }
    }
  }
}
</style>
