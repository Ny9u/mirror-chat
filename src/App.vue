<template>
  <n-config-provider :theme="theme">
    <div class="main" :class="{ 'light-mode': configStore.theme === 'light' }">
      <n-message-provider>
        <router-view />
      </n-message-provider>
    </div>
  </n-config-provider>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { darkTheme } from "naive-ui";
import { NConfigProvider, NMessageProvider } from "naive-ui";
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
