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
          @mouseenter="toggleBtnHover = true"
          @mouseleave="toggleBtnHover = false"
        >
          <template v-if="configStore.sidebarCollapsed">
            <n-icon v-show="toggleBtnHover" class="toggle-icon" size="20">
              <LayoutSidebarLeftExpand />
            </n-icon>
            <div
              v-show="!toggleBtnHover"
              :class="{
                logo: configStore.theme === 'dark',
                'logo-light': configStore.theme === 'light',
              }"
            ></div>
          </template>
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
            <n-popover
              placement="right"
              trigger="hover"
              raw
              :show-arrow="false"
              :disabled="!configStore.sidebarCollapsed"
            >
              <template #trigger>
                <n-icon class="menu-icon" size="20">
                  <MessageCircle />
                </n-icon>
              </template>
              <span
                :style="{
                  backgroundColor: '#000000',
                  color: '#f1f2f8',
                  borderRadius: '8px',
                  marginLeft: '10px',
                  padding: '6px 12px',
                  fontSize: '14px',
                }"
                >新建对话</span
              >
            </n-popover>
            <div
              class="menu-text"
              :class="{ 'menu-text-hidden': configStore.sidebarCollapsed }"
            >
              新建对话
            </div>
          </div>
          <div class="menu-item" @click="navigateToCollection">
            <n-popover
              placement="right"
              trigger="hover"
              raw
              :show-arrow="false"
            >
              <template #trigger>
                <n-icon class="menu-icon" size="20">
                  <Bookmark />
                </n-icon>
              </template>
              <span
                :style="{
                  backgroundColor: '#000000',
                  color: '#f1f2f8',
                  borderRadius: '8px',
                  marginLeft: '10px',
                  padding: '6px 12px',
                  fontSize: '14px',
                }"
                >收藏夹</span
              >
            </n-popover>
            <div
              class="menu-text"
              :class="{ 'menu-text-hidden': configStore.sidebarCollapsed }"
            >
              收藏夹
            </div>
          </div>
          <div class="menu-item" @click="showRolePresets">
            <n-popover
              placement="right"
              trigger="hover"
              raw
              :show-arrow="false"
              :disabled="!configStore.sidebarCollapsed"
            >
              <template #trigger>
                <n-icon class="menu-icon" size="20">
                  <User />
                </n-icon>
              </template>
              <span
                :style="{
                  backgroundColor: '#000000',
                  color: '#f1f2f8',
                  borderRadius: '8px',
                  marginLeft: '10px',
                  padding: '6px 12px',
                  fontSize: '14px',
                }"
                >角色预设</span
              >
            </n-popover>
            <div
              class="menu-text"
              :class="{ 'menu-text-hidden': configStore.sidebarCollapsed }"
            >
              角色预设
            </div>
          </div>
          <div class="menu-item" @click="navigateToKnowledge">
            <n-popover
              placement="right"
              trigger="hover"
              raw
              :show-arrow="false"
              :disabled="!configStore.sidebarCollapsed"
            >
              <template #trigger>
                <n-icon class="menu-icon" size="20">
                  <Book />
                </n-icon>
              </template>
              <span
                :style="{
                  backgroundColor: '#000000',
                  color: '#f1f2f8',
                  borderRadius: '8px',
                  marginLeft: '10px',
                  padding: '6px 12px',
                  fontSize: '14px',
                }"
                >知识库</span
              >
            </n-popover>
            <div
              class="menu-text"
              :class="{ 'menu-text-hidden': configStore.sidebarCollapsed }"
            >
              知识库
            </div>
          </div>
        </div>

        <div class="divider"></div>

        <div class="history-section" v-show="!configStore.sidebarCollapsed">
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
            <div v-if="historyList.length === 0" class="history-empty">
              暂无对话记录
            </div>
          </div>
        </div>

        <div
          class="collapsed-history-icon"
          v-show="configStore.sidebarCollapsed"
          @click="navigateToHistory"
        >
          <n-popover placement="right" trigger="hover" raw :show-arrow="false">
            <template #trigger>
              <n-icon class="menu-icon" size="20">
                <Clock />
              </n-icon>
            </template>
            <span
              :style="{
                backgroundColor: '#000000',
                color: '#f1f2f8',
                borderRadius: '8px',
                marginLeft: '10px',
                padding: '6px 12px',
                fontSize: '14px',
              }"
              >查看全部历史对话</span
            >
          </n-popover>
        </div>
      </div>
    </div>
  </div>

  <n-modal
    v-model:show="showRoleDialog"
    preset="card"
    :style="{
      width: '800px',
      maxHeight: '80vh',
      borderRadius: '12px',
      overflow: 'hidden',
    }"
    :segmented="{
      content: 'soft',
      footer: 'soft',
    }"
    :show-icon="false"
    :bordered="false"
    size="huge"
    class="role-dialog"
    :closable="false"
  >
    <template #header>
      <div class="modal-header">
        <span style="font-weight: 600">角色预设</span>
        <n-icon
          class="modal-close-icon"
          :component="X"
          @click="showRoleDialog = false"
          size="1.6rem"
        />
      </div>
    </template>
    <div class="role-columns-container">
      <div class="current-role-section">
        <div class="section-header">
          <div class="section-title">当前角色</div>
        </div>
        <div class="current-role-item" v-if="currentRole">
          <div
            class="role-icon"
            :style="{
              backgroundColor: currentRole.avatarColor,
            }"
          >
            {{ currentRole.avatar }}
          </div>
          <div class="role-info">
            <div class="role-name">
              {{ currentRole.name }}
            </div>
            <div class="role-desc">
              {{ currentRole.desc }}
            </div>
          </div>
          <div class="role-check">
            <n-icon size="20" color="#00ff77">
              <Check />
            </n-icon>
          </div>
        </div>
      </div>

      <div class="system-roles-section">
        <div class="section-header">
          <div class="section-title">系统角色</div>
          <div class="pagination-controls">
            <n-button
              text
              size="small"
              :disabled="systemRolePage === 1"
              @click="prevSystemRolePage"
            >
              <template #icon>
                <n-icon><ChevronLeft /></n-icon>
              </template>
            </n-button>
            <span class="page-indicator"
              >{{ systemRolePage }} / {{ systemRoleTotalPages }}</span
            >
            <n-button
              text
              size="small"
              :disabled="systemRolePage === systemRoleTotalPages"
              @click="nextSystemRolePage"
            >
              <template #icon>
                <n-icon><ChevronRight /></n-icon>
              </template>
            </n-button>
          </div>
        </div>
        <div class="roles-grid">
          <div
            v-for="role in paginatedSystemRoles"
            :key="role.id"
            class="role-grid-item"
            :class="{ active: currentRole?.id === role.id }"
            @click="handleSelectRole(role)"
          >
            <div
              class="role-icon"
              :style="{ backgroundColor: role.avatarColor }"
            >
              {{ role.avatar }}
            </div>
            <div class="role-info">
              <div class="role-name">{{ role.name }}</div>
              <div class="role-desc">{{ role.desc }}</div>
            </div>
          </div>
        </div>
      </div>

      <div class="custom-roles-section">
        <div class="section-header">
          <div class="section-title">自定义角色</div>
          <div class="header-actions">
            <n-button
              text
              size="small"
              @click="openCreateRoleDialog"
              class="create-role-btn"
            >
              <template #icon>
                <n-icon><Plus /></n-icon>
              </template>
              新建
            </n-button>
            <div v-if="customRoleTotalPages > 1" class="pagination-controls">
              <n-button
                text
                size="small"
                :disabled="customRolePage === 1"
                @click="prevCustomRolePage"
              >
                <template #icon>
                  <n-icon><ChevronLeft /></n-icon>
                </template>
              </n-button>
              <span class="page-indicator"
                >{{ customRolePage }} / {{ customRoleTotalPages }}</span
              >
              <n-button
                text
                size="small"
                :disabled="customRolePage === customRoleTotalPages"
                @click="nextCustomRolePage"
              >
                <template #icon>
                  <n-icon><ChevronRight /></n-icon>
                </template>
              </n-button>
            </div>
          </div>
        </div>
        <div v-if="customRoles.length === 0" class="empty-roles">
          <div class="empty-icon">📝</div>
          <div class="empty-text">暂无自定义角色</div>
          <n-button
            text
            type="primary"
            @click="openCreateRoleDialog"
            size="small"
          >
            <template #icon>
              <n-icon><Plus /></n-icon>
            </template>
            创建第一个角色
          </n-button>
        </div>
        <div v-else class="roles-grid">
          <div
            v-for="role in paginatedCustomRoles"
            :key="role.id"
            class="role-grid-item custom-role-item"
            :class="{ active: currentRole?.id === role.id }"
            @click="handleSelectRole(role)"
          >
            <div
              class="role-icon"
              :style="{ backgroundColor: role.avatarColor }"
            >
              {{ role.avatar }}
            </div>
            <div class="role-info">
              <div class="role-name">{{ role.name }}</div>
              <div class="role-desc">{{ role.desc }}</div>
            </div>
            <div class="role-actions">
              <n-button
                text
                size="small"
                @click.stop="openEditRoleDialog(role)"
              >
                <template #icon>
                  <n-icon><Edit /></n-icon>
                </template>
              </n-button>
              <n-button
                text
                size="small"
                type="error"
                @click.stop="openDeleteRoleDialog(role)"
              >
                <template #icon>
                  <n-icon><Trash /></n-icon>
                </template>
              </n-button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </n-modal>

  <n-modal
    v-model:show="showCreateRoleDialog"
    preset="card"
    :style="{
      width: '580px',
      borderRadius: '12px',
      overflow: 'hidden',
    }"
    :segmented="{
      content: 'soft',
      footer: 'soft',
    }"
    :show-icon="false"
    :bordered="false"
    size="huge"
    class="create-role-modal"
    :closable="false"
  >
    <template #header>
      <div class="modal-header">
        <span style="font-weight: 600">{{
          isEditMode ? "编辑角色" : "创建角色"
        }}</span>
        <n-icon
          class="modal-close-icon"
          :component="X"
          @click="closeCreateRoleDialog"
          size="1.6rem"
        />
      </div>
    </template>
    <div class="create-role-form">
      <div class="form-item">
        <div class="form-label">角色名称</div>
        <n-input
          v-model:value="customRoleForm.name"
          placeholder="例如：心理咨询师"
          maxlength="20"
          show-count
          style="border-radius: 8px"
        />
      </div>

      <div class="form-item">
        <div class="form-label">角色描述</div>
        <n-input
          v-model:value="customRoleForm.desc"
          placeholder="简短描述这个角色的特点"
          maxlength="50"
          show-count
          style="border-radius: 8px"
        />
      </div>

      <div class="form-item">
        <div class="form-label">角色头像</div>
        <div class="icon-selector">
          <div
            v-for="icon in iconOptions"
            :key="icon"
            class="icon-option"
            :class="{ active: customRoleForm.icon === icon }"
            @click="customRoleForm.icon = icon"
          >
            {{ icon }}
          </div>
        </div>
      </div>

      <div class="form-item">
        <div class="form-label">头像颜色</div>
        <div class="color-selector">
          <div
            v-for="color in colorOptions"
            :key="color"
            class="color-option"
            :class="{ active: customRoleForm.color === color }"
            :style="{ backgroundColor: color }"
            @click="customRoleForm.color = color"
          >
            <n-icon v-if="customRoleForm.color === color" color="#fff">
              <Check />
            </n-icon>
          </div>
        </div>
      </div>

      <div class="form-item">
        <div class="form-label">系统提示词</div>
        <n-input
          v-model:value="customRoleForm.prompt"
          placeholder="定义角色的行为和语气"
          type="textarea"
          :rows="4"
          show-count
          style="border-radius: 8px"
        />
      </div>
    </div>
    <template #footer>
      <div style="display: flex; justify-content: flex-end; gap: 12px">
        <n-button
          @click="closeCreateRoleDialog"
          size="large"
          style="border-radius: 8px"
        >
          取消
        </n-button>
        <n-button
          type="primary"
          @click="saveCustomRole"
          size="large"
          style="border-radius: 8px"
        >
          {{ isEditMode ? "保存" : "创建" }}
        </n-button>
      </div>
    </template>
  </n-modal>
