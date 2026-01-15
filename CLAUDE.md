# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

Mirror Chat 是一款基于 Vue 3 的 RAG 智能文档问答系统,支持多模型对话、语音交互、知识库管理和对话历史管理。

## 开发命令

```bash
# 启动开发服务器 (监听所有网络接口,默认端口 5174)
npm run dev

# 构建生产版本
npm run build

# 预览构建结果
npm run preview
```

## 技术栈

- **框架**: Vue 3 (Composition API) + Vite
- **状态管理**: Pinia
- **路由**: Vue Router (History 模式)
- **UI 组件库**: Naive UI
- **样式**: Less
- **网络请求**: Axios (支持 JWT 自动刷新)
- **主要功能库**:
  - OpenAI SDK (AI 对话)
  - markdown-it (Markdown 渲染)
  - highlight.js (代码高亮)
  - typed.js (打字动画)
  - JSEncrypt (RSA 加密)

## 核心架构

### 1. 认证系统

- **Token 管理**: JWT + Refresh Token 双 token 机制
- **自动刷新**: axios 拦截器实现 401 时自动刷新 token,支持并发请求队列 (src/utils/request.js:5-174)
- **路由守卫**: 所需认证的路由在 router.beforeEach 中验证 token 有效性 (src/router/index.js:59-108)
- **加密传输**: 敏感数据使用 RSA 加密传输,在请求拦截器中自动处理加密数据格式 (src/utils/request.js:33-56)

### 2. API 请求架构

**请求方式**:

- `Request()`: 普通 JSON/查询参数请求 (src/utils/request.js:184-230)
- `FormDataRequest()`: 文件上传专用 (src/utils/request.js:239-287)
- 流式响应: 聊天 API 使用原生 fetch 处理 SSE 流 (src/services/chat.js:3-75)

**认证配置**:

- 需要 JWT 认证的 API 在 `authRequiredApis` 数组中配置 (src/config/api.js:49-56)
- 第三方 API (阿里云) 使用环境变量中的 API Key (src/utils/request.js:73-87)

**环境变量** (.env):

```
VITE_API_BASE_URL - 后端 API 基础 URL
```

### 3. 状态管理

**configStore** (src/stores/configStore.js):

- 用户信息 (userId, name, avatar)
- 全局配置 (theme, model, voiceType)
- UI 状态 (sidebarCollapsed, chatId)
- 角色系统 (currentRole, currentRoleId)

**historyStore** (src/stores/historyStore.js):

- 对话历史管理

### 4. 路由结构

主要路由:

- `/` 或 `/chat/:id?` - 聊天主界面
- `/auth` - 登录/注册页面 (无需认证)
- `/collection` - 收藏夹
- `/knowledge` - 知识库管理
- `/setting` - 用户设置

除 Chat/Home 外的路由都需要认证,未认证用户会被重定向到 `/auth`。

### 5. 模型配置

支持的 AI 模型在 `src/config/models.js` 中定义:

- qwen3-max-preview (通义千问,支持思考模式)
- deepseek-v3.1 (支持思考模式+联网搜索)
- glm-4.6 (智谱 GLM,支持思考模式)
- kimi-k2-thinking (月之暗面,支持思考模式)

每个模型配置包含:

- `thinkingMode`: 是否支持思考模式
- `netSearch`: 是否支持联网搜索
- `expiredTime`: 过期时间

### 6. 聊天功能架构

**流式响应处理** (src/services/chat.js):

- 使用 fetch API 的 ReadableStream 处理 SSE 流
- 支持 `reasoningContent` (思考过程) 和 `content` (回复内容) 分离
- 提供 `onChunk`, `onComplete`, `onError` 回调

**核心组件**:

- `chat.vue` - 聊天容器
- `messageList.vue` - 消息列表渲染
- `sidebar.vue` - 侧边栏(角色选择、历史对话)
- `header.vue` - 顶部导航栏

### 7. 特色功能

**语音交互**:

- TTS (文字转语音): src/services/ttsService.js
- ASR (语音识别): src/services/asrService.js
- 音频缓存: src/utils/audioCacheService.js

**知识库 (RAG)**:

- 文档上传、列表、详情、删除、下载
- API: `/api/v1/knowledge/*`

**角色系统**:

- 系统预设角色和用户自定义角色
- 角色选择会影响对话的 system prompt
- API: `/api/v1/role/*`

## 开发注意事项

### 路径别名

- `@` 指向 `src` 目录

### 样式

- 全局样式: src/styles/index.less
- Markdown 样式: src/styles/markdown.less
- 使用 Less 预处理器

### API 开发

1. 新增 API 时先在 `src/config/api.js` 中定义
2. 如需认证,添加到 `authRequiredApis` 数组
3. 使用 `Request()` 或 `FormDataRequest()` 发起请求
4. 流式响应使用 `chat()` 方法的模式

### 添加新模型

在 `src/config/models.js` 中添加模型配置,包含所有必需字段。

### 本地存储

项目使用 localStorage 存储:

- `jwtToken` - JWT 访问令牌
- `refreshToken` - 刷新令牌
- `isLoggedIn` - 登录状态标记
