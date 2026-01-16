<template>
  <div class="chat-container">
    <div class="content">
      <div class="record">
        <messageList
          :userInput="inputValue"
          :netSearch="netSearch"
          :deepThinking="deepThinking"
          :knowledgeBase="knowledgeBase"
          ref="listRef"
        ></messageList>
      </div>
      <div class="input">
        <!-- 文件预览区域 -->
        <div v-if="uploadedFiles.length > 0" class="file-preview-container">
          <div
            v-for="(file, index) in uploadedFiles"
            :key="index"
            class="file-preview-item"
          >
            <!-- 图片预览 -->
            <div v-if="file.type.startsWith('image/')" class="image-preview">
              <img :src="file.url" :alt="file.name" />
              <div class="file-overlay">
                <n-button text class="remove-btn" @click="removeFile(index)">
                  <n-icon size="12">
                    <X />
                  </n-icon>
                </n-button>
              </div>
            </div>
            <!-- 文件信息 -->
            <div v-else class="file-info">
              <n-icon size="24" class="file-icon">
                <FileText />
              </n-icon>
              <div class="file-details">
                <div class="file-name">{{ file.name }}</div>
                <div class="file-size">{{ formatFileSize(file.size) }}</div>
              </div>
              <n-button text class="remove-btn" @click="removeFile(index)">
                <n-icon size="14">
                  <X />
                </n-icon>
              </n-button>
            </div>
          </div>
        </div>

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
            <div
              class="feature-button"
              :class="{ active: deepThinking }"
              @click="useDeepThinking"
            >
              <n-icon class="feature-button-icon" size="20">
                <Atom />
              </n-icon>
              <div class="feature-button-text">深度思考</div>
            </div>
            <div
              class="feature-button"
              :class="{ active: netSearch }"
              @click="useNetSearch"
            >
              <n-icon class="feature-button-icon" size="20">
                <World />
              </n-icon>
              <div class="feature-button-text">搜索</div>
            </div>
            <div
              class="feature-button"
              :class="{ active: knowledgeBase }"
              @click="useKnowledgeBase"
            >
              <n-icon class="feature-button-icon" size="20">
                <Book />
              </n-icon>
              <div class="feature-button-text">知识库</div>
            </div>
          </div>
          <div class="buttons">
            <!-- 上传文件按钮 -->
            <n-button text @click="triggerFileUpload" :disabled="loading">
              <div
                class="file-upload-icon"
                :class="{ active: uploadedFiles.length > 0 }"
              >
                <n-icon size="24">
                  <Paperclip />
                </n-icon>
                <span v-if="uploadedFiles.length > 0" class="file-count">
                  {{ uploadedFiles.length }}
                </span>
              </div>
            </n-button>
            <input
              ref="fileInputRef"
              type="file"
              multiple
              accept="image/*,application/pdf,.doc,.docx,.txt"
              style="display: none"
              @change="handleFileSelect"
            />
            <!-- 录音按钮 -->
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
            <!-- 发送按钮 -->
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
import { ref } from "vue";
import { NInput, NButton, useMessage, NIcon } from "naive-ui";
import messageList from "./messageList.vue";
import {
  World,
  Atom,
  Microphone,
  Book,
  Paperclip,
  X,
  FileText,
} from "@vicons/tabler";
import { asrRecognize } from "@/services/asrService.js";

