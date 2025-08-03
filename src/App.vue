<template>
  <n-config-provider :theme="theme">
    <div class="main" :class="{ 'light-mode': configStore.theme === 'light' }">
      <n-message-provider>
        <!-- 设置 n-skeleton 的 theme-overrides 属性来控制骨架屏颜色 -->
        <!-- 在亮色模式下设置深色骨架屏，在暗色模式下设置浅色骨架屏 -->
        <!-- 当 configStore.avatar 为空或者指定数据未获取时显示骨架屏 -->
        <n-skeleton
          width="100%"
          height="100%"
          text="true"
          repeat="1"
          v-show="configStore.avatar === ''"
          :theme-overrides="{
            color: '#444444',
            animation: {
              name: 'n-skeleton-shimmer',
              duration: '3s',
              timingFunction: 'linear',
              iterationCount: 'infinite',
            },
          }"
          style="transition: opacity 1s ease-out"
        >
        </n-skeleton>
        <div v-show="configStore.avatar">
          <Header />
          <Chat />
        </div>
      </n-message-provider>
    </div>
  </n-config-provider>
</template>

<script setup>
import { ref, computed } from "vue";
import { darkTheme } from "naive-ui";
import { NConfigProvider, NMessageProvider, NSkeleton } from "naive-ui";
import Header from "./components/header.vue";
import Chat from "./components/chat.vue";
import { useConfigStore } from "./stores/configStore";

const configStore = useConfigStore();

const theme = computed(() => {
  if (configStore.theme === "light") {
    return null;
  }
  return darkTheme;
});
</script>

<style lang="less" scoped>
.main {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
}
</style>
