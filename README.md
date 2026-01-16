# Mirror Chat

<div align="center">

一款基于 Vue 3 的智能对话系统，支持多模型对话、RAG 文档问答、语音交互和知识库管理等功能

[功能特性](#功能特性) • [快速开始](#快速开始) • [技术栈](#技术栈) • [项目结构](#项目结构)

</div>

---

## 📖 项目简介

Mirror Chat 是一款现代化的 AI 对话应用，集成了多个主流大语言模型，提供智能对话、文档问答（RAG）、语音交互等功能。项目基于 Vue 3 生态构建，采用响应式设计，支持主题切换、多角色对话等高级特性。

## ✨ 功能特性

### 核心功能

- 🤖 **多模型支持**：集成通义千问、DeepSeek、智谱 GLM、Kimi 等主流 AI 模型
- 💬 **智能对话**：支持流式响应、思考模式、联网搜索
- 📚 **知识库管理（RAG）**：文档上传、向量化存储、智能问答
- 🎭 **角色系统**：系统预设角色和用户自定义角色
- 🗂️ **对话历史**：完整的对话记录管理和搜索

### 特色功能

- 🎙️ **语音交互**：支持语音识别（ASR）和文字转语音（TTS）
- ⭐ **收藏功能**：收藏重要对话内容
- 🎨 **主题切换**：支持明暗主题切换
- 📱 **响应式设计**：完美适配桌面和移动端
- 🔐 **安全认证**：JWT + Refresh Token 双令牌机制，RSA 加密传输

## 🚀 快速开始

### 环境要求

- Node.js >= 16.0.0
- npm >= 8.0.0

### 安装依赖

```bash
npm install
```

### 配置环境变量

在项目根目录创建 `.env` 文件：

```env
# 后端 API 地址
VITE_API_BASE_URL=http://127.0.0.1:3000

# 第三方服务 API Key（可选）
```

### 启动开发服务器

```bash
# 启动开发服务器（默认端口 5174，监听所有网络接口）
npm run dev
```

### 构建生产版本

```bash
# 构建
npm run build

# 预览构建结果
npm run preview
```

## 🛠️ 技术栈

### 前端框架

- **Vue 3**：采用 Composition API
- **Vite**：新一代前端构建工具
- **Vue Router**：路由管理（History 模式）
- **Pinia**：状态管理

### UI 组件

- **Naive UI**：主要 UI 组件库
- **@vicons/tabler**：图标库

### 核心库

- **OpenAI SDK**：AI 对话接口
- **Axios**：HTTP 请求（支持 JWT 自动刷新）
- **markdown-it**：Markdown 渲染
- **highlight.js**：代码高亮
- **typed.js**：打字动画效果
- **JSEncrypt**：RSA 加密

### 样式

- **Less**：CSS 预处理器

## 🎯 主要功能模块

### 认证系统

- JWT + Refresh Token 双令牌机制
- 自动 Token 刷新，支持并发请求队列
- RSA 加密敏感数据传输
- 路由守卫自动拦截未认证请求

### AI 对话

- **流式响应**：实时显示 AI 回复内容
- **思考模式**：展示 AI 推理过程
- **联网搜索**：部分模型支持实时搜索
- **上下文管理**：智能管理对话上下文

### 知识库（RAG）

- 文档上传和管理
- 向量化存储
- 智能检索和问答
- 支持文档下载和删除

### 角色系统

- 系统预设角色库
- 用户自定义角色
- 动态切换角色
- 角色影响对话的 system prompt

### 语音交互

- 语音识别（ASR）：将语音转为文字
- 文字转语音（TTS）：将 AI 回复朗读
- 音频缓存优化
- 支持多种音色选择

## 📝 开发指南

### 路径别名

- `@` 指向 `src` 目录

### 添加新的 API

1. 在 `src/config/api.js` 中定义 API 端点
2. 如需认证，添加到 `authRequiredApis` 数组
3. 使用 `Request()` 或 `FormDataRequest()` 发起请求

### 添加新的 AI 模型

在 `src/config/models.js` 中添加模型配置：

```javascript
{
  name: '模型名称',
  value: 'model-id',
  thinkingMode: true,  // 是否支持思考模式
  netSearch: false,    // 是否支持联网搜索
  expiredTime: null    // 过期时间（可选）
}
```

## 📄 许可证

[MIT License](LICENSE)

---

<div align="center">
Made with by Ny9u
</div>