</template>

<script setup>
import { ref, computed, onMounted, h, onBeforeUnmount, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import {
  NIcon,
  NInput,
  NPopover,
  NModal,
  NButton,
  useDialog,
  useMessage,
} from "naive-ui";
import {
  MessageCircle,
  Bookmark,
  Book,
  Clock,
  Edit,
  Trash,
  AlertTriangle,
  LayoutSidebarLeftExpand,
  User,
  Check,
  ChevronLeft,
  ChevronRight,
  Plus,
  X,
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
  getSystemRoles,
  getUserRoles,
  getSelectedRole,
  createRole,
  updateRole,
  deleteRole,
  selectRole as selectRoleApi,
  clearRole,
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
const toggleBtnHover = ref(false);
const showRoleDialog = ref(false);
const showCreateRoleDialog = ref(false);
const systemRolePage = ref(1);
const customRolePage = ref(1);
const pageSize = 8;
const customRoleForm = ref({
  name: "",
  desc: "",
  icon: "🤖",
  color: "#00ff77",
  prompt: "",
});
const isEditMode = ref(false);
const editingRoleId = ref(null);

// 角色列表数据
const systemRoles = ref([]); // 系统角色
const customRoles = ref([]); // 用户自定义角色
const currentRole = ref(null); // 当前选中的角色
const rolesLoading = ref(false);

// 角色切换同步优化
let roleSelectDebounceTimer = null;
let pendingSyncRole = null;

// 系统角色（分页）
const paginatedSystemRoles = computed(() => {
  const start = (systemRolePage.value - 1) * pageSize;
  const end = start + pageSize;
  return systemRoles.value.slice(start, end);
});

// 自定义角色（分页）
const paginatedCustomRoles = computed(() => {
  const start = (customRolePage.value - 1) * pageSize;
  const end = start + pageSize;
  return customRoles.value.slice(start, end);
});

const systemRoleTotalPages = computed(() =>
  Math.max(1, Math.ceil(systemRoles.value.length / pageSize))
);

const customRoleTotalPages = computed(() =>
  Math.max(1, Math.ceil(customRoles.value.length / pageSize))
);

const prevSystemRolePage = () => {
  if (systemRolePage.value > 1) {
    systemRolePage.value--;
  }
};

const nextSystemRolePage = () => {
  if (systemRolePage.value < systemRoleTotalPages.value) {
    systemRolePage.value++;
  }
};

const prevCustomRolePage = () => {
  if (customRolePage.value > 1) {
    customRolePage.value--;
  }
};

const nextCustomRolePage = () => {
  if (customRolePage.value < customRoleTotalPages.value) {
    customRolePage.value++;
  }
};

const historyList = computed(() => historyStore.historyList);

// 获取系统角色列表
const fetchSystemRoles = async () => {
  try {
    const res = await getSystemRoles();
    if (res.code === 200 && res.data) {
      systemRoles.value = res.data.map((role) => ({
        id: role.id,
        name: role.name,
        desc: role.description,
        avatar: role.avatar || "🤖",
        avatarColor: role.avatarColor || "#00ff77",
        prompt: role.prompt,
      }));
    }
  } catch (error) {
    console.error("获取系统角色失败:", error);
  }
};

// 获取用户自定义角色列表
const fetchUserRoles = async () => {
  if (!configStore.userId) return;
  try {
    const res = await getUserRoles({ userId: configStore.userId });
    if (res.code === 200 && res.data) {
      customRoles.value = res.data.map((role) => ({
        id: role.id,
        name: role.name,
        desc: role.description,
        avatar: role.avatar || "🤖",
        avatarColor: role.avatarColor || "#00ff77",
        prompt: role.prompt,
      }));
    }
  } catch (error) {
    console.error("获取自定义角色失败:", error);
  }
};

// 获取当前选中的角色
const fetchSelectedRole = async () => {
  if (!configStore.userId) {
    // 未登录时使用系统角色的第一个
    const fallbackRole = systemRoles.value[0] || null;
    if (fallbackRole) {
      currentRole.value = fallbackRole;
      configStore.setCurrentRole(fallbackRole);
    }
    return;
  }
  try {
    const res = await getSelectedRole({ userId: configStore.userId });
    if (res.code === 200 && res.data) {
      // 从已加载的角色列表中查找对应的角色
      const roleId = res.data.id;
      const allRoles = [...systemRoles.value, ...customRoles.value];
      const role = allRoles.find((r) => r.id === roleId);

      if (role) {
        currentRole.value = role;
        configStore.setCurrentRole(role);
      } else {
        // 如果在列表中找不到该角色，使用系统角色的第一个
        const fallbackRole = systemRoles.value[0] || null;
        if (fallbackRole) {
          currentRole.value = fallbackRole;
          configStore.setCurrentRole(fallbackRole);
        }
      }
    } else {
      // 没有选中角色时使用系统角色的第一个
      const fallbackRole = systemRoles.value[0] || null;
      if (fallbackRole) {
        currentRole.value = fallbackRole;
        configStore.setCurrentRole(fallbackRole);
      }
    }
  } catch (error) {
    console.error("获取当前角色失败:", error);
    const fallbackRole = systemRoles.value[0] || null;
    if (fallbackRole) {
      currentRole.value = fallbackRole;
      configStore.setCurrentRole(fallbackRole);
    }
  }
};

// 初始化角色数据
const initRoles = async () => {
  rolesLoading.value = true;
  try {
    await fetchSystemRoles();
    await Promise.all([fetchUserRoles(), fetchSelectedRole()]);
  } finally {
    rolesLoading.value = false;
  }
};

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
    message.warning("请先登录 🔒");
    return;
  }
  router.push("/collection");
};

