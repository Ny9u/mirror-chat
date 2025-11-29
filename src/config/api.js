export const api = {
  aliyun: "https://dashscope.aliyuncs.com/compatible-mode/v1",
  netSearch: "https://api.bochaai.com/v1/ai-search",
  getModels: "https://dashscope.aliyuncs.com/api/v1/deployments/models",
  login: "/api/v1/user/login",
  register: "/api/v1/user/register",
  validate: "/api/v1/auth/validate",
  refresh: "/api/v1/auth/refresh",
  uploadAvatar: "/api/v1/avatar/upload",
  updateInfo: "/api/v1/user/updateInfo",
  updatePassword: "/api/v1/user/updatePassword",
  deleteAccount: "/api/v1/user/deleteAccount",
  getPublicKey: "/api/v1/encryption/getPublicKey",
  sendVerificationCode: "/api/v1/user/sendVerificationCode",
  verifyCode: "/api/v1/user/verifyCode",
  resetPassword: "/api/v1/user/resetPassword",
  textToSpeech: "/api/v1/tts/textToSpeech",
  getVoiceLists: "/api/v1/tts/getVoiceLists",
  getVoiceModels: "/api/v1/tts/getVoiceModels",
  getVoiceLists: "/api/v1/tts/getVoiceLists",
  asrRecognize: "/api/v1/asr/recognize",
};

// 需要认证的API
export const authRequiredApis = [
  api.validate,
  api.updateInfo,
  api.updatePassword,
  api.deleteAccount,
];

export default { api, authRequiredApis };
