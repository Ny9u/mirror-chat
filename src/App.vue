<template>
  <n-config-provider :theme="theme">
    <div class="main">
      <n-message-provider>
        <Header />
        <Chat />
      </n-message-provider>
    </div>
  </n-config-provider>
</template>

<script setup>
import { ref } from "vue";
import { darkTheme } from "naive-ui";
import { NConfigProvider, NMessageProvider } from "naive-ui";
import Header from "./components/header.vue";
import Chat from "./components/chat.vue";

const theme = ref(darkTheme);
</script>

<style lang="less" scoped>
.main {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
}
</style>
