<template>
  <div class="chat">
    <div class="content">
      <div class="record">
        <messageList
          :userInput="inputValue"
          :netSearch="netSearch"
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
          <n-button ghost round :color="color" @click="useNetSearch">
            <template #icon>
              <n-icon>
                <World />
              </n-icon>
            </template>
            搜索
          </n-button>
          <n-button text style="font-size: 24px">
            <div class="upload" @click="sendMessage"></div>
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
import { World } from "@vicons/tabler";
import { useConfigStore } from "@/stores/configStore.js";
import { Request } from "@/utils/request.js";

const message = useMessage();
const configStore = useConfigStore();
const inputValue = ref("");
const listRef = ref(null);
const netSearch = ref(false);
const { proxy } = getCurrentInstance();
const color = computed(() => {
  if (netSearch.value) {
    return "#615ced";
  }
  return configStore.theme === "dark" ? "#fff" : "#000";
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

const sendMessage = async () => {
  if (!inputValue.value) {
    message.warning("请输入内容");
    return;
  }
  if (!listRef.value) {
    message.error("模型初始化失败");
    return;
  }
  if (netSearch.value) {
    // 发送前先进行搜索(调用博查API需要付费,暂时不开发)
    // Request({
    //   headers: {
    //     Authorization: "Bearer sk-060108ad28534136a153df7270fe204c",
    //     "Content-Type": "application/json",
    //     Accept: "*/*",
    //   },
    //   url: proxy.$api.netSearch,
    //   method: "POST",
    //   data: {
    //     query: inputValue.value,
    //   },
    // }).then((res) => {
    //   if (res.data.code === 200) {
    //     listRef.value.sendMessage(res.data.data);
    //   } else {
    //     message.error("搜索失败");
    //   }
    // });
    message.warning("联网功能开发中，暂不可用");
    return;
  }
  listRef.value.sendMessage(inputValue.value);
  inputValue.value = "";
  return new Promise((resolve, reject) => {
    listRef.value.fetchAI().then(
      (res) => {
        resolve(res);
      },
      (err) => {
        message.error("服务请求失败");
        reject(err);
      }
    );
  });
};

const useNetSearch = () => {
  netSearch.value = !netSearch.value;
};
</script>

<style lang="less" scoped>
.chat {
  width: 100vw;
  height: 100%;
  margin-top: 54px;
  display: flex;
  justify-content: center;
  background: var(--background-color) no-repeat center;
  .content {
    width: 70vw;
    height: 100vh;
    display: flex;
    flex-direction: column;
    .record {
      height: 70vh;
      margin-bottom: 50px;
    }
    .input {
      display: flex;
      flex-direction: column;
      .textarea {
        font-size: 17px;
        border-radius: 15px;
      }
      .tool {
        height: 60px;
        padding: 10px 0;
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
        .upload {
          width: 48px;
          height: 48px;
          background: url("@/assets/upload.png") no-repeat center;
        }
      }
    }
  }
}
:deep(.n-input-wrapper) {
  padding: 0 12px;
}
:deep(.n-button) {
  padding: 0 12px;
}
</style>
