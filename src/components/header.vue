<template>
  <div class="header">
    <div class="info">
      <div
        :class="{
          logo: theme === '浅色主题',
          'logo-light': theme === '深色主题',
        }"
      ></div>
      <div class="title">Mirror-Chat</div>
    </div>
    <div class="tool">
      <n-dropdown
        trigger="click"
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
      <n-avatar round :src="imgUrl" class="avatar" />
    </div>
  </div>
</template>

<script setup>
import { NAvatar, NDropdown, NIcon } from "naive-ui";
import { ref, h } from "vue";
import { Moon, Sun } from "@vicons/tabler";
import imgUrl from "@/assets/avatar.jpg";
import { useConfigStore } from "@/stores/configStore";

const configStore = useConfigStore();

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
</script>

<style lang="less" scoped>
.header {
  width: 100vw;
  height: 54px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: fixed;
  top: 0;
  background: var(--background-color) no-repeat center;
  .info {
    display: flex;
    align-items: center;
    .logo {
      width: 48px;
      height: 48px;
      margin: 0 16px;
      background: url("@/assets/logo.svg") no-repeat center;
    }
    .logo-light {
      width: 48px;
      height: 48px;
      margin: 0 16px;
      background: url("@/assets/logo_dark.svg") no-repeat center;
    }
    .title {
      width: 152px;
      height: 32px;
      font-size: 22px;
      font-weight: 800;
      color: var(--text-color);
    }
  }
  .tool {
    display: flex;
    align-items: center;
    justify-content: center;

    .setting {
      width: 16px;
      height: 16px;
      margin: 0 16px;
      background: url("@/assets/more.svg") no-repeat center;
      background-size: 100% 100%;
    }
    .setting:hover {
      cursor: pointer;
      opacity: 0.8;
    }
    .setting-light {
      width: 16px;
      height: 16px;
      margin: 0 16px;
      background: url("@/assets/more_dark.svg") no-repeat center;
      background-size: 100% 100%;
    }
    .setting-light:hover {
      cursor: pointer;
      opacity: 0.8;
    }
    .avatar {
      width: 40px;
      height: 40px;
      margin: 0 16px;
    }
  }
}
</style>
