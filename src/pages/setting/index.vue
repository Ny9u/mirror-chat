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
            <span>编辑个人资料</span>
          </div>
        </div>

        <div class="setting-item">
          <div class="setting-label">
            <n-icon :component="Key" size="1.2em" />
            <span>密码安全</span>
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
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useConfigStore } from "@/stores/configStore";
import { useRouter } from "vue-router";
import {
  useMessage,
  NAvatar,
  NIcon,
  NButton,
  NSwitch,
  NSelect,
} from "naive-ui";
import { User, Key, Moon, InfoCircle, Logout, X } from "@vicons/tabler";
import backupImg from "@/assets/avatar.svg";

const configStore = useConfigStore();
const router = useRouter();
const message = useMessage();

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
            color: var(--text-color-light);
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
</style>
