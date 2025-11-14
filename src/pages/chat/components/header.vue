<template>
  <div class="header">
    <div class="info">
      <div class="name" @click="goToMyGithub">
        <div
          :class="{
            logo: theme === '浅色主题',
            'logo-light': theme === '深色主题',
          }"
        ></div>
        <div class="title">Mirror-Chat</div>
      </div>
      <div class="model" @click="openModelSelect">
        <div>{{ configStore.model }}</div>
        <div
          :class="{
            down: theme === '浅色主题',
            'down-light': theme === '深色主题',
            rotate: showSelect,
          }"
        ></div>
      </div>
    </div>
    <div class="tool">
      <n-button
        size="large"
        v-if="!configStore.userId"
        class="login-btn"
        @click="goToLogin"
      >
        登录
      </n-button>
      <n-button
        size="large"
        v-if="!configStore.userId"
        :class="[
          'register-btn',
          theme === '浅色主题' ? 'register-btn-dark' : 'register-btn-light',
        ]"
        @click="goToRegister"
      >
        注册
      </n-button>

      <n-avatar
        v-else
        round
        :src="configStore.avatar ? configStore.avatar : backupImg"
        class="avatar"
        @click="openSettings"
      />
    </div>
  </div>
  <div
    v-show="showSettings"
    class="settings"
    :class="{ 'settings-visible': showSettings }"
    @click.stop
  >
    <div class="user-info">
      <n-avatar
        round
        :src="configStore.avatar ? configStore.avatar : backupImg"
        class="user-avatar"
      />
      <div class="user-details">
        <div class="user-name">{{ configStore.name || "用户" }}</div>
        <div class="user-id">ID: {{ configStore.userId }}</div>
      </div>
    </div>
    <div class="settings-options">
      <div class="setting-item">
        <div class="setting-label">
          <n-icon
            :component="Moon"
            size="1.1em"
            :color="configStore.theme === 'dark' ? '#ffffff' : '#000000'"
            style="margin-right: 0.3em"
          />
          暗黑模式
        </div>
        <n-switch
          :value="theme === '浅色主题'"
          @update:value="handleSelect('theme')"
        />
      </div>
      <div class="setting-item">
        <div class="setting-label" @click="logout">
          <n-icon
            :component="Logout"
            size="1.1em"
            :color="configStore.theme === 'dark' ? '#ffffff' : '#000000'"
            style="margin-right: 0.3em"
          />
          退出登录
        </div>
      </div>
    </div>
  </div>
  <div
    v-show="showSelect"
    class="select"
    :class="{ 'select-visible': showSelect }"
    @click.stop
  >
    <div class="model-title">
      <div>模型</div>
      <n-tooltip placement="top" trigger="hover">
        <template #trigger>
          <div
            :class="{
              'model-question': theme === '浅色主题',
              'model-question-light': theme === '深色主题',
            }"
          ></div>
        </template>
        <span>模型描述</span>
      </n-tooltip>
    </div>
    <n-infinite-scroll style="height: 255px" :distance="10">
      <div
        v-for="model in Models"
        :key="model.key"
        class="item"
        :class="{ selected: model.key === configStore.model }"
        @click="selectModel(model.key)"
      >
        <div class="model-name">{{ model.name }}</div>
        <div class="model-desc">{{ model.desc }}</div>
      </div>
    </n-infinite-scroll>
  </div>
  <div v-show="showSelect" class="overlay" @click="closeModelSelect"></div>
  <div v-show="showSettings" class="overlay" @click="closeSettings"></div>
</template>

<script setup>
import {
  NAvatar,
  NDropdown,
  NIcon,
  useMessage,
  NInfiniteScroll,
  NTooltip,
  NSwitch,
  NButton,
} from "naive-ui";
import { Logout, Moon } from "@vicons/tabler";
import { ref, h, nextTick, onMounted, getCurrentInstance } from "vue";
import backupImg from "@/assets/avatar.svg";
import { useConfigStore } from "@/stores/configStore";
import { useRouter } from "vue-router";
import { validate } from "@/services/user";

const message = useMessage();
const configStore = useConfigStore();
const router = useRouter();
const { proxy } = getCurrentInstance();
import Models from "@/config/models.js";

