<template>
  <div class="chat-container">
    <div class="content">
      <div
        class="record"
        :class="{
          uploading: uploadedFiles.length > 0,
          'has-messages': hasMessages,
        }"
      >
        <messageList
          :userInput="inputValue"
          :netSearch="netSearch"
          :deepThinking="deepThinking"
          :knowledgeBase="knowledgeBase"
          :imageGeneration="imageGeneration"
          ref="listRef"
          @regenerateImage="handleRegenerateImage"
          @generateImage="handleRegenerateImage"
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
              <img :src="getFileIcon(file.name)" class="file-icon" />
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
          :placeholder="
            imageGeneration ? '描述你想要的图片' : '有什么我能帮您的吗?'
          "
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
              v-show="!imageGeneration"
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
              v-show="!imageGeneration"
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
              v-show="!imageGeneration"
              class="feature-button"
              :class="{ active: knowledgeBase }"
              @click="useKnowledgeBase"
            >
              <n-icon class="feature-button-icon" size="20">
                <Book />
              </n-icon>
              <div class="feature-button-text">知识库</div>
            </div>
            <n-popover
              v-if="imageGeneration"
              trigger="hover"
              placement="bottom"
              raw
              :show-arrow="false"
              class="feature-popover"
            >
              <template #trigger>
                <div
                  class="feature-button"
                  :class="{ active: imageGeneration }"
                  @click="useImageGeneration"
                >
                  <n-icon class="feature-button-icon" size="20">
                    <Photo />
                  </n-icon>
                  <div class="feature-button-text">
                    图像生成
                    <n-icon class="exit-icon" size="14">
                      <X />
                    </n-icon>
                  </div>
                </div>
              </template>
              <span>点击退出技能</span>
            </n-popover>
            <div
              v-else
              class="feature-button"
              :class="{ active: imageGeneration }"
              @click="useImageGeneration"
            >
              <n-icon class="feature-button-icon" size="20">
                <Photo />
              </n-icon>
              <div class="feature-button-text">图像生成</div>
            </div>

            <template v-if="imageGeneration">
              <!-- 比例选择 -->
              <div class="dropdown-wrapper">
                <div
                  class="dropdown-button"
                  :class="{ active: showRatioDropdown }"
                  @click="toggleRatioDropdown"
                >
                  <n-icon size="20">
                    <ArrowsDiagonal />
                  </n-icon>
                  <span style="font-weight: 600">比例</span>
                  <n-icon size="16" class="dropdown-arrow">
                    <ChevronDown />
                  </n-icon>
                </div>
                <Transition name="dropdown-fade">
                  <div v-show="showRatioDropdown" class="dropdown-menu">
                    <div class="dropdown-header">比例</div>
                    <div class="dropdown-options">
                      <div
                        v-for="option in ratioOptions"
                        :key="option.value"
                        class="dropdown-option"
                        :class="{
                          selected: selectedRatio.value === option.value,
                        }"
                        @click="selectRatio(option)"
                      >
                        <div class="option-content">
                          <div class="option-left">
                            <n-icon size="16">
                              <component :is="option.icon" />
                            </n-icon>
                            <span>{{ option.label }}</span>
                            <n-icon
                              v-if="selectedRatio.value === option.value"
                              class="check-icon"
                              size="16"
                            >
                              <Check />
                            </n-icon>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Transition>
              </div>

              <!-- 风格选择 -->
              <div class="dropdown-wrapper">
                <div
                  class="dropdown-button"
                  :class="{ active: showStyleDropdown }"
                  @click="toggleStyleDropdown"
                >
                  <n-icon size="20">
                    <Palette />
                  </n-icon>
                  <span style="font-weight: 600">风格</span>
                  <n-icon size="16" class="dropdown-arrow">
                    <ChevronDown />
                  </n-icon>
                </div>
                <Transition name="dropdown-fade">
                  <div v-show="showStyleDropdown" class="dropdown-menu">
                    <div class="dropdown-header">风格</div>
                    <div class="dropdown-options">
                      <div
                        v-for="option in styleOptions"
                        :key="option.value"
                        class="dropdown-option"
                        :class="{
                          selected: selectedStyle.value === option.value,
                        }"
                        @click="selectStyle(option)"
                      >
                        <div class="option-content">
                          <span>{{ option.label }}</span>
                          <n-icon
                            v-if="selectedStyle.value === option.value"
                            class="check-icon"
                            size="16"
                          >
                            <Check />
                          </n-icon>
                        </div>
                      </div>
                    </div>
                  </div>
                </Transition>
              </div>
            </template>
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
              :accept="
                imageGeneration
                  ? 'image/png,image/jpeg,image/webp,image/gif,image/svg+xml,image/bmp'
                  : 'image/*,application/pdf,.doc,.docx,.txt,.md'
              "
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
import { ref, onMounted, onUnmounted, computed } from "vue";
import { NInput, NButton, useMessage, NIcon, NPopover } from "naive-ui";
import messageList from "./messageList.vue";
import {
  World,
  Atom,
  Microphone,
  Book,
  Paperclip,
  X,
  Photo,
  ArrowsDiagonal,
  Palette,
  Square,
  Rectangle,
  Layout,
  LayoutList,
  Check,
  ChevronDown,
} from "@vicons/tabler";
import { asrRecognize } from "@/services/asrService.js";
import { generateImage } from "@/services/user.js";
import { useConfigStore } from "@/stores/configStore";
import Models from "@/config/models.js";

