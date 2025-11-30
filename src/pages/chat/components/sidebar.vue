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
            <div class="menu-item">
              <n-icon class="menu-icon" size="20">
                <MessageCircle />
              </n-icon>
              <div class="menu-text">新建对话</div>
            </div>
            <div class="menu-item">
              <n-icon class="menu-icon" size="20">
                <Bookmark />
              </n-icon>
              <div class="menu-text">我的收藏</div>
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
              <n-icon class="history-icon search-icon" size="16">
                <Search />
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
                  <n-icon class="history-action-icon edit-icon" size="16">
                    <Edit />
                  </n-icon>
                  <n-icon class="history-action-icon delete-icon" size="16">
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
import { ref, computed, onMounted } from "vue";
import { NIcon } from "naive-ui";
import {
  MessageCircle,
  Bookmark,
  Book,
  Search,
  Edit,
  Trash,
} from "@vicons/tabler";
import { useConfigStore } from "@/stores/configStore";
import { formatDistanceToNow } from "date-fns";
import { zhCN } from "date-fns/locale";

const configStore = useConfigStore();
const isVisible = ref(false);
let hideTimeout = null;
const activeHistoryId = ref(null);

// 模拟历史对话数据
const historyList = ref([
  {
    id: 1,
    title: "如何学习Vue.js框架",
    updateTime: new Date(Date.now() - 1000 * 60 * 30), // 30分钟前
  },
  {
    id: 2,
    title: "JavaScript异步编程详解",
    updateTime: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2小时前
  },
  {
    id: 3,
    title: "前端性能优化技巧",
    updateTime: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1天前
  },
  {
    id: 4,
    title: "React Hooks使用指南",
    updateTime: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3天前
  },
  {
    id: 5,
    title: "CSS Grid布局完全指南",
    updateTime: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7), // 1周前
  },
]);

// 格式化时间
const formatTime = (date) => {
  return formatDistanceToNow(date, { addSuffix: true, locale: zhCN });
};

// 选择历史对话
const selectHistory = (id) => {
  activeHistoryId.value = id;
  // 这里可以添加加载历史对话的逻辑
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
    top: 0;
    left: 0;
    width: 9.375rem;
    height: 100vh;
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
