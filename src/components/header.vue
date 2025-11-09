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
      <n-dropdown
        trigger="hover"
        size="small"
        :options="options"
        @select="handleSelect"
      >
        <div
          :class="{
            setting: theme === '浅色主题',
            'setting-light': theme === '深色主题',
          }"
        ></div>
      </n-dropdown>
      <n-avatar
        round
        :src="configStore.avatar ? configStore.avatar : backupImg"
        class="avatar"
      />
    </div>
  </div>
  <div class="select" :class="{ 'select-visible': showSelect }">
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
    <n-infinite-scroll style="height: 270px" :distance="10">
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
</template>

<script setup>
import {
  NAvatar,
  NDropdown,
  NIcon,
  useMessage,
  NInfiniteScroll,
  NTooltip,
} from "naive-ui";
import { ref, h, nextTick, onMounted, getCurrentInstance } from "vue";
import { Moon, Sun } from "@vicons/tabler";
import backupImg from "@/assets/avatar.jpg";
import { useConfigStore } from "@/stores/configStore";
const message = useMessage();
const configStore = useConfigStore();
const { proxy } = getCurrentInstance();

const renderIcon = (icon) => {
  return () => {
    return h(NIcon, null, {
      default: () => h(icon),
    });
  };
};

const theme = ref("浅色主题"); // 默认主题为深色，所以按钮展示为浅色
let themeIcon = Sun;

const options = ref([
  {
    label: theme.value,
    key: "theme",
    icon: renderIcon(themeIcon),
  },
]);

// 官方没有提供相关接口, 暂时采取手动添加模型列表
const Models = ref([
  {
    name: "qwq-plus-2025-03-05",
    key: "qwq-plus-2025-03-05",
    desc: "通义千问QwQ推理模型增强版，基于Qwen2.5模型训练的QwQ推理模型，通过强化学习大幅度提升了模型推理能力。",
  },
  {
    name: "qwen-plus-latest",
    key: "qwen-plus-latest",
    desc: "通义千问系列能力均衡的模型，推理效果和速度介于通义千问-Max和通义千问-Turbo之间，适合中等复杂任务。",
  },
  {
    name: "qwen-turbo-latest",
    key: "qwen-turbo-latest",
    desc: "通义千问系列速度最快、成本很低的模型，适合简单任务。",
  },
  {
    name: "qwen-max-latest",
    key: "qwen-max-latest",
    desc: "通义千问系列效果最好的模型，模型推理能力和复杂指令理解能力显著增强，困难任务上的表现更优，数学、代码能力显著提升。",
  },
  {
    name: "qwen3-235b-a22b",
    key: "qwen3-235b-a22b",
    desc: "实现思考模式和非思考模式的有效融合，可在对话中切换模式。",
  },
]);

let showSelect = ref(false);
const openModelSelect = () => {
  showSelect.value = !showSelect.value;
};
const selectModel = (model) => {
  configStore.setModel(model);
  showSelect.value = false;
};
const handleSelect = (key) => {
  if (key === "theme") {
    theme.value = theme.value === "深色主题" ? "浅色主题" : "深色主题";
    themeIcon = themeIcon === Moon ? Sun : Moon;
    options.value[0].label = theme.value;
    options.value[0].icon = renderIcon(themeIcon);
    if (theme.value === "深色主题") {
      configStore.setTheme("light");
    } else {
      configStore.setTheme("dark");
    }
  }
};

const goToMyGithub = () => {
  window.open("https://github.com/Ny9u");
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
  // await getModelList();
});
</script>

<style lang="less" scoped>
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
      width: 2.67rem;
      height: 2.67rem;
      margin: 0 1.07rem;
    }
  }
}
.select {
  width: 33.33rem;
  height: 21.33rem;
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
::v-deep(.n-scrollbar-rail) {
  display: none;
}
</style>