const message = useMessage();
const configStore = useConfigStore();
const inputValue = ref("");
const listRef = ref(null);
const netSearch = ref(false);
const deepThinking = ref(false);
const knowledgeBase = ref(false);
const imageGeneration = ref(false);
const loading = ref(false);
const recording = ref(false);
const abortController = ref(null);
const fileInputRef = ref(null);
const uploadedFiles = ref([]);

// 判断聊天记录是否有用户消息
const hasMessages = computed(() => {
  if (!listRef.value?.chatHistory) return false;
  return listRef.value.chatHistory.some((msg) => msg.role !== "system");
});

// 图像生成选项
const showRatioDropdown = ref(false);
const showStyleDropdown = ref(false);
const selectedRatio = ref({ label: "", value: "" });
const selectedStyle = ref({ label: "", value: "" });

const ratioOptions = [
  { label: "1:1", value: "1:1", icon: Square },
  { label: "16:9", value: "16:9", icon: Rectangle },
  { label: "9:16", value: "9:16", icon: Layout },
  { label: "4:3", value: "4:3", icon: Layout },
  { label: "3:4", value: "3:4", icon: LayoutList },
];

const styleOptions = [
  { label: "写实", value: "realistic" },
  { label: "卡通", value: "cartoon" },
  { label: "油画", value: "oil-painting" },
  { label: "水彩", value: "watercolor" },
  { label: "素描", value: "sketch" },
  { label: "3D渲染", value: "3d-render" },
  { label: "极简主义", value: "minimalist" },
  { label: "赛博朋克", value: "cyberpunk" },
  { label: "吉卜力风格", value: "ghibli" },
  { label: "像素风", value: "pixel-art" },
];

const handleInput = (value) => {
  inputValue.value = value;
};

const ratioToSize = {
  "1:1": "1328*1328",
  "16:9": "1664*928",
  "9:16": "928*1664",
  "4:3": "1472*1104",
  "3:4": "1104*1472",
};

