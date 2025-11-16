<template>
  <div class="setting-container">
    <n-icon class="close-icon" :component="X" @click="close" size="1.5rem" />
    <div class="setting-header">
      <div class="header-content">
        <h1>设置</h1>
        <div class="user-info">
          <n-avatar
            round
            :src="configStore.avatar || backupImg"
            class="user-avatar"
          />
          <div class="user-details">
            <div class="user-name">{{ configStore.name || "用户" }}</div>
            <div class="user-id">ID: {{ configStore.userId }}</div>
          </div>
        </div>
      </div>
    </div>

    <div class="setting-content">
      <div class="setting-section">
        <h2>账户</h2>
        <div class="setting-item" @click="editProfile">
          <div class="setting-label">
            <n-icon :component="User" size="1.2em" />
            <span>个人资料</span>
          </div>
        </div>

        <div class="setting-item" @click="showPasswordModal">
          <div class="setting-label">
            <n-icon :component="Key" size="1.2em" />
            <span>密码管理</span>
          </div>
        </div>
      </div>

      <div class="setting-section">
        <h2>偏好</h2>
        <div class="setting-item">
          <div class="setting-label">
            <n-icon :component="Moon" size="1.2em" />
            <span>暗黑模式</span>
          </div>
          <div class="setting-action">
            <n-switch
              :value="configStore.theme === 'dark'"
              @update:value="toggleTheme"
            />
          </div>
        </div>
      </div>

      <div class="setting-section">
        <h2>其他</h2>
        <div class="setting-item" @click="showAbout">
          <div class="setting-label">
            <n-icon :component="InfoCircle" size="1.2em" />
            <span>关于我们</span>
          </div>
        </div>

        <div class="setting-item" @click="logout">
          <div class="setting-label">
            <n-icon :component="Logout" size="1.2em" />
            <span>退出登录</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 密码管理 -->
    <n-modal
      v-model:show="showPasswordModalFlag"
      preset="card"
      style="width: 480px; height: 510px; border-radius: 12px; overflow: hidden"
      :closable="false"
      title="密码管理"
      size="medium"
      :segmented="{
        content: true,
        footer: 'soft',
      }"
    >
      <template #header-extra>
        <n-icon
          class="modal-close-icon"
          :component="X"
          @click="closePasswordModal"
          size="1.6rem"
        />
      </template>
      <n-form
        :model="passwordForm"
        :rules="passwordRules"
        ref="passwordFormRef"
        label-placement="top"
        label-width="auto"
      >
        <n-form-item label="当前密码" path="currentPassword">
          <n-input
            v-model:value="passwordForm.currentPassword"
            type="password"
            show-password-on="click"
            placeholder="请输入当前密码"
            size="large"
            style="border-radius: 8px"
          />
        </n-form-item>
        <n-form-item label="新密码" path="newPassword">
          <n-input
            v-model:value="passwordForm.newPassword"
            type="password"
            show-password-on="click"
            placeholder="请输入新密码"
            size="large"
            style="border-radius: 8px"
          />
        </n-form-item>
        <n-form-item label="确认新密码" path="confirmPassword">
          <n-input
            v-model:value="passwordForm.confirmPassword"
            type="password"
            show-password-on="click"
            placeholder="再次输入新密码"
            size="large"
            style="border-radius: 8px"
          />
        </n-form-item>
      </n-form>
      <div class="modal-footer">
        <n-button
          type="primary"
          @click="updateUserPassword"
          :loading="updatingPassword"
          style="border-radius: 8px"
        >
          更新密码
        </n-button>
      </div>
    </n-modal>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useConfigStore } from "@/stores/configStore";
import { useRouter } from "vue-router";
import { updatePassword } from "@/services/user";
import {
  useMessage,
  NAvatar,
  NIcon,
  NButton,
  NSwitch,
  NSelect,
  NModal,
  NForm,
  NFormItem,
  NInput,
} from "naive-ui";
import { User, Key, Moon, InfoCircle, Logout, X } from "@vicons/tabler";
import backupImg from "@/assets/avatar.svg";

const configStore = useConfigStore();
const router = useRouter();
const message = useMessage();

// 密码管理相关状态
const showPasswordModalFlag = ref(false);
const updatingPassword = ref(false);
const passwordFormRef = ref();
const passwordForm = ref({
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
});