const navigateToKnowledge = () => {
  if (!configStore.userId) {
    message.warning("请先登录 🔒");
    return;
  }
  router.push("/knowledge");
};

const navigateToHistory = () => {
  if (!configStore.userId) {
    message.warning("请先登录 🔒");
    return;
  }
  router.push("/chat/history");
};

const showRolePresets = () => {
  if (!configStore.userId) {
    message.warning("请先登录 🔒");
    return;
  }
  showRoleDialog.value = true;
};

// 同步角色选择到服务器
const syncRoleToServer = async (role) => {
  if (!configStore.userId || !role) return;

  try {
    await selectRoleApi({
      userId: configStore.userId,
      roleId: role.id,
    });
    lastSyncedRole = role;
    pendingSyncRole = null;
  } catch (error) {
    message.error("角色切换同步失败:", error);
    pendingSyncRole = role;
  }
};

const debouncedSyncRole = (role) => {
  if (!configStore.userId) return;

  pendingSyncRole = role;

  if (roleSelectDebounceTimer) {
    clearTimeout(roleSelectDebounceTimer);
  }

  // 设置新的定时器，500ms 后同步
  roleSelectDebounceTimer = setTimeout(() => {
    syncRoleToServer(role);
  }, 500);
};

// 处理角色选择
const handleSelectRole = async (role) => {
  currentRole.value = role;
  configStore.setCurrentRole(role);
  debouncedSyncRole(role);
};