const generateImageMessage = async () => {
  if (!inputValue.value.trim()) {
    message.warning("请先输入图片描述 📝");
    return;
  }
  if (!listRef.value) {
    message.error("模型初始化失败，请稍后再试 ⚠️");
    return;
  }

  let prompt = inputValue.value.trim();
  const ratio = selectedRatio.value.value;

  const isValid = listRef.value.sendMessage(prompt);
  if (!isValid) {
    return;
  }

  inputValue.value = "";
  uploadedFiles.value = [];
  selectedRatio.value = { label: "", value: "" };
  selectedStyle.value = { label: "", value: "" };
  loading.value = true;

  try {
    const params = {
      prompt,
      model: "qwen-image-max",
      size: ratioToSize[ratio] || "1328*1328",
      prompt_extend: true,
      watermark: false,
      chatId: configStore.chatId || undefined,
    };

    const generatingKey = listRef.value.addImageMessage(ratio);
    const res = await generateImage(params);

    if (res && res.data && res.data.url) {
      if (res.data.chatId) {
        configStore.setChatId(res.data.chatId);
      }
      listRef.value.updateImageMessage(generatingKey, res.data.url, ratio);
    } else {
      message.error("图片生成失败 ⚠️");
    }
  } catch (err) {
    message.error("服务请求失败，请检查网络连接 🌐");
  } finally {
    loading.value = false;
  }
};

const handleRegenerateImage = async ({ prompt, ratio }) => {
  if (!listRef.value) {
    message.error("模型初始化失败，请稍后再试 ⚠️");
    return;
  }

  const selectedRatioValue = ratio || selectedRatio.value.value;

  const generatingKey = listRef.value.addImageMessage(ratio);
  loading.value = true;

  try {
    const params = {
      prompt,
      model: "qwen-image-max",
      size: ratioToSize[selectedRatioValue] || "1328*1328",
      prompt_extend: true,
      watermark: false,
      chatId: configStore.chatId || undefined,
      isRegenerate: true,
    };

    const res = await generateImage(params);

    if (res && res.data && res.data.url) {
      if (res.data.chatId) {
        configStore.setChatId(res.data.chatId);
      }
      listRef.value.updateImageMessage(generatingKey, res.data.url, ratio);
    } else {
      message.error("图片生成失败 ⚠️");
    }
  } catch (err) {
    message.error("服务请求失败，请检查网络连接 🌐");
  } finally {
    loading.value = false;
  }
};

const handleGenerateImage = async ({ prompt, ratio }) => {
  if (!listRef.value) {
    message.error("模型初始化失败，请稍后再试 ⚠️");
    return;
  }

  const selectedRatioValue = ratio || selectedRatio.value.value;

  const generatingKey = listRef.value.addImageMessage(ratio);
  loading.value = true;

  try {
    const params = {
      prompt,
      model: "qwen-image-max",
      size: ratioToSize[selectedRatioValue] || "1328*1328",
      prompt_extend: true,
      watermark: false,
      chatId: configStore.chatId || undefined,
    };

    const res = await generateImage(params);

    if (res && res.data && res.data.url) {
      if (res.data.chatId) {
        configStore.setChatId(res.data.chatId);
      }
      listRef.value.updateImageMessage(generatingKey, res.data.url, ratio);
    } else {
      message.error("图片生成失败 ⚠️");
    }
  } catch (err) {
    message.error("服务请求失败，请检查网络连接 🌐");
  } finally {
    loading.value = false;
  }
};

