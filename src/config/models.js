const Models = [
  {
    name: "qwen3-max",
    key: "qwen3-max",
    desc: "通义千问3系列Max模型，相较preview版本在智能体编程与工具调用方向进行了专项升级。本次发布的正式版模型达到领域SOTA水平，适配场景更加复杂的智能体需求。",
    expiredTime: "2026-03-28",
    thinkingMode: true,
    netSearch: true,
  },
  {
    name: "DeepSeek-V3.2",
    key: "deepseek-v3.2",
    desc: "DeepSeek-V3.2是引入DeepSeek Sparse Attention（一种稀疏注意力机制）的正式版模型，也是DeepSeek推出的首个将思考融入工具使用的模型，同时支持思考模式与非思考模式的工具调用。",
    expiredTime: "2026-03-28",
    thinkingMode: true,
    netSearch: true,
  },
  {
    name: "GLM-4.7",
    key: "glm-4.7",
    desc: "智谱最新旗舰，具备更强的编程能力与更稳定的多步骤推理/执行能力。总参数355B，支持长程任务规划、编码、工具协同，问答自然、写作沉浸、创意角色扮演能力强。",
    expiredTime: "2026-03-28",
    thinkingMode: true,
    netSearch: false,
  },
  {
    name: "kimi-k2-thinking",
    key: "kimi-k2-thinking",
    desc: "kimi-k2-thinking模型是月之暗面提供的具有通用 Agentic能力和推理能力的思考模型，它擅长深度推理，并可通过多步工具调用，帮助解决各类难题。",
    expiredTime: "2026-02-08",
    thinkingMode: true,
    netSearch: false,
  },
  {
    name: "qwen3-vl-plus",
    key: "qwen3-vl-plus",
    desc: "Qwen3系列视觉理解模型，实现思考模式和非思考模式的有效融合，视觉智能体能力在OS World等公开测试集上达到世界顶尖水平。",
    expiredTime: "2026-03-28",
    thinkingMode: true,
    netSearch: false,
  },
  {
    name: "qwen-image-max",
    key: "qwen-image-max",
    desc: "通义千问图像生成模型Max系列，在各类生成任务中表现出色，相较Plus系列大幅度降低生成图片的AI感，提升图像真实性；具备更真实的人物质感、更细腻的自然纹理、更美观的文字渲染。",
    expiredTime: "2026-03-30",
    thinkingMode: false,
    netSearch: false,
  },
];

export default Models;