// 强制同步当前角色
const forceSyncCurrentRole = async () => {
  if (pendingSyncRole && configStore.userId) {
    if (roleSelectDebounceTimer) {
      clearTimeout(roleSelectDebounceTimer);
      roleSelectDebounceTimer = null;
    }
    // 立即同步
    await syncRoleToServer(pendingSyncRole);
  }
};

const openCreateRoleDialog = () => {
  showCreateRoleDialog.value = true;
};

const closeCreateRoleDialog = () => {
  showCreateRoleDialog.value = false;
  isEditMode.value = false;
  editingRoleId.value = null;
  customRoleForm.value = {
    name: "",
    desc: "",
    icon: "🤖",
    color: "#00ff77",
    prompt: "",
  };
};

const openEditRoleDialog = (role) => {
  isEditMode.value = true;
  editingRoleId.value = role.id;
  customRoleForm.value = {
    name: role.name,
    desc: role.desc,
    icon: role.avatar,
    color: role.avatarColor,
    prompt: role.prompt,
  };
  showCreateRoleDialog.value = true;
};

const openDeleteRoleDialog = (role) => {
  dialog.warning({
    title: "确定删除角色？",
    content: `确定要删除"${role.name}"吗？删除后将不可恢复。`,
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
    style: "height: 140px; border-radius: 10px; overflow: hidden;",
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
        const deletedRoleId = role.id;
        await deleteRole({
          userId: configStore.userId,
          id: deletedRoleId,
        });
        // 重新拉取角色列表
        await fetchUserRoles();
        // 如果删除的是当前选中的角色，切换回系统角色的第一个
        if (currentRole.value?.id === deletedRoleId) {
          const fallbackRole = systemRoles.value[0] || null;
          if (fallbackRole) {
            currentRole.value = fallbackRole;
            configStore.setCurrentRole(fallbackRole);
            // 清除选择
            await clearRole({ userId: configStore.userId });
          }
        }
      } catch (error) {
        message.error("删除角色失败：" + error.message);
      }
    },
  });
};

