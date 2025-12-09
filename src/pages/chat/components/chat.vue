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
          <div class="buttons">
            <n-button text @click="handleRecordClick" :disabled="loading">
              <div v-show="!recording" class="record-icon">
                <n-icon size="24">
                  <Microphone />
                </n-icon>
              </div>
              <div v-show="recording" class="recording-indicator">
                <span class="dot"></span>
                <span class="dot"></span>
                <span class="dot"></span>
              </div>
            </n-button>
            <div class="divider"></div>
            <n-button text @click="handleSendClick">
              <div v-show="!loading" class="upload"></div>
              <div v-show="loading" class="loading"></div>
            </n-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, getCurrentInstance } from "vue";
import { NInput, NButton, useMessage, NIcon } from "naive-ui";
import messageList from "./messageList.vue";
import { World, Atom, Microphone } from "@vicons/tabler";
import { useConfigStore } from "@/stores/configStore.js";
import { Request } from "@/utils/request.js";
import { asrRecognize } from "@/services/asrService.js";

const message = useMessage();
const configStore = useConfigStore();
const inputValue = ref("");
const listRef = ref(null);
const netSearch = ref(false);
const deepThinking = ref(false);
const loading = ref(false);
const recording = ref(false);
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
  const isVaild = listRef.value.sendMessage(inputValue.value.trim());
  if (!isVaild) {
    return;
  }
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

let mediaRecorder = null;
let audioChunks = [];
let recognition = null;

const handleRecordClick = () => {
  if (recording.value) {
    stopRecording();
  } else {
    startRecording();
  }
};

const startRecording = async () => {
  try {
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      recognition = new SpeechRecognition();
      recognition.lang = "zh-CN";
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        recording.value = true;
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        inputValue.value = transcript;
      };

      recognition.onerror = (event) => {
        message.error("语音识别失败，请重试");
        recording.value = false;
      };

      recognition.onend = () => {
        recording.value = false;
      };

      recognition.start();
    } else {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder = new MediaRecorder(stream);
      audioChunks = [];

      mediaRecorder.onstart = () => {
        recording.value = true;
      };

      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        recording.value = false;
        // 将所有音频块合并成一个Blob对象
        const audioBlob = new Blob(audioChunks, { type: "audio/wav" });
        const formData = new FormData();
        formData.append("audio", audioBlob, "record.wav");
        try {
          const res = await asrRecognize(formData);
          inputValue.value = res.data.ResultDetail[0].FinalSentence;
        } catch (error) {
          message.error("语音识别失败:", error);
        }
      };

      mediaRecorder.start();
    }
  } catch (error) {
    message.error("录音失败:", error);
  }
};

const stopRecording = () => {
  if (recognition) {
    recognition.stop();
    recognition = null;
  }

  if (mediaRecorder && mediaRecorder.state !== "inactive") {
    mediaRecorder.stop();
    mediaRecorder.stream.getTracks().forEach((track) => track.stop());
    mediaRecorder = null;
  }

  recording.value = false;
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
            background: linear-gradient(
              135deg,
              rgba(200, 240, 220, 0.6) 0%,
              rgba(167, 243, 208, 0.55) 50%,
              rgba(110, 231, 183, 0.5) 100%
            );
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
        .buttons {
          display: flex;
          align-items: center;

          .record-icon {
            width: 2rem;
            height: 2rem;
            display: flex;
            align-items: center;
            justify-content: center;
            color: var(--text-color);
            transition: all 0.3s ease;

            &:hover {
              color: var(--primary-color);
            }
          }

          .recording-indicator {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 2rem;
            height: 2rem;

            .dot {
              display: inline-block;
              width: 6px;
              height: 6px;
              border-radius: 50%;
              background-color: var(--text-color);
              margin: 0 2px;
              animation: pulse 1.4s infinite ease-in-out both;

              &:nth-child(1) {
                animation-delay: -0.32s;
              }

              &:nth-child(2) {
                animation-delay: -0.16s;
              }
            }
          }

          .divider {
            width: 1px;
            height: 1.25rem;
            background-color: var(--text-color);
            opacity: 0.2;
          }
        }

        @keyframes pulse {
          0%,
          80%,
          100% {
            transform: scale(0);
            opacity: 0.5;
          }
          40% {
            transform: scale(1);
            opacity: 1;
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
