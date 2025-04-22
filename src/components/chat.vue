<template>
  <div class="chat">
    <div class="content">
      <div class="record">
        <messageList :userInput="inputValue" ref="listRef"></messageList>
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
          <n-button text style="font-size: 24px">
            <div class="upload" @click="sendMessage"></div>
          </n-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { NInput, NButton, useMessage } from "naive-ui";
import messageList from "./messageList.vue";
import Global from "../utils/global";

const message = useMessage();
const inputValue = ref("");
const listRef = ref(null);
const btnDisable = ref(false);
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
</script>

<style lang="less" scoped>
.chat {
  width: 100vw;
  height: 100%;
  margin-top: 54px;
  display: flex;
  justify-content: center;
  background: #2b2b31 no-repeat center;
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
        flex-direction: row-reverse;
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
</style>
