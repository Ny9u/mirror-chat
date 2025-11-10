<template>
  <div class="chat-container">
    <div class="content">
      <div class="record">
        <messageList
          :userInput="inputValue"
          :netSearch="netSearch"
          :deepThinking="deepThinking"
          ref="listRef"
        ></messageList>
      </div>
      <div class="input">
        <n-input
          placeholder="有什么我能帮您的吗?"
          type="textarea"
          size="tiny"
          round
          :value="inputValue"
          :autosize="{
            minRows: 4,
            maxRows: 4,
          }"
          @input="handleInput"
          @keydown.enter="handleEnter"
          class="textarea"
        />
        <div class="tool">
          <div class="features">
            <n-button ghost :color="thinkColor" @click="useDeepThinking">
              <template #icon>
                <n-icon>
                  <Atom />
                </n-icon>
              </template>
              深度思考
            </n-button>
            <n-button ghost :color="netColor" @click="useNetSearch">
              <template #icon>
                <n-icon>
                  <World />
                </n-icon>
              </template>
              搜索
            </n-button>
          </div>
          <n-button text @click="handleSendClick">
            <div v-show="!loading" class="upload"></div>
            <div v-show="loading" class="loading"></div>
          </n-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, getCurrentInstance } from "vue";
import { NInput, NButton, useMessage, NIcon } from "naive-ui";
import messageList from "./messageList.vue";
import { World, Atom } from "@vicons/tabler";
import { useConfigStore } from "@/stores/configStore.js";
import { Request } from "@/utils/request.js";

const message = useMessage();
const configStore = useConfigStore();
const inputValue = ref("");
const listRef = ref(null);
const netSearch = ref(false);
const deepThinking = ref(false);
const loading = ref(false);
const abortController = ref(null);

const netColor = computed(() => {
  if (netSearch.value) {
    return "#7fe7c4";
  }
  return configStore.theme === "dark" ? "#ffffff" : "#000000";
});

const thinkColor = computed(() => {
  if (deepThinking.value) {
    return "#7fe7c4";
  }
  return configStore.theme === "dark" ? "#ffffff" : "#000000";
});

const handleInput = (value) => {
  inputValue.value = value;
};

const handleEnter = (e) => {
  if (!e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
};

const handleSendClick = () => {
  if (loading.value) {
    if (abortController.value) {
      abortController.value.abort();
      loading.value = false;
      return;
    }
  }
  sendMessage();
};

const sendMessage = async () => {
  if (!inputValue.value.trim()) {
    message.warning("请输入内容");
    return;
  }
  if (!listRef.value) {
    message.error("模型初始化失败");
    return;
  }
  if (netSearch.value) {
    // 发送前先进行搜索(调用博查API需要付费,暂时不开发)
  }
  listRef.value.sendMessage(inputValue.value.trim());
  inputValue.value = "";
  loading.value = true;
  abortController.value = new AbortController();
  return new Promise((resolve, reject) => {
    listRef.value
      .fetchAI(abortController.value.signal)
      .then(
        (res) => {
          resolve(res);
        },
        (err) => {
          if (err.name !== "AbortError") {
            message.error("服务请求失败");
          }
          reject(err);
        }
      )
      .finally(() => {
        loading.value = false;
        abortController.value = null;
      });
  });
};

const useNetSearch = () => {
  netSearch.value = !netSearch.value;
};

const useDeepThinking = () => {
  deepThinking.value = !deepThinking.value;
};
</script>

<style lang="less" scoped>
.chat-container {
  width: 100vw;
  height: 100%;
  margin-top: 3.6rem;
  display: flex;
  justify-content: center;
  background: var(--background-color) no-repeat center;
  .content {
    width: 70vw;
    height: 100vh;
    display: flex;
    flex-direction: column;
    .record {
      margin-bottom: 3.33rem;
    }
    .input {
      display: flex;
      flex-direction: column;
      .textarea {
        padding: 0.3rem 0;
        font-size: 1.13rem;
        border-radius: 1rem;
      }
      .tool {
        height: 4rem;
        padding: 0.67rem 0;
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
        .features {
          display: flex;
          gap: 10px;
          :deep(.n-button) {
            border-radius: 10px;
          }
          :deep(.n-button:hover) {
            background-color: rgba(24, 160, 88, 0.15);
            transition: all 0.3s ease;
          }
        }
        .upload {
          width: 3.2rem;
          height: 3.2rem;
          background: url("@/assets/upload.png") no-repeat center;
        }
        .loading {
          width: 3.2rem;
          height: 3.2rem;
          background: url("@/assets/loading.svg") no-repeat center;
          background-size: 70% 70%;
          animation: rotate 1s linear infinite;
        }
        @keyframes rotate {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      }
    }
  }
}
:deep(.n-input-wrapper) {
  padding: 0 0.8rem;
}
:deep(.n-button) {
  padding: 0 0.8rem;
}
</style>
