<template>
  <n-config-provider :theme="theme">
    <div class="main" :class="{ 'light-mode': configStore.theme === 'light' }">
      <n-dialog-provider>
        <n-message-provider :placement="'top'" :max="3" :duration="3000">
          <main>
            <router-view />
          </main>
        </n-message-provider>
      </n-dialog-provider>
    </div>
  </n-config-provider>
</template>

<script setup>
import { computed, watch } from "vue";
import { darkTheme } from "naive-ui";
import { useConfigStore } from "./stores/configStore";

const configStore = useConfigStore();

const theme = computed(() => {
  if (configStore.theme === "light") {
    return null;
  }
  return darkTheme;
});

watch(
  () => configStore.theme,
  (value) => {
    const root = document.documentElement;
    if (value === "light") {
      root.classList.add("light-mode");
    } else {
      root.classList.remove("light-mode");
    }
  },
  { immediate: true },
);
</script>

<style lang="less" scoped>
.main {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  font-family: var(--font-family);

  main {
    flex: 1;
    overflow: hidden;
    display: flex;
    flex-direction: column;

    > * {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-height: 0;
    }
  }
}
</style>
