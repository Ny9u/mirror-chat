<template>
  <div
    class="header"
    :class="{ 'sidebar-expanded': !configStore.sidebarCollapsed }"
  >
    <div class="info">
      <div class="chat-button" @click="createNewChat">
        <n-icon class="chat-button-icon" size="20">
          <MessagePlus />
        </n-icon>
        <div class="chat-button-text">新对话</div>
      </div>
      <div
        v-if="!configStore.imageGenerationMode"
        class="model"
        @click="toggleModelSelect"
      >
        <div>
          {{
            Models.find((m) => m.key === configStore.model)?.name || "选择模型"
          }}
        </div>
        <div
          :class="{
            down: configStore.theme === 'dark',
            'down-light': configStore.theme === 'light',
            rotate: showSelect,
          }"
        ></div>
      </div>
      <div v-else class="model">
        <div>qwen-image-max</div>
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
          configStore.theme === 'dark'
            ? 'register-btn-dark'
            : 'register-btn-light',
        ]"
        @click="goToRegister"
      >
        注册
      </n-button>

      <n-avatar
        v-else
        round
        :src="configStore.avatar"
        class="avatar"
        @click="openSettings"
      >
        <span
          v-if="!configStore.avatar"
          style="user-select: none; -webkit-user-select: none"
          >{{ Global.getInitials(configStore.name) }}</span
        >
      </n-avatar>
    </div>
  </div>
  <Transition name="settings-fade">
    <div v-show="showSettings" class="settings" @click.stop>
      <div class="user-info">
        <n-avatar round :src="configStore.avatar" class="user-avatar">
          <span
            v-if="!configStore.avatar"
            style="user-select: none; -webkit-user-select: none"
            >{{ Global.getInitials(configStore.name) }}</span
          >
        </n-avatar>
        <div class="user-details">
          <div class="user-name">{{ configStore.name || "用户" }}</div>
        </div>
      </div>
      <div class="settings-options">
        <div class="setting-item" :style="{ '--item-index': 0 }">
          <div class="setting-label" @click="openSettingPage">
            <n-icon
              :component="Settings"
              size="1.1em"
              class="setting-icon"
              :color="configStore.theme === 'dark' ? '#ffffff' : '#000000'"
            />
            <span class="setting-text">设置</span>
          </div>
        </div>
        <div class="setting-item" :style="{ '--item-index': 1 }">
          <div class="setting-label logout-label" @click="logout">
            <n-icon
              :component="Logout"
              size="1.1em"
              class="setting-icon"
              :color="configStore.theme === 'dark' ? '#ffffff' : '#000000'"
            />
            <span class="setting-text">退出登录</span>
          </div>
        </div>
      </div>
    </div>
  </Transition>
  <Transition name="select-fade">
    <div v-show="showSelect" class="select" @click.stop>
      <div class="model-title">
        <div class="title-text">模型</div>
        <n-tooltip placement="top" trigger="hover">
          <template #trigger>
            <div
              :class="{
                'model-question': configStore.theme === 'dark',
                'model-question-light': configStore.theme === 'light',
              }"
            ></div>
          </template>
          <span>模型描述</span>
        </n-tooltip>
      </div>
      <n-infinite-scroll style="height: 255px" :distance="10">
        <n-tooltip
          v-for="(model, index) in Models"
          :key="model.key"
          placement="right"
          trigger="hover"
          :delay="300"
          :style="{ maxWidth: '280px' }"
        >
          <template #trigger>
            <div
              class="item"
              :class="{ selected: model.key === configStore.model }"
              :style="{ '--model-index': index }"
              @click="selectModel(model.key)"
            >
              <div class="model-name">{{ model.name }}</div>
              <div class="model-desc">{{ model.desc }}</div>
            </div>
          </template>
          <div class="model-tooltip">
            <div class="tooltip-desc">{{ model.desc }}</div>
          </div>
        </n-tooltip>
      </n-infinite-scroll>
    </div>
  </Transition>
  <div v-show="showSelect" class="overlay" @click="closeModelSelect"></div>
  <div v-show="showSettings" class="overlay" @click="closeSettings"></div>
</template>

<script setup>
import { Logout, Settings, MessagePlus, AlertTriangle } from "@vicons/tabler";
import { ref, h, onMounted } from "vue";
import { useConfigStore } from "@/stores/configStore";
import { useRouter } from "vue-router";
import { validate, logout as logoutApi } from "@/services/user";
import Global from "@/utils/global.js";