const message = useMessage();
const inputValue = ref("");
const listRef = ref(null);
const netSearch = ref(false);
const deepThinking = ref(false);
const knowledgeBase = ref(false);
const loading = ref(false);
const recording = ref(false);
const abortController = ref(null);
const fileInputRef = ref(null);
const uploadedFiles = ref([]);

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
  if (!inputValue.value.trim() && uploadedFiles.value.length === 0) {
    message.warning("请先输入内容或上传文件 📝");
    return;
  }
  if (!listRef.value) {
    message.error("模型初始化失败，请稍后再试 ⚠️");
    return;
  }
  if (netSearch.value) {
    // 发送前先进行搜索(调用博查API需要付费,暂时不开发)
  }

  // TODO: 这里需要将 uploadedFiles 传递给 messageList 组件
  // 目前先保留文件列表，实际发送时需要根据 API 接口进行处理

  const isVaild = listRef.value.sendMessage(inputValue.value.trim());
  if (!isVaild) {
    return;
  }
  inputValue.value = "";
  // 清空已上传的文件
  uploadedFiles.value = [];
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
            message.error("服务请求失败，请检查网络连接 🌐");
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

const useKnowledgeBase = () => {
  knowledgeBase.value = !knowledgeBase.value;
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
        message.error("语音识别失败，请稍后再试 🎤");
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
          message.error("语音识别失败：" + error);
        }
      };

      mediaRecorder.start();
    }
  } catch (error) {
    message.error("录音失败：" + error);
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

// 文件上传相关方法
const triggerFileUpload = () => {
  fileInputRef.value?.click();
};

const handleFileSelect = (event) => {
  const files = Array.from(event.target.files || []);
  if (files.length === 0) return;

  // 检查文件大小（限制单个文件最大 10MB）
  const maxSize = 10 * 1024 * 1024;
  const invalidFiles = files.filter((file) => file.size > maxSize);

  if (invalidFiles.length > 0) {
    message.warning(`文件 ${invalidFiles[0].name} 超过 10MB 限制`);
    event.target.value = "";
    return;
  }

  // 检查文件总数（限制最多 5 个文件）
  if (uploadedFiles.value.length + files.length > 5) {
    message.warning("最多只能上传 5 个文件");
    event.target.value = "";
    return;
  }

  // 处理文件并生成预览
  files.forEach((file) => {
    const fileData = {
      name: file.name,
      size: file.size,
      type: file.type,
      file: file,
      url: "",
    };

    // 如果是图片，生成预览 URL
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        fileData.url = e.target.result;
      };
      reader.readAsDataURL(file);
    }

    uploadedFiles.value.push(fileData);
  });

  message.success(`成功添加 ${files.length} 个文件`);
  event.target.value = "";
};

const removeFile = (index) => {
  const fileName = uploadedFiles.value[index].name;
  uploadedFiles.value.splice(index, 1);
  message.info(`已移除文件: ${fileName}`);
};

const formatFileSize = (bytes) => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
};
</script>