// 密码验证规则
const passwordRules = {
  currentPassword: {
    required: true,
    message: "请输入当前密码",
    trigger: "blur",
  },
  newPassword: [
    {
      required: true,
      message: "请输入新密码",
    },
    {
      min: 6,
      message: "密码长度至少为6位",
    },
    {
      validator: (rule, value) => {
        if (value === passwordForm.value.currentPassword) {
          return new Error("新密码不能与当前密码相同");
        }
        return true;
      },
      trigger: "blur",
    },
  ],
  confirmPassword: [
    {
      required: true,
      message: "请确认新密码",
    },
    {
      validator: (rule, value) => {
        if (value !== passwordForm.value.newPassword) {
          return new Error("两次输入的密码不一致");
        }
        return true;
      },
      trigger: "blur",
    },
  ],
};

const toggleTheme = (value) => {
  configStore.setTheme(value ? "dark" : "light");
};

const showAbout = () => {
  message.info("Mirror-Chat v1.0.0");
};

const logout = () => {
  localStorage.removeItem("jwtToken");
  localStorage.removeItem("isLoggedIn");
  configStore.setUserId(null);
  configStore.setName("");
  configStore.setAvatar("");
  router.push("/auth?tab=login");
  message.success("已退出登录");
};

const close = () => {
  router.push("/");
};

const editProfile = () => {
  router.push("/setting/profile");
};

const showPasswordModal = () => {
  showPasswordModalFlag.value = true;
};

const closePasswordModal = () => {
  showPasswordModalFlag.value = false;
};

const updateUserPassword = async () => {
  updatingPassword.value = true;
  try {
    await passwordFormRef.value.validate();

    const res = await updatePassword({
      oldPassword: passwordForm.value.currentPassword,
      newPassword: passwordForm.value.newPassword,
    });

    if (res.code === 200) {
      message.success("密码修改成功");
      closePasswordModal();
    } else {
      message.error(res.message || "密码修改失败");
    }
  } catch (error) {
    message.error(error.message || "密码修改失败");
  } finally {
    updatingPassword.value = false;
  }
};
</script>

<style lang="less" scoped>
.setting-container {
  min-height: 100vh;
  background-color: var(--background-color);
  padding: 1.25rem;
  box-sizing: border-box;
  position: relative;

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

    &:hover {
      background-color: rgba(0, 0, 0, 0.1);
    }
  }

  .setting-header {
    margin-bottom: 1.5rem;

    .header-content {
      max-width: 800px;
      margin: 0 auto;
      padding: 1.25rem 0;
      border-bottom: 1px solid var(--border-color);
      position: relative;

      h1 {
        color: var(--text-color);
        font-size: 2rem;
        margin-bottom: 1.25rem;
      }

      .user-info {
        display: flex;
        align-items: center;

        .user-avatar {
          width: 3.75rem;
          height: 3.75rem;
          margin-right: 1.25rem;
        }

        .user-details {
          .user-name {
            font-size: 1.2rem;
            font-weight: 600;
            color: var(--text-color);
            margin-bottom: 5px;
          }

          .user-id {
            font-size: 0.9375rem;
            color: var(--text-color);
          }
        }
      }
    }
  }

  .setting-content {
    max-width: 800px;
    margin: 0 auto;

    .setting-section {
      background: var(--select-color);
      border-radius: 0.625rem;
      padding: 1.25rem;
      margin-bottom: 1.25rem;

      h2 {
        padding-left: 1rem;
        color: var(--text-color);
        font-size: 1.25rem;
        border-bottom: 1px solid var(--border-color);
      }

      .setting-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.9375rem 0;
        border-bottom: 1px solid var(--border-color);
        transition: background-color 0.3s ease;
        border-radius: 0.3125rem;
        padding: 0.9375rem;
        margin: 0.3125rem 0;

        &:hover {
          background-color: rgba(0, 0, 0, 0.05);
        }

        &:last-child {
          border-bottom: none;
        }

        .setting-label {
          display: flex;
          align-items: center;
          color: var(--text-color);
          font-size: 1.125rem;

          .n-icon {
            margin-right: 0.625rem;
          }
        }

        .setting-action {
          display: flex;
          align-items: center;
        }
      }
    }
  }
}
:deep(.n-form-item) {
  margin-bottom: 1rem;
}
:deep(.n-form-item-label__text) {
  font-size: 1rem;
}
:deep(.n-input) {
  height: 50px;
  .n-input__input-el {
    height: 50px;
  }
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  padding: 16px 0;
}
</style>