const saveCustomRole = async () => {
  if (!customRoleForm.value.name.trim()) {
    message.warning("请输入角色名称");
    return;
  }
  if (!customRoleForm.value.desc.trim()) {
    message.warning("请输入角色描述");
    return;
  }
  if (!customRoleForm.value.prompt.trim()) {
    message.warning("请输入提示词");
    return;
  }

  if (!configStore.userId) {
    message.warning("请先登录");
    return;
  }

  try {
    if (isEditMode.value) {
      // 更新角色
      const res = await updateRole({
        userId: configStore.userId,
        id: editingRoleId.value,
        name: customRoleForm.value.name,
        description: customRoleForm.value.desc,
        avatar: customRoleForm.value.icon,
        avatarColor: customRoleForm.value.color,
        prompt: customRoleForm.value.prompt,
      });
      if (res.code === 200) {
        message.success("角色更新成功 🎉");
        await fetchUserRoles();
        // 如果编辑的是当前选中的角色，需要更新当前角色信息
        if (currentRole.value?.id === editingRoleId.value) {
          const updatedRole = customRoles.value.find(
            (r) => r.id === editingRoleId.value
          );
          if (updatedRole) {
            currentRole.value = updatedRole;
            configStore.setCurrentRole(updatedRole);
          }
        }
      } else {
        throw new Error(res.message || "更新失败");
      }
    } else {
      // 创建角色
      const res = await createRole({
        userId: configStore.userId,
        name: customRoleForm.value.name,
        description: customRoleForm.value.desc,
        avatar: customRoleForm.value.icon,
        avatarColor: customRoleForm.value.color,
        prompt: customRoleForm.value.prompt,
      });
      if (res.code === 200 && res.data) {
        // 重新拉取角色列表
        await fetchUserRoles();
        // 跳转到第一页以便看到新创建的角色
        customRolePage.value = 1;
      } else {
        throw new Error(res.message || "创建失败");
      }
    }
    closeCreateRoleDialog();
  } catch (error) {
    message.error(isEditMode.value ? "更新角色失败" : "创建角色失败");
  }
};