<style lang="less" scoped>
.chat-container {
  width: 100%;
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

      .file-preview-container {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 0.6rem;
        margin-bottom: 0.6rem;
        padding: 0;

        .file-preview-item {
          position: relative;
          overflow: hidden;
          display: flex;
          align-items: center;

          .image-preview {
            position: relative;
            width: 80px;
            height: 80px;
            border-radius: 10px;
            overflow: hidden;
            background: var(--message-color);
            backdrop-filter: blur(20px) saturate(180%);
            -webkit-backdrop-filter: blur(20px) saturate(180%);
            border: 0.5px solid rgba(255, 255, 255, 0.1);
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            cursor: pointer;

            img {
              width: 100%;
              height: 100%;
              object-fit: cover;
            }

            .file-overlay {
              position: absolute;
              top: 0;
              right: 0;
              padding: 0.3rem;
              display: flex;
              align-items: flex-start;
              justify-content: flex-end;
              opacity: 0;
              transition: opacity 0.25s cubic-bezier(0.4, 0, 0.2, 1);

              .file-name {
                display: none;
              }

              .remove-btn {
                width: 20px;
                height: 20px;
                background: rgba(50, 50, 55, 0.85);
                backdrop-filter: blur(10px) saturate(180%);
                -webkit-backdrop-filter: blur(10px) saturate(180%);
                border-radius: 50%;
                border: 0.5px solid rgba(255, 255, 255, 0.15);
                color: #fff;
                padding: 0;
                min-width: auto;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
              }

              .remove-btn:hover {
                color: #ff3b30;
              }
            }

            &:hover .file-overlay {
              opacity: 1;
            }
          }

          .file-info {
            display: flex;
            align-items: center;
            gap: 0.6rem;
            padding: 0.5rem 0.8rem;
            background: var(--message-color);
            backdrop-filter: blur(20px) saturate(180%);
            -webkit-backdrop-filter: blur(20px) saturate(180%);
            border-radius: 10px;
            border: 0.5px solid rgba(255, 255, 255, 0.1);
            min-width: 200px;
            height: 52px;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            cursor: pointer;

            &:hover {
              border-color: var(--primary-color);
            }

            .file-icon {
              color: var(--primary-color);
              flex-shrink: 0;
            }

            .file-details {
              flex: 1;
              min-width: 0;

              .file-name {
                font-size: 13px;
                font-weight: 500;
                color: var(--text-color);
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
                margin-bottom: 0.15rem;
                line-height: 1.3;
              }

              .file-size {
                font-size: 11px;
                color: var(--text-color);
                opacity: 0.5;
                line-height: 1.2;
              }
            }

            .remove-btn {
              width: 22px;
              height: 22px;
              background: rgba(120, 120, 128, 0.2);
              backdrop-filter: blur(10px);
              -webkit-backdrop-filter: blur(10px);
              border-radius: 50%;
              border: 0.5px solid rgba(255, 255, 255, 0.1);
              color: var(--text-color);
              padding: 0;
              min-width: auto;
              opacity: 0;
              display: flex;
              align-items: center;
              justify-content: center;
              transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

              &:hover {
                background: rgba(255, 59, 48, 0.2);
                color: #ff3b30;
              }
            }

            &:hover .remove-btn {
              opacity: 1;
            }
          }
        }
      }

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
          .feature-button {
            display: flex;
            align-items: center;
            padding: 0.5rem 1rem;
            margin: 0 0.8rem 0 0;
            cursor: pointer;
            transition: all 0.2s ease;
            border-radius: 12px;
            color: var(--primary-color);
            background-color: transparent;
            font-size: 14px;
            font-weight: 600;
            user-select: none;

            &:hover {
              background-color: rgba(0, 0, 0, 0.1);
              transform: translateY(-1px);

              .feature-button-icon {
                color: var(--text-color);
              }

              .feature-button-text {
                color: var(--text-color);
              }
            }

            &.active {
              background: linear-gradient(
                135deg,
                rgba(200, 240, 220, 0.7) 0%,
                rgba(167, 243, 208, 0.65) 50%,
                rgba(110, 231, 183, 0.8) 100%
              );
              box-shadow: 0 2px 8px rgba(110, 231, 183, 0.2),
                0 0 10px rgba(110, 231, 183, 0.05);
              border: 1px solid var(--primary-color);

              .feature-button-icon {
                color: var(--text-color);
              }

              .feature-button-text {
                color: var(--text-color);
              }
            }

            .feature-button-icon {
              margin-right: 0.5rem;
              color: var(--text-color);
              transition: color 0.2s ease;
            }

            .feature-button-text {
              color: var(--text-color);
              transition: color 0.2s ease;
            }
          }
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

          .file-upload-icon {
            width: 2rem;
            height: 2rem;
            display: flex;
            align-items: center;
            justify-content: center;
            color: var(--text-color);
            transition: all 0.3s ease;
            position: relative;

            &:hover {
              color: var(--primary-color);
            }

            &.active {
              color: var(--primary-color);
            }

            .file-count {
              position: absolute;
              top: -4px;
              right: -8px;
              min-width: 16px;
              height: 16px;
              padding: 0 4px;
              background-color: var(--primary-color);
              color: #fff;
              font-size: 10px;
              font-weight: bold;
              border-radius: 8px;
              display: flex;
              align-items: center;
              justify-content: center;
              box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
            }
          }

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