const handleEnter = (e) => {
  if (!e.shiftKey) {
    e.preventDefault();
    if (imageGeneration.value) {
      generateImageMessage();
    } else {
      sendMessage();
    }
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
  if (imageGeneration.value) {
    generateImageMessage();
  } else {
    sendMessage();
  }
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

  // 提取图片数据
  const images = uploadedFiles.value
    .filter((file) => file.type.startsWith("image/"))
    .map((file) => file.url);

  // 提取文件数据(不包含图片)
  const files = uploadedFiles.value
    .filter((file) => !file.type.startsWith("image/"))
    .map((file) => file.file);

  const isVaild = listRef.value.sendMessage(
    inputValue.value.trim(),
    images,
    files,
  );
  if (!isVaild) {
    return;
  }
  inputValue.value = "";
  uploadedFiles.value = [];
  loading.value = true;
  abortController.value = new AbortController();

  return new Promise((resolve, reject) => {
    listRef.value
      .fetchAI(abortController.value.signal, images, files)
      .then(
        (res) => {
          resolve(res);
        },
        (err) => {
          if (err.name !== "AbortError") {
            message.error("服务请求失败，请检查网络连接 🌐");
          }
          reject(err);
        },
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

const useImageGeneration = () => {
  if (!imageGeneration.value) {
    // 进入图像生成模式
    imageGeneration.value = true;
    configStore.setImageGenerationMode(true);
    configStore.setPreviousModel(configStore.model);
    const imageModel = Models.find((m) => m.key === "wan2.6-image");
    if (imageModel) {
      configStore.setModel(imageModel.key);
    }
    netSearch.value = false;
    deepThinking.value = false;
    knowledgeBase.value = false;
  } else {
    imageGeneration.value = false;
    configStore.setImageGenerationMode(false);
    if (configStore.previousModel) {
      configStore.setModel(configStore.previousModel);
      configStore.setPreviousModel(null);
    }
  }
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

  const allowedExtensions = imageGeneration.value
    ? [".png", ".jpg", ".jpeg", ".webp", ".bmp"]
    : [
        ".png",
        ".jpg",
        ".jpeg",
        ".webp",
        ".bmp",
        ".gif",
        ".svg",
        ".doc",
        ".docx",
        ".txt",
        ".md",
      ];

  // 检查文件类型（仅通过扩展名判断）
  const invalidTypeFiles = files.filter((file) => {
    const ext = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
    return !allowedExtensions.includes(ext);
  });

  if (invalidTypeFiles.length > 0) {
    const invalidNames = invalidTypeFiles.map((f) => f.name).join("、");
    message.warning(`不支持的文件类型：${invalidNames}`);
    event.target.value = "";
    return;
  }

  // 检查文件大小（限制单个文件最大 10MB）
  const maxSize = 10 * 1024 * 1024;
  const invalidFiles = files.filter((file) => file.size > maxSize);

  if (invalidFiles.length > 0) {
    message.warning(`文件过大，请上传小于 10MB 的文件`);
    event.target.value = "";
    return;
  }

  // 检查文件总数
  if (uploadedFiles.value.length + files.length > 5) {
    message.warning("最多只能上传 5 个文件");
    event.target.value = "";
    return;
  }

  // 处理文件并生成预览
  const processFiles = async (fileList) => {
    for (const file of fileList) {
      let fileUrl = "";

      if (file.type.startsWith("image/")) {
        try {
          fileUrl = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = (e) => {
              reject(new Error("图片读取失败"));
            };
            reader.readAsDataURL(file);
          });
        } catch (error) {
          console.error("图片预览生成失败:", error);
        }
      }

      const fileData = {
        name: file.name,
        size: file.size,
        type: file.type,
        file: file,
        url: fileUrl,
      };

      uploadedFiles.value.push(fileData);
    }
  };

  processFiles(files);

  event.target.value = "";
};

const removeFile = (index) => {
  uploadedFiles.value.splice(index, 1);
};

const formatFileSize = (bytes) => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
};

const getFileIcon = (fileName) => {
  const ext = fileName.split(".").pop()?.toLowerCase() || "";
  switch (ext) {
    case "pdf":
      return new URL("@/assets/PDF.svg", import.meta.url).href;
    case "doc":
    case "docx":
      return new URL("@/assets/DOCX.svg", import.meta.url).href;
    case "txt":
    case "md":
    default:
      return new URL("@/assets/Markdown.svg", import.meta.url).href;
  }
};

const toggleRatioDropdown = () => {
  showRatioDropdown.value = !showRatioDropdown.value;
  if (showRatioDropdown.value) {
    showStyleDropdown.value = false;
  }
};

const selectRatio = (option) => {
  selectedRatio.value = option;
  showRatioDropdown.value = false;
  const ratioText = `[比例: ${option.label}]`;
  const ratioRegex = /\[比例: .+?\]/g;
  if (inputValue.value.match(ratioRegex)) {
    inputValue.value = inputValue.value.replace(ratioRegex, ratioText);
  } else {
    inputValue.value += ratioText;
  }
};

const toggleStyleDropdown = () => {
  showStyleDropdown.value = !showStyleDropdown.value;
  if (showStyleDropdown.value) {
    showRatioDropdown.value = false;
  }
};

const selectStyle = (option) => {
  selectedStyle.value = option;
  showStyleDropdown.value = false;
  const styleText = `[风格: ${option.label}]`;
  const styleRegex = /\[风格: .+?\]/g;
  if (inputValue.value.match(styleRegex)) {
    inputValue.value = inputValue.value.replace(styleRegex, styleText);
  } else {
    inputValue.value += styleText;
  }
};

const handleClickOutside = (event) => {
  const target = event.target;
  if (!target.closest(".dropdown-wrapper")) {
    showRatioDropdown.value = false;
    showStyleDropdown.value = false;
  }
};

// 监听全局点击事件
onMounted(() => {
  document.addEventListener("click", handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
});
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

      &.uploading,
      &.has-messages {
        margin-bottom: 0;
      }
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
              width: 24px;
              height: 24px;
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
                rgba(110, 231, 183, 0.4) 100%
              );
              box-shadow:
                0 2px 8px rgba(110, 231, 183, 0.2),
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
              display: flex;
              align-items: center;
              gap: 6px;

              .exit-icon {
                opacity: 0.7;
                transition: all 0.2s ease;
              }
            }

            &:hover .exit-icon {
              opacity: 1;
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

.dropdown-wrapper {
  position: relative;
  display: inline-block;
}

.dropdown-button {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0.5rem 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
  border-radius: 12px;
  color: var(--text-color);
  background-color: transparent;
  font-size: 14px;
  font-weight: 500;
  user-select: none;
  border: 1px solid transparent;

  &:hover {
    background-color: rgba(0, 0, 0, 0.05);
    border-radius: 10px;
    transform: translateY(-1px);
  }

  &.active {
    background-color: rgba(0, 0, 0, 0.05);
  }
}

.dropdown-arrow {
  opacity: 0.6;
  transition: all 0.3s ease;
}

.dropdown-button:hover .dropdown-arrow {
  opacity: 1;
}

.dropdown-button.active .dropdown-arrow {
  transform: rotate(180deg);
  opacity: 1;
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  min-width: 200px;
  max-width: 240px;
  background: var(--message-color);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border-radius: 12px;
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.12),
    0 2px 8px rgba(0, 0, 0, 0.08);
  border: 0.5px solid rgba(255, 255, 255, 0.1);
  overflow: hidden;
  z-index: 1000;
}

.dropdown-header {
  padding: 12px 16px 8px;
  font-size: 13px;
  font-weight: 600;
  color: var(--text-color);
  opacity: 0.5;
  user-select: none;
}

.dropdown-options {
  max-height: 280px;
  overflow-y: auto;
  padding: 4px;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
}

.dropdown-option {
  padding: 10px 12px;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-color);
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.2s ease;
  user-select: none;

  &:hover {
    background-color: rgba(0, 0, 0, 0.05);
    transform: translateX(2px);
  }

  &.selected {
    background-color: rgba(24, 160, 88, 0.1);
    color: var(--primary-color);
    font-weight: 600;
  }
}

.option-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  gap: 8px;

  // 风格选择的option-content不需要option-left包裹
  > span {
    flex: 1;
  }
}

.option-left {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;

  > span {
    flex: 1;
  }
}

.check-icon {
  color: var(--primary-color);
  flex-shrink: 0;
}

/* 下拉框动画 */
.dropdown-fade-enter-active {
  animation: dropdownSlideIn 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.dropdown-fade-leave-active {
  animation: dropdownSlideOut 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes dropdownSlideIn {
  0% {
    opacity: 0;
    transform: translateY(-8px) scale(0.95);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes dropdownSlideOut {
  0% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
  100% {
    opacity: 0;
    transform: translateY(-6px) scale(0.98);
  }
}
</style>

<style lang="less">
@import "../styles/featurePopover.less";
</style>
