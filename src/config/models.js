const Models = [
  {
    name: "qwen3-max",
    key: "qwen3-max-preview",
    desc: "通义千问3系列Max模型Preview版本，实现思考模式和非思考模式的有效融合。思考模式下在智能体编程能力、常识知识推理能力、数学/科学/通用类推理等能力上均有显著增强。",
    expiredTime: "2026-03-03",
    thinkingMode: true,
    netSearch: false,
  },
  {
    name: "DeepSeek-V3.1",
    key: "deepseek-v3.1",
    desc: "DeepSeek-V3.1为混合推理架构模型，同时支持思考模式与非思考模式，具备更高的推理效率和更强的Agent能力。",
    expiredTime: "2026-02-18",
    thinkingMode: true,
    netSearch: true,
  },
  {
    name: "GLM-4.6",
    key: "glm-4.6",
    desc: "GLM新一代旗舰模型，核心能力较4.5全面提升。总参数量为3550 亿，激活参数320亿，上下文窗口扩展至200K。",
    expiredTime: "2026-01-18",
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