const theme = ref("深色主题"); // 默认主题为浅色，所以按钮展示为深色
let showSelect = ref(false);
let showSettings = ref(false);
const openModelSelect = () => {
  showSelect.value = true;
};
const closeModelSelect = () => {
  showSelect.value = false;
};
const openSettings = () => {
  showSettings.value = !showSettings.value;
};
const closeSettings = () => {
  showSettings.value = false;
};
const selectModel = (model) => {
  configStore.setModel(model);
  showSelect.value = false;
};
const handleSelect = (key) => {
  theme.value = theme.value === "深色主题" ? "浅色主题" : "深色主题";
  if (theme.value === "深色主题") {
    configStore.setTheme("light");
  } else {
    configStore.setTheme("dark");
  }
};

const goToMyGithub = () => {
  window.open("https://github.com/Ny9u");
};

const goToLogin = async () => {
  const token = localStorage.getItem("jwtToken");
  const isLoggedIn = localStorage.getItem("isLoggedIn");

  if (token && isLoggedIn === "true") {
    try {
      const res = await validate();
      if (res.code === 200) {
        configStore.setUserId(res.data.id);
        configStore.setName(res.data.username);
        configStore.setAvatar(res.data.avatar);
        message.success("登录成功");
        sessionStorage.setItem("skipValidation", "true");
      } else {
        localStorage.removeItem("jwtToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("isLoggedIn");
        router.push("/auth?tab=login");
      }
    } catch (error) {
      localStorage.removeItem("jwtToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("isLoggedIn");
      router.push("/auth?tab=login");
    }
  } else {
    router.push("/auth?tab=login");
  }
};

const autoLogin = async () => {
  const shouldSkipValidation = sessionStorage.getItem("skipValidation");
  if (shouldSkipValidation === "true") {
    sessionStorage.removeItem("skipValidation");
    return;
  }

  const token = localStorage.getItem("jwtToken");
  const isLoggedIn = localStorage.getItem("isLoggedIn");

  if (token && isLoggedIn === "true") {
    try {
      const res = await validate();
      if (res.code === 200) {
        configStore.setUserId(res.data.id);
        configStore.setName(res.data.username);
        configStore.setAvatar(res.data.avatar);
      } else {
        localStorage.removeItem("jwtToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("isLoggedIn");
        clearPersonalData();
      }
    } catch (error) {
      localStorage.removeItem("jwtToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("isLoggedIn");
      clearPersonalData();
    }
  }
};

const goToRegister = () => {
  router.push("/auth?action=register");
};

const clearPersonalData = () => {
  configStore.setUserId(null);
  configStore.setName("");
  configStore.setAvatar("");
};

const logout = () => {
  localStorage.removeItem("jwtToken");
  localStorage.removeItem("isLoggedIn");
  sessionStorage.removeItem("skipJwtValidation");
  clearPersonalData();
};

// const getModelList = async () => {
//   Request({
//     headers: {
//       Authorization: "Bearer" + import.meta.env.VITE_ALIYUN_API_KEY,
//       "Content-Type": "application/json",
//       Accept: "*/*",
//     },
//     url: proxy.$api.getModels,
//     method: "GET",
//     data: {
//       page_no: 1,
//       page_size: 10,
//     },
//   }).then((res) => {
//     console.log(res);
//   });
// };

onMounted(async () => {
  await autoLogin();
  // await getModelList();
});
</script>

<style lang="less" scoped>
:root {
  --primary-color: #18a058;
  --hover-color: rgba(24, 160, 88, 0.1);
}

.header {
  width: 100vw;
  height: 3.6rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: fixed;
  top: 0;
  background: var(--background-color) no-repeat center;
  cursor: pointer;
  caret-color: transparent;
  .info {
    height: 3.6rem;
    display: flex;
    align-items: center;
    .name {
      display: flex;
      align-items: center;
      .logo {
        width: 3.2rem;
        height: 3.2rem;
        margin: 0 1.07rem;
        background: url("@/assets/logo.svg") no-repeat center;
      }
      .logo-light {
        width: 3.2rem;
        height: 3.2rem;
        margin: 0 1.07rem;
        background: url("@/assets/logo_dark.svg") no-repeat center;
      }
      .title {
        width: 10.13rem;
        height: 2.14rem;
        font-size: 1.47rem;
        font-weight: 800;
        color: var(--text-color);
      }
    }
    .model {
      height: 1.2rem;
      margin-top: 0.2rem;
      line-height: 1.2rem;
      display: flex;
      font-size: 1.2rem;
      font-weight: 600;
      color: var(--text-color);
    }
    .down {
      width: 1.33rem;
      height: 1.33rem;
      margin: 0 1.07rem;
      background: url("@/assets/down.svg") no-repeat center;
      background-size: 100% 100%;
      transition: transform 0.4s ease;
    }
    .down.rotate {
      transform: rotate(180deg);
    }
    .down-light {
      width: 1.33rem;
      height: 1.33rem;
      margin: 0 1.07rem;
      background: url("@/assets/down_dark.svg") no-repeat center;
      background-size: 100% 100%;
      transition: transform 0.4s ease;
    }
    .down-light.rotate {
      transform: rotate(180deg);
    }
  }
  .tool {
    display: flex;
    align-items: center;
    justify-content: center;

    .setting {
      width: 1.07rem;
      height: 1.07rem;
      margin: 0 1.07rem;
      background: url("@/assets/more.svg") no-repeat center;
      background-size: 100% 100%;
    }
    .setting:hover {
      cursor: pointer;
      opacity: 0.8;
    }
    .setting-light {
      width: 1.07rem;
      height: 1.07rem;
      margin: 0 1.07rem;
      background: url("@/assets/more_dark.svg") no-repeat center;
      background-size: 100% 100%;
    }
    .setting-light:hover {
      cursor: pointer;
      opacity: 0.8;
    }
    .avatar {
      width: 2.2rem;
      height: 2.2rem;
      margin: 0 1.07rem;
      background-color: var(--background-color);
    }

    .login-btn {
      border-radius: 10px;
      background-color: #36ad6a;
      color: white;
    }

    .register-btn {
      margin: 0 1rem;
      border-radius: 10px;
      background-color: transparent;
      border: 1px solid #333;
      color: #333;
    }

    .register-btn-light {
      border: 1px solid #333;
      color: #333;
    }

    .register-btn-dark {
      border: 1px solid #fff;
      color: #fff;
    }
  }
}
.settings {
  width: 25rem;
  height: auto;
  background: var(--select-color) no-repeat center;
  border-radius: 1.07rem;
  position: absolute;
  top: 3.6rem;
  right: 1.07rem;
  z-index: 999;
  caret-color: transparent;
  opacity: 0;
  transform: translateY(-10px);
  transition: opacity 0.3s ease, transform 0.3s ease;
  padding: 1.33rem;
  box-sizing: border-box;

  &.settings-visible {
    opacity: 1;
    transform: translateY(0);
  }

  .user-info {
    display: flex;
    align-items: center;
    border-bottom: 1px solid var(--border-color);
    margin-bottom: 1.33rem;

    .user-avatar {
      width: 4rem;
      height: 4rem;
      margin-right: 1.07rem;
    }

    .user-details {
      .user-name {
        font-size: 1.2rem;
        font-weight: 600;
        color: var(--text-color);
        margin-bottom: 0.5rem;
      }

      .user-id {
        font-size: 0.93rem;
        color: var(--text-color);
      }
    }
  }

  .settings-options {
    .setting-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.8rem 0;
      border-bottom: 1px solid var(--border-color);
      border-radius: 0.5rem;
      transition: all 0.3s ease;

      &:last-child {
        border-bottom: none;
      }

      &:hover {
        background-color: rgba(0, 0, 0, 0.05);
      }

      .setting-label {
        font-size: 1.07rem;
        color: var(--text-color);
        display: flex;
        align-items: center;
        cursor: pointer;
        padding: 0.5rem 1rem;
        border-radius: 0.5rem;
        transition: all 0.3s ease;
        width: 100%;
      }

      .setting-label:hover {
        background-color: var(--hover-color);
        color: var(--primary-color);
      }

      .dark-mode .setting-label:hover {
        background-color: rgba(255, 255, 255, 0.1);
        color: #ff6b6b;
      }

      .light-mode .setting-label:hover {
        background-color: rgba(0, 0, 0, 0.05);
        color: #d32f2f;
      }

      .setting-value {
        font-size: 0.93rem;
        color: var(--text-color-light);
        max-width: 12rem;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }
  }
}

.select {
  width: 33.33rem;
  height: 20.66rem;
  background: var(--select-color) no-repeat center;
  border-radius: 1.07rem;
  position: absolute;
  top: 3.6rem;
  left: 13.33rem;
  z-index: 999;
  caret-color: transparent;
  opacity: 0;
  transform: translateY(-10px);
  transition: opacity 0.3s ease, transform 0.3s ease;

  &.select-visible {
    opacity: 1;
    transform: translateY(0);
  }

  .model-title {
    height: 3.33rem;
    padding: 0 1.33rem;
    margin-bottom: 0.33rem;
    line-height: 3.33rem;
    font-size: 1.2rem;
    font-weight: 600;
    color: var(--text-color);
    display: flex;
    align-items: center;
    justify-content: space-between;
    .model-question {
      width: 1.33rem;
      height: 1.33rem;
      background: url("@/assets/question.svg") no-repeat center;
      background-size: 100% 100%;
    }
    .model-question-light {
      width: 1.33rem;
      height: 1.33rem;
      background: url("@/assets/question-dark.svg") no-repeat center;
      background-size: 100% 100%;
    }
  }
  .item {
    width: 100%;
    height: 5.67rem;
    font-size: 1.07rem;
    color: var(--text-color);
    display: flex;
    flex-direction: column;
    justify-content: center;
    cursor: pointer;
    border-radius: 1.33rem;
    transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
    transform: scale(1);
    padding: 0 1.33rem;
    box-sizing: border-box;
    .model-name {
      width: 100%;
      font-weight: 600;
    }
    .model-desc {
      width: 100%;
      color: #8c8e9c;
      font-size: 0.93rem;
      white-space: normal;
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      line-height: 1.2;
      margin-top: 0.2rem;
    }
  }
  .item.selected {
    background: linear-gradient(
      90deg,
      rgba(24, 160, 88, 0.15),
      rgba(24, 160, 88, 0.1)
    );
    box-shadow: 0 4px 12px rgba(24, 160, 88, 0.15);
    transform: scale(1.02);
    border: 1px solid rgba(24, 160, 88, 0.2);
  }
  .item:hover {
    background: linear-gradient(
      90deg,
      rgba(150, 150, 150, 0.15),
      rgba(150, 150, 150, 0.05)
    );
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    transform: scale(1.01);
  }
  .item.selected:hover {
    background: linear-gradient(
      90deg,
      rgba(24, 160, 88, 0.2),
      rgba(24, 160, 88, 0.15)
    );
    box-shadow: 0 6px 16px rgba(24, 160, 88, 0.2);
    transform: scale(1.03);
    border: 1px solid rgba(24, 160, 88, 0.25);
  }

  .item.selected:hover .model-desc {
    font-weight: normal;
  }

  .light-mode .item.selected {
    background: linear-gradient(
      90deg,
      rgba(24, 160, 88, 0.1),
      rgba(24, 160, 88, 0.06)
    );
    box-shadow: 0 4px 12px rgba(24, 160, 88, 0.1);
    border: 1px solid rgba(24, 160, 88, 0.15);
  }

  .light-mode .item:hover {
    background: linear-gradient(
      90deg,
      rgba(150, 150, 150, 0.1),
      rgba(150, 150, 150, 0.03)
    );
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .light-mode .item.selected:hover {
    background: linear-gradient(
      90deg,
      rgba(24, 160, 88, 0.15),
      rgba(24, 160, 88, 0.1)
    );
    box-shadow: 0 6px 16px rgba(24, 160, 88, 0.15);
    border: 1px solid rgba(24, 160, 88, 0.2);
  }

  .light-mode .item.selected:hover .model-desc {
    font-weight: normal;
  }
}
.overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: transparent;
  z-index: 998;
}
::v-deep(.n-scrollbar-rail) {
  display: none;
}
</style>