const message = useMessage();
const dialog = useDialog();
const configStore = useConfigStore();
const router = useRouter();
import Models from "@/config/models.js";

let showSelect = ref(false);
let showSettings = ref(false);
const toggleModelSelect = () => {
  if (configStore.imageGenerationMode) {
    return;
  }
  showSelect.value = !showSelect.value;
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
  const modelConfig = Models.find((m) => m.key === model);

  if (modelConfig && modelConfig.expiredTime) {
    const expiredDate = new Date(modelConfig.expiredTime);
    const currentDate = new Date();

    if (currentDate >= expiredDate) {
      message.warning("该模型暂不可用，请选择其他模型 ⚠️");
      return;
    }
  }

  configStore.setModel(model);
  showSelect.value = false;
};

const goToLogin = async () => {
  const isLoggedIn = localStorage.getItem("isLoggedIn");

  // 检查是否已登录（通过 isLoggedIn 标记判断）
  if (isLoggedIn === "true") {
    try {
      const res = await validate();
      if (res.code === 200) {
        configStore.setUserId(res.data.id);
        configStore.setName(res.data.username);
        configStore.setAvatar(res.data.avatar);
        message.success("登录成功！🎉");
      } else {
        localStorage.removeItem("isLoggedIn");
        router.push("/auth?tab=login");
      }
    } catch (error) {
      localStorage.removeItem("isLoggedIn");
      router.push("/auth?tab=login");
    }
  } else {
    router.push("/auth?tab=login");
  }
};

const autoLogin = async () => {
  // 只在页面刷新时执行校验，通过检查是否存在performance.navigation.type === 1来判断,1表示页面通过刷新加载
  const isPageRefresh = performance && performance.navigation.type === 1;

  if (!isPageRefresh && configStore.userId) {
    return;
  }

  const isLoggedIn = localStorage.getItem("isLoggedIn");

  // 检查登录状态并自动登录
  if (!configStore.userId && isLoggedIn === "true") {
    try {
      const res = await validate();
      if (res.code === 200) {
        configStore.setUserId(res.data.id);
        configStore.setName(res.data.username);
        configStore.setAvatar(res.data.avatar);
      } else {
        localStorage.removeItem("isLoggedIn");
        clearPersonalData();
      }
    } catch (error) {
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
  dialog.warning({
    title: "确定退出登录？",
    content: `退出登录不会丢失任何数据，你仍可以登录此账号。`,
    positiveText: "退出登录",
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
        // 调用后端登出接口，清除服务端 Cookie
        await logoutApi();
      } catch (error) {
        console.error("登出失败:", error);
      } finally {
        // 清除前端登录状态
        localStorage.removeItem("isLoggedIn");
        sessionStorage.removeItem("skipJwtValidation");
        clearPersonalData();
        window.dispatchEvent(new CustomEvent("clearHistoryList"));
        message.success("已退出登录 👋");
      }
    },
  });
};

const openSettingPage = () => {
  router.push("/setting");
};

