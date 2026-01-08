<template>
  <div class="app-container">
    <Sidebar />
    <div
      class="main-content"
      :class="{ 'sidebar-collapsed': configStore.sidebarCollapsed }"
    >
      <Header />
      <Chat />
    </div>
  </div>
</template>

<script setup>
import Header from "./components/header.vue";
import Chat from "./components/chat.vue";
import Sidebar from "./components/sidebar.vue";
import { useConfigStore } from "@/stores/configStore";

const configStore = useConfigStore();
</script>

<style lang="less" scoped>
.app-container {
  display: flex;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}

.main-content {
  flex: 1;
  margin-left: 16.75rem;
  transition: margin-left 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  display: flex;
  flex-direction: column;
  min-width: 0;

  &.sidebar-collapsed {
    margin-left: 4.5rem;
  }
}
</style>