const iconOptions = [
  "🤖",
  "🎯",
  "🎨",
  "📚",
  "🤝",
  "🔍",
  "✍️",
  "🏗️",
  "🏥",
  "⚖️",
  "🌟",
  "🌍",
  "💼",
  "🚀",
  "💡",
  "🎓",
];

const colorOptions = [
  "#00ff77",
  "#ff6b6b",
  "#4ecdc4",
  "#ffe66d",
  "#a55eea",
  "#ff9ff3",
  "#0984e3",
  "#00b894",
  "#6c5ce7",
  "#fd79a8",
  "#fdcb6e",
  "#00cec9",
];

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
    message.error("编辑失败：" + error.message);
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
        message.error("删除对话失败：" + error.message);
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

  initRoles();

  if (configStore.userId) {
    fetchHistoryList();
  }

  // 监听用户登录/登出状态变化
  watch(
    () => configStore.userId,
    (newUserId, oldUserId) => {
      if (newUserId && !oldUserId) {
        fetchHistoryList();
        fetchUserRoles();
        fetchSelectedRole();
      } else if (!newUserId && oldUserId) {
        historyStore.setHistoryList([]);
        historyStore.setHistoryListLoaded(false);
        configStore.chatId = null;
        customRoles.value = [];
        const fallbackRole = systemRoles.value[0] || null;
        if (fallbackRole) {
          currentRole.value = fallbackRole;
          configStore.setCurrentRole(fallbackRole);
        }
      }
    }
  );

  // 监听角色对话框关闭，强制同步待处理的角色
  watch(showRoleDialog, (newVal, oldVal) => {
    if (oldVal === true && newVal === false) {
      forceSyncCurrentRole();
    }
  });

  window.addEventListener("createNewChat", createNewChat);
  window.addEventListener("clearHistoryList", handleClearHistoryList);
});