const createNewChat = () => {
  window.dispatchEvent(new CustomEvent("createNewChat"));
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

@keyframes gradientFlow {
  0%,
  100% {
    background-position: 0% 50%;
  }
  25% {
    background-position: 100% 0%;
  }
  50% {
    background-position: 100% 100%;
  }
  75% {
    background-position: 0% 100%;
  }
}

.header {
  width: 100%;
  height: 3.6rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: fixed;
  top: 0;
  right: 0;
  background: var(--background-color) no-repeat center;
  caret-color: transparent;
  padding-left: 1rem;
  box-sizing: border-box;
  transition: width 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  z-index: 999;

  &.sidebar-expanded {
    width: calc(100% - 16.75rem);
  }

  &:not(.sidebar-expanded) {
    width: calc(100% - 4.5rem);
  }

  .info {
    height: 3.6rem;
    display: flex;
    align-items: center;
    cursor: pointer;
    .chat-button {
      display: flex;
      align-items: center;
      padding: 0.5rem 1rem;
      margin: 0 0.8rem 0 0;
      cursor: pointer;
      transition: all 0.2s ease;
      border-radius: 20px;
      color: var(--primary-color);
      background-color: transparent;
      border: 1px solid var(--primary-color);
      font-size: 14px;

      &:hover {
        background: linear-gradient(
          135deg,
          rgba(200, 240, 220, 0.7) 0%,
          rgba(167, 243, 208, 0.65) 50%,
          rgba(110, 231, 183, 0.8) 100%
        );
        background-size: 300% 300%;
        animation: gradientFlow 10s ease-in-out infinite;
        box-shadow: 0 2px 8px rgba(110, 231, 183, 0.2),
          0 0 10px rgba(110, 231, 183, 0.05);
        transform: translateY(-1px);

        .chat-button-icon {
          color: black;
        }

        .chat-button-text {
          color: black;
        }
      }

      .chat-button-icon {
        margin-right: 0.5rem;
        color: var(--primary-color);
        transition: color 0.2s ease;
      }

      .chat-button-text {
        color: var(--primary-color);
        font-weight: 600;
        transition: color 0.2s ease;
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
      user-select: none;
    }
    .down {
      width: 1.2rem;
      height: 1.2rem;
      margin: 0 0.6rem;
      background: url("@/assets/down.svg") no-repeat center;
      background-size: 100% 100%;
      transition: transform 0.4s ease;
    }
    .down.rotate {
      transform: rotate(-90deg);
    }
    .down-light {
      width: 1.2rem;
      height: 1.2rem;
      margin: 0 0.6rem;
      background: url("@/assets/down_dark.svg") no-repeat center;
      background-size: 100% 100%;
      transition: transform 0.4s ease;
    }
    .down-light.rotate {
      transform: rotate(-90deg);
    }
  }
  .tool {
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;

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
    }

    .login-btn {
      border-radius: 10px;
      background: linear-gradient(
        135deg,
        rgba(200, 240, 220, 0.7) 0%,
        rgba(167, 243, 208, 0.65) 50%,
        rgba(110, 231, 183, 0.8) 100%
      );
      background-size: 300% 300%;
      animation: gradientFlow 8s ease-in-out infinite;
      color: var(--primary-color);
      font-weight: 600;
      transition: all 0.2s ease;
      box-shadow: 0 2px 8px rgba(0, 255, 136, 0.3),
        0 0 15px rgba(0, 200, 255, 0.2);
    }

    .register-btn {
      margin: 0 1rem;
      border-radius: 10px;
      background-color: transparent;
      font-weight: 600;
      &:hover {
        color: var(--primary-color);
      }
    }

    .register-btn-light {
      color: #777777;
    }

    .register-btn-dark {
      color: #fff;
    }
  }
}
/* Settings面板过渡动画 */
.settings-fade-enter-active {
  animation: settingsSlideIn 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.settings-fade-leave-active {
  animation: settingsSlideOut 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes settingsSlideIn {
  0% {
    opacity: 0;
    transform: translateY(-12px) scale(0.96);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes settingsSlideOut {
  0% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
  100% {
    opacity: 0;
    transform: translateY(-8px) scale(0.98);
  }
}

/* 菜单项交错动画 */
@keyframes itemFadeIn {
  0% {
    opacity: 0;
    transform: translateX(-10px);
  }
  100% {
    opacity: 1;
    transform: translateX(0);
  }
}

/* 图标hover微动效 */
@keyframes iconPulse {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.15);
  }
}

/* 模型选择面板过渡动画 */
.select-fade-enter-active {
  animation: selectSlideIn 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.select-fade-leave-active {
  animation: selectSlideOut 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes selectSlideIn {
  0% {
    opacity: 0;
    transform: translateY(-10px) scale(0.95);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes selectSlideOut {
  0% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
  100% {
    opacity: 0;
    transform: translateY(-6px) scale(0.98);
  }
}

/* 模型项交错淡入动画 */
@keyframes modelItemFadeIn {
  0% {
    opacity: 0;
    transform: translateY(8px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
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
  padding: 1.33rem;
  box-sizing: border-box;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08);
  backdrop-filter: blur(10px);

  .user-info {
    display: flex;
    align-items: center;
    border-bottom: 1px solid var(--border-color);
    padding-bottom: 1rem;
    animation: itemFadeIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;

    .user-avatar {
      width: 4rem;
      height: 4rem;
      margin-right: 1.07rem;
      transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1),
        box-shadow 0.3s ease;

      &:hover {
        transform: scale(1.05);
        box-shadow: 0 4px 12px rgba(24, 160, 88, 0.2);
      }

      :deep(.n-avatar__text) {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-size: 1rem;
        font-weight: 600;
      }
    }

    .user-details {
      .user-name {
        font-size: 1.3rem;
        font-weight: 600;
        color: var(--text-color);
        animation: itemFadeIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 0.1s
          forwards;
        opacity: 0;
      }
    }
  }

  .settings-options {
    .setting-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.4rem 0;
      border-radius: 8px;
      opacity: 0;
      animation: itemFadeIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
      animation-delay: calc(0.15s + var(--item-index) * 0.08s);

      &:last-child {
        border-bottom: none;
      }

      .setting-label {
        font-size: 1.07rem;
        color: var(--text-color);
        display: flex;
        align-items: center;
        cursor: pointer;
        padding: 0.7rem 1rem;
        border-radius: 8px;
        transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
        width: 100%;
        position: relative;
        overflow: hidden;

        &:hover {
          background-color: rgba(0, 0, 0, 0.05);
          .setting-icon {
            animation: iconPulse 0.4s ease;
          }
        }

        &:active {
          transform: translateX(4px) scale(0.98);
        }

        .setting-icon {
          margin-right: 0.3em;
          transition: transform 0.25s ease;
        }

        .setting-text {
          position: relative;
          z-index: 1;
        }
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
  width: 28rem;
  height: auto;
  max-height: 26rem;
  background: var(--select-color) no-repeat center;
  border-radius: 14px;
  position: absolute;
  top: 3.6rem;
  left: 12rem;
  z-index: 999;
  caret-color: transparent;
  padding: 0.75rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15), 0 2px 8px rgba(0, 0, 0, 0.08);
  backdrop-filter: blur(10px);

  .model-title {
    height: 2.33rem;
    padding: 0.5rem 1rem;
    line-height: 3.33rem;
    font-size: 1.2rem;
    font-weight: 600;
    color: var(--text-color);
    display: flex;
    align-items: center;
    justify-content: space-between;
    user-select: none;
    animation: itemFadeIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;

    .model-question {
      width: 1.33rem;
      height: 1.33rem;
      background: url("@/assets/question.svg") no-repeat center;
      background-size: 100% 100%;
      opacity: 0.5;
      transition: opacity 0.2s ease, transform 0.2s ease;
      cursor: pointer;

      &:hover {
        opacity: 0.8;
        transform: scale(1.1);
      }
    }
    .model-question-light {
      width: 1.33rem;
      height: 1.33rem;
      background: url("@/assets/question-dark.svg") no-repeat center;
      background-size: 100% 100%;
      opacity: 0.5;
      transition: opacity 0.2s ease, transform 0.2s ease;
      cursor: pointer;

      &:hover {
        opacity: 0.8;
        transform: scale(1.1);
      }
    }
  }

  .item {
    width: 100%;
    font-size: 1.07rem;
    color: var(--text-color);
    display: flex;
    flex-direction: column;
    justify-content: center;
    cursor: pointer;
    border-radius: 10px;
    padding: 0.875rem 1rem;
    box-sizing: border-box;
    user-select: none;
    margin-bottom: 4px;
    position: relative;
    overflow: hidden;
    opacity: 0;
    animation: modelItemFadeIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
    animation-delay: calc(0.15s + var(--model-index) * 0.08s);
    transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);

    .model-name {
      width: 100%;
      font-weight: 600;
      transition: color 0.2s ease, transform 0.2s ease;
    }
    .model-desc {
      width: 100%;
      color: var(--text-color-3);
      font-size: 13px;
      white-space: normal;
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      line-height: 1.5;
      margin-top: 0.2rem;
      transition: color 0.2s ease;
    }

    &:hover {
      background: linear-gradient(
        90deg,
        rgba(150, 150, 150, 0.2),
        rgba(150, 150, 150, 0.15)
      );
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    }

    &:active {
      transform: translateX(4px) scale(0.98);
    }
  }

  .item.selected {
    background-color: rgba(0, 200, 136, 0.12);
    border-left: 3px solid var(--primary-color);

    .model-name {
      color: var(--primary-color);
    }
  }

  .item.selected:hover {
    background-color: rgba(0, 200, 136, 0.18);
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
