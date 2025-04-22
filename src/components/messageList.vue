<template>
  <div class="message-list" v-if="chatHistory.slice(1).length">
    <n-virtual-list
      ref="virtualListRef"
      style="max-height: 70vh"
      :item-size="30"
      :items="chatHistory.slice(1)"
      item-resizable
    >
      <template #default="{ item }">
        <div
          :key="item.key"
          class="item"
          :style="{
            flexDirection: item.role === 'assistant' ? 'row' : 'row-reverse',
          }"
        >
          <n-avatar round :src="getAvatar(item.role)" class="avatar" />
          <div class="text-container">
            <div class="text">
              <div v-html="item.content"></div>
            </div>
          </div>
        </div>
      </template>
    </n-virtual-list>
  </div>
  <div class="welcome" v-show="!chatHistory.slice(1).length">
    <div id="typed" class="welcome-text"></div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { NVirtualList, NAvatar } from "naive-ui";
import assistantUrl from "../assets/assistant.svg";
import userUrl from "../assets/avatar.jpg";
import OpenAI from "openai";
import Global from "../utils/global.js";
import MarkdownIt from "markdown-it";
import Typed from "typed.js";

defineProps({ userInput: String });

const md = new MarkdownIt();
const virtualListRef = ref(null);
const chatHistory = ref(
  JSON.parse(localStorage.getItem("chatHistory")) || [
    {
      role: "system",
      content: "You are a helpful assistant.",
      key: Global.getRandomKey(),
    },
  ]
);

const role = ["assistant", "user"];

// 初始化openai
const openai = new OpenAI({
  apiKey: "sk-1555dc8ec09a4b19a34e7b9392a928c8",
  baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1",
  dangerouslyAllowBrowser: true,
});

// 发送消息
const sendMessage = (userInput) => {
  chatHistory.value.push({
    role: "user",
    content: userInput,
    key: Global.getRandomKey(),
  });
  localStorage.setItem("chatHistory", JSON.stringify(chatHistory.value));
};

const fetchAI = async () => {
  const completion = await openai.chat.completions.create({
    model: "qwen-plus",
    messages: chatHistory.value,
    stream: true,
    stream_options: {
      include_usage: true,
    },
  });
  if (!completion) {
    throw new Error("请求服务失败");
  }
  let fullContent = "";
  chatHistory.value.push({
    role: "assistant",
    content: fullContent,
    key: Global.getRandomKey(),
  });
  for await (const chunk of completion) {
    if (Array.isArray(chunk.choices) && chunk.choices.length > 0) {
      fullContent = fullContent + chunk.choices[0].delta.content;
      chatHistory.value[chatHistory.value.length - 1].content =
        md.render(fullContent);
      virtualListRef.value.scrollTo({
        position: "bottom",
      });
    }
  }
  localStorage.setItem("chatHistory", JSON.stringify(chatHistory.value));
  return fullContent;
};
const getAvatar = (role) => {
  return role === "assistant" ? assistantUrl : userUrl;
};

const scrollToBottom = () => {
  virtualListRef.value.scrollTo({
    index: chatHistory.value.length - 2,
  });
};

defineExpose({ sendMessage, fetchAI });
onMounted(() => {
  new Typed("#typed", {
    strings: ["下午好, Master🥰"],
    typeSpeed: 50,
    backSpeed: 0,
    loop: false,
    showCursor: false,
  });
  if (virtualListRef.value) {
    scrollToBottom();
  }
});
</script>

<style lang="less" scoped>
.message-list {
  width: 70vw;
  height: 70vh;
  background: #2b2b31 no-repeat center;
  .item {
    display: flex;
    align-items: flex-start;
    margin: 40px 0;
    color: #fff;
  }
  .avatar {
    width: 32px;
    height: 32px;
    margin: 0 10px;
  }
  .text-container {
    max-width: 560px;
    background: #414149 no-repeat center;
    border-radius: 8px;
    .text {
      padding: 10px 20px;
      font-size: 16px;
    }
  }
  ::v-deep(.n-scrollbar-rail) {
    display: none;
  }
}
.welcome {
  width: 70vw;
  height: 70vh;
  background: #2b2b31 no-repeat center;
  display: flex;
  justify-content: center;
  align-items: center;
  .welcome-text {
    font-size: 30px;
    font-weight: bold;
    color: #fff;
  }
}
</style>