onBeforeUnmount(() => {
  // 清理事件监听器
  window.removeEventListener("createNewChat", createNewChat);
  window.removeEventListener("clearHistoryList", handleClearHistoryList);

  // 清理防抖定时器
  if (roleSelectDebounceTimer) {
    clearTimeout(roleSelectDebounceTimer);
    roleSelectDebounceTimer = null;
  }

  // 组件卸载前，强制同步待处理的角色
  forceSyncCurrentRole();
});
</script>

<style scoped lang="less">
// 动画曲线定义
@ease-smooth: cubic-bezier(0.4, 0, 0.2, 1);
@ease-bounce: cubic-bezier(0.34, 1.56, 0.64, 1);
@ease-out-expo: cubic-bezier(0.19, 1, 0.22, 1);
@transition-duration: 0.35s;

.modal-close-icon {
  position: absolute;
  top: 1.2rem;
  right: 1rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
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

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1rem 0 0;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

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
    background-color: var(--background-color);
    box-shadow: 1px 0 1px rgba(128, 128, 128, 0.15);
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

        &:not(.expanded) {
          .logo,
          .logo-light {
            display: flex;
          }
        }

        .toggle-icon {
          color: var(--text-color);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.4s @ease-bounce;
        }

        .logo,
        .logo-light {
          width: 1.8rem;
          height: 1.8rem;
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
        font-weight: 800;
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
      outline: none;
      user-select: none;
      pointer-events: none;
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

            .menu-icon {
              transform: scale(1.05);
            }
          }

          &:active {
            transform: scale(0.98);

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
        max-height: 100vh;

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

              .history-item-actions {
                display: flex;
                opacity: 1;
              }
            }

            &:active {
              transform: scale(0.98);
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
                  transform: scale(1.05);
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

          .history-empty {
            text-align: center;
            padding: 15rem 0;
            color: var(--text-color);
            opacity: 0.3;
            font-size: 14px;
            user-select: none;
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

.role-columns-container {
  display: flex;
  flex-direction: column;
  gap: 0;
  padding: 1rem;
  max-height: 70vh;
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 0.375rem;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(128, 128, 128, 0.3);
    border-radius: 3px;
  }

  .current-role-section {
    margin-bottom: 1.5rem;
    .section-header {
      .section-title {
        font-size: 17px;
        font-weight: 600;
        color: var(--text-color);
        margin-bottom: 1rem;
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }
    }

    .current-role-item {
      display: flex;
      align-items: center;
      padding: 1rem;
      border-radius: 16px;
      background: linear-gradient(
        135deg,
        rgba(0, 255, 119, 0.2) 0%,
        rgba(0, 255, 119, 0.02) 100%
      );
      position: relative;
      user-select: none;
      pointer-events: none;
      box-shadow: 0 4px 12px rgba(0, 255, 119, 0.08);
      transition: all 0.3s @ease-smooth;

      &::before {
        content: "";
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        border-radius: 16px;
        background: linear-gradient(
          135deg,
          rgba(255, 255, 255, 0.1) 0%,
          transparent 100%
        );
        pointer-events: none;
      }

      .role-icon {
        width: 3rem;
        height: 3rem;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 24px;
        flex-shrink: 0;
        margin-right: 1rem;
        user-select: none;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        position: relative;
        z-index: 1;
        transition: transform 0.3s @ease-smooth;
      }

      .role-info {
        flex: 1;
        min-width: 0;
        position: relative;
        z-index: 1;

        .role-name {
          font-size: 15px;
          font-weight: 700;
          color: var(--text-color);
          margin-bottom: 0.3rem;
          letter-spacing: 0.3px;
        }

        .role-desc {
          font-size: 12px;
          color: var(--text-color);
          opacity: 0.7;
          line-height: 1.5;
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      }

      .role-check {
        width: 24px;
        height: 24px;
        flex-shrink: 0;
        position: relative;
        z-index: 1;
        display: flex;
        align-items: center;
        justify-content: center;
      }
    }
  }

  .system-roles-section,
  .custom-roles-section {
    margin-bottom: 1.5rem;
    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.75rem;

      .section-title {
        font-size: 16px;
        font-weight: 600;
        color: var(--text-color);
      }

      .header-actions {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .create-role-btn {
        display: flex;
        align-items: center;
        gap: 4px;
        color: var(--primary-color);
      }

      .pagination-controls {
        display: flex;
        align-items: center;
        gap: 4px;
        padding-left: 0.5rem;
        .page-indicator {
          font-size: 12px;
          color: var(--text-color);
          opacity: 0.6;
          margin: 0 0.25rem;
        }
      }
    }

    .roles-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 0.75rem;

      .role-grid-item {
        display: flex;
        align-items: flex-start;
        padding: 0.75rem;
        border-radius: 12px;
        cursor: pointer;
        transition: all 0.3s @ease-smooth;
        background-color: rgba(0, 0, 0, 0.03);
        border: 1px solid transparent;
        min-height: 80px;

        &:hover {
          background-color: rgba(0, 0, 0, 0.06);
          transform: translateY(-1px);
        }

        &.active {
          border-color: var(--primary-color);
          background-color: rgba(0, 255, 119, 0.05);
        }

        .role-icon {
          width: 2rem;
          height: 2rem;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          flex-shrink: 0;
          margin-right: 0.5rem;
          user-select: none;
          pointer-events: none;
        }

        .role-info {
          flex: 1;
          min-width: 0;

          .role-name {
            font-size: 13px;
            font-weight: 600;
            color: var(--text-color);
            margin-bottom: 0.25rem;
            user-select: none;
          }

          .role-desc {
            font-size: 11px;
            color: var(--text-color);
            opacity: 0.6;
            line-height: 1.4;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
            user-select: none;
          }
        }

        .role-check {
          flex-shrink: 0;
          margin-left: 0.25rem;
        }

        .role-actions {
          position: absolute;
          top: 0.5rem;
          right: 0.5rem;
          display: flex;
          gap: 0.25rem;
          opacity: 0;
          transform: translateY(-8px) scale(0.95);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          background: var(--action-bg, rgba(255, 255, 255, 0.9));
          backdrop-filter: blur(10px);
          border-radius: 8px;
          padding: 0.25rem 0.4rem;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1),
            0 1px 3px rgba(0, 0, 0, 0.08);
          z-index: 10;

          :deep(.n-button) {
            transition: all 0.2s ease;

            &:hover {
              background-color: var(--action-hover-bg, rgba(0, 0, 0, 0.05));
            }
          }
        }

        &.custom-role-item {
          position: relative;

          &:hover {
            .role-actions {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }
        }
      }
    }

    .empty-roles {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 1rem 1rem;
      color: var(--text-color);
      opacity: 0.5;

      .empty-icon {
        font-size: 48px;
        margin-bottom: 1rem;
        user-select: none;
      }

      .empty-text {
        font-size: 14px;
        margin-bottom: 1rem;
      }
    }
  }
}

.create-role-form {
  .form-item {
    margin-bottom: 1.25rem;

    .form-label {
      font-size: 14px;
      font-weight: 600;
      color: var(--text-color);
      margin-bottom: 0.5rem;
      user-select: none;
    }

    .icon-selector {
      display: grid;
      grid-template-columns: repeat(8, 1fr);
      gap: 0.5rem;

      .icon-option {
        width: 2.5rem;
        height: 2.5rem;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 20px;
        cursor: pointer;
        transition: all 0.3s @ease-smooth;
        background-color: rgba(0, 0, 0, 0.03);
        border: 0.125rem solid transparent;
        user-select: none;

        &:hover {
          background-color: rgba(0, 0, 0, 0.06);
          transform: scale(1.1);
        }

        &.active {
          border-color: var(--primary-color);
          background-color: rgba(0, 255, 119, 0.1);
        }
      }
    }

    .color-selector {
      display: grid;
      grid-template-columns: repeat(12, 1fr);
      gap: 0.5rem;

      .color-option {
        width: 2rem;
        height: 2rem;
        border-radius: 50%;
        cursor: pointer;
        transition: all 0.3s @ease-smooth;
        display: flex;
        align-items: center;
        justify-content: center;
        user-select: none;

        &:hover {
          transform: scale(1.15);
        }

        &.active {
          transform: scale(1.15);
        }
      }
    }
  }
}
</style>

<style lang="less">
@import "../styles/roleSetting.less";
</style>
